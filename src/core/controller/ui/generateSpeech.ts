import { Bytes, StringRequest } from "@shared/proto/cline/common"
import * as path from "path"
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
	console.log(`[TTS-HANDLER] generateSpeech called with requestId: ${requestId}`)
	console.log(`[TTS-HANDLER] Text length: ${request.value?.length || 0}`)
	console.log(`[TTS-HANDLER] Text preview: "${request.value?.substring(0, 50) || "empty"}..."`)

	try {
		// Get TTS service instance (create if not exists)
		let ttsService = (controller as any).ttsService
		if (!ttsService) {
			console.log(`[TTS-HANDLER] Creating new TTS service instance`)
			// Get Hugging Face API key from secrets
			const huggingFaceApiKey = controller.stateManager.getSecretKey("huggingFaceApiKey")
			console.log(`[TTS-HANDLER] API key available: ${!!huggingFaceApiKey}`)

			// Create log file in extension storage
			const logFilePath = path.join(controller.context.globalStorageUri.fsPath, "tts-debug.log")
			console.log(`[TTS-HANDLER] Log file path: ${logFilePath}`)

			ttsService = new TtsService(huggingFaceApiKey, logFilePath)
			;(controller as any).ttsService = ttsService
			console.log(`[TTS-HANDLER] TTS service created and cached`)
		} else {
			console.log(`[TTS-HANDLER] Using existing TTS service instance`)
		}

		console.log(`[TTS-HANDLER] Calling ttsService.generateSpeech...`)
		// Generate speech
		const response = await ttsService.generateSpeech({
			text: request.value || "",
		})

		console.log(`[TTS-HANDLER] TTS generation successful, audio size: ${response.audioData.byteLength} bytes`)
		console.log(`[TTS-HANDLER] Content type: ${response.contentType}`)

		// Stream the audio data
		const audioData = response.audioData
		const chunkSize = 8192 // 8KB chunks
		const totalChunks = Math.ceil(audioData.byteLength / chunkSize)

		console.log(`[TTS-HANDLER] Streaming audio in ${totalChunks} chunks of ${chunkSize} bytes each`)

		for (let i = 0; i < audioData.byteLength; i += chunkSize) {
			const chunk = audioData.slice(i, i + chunkSize)
			const buffer = Buffer.from(chunk)
			const isLast = i + chunkSize >= audioData.byteLength

			console.log(
				`[TTS-HANDLER] Sending chunk ${Math.floor(i / chunkSize) + 1}/${totalChunks}, size: ${buffer.length} bytes, isLast: ${isLast}`,
			)

			await responseStream(
				Bytes.create({
					value: buffer,
				}),
				isLast,
			)
		}

		console.log(`[TTS-HANDLER] All chunks sent successfully`)
	} catch (error) {
		console.error(`[TTS-HANDLER] TTS generation failed:`, error)
		console.error(`[TTS-HANDLER] Error stack:`, error instanceof Error ? error.stack : "No stack trace")
		console.error(`[TTS-HANDLER] Error message:`, error instanceof Error ? error.message : String(error))

		// For streaming responses, we need to throw the error to let the gRPC framework handle it
		// This will properly propagate the error to the frontend
		throw error
	}
}
