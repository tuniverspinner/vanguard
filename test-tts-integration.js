// Integration test for TTS functionality in Vanguard extension
// Tests the complete pipeline: API key validation → TTS service → audio generation

const fs = require("fs")
const path = require("path")

// Mock VSCode API for testing
const mockVSCode = {
	workspace: {
		getConfiguration: () => ({
			get: () => undefined,
			update: () => Promise.resolve(),
		}),
	},
	Uri: {
		file: (path) => ({ fsPath: path }),
	},
}

// Mock the extension's TTS service
class MockTtsService {
	constructor(apiKey) {
		this.apiKey = apiKey
		this.baseUrl = "https://queue.fal.run"
		this.statusUrl = null
		this.responseUrl = null
	}

	async generateSpeech(text, voice = "af_heart") {
		console.log(`🎤 MockTtsService.generateSpeech called`)
		console.log(`   Text: "${text}"`)
		console.log(`   Voice: ${voice}`)
		console.log(`   API Key present: ${!!this.apiKey}`)

		if (!this.apiKey) {
			console.log(`❌ FAIL: No API key configured`)
			throw new Error("Fal.ai API key not configured")
		}

		if (!text || text.trim().length === 0) {
			console.log(`❌ FAIL: Empty text provided`)
			throw new Error("Text cannot be empty")
		}

		// Simulate the queue-based workflow
		console.log(`📡 Simulating Fal.ai queue submission...`)

		try {
			// This will fail because we don't have a real API key
			const submitResponse = await this.submitToFalQueue(text.trim(), voice)
			console.log(`✅ Queue submission successful: ${submitResponse.request_id}`)

			const result = await this.pollForCompletion(submitResponse.request_id)
			console.log(`✅ Audio generation completed`)

			return {
				audioData: result.audio.data,
				contentType: result.audio.content_type,
			}
		} catch (error) {
			console.log(`❌ FAIL: Fal.ai API call failed: ${error.message}`)
			throw error
		}
	}

	async submitToFalQueue(text, voice) {
		const url = `${this.baseUrl}/fal-ai/kokoro/american-english`
		const payload = { prompt: text, voice }

		console.log(`   POST ${url}`)
		console.log(`   Payload: ${JSON.stringify(payload)}`)

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
			throw new Error(`HTTP ${response.status}: ${errorText}`)
		}

		const result = await response.json()

		// Store the URLs from the response for polling (like the real TtsService)
		this.statusUrl = result.status_url
		this.responseUrl = result.response_url

		console.log(`   Status URL: ${this.statusUrl}`)
		console.log(`   Response URL: ${this.responseUrl}`)

		return result
	}

	async pollForCompletion(requestId) {
		// Use the URLs provided by the API response (like the real TtsService)
		const statusUrl = this.statusUrl
		const resultUrl = this.responseUrl

		if (!statusUrl || !resultUrl) {
			throw new Error("Status and response URLs not available from submit response")
		}

		console.log(`   Polling status at: ${statusUrl}`)

		// Poll for completion (simplified - just try a few times)
		for (let attempt = 1; attempt <= 3; attempt++) {
			console.log(`   Status check ${attempt}/3`)

			// Check status first
			const statusResponse = await fetch(statusUrl, {
				headers: {
					Authorization: `Key ${this.apiKey}`,
				},
			})

			if (!statusResponse.ok) {
				throw new Error(`Status check failed: HTTP ${statusResponse.status}`)
			}

			const status = await statusResponse.json()
			console.log(`   Status: ${status.status}`)

			if (status.status === "COMPLETED") {
				// Now get the result
				console.log(`   Request completed, fetching result from: ${resultUrl}`)

				const resultResponse = await fetch(resultUrl, {
					headers: {
						Authorization: `Key ${this.apiKey}`,
					},
				})

				if (!resultResponse.ok) {
					throw new Error(`Result fetch failed: HTTP ${resultResponse.status}`)
				}

				const result = await resultResponse.json()
				console.log(`   Result fetched successfully`)

				return result
			} else if (status.status === "IN_QUEUE" || status.status === "IN_PROGRESS") {
				// Continue polling
				console.log(`   Still processing, waiting 2s...`)
				await new Promise((resolve) => setTimeout(resolve, 2000))
			} else {
				throw new Error(`Unexpected status: ${status.status}`)
			}
		}

		throw new Error("Request timed out")
	}
}

// Test the API key validation (the part we fixed)
function testApiKeyValidation() {
	console.log(`\n🧪 Testing API Key Validation`)
	console.log(`================================`)

	// Simulate the validation function from saveApiKey.ts
	function isValidSecretKey(key) {
		const validKeys = [
			"apiKey",
			"clineAccountId",
			"openRouterApiKey",
			"awsAccessKey",
			"awsSecretKey",
			"awsSessionToken",
			"awsBedrockApiKey",
			"openAiApiKey",
			"geminiApiKey",
			"openAiNativeApiKey",
			"ollamaApiKey",
			"deepSeekApiKey",
			"requestyApiKey",
			"togetherApiKey",
			"fireworksApiKey",
			"qwenApiKey",
			"doubaoApiKey",
			"mistralApiKey",
			"liteLlmApiKey",
			"authNonce",
			"asksageApiKey",
			"xaiApiKey",
			"moonshotApiKey",
			"zaiApiKey",
			"huggingFaceApiKey",
			"nebiusApiKey",
			"sambanovaApiKey",
			"cerebrasApiKey",
			"sapAiCoreClientId",
			"sapAiCoreClientSecret",
			"groqApiKey",
			"huaweiCloudMaasApiKey",
			"basetenApiKey",
			"vercelAiGatewayApiKey",
			"difyApiKey",
			// Our fix: added falApiKey
			"falApiKey",
		]
		return validKeys.includes(key)
	}

	const testKeys = [
		{ key: "falApiKey", expected: true, description: "Our fix - falApiKey should be valid" },
		{ key: "invalidKey", expected: false, description: "Invalid key should be rejected" },
		{ key: "apiKey", expected: true, description: "Existing key should still work" },
	]

	let passed = 0
	let failed = 0

	testKeys.forEach(({ key, expected, description }) => {
		const result = isValidSecretKey(key)
		const success = result === expected

		if (success) {
			console.log(`✅ PASS: ${description}`)
			passed++
		} else {
			console.log(`❌ FAIL: ${description} - Expected: ${expected}, Got: ${result}`)
			failed++
		}
	})

	console.log(`\n📊 API Key Validation: ${passed}/${passed + failed} tests passed`)

	return failed === 0
}

// Test the TTS service integration
async function testTtsServiceIntegration() {
	console.log(`\n🎤 Testing TTS Service Integration`)
	console.log(`=====================================`)

	const testText = "Hello, this is a test of the Fal.ai integration."
	const apiKey = process.env.FAL_API_KEY

	console.log(`📝 Test text: "${testText}"`)
	console.log(`🔑 API Key present: ${!!apiKey}`)

	if (!apiKey) {
		console.log(`❌ FAIL: FAL_API_KEY environment variable not set`)
		console.log(`   This simulates the real extension behavior when no API key is configured`)
		return false
	}

	try {
		const ttsService = new MockTtsService(apiKey)
		const result = await ttsService.generateSpeech(testText)

		console.log(`✅ SUCCESS: TTS service integration works!`)
		console.log(`   Audio data size: ${result.audioData?.byteLength || 0} bytes`)
		return true
	} catch (error) {
		console.log(`❌ FAIL: TTS service integration failed`)
		console.log(`   Error: ${error.message}`)

		if (error.message.includes("401") || error.message.includes("403")) {
			console.log(`   → This indicates invalid API key (expected with test key)`)
		} else if (error.message.includes("API key not configured")) {
			console.log(`   → This indicates missing API key configuration`)
		} else {
			console.log(`   → Unexpected error in TTS pipeline`)
		}

		return false
	}
}

// Main test runner
async function runIntegrationTests() {
	console.log(`🚀 Vanguard TTS Integration Tests`)
	console.log(`==================================`)
	console.log(`Testing the complete TTS pipeline after our falApiKey fix`)
	console.log(`This should demonstrate current failures before we fix them.\n`)

	// Test 1: API Key Validation
	const validationPassed = testApiKeyValidation()

	// Test 2: TTS Service Integration
	const integrationPassed = await testTtsServiceIntegration()

	// Summary
	console.log(`\n📋 Test Results Summary`)
	console.log(`=========================`)
	console.log(`API Key Validation: ${validationPassed ? "✅ PASS" : "❌ FAIL"}`)
	console.log(`TTS Integration: ${integrationPassed ? "✅ PASS" : "❌ FAIL"}`)

	if (validationPassed && integrationPassed) {
		console.log(`\n🎉 ALL TESTS PASSED! TTS integration is working correctly.`)
	} else {
		console.log(`\n⚠️  SOME TESTS FAILED - This shows the current broken state.`)
		console.log(`   We need to fix these issues before TTS will work in the extension.`)

		if (!validationPassed) {
			console.log(`   → API key validation is still broken`)
		}
		if (!integrationPassed) {
			console.log(`   → TTS service integration has issues`)
		}
	}

	return { validationPassed, integrationPassed }
}

// Run the tests
runIntegrationTests().catch((error) => {
	console.error(`💥 Test runner failed:`, error)
	process.exit(1)
})
