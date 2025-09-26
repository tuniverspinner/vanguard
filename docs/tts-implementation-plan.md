# Kokoro-82M TTS Implementation Plan

## Overview
Implement text-to-speech functionality using Hugging Face's Kokoro-82M model to allow users to listen to AI assistant messages in the Vanguard VSCode extension.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Webview UI    │    │     gRPC        │    │   Extension     │
│                 │    │   Protocol      │    │   Backend       │
│ ┌─────────────┐ │    │                 │    │                 │
│ │  TTS Button │◄┼────┼─► TTS Service  │    │ ┌─────────────┐ │
│ │  (Speaker)  │ │    │                 │    │ │ TTS Service │ │
│ └─────────────┘ │    │                 │    │ │ (HuggingFace)│ │
│                 │    │                 │    │ └─────────────┘ │
│ Audio Playback │◄┼────┼─► Audio Stream │    │                 │
│ (Web Audio API)│ │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Implementation Components

### 1. Backend TTS Service (`src/services/tts/`)

**Files to create:**
- `src/services/tts/TtsService.ts` - Main TTS service class
- `src/services/tts/types.ts` - TypeScript interfaces
- `src/services/tts/cache.ts` - Audio caching logic

**Responsibilities:**
- Interface with Hugging Face Inference API
- Handle Kokoro-82M model requests
- Cache generated audio files
- Stream audio data to frontend

**Key Implementation:**
```typescript
class TtsService {
  async generateSpeech(text: string, voice: string = 'af'): Promise<ArrayBuffer> {
    // Call Hugging Face API
    // Cache result
    // Return audio buffer
  }
}
```

### 2. gRPC Protocol Updates (`proto/`)

**Files to modify:**
- `proto/ui.proto` - Add TTS service definition

**New RPC Methods:**
```protobuf
service UiService {
  // ... existing methods

  // Text-to-speech for messages
  rpc generateSpeech(StringRequest) returns (stream BytesResponse);
  rpc getCachedSpeech(StringRequest) returns (stream BytesResponse);
}
```

**Generated files (auto-generated):**
- `src/generated/ui.ts`
- `src/shared/proto/ui.ts`

### 3. Backend Controller (`src/core/controller/ui/`)

**Files to create:**
- `src/core/controller/ui/generateSpeech.ts`
- `src/core/controller/ui/getCachedSpeech.ts`

**Implementation:**
- Handle TTS requests from frontend
- Coordinate with TtsService
- Stream audio data back to client

### 4. Frontend TTS Components (`webview-ui/src/components/tts/`)

**Files to create:**
- `webview-ui/src/components/tts/TtsButton.tsx` - Speaker button component
- `webview-ui/src/components/tts/AudioPlayer.tsx` - Audio playback logic
- `webview-ui/src/components/tts/types.ts` - Frontend types

**TTS Button Features:**
- Speaker icon that toggles play/pause
- Loading state during TTS generation
- Error handling for failed requests
- Only visible on assistant text messages

### 5. Message Integration (`webview-ui/src/components/chat/`)

**Files to modify:**
- `webview-ui/src/components/chat/ChatRow.tsx`

**Integration Points:**
- Add TTS button to assistant message rows
- Position next to existing copy button
- Pass message text to TTS service
- Handle audio playback state

### 6. Audio Management (`webview-ui/src/services/`)

**Files to create:**
- `webview-ui/src/services/audioService.ts`

**Features:**
- Web Audio API integration
- Audio caching in browser storage
- Concurrent playback management
- Volume and playback controls

## Technical Details

### Hugging Face Integration
- **Model**: `hexgrad/Kokoro-82M`
- **API**: Hugging Face Inference API
- **Authentication**: Use existing API key management
- **Caching**: Browser localStorage for audio files

### Audio Format
- **Output**: WAV/MP3 from Kokoro model
- **Playback**: Web Audio API in browser
- **Caching**: Base64 encoded audio data

### Error Handling
- Network failures during TTS generation
- Invalid audio data
- Browser audio playback restrictions
- Model rate limiting

## Implementation Steps

### Phase 1: Backend Infrastructure
1. Create TTS service with Hugging Face integration
2. Add gRPC protocol definitions
3. Implement backend controllers
4. Test TTS generation endpoint

### Phase 2: Frontend Components
1. Create TTS button component
2. Implement audio playback service
3. Add audio caching logic
4. Integrate button into ChatRow

### Phase 3: Integration & Testing
1. Connect frontend to backend TTS service
2. Add error handling and loading states
3. Test with various message types
4. Performance optimization

## MVP Scope (Simplified)
- ✅ Single play button per message
- ✅ No settings panel needed
- ✅ Hugging Face API (no local model)
- ✅ Basic audio caching
- ✅ Error handling for failed requests

## Future Enhancements (Post-MVP)
- Voice selection
- Playback speed control
- Auto-play settings
- Offline TTS caching
- Bulk TTS generation

## Dependencies
- **Backend**: Add Hugging Face JS client
- **Frontend**: Web Audio API (built-in)
- **Protocol**: Update protobuf definitions

## Testing Strategy
- Unit tests for TTS service
- Integration tests for gRPC endpoints
- E2E tests for audio playback
- Cross-browser audio compatibility

## Performance Considerations
- Audio caching to avoid repeated API calls
- Streaming audio for large responses
- Background TTS generation for long messages
- Memory management for audio buffers
