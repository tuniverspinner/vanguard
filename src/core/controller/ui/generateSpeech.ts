import { Bytes, StringRequest } from "@shared/proto/cline/common"
import { TtsService } from "../../../services/tts"
import { Controller } from ".."
import { StreamingResponseHandler } from "../grpc-handler"

/**
 * Generates speech from text using TTS service
 * @param controller The controller instance
 * @param request The request containing the text to convert to speech
 * @param responseStream The streaming response handler
 * @param requestId The ID of the request (passed by the gRPC handler)
 */
export async function generateSpeech(
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
		console.error("TTS generation failed:", error)
		// Send error indication
		await responseStream(
			Bytes.create({
				value: Buffer.alloc(0),
			}),
			true, // End the stream with error
		)
	}
}
