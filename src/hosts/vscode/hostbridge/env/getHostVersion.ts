import * as vscode from "vscode"

export async function getHostVersion(): Promise<string> {
	return vscode.version
}
