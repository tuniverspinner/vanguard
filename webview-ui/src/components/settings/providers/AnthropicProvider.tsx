import { Mode } from "@shared/storage/types"
import { useExtensionState } from "@/context/ExtensionStateContext"
import AnthropicModelPicker from "../AnthropicModelPicker"
import { ApiKeyField } from "../common/ApiKeyField"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

/**
 * Props for the AnthropicProvider component
 */
interface AnthropicProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

/**
 * The Anthropic provider configuration component
 */
export const AnthropicProvider = ({ showModelOptions, isPopup, currentMode }: AnthropicProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange } = useApiConfigurationHandlers()

	return (
		<div>
			<ApiKeyField
				initialValue={apiConfiguration?.anthropicApiKey || ""}
				onChange={(value) => handleFieldChange("anthropicApiKey", value)}
				providerName="Anthropic"
				signupUrl="https://console.anthropic.com/"
			/>

			{showModelOptions && <AnthropicModelPicker currentMode={currentMode} isPopup={isPopup} />}
		</div>
	)
}
