import * as vscode from "vscode"

export async function clipboardWriteText(text: string): Promise<void> {
	await vscode.env.clipboard.writeText(text)
}
