import { buildApiHandler } from "@core/api"
import { Empty, KeyValuePair } from "@shared/proto/cline/common"
import { SecretKey } from "../../storage/state-keys"
import { Controller } from ".."

/**
 * Saves an API key securely to VSCode secrets storage
 * @param controller The controller instance
 * @param request The request containing the key type and value
 */
export async function saveApiKey(controller: Controller, request: KeyValuePair): Promise<Empty> {
	const { key, value } = request

	console.log(`[DEBUG-SAVE-API-KEY] Function called with key: "${key}", value length: ${value?.length || 0}`)

	if (!key || !value) {
		console.log(`[DEBUG-SAVE-API-KEY] ERROR: Key or value missing`)
		throw new Error("Key and value are required")
	}

	console.log(`[UI-HANDLER] Saving API key for: ${key}`)

	// Validate that the key is a valid secret key
	if (!isValidSecretKey(key)) {
		throw new Error(`Unknown API key type: ${key}`)
	}

	// Save to VSCode secrets
	await controller.stateManager.setSecret(key as SecretKey, value)

	// Rebuild API handler with updated configuration
	if (controller.task) {
		const apiConfiguration = controller.stateManager.getApiConfiguration()
		controller.task.api = buildApiHandler({ ...apiConfiguration, ulid: controller.task.ulid }, controller.task.mode)
	}

	console.log(`[UI-HANDLER] API key saved successfully for: ${key}`)

	return Empty.create()
}

/**
 * Validates if a key is a valid secret key
 */
function isValidSecretKey(key: string): key is SecretKey {
	const validKeys: SecretKey[] = [
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
		"falApiKey",
	]

	return validKeys.includes(key as SecretKey)
}
