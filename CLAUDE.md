# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vanguard is a VSCode extension that provides a resilient autonomous coding agent with automatic retry functionality for Grok/Anthropic models. It's a fork/variant of Cline that creates/edits files, runs commands, uses browser, and integrates with various AI providers through the Model Context Protocol (MCP).

**Key Technologies:**
- TypeScript (strict mode)
- VSCode Extension API
- React (webview UI)
- Protocol Buffers (gRPC communication)
- esbuild (bundling)
- Biome (linting/formatting)

## Common Commands

### Development
```bash
# Install all dependencies (root + webview-ui)
npm run install:all

# Type-check entire project
npm run check-types

# Lint codebase
npm run lint

# Format and fix issues
npm run format:fix
npm run fix:all  # includes unsafe fixes

# Compile extension (generates dist/)
npm run compile

# Watch mode for development
npm run watch

# Compile standalone version (generates dist-standalone/)
npm run compile-standalone

# Quick compile and install (development workflow)
./bin/compile-and-install.sh
```

### Webview Development
```bash
# Develop webview UI with hot reload
npm run dev:webview

# Build production webview
npm run build:webview

# Test webview components
npm run test:webview
```

### Testing
```bash
# Run all tests (unit + integration)
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# E2E tests with Playwright
npm run test:e2e

# Test with coverage
npm run test:coverage
```

### Protocol Buffers
```bash
# Generate TypeScript from .proto files
npm run protos
```

### Packaging
```bash
# Create VSIX package
npm run package

# Publish to marketplace
npm run publish:marketplace
```

## Architecture

### High-Level Structure

The extension follows a layered architecture:

```
extension.ts → WebviewProvider → Controller → Task
```

**Key Layers:**
1. **Extension Entry** (`src/extension.ts`): VSCode activation, command registration
2. **Webview** (`src/core/webview/`): Manages webview lifecycle and UI communication
3. **Controller** (`src/core/controller/`): Handles messages from webview, orchestrates tasks
4. **Task** (`src/core/task/`): Executes API requests and tool operations (file edits, commands, browser automation)

### Directory Structure

- **`src/core/`**: Core extension logic
  - `controller/`: Message handling and task management
  - `task/`: Main task execution engine (index.ts is ~100KB)
  - `api/`: AI provider integrations (Anthropic, OpenAI, etc.)
  - `storage/`: State management (StateManager with debounced disk persistence)
  - `webview/`: Webview lifecycle management
  - `prompts/`: System prompts for the AI agent
  - `slash-commands/`: Custom slash commands
  - `mentions/`: @ mentions for context

- **`src/hosts/`**: Host environment abstractions
  - `vscode/`: VSCode-specific implementations
  - `external/`: Standalone/external host implementations
  - `host-provider.ts`: Host provider abstraction layer

- **`src/services/`**: Shared services
  - `mcp/`: Model Context Protocol integration (McpHub)
  - `browser/`: Puppeteer-based browser automation
  - `telemetry/`: Analytics and error tracking
  - `auth/`: Authentication services

- **`src/integrations/`**: External integrations
  - `checkpoints/`: Workspace snapshots
  - `git/`: Git commit message generation
  - `diagnostics/`: VS Code problems integration

- **`src/shared/`**: Shared code between extension and webview
  - `proto/`: Protocol Buffer definitions

- **`src/standalone/`**: Standalone mode (cline-core.ts)

- **`webview-ui/`**: React-based webview UI
  - Built with Vite
  - Uses Tailwind CSS and HeroUI
  - Real-time communication via postMessage

### Protocol Buffers

The project uses Protocol Buffers for type-safe communication between components. Proto files are in `proto/` directory:

- `proto/cline/*.proto`: Core message types (state, task, ui, models, etc.)
- `proto/host/*.proto`: Host interface definitions (window, workspace, diff, env)

**Generated files** are in `src/generated/` and should not be edited manually. Regenerate with `npm run protos`.

### State Management

`StateManager` (`src/core/storage/StateManager.ts`) provides in-memory caching with debounced disk persistence:

- **Global State**: Extension-wide settings
- **Workspace State**: Project-specific settings
- **Secrets**: API keys stored in VSCode SecretStorage

State keys are defined in `src/core/storage/state-keys.ts`.

### Path Aliases

TypeScript path aliases are configured in `tsconfig.json`:

```typescript
import { ... } from "@core/..."      // src/core/
import { ... } from "@services/..."  // src/services/
import { ... } from "@shared/..."    // src/shared/
import { ... } from "@utils/..."     // src/utils/
import { ... } from "@hosts/..."     // src/hosts/
```

## Key Patterns

### API Provider Integration

AI provider implementations are in `src/core/api/providers/`. Each provider implements streaming API calls with automatic retry logic for Grok models (see `src/core/api/retry.ts`).

### Tool Execution

The Task class (`src/core/task/index.ts`) implements tool execution:
- File operations (read, write, edit, search)
- Terminal command execution
- Browser automation
- MCP tool calls

Tools are defined in `src/core/task/tools/`.

### MCP Integration

Model Context Protocol servers are managed by `McpHub` (`src/services/mcp/McpHub.ts`):
- Supports stdio, SSE, and HTTP transports
- Settings stored in `mcp_settings.json`
- File watcher for hot-reload

### Webview Communication

Extension ↔ Webview communication uses postMessage:
- Extension sends messages via `postMessageToWebview()`
- Webview sends messages via `vscode.postMessage()`
- Message types defined in proto files

### Retry Logic for Grok

Automatic retry functionality is implemented for Grok models with exponential backoff (see `src/core/api/retry.ts`). This is a key differentiator of Vanguard.

## Development Workflow

1. **Make changes** to TypeScript files
2. **Type-check**: `npm run check-types`
3. **Lint**: `npm run lint`
4. **Compile**: `npm run compile` or use watch mode: `npm run watch`
5. **Test**: Run relevant tests
6. **Reload VSCode**: Press `Cmd+Shift+P` → "Developer: Reload Window"

For rapid iteration: `./bin/compile-and-install.sh` then reload VSCode.

### Webview Development

1. `npm run dev:webview` for hot reload
2. Make changes in `webview-ui/src/`
3. Changes reflect immediately in browser
4. Build for production: `npm run build:webview`

## Testing

- **Unit tests**: Use Mocha, located in `__tests__/` directories
- **Integration tests**: Use VSCode Test API, in `src/test/`
- **E2E tests**: Use Playwright, in `src/test/e2e/`
- **Webview tests**: Use Vitest, in `webview-ui/src/`

Run specific test file:
```bash
# Unit test
npx mocha -r ts-node/register path/to/test.ts

# E2E test
npx playwright test path/to/test.test.ts
```

## Building for Production

```bash
# Full production build
npm run package

# Output: dist/vanguard.vsix
```

Install VSIX: `code --install-extension dist/vanguard.vsix`

## Debugging

- Use VSCode debugger (F5) with launch configurations in `.vscode/launch.json`
- View extension logs: "Developer: Show Logs" → "Extension Host"
- Debug webview: Right-click webview → "Open Webview Developer Tools"

## Important Notes

- Always run `npm run check-types` before committing
- Format code with `npm run format:fix`
- Regenerate proto files after modifying `.proto` files: `npm run protos`
- The extension uses strict TypeScript - no implicit any
- Browser automation requires Chrome/Chromium
- Standalone mode runs without VSCode via gRPC (see `src/standalone/`)
