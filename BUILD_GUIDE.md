# Vanguard Extension Build Guide

This guide explains how to compile and package the Vanguard VSCode extension.

## Prerequisites

- Node.js and npm installed
- All dependencies installed: `npm install`

## Build Steps

### 1. Build the Webview UI
```bash
npm run build:webview
```
This compiles the React frontend that runs in the extension's webview panel.

### 2. Compile the Extension
```bash
npm run compile
```
This compiles TypeScript code, runs type checking, and performs linting.

### 3. Package to VSIX
```bash
npm run package
```
This runs the full build pipeline and creates the VSIX file.

### Alternative: Direct VSIX Packaging
```bash
npx vsce package --out dist/vanguard.vsix
```

## Installation

1. Open VSCode
2. Go to Extensions (Ctrl+Shift+X)
3. Click the "..." menu → "Install from VSIX..."
4. Select the generated `.vsix` file from the `dist/` directory

## Development Workflow

For continuous development with auto-rebuild:
```bash
npm run watch
```

## Output

- **Compiled extension**: `dist/extension.js`
- **VSIX package**: `dist/bryne.vsix` (or `dist/vanguard.vsix` if renamed)
- **Webview build**: `webview-ui/build/`

## Troubleshooting

- If you get TypeScript errors, run `npm run check-types` to see detailed issues
- For linting issues, run `npm run lint` to check code quality
- Make sure all dependencies are installed with `npm install`

The extension will include your custom "Vanguard" branding and any code changes you've made.
