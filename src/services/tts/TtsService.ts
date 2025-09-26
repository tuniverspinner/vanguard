import axios, { AxiosResponse } from "axios"
import { TtsCache } from "./cache"
import { HuggingFaceTtsPayload, TtsRequest, TtsResponse } from "./types"

export class TtsService {
	private readonly huggingFaceApiUrl = "https://api-inference.huggingface.co/models/hexgrad/Kokoro-82M"
	private readonly cache = new TtsCache()

	constructor(private readonly apiKey?: string) {}

	/**
	 * Generate speech from text using Kokoro-82M model
	 */
	async generateSpeech(request: TtsRequest): Promise<TtsResponse> {
		const { text, voice = "af" } = request

		if (!text || text.trim().length === 0) {
			throw new Error("Text cannot be empty")
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
			// Prepare payload for Hugging Face API
			const payload: HuggingFaceTtsPayload = {
				inputs: text.trim(),
				options: {
					wait_for_model: true,
					use_cache: true,
				},
			}

			// Make request to Hugging Face
			const response: AxiosResponse<ArrayBuffer> = await axios.post(this.huggingFaceApiUrl, payload, {
				headers: {
					Authorization: `Bearer ${this.apiKey}`,
					"Content-Type": "application/json",
				},
				responseType: "arraybuffer",
				timeout: 30000, // 30 second timeout
			})

			if (response.status !== 200) {
				throw new Error(`Hugging Face API returned status ${response.status}`)
			}

			const audioData = response.data
			const contentType = response.headers["content-type"] || "audio/wav"

			// Cache the result
			this.cache.set(text, audioData, contentType)

			return {
				audioData,
				contentType,
			}
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 429) {
					throw new Error("Rate limit exceeded. Please try again later.")
				} else if (error.response?.status === 503) {
					throw new Error("Model is currently loading. Please try again in a few moments.")
				} else if (error.response?.status === 401) {
					throw new Error("Invalid API key. Please check your Hugging Face token.")
				} else {
					throw new Error(`Hugging Face API error: ${error.response?.status} ${error.response?.statusText}`)
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
