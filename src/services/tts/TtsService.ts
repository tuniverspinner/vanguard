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

// Fal.ai API interfaces
interface FalQueueSubmitResponse {
	request_id: string
	status: string
	response_url?: string
	status_url?: string
	cancel_url?: string
}

interface FalQueueStatusResponse {
	status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED"
	request_id: string
	response_url?: string
	status_url?: string
	cancel_url?: string
	logs?: Array<{ message: string }>
	metrics?: Record<string, any>
	queue_position?: number
}

interface FalQueueResultResponse {
	status: "COMPLETED"
	request_id: string
	logs?: Array<{ message: string }>
	metrics?: Record<string, any>
	audio: {
		url: string
		content_type?: string
	}
}

export class TtsService {
	private readonly cache = new TtsCache()
	private readonly baseUrl = "https://queue.fal.run"
	private logStream: fs.WriteStream | null = null
	private statusUrl?: string
	private responseUrl?: string

	constructor(
		private readonly apiKey?: string,
		private readonly logFilePath?: string,
	) {
		if (logFilePath) {
			this.logStream = createLogStream(logFilePath)
		}
	}

	/**
	 * Generate speech from text using Fal.ai Kokoro model
	 */
	async generateSpeech(request: TtsRequest): Promise<TtsResponse> {
		const { text, voice = "af_heart" } = request

		logToFile(this.logStream, "[TTS]", `generateSpeech called with text length: ${text?.length || 0}`)
		logToFile(this.logStream, "[TTS]", `voice parameter: ${voice}`)

		if (!text || text.trim().length === 0) {
			logToFile(this.logStream, "[TTS]", `Error: Text cannot be empty`)
			throw new Error("Text cannot be empty")
		}

		if (!this.apiKey) {
			logToFile(this.logStream, "[TTS]", `Error: Fal.ai API key not configured`)
			throw new Error("Fal.ai API key not configured")
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
			logToFile(this.logStream, "[TTS]", `Submitting request to Fal.ai queue for model: fal-ai/kokoro/american-english`)

			// Step 1: Submit request to Fal.ai queue
			const submitResponse = await this.submitToFalQueue(text.trim(), voice)
			const requestId = submitResponse.request_id

			logToFile(this.logStream, "[TTS]", `Request submitted successfully, request_id: ${requestId}`)

			// Step 2: Poll for completion
			const result = await this.pollForCompletion(requestId)

			logToFile(this.logStream, "[TTS]", `Request completed, downloading audio from: ${result.audio.url}`)

			// Step 3: Download the audio file
			const audioResponse = await fetch(result.audio.url)
			if (!audioResponse.ok) {
				throw new Error(`Failed to download audio: ${audioResponse.status} ${audioResponse.statusText}`)
			}

			const audioData = await audioResponse.arrayBuffer()
			const contentType = result.audio.content_type || audioResponse.headers.get("content-type") || "audio/wav"

			logToFile(this.logStream, "[TTS]", `Audio downloaded successfully, size: ${audioData.byteLength} bytes`)
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
				if (error.message.includes("401") || error.message.includes("403")) {
					logToFile(this.logStream, "[TTS]", `Invalid API key`)
					throw new Error("Invalid API key. Please check your Fal.ai token.")
				} else if (error.message.includes("429")) {
					logToFile(this.logStream, "[TTS]", `Rate limit exceeded`)
					throw new Error("Rate limit exceeded. Please try again later.")
				} else if (error.message.includes("500") || error.message.includes("502") || error.message.includes("503")) {
					logToFile(this.logStream, "[TTS]", `Fal.ai service error`)
					throw new Error("Fal.ai service temporarily unavailable. Please try again later.")
				} else {
					logToFile(this.logStream, "[TTS]", `Fal.ai API error: ${error.message}`)
					throw new Error(`Fal.ai API error: ${error.message}`)
				}
			}

			logToFile(this.logStream, "[TTS]", `Unknown error: ${String(error)}`)
			throw new Error(`Failed to generate speech: ${error instanceof Error ? error.message : "Unknown error"}`)
		}
	}

	/**
	 * Submit a TTS request to Fal.ai queue
	 */
	private async submitToFalQueue(text: string, voice: string): Promise<FalQueueSubmitResponse> {
		const url = `${this.baseUrl}/fal-ai/kokoro/american-english`
		const payload = {
			prompt: text,
			voice: voice,
		}

		logToFile(this.logStream, "[TTS]", `Submitting to: ${url}`)

		const response = await fetch(url, {
			method: "POST",
			headers: {
				Authorization: `Key ${this.apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})

		if (!response.ok) {
			const errorText = await response.text()
			logToFile(this.logStream, "[TTS]", `Submit failed: ${response.status} ${response.statusText} - ${errorText}`)
			throw new Error(`Fal.ai submit failed: ${response.status} ${response.statusText}`)
		}

		const result: FalQueueSubmitResponse = await response.json()
		logToFile(this.logStream, "[TTS]", `Submit response: ${JSON.stringify(result)}`)

		// Store the URLs from the response for polling
		this.statusUrl = result.status_url
		this.responseUrl = result.response_url

		return result
	}

	/**
	 * Poll for request completion
	 */
	private async pollForCompletion(requestId: string): Promise<FalQueueResultResponse> {
		// Use the URLs provided by the API response
		const statusUrl = this.statusUrl
		const resultUrl = this.responseUrl

		if (!statusUrl || !resultUrl) {
			throw new Error("Status and response URLs not available from submit response")
		}

		logToFile(this.logStream, "[TTS]", `Polling status at: ${statusUrl}`)

		// Poll for up to 5 minutes (300 seconds) with 2-second intervals
		const maxAttempts = 150
		const pollInterval = 2000

		for (let attempt = 1; attempt <= maxAttempts; attempt++) {
			try {
				// Check status
				const statusResponse = await fetch(statusUrl, {
					headers: {
						Authorization: `Key ${this.apiKey}`,
					},
				})

				if (!statusResponse.ok) {
					throw new Error(`Status check failed: ${statusResponse.status} ${statusResponse.statusText}`)
				}

				const status: FalQueueStatusResponse = await statusResponse.json()

				logToFile(this.logStream, "[TTS]", `Status check ${attempt}/${maxAttempts}: ${status.status}`)

				if (status.status === "COMPLETED") {
					// Get the result
					logToFile(this.logStream, "[TTS]", `Request completed, fetching result from: ${resultUrl}`)

					const resultResponse = await fetch(resultUrl, {
						headers: {
							Authorization: `Key ${this.apiKey}`,
						},
					})

					if (!resultResponse.ok) {
						throw new Error(`Result fetch failed: ${resultResponse.status} ${resultResponse.statusText}`)
					}

					const result: FalQueueResultResponse = await resultResponse.json()
					logToFile(this.logStream, "[TTS]", `Result fetched successfully`)

					return result
				} else if (status.status === "IN_QUEUE" || status.status === "IN_PROGRESS") {
					// Continue polling
					if (attempt < maxAttempts) {
						logToFile(this.logStream, "[TTS]", `Waiting ${pollInterval}ms before next check...`)
						await new Promise((resolve) => setTimeout(resolve, pollInterval))
					} else {
						throw new Error("Request timed out after 5 minutes")
					}
				} else {
					throw new Error(`Unexpected status: ${status.status}`)
				}
			} catch (error) {
				logToFile(
					this.logStream,
					"[TTS]",
					`Poll attempt ${attempt} failed: ${error instanceof Error ? error.message : String(error)}`,
				)

				if (attempt === maxAttempts) {
					throw error
				}

				// Wait before retrying
				await new Promise((resolve) => setTimeout(resolve, pollInterval))
			}
		}

		throw new Error("Polling loop exited unexpectedly")
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
