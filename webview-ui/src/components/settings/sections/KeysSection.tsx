import { KeyValuePair } from "@shared/proto/cline/common"
import { VSCodeButton, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { useCallback, useState } from "react"
import { UiServiceClient } from "@/services/grpc-client"
import Section from "../Section"

interface KeysSectionProps {
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

const KeysSection = ({ renderSectionHeader }: KeysSectionProps) => {
	const [falApiKey, setFalApiKey] = useState("")
	const [isSaving, setIsSaving] = useState(false)
	const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")

	const handleSaveKey = useCallback(async () => {
		if (!falApiKey.trim()) {
			setSaveStatus("error")
			return
		}

		setIsSaving(true)
		setSaveStatus("idle")

		try {
			await UiServiceClient.saveApiKey(
				KeyValuePair.create({
					key: "falApiKey",
					value: falApiKey,
				}),
			)
			setSaveStatus("success")
			setFalApiKey("")
		} catch (error) {
			console.error("Failed to save API key:", error)
			setSaveStatus("error")
		} finally {
			setIsSaving(false)
		}
	}, [falApiKey])

	return (
		<div>
			{renderSectionHeader("keys")}
			<Section>
				<div className="space-y-4">
					<div>
						<h4 className="text-sm font-medium text-[var(--vscode-foreground)] mb-2">Fal.ai API Key</h4>
						<p className="text-xs text-[var(--vscode-descriptionForeground)] mb-3">
							Required for text-to-speech functionality. Get your API key from{" "}
							<a
								className="text-[var(--vscode-textLink-foreground)] hover:underline"
								href="https://fal.ai/dashboard/keys"
								rel="noopener noreferrer"
								target="_blank">
								Fal.ai Dashboard
							</a>
						</p>

						<div className="flex gap-2 items-end">
							<VSCodeTextField
								className="flex-1"
								onChange={(e: any) => setFalApiKey(e.target.value)}
								placeholder="9647ee36-0da3-4fdc-b650-f0c07bd70c31:2ac67befe7813ff6355abb73df1527ab"
								type="password"
								value={falApiKey}>
								API Key
							</VSCodeTextField>
							<VSCodeButton appearance="primary" disabled={isSaving || !falApiKey.trim()} onClick={handleSaveKey}>
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
