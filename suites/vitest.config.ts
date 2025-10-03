import { defineConfig } from "vitest/config"

export default defineConfig({
	test: {
		environment: "node",
		globals: true,
		setupFiles: ["./setup.ts"],
	},
	resolve: {
		alias: {
			"@": "./src",
			"@shared": "./src/shared",
			"@utils": "./src/utils",
		},
	},
})
