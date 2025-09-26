const { HfInference } = require("@huggingface/inference")
const fs = require("fs")
const { exec } = require("child_process")

// Test TTS functionality
async function testTTS() {
	const text = "Hello, this is a test of the text-to-speech system."
	const apiKey = process.env.HUGGINGFACE_API_KEY
	const outputFile = "test-tts-output.wav"

	if (!apiKey) {
		console.error("❌ HUGGINGFACE_API_KEY environment variable not set")
		console.log("Please set your Hugging Face API key:")
		console.log("export HUGGINGFACE_API_KEY=your_api_key_here")
		return
	}

	console.log("🔄 Testing TTS with text:", text)
	console.log("🔑 Using API key:", apiKey.substring(0, 10) + "...")
	console.log("💾 Output file:", outputFile)

	try {
		console.log("📡 Making request to Hugging Face Inference API...")

		const client = new HfInference(apiKey)

		// Test the Kokoro-82M model
		console.log("🔍 Testing Kokoro-82M model...")
		const audioBlob = await client.textToSpeech({
			model: "hexgrad/Kokoro-82M",
			inputs: text.trim(),
		})

		console.log("✅ API Response received!")
		console.log("📊 Content-Type:", audioBlob.type)
		console.log("📏 Audio Data Size:", audioBlob.size, "bytes")

		if (audioBlob.size > 0) {
			console.log("🎉 TTS generation successful!")
			console.log("💾 Audio data received and ready for playback")

			// Convert blob to buffer and save to file
			const arrayBuffer = await audioBlob.arrayBuffer()
			const audioBuffer = Buffer.from(arrayBuffer)

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

		if (error.message.includes("429")) {
			console.error("   Rate limit exceeded. Please try again later.")
		} else if (error.message.includes("401")) {
			console.error("   Invalid API key. Please check your Hugging Face token.")
		} else if (error.message.includes("403")) {
			console.error("   Forbidden. Your API key may not have billing enabled.")
		} else if (error.message.includes("404")) {
			console.error("   Model not found. The model may not be available on the Inference API.")
		} else {
			console.error("   Unknown error occurred.")
		}
	}
}

// Run the test
testTTS()
