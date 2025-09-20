import { Mode } from "@shared/storage/types"
import { VSCodeCheckbox, VSCodeLink, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import Fuse from "fuse.js"
import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react"
import { useMount } from "react-use"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { ModelsServiceClient } from "@/services/grpc-client"
import { highlight } from "../../history/HistoryView"
import { ClineAccountInfoCard } from "../ClineAccountInfoCard"
import FeaturedModelCard from "../FeaturedModelCard"
import { getModeSpecificFields, normalizeApiConfiguration } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

/**
 * Props for the ClineProvider component
 */
interface ClineProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

/**
 * The Cline provider configuration component
 */
export const ClineProvider = ({ showModelOptions, isPopup, currentMode }: ClineProviderProps) => {
	const { apiConfiguration, openRouterModels, setOpenRouterModels } = useExtensionState()
	const { handleModeFieldsChange } = useApiConfigurationHandlers()
	const modeFields = getModeSpecificFields(apiConfiguration, currentMode)

	const [searchTerm, setSearchTerm] = useState(modeFields.openRouterModelId || "")
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)
	const [isDropdownVisible, setIsDropdownVisible] = useState(false)
	const [selectedIndex, setSelectedIndex] = useState(-1)
	const dropdownRef = useRef<HTMLDivElement>(null)
	const itemRefs = useRef<(HTMLDivElement | null)[]>([])
	const dropdownListRef = useRef<HTMLDivElement>(null)

	const handleModelChange = (newModelId: string) => {
		const modelInfo = openRouterModels?.[newModelId]

		handleModeFieldsChange(
			{
				openRouterModelId: { plan: "planModeOpenRouterModelId", act: "actModeOpenRouterModelId" },
				openRouterModelInfo: { plan: "planModeOpenRouterModelInfo", act: "actModeOpenRouterModelInfo" },
			},
			{
				openRouterModelId: newModelId,
				openRouterModelInfo: modelInfo,
			},
			currentMode,
		)
		setSearchTerm(newModelId)
		setIsDropdownVisible(false)
	}

	const { selectedModelId } = useMemo(() => {
		return normalizeApiConfiguration(apiConfiguration, currentMode)
	}, [apiConfiguration, currentMode])

	useMount(() => {
		ModelsServiceClient.refreshOpenRouterModels({})
			.then((response) => {
				if (response.models) {
					setOpenRouterModels(response.models)
					console.log("[ClineProvider] OpenRouter models loaded:", Object.keys(response.models).length)

					// Initialize default model if none is selected
					const currentModelId = modeFields.openRouterModelId
					if (!currentModelId && response.models["x-ai/grok-code-fast-1"]) {
						console.log("[ClineProvider] Initializing default model: x-ai/grok-code-fast-1")
						handleModelChange("x-ai/grok-code-fast-1")
					}
				}
			})
			.catch((err) => {
				console.error("[ClineProvider] Failed to refresh OpenRouter models:", err)
			})
	})

	// Sync external changes when the modelId changes
	useEffect(() => {
		const currentModelId = modeFields.openRouterModelId || ""
		setSearchTerm(currentModelId)
	}, [modeFields.openRouterModelId])

	// Debounce search term to reduce re-renders
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm)
		}, 300)

		return () => clearTimeout(timer)
	}, [searchTerm])

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsDropdownVisible(false)
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => {
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [])

	const modelIds = useMemo(() => {
		return Object.keys(openRouterModels || {}).sort((a, b) => a.localeCompare(b))
	}, [openRouterModels])

	const searchableItems = useMemo(() => {
		return modelIds.map((id) => ({
			id,
			html: id,
		}))
	}, [modelIds])

	const fuse = useMemo(() => {
		return new Fuse(searchableItems, {
			keys: ["html"],
			threshold: 0.6,
			shouldSort: true,
			isCaseSensitive: false,
			ignoreLocation: false,
			includeMatches: true,
			minMatchCharLength: 1,
		})
	}, [searchableItems])

	const modelSearchResults = useMemo(() => {
		const results: { id: string; html: string }[] = debouncedSearchTerm
			? highlight(fuse.search(debouncedSearchTerm), "model-item-highlight")
			: searchableItems
		return results
	}, [searchableItems, debouncedSearchTerm, fuse])

	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (!isDropdownVisible) {
			return
		}

		switch (event.key) {
			case "ArrowDown":
				event.preventDefault()
				setSelectedIndex((prev) => (prev < modelSearchResults.length - 1 ? prev + 1 : prev))
				break
			case "ArrowUp":
				event.preventDefault()
				setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
				break
			case "Enter":
				event.preventDefault()
				if (selectedIndex >= 0 && selectedIndex < modelSearchResults.length) {
					handleModelChange(modelSearchResults[selectedIndex].id)
				}
				break
			case "Escape":
				setIsDropdownVisible(false)
				setSelectedIndex(-1)
				break
		}
	}

	const hasInfo = useMemo(() => {
		try {
			return modelIds.some((id) => id.toLowerCase() === searchTerm.toLowerCase())
		} catch {
			return false
		}
	}, [modelIds, searchTerm])

	useEffect(() => {
		setSelectedIndex(-1)
		if (dropdownListRef.current) {
			dropdownListRef.current.scrollTop = 0
		}
	}, [searchTerm])

	useEffect(() => {
		if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
			itemRefs.current[selectedIndex]?.scrollIntoView({
				block: "nearest",
				behavior: "smooth",
			})
		}
	}, [selectedIndex])

	return (
		<div>
			{/* Cline Account Info Card */}
			<div style={{ marginBottom: 14, marginTop: 4 }}>
				<ClineAccountInfoCard />
			</div>

			{showModelOptions && (
				<div className="w-full">
					<div className="flex flex-col">
						<label className="font-medium mb-2">Model</label>

						{/* Featured Models Section */}
						<div className="mb-4">
							<h4 className="text-sm font-medium mb-2 text-[var(--vscode-foreground)]">Recommended Models</h4>
							<div className="space-y-1">
								{/* Anthropic Claude Sonnet 4 - BEST */}
								<FeaturedModelCard
									description="Recommended for agentic coding in Cline"
									isSelected={selectedModelId === "anthropic/claude-sonnet-4"}
									label="BEST"
									modelId="anthropic/claude-sonnet-4"
									onClick={() => handleModelChange("anthropic/claude-sonnet-4")}
								/>

								{/* OpenAI GPT-5 - NEW */}
								<FeaturedModelCard
									description="State of the art model for complex, long-horizon tasks"
									isSelected={selectedModelId === "openai/gpt-5"}
									label="NEW"
									modelId="openai/gpt-5"
									onClick={() => handleModelChange("openai/gpt-5")}
								/>

								{/* xAI Grok Code Fast 1 - FREE */}
								<FeaturedModelCard
									description="Advanced model with 262K context for complex coding"
									isSelected={selectedModelId === "x-ai/grok-code-fast-1"}
									label="FREE"
									modelId="x-ai/grok-code-fast-1"
									onClick={() => handleModelChange("x-ai/grok-code-fast-1")}
								/>
							</div>
						</div>

						{/* Selected Model Details */}
						{selectedModelId && (
							<div className="mb-4 p-3 border border-[var(--vscode-input-border)] rounded-md bg-[var(--vscode-input-background)]">
								<div className="flex items-center justify-between mb-2">
									<h4 className="text-sm font-medium text-[var(--vscode-foreground)]">Selected Model</h4>
									<div className="flex items-center gap-2">
										<VSCodeCheckbox checked={false} onChange={() => {}} />
										<span className="text-xs text-[var(--vscode-descriptionForeground)]">
											Enable extended thinking
										</span>
									</div>
								</div>

								<div className="text-sm text-[var(--vscode-foreground)] mb-2">
									<strong>{selectedModelId}</strong>
								</div>

								<div className="text-xs text-[var(--vscode-descriptionForeground)] mb-3">
									{selectedModelId === "anthropic/claude-sonnet-4" && "Recommended for agentic coding in Cline"}
									{selectedModelId === "openai/gpt-5" &&
										"State of the art model for complex, long-horizon tasks"}
									{selectedModelId === "x-ai/grok-code-fast-1" &&
										"Grok Code Fast 1 is a speedy and economical reasoning model that excels at agentic coding. With reasoning traces visible in the response, developers can steer Grok Code for high-quality work flows."}
								</div>

								{/* Model Capabilities */}
								<div className="grid grid-cols-2 gap-2 text-xs">
									<div className="flex items-center gap-1">
										{selectedModelId === "x-ai/grok-code-fast-1" ? (
											<span className="text-green-600">✅</span>
										) : (
											<span className="text-red-600">❌</span>
										)}
										<span className="text-[var(--vscode-descriptionForeground)]">Supports images</span>
									</div>
									<div className="flex items-center gap-1">
										<span className="text-red-600">❌</span>
										<span className="text-[var(--vscode-descriptionForeground)]">Supports browser use</span>
									</div>
									<div className="flex items-center gap-1">
										<span className="text-green-600">✅</span>
										<span className="text-[var(--vscode-descriptionForeground)]">
											Supports prompt caching
										</span>
									</div>
								</div>

								{/* Pricing Information */}
								<div className="mt-3 pt-3 border-t border-[var(--vscode-input-border)]">
									<div className="text-xs text-[var(--vscode-descriptionForeground)] space-y-1">
										<div>
											<strong>Context Window:</strong> 256,000 tokens
										</div>
										<div>
											<strong>Input price:</strong> $0.20/million tokens
										</div>
										<div>
											<strong>Cache reads price:</strong> $0.02/million tokens
										</div>
										<div>
											<strong>Output price:</strong> $1.50/million tokens
										</div>
									</div>
								</div>
							</div>
						)}

						{/* All Models Search */}
						<div className="mb-4">
							<h4 className="text-sm font-medium mb-2 text-[var(--vscode-foreground)]">All Available Models</h4>
							<div className="relative w-full" ref={dropdownRef}>
								<VSCodeTextField
									id="openrouter-model-search"
									onFocus={() => setIsDropdownVisible(true)}
									onInput={(e) => {
										setSearchTerm((e.target as HTMLInputElement)?.value || "")
										setIsDropdownVisible(true)
									}}
									onKeyDown={handleKeyDown}
									placeholder="Search all models..."
									style={{
										width: "100%",
										zIndex: 1000,
										position: "relative",
									}}
									value={searchTerm}>
									{searchTerm && (
										<div
											aria-label="Clear search"
											className="input-icon-button codicon codicon-close flex justify-center items-center h-full"
											onClick={() => {
												setSearchTerm("")
												setIsDropdownVisible(true)
											}}
											slot="end"
										/>
									)}
								</VSCodeTextField>
								{isDropdownVisible && (
									<div
										className="absolute top-[calc(100%-3px)] left-0 w-[calc(100%-2px)] max-h-[200px] overflow-y-auto border border-[var(--vscode-list-activeSelectionBackground)] rounded-b-[3px]"
										ref={dropdownListRef}
										style={{
											backgroundColor: "var(--vscode-dropdown-background)",
											zIndex: 999,
										}}>
										{modelSearchResults.map((item, index) => (
											<div
												className={`px-2.5 py-1.5 cursor-pointer break-all whitespace-normal hover:bg-[var(--vscode-list-activeSelectionBackground)] ${
													index === selectedIndex
														? "bg-[var(--vscode-list-activeSelectionBackground)]"
														: ""
												}`}
												dangerouslySetInnerHTML={{
													__html: item.html,
												}}
												key={item.id}
												onClick={() => {
													handleModelChange(item.id)
													setIsDropdownVisible(false)
												}}
												onMouseEnter={() => setSelectedIndex(index)}
												ref={(el: HTMLDivElement | null) => (itemRefs.current[index] = el)}
											/>
										))}
									</div>
								)}
							</div>
						</div>

						{/* Footer Links */}
						{!hasInfo && modelIds.length > 0 && (
							<p className="text-xs mt-0 text-[var(--vscode-descriptionForeground)]">
								The extension automatically fetches the latest list of models available on{" "}
								<VSCodeLink className="inline text-inherit" href="https://openrouter.ai/models">
									OpenRouter.
								</VSCodeLink>
								{modelIds.length === 0 && " Loading models..."}
							</p>
						)}

						{modelIds.length === 0 && (
							<p className="text-xs mt-0 text-[var(--vscode-descriptionForeground)]">
								Loading OpenRouter models... If this takes too long, check your internet connection.
							</p>
						)}
					</div>
				</div>
			)}
		</div>
	)
}
