import { ApiConfiguration, ApiProvider } from "@shared/api"
import { ApiConfiguration as ProtoApiConfiguration } from "@shared/proto/cline/state"

/**
 * Converts domain ApiConfiguration objects to proto ApiConfiguration objects
 */
export function convertApiConfigurationToProtoApiConfiguration(config: ApiConfiguration): ProtoApiConfiguration {
	const protoConfig: any = {
		// Global configuration fields (not mode-specific)
		clineAccountId: config.clineAccountId || "",
		ulid: config.ulid || "",
		xaiApiKey: config.xaiApiKey || "",
		groqApiKey: config.groqApiKey || "",
		requestTimeoutMs: config.requestTimeoutMs ? Number(config.requestTimeoutMs) : undefined,

		// Plan mode configurations
		planModeApiProvider: config.planModeApiProvider || "cline",
		planModeApiModelId: config.planModeApiModelId || "",
		planModeThinkingBudgetTokens: config.planModeThinkingBudgetTokens
			? Number(config.planModeThinkingBudgetTokens)
			: undefined,
		planModeReasoningEffort: config.planModeReasoningEffort || "",
		planModeGroqModelId: config.planModeGroqModelId || "",
		planModeGroqModelInfo: config.planModeGroqModelInfo ? JSON.stringify(config.planModeGroqModelInfo) : undefined,
		planModeOpenRouterModelId: config.planModeOpenRouterModelId || "",
		planModeOpenRouterModelInfo: config.planModeOpenRouterModelInfo
			? JSON.stringify(config.planModeOpenRouterModelInfo)
			: undefined,

		// Act mode configurations
		actModeApiProvider: config.actModeApiProvider || "cline",
		actModeApiModelId: config.actModeApiModelId || "",
		actModeThinkingBudgetTokens: config.actModeThinkingBudgetTokens ? Number(config.actModeThinkingBudgetTokens) : undefined,
		actModeReasoningEffort: config.actModeReasoningEffort || "",
		actModeGroqModelId: config.actModeGroqModelId || "",
		actModeGroqModelInfo: config.actModeGroqModelInfo ? JSON.stringify(config.actModeGroqModelInfo) : undefined,
		actModeOpenRouterModelId: config.actModeOpenRouterModelId || "",
		actModeOpenRouterModelInfo: config.actModeOpenRouterModelInfo
			? JSON.stringify(config.actModeOpenRouterModelInfo)
			: undefined,

		// Favorited model IDs
		favoritedModelIds: config.favoritedModelIds || [],
	}

	return ProtoApiConfiguration.create(protoConfig)
}

/**
 * Converts proto ApiConfiguration objects to domain ApiConfiguration objects
 */
export function convertProtoApiConfigurationToApiConfiguration(protoConfig: ProtoApiConfiguration): ApiConfiguration {
	const config: ApiConfiguration = {
		// Global configuration fields (not mode-specific)
		clineAccountId: protoConfig.clineAccountId,
		ulid: protoConfig.ulid,
		xaiApiKey: protoConfig.xaiApiKey,
		groqApiKey: protoConfig.groqApiKey,
		requestTimeoutMs: protoConfig.requestTimeoutMs ? Number(protoConfig.requestTimeoutMs) : undefined,

		// Plan mode configurations
		planModeApiProvider: protoConfig.planModeApiProvider as ApiProvider,
		planModeApiModelId: protoConfig.planModeApiModelId,
		planModeThinkingBudgetTokens: protoConfig.planModeThinkingBudgetTokens
			? Number(protoConfig.planModeThinkingBudgetTokens)
			: undefined,
		planModeReasoningEffort: protoConfig.planModeReasoningEffort,
		planModeGroqModelId: protoConfig.planModeGroqModelId,
		planModeOpenRouterModelId: protoConfig.planModeOpenRouterModelId,

		// Act mode configurations
		actModeApiProvider: protoConfig.actModeApiProvider as ApiProvider,
		actModeApiModelId: protoConfig.actModeApiModelId,
		actModeThinkingBudgetTokens: protoConfig.actModeThinkingBudgetTokens
			? Number(protoConfig.actModeThinkingBudgetTokens)
			: undefined,
		actModeReasoningEffort: protoConfig.actModeReasoningEffort,
		actModeGroqModelId: protoConfig.actModeGroqModelId,
		actModeOpenRouterModelId: protoConfig.actModeOpenRouterModelId,

		// Favorited model IDs
		favoritedModelIds: protoConfig.favoritedModelIds || [],
	}

	// Handle complex JSON objects
	try {
		if (protoConfig.planModeGroqModelInfo) {
			config.planModeGroqModelInfo = JSON.parse(protoConfig.planModeGroqModelInfo)
		}
		if (protoConfig.planModeOpenRouterModelInfo) {
			config.planModeOpenRouterModelInfo = JSON.parse(protoConfig.planModeOpenRouterModelInfo)
		}
		if (protoConfig.actModeGroqModelInfo) {
			config.actModeGroqModelInfo = JSON.parse(protoConfig.actModeGroqModelInfo)
		}
		if (protoConfig.actModeOpenRouterModelInfo) {
			config.actModeOpenRouterModelInfo = JSON.parse(protoConfig.actModeOpenRouterModelInfo)
		}
	} catch (error) {
		console.error("Failed to parse complex JSON objects in API configuration:", error)
	}

	return config
}
