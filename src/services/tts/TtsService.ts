import { HfInference } from "@huggingface/inference"
import * as fs from "fs"
import { TtsCache } from "./cache"
import { TtsRequest, TtsResponse } from "./types"

// Create TTS debug log file in VSCode extension storage
function createLogStream(logFilePath: string) {
	try {
		return fs.createWriteStream(logFilePath, { flags: "a" })
	} catch (error) {
		console.error("[TTS] Failed to create log stream:", error)
		return null
	}
}

function logToFile(logStream: fs.WriteStream | null, prefix: string, message: string) {
	const timestamp = new Date().toISOString()
	const logMessage = `[${timestamp}] ${prefix} ${message}\n`
	if (logStream) {
		logStream.write(logMessage)
	}
	console.log(`${prefix} ${message}`)
}

export class TtsService {
	private readonly cache = new TtsCache()
	private client: HfInference | null = null
	private logStream: fs.WriteStream | null = null

	constructor(
		private readonly apiKey?: string,
		private readonly logFilePath?: string,
	) {
		if (apiKey) {
			this.client = new HfInference(apiKey)
		}
		if (logFilePath) {
			this.logStream = createLogStream(logFilePath)
		}
	}

	/**
	 * Generate speech from text using Kokoro-82M model
	 */
	async generateSpeech(request: TtsRequest): Promise<TtsResponse> {
		const { text, voice = "af_heart" } = request

		logToFile(this.logStream, "[TTS]", `generateSpeech called with text length: ${text?.length || 0}`)
		logToFile(this.logStream, "[TTS]", `voice parameter: ${voice}`)

		if (!text || text.trim().length === 0) {
			logToFile(this.logStream, "[TTS]", `Error: Text cannot be empty`)
			throw new Error("Text cannot be empty")
		}

		if (!this.client) {
			logToFile(this.logStream, "[TTS]", `Error: Hugging Face API key not configured`)
			throw new Error("Hugging Face API key not configured")
		}

		// Check cache first
		const cached = this.cache.get(text)
		if (cached) {
			logToFile(this.logStream, "[TTS]", `Cache hit for text: "${text.substring(0, 50)}..."`)
			return {
				audioData: cached.audioData,
				contentType: cached.contentType,
			}
		}

		logToFile(this.logStream, "[TTS]", `Cache miss, generating new speech for: "${text.substring(0, 50)}..."`)

		try {
			logToFile(this.logStream, "[TTS]", `Calling Hugging Face Inference API with model: hexgrad/Kokoro-82M`)

			// Use Hugging Face Inference API with textToSpeech method
			const audioBlob = await this.client.textToSpeech({
				model: "hexgrad/Kokoro-82M",
				inputs: text.trim(),
			})

			logToFile(this.logStream, "[TTS]", `API call successful, received blob of size: ${audioBlob.size} bytes`)
			logToFile(this.logStream, "[TTS]", `Blob type: ${audioBlob.type}`)

			// Convert blob to ArrayBuffer
			const audioData = await audioBlob.arrayBuffer()
			const contentType = audioBlob.type || "audio/wav"

			logToFile(this.logStream, "[TTS]", `Converted to ArrayBuffer, size: ${audioData.byteLength} bytes`)
			logToFile(this.logStream, "[TTS]", `Content type: ${contentType}`)

			// Cache the result
			this.cache.set(text, audioData, contentType)
			logToFile(this.logStream, "[TTS]", `Cached result for future use`)

			logToFile(this.logStream, "[TTS]", `generateSpeech completed successfully`)
			return {
				audioData,
				contentType,
			}
		} catch (error) {
			logToFile(
				this.logStream,
				"[TTS]",
				`Error in generateSpeech: ${error instanceof Error ? error.message : String(error)}`,
			)

			if (error instanceof Error) {
				if (error.message.includes("429")) {
					logToFile(this.logStream, "[TTS]", `Rate limit exceeded`)
					throw new Error("Rate limit exceeded. Please try again later.")
				} else if (error.message.includes("503")) {
					logToFile(this.logStream, "[TTS]", `Model is currently loading`)
					throw new Error("Model is currently loading. Please try again in a few moments.")
				} else if (error.message.includes("401")) {
					logToFile(this.logStream, "[TTS]", `Invalid API key`)
					throw new Error("Invalid API key. Please check your Hugging Face token.")
				} else {
					logToFile(this.logStream, "[TTS]", `Hugging Face API error: ${error.message}`)
					throw new Error(`Hugging Face API error: ${error.message}`)
				}
			}

			logToFile(this.logStream, "[TTS]", `Unknown error: ${String(error)}`)
			throw new Error(`Failed to generate speech: ${error instanceof Error ? error.message : "Unknown error"}`)
		}
	}

	/**
	 * Get cached speech if available
	 */
	getCachedSpeech(text: string): TtsResponse | null {
		const cached = this.cache.get(text)
		if (!cached) {
			return null
		}

		return {
			audioData: cached.audioData,
			contentType: cached.contentType,
		}
	}

	/**
	 * Clear all cached audio
	 */
	clearCache(): void {
		this.cache.clear()
	}

	/**
	 * Get cache statistics
	 */
	getCacheStats() {
		return this.cache.getStats()
	}

	/**
	 * Update API key
	 */
	setApiKey(apiKey: string): void {
		;(this as any).apiKey = apiKey
	}
}
