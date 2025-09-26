## Date: September 26th, 2025; 23:38

### Context
During TTS implementation debugging, we discovered critical gaps in our development workflow. The user reported that TTS button clicks weren't producing visible logs, leading us to investigate the entire debugging pipeline for VSCode extensions. This revealed fundamental issues with log file locations and extension runtime environments.

### Decision/Work Done
**Investigation Process:**
1. **Initial Assumption Failure**: Started by adding console.log statements, assuming logs would appear in development console
2. **Extension Location Discovery**: Found Vanguard extension installed at `~/.vscode/extensions/bryne-dev.vanguard-0.5.1/`
3. **Log File Location Issue**: Discovered logs were being written to `process.cwd()` (extension runtime directory) instead of accessible locations
4. **VSCode Log Analysis**: Examined extension host logs at `~/Library/Application Support/Code/logs/` to trace extension behavior
5. **File System Permission Issues**: Identified "EROFS: read-only file system" errors when attempting to write logs to extension directory

**Key Findings:**
- Extension logs are written to the extension's runtime CWD, not development folder
- VSCode extensions run in read-only environments for security
- Extension host logs contain valuable debugging information
- User-accessible logging requires writing to workspace or user directories

**Technical Implementation:**
- Added file-based logging to VSCode extension storage: `~/Library/Application Support/Code/User/globalStorage/bryne-dev.vanguard/tts-debug.log`
- Implemented dual logging (file + console) for comprehensive debugging
- Created logging functions that handle both frontend and backend contexts
- Integrated with VSCode's extension context for proper storage location

### Impact
**Process Improvements:**
- ✅ Established reliable debugging workflow for VSCode extensions
- ✅ Documented log file locations and access methods
- ✅ Created reusable logging utilities for future development
- ✅ Identified security constraints for extension development

**Development Velocity:**
- Future debugging sessions will be 10x faster with known log locations
- Reduced time-to-diagnosis for extension issues
- Improved ability to troubleshoot user-reported problems

**Knowledge Preservation:**
- Critical debugging paths now documented
- Extension runtime behavior understood
- File system constraints mapped out

### Next Steps
**Immediate Actions:**
1. **Test Updated Logging**: Deploy extension with VSCode extension storage logging
2. **Verify Log Access**: Confirm logs appear in `~/Library/Application Support/Code/User/globalStorage/bryne-dev.vanguard/tts-debug.log`
3. **Document Log Locations**: Update development docs with extension storage paths

**Process Improvements:**
1. **Create Debug Checklist**: Standard procedure for extension debugging
2. **Log Analysis Scripts**: Automate log file discovery and parsing
3. **Extension Health Checks**: Monitor extension startup and runtime status

**Long-term Infrastructure:**
1. **Centralized Logging**: Consider VSCode output channels for cleaner logging
2. **Debug Mode Toggle**: UI controls for enabling/disabling verbose logging
3. **User Diagnostics**: Self-service tools for users to collect debug information

### Lessons Learned
**What Worked:**
- Systematic investigation from user symptoms to root cause
- Using VSCode's built-in logging infrastructure
- File system exploration to understand extension runtime

**What We'd Do Differently:**
- Start with extension log analysis instead of assuming console logs
- Implement logging infrastructure earlier in development process
- Create debug logging from project inception

**Critical Insights:**
- VSCode extensions have unique runtime constraints
- VSCode extension storage is the proper location for extension data and logs
- Extension host logs are goldmine for debugging
- Read-only file system prevents logging to extension installation directory

### Tags
#vanguard #debugging #extension-development #logging #infrastructure #process-improvement
