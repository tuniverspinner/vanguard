// Cost analysis for xAI API response
const response = {
	usage: {
		prompt_tokens: 119,
		completion_tokens: 9,
		total_tokens: 226,
		prompt_tokens_details: {
			text_tokens: 119,
			cached_tokens: 112,
		},
		completion_tokens_details: {
			reasoning_tokens: 98,
		},
	},
}

// xAI grok-4-fast pricing
const model = {
	inputPrice: 0.2, // $0.20 per 1M input tokens
	outputPrice: 0.5, // $0.50 per 1M output tokens
	cacheReadsPrice: 0.05, // $0.05 per 1M cached tokens
}

function calculateApiCostOpenAI(
	model,
	inputTokens,
	outputTokens,
	cacheCreationTokens = 0,
	cacheReadTokens = 0,
	reasoningTokens = 0,
) {
	const nonCachedInputTokens = Math.max(0, inputTokens - cacheCreationTokens - cacheReadTokens)
	const inputCost = (model.inputPrice / 1_000_000) * nonCachedInputTokens
	const cacheReadCost = (model.cacheReadsPrice / 1_000_000) * cacheReadTokens
	const outputCost = (model.outputPrice / 1_000_000) * (outputTokens + reasoningTokens)
	return inputCost + cacheReadCost + outputCost
}

// Extract token data from response
const inputTokens = response.usage.prompt_tokens
const outputTokens = response.usage.completion_tokens
const cacheReadTokens = response.usage.prompt_tokens_details.cached_tokens
const reasoningTokens = response.usage.completion_tokens_details.reasoning_tokens

// Calculate cost
const calculatedCost = calculateApiCostOpenAI(model, inputTokens, outputTokens, 0, cacheReadTokens, reasoningTokens)

// Dashboard data
const dashboardTotalSpent = 0.0006
const dashboardTotalTokens = 1179
const dashboardTotalRequests = 16

console.log("=== xAI Cost Analysis ===")
console.log("")
console.log("API Response Token Breakdown:")
console.log(`- Total prompt tokens: ${inputTokens}`)
console.log(`- Non-cached input tokens: ${inputTokens - cacheReadTokens}`)
console.log(`- Cached input tokens: ${cacheReadTokens}`)
console.log(`- Completion tokens: ${outputTokens}`)
console.log(`- Reasoning tokens: ${reasoningTokens}`)
console.log(`- Total tokens: ${response.usage.total_tokens}`)
console.log("")
console.log("Cost Calculation:")
console.log(
	`- Input cost (${inputTokens - cacheReadTokens} tokens): $${((model.inputPrice / 1_000_000) * (inputTokens - cacheReadTokens)).toFixed(6)}`,
)
console.log(
	`- Cache read cost (${cacheReadTokens} tokens): $${((model.cacheReadsPrice / 1_000_000) * cacheReadTokens).toFixed(6)}`,
)
console.log(
	`- Output cost (${outputTokens + reasoningTokens} tokens): $${((model.outputPrice / 1_000_000) * (outputTokens + reasoningTokens)).toFixed(6)}`,
)
console.log(`- Total calculated cost: $${calculatedCost.toFixed(6)}`)
console.log("")
console.log("Dashboard Comparison:")
console.log(`- Total dashboard spend: $${dashboardTotalSpent.toFixed(6)}`)
console.log(`- Total dashboard tokens: ${dashboardTotalTokens}`)
console.log(`- Total dashboard requests: ${dashboardTotalRequests}`)
console.log(`- Average cost per request: $${(dashboardTotalSpent / dashboardTotalRequests).toFixed(6)}`)
console.log(`- Average tokens per request: ${Math.round(dashboardTotalTokens / dashboardTotalRequests)}`)
console.log("")
console.log("Validation:")
const expectedAvgCost = dashboardTotalSpent / dashboardTotalRequests
const tolerance = 0.00001 // $0.00001 tolerance
const matches = Math.abs(calculatedCost - expectedAvgCost) < tolerance
console.log(`- Our calculation matches dashboard average? ${matches}`)
console.log(`- Difference: $${Math.abs(calculatedCost - expectedAvgCost).toFixed(6)}`)
console.log(`- Within tolerance (${tolerance})? ${Math.abs(calculatedCost - expectedAvgCost) < tolerance}`)
