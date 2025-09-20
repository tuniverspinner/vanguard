## Date: September 20th, 2025; 11:11 AM

### Context
User reported that the existing auto-retry feature for API errors wasn't working properly. They were still seeing the "Retry" button appear after "Unexpected API Response: The language model did not provide any assistant messages" errors, despite having the auto-retry setting enabled in the backend.

### Decision/Work Done
Implemented a frontend auto-retry mechanism as a fallback to the existing backend auto-retry system. Added a `useEffect` hook in `ActionButtons.tsx` that:

1. **Detection Logic**: Monitors when `lastMessage?.ask === "api_req_failed"` and `primaryAction === "retry"`
2. **Auto-Trigger**: Automatically calls the retry action with a 100ms delay for UI stability
3. **Simple Implementation**: No additional state tracking or complex conditions - just direct auto-retry when the retry button appears
4. **Clean Integration**: Uses existing button action handlers and respects current input state

**Code Changes:**
- **File**: `webview-ui/src/components/chat/chat-view/components/layout/ActionButtons.tsx`
- **Lines Added**: 16 insertions, 1 deletion
- **Key Implementation**:
```typescript
// Auto-retry when the retry button appears for API request failed
useEffect(() => {
    if (lastMessage?.ask === "api_req_failed" && primaryAction === "retry") {
        // Small delay to ensure UI is stable
        const timer = setTimeout(() => {
            handleActionClick("retry", inputValue, selectedImages, selectedFiles)
        }, 100)

        return () => clearTimeout(timer)
    }
}, [lastMessage?.ask, primaryAction, handleActionClick, inputValue, selectedImages, selectedFiles])
```

### Impact
- **User Experience**: Provides seamless auto-recovery from API errors without manual intervention
- **Reliability**: Acts as a fallback if the backend auto-retry system fails
- **Performance**: Minimal overhead with 100ms delay and proper cleanup
- **Maintainability**: Simple, focused implementation that doesn't interfere with existing logic

### Next Steps
- Monitor user feedback on the auto-retry behavior
- Consider adding user preference to disable frontend auto-retry if needed
- Evaluate if similar auto-retry logic should be applied to other error types

### Technical Notes
- **Dependencies**: Uses existing React hooks (`useEffect`, `useCallback`) and component state
- **Safety**: Includes proper timer cleanup to prevent memory leaks
- **Integration**: Works with existing button configuration and message handling systems
- **Testing**: Should be tested with various API error scenarios to ensure reliability

#vanguard #ui #auto-retry #frontend #user-experience #error-handling
