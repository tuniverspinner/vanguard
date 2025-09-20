# Quick Fix: XML Parsing Correction (20-30 min implementation)

## Problem
XML parsing fails on malformed tool calls, breaking conversation flow with error messages.

## Solution: Simple 3-Step Fix

### Step 1: Add Detection Function (5 min)
```typescript
// Add to src/core/task/index.ts
private hasMalformedXml(contentBlocks: AssistantMessageContent[]): boolean {
    return contentBlocks.some(block =>
        block.type === "tool_use" &&
        (block.partial || this.hasIncompleteToolCall(block))
    )
}

private hasIncompleteToolCall(block: ToolUse): boolean {
    return block.params.some((param) => {
        if (typeof param === "string") {
            const openTags = (param.match(/<[^/][^>]*>/g) || []).length
            const closeTags = (param.match(/<\/[^>]+>/g) || []).length
            return openTags !== closeTags
        }
        return false
    })
}
```

### Step 2: Add Guidance Function (5 min)
```typescript
private generateXmlCorrectionGuidance(): string {
    return `I notice the tool call format looks incomplete. Please correct it:

Common fixes:
• Ensure all XML tags are properly closed: \`<read_file>\` must have \`</read_file>\`
• Remove extra spaces in tag names: \`<read_file>\` not \`<read_file> \`
• Complete all parameter tags: \`<path>file.txt</path>\`

Please provide the corrected tool call.`
}
```

### Step 3: Replace Error with Guidance (10 min)
```typescript
// In recursivelyMakeClineRequests, replace this:
if (this.hasMalformedXml(this.taskState.assistantMessageContent)) {
    await this.say("error", "Tool call failed!")
    // Error handling...
}

// With this:
if (this.hasMalformedXml(this.taskState.assistantMessageContent)) {
    const guidance = this.generateXmlCorrectionGuidance()
    this.taskState.userMessageContent.push({
        type: "text",
        text: guidance
    })
    return false // Continue loop, let model self-correct
}
```

## Implementation Time: 20-30 minutes

### What This Fixes:
✅ **No more error messages breaking flow**
✅ **Model gets helpful guidance**
✅ **Conversation continues naturally**
✅ **Self-correction enabled**
✅ **Backward compatible**

### Testing (5 min):
1. Test with malformed XML: `<read_file> <path>file.txt</path>`
2. Verify guidance appears as normal conversation
3. Confirm model can self-correct
4. Test edge cases

## Success Criteria:
- ✅ Malformed XML detected
- ✅ Guidance provided without errors
- ✅ Conversation flow maintained
- ✅ Model can self-correct naturally

## Future Enhancements (if needed):
- More specific error detection
- Model-specific guidance
- Learning from correction patterns
- Performance optimization

This is the minimal viable fix that solves your core problem quickly.
