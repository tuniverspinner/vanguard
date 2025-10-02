// Test script for API key validation logic
// Encapsulates the validation function for systematic testing

/**
 * Validates if a key is a valid secret key
 * Extracted from src/core/controller/ui/saveApiKey.ts for testing
 */
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
	]

	return validKeys.includes(key)
}

// Test cases
function runTests() {
	console.log("🧪 Testing API key validation logic...\n")

	const testCases = [
		// Should pass
		{ key: "apiKey", expected: true, description: "Standard API key" },
		{ key: "huggingFaceApiKey", expected: true, description: "HuggingFace key (existing)" },
		{ key: "openAiApiKey", expected: true, description: "OpenAI key" },

		// Should fail (currently)
		{ key: "falApiKey", expected: false, description: "Fal.ai key (new, should fail before fix)" },
		{ key: "invalidKey", expected: false, description: "Completely invalid key" },
		{ key: "", expected: false, description: "Empty string" },
	]

	let passed = 0
	let failed = 0

	testCases.forEach(({ key, expected, description }) => {
		const result = isValidSecretKey(key)
		const success = result === expected

		if (success) {
			console.log(`✅ PASS: ${description} (${key})`)
			passed++
		} else {
			console.log(`❌ FAIL: ${description} (${key}) - Expected: ${expected}, Got: ${result}`)
			failed++
		}
	})

	console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`)

	if (failed > 0) {
		console.log("\n🔧 To fix: Add 'falApiKey' to the validKeys array in saveApiKey.ts")
		process.exit(1)
	} else {
		console.log("\n🎉 All tests passed!")
		process.exit(0)
	}
}

// Run the tests
runTests()
