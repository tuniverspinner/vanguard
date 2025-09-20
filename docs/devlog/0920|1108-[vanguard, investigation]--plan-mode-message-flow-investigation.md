## Date: September 20th, 2025; 11:08 AM

### Context
User requested a detailed walkthrough of what happens when a user writes a message to input in Plan Mode within the Vanguard extension. This investigation was prompted by curiosity about the internal message flow and how Plan Mode differs from Act Mode in the VSCode extension architecture.

### Decision/Work Done
Conducted comprehensive investigation of the Plan Mode message flow by:

1. **Explored Webview UI Components**:
   - Examined `ChatTextArea.tsx` - handles user input, mention processing (@), slash commands (/), and send triggers
   - Analyzed `InputSection.tsx` - manages input state and message sending
   - Reviewed `useMessageHandlers.ts` - contains `handleSendMessage` logic for both Plan and Act modes

2. **Analyzed Backend Processing**:
   - Studied `Controller` class in `src/core/controller/index.ts` - handles mode switching and message routing
   - Examined `Task` class in `src/core/task/index.ts` - manages the main execution loop and API requests
   - Investigated `plan_mode_respond` tool implementation and usage patterns

3. **Mapped Complete Flow**:
   - User input → Input processing → Plan Mode detection → Message transmission → Backend processing → API request → Response streaming → UI presentation
   - Identified key differences between Plan Mode (conversational planning) vs Act Mode (tool execution)

### Impact
This investigation provides comprehensive documentation of the Plan Mode message flow, which will be valuable for:

- **Developer Onboarding**: New developers can understand the message flow architecture
- **Debugging**: Clear understanding of where issues might occur in the message pipeline
- **Feature Development**: Foundation for implementing new Plan Mode features
- **Architecture Documentation**: Better understanding of the separation between Plan and Act modes

### Next Steps
1. Consider creating visual diagrams of the message flow for easier comprehension
2. Document similar flows for Act Mode to provide complete comparison
3. Investigate edge cases in message processing (error handling, mode switching, etc.)
4. Update architecture documentation with findings

### Technical Details
**Key Components Involved:**
- `ChatTextArea.tsx` - Input handling and validation
- `useMessageHandlers.ts` - Message sending logic
- `Controller.togglePlanActMode()` - Mode switching
- `Task.initiateTaskLoop()` - Main execution loop
- `plan_mode_respond` tool - Plan Mode response mechanism

**Critical Flow Points:**
- Input validation in `handleSendMessage`
- Mode detection and routing
- gRPC communication between webview and extension
- API request construction with Plan Mode system prompt
- Response streaming and presentation

**Plan vs Act Mode Differences:**
- Plan Mode: Uses `plan_mode_respond` tool, allows exploration tools, conversational focus
- Act Mode: Executes all tools including destructive ones, implementation focus

### Lessons Learned
- The architecture clearly separates planning from execution phases
- gRPC provides efficient communication between webview and extension
- Streaming responses allow for real-time UI updates
- Mode switching preserves message context seamlessly

#vanguard #investigation #architecture #plan-mode #message-flow #documentation
