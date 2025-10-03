import * as vscode from "vscode"
import type { StreamingResponseHandler } from "@/hosts/vscode/hostbridge-grpc-handler"
import { getRequestRegistry } from "@/hosts/vscode/hostbridge-grpc-handler"

export async function subscribeToTelemetrySettings(
	message: any,
	responseStream: StreamingResponseHandler,
	requestId?: string,
): Promise<void> {
	if (!requestId) {
		await responseStream({ error: "Request ID required" }, true)
		return
	}

	const registry = getRequestRegistry()

	// Send initial state
	await responseStream({ enabled: vscode.env.isTelemetryEnabled })

	// Set up listener for changes
	const disposable = vscode.workspace.onDidChangeConfiguration((e) => {
		if (e.affectsConfiguration("telemetry.telemetryLevel") && registry.hasRequest(requestId)) {
			responseStream({ enabled: vscode.env.isTelemetryEnabled })
		}
	})

	// Chain cleanup to dispose the listener on stream cancel
	registry.updateCleanup(requestId, () => disposable.dispose())
}
