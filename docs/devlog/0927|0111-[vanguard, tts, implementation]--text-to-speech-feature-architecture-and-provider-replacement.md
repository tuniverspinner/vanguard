## Date: September 27th, 2025; 01:11

# [vanguard, tts, implementation]--text-to-speech-feature-architecture-and-provider-replacement

## Context

The TTS (Text-to-Speech) feature was implemented to enhance accessibility and user experience in the Vanguard VSCode extension. Users requested the ability to have AI-generated responses read aloud, particularly for longer technical explanations or when multitasking. The implementation needed to be robust, handle errors gracefully, and provide clear user feedback.

## Decision/Work Done

### TTS Architecture Overview

The TTS feature consists of three main components:

1. **Frontend UI Component** (`TtsButton.tsx`)
2. **Backend Service** (`TtsService.ts`)
3. **gRPC Communication Layer** (`generateSpeech.ts`, `getCachedSpeech.ts`)

#### Frontend Implementation

**File: `webview-ui/src/components/tts/TtsButton.tsx`**

The TTS button is a React component that:
- Manages audio playback state (idle, loading, playing, error)
- Handles Web Audio API for client-side audio playback
- Provides visual feedback with loading spinners and error tooltips
- Implements HeroTooltip with pale red background for error states
- Automatically downloads generated audio files for debugging

Key features:
- **State Management**: Tracks `isPlaying`, `isLoading`, `error` states
- **Audio Context**: Initializes Web Audio API with proper error handling
- **Error Display**: Pale red tooltip (`bg-red-50 text-red-800`) for immediate error feedback
- **File Download**: Automatic WAV file download for successful generations
- **Timeout Handling**: 30-second timeout with cleanup

#### Backend Implementation

**File: `src/services/tts/TtsService.ts`**

The TTS service handles:
- Hugging Face API integration
- Audio generation and streaming
- Intelligent caching system
- Error handling and logging

Key methods:
- `generateSpeech()`: Main TTS generation with streaming
- `getCachedSpeech()`: Cache retrieval for repeated text
- Comprehensive logging to VSCode extension storage

**File: `src/core/controller/ui/generateSpeech.ts`**

gRPC handler that:
- Validates API keys from VSCode secrets
- Streams audio data in 8KB chunks
- Handles errors by throwing them (allowing gRPC framework to propagate)
- Logs all operations for debugging

#### Communication Layer

**Protocol Buffers** (`proto/cline/ui.proto`):
```protobuf
service UiService {
  rpc generateSpeech(StringRequest) returns (stream Bytes);
  rpc getCachedSpeech(StringRequest) returns (stream Bytes);
  rpc saveApiKey(KeyValuePair) returns (Empty);
}
```

**gRPC Streaming**: Audio data is streamed in chunks to prevent memory issues with large files.

### Provider Architecture

The TTS system is designed for easy provider replacement:

#### Current Provider: Hugging Face

**Configuration**:
- Model: `hexgrad/Kokoro-82M`
- API: Hugging Face Inference API
- Authentication: Bearer token from VSCode secrets
- Audio Format: WAV, 24kHz

**Integration Points**:
1. **API Key Storage**: `controller.stateManager.setSecret("huggingFaceApiKey", key)`
2. **Service Initialization**: `new TtsService(apiKey, logFilePath)`
3. **Audio Generation**: `await ttsService.generateSpeech({ text })`

#### Replacing Providers

To replace with a different TTS provider (OpenAI, ElevenLabs, etc.):

**1. Update TtsService.ts**
```typescript
// Replace Hugging Face API calls with new provider
async generateSpeech(request: TtsRequest): Promise<TtsResponse> {
  // Example: OpenAI TTS
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: request.text,
      voice: 'alloy'
    })
  });

  const audioBuffer = await response.arrayBuffer();
  return {
    audioData: audioBuffer,
    contentType: 'audio/mpeg'
  };
}
```

**2. Update API Key Storage**
```typescript
// In generateSpeech.ts
const apiKey = controller.stateManager.getSecretKey("openaiApiKey");
// or elevenLabsApiKey, etc.
```

**3. Update Settings UI**
```typescript
// In KeysSection.tsx
<h4>Hugging Face API Key</h4>
// Replace with:
// <h4>OpenAI API Key</h4>
// <h4>ElevenLabs API Key</h4>
```

**4. Update Documentation**
- Change model references
- Update API key instructions
- Modify pricing/cost information

#### Alternative Providers Considered

1. **OpenAI TTS**
   - Pros: High quality, multiple voices, reliable
   - Cons: Cost per character, API rate limits
   - Integration: Simple REST API with streaming

2. **ElevenLabs**
   - Pros: Best voice quality, emotional expression
   - Cons: Expensive, limited free tier
   - Integration: REST API with voice selection

3. **Azure Cognitive Services**
   - Pros: Enterprise-grade, multiple languages
   - Cons: Complex setup, Azure account required
   - Integration: SDK available

4. **Google Cloud Text-to-Speech**
   - Pros: Good quality, neural voices
   - Cons: GCP account, complex authentication
   - Integration: gRPC or REST API

### Error Handling Architecture

**Frontend Error States**:
- Network errors → "Failed to generate speech"
- API key issues → "You have exceeded your monthly included credits..."
- Audio decoding → "Failed to play audio"
- Timeout → Automatic cleanup after 30 seconds

**Backend Error Propagation**:
- API errors logged with full context
- gRPC framework handles error transmission
- Frontend receives typed error messages
- User sees immediate red tooltip feedback

### Caching System

**Implementation**:
- Text-based caching (SHA hash of input text)
- File-based storage in VSCode extension directory
- Automatic cache invalidation on service restart

**Benefits**:
- Faster response for repeated text
- Reduced API costs
- Better user experience

## Impact

### User Experience
- ✅ **Accessibility**: Screen reader support for AI responses
- ✅ **Multitasking**: Listen while coding
- ✅ **Error Feedback**: Clear, immediate error indication
- ✅ **File Access**: Automatic audio file downloads for external use

### Technical Foundation
- ✅ **Modular Architecture**: Easy provider replacement
- ✅ **Streaming**: Handles large audio files efficiently
- ✅ **Error Resilience**: Graceful failure handling
- ✅ **Debugging**: Comprehensive logging infrastructure

### Business Impact
- ✅ **Competitive Advantage**: Unique accessibility feature
- ✅ **User Retention**: Enhanced user experience
- ✅ **Extensibility**: Foundation for future audio features

## Next Steps

### Immediate
- **Monitor Usage**: Track TTS adoption and error rates
- **Cost Analysis**: Monitor Hugging Face API usage and costs
- **User Feedback**: Gather feedback on voice quality and feature usefulness

### Short Term (1-2 weeks)
- **Voice Selection**: Add multiple voice options
- **Playback Controls**: Volume, speed, pause/resume
- **Cache Management**: UI for clearing TTS cache

### Medium Term (1-2 months)
- **Provider Options**: Add OpenAI/ElevenLabs as alternatives
- **Language Support**: Multi-language TTS
- **Offline Mode**: Local TTS models for privacy

### Long Term
- **Advanced Features**: Emotional expression, voice cloning
- **Integration**: Audio responses in chat history
- **Analytics**: Usage patterns and performance metrics

## Lessons Learned

### Technical Insights
- **Streaming is Critical**: Large audio files require chunked transfer
- **Error Propagation**: gRPC framework handles complex error scenarios well
- **Web Audio API**: Requires user interaction for initialization
- **Caching Strategy**: Text-based hashing works well for TTS

### Process Insights
- **Incremental Development**: Start with basic functionality, add polish later
- **User Testing**: Early user feedback caught UI/UX issues
- **Error Handling**: Invest time in comprehensive error states
- **Documentation**: Devlogs are crucial for complex feature maintenance

### What We'd Do Differently
- **Provider Selection**: Start with OpenAI for reliability, then add alternatives
- **Caching**: Implement LRU cache with size limits from day one
- **Testing**: Add automated tests for error scenarios
- **Monitoring**: Include usage analytics from initial implementation

## Tags
#vanguard #tts #implementation #architecture #provider-replacement #accessibility #streaming #error-handling #caching
