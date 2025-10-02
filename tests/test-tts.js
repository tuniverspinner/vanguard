const fs = require("fs")
const { exec } = require("child_process")

// Create a log file for debugging TTS issues
const logFile = "tts-debug.log"
const logStream = fs.createWriteStream(logFile, { flags: "a" })

function logToFile(message) {
	const timestamp = new Date().toISOString()
	const logMessage = `[${timestamp}] ${message}\n`
	logStream.write(logMessage)
	console.log(message)
}

// Fal.ai API interfaces
class FalTtsService {
	constructor(apiKey) {
		this.apiKey = apiKey
		this.baseUrl = "https://queue.fal.run"
	}

	async submitToFalQueue(text, voice = "af_heart") {
		const url = `${this.baseUrl}/fal-ai/kokoro/american-english`
		const payload = {
			prompt: text,
			voice: voice,
		}

		logToFile(`Submitting to: ${url}`)

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
			logToFile(`Submit failed: ${response.status} ${response.statusText} - ${errorText}`)
			throw new Error(`Fal.ai submit failed: ${response.status} ${response.statusText}`)
		}

		const result = await response.json()
		logToFile(`Submit response: ${JSON.stringify(result)}`)

		return result
	}

	async pollForCompletion(requestId) {
		const statusUrl = `${this.baseUrl}/fal-ai/kokoro/american-english/requests/${requestId}/status`
		const resultUrl = `${this.baseUrl}/fal-ai/kokoro/american-english/requests/${requestId}`

		logToFile(`Polling status at: ${statusUrl}`)

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

				const status = await statusResponse.json()

				logToFile(`Status check ${attempt}/${maxAttempts}: ${status.status}`)

				if (status.status === "COMPLETED") {
					// Get the result
					logToFile(`Request completed, fetching result from: ${resultUrl}`)

					const resultResponse = await fetch(resultUrl, {
						headers: {
							Authorization: `Key ${this.apiKey}`,
						},
					})

					if (!resultResponse.ok) {
						throw new Error(`Result fetch failed: ${resultResponse.status} ${resultResponse.statusText}`)
					}

					const result = await resultResponse.json()
					logToFile(`Result fetched successfully`)

					return result
				} else if (status.status === "IN_QUEUE" || status.status === "IN_PROGRESS") {
					// Continue polling
					if (attempt < maxAttempts) {
						logToFile(`Waiting ${pollInterval}ms before next check...`)
						await new Promise((resolve) => setTimeout(resolve, pollInterval))
					} else {
						throw new Error("Request timed out after 5 minutes")
					}
				} else {
					throw new Error(`Unexpected status: ${status.status}`)
				}
			} catch (error) {
				logToFile(`Poll attempt ${attempt} failed: ${error instanceof Error ? error.message : String(error)}`)

				if (attempt === maxAttempts) {
					throw error
				}

				// Wait before retrying
				await new Promise((resolve) => setTimeout(resolve, pollInterval))
			}
		}

		throw new Error("Polling loop exited unexpectedly")
	}

	async generateSpeech(text, voice = "af_heart") {
		logToFile(`generateSpeech called with text length: ${text?.length || 0}`)
		logToFile(`voice parameter: ${voice}`)

		if (!text || text.trim().length === 0) {
			logToFile(`Error: Text cannot be empty`)
			throw new Error("Text cannot be empty")
		}

		if (!this.apiKey) {
			logToFile(`Error: Fal.ai API key not configured`)
			throw new Error("Fal.ai API key not configured")
		}

		logToFile(`Submitting request to Fal.ai queue for model: fal-ai/kokoro/american-english`)

		// Step 1: Submit request to Fal.ai queue
		const submitResponse = await this.submitToFalQueue(text.trim(), voice)
		const requestId = submitResponse.request_id

		logToFile(`Request submitted successfully, request_id: ${requestId}`)

		// Step 2: Poll for completion
		const result = await this.pollForCompletion(requestId)

		logToFile(`Request completed, downloading audio from: ${result.audio.url}`)

		// Step 3: Download the audio file
		const audioResponse = await fetch(result.audio.url)
		if (!audioResponse.ok) {
			throw new Error(`Failed to download audio: ${audioResponse.status} ${audioResponse.statusText}`)
		}

		const audioData = await audioResponse.arrayBuffer()
		const contentType = result.audio.content_type || audioResponse.headers.get("content-type") || "audio/wav"

		logToFile(`Audio downloaded successfully, size: ${audioData.byteLength} bytes`)
		logToFile(`Content type: ${contentType}`)

		return {
			audioData,
			contentType,
		}
	}
}

// Test TTS functionality
async function testTTS() {
	const text = "Hello, this is a test of the Fal.ai text-to-speech system."
	const apiKey = process.env.FAL_API_KEY
	const outputFile = "test-tts-output.wav"

	if (!apiKey) {
		console.error("❌ FAL_API_KEY environment variable not set")
		console.log("Please set your Fal.ai API key:")
		console.log("export FAL_API_KEY=your_api_key_here")
		return
	}

	console.log("🔄 Testing TTS with text:", text)
	console.log("🔑 Using API key:", apiKey.substring(0, 10) + "...")
	console.log("💾 Output file:", outputFile)

	try {
		console.log("📡 Making request to Fal.ai queue API...")

		const ttsService = new FalTtsService(apiKey)

		// Test the Kokoro model
		console.log("🔍 Testing fal-ai/kokoro/american-english model...")
		const response = await ttsService.generateSpeech(text.trim(), "af_heart")

		console.log("✅ API Response received!")
		console.log("📊 Content-Type:", response.contentType)
		console.log("📏 Audio Data Size:", response.audioData.byteLength, "bytes")

		if (response.audioData.byteLength > 0) {
			console.log("🎉 TTS generation successful!")
			console.log("💾 Audio data received and ready for playback")

			// Convert ArrayBuffer to buffer and save to file
			const audioBuffer = Buffer.from(response.audioData)

			// Save to file
			fs.writeFileSync(outputFile, audioBuffer)
			console.log("💾 Audio saved to file:", outputFile)

			// Try to play the audio (macOS)
			console.log("🔊 Attempting to play audio...")
			const playCommand = `afplay "${outputFile}"` // macOS

			exec(playCommand, (error, stdout, stderr) => {
				if (error) {
					console.log("❌ Could not auto-play audio. Manual playback required.")
					console.log("🎧 To listen manually, run:", playCommand)
					console.log("   Or open the file:", outputFile)
				} else {
					console.log("✅ Audio played successfully!")
				}
			})

			// Show base64 for verification
			const base64Audio = audioBuffer.toString("base64")
			console.log("📄 Base64 Audio (first 100 chars):", base64Audio.substring(0, 100) + "...")
		} else {
			console.log("⚠️  Received empty audio data")
		}
	} catch (error) {
		console.error("❌ TTS test failed:")
		console.error("   Error:", error.message)

		if (error.message.includes("401") || error.message.includes("403")) {
			console.error("   Invalid API key. Please check your Fal.ai token.")
		} else if (error.message.includes("429")) {
			console.error("   Rate limit exceeded. Please try again later.")
		} else if (error.message.includes("500") || error.message.includes("502") || error.message.includes("503")) {
			console.error("   Fal.ai service error. Please try again later.")
		} else {
			console.error("   Unknown error occurred.")
		}
	}
}

// Run the test
testTTS()
