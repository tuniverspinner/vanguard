#!/bin/bash

# Vanguard Extension Compile Script
# This script compiles the entire project with streaming output
# Uses npm run package which already includes all necessary steps

set -o pipefail  # Exit on pipe failures but continue on command failures
set -x          # Show commands being executed

echo "🚀 Starting Vanguard Extension Compile Process"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to run command and continue even if it fails
run_command() {
    local cmd="$1"
    local step_name="$2"

    echo -e "\n${BLUE}📋 Step: ${step_name}${NC}"
    echo -e "${YELLOW}Command: ${cmd}${NC}"

    # Run the command and capture both stdout and stderr
    if eval "$cmd" 2>&1; then
        echo -e "${GREEN}✅ ${step_name} completed successfully${NC}"
        return 0
    else
        local exit_code=$?
        echo -e "${RED}❌ ${step_name} failed with exit code ${exit_code}${NC}"
        echo -e "${YELLOW}⚠️  Build failed - check output above for details${NC}"
        return $exit_code
    fi
}

echo -e "\n${BLUE}🔧 Running Full Build Pipeline${NC}"
echo -e "${YELLOW}This includes: type checking, webview build, linting, and VSIX packaging${NC}"

# Run the complete build pipeline (no duplication)
run_command "npm run package" "Full Build Pipeline"

echo -e "\n=========================================="

if [ $? -eq 0 ]; then
    echo -e "${GREEN}🎉 Compilation completed successfully!${NC}"
    echo -e "${GREEN}📦 VSIX file created${NC}"

    # List the generated files
    echo -e "\n${BLUE}📁 Generated files:${NC}"
    find . -name "*.vsix" -type f -exec ls -la {} \; 2>/dev/null || echo "No VSIX files found"
else
    echo -e "${RED}💥 Compilation failed${NC}"
    echo -e "${YELLOW}🔍 Check the output above for error details${NC}"
    exit 1
fi

echo -e "\n${BLUE}✨ Compile process finished${NC}"
