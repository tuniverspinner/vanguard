import * as vscode from "vscode"

export async function clipboardReadText(): Promise<string> {
	return await vscode.env.clipboard.readText()
}
