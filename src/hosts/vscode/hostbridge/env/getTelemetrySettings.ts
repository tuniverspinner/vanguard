import * as vscode from "vscode"

export async function getTelemetrySettings(): Promise<boolean> {
	return vscode.env.isTelemetryEnabled
}
