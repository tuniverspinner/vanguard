import { Bytes, StringRequest } from "@shared/proto/cline/common"
import { TtsService } from "../../../services/tts"
import { Controller } from ".."

/**
 * Gets cached speech if available, otherwise generates new speech
 * @param controller The controller instance
 * @param request The request containing the text to convert to speech
 * @returns Stream of cached or newly generated audio bytes
 */
export async function* getCachedSpeech(controller: Controller, request: StringRequest): AsyncGenerator<Bytes, void, unknown> {
	try {
		// Get TTS service instance (create if not exists)
		let ttsService = (controller as any).ttsService
		if (!ttsService) {
			// Get Hugging Face API key from secrets
			const huggingFaceApiKey = controller.stateManager.getSecretKey("huggingFaceApiKey")
			ttsService = new TtsService(huggingFaceApiKey)
			;(controller as any).ttsService = ttsService
		}

		const text = request.value || ""

		// Try to get cached speech first
		let response = ttsService.getCachedSpeech(text)

		// If not cached, generate new speech
		if (!response) {
			response = await ttsService.generateSpeech({ text })
		}

		// Stream the audio data
		const audioData = response.audioData
		const chunkSize = 8192 // 8KB chunks

		for (let i = 0; i < audioData.byteLength; i += chunkSize) {
			const chunk = audioData.slice(i, i + chunkSize)
			const buffer = Buffer.from(chunk)
			yield Bytes.create({
				value: buffer,
			})
		}
	} catch (error) {
		console.error("TTS retrieval failed:", error)
		// Return empty bytes to indicate error
		yield Bytes.create({
			value: Buffer.alloc(0),
		})
	}
}
