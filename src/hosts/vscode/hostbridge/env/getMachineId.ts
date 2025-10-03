import * as vscode from "vscode"

export async function getMachineId(): Promise<string> {
	return vscode.env.machineId
}
