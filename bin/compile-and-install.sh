#!/usr/bin/env bash

set -e

echo "🔨 Starting Vanguard compilation and installation..."

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

cd "$PROJECT_DIR"

echo "📦 Installing dependencies..."
npm install

echo "🔧 Compiling extension..."
npm run compile

echo "✅ Compilation complete!"
echo "🔄 Now reload your VSCode window to see the changes"
echo "   Press Cmd+Shift+P and type 'Reload Window'"
