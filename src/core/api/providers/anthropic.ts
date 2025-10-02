import { Anthropic } from "@anthropic-ai/sdk"
import { AnthropicModelId, anthropicDefaultModelId, anthropicModelsActive, ModelInfo } from "@shared/api"
import { ApiHandler, CommonApiHandlerOptions } from "../"
import { withRetry } from "../retry"
import { ApiStream } from "../transform/stream"

interface AnthropicHandlerOptions extends CommonApiHandlerOptions {
	anthropicApiKey?: string
	anthropicModelId?: string
	anthropicModelInfo?: ModelInfo
	apiModelId?: string
}

export class AnthropicHandler implements ApiHandler {
	private options: AnthropicHandlerOptions
	private client: Anthropic | undefined

	constructor(options: AnthropicHandlerOptions) {
		this.options = options
	}

	private ensureClient(): Anthropic {
		if (!this.client) {
			if (!this.options.anthropicApiKey) {
				throw new Error("Anthropic API key is required")
			}
			try {
				this.client = new Anthropic({
					apiKey: this.options.anthropicApiKey,
				})
			} catch (error: any) {
				throw new Error(`Error creating Anthropic client: ${error.message}`)
			}
		}
		return this.client
	}

	@withRetry()
	async *createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[]): ApiStream {
		const client = this.ensureClient()
		const modelId = this.getModel().id
		const modelInfo = this.getModel().info

		const stream = await client.messages.stream({
			model: modelId,
			max_tokens: modelInfo.maxTokens || 8192,
			temperature: 0,
			system: systemPrompt,
			messages: messages,
		})

		for await (const chunk of stream) {
			switch (chunk.type) {
				case "message_start":
					// Message started, no special handling needed
					break

				case "content_block_start":
					// Content block started, no special handling needed
					break

				case "content_block_delta":
					if (chunk.delta.type === "text_delta") {
						yield {
							type: "text",
							text: chunk.delta.text,
						}
					}
					break

				case "content_block_stop":
					// Content block ended, no special handling needed
					break

				case "message_delta":
					// Message delta, could contain usage info
					break

				case "message_stop":
					// Message completed, get final usage
					const finalMessage = await stream.finalMessage()
					if (finalMessage.usage) {
						yield {
							type: "usage",
							inputTokens: finalMessage.usage.input_tokens || 0,
							outputTokens: finalMessage.usage.output_tokens || 0,
							cacheReadTokens:
								("cache_read_input_tokens" in finalMessage.usage && finalMessage.usage.cache_read_input_tokens) ||
								0,
							cacheWriteTokens:
								("cache_creation_input_tokens" in finalMessage.usage &&
									finalMessage.usage.cache_creation_input_tokens) ||
								0,
						}
					}
					break
			}
		}
	}

	getModel(): { id: string; info: ModelInfo } {
		const modelId = this.options.anthropicModelId || this.options.apiModelId

		// Check if model exists in our known models
		if (modelId && modelId in anthropicModelsActive) {
			const id = modelId as AnthropicModelId
			return { id, info: anthropicModelsActive[id] }
		}

		// Use model info from options if provided (for custom models)
		if (modelId && this.options.anthropicModelInfo) {
			return {
				id: modelId,
				info: this.options.anthropicModelInfo,
			}
		}

		// Fall back to default
		return {
			id: anthropicDefaultModelId,
			info: anthropicModelsActive[anthropicDefaultModelId],
		}
	}
}
