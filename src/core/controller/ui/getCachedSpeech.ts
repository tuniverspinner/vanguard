import { Bytes, StringRequest } from "@shared/proto/cline/common"
import { TtsService } from "../../../services/tts"
import { Controller } from ".."
import { StreamingResponseHandler } from "../grpc-handler"

/**
 * Gets cached speech if available, otherwise generates new speech
 * @param controller The controller instance
 * @param request The request containing the text to convert to speech
 * @param responseStream The streaming response handler
 * @param requestId The ID of the request (passed by the gRPC handler)
 */
export async function getCachedSpeech(
	controller: Controller,
	request: StringRequest,
	responseStream: StreamingResponseHandler<Bytes>,
	requestId?: string,
): Promise<void> {
	try {
		// Get TTS service instance (create if not exists)
		let ttsService = (controller as any).ttsService
		if (!ttsService) {
			// Get Hugging Face API key from secrets
			const huggingFaceApiKey = controller.stateManager.getSecretKey("huggingFaceApiKey")

			// Create log file in extension storage
			const path = require("path")
			const logFilePath = path.join(controller.context.globalStorageUri.fsPath, "tts-debug.log")

			ttsService = new TtsService(huggingFaceApiKey, logFilePath)
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
			await responseStream(
				Bytes.create({
					value: buffer,
				}),
				false, // Not the last chunk
			)
		}

		// Send final empty chunk to indicate completion
		await responseStream(
			Bytes.create({
				value: Buffer.alloc(0),
			}),
			true, // This is the last chunk
		)
	} catch (error) {
		console.error("TTS retrieval failed:", error)
		// Send error indication
		await responseStream(
			Bytes.create({
				value: Buffer.alloc(0),
			}),
			true, // End the stream with error
		)
	}
}
