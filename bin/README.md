# Bin Scripts

This directory contains executable scripts for the Vanguard project.

## compile.sh

A streamlined compile script that builds the entire Vanguard extension with streaming output.

### Features

- **One-command compilation**: Run the complete build pipeline with a single command
- **Streaming output**: Shows all command output in real-time, including errors
- **No duplication**: Uses `npm run package` which efficiently handles all build steps
- **Colored output**: Uses colors to clearly indicate success/failure states
- **File detection**: Automatically finds and lists generated VSIX files

### Usage

```bash
# Make sure you're in the project root directory
cd /path/to/vanguard

# Run the compile script
./bin/compile.sh
```

### What it does

The script runs the complete build pipeline using `npm run package`, which includes:

1. **Type Checking** (`npm run check-types`)
   - Protocol buffer generation
   - TypeScript compilation checks
   - Webview TypeScript checks

2. **Webview UI Build** (`npm run build:webview`)
   - Compiles the React frontend
   - Builds with Vite for production

3. **Linting** (`npm run lint`)
   - Code quality checks with Biome
   - Protocol buffer linting

4. **VSIX Packaging** (`node esbuild.mjs --production`)
   - Extension bundling
   - VSIX file creation

### Output

The script provides clear status indicators:

- ✅ **Green checkmarks** for successful completion
- ❌ **Red X marks** for failures
- 📋 **Step indicators** showing current progress
- 📁 **File listings** of generated VSIX files

### Error Handling

- **Complete output visibility**: All command output (stdout/stderr) is streamed to console
- **Exit codes displayed**: Shows specific exit codes when commands fail
- **Clear error reporting**: Provides guidance on what went wrong

### Example Output

```
🚀 Starting Vanguard Extension Compile Process
==============================================

🔧 Running Full Build Pipeline
This includes: type checking, webview build, linting, and VSIX packaging

📋 Step: Full Build Pipeline
Command: npm run package
✅ Full Build Pipeline completed successfully

==========================================
🎉 Compilation completed successfully!
📦 VSIX file created

📁 Generated files:
-rw-r--r-- 1 user staff 12345678 Sep 19 07:34 vanguard.vsix

✨ Compile process finished
```

### Troubleshooting

- **Permission denied**: Make sure the script is executable: `chmod +x bin/compile.sh`
- **Command not found**: Ensure you're running from the project root directory
- **Build failures**: Check the detailed output for specific error messages
- **Missing VSIX**: The script searches the entire project for `.vsix` files

### Requirements

- Node.js and npm installed
- All project dependencies installed (`npm install`)
- Executable permissions on the script file

### Changes from Previous Version

- **Renamed**: `build.sh` → `compile.sh` (more accurate naming)
- **Simplified**: Removed command duplication by using `npm run package` directly
- **Faster**: No redundant build steps
- **Output**: Now generates `vanguard.vsix` instead of `bryne.vsix`
