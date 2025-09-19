import { ApiProvider, ModelInfo } from "@shared/api"
import { FocusChainSettings } from "@shared/FocusChainSettings"
import { WorkspaceRoot } from "@/core/workspace/WorkspaceRoot"
import { AutoApprovalSettings } from "@/shared/AutoApprovalSettings"
import { BrowserSettings } from "@/shared/BrowserSettings"
import { ClineRulesToggles } from "@/shared/cline-rules"
import { HistoryItem } from "@/shared/HistoryItem"
import { McpDisplayMode } from "@/shared/McpDisplayMode"
import { McpMarketplaceCatalog } from "@/shared/mcp"
import { Mode, OpenaiReasoningEffort } from "@/shared/storage/types"
import { TelemetrySetting } from "@/shared/TelemetrySetting"
import { UserInfo } from "@/shared/UserInfo"

export type SecretKey = keyof Secrets

export type GlobalStateKey = keyof GlobalState

export type LocalStateKey = keyof LocalState

export interface GlobalState {
	awsRegion: string | undefined
	awsUseCrossRegionInference: boolean | undefined
	awsBedrockUsePromptCache: boolean | undefined
	awsBedrockEndpoint: string | undefined
	awsProfile: string | undefined
	awsAuthentication: string | undefined
	awsUseProfile: boolean | undefined
	vertexProjectId: string | undefined
	vertexRegion: string | undefined
	lastShownAnnouncementId: string | undefined
	taskHistory: HistoryItem[]
	requestyBaseUrl: string | undefined
	openAiBaseUrl: string | undefined
	openAiHeaders: Record<string, string>
	ollamaBaseUrl: string | undefined
	ollamaApiOptionsCtxNum: string | undefined
	lmStudioBaseUrl: string | undefined
	lmStudioMaxTokens: string | undefined
	anthropicBaseUrl: string | undefined
	geminiBaseUrl: string | undefined
	azureApiVersion: string | undefined
	openRouterProviderSorting: string | undefined
	autoApprovalSettings: AutoApprovalSettings
	globalClineRulesToggles: ClineRulesToggles
	globalWorkflowToggles: ClineRulesToggles
	browserSettings: BrowserSettings
	userInfo: UserInfo | undefined
	liteLlmBaseUrl: string | undefined
	liteLlmUsePromptCache: boolean | undefined
	fireworksModelMaxCompletionTokens: number | undefined
	fireworksModelMaxTokens: number | undefined
	qwenApiLine: string | undefined
	moonshotApiLine: string | undefined
	zaiApiLine: string | undefined
	mcpMarketplaceCatalog: McpMarketplaceCatalog | undefined
	telemetrySetting: TelemetrySetting
	asksageApiUrl: string | undefined
	planActSeparateModelsSetting: boolean
	enableCheckpointsSetting: boolean
	mcpMarketplaceEnabled: boolean
	favoritedModelIds: string[] | undefined
	requestTimeoutMs: number | undefined
	shellIntegrationTimeout: number
	mcpResponsesCollapsed: boolean
	terminalReuseEnabled: boolean
	defaultTerminalProfile: string
	isNewUser: boolean
	welcomeViewCompleted: boolean | undefined
	terminalOutputLineLimit: number
	mcpDisplayMode: McpDisplayMode
	sapAiCoreTokenUrl: string | undefined
	sapAiCoreBaseUrl: string | undefined
	sapAiResourceGroup: string | undefined
	sapAiCoreUseOrchestrationMode: boolean | undefined
	claudeCodePath: string | undefined
	qwenCodeOauthPath: string | undefined
	strictPlanModeEnabled: boolean
	useAutoCondense: boolean
	preferredLanguage: string
	openaiReasoningEffort: OpenaiReasoningEffort
	mode: Mode
	focusChainSettings: FocusChainSettings
	focusChainFeatureFlagEnabled: boolean
	customPrompt: "compact" | undefined
	difyBaseUrl: string | undefined
	autoRetryOnEmptyAssistantMessage: boolean | undefined

	// Multi-root workspace support
	workspaceRoots: WorkspaceRoot[] | undefined
	primaryRootIndex: number
	multiRootEnabled: boolean

	// Plan mode configurations
	planModeApiProvider: ApiProvider
	planModeApiModelId: string | undefined
	planModeThinkingBudgetTokens: number | undefined
	planModeReasoningEffort: string | undefined
	planModeGroqModelId: string | undefined
	planModeGroqModelInfo: ModelInfo | undefined
	planModeOpenRouterModelId: string | undefined
	planModeOpenRouterModelInfo: ModelInfo | undefined
	// Act mode configurations
	actModeApiProvider: ApiProvider
	actModeApiModelId: string | undefined
	actModeThinkingBudgetTokens: number | undefined
	actModeReasoningEffort: string | undefined
	actModeGroqModelId: string | undefined
	actModeGroqModelInfo: ModelInfo | undefined
	actModeOpenRouterModelId: string | undefined
	actModeOpenRouterModelInfo: ModelInfo | undefined
}

export interface Secrets {
	apiKey: string | undefined
	clineAccountId: string | undefined
	openRouterApiKey: string | undefined
	awsAccessKey: string | undefined
	awsSecretKey: string | undefined
	awsSessionToken: string | undefined
	awsBedrockApiKey: string | undefined
	openAiApiKey: string | undefined
	geminiApiKey: string | undefined
	openAiNativeApiKey: string | undefined
	ollamaApiKey: string | undefined
	deepSeekApiKey: string | undefined
	requestyApiKey: string | undefined
	togetherApiKey: string | undefined
	fireworksApiKey: string | undefined
	qwenApiKey: string | undefined
	doubaoApiKey: string | undefined
	mistralApiKey: string | undefined
	liteLlmApiKey: string | undefined
	authNonce: string | undefined
	asksageApiKey: string | undefined
	xaiApiKey: string | undefined
	moonshotApiKey: string | undefined
	zaiApiKey: string | undefined
	huggingFaceApiKey: string | undefined
	nebiusApiKey: string | undefined
	sambanovaApiKey: string | undefined
	cerebrasApiKey: string | undefined
	sapAiCoreClientId: string | undefined
	sapAiCoreClientSecret: string | undefined
	groqApiKey: string | undefined
	huaweiCloudMaasApiKey: string | undefined
	basetenApiKey: string | undefined
	vercelAiGatewayApiKey: string | undefined
	difyApiKey: string | undefined
}

export interface LocalState {
	localClineRulesToggles: ClineRulesToggles
	localCursorRulesToggles: ClineRulesToggles
	localWindsurfRulesToggles: ClineRulesToggles
	workflowToggles: ClineRulesToggles
}
