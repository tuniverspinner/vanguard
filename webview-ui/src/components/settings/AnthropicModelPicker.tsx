import { anthropicDefaultModelId, anthropicModelsActive } from "@shared/api"
import { Mode } from "@shared/storage/types"
import { VSCodeLink, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import Fuse from "fuse.js"
import React, { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { highlight } from "../history/HistoryView"
import { ModelInfoView } from "./common/ModelInfoView"
import { getModeSpecificFields, normalizeApiConfiguration } from "./utils/providerUtils"
import { useApiConfigurationHandlers } from "./utils/useApiConfigurationHandlers"

export interface AnthropicModelPickerProps {
	isPopup?: boolean
	currentMode: Mode
}

const AnthropicModelPicker: React.FC<AnthropicModelPickerProps> = ({ isPopup, currentMode }) => {
	const { apiConfiguration } = useExtensionState()
	const { handleModeFieldsChange } = useApiConfigurationHandlers()
	const modeFields = getModeSpecificFields(apiConfiguration, currentMode)
	const [searchTerm, setSearchTerm] = useState(modeFields.anthropicModelId || anthropicDefaultModelId)
	const [isDropdownVisible, setIsDropdownVisible] = useState(false)
	const [selectedIndex, setSelectedIndex] = useState(-1)
	const dropdownRef = useRef<HTMLDivElement>(null)
	const itemRefs = useRef<(HTMLDivElement | null)[]>([])
	const dropdownListRef = useRef<HTMLDivElement>(null)

	const handleModelChange = (newModelId: string) => {
		const modelInfo = anthropicModelsActive[newModelId as keyof typeof anthropicModelsActive]

		handleModeFieldsChange(
			{
				anthropicModelId: { plan: "planModeAnthropicModelId", act: "actModeAnthropicModelId" },
				anthropicModelInfo: { plan: "planModeAnthropicModelInfo", act: "actModeAnthropicModelInfo" },
			},
			{
				anthropicModelId: newModelId,
				anthropicModelInfo: modelInfo,
			},
			currentMode,
		)
		setSearchTerm(newModelId)
	}

	const { selectedModelId, selectedModelInfo } = useMemo(() => {
		return normalizeApiConfiguration(apiConfiguration, currentMode)
	}, [apiConfiguration, currentMode])

	// Sync external changes when the modelId changes
	useEffect(() => {
		const currentModelId = modeFields.anthropicModelId || anthropicDefaultModelId
		setSearchTerm(currentModelId)
	}, [modeFields.anthropicModelId])

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
		return Object.keys(anthropicModelsActive).sort((a, b) => a.localeCompare(b))
	}, [])

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
		const results: { id: string; html: string }[] = searchTerm
			? highlight(fuse.search(searchTerm), "model-item-highlight")
			: searchableItems
		return results
	}, [searchableItems, searchTerm, fuse])

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
					setIsDropdownVisible(false)
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
		<div className="w-full">
			<style>
				{`
				.model-item-highlight {
					background-color: var(--vscode-editor-findMatchHighlightBackground);
					color: inherit;
				}
				`}
			</style>
			<div className="flex flex-col">
				<label htmlFor="anthropic-model-search">
					<span className="font-medium">Model</span>
				</label>
				<div className="relative w-full" ref={dropdownRef}>
					<VSCodeTextField
						id="anthropic-model-search"
						onFocus={() => setIsDropdownVisible(true)}
						onInput={(e) => {
							setSearchTerm((e.target as HTMLInputElement)?.value || "")
							setIsDropdownVisible(true)
						}}
						onKeyDown={handleKeyDown}
						placeholder="Search and select a model..."
						style={{
							width: "100%",
							zIndex: ANTHROPIC_MODEL_PICKER_Z_INDEX,
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
								zIndex: ANTHROPIC_MODEL_PICKER_Z_INDEX - 1,
							}}>
							{modelSearchResults.map((item, index) => (
								<div
									className={`px-2.5 py-1.5 cursor-pointer break-all whitespace-normal hover:bg-[var(--vscode-list-activeSelectionBackground)] ${
										index === selectedIndex ? "bg-[var(--vscode-list-activeSelectionBackground)]" : ""
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

			{hasInfo ? (
				<ModelInfoView isPopup={isPopup} modelInfo={selectedModelInfo} selectedModelId={selectedModelId} />
			) : (
				<p className="text-xs mt-0 text-[var(--vscode-descriptionForeground)]">
					Choose from Anthropic's Claude models. For the best experience, we recommend{" "}
					<VSCodeLink className="inline text-inherit" onClick={() => handleModelChange(anthropicDefaultModelId)}>
						{anthropicDefaultModelId}
					</VSCodeLink>{" "}
					which offers the latest capabilities including extended thinking.
				</p>
			)}
		</div>
	)
}

export const ANTHROPIC_MODEL_PICKER_Z_INDEX = 1_000

export default AnthropicModelPicker
