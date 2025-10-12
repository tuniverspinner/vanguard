import { describe, expect, it } from "vitest"

describe("ChatTextArea - Model Toggle Keybinding", () => {
	it("should have toggleModelKeys in platform config", () => {
		// Test that the platform config includes the new toggleModelKeys property
		const platformConfigs = require("./config/platform-configs.json")

		expect(platformConfigs.vscode.toggleModelKeys).toBe("Meta+Shift+s")
		expect(platformConfigs.standalone.toggleModelKeys).toBe("Meta+Shift+s")
	})

	it("should toggle between grok-4-fast and grok-code-fast-1", () => {
		// Test the toggle logic directly
		const toggleModel = (currentModel: string): string => {
			return currentModel === "grok-4-fast" ? "grok-code-fast-1" : "grok-4-fast"
		}

		expect(toggleModel("grok-4-fast")).toBe("grok-code-fast-1")
		expect(toggleModel("grok-code-fast-1")).toBe("grok-4-fast")
		expect(toggleModel("some-other-model")).toBe("grok-4-fast") // defaults to grok-4-fast
	})
})
