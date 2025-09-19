#!/bin/bash

# Vanguard Extension Compile & Install Script
# This script compiles the entire project and installs the extension
# Uses npm run package which already includes all necessary steps

set -o pipefail  # Exit on pipe failures but continue on command failures
set -x          # Show commands being executed

echo "🚀 Starting Vanguard Extension Compile & Install Process"
echo "======================================================="

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

# Check if build was successful before attempting install
if [ $? -eq 0 ]; then
    echo -e "\n${BLUE}📦 Installing Extension${NC}"
    echo -e "${YELLOW}Installing the generated VSIX file${NC}"

    # Find the VSIX file (should be in dist/ directory)
    VSIX_FILE=$(find dist -name "*.vsix" -type f | head -1)

    if [ -z "$VSIX_FILE" ]; then
        echo -e "${RED}❌ No VSIX file found in dist/ directory${NC}"
        exit 1
    fi

    echo -e "${BLUE}📁 Found VSIX file: ${VSIX_FILE}${NC}"

    # Install the extension
    run_command "code --install-extension \"$VSIX_FILE\" --force" "Extension Installation"

    if [ $? -eq 0 ]; then
        echo -e "\n${GREEN}🎉 Extension compiled and installed successfully!${NC}"
        echo -e "${GREEN}🔄 You may need to reload VSCode to use the new version${NC}"
    else
        echo -e "\n${RED}💥 Extension installation failed${NC}"
        exit 1
    fi
else
    echo -e "${RED}💥 Build failed - skipping installation${NC}"
    exit 1
fi

echo -e "\n======================================================="
echo -e "${BLUE}✨ Compile & Install process finished${NC}"
