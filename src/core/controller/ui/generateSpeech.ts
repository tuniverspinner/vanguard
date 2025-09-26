import { Bytes, StringRequest } from "@shared/proto/cline/common"
import { TtsService } from "../../../services/tts"
import { Controller } from ".."

/**
 * Generates speech from text using TTS service
 * @param controller The controller instance
 * @param request The request containing the text to convert to speech
 * @returns Stream of audio bytes
 */
export async function* generateSpeech(controller: Controller, request: StringRequest): AsyncGenerator<Bytes, void, unknown> {
	try {
		// Get TTS service instance (create if not exists)
		let ttsService = (controller as any).ttsService
		if (!ttsService) {
			// Get Hugging Face API key from secrets
			const huggingFaceApiKey = controller.stateManager.getSecretKey("huggingFaceApiKey")
			ttsService = new TtsService(huggingFaceApiKey)
			;(controller as any).ttsService = ttsService
		}

		// Generate speech
		const response = await ttsService.generateSpeech({
			text: request.value || "",
		})

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
		console.error("TTS generation failed:", error)
		// Return empty bytes to indicate error
		yield Bytes.create({
			value: Buffer.alloc(0),
		})
	}
}
