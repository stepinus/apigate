# API Documentation

## Overview

The API server runs on port 3000 and provides several services:
- GitHub Copilot API integration
- GigaChat service
- OpenRouter API integration
- HLS (HTTP Live Streaming) video streaming

## Base URLs

Each service has its own base URL:
- Copilot: `/copilot/v1`
- GigaChat: `/giga/v1`
- OpenRouter: `/openrouter/v1`
- HLS: `/hls`

## Authentication

- Copilot requires `COPILOT_API_KEY` environment variable
- OpenRouter requires `OPENROUTER_API_KEY` and `OPENROUTER_API_BASE` environment variables
- GigaChat and HLS endpoints don't require authentication

## API Endpoints

### Copilot API (`/copilot/v1`)

#### POST /chat/completions
Streams chat completions from GitHub Copilot.

**Request Body:**
```json
{
    "model": "string",
    "messages": [
        {
            "role": "user|assistant|system",
            "content": "string"
        }
    ]
}
```

**Response:**
Server-Sent Events (SSE) stream with chunks in OpenAI format:
```json
{
    "id": "chatcmpl-...",
    "object": "chat.completion.chunk",
    "created": 1234567890,
    "model": "...",
    "choices": [
        {
            "index": 0,
            "delta": {
                "content": "string"
            },
            "finish_reason": null
        }
    ]
}
```

#### POST /embeddings
Not implemented (returns 501)

#### GET /models
Not implemented (returns 501)

### GigaChat API (`/giga/v1`)

#### POST /chat/completions
Provides chat completions in an Ollama-like format.

**Request Body:**
```json
{
    "messages": [
        {
            "role": "user|assistant|system",
            "content": "string"
        }
    ]
}
```

**Response:**
Server-Sent Events (SSE) stream with text chunks.

#### POST /embeddings
Returns simulated embeddings.

**Response:**
```json
{
    "embeddings": [0.1, 0.2, 0.3, 0.4, 0.5]
}
```

#### GET /models
Returns available GigaChat models.

**Response:**
```json
{
    "models": ["gigachat-small", "gigachat-medium", "gigachat-large"]
}
```

### OpenRouter API (`/openrouter/v1`)

#### POST /chat/completions
Forwards requests to OpenRouter's chat completions API.

**Request Body:**
Standard OpenAI chat completion format.

**Response:**
Server-Sent Events (SSE) stream with OpenRouter's responses.

#### POST /embeddings
Creates embeddings using OpenRouter's API.

**Request Body:**
```json
{
    "model": "text-embedding-ada-002",
    "input": "string or array"
}
```

**Response:**
Standard OpenAI embeddings response format.

#### GET /models
Lists available models from OpenRouter.

**Response:**
Standard OpenAI models list format.

### HLS Streaming (`/hls`)

#### GET /stream/:file
Streams HLS video content.

**Parameters:**
- `:file`: Name of the HLS file (`.m3u8` or `.ts`)

**Response:**
- For `.m3u8` files: `Content-Type: application/vnd.apple.mpegurl`
- For `.ts` files: `Content-Type: video/MP2T`

## Error Handling

All endpoints follow a standard error response format:

```json
{
    "error": "Error description"
}
```

Common HTTP status codes:
- 200: Success
- 404: Resource not found
- 500: Internal server error
- 501: Not implemented

## CORS

CORS is enabled for all endpoints with the following headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: *`
- `Access-Control-Allow-Headers: *`
