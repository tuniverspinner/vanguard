## Date: September 27th, 2025; 01:16

# [vanguard, tts, provider-pivot]--fal-ai-kokoro-tts-provider-replacement-plan

## Context

The TTS feature was successfully implemented using Hugging Face's Kokoro-82M model, but the user encountered monthly recurring pricing that they found unacceptable ("lol fuckoff guys i love u but i don't like monthly recurrent generally"). The user requested a pivot to Fal.ai's Kokoro model at https://fal.ai/models/fal-ai/kokoro/american-english/api, which offers a more favorable pricing model.

## Decision/Work Done

### Fal.ai API Analysis

After researching the Fal.ai Kokoro API through their documentation endpoint, the following key details were identified:

**API Architecture:**
- **Endpoint**: `https://queue.fal.run/fal-ai/kokoro/american-english`
- **Authentication**: Bearer token via `Authorization` header
- **Request Flow**: Queue-based system (submit → poll status → retrieve result)
- **Input Schema**: `{ prompt: string, voice?: string, speed?: number }`
- **Output Schema**: `{ audio: { url: string } }`

**Key Parameters:**
- `prompt`: Text to convert to speech (required)
- `voice`: Voice selection from enum list (default: "af_heart")
- `speed`: Speech speed 0.1-5.0 (default: 1.0)

**Voice Options Available:**
af_heart, af_alloy, af_aoede, af_bella, af_jessica, af_kore, af_nicole, af_nova, af_river, af_sarah, af_sky, am_adam, am_echo, am_eric, am_fenrir, am_liam, am_michael, am_onyx, am_puck, am_santa

### Implementation Plan

The pivot maintains the existing TTS architecture while replacing only the backend API integration:

#### 1. TtsService.ts Replacement
- Remove `@huggingface/inference` dependency
- Implement Fal.ai queue-based API workflow:
  - Submit request to `/fal-ai/kokoro/american-english`
  - Poll status endpoint for completion
  - Retrieve result from response URL
  - Download audio file and return as ArrayBuffer
- Update error handling for Fal.ai response formats
- Change API key storage from `huggingFaceApiKey` to `falApiKey`

#### 2. gRPC Handler Updates (generateSpeech.ts)
- Update API key retrieval to `falApiKey`
- Modify logging references from HuggingFace to Fal.ai
- Maintain existing streaming architecture (Fal.ai returns URLs, so fetch and stream audio data)

#### 3. Settings UI Updates
- Change "Hugging Face API Key" to "Fal.ai API Key" in KeysSection.tsx
- Update any user-facing documentation references

#### 4. Dependencies
- Remove `@huggingface/inference` from package.json
- Leverage existing `axios` for HTTP requests

#### 5. Testing Strategy
- Test basic TTS generation with default parameters
- Verify voice selection functionality
- Test speed parameter adjustments
- Validate error handling for invalid API keys
- Confirm caching system works with new provider

## Impact

### Technical Impact
- **✅ Architecture Preservation**: Frontend and caching systems remain unchanged
- **✅ Feature Continuity**: All existing TTS functionality maintained
- **✅ Performance**: Fal.ai claims faster inference than Hugging Face
- **⚠️ Breaking Change**: API key storage location changes (requires user re-entry)

### Business Impact
- **✅ Cost Optimization**: Eliminates monthly recurring fees
- **✅ User Satisfaction**: Addresses user's pricing concerns
- **✅ Provider Reliability**: Fal.ai offers better SLA than Hugging Face free tier

### User Experience
- **✅ Seamless Transition**: No UI changes required
- **✅ Voice Quality**: Same Kokoro model, potentially better hosting
- **⚠️ Setup Required**: Users need new API key from Fal.ai

## Next Steps

### Immediate (Next Session)
1. **Update TtsService.ts**
   - Replace HuggingFace client with Fal.ai queue implementation
   - Implement submit/poll/retrieve workflow
   - Update error handling and logging

2. **Update gRPC Handler**
   - Change API key retrieval to `falApiKey`
   - Update logging messages

3. **Update Settings UI**
   - Change API key field label and storage key

4. **Remove Dependencies**
   - Remove `@huggingface/inference` from package.json

### Short Term (1-2 days)
- **Testing**: Comprehensive testing with various inputs
- **Documentation**: Update any TTS-related docs
- **User Communication**: Notify about API key requirement

### Validation Checklist
- [ ] Basic TTS generation works
- [ ] Voice selection functions
- [ ] Speed parameter adjustments work
- [ ] Error handling for invalid keys
- [ ] Caching system integration
- [ ] Streaming to frontend works
- [ ] No breaking changes to existing UI

## Lessons Learned

### Technical Insights
- **Queue-based APIs**: More complex than direct APIs but offer better scalability
- **Provider Evaluation**: Always research pricing models before implementation
- **Architecture Benefits**: Modular design allowed easy provider swap

### Process Insights
- **Devlog Planning**: Writing implementation plans before coding improves execution
- **API Research**: Direct curl of OpenAPI schemas provides comprehensive understanding
- **User Feedback**: Pricing concerns should be addressed immediately

### What We'd Do Differently
- **Provider Selection**: Research pricing models during initial evaluation
- **Fallback Options**: Consider multiple providers from day one
- **Cost Monitoring**: Include usage tracking from initial implementation

## Tags
#vanguard #tts #provider-pivot #fal-ai #kokoro #api-migration #queue-based-api #cost-optimization
