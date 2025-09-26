export interface TtsRequest {
	text: string
	voice?: string
	speed?: number
}

export interface TtsResponse {
	audioData: ArrayBuffer
	contentType: string
	duration?: number
}

export interface CachedAudio {
	audioData: ArrayBuffer
	contentType: string
	timestamp: number
	textHash: string
}

export interface HuggingFaceTtsPayload {
	inputs: string
	options?: {
		wait_for_model?: boolean
		use_cache?: boolean
	}
}
