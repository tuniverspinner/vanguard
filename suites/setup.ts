// Vitest setup for xAI model testing
import { beforeAll } from "vitest"

// Mock environment variables for testing
beforeAll(() => {
	// Set up test environment
	process.env.NODE_ENV = "test"

	// Mock any external dependencies if needed
})
