import { ApiProvider, ModelInfo } from "@shared/api"
import { ExtensionContext } from "vscode"
import { Controller } from "@/core/controller"
import { AutoApprovalSettings, DEFAULT_AUTO_APPROVAL_SETTINGS } from "@/shared/AutoApprovalSettings"
import { BrowserSettings, DEFAULT_BROWSER_SETTINGS } from "@/shared/BrowserSettings"
import { ClineRulesToggles } from "@/shared/cline-rules"
import { DEFAULT_FOCUS_CHAIN_SETTINGS, FocusChainSettings } from "@/shared/FocusChainSettings"
import { DEFAULT_MCP_DISPLAY_MODE, McpDisplayMode } from "@/shared/McpDisplayMode"
import { Mode, OpenaiReasoningEffort } from "@/shared/storage/types"
import { TelemetrySetting } from "@/shared/TelemetrySetting"
import { UserInfo } from "@/shared/UserInfo"
import { readTaskHistoryFromState } from "../disk"
import { GlobalState, LocalState, SecretKey, Secrets } from "../state-keys"

export async function readSecretsFromDisk(context: ExtensionContext): Promise<Secrets> {
	const [
		apiKey,
		anthropicApiKey,
		openRouterApiKey,
		clineAccountId,
		awsAccessKey,
		awsSecretKey,
		awsSessionToken,
		awsBedrockApiKey,
		openAiApiKey,
		geminiApiKey,
		openAiNativeApiKey,
		deepSeekApiKey,
		requestyApiKey,
		togetherApiKey,
		qwenApiKey,
		doubaoApiKey,
		mistralApiKey,
		fireworksApiKey,
		liteLlmApiKey,
		asksageApiKey,
		xaiApiKey,
		sambanovaApiKey,
		cerebrasApiKey,
		groqApiKey,
		moonshotApiKey,
		nebiusApiKey,
		huggingFaceApiKey,
		falApiKey,
		sapAiCoreClientId,
		sapAiCoreClientSecret,
		huaweiCloudMaasApiKey,
		basetenApiKey,
		zaiApiKey,
		ollamaApiKey,
		vercelAiGatewayApiKey,
		difyApiKey,
		authNonce,
	] = await Promise.all([
		context.secrets.get("apiKey") as Promise<string | undefined>,
		context.secrets.get("anthropicApiKey") as Promise<string | undefined>,
		context.secrets.get("openRouterApiKey") as Promise<string | undefined>,
		context.secrets.get("clineAccountId") as Promise<string | undefined>,
		context.secrets.get("awsAccessKey") as Promise<string | undefined>,
		context.secrets.get("awsSecretKey") as Promise<string | undefined>,
		context.secrets.get("awsSessionToken") as Promise<string | undefined>,
		context.secrets.get("awsBedrockApiKey") as Promise<string | undefined>,
		context.secrets.get("openAiApiKey") as Promise<string | undefined>,
		context.secrets.get("geminiApiKey") as Promise<string | undefined>,
		context.secrets.get("openAiNativeApiKey") as Promise<string | undefined>,
		context.secrets.get("deepSeekApiKey") as Promise<string | undefined>,
		context.secrets.get("requestyApiKey") as Promise<string | undefined>,
		context.secrets.get("togetherApiKey") as Promise<string | undefined>,
		context.secrets.get("qwenApiKey") as Promise<string | undefined>,
		context.secrets.get("doubaoApiKey") as Promise<string | undefined>,
		context.secrets.get("mistralApiKey") as Promise<string | undefined>,
		context.secrets.get("fireworksApiKey") as Promise<string | undefined>,
		context.secrets.get("liteLlmApiKey") as Promise<string | undefined>,
		context.secrets.get("asksageApiKey") as Promise<string | undefined>,
		context.secrets.get("xaiApiKey") as Promise<string | undefined>,
		context.secrets.get("sambanovaApiKey") as Promise<string | undefined>,
		context.secrets.get("cerebrasApiKey") as Promise<string | undefined>,
		context.secrets.get("groqApiKey") as Promise<string | undefined>,
		context.secrets.get("moonshotApiKey") as Promise<string | undefined>,
		context.secrets.get("nebiusApiKey") as Promise<string | undefined>,
		context.secrets.get("huggingFaceApiKey") as Promise<string | undefined>,
		context.secrets.get("falApiKey") as Promise<string | undefined>,
		context.secrets.get("sapAiCoreClientId") as Promise<string | undefined>,
		context.secrets.get("sapAiCoreClientSecret") as Promise<string | undefined>,
		context.secrets.get("huaweiCloudMaasApiKey") as Promise<string | undefined>,
		context.secrets.get("basetenApiKey") as Promise<string | undefined>,
		context.secrets.get("zaiApiKey") as Promise<string | undefined>,
		context.secrets.get("ollamaApiKey") as Promise<string | undefined>,
		context.secrets.get("vercelAiGatewayApiKey") as Promise<string | undefined>,
		context.secrets.get("difyApiKey") as Promise<string | undefined>,
		context.secrets.get("authNonce") as Promise<string | undefined>,
	])

	return {
		authNonce,
		apiKey,
		anthropicApiKey,
		openRouterApiKey,
		clineAccountId,
		huggingFaceApiKey,
		falApiKey,
		huaweiCloudMaasApiKey,
		basetenApiKey,
		zaiApiKey,
		ollamaApiKey,
		vercelAiGatewayApiKey,
		difyApiKey,
		sapAiCoreClientId,
		sapAiCoreClientSecret,
		xaiApiKey,
		sambanovaApiKey,
		cerebrasApiKey,
		groqApiKey,
		moonshotApiKey,
		nebiusApiKey,
		asksageApiKey,
		fireworksApiKey,
		liteLlmApiKey,
		doubaoApiKey,
		mistralApiKey,
		openAiNativeApiKey,
		deepSeekApiKey,
		requestyApiKey,
		togetherApiKey,
		qwenApiKey,
		geminiApiKey,
		openAiApiKey,
		awsBedrockApiKey,
		awsAccessKey,
		awsSecretKey,
		awsSessionToken,
	}
}

export async function readWorkspaceStateFromDisk(context: ExtensionContext): Promise<LocalState> {
	const localClineRulesToggles = context.workspaceState.get("localClineRulesToggles") as ClineRulesToggles | undefined
	const localWindsurfRulesToggles = context.workspaceState.get("localWindsurfRulesToggles") as ClineRulesToggles | undefined
	const localCursorRulesToggles = context.workspaceState.get("localCursorRulesToggles") as ClineRulesToggles | undefined
	const localWorkflowToggles = context.workspaceState.get("workflowToggles") as ClineRulesToggles | undefined

	return {
		localClineRulesToggles: localClineRulesToggles || {},
		localWindsurfRulesToggles: localWindsurfRulesToggles || {},
		localCursorRulesToggles: localCursorRulesToggles || {},
		workflowToggles: localWorkflowToggles || {},
	}
}

export async function readGlobalStateFromDisk(context: ExtensionContext): Promise<GlobalState> {
	try {
		// Get all global state values
		const strictPlanModeEnabled = context.globalState.get("strictPlanModeEnabled") as boolean | undefined
		const useAutoCondense = context.globalState.get("useAutoCondense") as boolean | undefined
		const isNewUser = context.globalState.get("isNewUser") as boolean | undefined
		const welcomeViewCompleted = context.globalState.get("welcomeViewCompleted") as boolean | undefined
		const awsRegion = context.globalState.get("awsRegion") as string | undefined
		const awsUseCrossRegionInference = context.globalState.get("awsUseCrossRegionInference") as boolean | undefined
		const awsBedrockUsePromptCache = context.globalState.get("awsBedrockUsePromptCache") as boolean | undefined
		const awsBedrockEndpoint = context.globalState.get("awsBedrockEndpoint") as string | undefined
		const awsProfile = context.globalState.get("awsProfile") as string | undefined
		const awsUseProfile = context.globalState.get("awsUseProfile") as boolean | undefined
		const awsAuthentication = context.globalState.get("awsAuthentication") as string | undefined
		const vertexProjectId = context.globalState.get("vertexProjectId") as string | undefined
		const vertexRegion = context.globalState.get("vertexRegion") as string | undefined
		const openAiBaseUrl = context.globalState.get("openAiBaseUrl") as string | undefined
		const requestyBaseUrl = context.globalState.get("requestyBaseUrl") as string | undefined
		const openAiHeaders = context.globalState.get("openAiHeaders") as Record<string, string> | undefined
		const ollamaBaseUrl = context.globalState.get("ollamaBaseUrl") as string | undefined
		const ollamaApiOptionsCtxNum = context.globalState.get("ollamaApiOptionsCtxNum") as string | undefined
		const lmStudioBaseUrl = context.globalState.get("lmStudioBaseUrl") as string | undefined
		const lmStudioMaxTokens = context.globalState.get("lmStudioMaxTokens") as string | undefined
		const anthropicBaseUrl = context.globalState.get("anthropicBaseUrl") as string | undefined
		const geminiBaseUrl = context.globalState.get("geminiBaseUrl") as string | undefined
		const azureApiVersion = context.globalState.get("azureApiVersion") as string | undefined
		const openRouterProviderSorting = context.globalState.get("openRouterProviderSorting") as string | undefined
		const lastShownAnnouncementId = context.globalState.get("lastShownAnnouncementId") as string | undefined
		const autoApprovalSettings = context.globalState.get("autoApprovalSettings") as AutoApprovalSettings | undefined
		const browserSettings = context.globalState.get("browserSettings") as BrowserSettings | undefined
		const liteLlmBaseUrl = context.globalState.get("liteLlmBaseUrl") as string | undefined
		const liteLlmUsePromptCache = context.globalState.get("liteLlmUsePromptCache") as boolean | undefined
		const fireworksModelMaxCompletionTokens = context.globalState.get("fireworksModelMaxCompletionTokens") as
			| number
			| undefined
		const fireworksModelMaxTokens = context.globalState.get("fireworksModelMaxTokens") as number | undefined
		const userInfo = context.globalState.get("userInfo") as UserInfo | undefined
		const qwenApiLine = context.globalState.get("qwenApiLine") as string | undefined
		const moonshotApiLine = context.globalState.get("moonshotApiLine") as string | undefined
		const zaiApiLine = context.globalState.get("zaiApiLine") as string | undefined
		const telemetrySetting = context.globalState.get("telemetrySetting") as TelemetrySetting | undefined
		const asksageApiUrl = context.globalState.get("asksageApiUrl") as string | undefined
		const planActSeparateModelsSettingRaw = context.globalState.get("planActSeparateModelsSetting") as boolean | undefined
		const favoritedModelIds = context.globalState.get("favoritedModelIds") as string[] | undefined
		const globalClineRulesToggles = context.globalState.get("globalClineRulesToggles") as ClineRulesToggles | undefined
		const requestTimeoutMs = context.globalState.get("requestTimeoutMs") as number | undefined
		const shellIntegrationTimeout = context.globalState.get("shellIntegrationTimeout") as number | undefined
		const enableCheckpointsSettingRaw = context.globalState.get("enableCheckpointsSetting") as boolean | undefined
		const mcpMarketplaceEnabledRaw = context.globalState.get("mcpMarketplaceEnabled") as boolean | undefined
		const mcpDisplayMode = context.globalState.get("mcpDisplayMode") as McpDisplayMode | undefined
		const mcpResponsesCollapsedRaw = context.globalState.get("mcpResponsesCollapsed") as boolean | undefined
		const globalWorkflowToggles = context.globalState.get("globalWorkflowToggles") as ClineRulesToggles | undefined
		const terminalReuseEnabled = context.globalState.get("terminalReuseEnabled") as boolean | undefined
		const terminalOutputLineLimit = context.globalState.get("terminalOutputLineLimit") as number | undefined
		const defaultTerminalProfile = context.globalState.get("defaultTerminalProfile") as string | undefined
		const sapAiCoreBaseUrl = context.globalState.get("sapAiCoreBaseUrl") as string | undefined
		const sapAiCoreTokenUrl = context.globalState.get("sapAiCoreTokenUrl") as string | undefined
		const sapAiResourceGroup = context.globalState.get("sapAiResourceGroup") as string | undefined
		const claudeCodePath = context.globalState.get("claudeCodePath") as string | undefined
		const difyBaseUrl = context.globalState.get("difyBaseUrl") as string | undefined
		const openaiReasoningEffort = context.globalState.get("openaiReasoningEffort") as OpenaiReasoningEffort | undefined
		const preferredLanguage = context.globalState.get("preferredLanguage") as string | undefined
		const focusChainSettings = context.globalState.get("focusChainSettings") as FocusChainSettings | undefined
		const focusChainFeatureFlagEnabled = context.globalState.get("focusChainFeatureFlagEnabled") as boolean | undefined

		const mcpMarketplaceCatalog = context.globalState.get("mcpMarketplaceCatalog") as GlobalState["mcpMarketplaceCatalog"]
		const qwenCodeOauthPath = context.globalState.get("qwenCodeOauthPath") as GlobalState["qwenCodeOauthPath"]
		const customPrompt = context.globalState.get("customPrompt") as GlobalState["customPrompt"]

		// Get mode-related configurations
		const mode = context.globalState.get("mode") as Mode | undefined

		// Plan mode configurations
		const planModeApiProvider = context.globalState.get("planModeApiProvider") as ApiProvider | undefined
		const planModeApiModelId = context.globalState.get("planModeApiModelId") as string | undefined
		const planModeThinkingBudgetTokens = context.globalState.get("planModeThinkingBudgetTokens") as number | undefined
		const planModeReasoningEffort = context.globalState.get("planModeReasoningEffort") as string | undefined
		const planModeGroqModelId = context.globalState.get("planModeGroqModelId") as string | undefined
		const planModeGroqModelInfo = context.globalState.get("planModeGroqModelInfo") as ModelInfo | undefined
		const planModeOpenRouterModelId = context.globalState.get("planModeOpenRouterModelId") as string | undefined
		const planModeOpenRouterModelInfo = context.globalState.get("planModeOpenRouterModelInfo") as ModelInfo | undefined
		const planModeAnthropicModelId = context.globalState.get("planModeAnthropicModelId") as string | undefined
		const planModeAnthropicModelInfo = context.globalState.get("planModeAnthropicModelInfo") as ModelInfo | undefined // Act mode configurations
		const actModeApiProvider = context.globalState.get("actModeApiProvider") as ApiProvider | undefined
		const actModeApiModelId = context.globalState.get("actModeApiModelId") as string | undefined
		const actModeThinkingBudgetTokens = context.globalState.get("actModeThinkingBudgetTokens") as number | undefined
		const actModeReasoningEffort = context.globalState.get("actModeReasoningEffort") as string | undefined
		const actModeGroqModelId = context.globalState.get("actModeGroqModelId") as string | undefined
		const actModeGroqModelInfo = context.globalState.get("actModeGroqModelInfo") as ModelInfo | undefined
		const actModeOpenRouterModelId = context.globalState.get("actModeOpenRouterModelId") as string | undefined
		const actModeOpenRouterModelInfo = context.globalState.get("actModeOpenRouterModelInfo") as ModelInfo | undefined
		const actModeAnthropicModelId = context.globalState.get("actModeAnthropicModelId") as string | undefined
		const actModeAnthropicModelInfo = context.globalState.get("actModeAnthropicModelInfo") as ModelInfo | undefined
		const sapAiCoreUseOrchestrationMode = context.globalState.get("sapAiCoreUseOrchestrationMode") as boolean | undefined

		let apiProvider: ApiProvider
		if (planModeApiProvider) {
			apiProvider = planModeApiProvider
		} else {
			// New users should default to cline, since they've opted to use an API key instead of signing in
			apiProvider = "cline"
		}

		const mcpResponsesCollapsed = mcpResponsesCollapsedRaw ?? false

		// Plan/Act separate models setting is a boolean indicating whether the user wants to use different models for plan and act. Existing users expect this to be enabled, while we want new users to opt in to this being disabled by default.
		// On win11 state sometimes initializes as empty string instead of undefined
		let planActSeparateModelsSetting: boolean | undefined
		if (planActSeparateModelsSettingRaw === true || planActSeparateModelsSettingRaw === false) {
			planActSeparateModelsSetting = planActSeparateModelsSettingRaw
		} else {
			// default to true for existing users
			if (planModeApiProvider) {
				planActSeparateModelsSetting = true
			} else {
				// default to false for new users
				planActSeparateModelsSetting = false
			}
		}

		const taskHistory = await readTaskHistoryFromState(context)

		// Multi-root workspace support
		const workspaceRoots = context.globalState.get<GlobalState["workspaceRoots"]>("workspaceRoots")
		/**
		 * Get primary root index from global state.
		 * The primary root is the main workspace folder that Cline focuses on when dealing with
		 * multi-root workspaces. In VS Code, you can have multiple folders open in one workspace,
		 * and the primary root index indicates which folder (by its position in the array, 0-based)
		 * should be treated as the main/default working directory for operations.
		 */
		const primaryRootIndex = context.globalState.get<GlobalState["primaryRootIndex"]>("primaryRootIndex")
		const multiRootEnabled = context.globalState.get<GlobalState["multiRootEnabled"]>("multiRootEnabled")

		return {
			// api configuration fields
			claudeCodePath,
			awsRegion,
			awsUseCrossRegionInference,
			awsBedrockUsePromptCache,
			awsBedrockEndpoint,
			awsProfile,
			awsUseProfile,
			awsAuthentication,
			vertexProjectId,
			vertexRegion,
			openAiBaseUrl,
			requestyBaseUrl,
			openAiHeaders: openAiHeaders || {},
			ollamaBaseUrl,
			ollamaApiOptionsCtxNum,
			lmStudioBaseUrl,
			lmStudioMaxTokens,
			anthropicBaseUrl,
			geminiBaseUrl,
			qwenApiLine,
			moonshotApiLine,
			zaiApiLine,
			azureApiVersion,
			openRouterProviderSorting,
			liteLlmBaseUrl,
			liteLlmUsePromptCache,
			fireworksModelMaxCompletionTokens,
			fireworksModelMaxTokens,
			asksageApiUrl,
			favoritedModelIds,
			requestTimeoutMs,
			sapAiCoreBaseUrl,
			sapAiCoreTokenUrl,
			sapAiResourceGroup,
			difyBaseUrl,
			sapAiCoreUseOrchestrationMode,
			autoRetryOnEmptyAssistantMessage: context.globalState.get("autoRetryOnEmptyAssistantMessage") as boolean | undefined,
			// Plan mode configurations
			planModeApiProvider: planModeApiProvider || apiProvider,
			planModeApiModelId,
			planModeThinkingBudgetTokens,
			planModeReasoningEffort,
			planModeGroqModelId,
			planModeGroqModelInfo,
			planModeOpenRouterModelId,
			planModeOpenRouterModelInfo,
			planModeAnthropicModelId,
			planModeAnthropicModelInfo, // Act mode configurations
			actModeApiProvider: actModeApiProvider || apiProvider,
			actModeApiModelId,
			actModeThinkingBudgetTokens,
			actModeReasoningEffort,
			actModeGroqModelId,
			actModeGroqModelInfo,
			actModeOpenRouterModelId,
			actModeOpenRouterModelInfo,
			actModeAnthropicModelId,
			actModeAnthropicModelInfo,
			// Other global fields
			focusChainSettings: focusChainSettings || DEFAULT_FOCUS_CHAIN_SETTINGS,
			focusChainFeatureFlagEnabled: focusChainFeatureFlagEnabled ?? false,
			strictPlanModeEnabled: strictPlanModeEnabled ?? true,
			useAutoCondense: useAutoCondense ?? false,
			isNewUser: isNewUser ?? true,
			welcomeViewCompleted,
			lastShownAnnouncementId,
			taskHistory: taskHistory || [],
			autoApprovalSettings: autoApprovalSettings || DEFAULT_AUTO_APPROVAL_SETTINGS, // default value can be 0 or empty string
			globalClineRulesToggles: globalClineRulesToggles || {},
			browserSettings: { ...DEFAULT_BROWSER_SETTINGS, ...browserSettings }, // this will ensure that older versions of browserSettings (e.g. before remoteBrowserEnabled was added) are merged with the default values (false for remoteBrowserEnabled)
			preferredLanguage: preferredLanguage || "English",
			openaiReasoningEffort: (openaiReasoningEffort as OpenaiReasoningEffort) || "medium",
			mode: mode || "act",
			userInfo,
			mcpMarketplaceEnabled: mcpMarketplaceEnabledRaw ?? true,
			mcpDisplayMode: mcpDisplayMode ?? DEFAULT_MCP_DISPLAY_MODE,
			mcpResponsesCollapsed: mcpResponsesCollapsed,
			telemetrySetting: telemetrySetting || "unset",
			planActSeparateModelsSetting,
			enableCheckpointsSetting: enableCheckpointsSettingRaw ?? true,
			shellIntegrationTimeout: shellIntegrationTimeout || 4000,
			terminalReuseEnabled: terminalReuseEnabled ?? true,
			terminalOutputLineLimit: terminalOutputLineLimit ?? 500,
			defaultTerminalProfile: defaultTerminalProfile ?? "default",
			globalWorkflowToggles: globalWorkflowToggles || {},
			mcpMarketplaceCatalog,
			qwenCodeOauthPath,
			customPrompt,
			// Multi-root workspace support
			workspaceRoots,
			primaryRootIndex: primaryRootIndex ?? 0,
			// Feature flag - defaults to false
			// For now, always return false to disable multi-root support by default
			multiRootEnabled: multiRootEnabled ?? false,
		}
	} catch (error) {
		console.error("[StateHelpers] Failed to read global state:", error)
		throw error
	}
}

export async function resetWorkspaceState(controller: Controller) {
	const context = controller.context
	await Promise.all(context.workspaceState.keys().map((key) => controller.context.workspaceState.update(key, undefined)))

	await controller.stateManager.reInitialize()
}

export async function resetGlobalState(controller: Controller) {
	// TODO: Reset all workspace states?
	const context = controller.context

	await Promise.all(context.globalState.keys().map((key) => context.globalState.update(key, undefined)))
	const secretKeys: SecretKey[] = [
		"apiKey",
		"openRouterApiKey",
		"awsAccessKey",
		"awsSecretKey",
		"awsSessionToken",
		"awsBedrockApiKey",
		"openAiApiKey",
		"ollamaApiKey",
		"geminiApiKey",
		"openAiNativeApiKey",
		"deepSeekApiKey",
		"requestyApiKey",
		"togetherApiKey",
		"qwenApiKey",
		"doubaoApiKey",
		"mistralApiKey",
		"clineAccountId",
		"liteLlmApiKey",
		"fireworksApiKey",
		"asksageApiKey",
		"xaiApiKey",
		"sambanovaApiKey",
		"cerebrasApiKey",
		"groqApiKey",
		"basetenApiKey",
		"moonshotApiKey",
		"nebiusApiKey",
		"huggingFaceApiKey",
		"falApiKey",
		"huaweiCloudMaasApiKey",
		"vercelAiGatewayApiKey",
		"zaiApiKey",
		"difyApiKey",
	]
	await Promise.all(secretKeys.map((key) => context.secrets.delete(key)))
	await controller.stateManager.reInitialize()
}
