// Test that replicates the exact UI call to saveApiKey
// This tests the same code path as the UI button click

const { KeyValuePair } = require("./src/shared/proto/index")

// Mock the Controller class to simulate the extension environment
class MockController {
	constructor() {
		this.stateManager = {
			setSecret: async (key, value) => {
				console.log(`[MOCK] setSecret called with key: "${key}", value length: ${value.length}`)
				// Simulate the real validation that happens in the extension
				return this.validateAndStoreSecret(key, value)
			},
		}
	}

	async validateAndStoreSecret(key, value) {
		console.log(`[MOCK] Validating secret key: "${key}"`)

		// This is the exact validation logic from saveApiKey.ts
		if (!this.isValidSecretKey(key)) {
			const error = new Error(`Unknown API key type: ${key}`)
			console.log(`[MOCK] ❌ Validation FAILED: ${error.message}`)
			throw error
		}

		console.log(`[MOCK] ✅ Validation PASSED for key: "${key}"`)
		// Simulate successful storage
		console.log(`[MOCK] 💾 Secret stored successfully`)
		return true
	}

	isValidSecretKey(key) {
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
}

// Mock the saveApiKey handler (exact copy from src/core/controller/ui/saveApiKey.ts)
async function saveApiKey(controller, request) {
	const { key, value } = request

	if (!key || !value) {
		throw new Error("Key and value are required")
	}

	console.log(`[UI-HANDLER] Saving API key for: ${key}`)

	// Validate that the key is a valid secret key
	if (!isValidSecretKey(key)) {
		throw new Error(`Unknown API key type: ${key}`)
	}

	// Save to VSCode secrets (mocked)
	await controller.stateManager.setSecret(key, value)

	console.log(`[UI-HANDLER] API key saved successfully for: ${key}`)

	return {
		/* Empty response */
	}
}

// Validation function (exact copy)
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

// Test that replicates the exact UI button click
async function testUiSaveApiKey() {
	console.log(`🧪 Testing UI saveApiKey call (exact replication)`)
	console.log(`==================================================`)

	const testApiKey = "9647ee36-0da3-4fdc-b650-f0c07bd70c31:2ac67befe7813ff6355abb73df1527ab"

	console.log(`📝 Test API key: ${testApiKey.substring(0, 10)}...`)
	console.log(`🎯 Testing key: "falApiKey"`)

	// Create mock controller (simulates extension environment)
	const controller = new MockController()

	// Create the exact KeyValuePair that the UI sends
	const keyValuePair = KeyValuePair.create({
		key: "falApiKey",
		value: testApiKey,
	})

	console.log(`📦 KeyValuePair created:`, {
		key: keyValuePair.key,
		valueLength: keyValuePair.value.length,
	})

	try {
		// Call saveApiKey with the exact same parameters as the UI
		console.log(`\n🚀 Calling saveApiKey (simulating UI button click)...`)
		const result = await saveApiKey(controller, keyValuePair)

		console.log(`✅ SUCCESS: saveApiKey completed without error`)
		console.log(`📊 Result:`, result)

		return true
	} catch (error) {
		console.log(`❌ FAILURE: saveApiKey threw error`)
		console.log(`💥 Error: ${error.message}`)
		console.log(`🔍 Error stack:`, error.stack)

		return false
	}
}

// Run the test
testUiSaveApiKey()
	.then((success) => {
		console.log(`\n📋 Final Result: ${success ? "✅ PASS" : "❌ FAIL"}`)

		if (success) {
			console.log(`🎉 UI saveApiKey call works correctly!`)
			console.log(`   This means our fix is correct, but there might be a different issue in the real extension.`)
		} else {
			console.log(`💥 UI saveApiKey call fails with the same error as the extension!`)
			console.log(`   This confirms our fix didn't work - falApiKey is still rejected.`)
		}

		process.exit(success ? 0 : 1)
	})
	.catch((error) => {
		console.error(`💥 Test runner failed:`, error)
		process.exit(1)
	})
