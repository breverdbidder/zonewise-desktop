# Smart Router Documentation

## Overview

The Smart Router is a TypeScript-native LLM routing system inspired by liteLLM, providing intelligent model selection, automatic fallback, and retry logic for ZoneWise V2's Craft Agent UI.

**Key Features:**
- **Purpose-specific routing** - Automatically selects optimal models based on task type
- **Multi-provider support** - Claude (Anthropic), Gemini (Google), GPT (OpenAI)
- **Automatic fallback** - Retries with alternative models on failure
- **Cost tracking** - Calculates and reports token usage costs
- **Retry logic** - Exponential backoff for transient failures
- **Zero configuration** - Works out of the box with Manus Forge API

---

## Architecture

### Components

1. **`models.ts`** - Model definitions and pricing
2. **`smartRouter.ts`** - Routing logic and fallback handling
3. **`llm.ts`** - Low-level LLM invocation (updated to accept model parameter)

### Model Selection Flow

```
User Request
    ↓
Purpose Detection (chat, tool_calling, extraction, summarization)
    ↓
Primary Model Selection (based on purpose)
    ↓
Attempt LLM Call
    ↓
Success? → Return Result
    ↓
Failure? → Retry (exponential backoff)
    ↓
Still Failing? → Fallback to Next Model
    ↓
Exhausted All Models? → Throw Error
```

---

## Model Configuration

### Available Models

| Model | Provider | Context | Cost (Input/Output per 1M tokens) | Use Case |
|-------|----------|---------|-----------------------------------|----------|
| **Gemini 2.5 Flash** | Google | 1M | $0.15 / $0.60 | Primary chat, tool calling |
| **Gemini 2.0 Flash** | Google | 1M | Free (preview) | Cost-sensitive tasks |
| **Gemini 1.5 Pro** | Google | 2M | $1.25 / $5.00 | Long context tasks |
| **Claude Opus 4.5** | Anthropic | 200K | $15.00 / $75.00 | High-quality extraction |
| **Claude Sonnet 4.5** | Anthropic | 200K | $3.00 / $15.00 | Balanced performance |
| **Claude Haiku 4.5** | Anthropic | 200K | $0.80 / $4.00 | Fast responses |
| **GPT-4o** | OpenAI | 128K | $2.50 / $10.00 | OpenAI alternative |
| **GPT-4o Mini** | OpenAI | 128K | $0.15 / $0.60 | Cost-efficient GPT |
| **GPT-3.5 Turbo** | OpenAI | 16K | $0.50 / $1.50 | Legacy support |

### Purpose-Specific Routing

**Chat (Main Conversations)**
```typescript
Primary: Gemini 2.5 Flash (fast, cheap, good quality)
Fallback 1: Claude Sonnet 4.5 (higher quality)
Fallback 2: GPT-4o Mini (OpenAI alternative)
```

**Tool Calling (Zoning Data Queries)**
```typescript
Primary: Gemini 2.5 Flash (excellent tool support)
Fallback 1: Claude Sonnet 4.5 (reliable tools)
Fallback 2: GPT-4o (OpenAI tools)
```

**Extraction (Data Parsing)**
```typescript
Primary: Claude Opus 4.5 (best quality)
Fallback 1: GPT-4o (GPT-4 quality)
Fallback 2: Gemini 1.5 Pro (Gemini Pro)
```

**Summarization (Large Text)**
```typescript
Primary: Gemini 2.5 Flash (fast and cheap)
Fallback 1: Claude Haiku 4.5 (fast Claude)
Fallback 2: GPT-4o Mini (cheap GPT)
```

---

## Usage

### Basic Usage

```typescript
import { smartChat, smartToolCall } from './server/_core/smartRouter';

// Chat completion
const response = await smartChat({
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is zoning?' },
  ],
});

// Tool calling
const toolResponse = await smartToolCall({
  messages: [
    { role: 'user', content: 'Search for RS-1 zoning in Melbourne' },
  ],
  tools: ZONING_TOOLS,
  tool_choice: 'auto',
});
```

### Advanced Options

```typescript
import { smartRouter } from './server/_core/smartRouter';

const response = await smartRouter(
  {
    messages: [...],
    tools: [...],
  },
  {
    purpose: 'extraction',      // Override purpose
    forceModel: 'claude-opus-4-5', // Force specific model
    maxRetries: 5,               // Increase retries
    enableFallback: true,        // Enable fallback models
    onAttempt: (attempt) => {    // Monitor attempts
      console.log(`Attempt ${attempt.attemptNumber}: ${attempt.modelName}`);
      if (attempt.success) {
        console.log(`Cost: $${attempt.cost?.toFixed(4)}`);
      }
    },
  }
);

// Access routing metadata
console.log(response.routerMetadata);
// {
//   purpose: 'extraction',
//   attempts: [...],
//   totalCost: 0.0234,
//   totalLatencyMs: 1523,
//   fallbackUsed: false
// }
```

### Convenience Wrappers

```typescript
// Chat
await smartChat(params, options);

// Tool calling
await smartToolCall(params, options);

// Extraction
await smartExtract(params, options);

// Summarization
await smartSummarize(params, options);
```

---

## Fallback & Retry Logic

### Retry Strategy

1. **Exponential Backoff**: 1s → 2s → 4s → 8s (max 10s)
2. **Max Retries**: 3 attempts per model (configurable)
3. **Transient Errors**: Rate limits, timeouts, network issues

### Fallback Strategy

1. **Try Primary Model** (3 retries with backoff)
2. **Try Fallback 1** (3 retries with backoff)
3. **Try Fallback 2** (3 retries with backoff)
4. **Throw Error** (all attempts exhausted)

### Example Scenario

```
User sends message
  ↓
smartToolCall() with purpose='tool_calling'
  ↓
Attempt 1: Gemini 2.5 Flash → Rate Limited (429)
  ↓
Wait 1s, Retry
  ↓
Attempt 2: Gemini 2.5 Flash → Timeout
  ↓
Wait 2s, Retry
  ↓
Attempt 3: Gemini 2.5 Flash → Success! ✓
  ↓
Return result with metadata:
{
  attempts: [
    { attemptNumber: 1, modelName: 'Gemini 2.5 Flash', success: false, error: 'Rate limited' },
    { attemptNumber: 2, modelName: 'Gemini 2.5 Flash', success: false, error: 'Timeout' },
    { attemptNumber: 3, modelName: 'Gemini 2.5 Flash', success: true, cost: 0.0012 }
  ],
  totalCost: 0.0012,
  fallbackUsed: false
}
```

---

## Cost Tracking

### Automatic Cost Calculation

The smart router automatically calculates costs based on:
- Model pricing (input/output per 1M tokens)
- Actual token usage from LLM response
- All retry attempts (including failures)

### Cost Metadata

```typescript
const response = await smartChat({...});

console.log(response.routerMetadata.totalCost); // 0.0234 (USD)
console.log(response.routerMetadata.attempts[0].cost); // 0.0234 (USD)
```

### Cost Optimization Tips

1. **Use Gemini 2.5 Flash** for most tasks (15¢ per 1M input tokens)
2. **Reserve Claude Opus** for critical extraction tasks
3. **Enable fallback** to cheaper models on primary failure
4. **Monitor costs** via `onAttempt` callback

---

## Integration with Existing Code

### Chat Router Integration

```typescript
// Before (direct invokeLLM)
const response = await invokeLLM({
  messages: [...],
  tools: ZONING_TOOLS,
});

// After (smart router)
const response = await smartToolCall({
  messages: [...],
  tools: ZONING_TOOLS,
});
```

### Tool Calling Integration

```typescript
// Step 1: Initial tool call
const firstResponse = await smartToolCall({
  messages: [...],
  tools: ZONING_TOOLS,
  tool_choice: 'auto',
});

// Step 2: Follow-up with tool results
const finalResponse = await smartChat({
  messages: [
    ...previousMessages,
    { role: 'assistant', content: '', tool_calls: [...] },
    ...toolResultMessages,
  ],
});
```

---

## Environment Variables

**No additional environment variables required!**

The smart router uses the existing Manus Forge API configuration:
- `BUILT_IN_FORGE_API_URL` - Manus Forge API endpoint
- `BUILT_IN_FORGE_API_KEY` - Authentication token

All models (Claude, Gemini, GPT) are accessible through the unified Forge API.

---

## Future Enhancements

### Planned Features

1. **Model Selection UI** - Allow users to choose preferred models
2. **Streaming Support** - Real-time token streaming with smart routing
3. **Cost Budgets** - Set per-session or per-user cost limits
4. **Performance Analytics** - Track model performance over time
5. **Custom Routing Rules** - User-defined purpose-specific routing
6. **A/B Testing** - Compare model performance for same prompts

### Extending the Router

**Add a New Model:**

```typescript
// In models.ts
export const MODELS: Record<string, ModelDefinition> = {
  ...
  'new-model': {
    id: 'new-model-id',
    name: 'New Model Name',
    provider: 'provider',
    contextWindow: 100000,
    inputCostPer1M: 1.00,
    outputCostPer1M: 3.00,
    supportsTools: true,
    supportsVision: false,
    maxOutputTokens: 4096,
  },
};
```

**Add a New Purpose:**

```typescript
// In models.ts
export const PURPOSE_MODELS: Record<ModelPurpose, string[]> = {
  ...
  custom_purpose: [
    'primary-model',
    'fallback-1',
    'fallback-2',
  ],
};
```

---

## Troubleshooting

### Common Issues

**Issue: "Smart router exhausted all attempts"**
- **Cause**: All models failed after retries
- **Solution**: Check API keys, network connectivity, and Forge API status

**Issue: High costs**
- **Cause**: Using expensive models (Claude Opus) for all tasks
- **Solution**: Review purpose-specific routing, ensure proper purpose detection

**Issue: Slow responses**
- **Cause**: Multiple retries and fallbacks
- **Solution**: Reduce `maxRetries`, disable fallback for time-sensitive tasks

**Issue: Model not found**
- **Cause**: Invalid model ID in `forceModel` option
- **Solution**: Use model aliases from `MODELS` object

### Debugging

Enable attempt logging:

```typescript
const response = await smartChat(
  { messages: [...] },
  {
    onAttempt: (attempt) => {
      console.log(JSON.stringify(attempt, null, 2));
    },
  }
);
```

---

## Comparison with liteLLM

| Feature | liteLLM (Python) | Smart Router (TypeScript) |
|---------|------------------|---------------------------|
| Language | Python | TypeScript |
| Providers | 100+ | 3 (Claude, Gemini, GPT) via Manus Forge |
| Purpose Routing | ✓ | ✓ |
| Fallback Logic | ✓ | ✓ |
| Retry Logic | ✓ | ✓ (exponential backoff) |
| Cost Tracking | ✓ | ✓ |
| Streaming | ✓ | ✗ (planned) |
| Proxy Server | ✓ | ✗ (not needed) |
| Configuration | Complex | Zero-config |
| Integration | External service | Native to codebase |

**Why build our own?**
- liteLLM is Python-only, zonewise-v2 is TypeScript
- Manus Forge API provides unified access to all providers
- Native integration = no external dependencies
- Full control over routing logic and costs
- Simpler deployment (no proxy server needed)

---

## Credits

Inspired by [liteLLM](https://docs.litellm.ai/) by BerriAI.

Built for ZoneWise V2 Craft Agent UI by the ZoneWise team.
