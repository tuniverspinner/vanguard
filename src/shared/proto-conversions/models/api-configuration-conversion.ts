import {
	OpenRouterModelInfo,
	ModelsApiConfiguration as ProtoApiConfiguration,
	ApiProvider as ProtoApiProvider,
	ThinkingConfig,
} from "@shared/proto/cline/models"
import { ApiConfiguration, ApiProvider, ModelInfo } from "../../api"

// Convert application ThinkingConfig to proto ThinkingConfig
function convertThinkingConfigToProto(config: ModelInfo["thinkingConfig"]): ThinkingConfig | undefined {
	if (!config) {
		return undefined
	}

	return {
		maxBudget: config.maxBudget,
		outputPrice: config.outputPrice,
		outputPriceTiers: config.outputPriceTiers || [], // Provide empty array if undefined
	}
}

// Convert proto ThinkingConfig to application ThinkingConfig
function convertProtoToThinkingConfig(config: ThinkingConfig | undefined): ModelInfo["thinkingConfig"] | undefined {
	if (!config) {
		return undefined
	}

	return {
		maxBudget: config.maxBudget,
		outputPrice: config.outputPrice,
		outputPriceTiers: config.outputPriceTiers.length > 0 ? config.outputPriceTiers : undefined,
	}
}

// Convert application ModelInfo to proto OpenRouterModelInfo
function convertModelInfoToProtoOpenRouter(info: ModelInfo | undefined): OpenRouterModelInfo | undefined {
	if (!info) {
		return undefined
	}

	return {
		maxTokens: info.maxTokens,
		contextWindow: info.contextWindow,
		supportsImages: info.supportsImages,
		supportsPromptCache: info.supportsPromptCache ?? false,
		inputPrice: info.inputPrice,
		outputPrice: info.outputPrice,
		cacheWritesPrice: info.cacheWritesPrice,
		cacheReadsPrice: info.cacheReadsPrice,
		description: info.description,
		thinkingConfig: convertThinkingConfigToProto(info.thinkingConfig),
		supportsGlobalEndpoint: info.supportsGlobalEndpoint,
		tiers: info.tiers || [],
	}
}

// Convert proto OpenRouterModelInfo to application ModelInfo
function convertProtoToModelInfo(info: OpenRouterModelInfo | undefined): ModelInfo | undefined {
	if (!info) {
		return undefined
	}

	return {
		maxTokens: info.maxTokens,
		contextWindow: info.contextWindow,
		supportsImages: info.supportsImages,
		supportsPromptCache: info.supportsPromptCache,
		inputPrice: info.inputPrice,
		outputPrice: info.outputPrice,
		cacheWritesPrice: info.cacheWritesPrice,
		cacheReadsPrice: info.cacheReadsPrice,
		description: info.description,
		thinkingConfig: convertProtoToThinkingConfig(info.thinkingConfig),
		supportsGlobalEndpoint: info.supportsGlobalEndpoint,
		tiers: info.tiers.length > 0 ? info.tiers : undefined,
	}
}

// Convert application ApiProvider to proto ApiProvider
function convertApiProviderToProto(provider: string | undefined): ProtoApiProvider {
	switch (provider) {
		case "anthropic":
			return ProtoApiProvider.ANTHROPIC
		case "openrouter":
			return ProtoApiProvider.OPENROUTER
		case "bedrock":
			return ProtoApiProvider.BEDROCK
		case "vertex":
			return ProtoApiProvider.VERTEX
		case "openai":
			return ProtoApiProvider.OPENAI
		case "ollama":
			return ProtoApiProvider.OLLAMA
		case "lmstudio":
			return ProtoApiProvider.LMSTUDIO
		case "gemini":
			return ProtoApiProvider.GEMINI
		case "openai-native":
			return ProtoApiProvider.OPENAI_NATIVE
		case "requesty":
			return ProtoApiProvider.REQUESTY
		case "together":
			return ProtoApiProvider.TOGETHER
		case "deepseek":
			return ProtoApiProvider.DEEPSEEK
		case "qwen":
			return ProtoApiProvider.QWEN
		case "qwen-code":
			return ProtoApiProvider.QWEN_CODE
		case "doubao":
			return ProtoApiProvider.DOUBAO
		case "mistral":
			return ProtoApiProvider.MISTRAL
		case "vscode-lm":
			return ProtoApiProvider.VSCODE_LM
		case "cline":
			return ProtoApiProvider.CLINE
		case "litellm":
			return ProtoApiProvider.LITELLM
		case "moonshot":
			return ProtoApiProvider.MOONSHOT
		case "huggingface":
			return ProtoApiProvider.HUGGINGFACE
		case "nebius":
			return ProtoApiProvider.NEBIUS
		case "fireworks":
			return ProtoApiProvider.FIREWORKS
		case "asksage":
			return ProtoApiProvider.ASKSAGE
		case "xai":
			return ProtoApiProvider.XAI
		case "sambanova":
			return ProtoApiProvider.SAMBANOVA
		case "cerebras":
			return ProtoApiProvider.CEREBRAS
		case "groq":
			return ProtoApiProvider.GROQ
		case "baseten":
			return ProtoApiProvider.BASETEN
		case "sapaicore":
			return ProtoApiProvider.SAPAICORE
		case "claude-code":
			return ProtoApiProvider.CLAUDE_CODE
		case "huawei-cloud-maas":
			return ProtoApiProvider.HUAWEI_CLOUD_MAAS
		case "vercel-ai-gateway":
			return ProtoApiProvider.VERCEL_AI_GATEWAY
		case "zai":
			return ProtoApiProvider.ZAI
		case "dify":
			return ProtoApiProvider.DIFY
		default:
			return ProtoApiProvider.ANTHROPIC
	}
}

// Convert proto ApiProvider to application ApiProvider
function convertProtoToApiProvider(provider: ProtoApiProvider): ApiProvider {
	switch (provider) {
		case ProtoApiProvider.CLINE:
			return "cline"
		case ProtoApiProvider.XAI:
			return "xai"
		case ProtoApiProvider.GROQ:
			return "groq"
		case ProtoApiProvider.ANTHROPIC:
			return "anthropic"
		// All other providers now default to "cline" since only 4 providers are active
		default:
			return "cline"
	}
}

// Converts application ApiConfiguration to proto ApiConfiguration
export function convertApiConfigurationToProto(config: ApiConfiguration): ProtoApiConfiguration {
	return {
		// Global configuration fields (only include fields that exist in current ApiConfiguration)
		clineAccountId: config.clineAccountId,
		ulid: config.ulid,
		xaiApiKey: config.xaiApiKey,
		groqApiKey: config.groqApiKey,
		apiKey: config.anthropicApiKey,
		requestTimeoutMs: config.requestTimeoutMs,
		// Required proto fields (provide defaults)
		openAiHeaders: {},

		// Plan mode configurations
		planModeApiProvider: config.planModeApiProvider ? convertApiProviderToProto(config.planModeApiProvider) : undefined,
		planModeApiModelId: config.planModeApiModelId,
		planModeThinkingBudgetTokens: config.planModeThinkingBudgetTokens,
		planModeReasoningEffort: config.planModeReasoningEffort,
		planModeVsCodeLmModelSelector: config.planModeVsCodeLmModelSelector,
		planModeGroqModelId: config.planModeGroqModelId,
		planModeGroqModelInfo: convertModelInfoToProtoOpenRouter(config.planModeGroqModelInfo),

		// Act mode configurations
		actModeApiProvider: config.actModeApiProvider ? convertApiProviderToProto(config.actModeApiProvider) : undefined,
		actModeApiModelId: config.actModeApiModelId,
		actModeThinkingBudgetTokens: config.actModeThinkingBudgetTokens,
		actModeReasoningEffort: config.actModeReasoningEffort,
		actModeVsCodeLmModelSelector: config.actModeVsCodeLmModelSelector,
		actModeGroqModelId: config.actModeGroqModelId,
		actModeGroqModelInfo: convertModelInfoToProtoOpenRouter(config.actModeGroqModelInfo),

		// Favorited model IDs
		favoritedModelIds: config.favoritedModelIds || [],
	}
}

// Converts proto ApiConfiguration to application ApiConfiguration
export function convertProtoToApiConfiguration(protoConfig: ProtoApiConfiguration): ApiConfiguration {
	return {
		// Global configuration fields (only include fields that exist in current ApiConfiguration)
		clineAccountId: protoConfig.clineAccountId,
		ulid: protoConfig.ulid,
		xaiApiKey: protoConfig.xaiApiKey,
		groqApiKey: protoConfig.groqApiKey,
		anthropicApiKey: protoConfig.apiKey,
		requestTimeoutMs: protoConfig.requestTimeoutMs,

		// Plan mode configurations
		planModeApiProvider:
			protoConfig.planModeApiProvider !== undefined
				? convertProtoToApiProvider(protoConfig.planModeApiProvider)
				: undefined,
		planModeApiModelId: protoConfig.planModeApiModelId,
		planModeThinkingBudgetTokens: protoConfig.planModeThinkingBudgetTokens,
		planModeReasoningEffort: protoConfig.planModeReasoningEffort,
		planModeVsCodeLmModelSelector: protoConfig.planModeVsCodeLmModelSelector,
		planModeGroqModelId: protoConfig.planModeGroqModelId,
		planModeGroqModelInfo: convertProtoToModelInfo(protoConfig.planModeGroqModelInfo),
		planModeAnthropicModelId: protoConfig.planModeApiModelId,
		planModeAnthropicModelInfo: convertProtoToModelInfo(protoConfig.planModeGroqModelInfo),

		// Act mode configurations
		actModeApiProvider:
			protoConfig.actModeApiProvider !== undefined ? convertProtoToApiProvider(protoConfig.actModeApiProvider) : undefined,
		actModeApiModelId: protoConfig.actModeApiModelId,
		actModeThinkingBudgetTokens: protoConfig.actModeThinkingBudgetTokens,
		actModeReasoningEffort: protoConfig.actModeReasoningEffort,
		actModeVsCodeLmModelSelector: protoConfig.actModeVsCodeLmModelSelector,
		actModeGroqModelId: protoConfig.actModeGroqModelId,
		actModeGroqModelInfo: convertProtoToModelInfo(protoConfig.actModeGroqModelInfo),
		actModeAnthropicModelId: protoConfig.actModeApiModelId,
		actModeAnthropicModelInfo: convertProtoToModelInfo(protoConfig.actModeGroqModelInfo),

		// Favorited model IDs
		favoritedModelIds:
			protoConfig.favoritedModelIds && protoConfig.favoritedModelIds.length > 0 ? protoConfig.favoritedModelIds : undefined,
	}
}
