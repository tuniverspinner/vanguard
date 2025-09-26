import type { ClineMessage } from "@shared/ExtensionMessage"
import { useEffect } from "react"
import type { ButtonActionType } from "../../../shared/buttonConfig"

export const useAutoRetry = (
	handleActionClick: (action: ButtonActionType, text?: string, images?: string[], files?: string[]) => void,
	lastMessageAsk: ClineMessage["ask"],
	primaryAction: string | undefined,
	inputValue: string,
	selectedImages: string[],
	selectedFiles: string[],
) => {
	useEffect(() => {
		if (lastMessageAsk === "api_req_failed" && primaryAction === "retry") {
			// Small delay to ensure UI is stable
			const timer = setTimeout(() => {
				handleActionClick("retry", inputValue, selectedImages, selectedFiles)
			}, 100)

			return () => clearTimeout(timer)
		}
	}, [lastMessageAsk, primaryAction, handleActionClick, inputValue, selectedImages, selectedFiles])
}

export const useAutoProceed = (
	handleActionClick: (action: ButtonActionType, text?: string, images?: string[], files?: string[]) => void,
	lastMessageAsk: ClineMessage["ask"],
	primaryAction: string | undefined,
	inputValue: string,
	selectedImages: string[],
	selectedFiles: string[],
) => {
	useEffect(() => {
		if (lastMessageAsk === "mistake_limit_reached" && primaryAction === "proceed") {
			// Small delay to ensure UI is stable
			const timer = setTimeout(() => {
				handleActionClick("proceed", inputValue, selectedImages, selectedFiles)
			}, 100)

			return () => clearTimeout(timer)
		}
	}, [lastMessageAsk, primaryAction, handleActionClick, inputValue, selectedImages, selectedFiles])
}
