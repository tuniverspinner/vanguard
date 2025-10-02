import {
	ApiConfiguration,
	ApiProvider,
	anthropicModelsActive,
	groqDefaultModelId,
	groqModels,
	ModelInfo,
	openRouterDefaultModelId,
	openRouterDefaultModelInfo,
	xaiDefaultModelId,
	xaiModels,
} from "@shared/api"
import { Mode } from "@shared/storage/types"

/**
 * Interface for normalized API configuration
 */
export interface NormalizedApiConfig {
	selectedProvider: ApiProvider
	selectedModelId: string
	selectedModelInfo: ModelInfo
}

/**
 * Normalizes API configuration to ensure consistent values
 */
export function normalizeApiConfiguration(
	apiConfiguration: ApiConfiguration | undefined,
	currentMode: Mode,
): NormalizedApiConfig {
	const provider =
		(currentMode === "plan" ? apiConfiguration?.planModeApiProvider : apiConfiguration?.actModeApiProvider) || "cline"
	const modelId = currentMode === "plan" ? apiConfiguration?.planModeApiModelId : apiConfiguration?.actModeApiModelId

	const getProviderData = (models: Record<string, ModelInfo>, defaultId: string) => {
		let selectedModelId: string
		let selectedModelInfo: ModelInfo
		if (modelId && modelId in models) {
			selectedModelId = modelId
			selectedModelInfo = models[modelId]
		} else {
			selectedModelId = defaultId
			selectedModelInfo = models[defaultId]
		}
		return {
			selectedProvider: provider,
			selectedModelId,
			selectedModelInfo,
		}
	}

	switch (provider) {
		case "cline":
			const clineOpenRouterModelId =
				(currentMode === "plan"
					? apiConfiguration?.planModeOpenRouterModelId
					: apiConfiguration?.actModeOpenRouterModelId) || openRouterDefaultModelId
			const clineOpenRouterModelInfo =
				(currentMode === "plan"
					? apiConfiguration?.planModeOpenRouterModelInfo
					: apiConfiguration?.actModeOpenRouterModelInfo) || openRouterDefaultModelInfo
			return {
				selectedProvider: provider,
				selectedModelId: clineOpenRouterModelId,
				selectedModelInfo: clineOpenRouterModelInfo,
			}
		case "groq":
			const groqModelId =
				currentMode === "plan" ? apiConfiguration?.planModeGroqModelId : apiConfiguration?.actModeGroqModelId
			const groqModelInfo =
				currentMode === "plan" ? apiConfiguration?.planModeGroqModelInfo : apiConfiguration?.actModeGroqModelInfo
			return {
				selectedProvider: provider,
				selectedModelId: groqModelId || groqDefaultModelId,
				selectedModelInfo: groqModelInfo || groqModels[groqDefaultModelId],
			}
		case "xai":
			return getProviderData(xaiModels, xaiDefaultModelId)
		case "anthropic":
			const anthropicModelId =
				currentMode === "plan" ? apiConfiguration?.planModeAnthropicModelId : apiConfiguration?.actModeAnthropicModelId
			const anthropicModelInfo =
				currentMode === "plan"
					? apiConfiguration?.planModeAnthropicModelInfo
					: apiConfiguration?.actModeAnthropicModelInfo
			return {
				selectedProvider: provider,
				selectedModelId: anthropicModelId || "claude-sonnet-4-5-20250929",
				selectedModelInfo: anthropicModelInfo || anthropicModelsActive["claude-sonnet-4-5-20250929"],
			}
		default:
			// Default to Cline if provider is not recognized
			const defaultOpenRouterModelId =
				(currentMode === "plan"
					? apiConfiguration?.planModeOpenRouterModelId
					: apiConfiguration?.actModeOpenRouterModelId) || openRouterDefaultModelId
			const defaultOpenRouterModelInfo =
				(currentMode === "plan"
					? apiConfiguration?.planModeOpenRouterModelInfo
					: apiConfiguration?.actModeOpenRouterModelInfo) || openRouterDefaultModelInfo
			return {
				selectedProvider: "cline",
				selectedModelId: defaultOpenRouterModelId,
				selectedModelInfo: defaultOpenRouterModelInfo,
			}
	}
}

/**
 * Gets mode-specific field values from API configuration
 * @param apiConfiguration The API configuration object
 * @param mode The current mode ("plan" or "act")
 * @returns Object containing mode-specific field values for clean destructuring
 */
export function getModeSpecificFields(apiConfiguration: ApiConfiguration | undefined, mode: Mode) {
	if (!apiConfiguration) {
		return {
			// Core fields
			apiProvider: undefined,
			apiModelId: undefined,

			// Provider-specific model IDs
			togetherModelId: undefined,
			fireworksModelId: undefined,
			lmStudioModelId: undefined,
			ollamaModelId: undefined,
			liteLlmModelId: undefined,
			requestyModelId: undefined,
			openAiModelId: undefined,
			openRouterModelId: undefined,
			groqModelId: undefined,
			anthropicModelId: undefined,
			basetenModelId: undefined,
			huggingFaceModelId: undefined,
			huaweiCloudMaasModelId: undefined,
			vercelAiGatewayModelId: undefined,

			// Model info objects
			openAiModelInfo: undefined,
			liteLlmModelInfo: undefined,
			openRouterModelInfo: undefined,
			requestyModelInfo: undefined,
			groqModelInfo: undefined,
			anthropicModelInfo: undefined,
			basetenModelInfo: undefined,
			huggingFaceModelInfo: undefined,
			vercelAiGatewayModelInfo: undefined,
			vsCodeLmModelSelector: undefined,

			// AWS Bedrock fields
			awsBedrockCustomSelected: undefined,
			awsBedrockCustomModelBaseId: undefined,

			// Huawei Cloud Maas Model Info
			huaweiCloudMaasModelInfo: undefined,

			// Other mode-specific fields
			thinkingBudgetTokens: undefined,
			reasoningEffort: undefined,
		}
	}

	return {
		// Core fields
		apiProvider: mode === "plan" ? apiConfiguration.planModeApiProvider : apiConfiguration.actModeApiProvider,
		apiModelId: mode === "plan" ? apiConfiguration.planModeApiModelId : apiConfiguration.actModeApiModelId,

		// Provider-specific model IDs
		openRouterModelId:
			mode === "plan" ? apiConfiguration.planModeOpenRouterModelId : apiConfiguration.actModeOpenRouterModelId,
		groqModelId: mode === "plan" ? apiConfiguration.planModeGroqModelId : apiConfiguration.actModeGroqModelId,
		anthropicModelId: mode === "plan" ? apiConfiguration.planModeAnthropicModelId : apiConfiguration.actModeAnthropicModelId,

		// Model info objects
		openRouterModelInfo:
			mode === "plan" ? apiConfiguration.planModeOpenRouterModelInfo : apiConfiguration.actModeOpenRouterModelInfo,
		groqModelInfo: mode === "plan" ? apiConfiguration.planModeGroqModelInfo : apiConfiguration.actModeGroqModelInfo,
		anthropicModelInfo:
			mode === "plan" ? apiConfiguration.planModeAnthropicModelInfo : apiConfiguration.actModeAnthropicModelInfo,
		vsCodeLmModelSelector:
			mode === "plan" ? apiConfiguration.planModeVsCodeLmModelSelector : apiConfiguration.actModeVsCodeLmModelSelector,

		// AWS Bedrock fields
		awsBedrockCustomSelected: undefined,
		awsBedrockCustomModelBaseId: undefined,

		// Huawei Cloud Maas Model Info
		huaweiCloudMaasModelInfo: undefined,

		// Other mode-specific fields
		thinkingBudgetTokens:
			mode === "plan" ? apiConfiguration.planModeThinkingBudgetTokens : apiConfiguration.actModeThinkingBudgetTokens,
		reasoningEffort: mode === "plan" ? apiConfiguration.planModeReasoningEffort : apiConfiguration.actModeReasoningEffort,
	}
}

/**
 * Synchronizes mode configurations by copying the source mode's settings to both modes
 * This is used when the "Use different models for Plan and Act modes" toggle is unchecked
 */
export async function syncModeConfigurations(
	apiConfiguration: ApiConfiguration | undefined,
	sourceMode: Mode,
	handleFieldsChange: (updates: Partial<ApiConfiguration>) => Promise<void>,
): Promise<void> {
	if (!apiConfiguration) {
		return
	}

	const sourceFields = getModeSpecificFields(apiConfiguration, sourceMode)
	const { apiProvider } = sourceFields

	if (!apiProvider) {
		return
	}

	// Build the complete update object with both plan and act mode fields
	const updates: Partial<ApiConfiguration> = {
		// Always sync common fields
		planModeApiProvider: sourceFields.apiProvider,
		actModeApiProvider: sourceFields.apiProvider,
		planModeThinkingBudgetTokens: sourceFields.thinkingBudgetTokens,
		actModeThinkingBudgetTokens: sourceFields.thinkingBudgetTokens,
		planModeReasoningEffort: sourceFields.reasoningEffort,
		actModeReasoningEffort: sourceFields.reasoningEffort,
	}

	// Handle provider-specific fields
	switch (apiProvider) {
		case "cline":
			updates.planModeOpenRouterModelId = sourceFields.openRouterModelId
			updates.actModeOpenRouterModelId = sourceFields.openRouterModelId
			updates.planModeOpenRouterModelInfo = sourceFields.openRouterModelInfo
			updates.actModeOpenRouterModelInfo = sourceFields.openRouterModelInfo
			break

		case "groq":
			updates.planModeGroqModelId = sourceFields.groqModelId
			updates.actModeGroqModelId = sourceFields.groqModelId
			updates.planModeGroqModelInfo = sourceFields.groqModelInfo
			updates.actModeGroqModelInfo = sourceFields.groqModelInfo
			break

		case "anthropic":
			updates.planModeAnthropicModelId = sourceFields.anthropicModelId
			updates.actModeAnthropicModelId = sourceFields.anthropicModelId
			updates.planModeAnthropicModelInfo = sourceFields.anthropicModelInfo
			updates.actModeAnthropicModelInfo = sourceFields.anthropicModelInfo
			break

		case "xai":
		default:
			updates.planModeApiModelId = sourceFields.apiModelId
			updates.actModeApiModelId = sourceFields.apiModelId
			break
	}

	// Make the atomic update
	await handleFieldsChange(updates)
}
