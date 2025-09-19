import * as vscode from "vscode"
import { OpenClineSidebarPanelRequest, OpenClineSidebarPanelResponse } from "@/shared/proto/index.host"

export async function openClineSidebarPanel(_: OpenClineSidebarPanelRequest): Promise<OpenClineSidebarPanelResponse> {
	const commandName = `workbench.view.vanguard-ActivityBar`
	console.log(`[VANGUARD DEBUG] Attempting to execute command: ${commandName}`)

	// Check if command exists
	const commands = await vscode.commands.getCommands(true)
	const commandExists = commands.includes(commandName)
	console.log(`[VANGUARD DEBUG] Command exists: ${commandExists}`)
	console.log(
		`[VANGUARD DEBUG] Available commands containing 'vanguard':`,
		commands.filter((cmd) => cmd.includes("vanguard")),
	)
	console.log(
		`[VANGUARD DEBUG] Available commands containing 'ActivityBar':`,
		commands.filter((cmd) => cmd.includes("ActivityBar")),
	)

	if (!commandExists) {
		console.error(
			`[VANGUARD DEBUG] Command '${commandName}' not found. Available view commands:`,
			commands.filter((cmd) => cmd.startsWith("workbench.view.")),
		)
		throw new Error(`Command '${commandName}' not found`)
	}

	try {
		await vscode.commands.executeCommand(commandName)
		console.log(`[VANGUARD DEBUG] Successfully executed command: ${commandName}`)
	} catch (error) {
		console.error(`[VANGUARD DEBUG] Failed to execute command '${commandName}':`, error)
		throw error
	}

	return {}
}
