import * as vscode from "vscode"
import { OpenClineSidebarPanelRequest, OpenClineSidebarPanelResponse } from "@/shared/proto/index.host"

export async function openClineSidebarPanel(_: OpenClineSidebarPanelRequest): Promise<OpenClineSidebarPanelResponse> {
	await vscode.commands.executeCommand(`workbench.view.vanguard-ActivityBar`)
	return {}
}
