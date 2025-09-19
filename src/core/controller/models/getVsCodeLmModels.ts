import { EmptyRequest } from "@shared/proto/cline/common"
import { VsCodeLmModelsArray } from "@shared/proto/cline/models"
import { Controller } from ".."

/**
 * Fetches available models from VS Code LM API
 * @param controller The controller instance
 * @param request Empty request
 * @returns Array of VS Code LM models
 */
export async function getVsCodeLmModels(_controller: Controller, _request: EmptyRequest): Promise<VsCodeLmModelsArray> {
	try {
		// VSCode LM API is not available in current version
		// const models = await vscode.lm.selectChatModels({})
		// const protoModels = convertVsCodeNativeModelsToProtoModels(models || [])
		// return VsCodeLmModelsArray.create({ models: protoModels })

		// Return empty array since VSCode LM is not one of our 3 core providers
		return VsCodeLmModelsArray.create({ models: [] })
	} catch (error) {
		console.error("Error fetching VS Code LM models:", error)
		return VsCodeLmModelsArray.create({ models: [] })
	}
}
