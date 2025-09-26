import { KeyValuePair } from "@shared/proto/cline/common"
import { VSCodeButton, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { useCallback, useState } from "react"
import { UiServiceClient } from "@/services/grpc-client"
import Section from "../Section"

interface KeysSectionProps {
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

const KeysSection = ({ renderSectionHeader }: KeysSectionProps) => {
	const [huggingFaceKey, setHuggingFaceKey] = useState("")
	const [isSaving, setIsSaving] = useState(false)
	const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")

	const handleSaveKey = useCallback(async () => {
		if (!huggingFaceKey.trim()) {
			setSaveStatus("error")
			return
		}

		setIsSaving(true)
		setSaveStatus("idle")

		try {
			await UiServiceClient.saveApiKey(
				KeyValuePair.create({
					key: "huggingFaceApiKey",
					value: huggingFaceKey,
				}),
			)
			setSaveStatus("success")
			setHuggingFaceKey("")
		} catch (error) {
			console.error("Failed to save API key:", error)
			setSaveStatus("error")
		} finally {
			setIsSaving(false)
		}
	}, [huggingFaceKey])

	return (
		<div>
			{renderSectionHeader("keys")}
			<Section>
				<div className="space-y-4">
					<div>
						<h4 className="text-sm font-medium text-[var(--vscode-foreground)] mb-2">Hugging Face API Key</h4>
						<p className="text-xs text-[var(--vscode-descriptionForeground)] mb-3">
							Required for text-to-speech functionality. Get your API key from{" "}
							<a
								className="text-[var(--vscode-textLink-foreground)] hover:underline"
								href="https://huggingface.co/settings/tokens"
								rel="noopener noreferrer"
								target="_blank">
								Hugging Face Settings
							</a>
						</p>

						<div className="flex gap-2 items-end">
							<VSCodeTextField
								className="flex-1"
								onChange={(e: any) => setHuggingFaceKey(e.target.value)}
								placeholder="hf_..."
								type="password"
								value={huggingFaceKey}>
								API Key
							</VSCodeTextField>
							<VSCodeButton
								appearance="primary"
								disabled={isSaving || !huggingFaceKey.trim()}
								onClick={handleSaveKey}>
								{isSaving ? "Saving..." : "Save"}
							</VSCodeButton>
						</div>

						{saveStatus === "success" && (
							<p className="text-xs text-green-600 mt-2">✅ API key saved successfully!</p>
						)}

						{saveStatus === "error" && (
							<p className="text-xs text-red-600 mt-2">❌ Failed to save API key. Please try again.</p>
						)}
					</div>

					<div className="border-t border-[var(--vscode-panel-border)] pt-4">
						<h4 className="text-sm font-medium text-[var(--vscode-foreground)] mb-2">Security Note</h4>
						<p className="text-xs text-[var(--vscode-descriptionForeground)]">
							API keys are stored securely in VSCode's secret storage and are never transmitted unencrypted. They
							are only used to authenticate with the respective AI service providers.
						</p>
					</div>
				</div>
			</Section>
		</div>
	)
}

export default KeysSection
