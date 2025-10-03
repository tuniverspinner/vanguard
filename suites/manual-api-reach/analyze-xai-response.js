const https = require("https")
const fs = require("fs")

const requestData = JSON.stringify({
	messages: [{ role: "user", content: "Say hello" }],
	model: "grok-4-fast",
	stream: false,
	max_completion_tokens: 10,
	temperature: 0,
})

const options = {
	hostname: "api.x.ai",
	port: 443,
	path: "/v1/chat/completions",
	method: "POST",
	headers: {
		"Content-Type": "application/json",
		Authorization: `Bearer ${XAI_API_KEY}`,
		"Content-Length": Buffer.byteLength(requestData),
	},
}

const req = https.request(options, (res) => {
	let data = ""

	res.on("data", (chunk) => {
		data += chunk
	})

	res.on("end", () => {
		try {
			const response = JSON.parse(data)

			// Write full response to file
			fs.writeFileSync("xai-response.json", JSON.stringify(response, null, 2))

			// Extract and analyze usage data
			const usage = response.usage
			console.log("=== xAI API Response Analysis ===")
			console.log("Status:", res.statusCode)
			console.log("Response:", response.choices[0].message.content)
			console.log("")
			console.log("Usage Breakdown:")
			console.log("- prompt_tokens:", usage.prompt_tokens)
			console.log("- completion_tokens:", usage.completion_tokens)
			console.log("- total_tokens:", usage.total_tokens)
			console.log("")
			console.log("Detailed Token Accounting:")
			if (usage.prompt_tokens_details) {
				console.log("- prompt_details.text_tokens:", usage.prompt_tokens_details.text_tokens)
				console.log("- prompt_details.cached_tokens:", usage.prompt_tokens_details.cached_tokens)
			}
			if (usage.completion_tokens_details) {
				console.log("- completion_details.reasoning_tokens:", usage.completion_tokens_details.reasoning_tokens)
			}
			console.log("")
			console.log("Full response saved to: xai-response.json")
		} catch (error) {
			console.error("Error parsing response:", error)
			fs.writeFileSync("xai-error-response.json", data)
		}
	})
})

req.on("error", (error) => {
	console.error("Request error:", error)
})

req.write(requestData)
req.end()
