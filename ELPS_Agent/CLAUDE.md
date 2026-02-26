# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Single-file HTML application (`ELPS_Agent.html`) — a knowledge-base Q&A tool for English Language Proficiency Standards (ELPS) documents. Part of the Manager_of_Multilingual_ESL_Coordinators suite. See the parent `CLAUDE.md` for shared conventions.

## Development

Open `ELPS_Agent.html` directly in a browser. No build step, no dependencies except PDF.js 4.0.379 via jsDelivr CDN (ESM module).

## Conventions (inherited from parent project)

- **ES5-ish JS**: `var` only, no arrow functions, no `let`/`const`, no template literals.
- **`<script type="module">`** required for PDF.js ESM imports. All functions called from `onclick` must be assigned to `window.*`.
- CSS in `<style>` in `<head>`, JS in a single `<script>` before `</body>`.
- Blue gradient header, Segoe UI, white cards, `#f0f2f7` background. Dark mode via CSS custom properties on `body.dark`.

## Architecture

### Data Flow

```
PDF Upload → PDF.js text extraction → paragraph-aware chunking → inverted index → localStorage
                                                                        ↓
User Query → tokenize → inverted index lookup → TF-IDF scoring → top results
                                                                        ↓
                                                            Search Mode: render snippets
                                                            AI Mode:    send top 5 chunks + query to LLM → stream response
```

### Pre-loaded Documents

`PRELOADED_DOCS` array embeds full extracted text from both ELPS PDFs as chunk arrays. On first load (empty localStorage), these are automatically ingested so the app works immediately without manual upload.

### Multi-Provider AI Streaming

`callAIStreaming()` dispatches to provider-specific functions based on `settings.provider`:

| Provider | Function | Endpoint | Stream Format |
|---|---|---|---|
| Ollama (default) | `callOllamaStreaming` | `POST {url}/api/chat` | newline-delimited JSON |
| Anthropic | `callAnthropicStreaming` | `POST api.anthropic.com/v1/messages` | SSE (`content_block_delta`) |
| OpenAI | `callOpenAIStreaming` | `POST api.openai.com/v1/chat/completions` | SSE (`choices[0].delta.content`) |

Default: Ollama at `http://localhost:11435` with `qwen2.5:14b`.

### Search Engine

- Chunks tokenized on creation (lowercased, alphanumeric, >1 char)
- Inverted index maps tokens → chunk IDs
- Scoring: TF-IDF base + boosts for ELPS code match (+50), proficiency level (+20), language domain (+15)
- Quick filter chips modify query with ELPS codes, domains, and proficiency levels

### Key Function Groups

- **State**: `collectState()`, `applyState()`, `saveToStorage()`, `loadFromStorage()`, `scheduleSave()` (debounced 800ms)
- **PDF processing**: `reconstructPageText()`, `makeChunk()`, `chunkPageText()`, `handleFileUpload()`
- **Search**: `searchKnowledgeBase()`, `scoreChunk()`, `extractSnippet()`
- **AI dispatch**: `callAIStreaming()` → `callOllamaStreaming()` / `callAnthropicStreaming()` / `callOpenAIStreaming()`
- **Chat**: `addChatMessage()`, `renderChat()`, `renderChatBubble()`, `handleAskQuestion()`, `clearChat()`
- **Documents**: `addDocument()`, `removeDocument()`, `renderDocList()`, tags and chunk editing
- **UI**: `renderStats()`, `renderQuickFilters()`, `renderCoverageMap()`, `showPopularQueries()`

### localStorage Keys

| Key | Purpose |
|---|---|
| `elps_agent_docs` | Document records with extracted text chunks |
| `elps_agent_index` | Inverted search index (rebuildable from docs) |
| `elps_agent_settings` | Provider, API keys, model, system prompt |
| `elps_agent_history` | Query history (max 200) |
| `elps_agent_chat` | Chat messages (max 50) |
| `elps_agent_onboarded` | Onboarding tour completion flag |
| `elps_agent_dark` | Dark mode preference |

### AI Follow-up Questions

The system prompt instructs the LLM to append follow-up suggestions after a `---FOLLOWUPS---` delimiter. The renderer parses this to display clickable follow-up chips below AI responses.

### Conversation Context

AI mode sends the last 6 chat messages (from `chatMessages`) as conversation history in each API call via `buildConversationMessages()`.
