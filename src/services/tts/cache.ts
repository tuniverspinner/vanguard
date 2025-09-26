import * as crypto from "crypto"
import { CachedAudio } from "./types"

export class TtsCache {
	private cache = new Map<string, CachedAudio>()
	private readonly maxCacheSize = 50 // Maximum number of cached audio files
	private readonly cacheExpiryMs = 24 * 60 * 60 * 1000 // 24 hours

	/**
	 * Generate a hash for the text content
	 */
	private generateTextHash(text: string): string {
		return crypto.createHash("md5").update(text.trim().toLowerCase()).digest("hex")
	}

	/**
	 * Get cached audio for text
	 */
	get(text: string): CachedAudio | null {
		const textHash = this.generateTextHash(text)
		const cached = this.cache.get(textHash)

		if (!cached) {
			return null
		}

		// Check if cache entry has expired
		if (Date.now() - cached.timestamp > this.cacheExpiryMs) {
			this.cache.delete(textHash)
			return null
		}

		return cached
	}

	/**
	 * Store audio in cache
	 */
	set(text: string, audioData: ArrayBuffer, contentType: string): void {
		const textHash = this.generateTextHash(text)

		// Clean up old entries if cache is full
		if (this.cache.size >= this.maxCacheSize) {
			this.evictOldest()
		}

		this.cache.set(textHash, {
			audioData,
			contentType,
			timestamp: Date.now(),
			textHash,
		})
	}

	/**
	 * Remove oldest cache entries
	 */
	private evictOldest(): void {
		let oldestKey: string | null = null
		let oldestTime = Date.now()

		for (const [key, value] of this.cache.entries()) {
			if (value.timestamp < oldestTime) {
				oldestTime = value.timestamp
				oldestKey = key
			}
		}

		if (oldestKey) {
			this.cache.delete(oldestKey)
		}
	}

	/**
	 * Clear all cached audio
	 */
	clear(): void {
		this.cache.clear()
	}

	/**
	 * Get cache statistics
	 */
	getStats(): { size: number; totalSizeBytes: number } {
		let totalSizeBytes = 0
		for (const cached of this.cache.values()) {
			totalSizeBytes += cached.audioData.byteLength
		}

		return {
			size: this.cache.size,
			totalSizeBytes,
		}
	}
}
