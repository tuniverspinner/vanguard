// Placeholder types for removed providers to maintain compatibility
export type BedrockModelId = string
export type LiteLLMModelInfo = any
export type AnthropicModelId = string
export type ClaudeCodeModelId = string
export type VertexModelId = string
export type GeminiModelId = string
export type OpenAiNativeModelId = string
export type DeepSeekModelId = string
export type QwenModelId = string
export type QwenCodeModelId = string
export type DoubaoModelId = string
export type MistralModelId = string
export type OpenAiModelId = string
export type OllamaModelId = string
export type LmStudioModelId = string
export type VscodeLmModelId = string
export type LiteLlmModelId = string
export type MoonshotModelId = string
export type HuggingFaceModelId = string
export type NebiusModelId = string
export type FireworksModelId = string
export type AskSageModelId = string
export type SambanovaModelId = string
export type CerebrasModelId = string
export type BasetenModelId = string
export type VercelAIGatewayModelId = string
export type SapAiCoreModelId = string
export type HuaweiCloudMaasModelId = string
export type ZAiModelId = string
export type DifyModelId = string

// Empty model objects for compatibility
export const anthropicModels = {} as Record<string, ModelInfo>
export const claudeCodeModels = {} as Record<string, ModelInfo>
export const bedrockModels = {} as Record<string, ModelInfo>
export const vertexModels = {} as Record<string, ModelInfo>
export const geminiModels = {} as Record<string, ModelInfo>
export const openAiNativeModels = {} as Record<string, ModelInfo>
export const deepSeekModels = {} as Record<string, ModelInfo>
export const internationalQwenModels = {} as Record<string, ModelInfo>
export const mainlandQwenModels = {} as Record<string, ModelInfo>
export const qwenCodeModels = {} as Record<string, ModelInfo>
export const doubaoModels = {} as Record<string, ModelInfo>
export const mistralModels = {} as Record<string, ModelInfo>
export const openAiModels = {} as Record<string, ModelInfo>
export const ollamaModels = {} as Record<string, ModelInfo>
export const lmStudioModels = {} as Record<string, ModelInfo>
export const vscodeLmModels = {} as Record<string, ModelInfo>
export const liteLlmModels = {} as Record<string, ModelInfo>
export const moonshotModels = {} as Record<string, ModelInfo>
export const huggingFaceModels = {} as Record<string, ModelInfo>
export const nebiusModels = {} as Record<string, ModelInfo>
export const fireworksModels = {} as Record<string, ModelInfo>
export const askSageModels = {} as Record<string, ModelInfo>
export const sambanovaModels = {} as Record<string, ModelInfo>
export const cerebrasModels = {} as Record<string, ModelInfo>
export const basetenModels = {} as Record<string, ModelInfo>
export const vercelAiGatewayModels = {} as Record<string, ModelInfo>
export const sapAiCoreModels = {} as Record<string, ModelInfo>
export const huaweiCloudMaasModels = {} as Record<string, ModelInfo>
export const internationalZAiModels = {} as Record<string, ModelInfo>
export const mainlandZAiModels = {} as Record<string, ModelInfo>
export const difyModels = {} as Record<string, ModelInfo>

// Default model IDs (empty strings for compatibility)
export const anthropicDefaultModelId = ""
export const claudeCodeDefaultModelId = ""
export const bedrockDefaultModelId = ""
export const vertexDefaultModelId = ""
export const geminiDefaultModelId = ""
export const openAiNativeDefaultModelId = ""
export const deepSeekDefaultModelId = ""
export const internationalQwenDefaultModelId = ""
export const mainlandQwenDefaultModelId = ""
export const qwenCodeDefaultModelId = ""
export const doubaoDefaultModelId = ""
export const mistralDefaultModelId = ""
export const openAiDefaultModelId = ""
export const ollamaDefaultModelId = ""
export const lmStudioDefaultModelId = ""
export const vscodeLmDefaultModelId = ""
export const liteLlmDefaultModelId = ""
export const moonshotDefaultModelId = ""
export const huggingFaceDefaultModelId = ""
export const nebiusDefaultModelId = ""
export const fireworksDefaultModelId = ""
export const askSageDefaultModelId = ""
export const sambanovaDefaultModelId = ""
export const cerebrasDefaultModelId = ""
export const basetenDefaultModelId = ""
export const vercelAiGatewayDefaultModelId = ""
export const sapAiCoreDefaultModelId = ""
export const huaweiCloudMaasDefaultModelId = ""
export const internationalZAiDefaultModelId = ""
export const mainlandZAiDefaultModelId = ""
export const difyDefaultModelId = ""

// Other constants
export const CLAUDE_SONNET_4_1M_SUFFIX = ":1m"
export const CLAUDE_SONNET_4_1M_TIERS = []
export const azureOpenAiDefaultApiVersion = "2024-08-01-preview"
export const openRouterDefaultModelId = "x-ai/grok-code-fast-1"
export const openRouterClaudeSonnet41mModelId = ""
export const openRouterDefaultModelInfo: ModelInfo = {
	maxTokens: 8192,
	contextWindow: 256000,
	supportsImages: true,
	supportsPromptCache: true,
	inputPrice: 0.2,
	cacheReadsPrice: 0.02,
	outputPrice: 1.5,
	description: "Grok Code Fast 1 is a speedy and economical reasoning model that excels at agentic coding.",
}
export const requestyDefaultModelId = ""
export const requestyDefaultModelInfo = {} as ModelInfo
export const liteLlmModelInfoSaneDefaults = {} as any
export const openAiModelInfoSaneDefaults = {} as OpenAiCompatibleModelInfo
export const vertexGlobalModels = {} as Record<string, ModelInfo>
export const QwenApiRegions = { CHINA: "china", INTERNATIONAL: "international" } as const

import type { LanguageModelChatSelector } from "../core/api/providers/types"

export type ApiProvider = "cline" | "xai" | "groq"

export interface ApiHandlerOptions {
	// Global configuration (not mode-specific)
	clineAccountId?: string
	ulid?: string // Used to identify the task in API requests
	xaiApiKey?: string
	groqApiKey?: string
	openRouterProviderSorting?: string
	requestTimeoutMs?: number
	onRetryAttempt?: (attempt: number, maxRetries: number, delay: number, error: any) => void
	// Plan mode configurations
	planModeApiModelId?: string
	planModeThinkingBudgetTokens?: number
	planModeReasoningEffort?: string
	planModeVsCodeLmModelSelector?: LanguageModelChatSelector
	planModeGroqModelId?: string
	planModeGroqModelInfo?: ModelInfo
	planModeOpenRouterModelId?: string
	planModeOpenRouterModelInfo?: ModelInfo
	// Act mode configurations
	actModeApiModelId?: string
	actModeThinkingBudgetTokens?: number
	actModeReasoningEffort?: string
	actModeVsCodeLmModelSelector?: LanguageModelChatSelector
	actModeGroqModelId?: string
	actModeGroqModelInfo?: ModelInfo
	actModeOpenRouterModelId?: string
	actModeOpenRouterModelInfo?: ModelInfo
}

export type ApiConfiguration = ApiHandlerOptions & {
	planModeApiProvider?: ApiProvider
	actModeApiProvider?: ApiProvider
	favoritedModelIds?: string[]
}

// Models

interface PriceTier {
	tokenLimit: number // Upper limit (inclusive) of *input* tokens for this price. Use Infinity for the highest tier.
	price: number // Price per million tokens for this tier.
}

export interface ModelInfo {
	maxTokens?: number
	contextWindow?: number
	supportsImages?: boolean
	supportsPromptCache: boolean // this value is hardcoded for now
	inputPrice?: number // Keep for non-tiered input models
	outputPrice?: number // Keep for non-tiered output models
	thinkingConfig?: {
		maxBudget?: number // Max allowed thinking budget tokens
		outputPrice?: number // Output price per million tokens when budget > 0
		outputPriceTiers?: PriceTier[] // Optional: Tiered output price when budget > 0
	}
	supportsGlobalEndpoint?: boolean // Whether the model supports a global endpoint with Vertex AI
	cacheWritesPrice?: number
	cacheReadsPrice?: number
	description?: string
	tiers?: {
		contextWindow: number
		inputPrice?: number
		outputPrice?: number
		cacheWritesPrice?: number
		cacheReadsPrice?: number
	}[]
}

export interface OpenAiCompatibleModelInfo extends ModelInfo {
	temperature?: number
	isR1FormatRequired?: boolean
}

// Cline custom model - sonic (same config as grok-4)
export const clineMicrowaveAlphaModelInfo: ModelInfo = {
	contextWindow: 262144,
	supportsImages: false,
	supportsPromptCache: true,
	inputPrice: 0,
	outputPrice: 0,
	cacheReadsPrice: 0,
	cacheWritesPrice: 0, // Not specified in grok-4, setting to 0
	description: "Cline Microwave Alpha - Advanced model for complex coding tasks with large context window",
}

// Groq
// https://console.groq.com/docs/models
// https://groq.com/pricing/
export type GroqModelId = keyof typeof groqModels
export const groqDefaultModelId: GroqModelId = "moonshotai/kimi-k2-instruct-0905"
export const groqModels = {
	"openai/gpt-oss-120b": {
		maxTokens: 32766, // Model fails if you try to use more than 32K tokens
		contextWindow: 131_072,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0.15,
		outputPrice: 0.75,
		description:
			"A state-of-the-art 120B open-weight Mixture-of-Experts language model optimized for strong reasoning, tool use, and efficient deployment on large GPUs",
	},
	"openai/gpt-oss-20b": {
		maxTokens: 32766, // Model fails if you try to use more than 32K tokens
		contextWindow: 131_072,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0.1,
		outputPrice: 0.5,
		description:
			"A compact 20B open-weight Mixture-of-Experts language model designed for strong reasoning and tool use, ideal for edge devices and local inference.",
	},
	// Compound Beta Models - Hybrid architectures optimized for tool use
	"compound-beta": {
		maxTokens: 8192,
		contextWindow: 128000,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0.0,
		outputPrice: 0.0,
		description:
			"Compound model using Llama 4 Scout for core reasoning with Llama 3.3 70B for routing and tool use. Excellent for plan/act workflows.",
	},
	"compound-beta-mini": {
		maxTokens: 8192,
		contextWindow: 128000,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0.0,
		outputPrice: 0.0,
		description: "Lightweight compound model for faster inference while maintaining tool use capabilities.",
	},
	// DeepSeek Models - Reasoning-optimized
	"deepseek-r1-distill-llama-70b": {
		maxTokens: 131072,
		contextWindow: 131072,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0.75,
		outputPrice: 0.99,
		description:
			"DeepSeek R1 reasoning capabilities distilled into Llama 70B architecture. Excellent for complex problem-solving and planning.",
	},
	// Llama 4 Models
	"meta-llama/llama-4-maverick-17b-128e-instruct": {
		maxTokens: 8192,
		contextWindow: 131072,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 0.2,
		outputPrice: 0.6,
		description: "Meta's Llama 4 Maverick 17B model with 128 experts, supports vision and multimodal tasks.",
	},
	"meta-llama/llama-4-scout-17b-16e-instruct": {
		maxTokens: 8192,
		contextWindow: 131072,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 0.11,
		outputPrice: 0.34,
		description: "Meta's Llama 4 Scout 17B model with 16 experts, optimized for fast inference and general tasks.",
	},
	// Llama 3.3 Models
	"llama-3.3-70b-versatile": {
		maxTokens: 32768,
		contextWindow: 131072,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0.59,
		outputPrice: 0.79,
		description: "Meta's latest Llama 3.3 70B model optimized for versatile use cases with excellent performance and speed.",
	},
	// Llama 3.1 Models - Fast inference
	"llama-3.1-8b-instant": {
		maxTokens: 131072,
		contextWindow: 131072,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0.05,
		outputPrice: 0.08,
		description: "Fast and efficient Llama 3.1 8B model optimized for speed, low latency, and reliable tool execution.",
	},
	// Moonshot Models
	"moonshotai/kimi-k2-instruct": {
		maxTokens: 16384,
		contextWindow: 131072,
		supportsImages: false,
		supportsPromptCache: true,
		inputPrice: 1.0,
		outputPrice: 3.0,
		cacheReadsPrice: 0.5, // 50% discount for cached input tokens
		description:
			"Kimi K2 is Moonshot AI's state-of-the-art Mixture-of-Experts (MoE) language model with 1 trillion total parameters and 32 billion activated parameters. Trained with the Muon optimizer, Kimi K2 achieves exceptional performance across frontier knowledge, reasoning, and coding tasks while being meticulously optimized for agentic capabilities.",
	},
	"moonshotai/kimi-k2-instruct-0905": {
		maxTokens: 16384,
		contextWindow: 262144,
		supportsImages: false,
		supportsPromptCache: true,
		inputPrice: 0.6,
		outputPrice: 2.5,
		cacheReadsPrice: 0.15,
		description:
			"Kimi K2 model gets a new version update: Agentic coding: more accurate, better generalization across scaffolds. Frontend coding: improved aesthetics and functionalities on web, 3d, and other tasks. Context length: extended from 128k to 256k, providing better long-horizon support.",
	},
} as const satisfies Record<string, ModelInfo>

// X AI
// https://docs.x.ai/docs/api-reference
export type XAIModelId = keyof typeof xaiModels
export const xaiDefaultModelId: XAIModelId = "grok-4"
export const xaiModels = {
	"grok-4": {
		maxTokens: 8192,
		contextWindow: 262144,
		supportsImages: true,
		supportsPromptCache: true,
		inputPrice: 3.0, // will have different pricing for long context vs short context
		cacheReadsPrice: 0.75,
		outputPrice: 15.0,
	},
	"grok-3-beta": {
		maxTokens: 8192,
		contextWindow: 131072,
		supportsImages: false,
		supportsPromptCache: true,
		inputPrice: 3.0,
		outputPrice: 15.0,
		description: "X AI's Grok-3 beta model with 131K context window",
	},
	"grok-3-fast-beta": {
		maxTokens: 8192,
		contextWindow: 131072,
		supportsImages: false,
		supportsPromptCache: true,
		inputPrice: 5.0,
		outputPrice: 25.0,
		description: "X AI's Grok-3 fast beta model with 131K context window",
	},
	"grok-3-mini-beta": {
		maxTokens: 8192,
		contextWindow: 131072,
		supportsImages: false,
		supportsPromptCache: true,
		inputPrice: 0.3,
		outputPrice: 0.5,
		description: "X AI's Grok-3 mini beta model with 131K context window",
	},
	"grok-3-mini-fast-beta": {
		maxTokens: 8192,
		contextWindow: 131072,
		supportsImages: false,
		supportsPromptCache: true,
		inputPrice: 0.6,
		outputPrice: 4.0,
		description: "X AI's Grok-3 mini fast beta model with 131K context window",
	},
	"grok-3": {
		maxTokens: 8192,
		contextWindow: 131072,
		supportsImages: false,
		supportsPromptCache: true,
		inputPrice: 3.0,
		outputPrice: 15.0,
		description: "X AI's Grok-3 model with 131K context window",
	},
	"grok-3-fast": {
		maxTokens: 8192,
		contextWindow: 131072,
		supportsImages: false,
		supportsPromptCache: true,
		inputPrice: 5.0,
		outputPrice: 25.0,
		description: "X AI's Grok-3 fast model with 131K context window",
	},
	"grok-3-mini": {
		maxTokens: 8192,
		contextWindow: 131072,
		supportsImages: false,
		supportsPromptCache: true,
		inputPrice: 0.3,
		outputPrice: 0.5,
		description: "X AI's Grok-3 mini model with 131K context window",
	},
	"grok-3-mini-fast": {
		maxTokens: 8192,
		contextWindow: 131072,
		supportsImages: false,
		supportsPromptCache: true,
		inputPrice: 0.6,
		outputPrice: 4.0,
		description: "X AI's Grok-3 mini fast model with 131K context window",
	},
	"grok-2-latest": {
		maxTokens: 8192,
		contextWindow: 131072,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 2.0,
		outputPrice: 10.0,
		description: "X AI's Grok-2 model - latest version with 131K context window",
	},
	"grok-2": {
		maxTokens: 8192,
		contextWindow: 131072,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 2.0,
		outputPrice: 10.0,
		description: "X AI's Grok-2 model with 131K context window",
	},
	"grok-2-1212": {
		maxTokens: 8192,
		contextWindow: 131072,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 2.0,
		outputPrice: 10.0,
		description: "X AI's Grok-2 model (version 1212) with 131K context window",
	},
	"grok-2-vision-latest": {
		maxTokens: 8192,
		contextWindow: 32768,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 2.0,
		outputPrice: 10.0,
		description: "X AI's Grok-2 Vision model - latest version with image support and 32K context window",
	},
	"grok-2-vision": {
		maxTokens: 8192,
		contextWindow: 32768,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 2.0,
		outputPrice: 10.0,
		description: "X AI's Grok-2 Vision model with image support and 32K context window",
	},
	"grok-2-vision-1212": {
		maxTokens: 8192,
		contextWindow: 32768,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 2.0,
		outputPrice: 10.0,
		description: "X AI's Grok-2 Vision model (version 1212) with image support and 32K context window",
	},
	"grok-vision-beta": {
		maxTokens: 8192,
		contextWindow: 8192,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 5.0,
		outputPrice: 15.0,
		description: "X AI's Grok Vision Beta model with image support and 8K context window",
	},
	"grok-beta": {
		maxTokens: 8192,
		contextWindow: 131072,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 5.0,
		outputPrice: 15.0,
		description: "X AI's Grok Beta model (legacy) with 131K context window",
	},
} as const satisfies Record<string, ModelInfo>
