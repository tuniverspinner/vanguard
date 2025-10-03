// Script to check if caching is implemented for different providers
const fs = require("fs")
const path = require("path")

function checkCachingImplementation(providerFile, providerName) {
	const content = fs.readFileSync(path.join("src/core/api/providers", providerFile), "utf8")
	const hasCacheControl = content.includes("cache_control")
	console.log(`${providerName}: Caching implemented? ${hasCacheControl ? "Yes" : "No"}`)

	if (!hasCacheControl) {
		console.log(`  - ${providerName} does not add cache_control to messages`)
	}
}

function checkTransformCaching(transformFile, transformName) {
	const content = fs.readFileSync(path.join("src/core/api/transform", transformFile), "utf8")
	const hasCacheControl = content.includes("cache_control")
	console.log(`${transformName}: Caching implemented? ${hasCacheControl ? "Yes" : "No"}`)
}

console.log("Checking caching implementation:")
checkCachingImplementation("anthropic.ts", "Anthropic (Sonnet 4.5)")
checkTransformCaching("openrouter-stream.ts", "OpenRouter (Grok Code Fast 1)")

console.log("\nModel support for caching:")
const apiContent = fs.readFileSync("src/shared/api.ts", "utf8")
const sonnetMatch = apiContent.match(/claude-sonnet-4-5[^}]*supportsPromptCache:\s*true/)
const grokMatch = apiContent.match(/grok-code-fast-1[^}]*supportsPromptCache:\s*true/)
console.log(`Sonnet 4.5 supportsPromptCache: ${sonnetMatch ? "Yes" : "No"}`)
console.log(`Grok Code Fast 1 supportsPromptCache: ${grokMatch ? "Yes" : "No"}`)
