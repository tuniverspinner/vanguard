import * as vscode from "vscode"

export async function getUriScheme(): Promise<string> {
	return vscode.env.uriScheme
}
