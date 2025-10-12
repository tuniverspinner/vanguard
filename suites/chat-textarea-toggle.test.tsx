import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ChatTextArea from "../webview-ui/src/components/chat/ChatTextArea"

// Mock the necessary hooks and dependencies
vi.mock("../webview-ui/src/context/ExtensionStateContext", () => ({
	useExtensionState: vi.fn(),
}))

vi.mock("../webview-ui/src/context/PlatformContext", () => ({
	usePlatform: vi.fn(),
}))

vi.mock("../webview-ui/src/utils/hooks", () => ({
	useShortcut: vi.fn(),
	useMetaKeyDetection: vi.fn(),
}))

vi.mock("../webview-ui/src/services/grpc-client", () => ({
	FileServiceClient: {},
	ModelsServiceClient: {
		updateApiConfigurationProto: vi.fn(),
	},
	StateServiceClient: {},
}))

import { useExtensionState } from "../webview-ui/src/context/ExtensionStateContext"
import { usePlatform } from "../webview-ui/src/context/PlatformContext"
import { useShortcut } from "../webview-ui/src/utils/hooks"
import { ModelsServiceClient } from "../webview-ui/src/services/grpc-client"

describe("ChatTextArea - Model Toggle Keybinding", () => {
	const mockUseExtensionState = vi.mocked(useExtensionState)
	const mockUsePlatform = vi.mocked(usePlatform)
	const mockUseShortcut = vi.mocked(useShortcut)
	const mockUpdateApiConfig = vi.mocked(ModelsServiceClient.updateApiConfigurationProto)

	beforeEach(() => {
		vi.clearAllMocks()

		// Default mocks
		mockUsePlatform.mockReturnValue({
			togglePlanActKeys: "Meta+Shift+a",
			toggleModelKeys: "Meta+Shift+s",
		})

		mockUseMetaKeyDetection.mockReturnValue(["Cmd", "Meta"])

		mockUseShortcut.mockImplementation(() => {}) // No-op by default
	})

	it("toggles between grok-4-fast and grok-code-fast-1 when xAI provider is selected and Cmd+Shift+S is pressed", async () => {
		const user = userEvent.setup()

		// Mock xAI provider with grok-4-fast initially
		const mockApiConfig = {
			selectedProvider: "xai",
			selectedModelId: "grok-4-fast",
		}

		mockUseExtensionState.mockReturnValue({
			mode: "act",
			apiConfiguration: mockApiConfig,
			openRouterModels: {},
			platform: "vscode",
			localWorkflowToggles: {},
			globalWorkflowToggles: {},
			showChatModelSelector: false,
			setShowChatModelSelector: vi.fn(),
		})

		// Mock the shortcut to capture the callback
		let capturedCallback: (() => void) | undefined
		mockUseShortcut.mockImplementation((keys, callback) => {
			if (keys === "Meta+Shift+s") {
				capturedCallback = callback
			}
		})

		render(
			<ChatTextArea
				inputValue=""
				activeQuote={null}
				setInputValue={vi.fn()}
				sendingDisabled={false}
				placeholderText="Type a message..."
				selectedFiles={[]}
				selectedImages={[]}
				setSelectedImages={vi.fn()}
				setSelectedFiles={vi.fn()}
				onSend={vi.fn()}
				onSelectFilesAndImages={vi.fn()}
				shouldDisableFilesAndImages={false}
			/>
		)

		// Simulate Cmd+Shift+S keypress
		await user.keyboard("{Meta>}{Shift>}S{/Shift}{/Meta}")

		// The callback should have been called
		expect(capturedCallback).toBeDefined()
		if (capturedCallback) {
			capturedCallback()
		}

		// Assert that updateApiConfigurationProto was called with toggled model
		expect(mockUpdateApiConfig).toHaveBeenCalledWith(
			expect.objectContaining({
				apiConfiguration: expect.objectContaining({
					selectedModelId: "grok-code-fast-1",
				}),
			})
		)
	})

	it("does nothing when non-xAI provider is selected", async () => {
		const user = userEvent.setup()

		// Mock Groq provider
		const mockApiConfig = {
			selectedProvider: "groq",
			selectedModelId: "some-model",
		}

		mockUseExtensionState.mockReturnValue({
			mode: "act",
			apiConfiguration: mockApiConfig,
			openRouterModels: {},
			platform: "vscode",
			localWorkflowToggles: {},
			globalWorkflowToggles: {},
			showChatModelSelector: false,
			setShowChatModelSelector: vi.fn(),
		})

		let capturedCallback: (() => void) | undefined
		mockUseShortcut.mockImplementation((keys, callback) => {
			if (keys === "Meta+Shift+s") {
				capturedCallback = callback
			}
		})

		render(
			<ChatTextArea
				inputValue=""
				activeQuote={null}
				setInputValue={vi.fn()}
				sendingDisabled={false}
				placeholderText="Type a message..."
				selectedFiles={[]}
				selectedImages={[]}
				setSelectedImages={vi.fn()}
				setSelectedFiles={vi.fn()}
				onSend={vi.fn()}
				onSelectFilesAndImages={vi.fn()}
				shouldDisableFilesAndImages={false}
			/>
		)

		await user.keyboard("{Meta>}{Shift>}S{/Shift}{/Meta}")

		if (capturedCallback) {
			capturedCallback()
		}

		// Assert that updateApiConfigurationProto was NOT called
		expect(mockUpdateApiConfig).not.toHaveBeenCalled()
	})

	it("toggles back to grok-4-fast when starting with grok-code-fast-1", async () => {
		const user = userEvent.setup()

		// Mock xAI provider with grok-code-fast-1 initially
		const mockApiConfig = {
			selectedProvider: "xai",
			selectedModelId: "grok-code-fast-1",
		}

		mockUseExtensionState.mockReturnValue({
			mode: "act",
			apiConfiguration: mockApiConfig,
			openRouterModels: {},
			platform: "vscode",
			localWorkflowToggles: {},
			globalWorkflowToggles: {},
			showChatModelSelector: false,
			setShowChatModelSelector: vi.fn(),
		})

		let capturedCallback: (() => void) | undefined
		mockUseShortcut.mockImplementation((keys, callback) => {
			if (keys === "Meta+Shift+s") {
				capturedCallback = callback
			}
		})

		render(
			<ChatTextArea
				inputValue=""
				activeQuote={null}
				setInputValue={vi.fn()}
				sendingDisabled={false}
				placeholderText="Type a message..."
				selectedFiles={[]}
				selectedImages={[]}
				setSelectedImages={vi.fn()}
				setSelectedFiles={vi.fn()}
				onSend={vi.fn()}
				onSelectFilesAndImages={vi.fn()}
				shouldDisableFilesAndImages={false}
			/>
		)

		await user.keyboard("{Meta>}{Shift>}S{/Shift}{/Meta}")

		if (capturedCallback) {
			capturedCallback()
		}

		expect(mockUpdateApiConfig).toHaveBeenCalledWith(
			expect.objectContaining({
				apiConfiguration: expect.objectContaining({
					selectedModelId: "grok-4-fast",
				}),
			})
		)
	})

	it("displays hint text when xAI provider is selected", () => {
		const mockApiConfig = {
			selectedProvider: "xai",
			selectedModelId: "grok-4-fast",
		}

		mockUseExtensionState.mockReturnValue({
			mode: "act",
			apiConfiguration: mockApiConfig,
			openRouterModels: {},
			platform: "vscode",
			localWorkflowToggles: {},
			globalWorkflowToggles: {},
			showChatModelSelector: false,
			setShowChatModelSelector: vi.fn(),
		})

		render(
			<ChatTextArea
				inputValue=""
				activeQuote={null}
				setInputValue={vi.fn()}
				sendingDisabled={false}
				placeholderText="Type a message..."
				selectedFiles={[]}
				selectedImages={[]}
				setSelectedImages={vi.fn()}
				setSelectedFiles={vi.fn()}
				onSend={vi.fn()}
				onSelectFilesAndImages={vi.fn()}
				shouldDisableFilesAndImages={false}
			/>
		)

		// Check for hint text (this will fail until we implement the hint)
		expect(screen.getByText(/Toggle Grok models w\/ Cmd\+Shift\+S/)).toBeInTheDocument()
	})

	it("does not display hint text when non-xAI provider is selected", () => {
		const mockApiConfig = {
			selectedProvider: "groq",
			selectedModelId: "some-model",
		}

		mockUseExtensionState.mockReturnValue({
			mode: "act",
			apiConfiguration: mockApiConfig,
			openRouterModels: {},
			platform: "vscode",
			localWorkflowToggles: {},
			globalWorkflowToggles: {},
			showChatModelSelector: false,
			setShowChatModelSelector: vi.fn(),
		})

		render(
			<ChatTextArea
				inputValue=""
				activeQuote={null}
				setInputValue={vi.fn()}
				sendingDisabled={false}
				placeholderText="Type a message..."
				selectedFiles={[]}
				selectedImages={[]}
				setSelectedImages={vi.fn()}
				setSelectedFiles={vi.fn()}
				onSend={vi.fn()}
				onSelectFilesAndImages={vi.fn()}
				shouldDisableFilesAndImages={false}
			/>
		)

		// Hint should not be present
		expect(screen.queryByText(/Toggle Grok models/)).not.toBeInTheDocument()
	})
})
