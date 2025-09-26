import { HfInference } from "@huggingface/inference"
import { TtsCache } from "./cache"
import { TtsRequest, TtsResponse } from "./types"

export class TtsService {
	private readonly cache = new TtsCache()
	private client: HfInference | null = null

	constructor(private readonly apiKey?: string) {
		if (apiKey) {
			this.client = new HfInference(apiKey)
		}
	}

	/**
	 * Generate speech from text using Kokoro-82M model
	 */
	async generateSpeech(request: TtsRequest): Promise<TtsResponse> {
		const { text, voice = "af_heart" } = request

		if (!text || text.trim().length === 0) {
			throw new Error("Text cannot be empty")
		}

		if (!this.client) {
			throw new Error("Hugging Face API key not configured")
		}

		// Check cache first
		const cached = this.cache.get(text)
		if (cached) {
			return {
				audioData: cached.audioData,
				contentType: cached.contentType,
			}
		}

		try {
			// Use Hugging Face Inference API with textToSpeech method
			const audioBlob = await this.client.textToSpeech({
				model: "hexgrad/Kokoro-82M",
				inputs: text.trim(),
			})

			// Convert blob to ArrayBuffer
			const audioData = await audioBlob.arrayBuffer()
			const contentType = audioBlob.type || "audio/wav"

			// Cache the result
			this.cache.set(text, audioData, contentType)

			return {
				audioData,
				contentType,
			}
		} catch (error) {
			if (error instanceof Error) {
				if (error.message.includes("429")) {
					throw new Error("Rate limit exceeded. Please try again later.")
				} else if (error.message.includes("503")) {
					throw new Error("Model is currently loading. Please try again in a few moments.")
				} else if (error.message.includes("401")) {
					throw new Error("Invalid API key. Please check your Hugging Face token.")
				} else {
					throw new Error(`Hugging Face API error: ${error.message}`)
				}
			}

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
