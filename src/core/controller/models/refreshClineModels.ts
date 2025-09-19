import { McpMarketplaceCatalog } from "@shared/mcp"
import { EmptyRequest } from "@shared/proto/cline/common"
import { Controller } from ".."
import { sendMcpMarketplaceCatalogEvent } from "../mcp/subscribeToMcpMarketplaceCatalog"

/**
 * Refreshes the models available from the Cline API provider.
 *
 * This function fetches the latest model catalog for the 'cline' provider
 * and posts it to the webview, ensuring the UI has the necessary data
 * to display model cards and selectors.
 */
export async function refreshClineModels(controller: Controller, _request: EmptyRequest): Promise<void> {
	try {
		// Use the MCP catalog which is the source of truth for cline provider models
		const mcpCatalog = controller.stateManager.getGlobalStateKey("mcpMarketplaceCatalog")
		if (mcpCatalog && (mcpCatalog as McpMarketplaceCatalog).items) {
			// This function sends the catalog to the webview, which is what the UI needs
			sendMcpMarketplaceCatalogEvent(mcpCatalog as McpMarketplaceCatalog)
		} else {
			console.warn("MCP Marketplace Catalog not available for refreshing Cline models.")
		}
	} catch (error) {
		console.error("Failed to refresh Cline models:", error)
	}
}
