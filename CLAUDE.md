# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# IMPORTANT: Always use pnpm, never npm for this project

# Start development server with Turbopack
pnpm run dev

# Build the application (only test building once each phase is complete)
pnpm build

# Start production server
pnpm start

# Lint the codebase
pnpm run lint

# Run all tests
pnpm run test:all

# Run specific test suites
pnpm run test:integration  # E2B integration tests
pnpm run test:api         # API endpoint tests
pnpm run test:code        # Code execution tests

# Install dependencies
pnpm install
```

## Required Environment Variables

Create `.env.local` with:
```env
# Required
E2B_API_KEY=your_e2b_api_key      # Get from https://e2b.dev
FIRECRAWL_API_KEY=your_firecrawl_api_key  # Get from https://firecrawl.dev

# At least one AI provider required
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

## Architecture Overview

This is a Next.js AI code generation platform that creates and manages React applications in E2B sandboxes. The application allows users to chat with AI to build React apps instantly.

### Core Components

**Main Application (`app/page.tsx`)**
- 3400+ line React component implementing the complete AI-powered development environment
- Dual-mode interface: Home screen for website cloning + main workspace with chat/preview/generation tabs
- Real-time streaming code generation with live file parsing and syntax highlighting
- Advanced state management for generation progress, conversation context, and sandbox synchronization

**Sandbox Management (`app/api/create-ai-sandbox/route.ts`)**
- Creates and manages E2B sandboxes for code execution
- Handles global sandbox state via `global.activeSandbox`
- Manages file caching and synchronization

**Configuration (`config/app.config.ts`)**
- Centralized application configuration
- E2B sandbox settings (15-minute timeout, Vite on port 5173)
- AI model configuration (default: `moonshotai/kimi-k2-instruct`)
- Package installation and file management settings

### Key API Endpoints

- `/api/create-ai-sandbox` - Creates new E2B sandbox instances
- `/api/apply-ai-code-stream` - Applies generated code with streaming
- `/api/generate-ai-code-stream` - Generates code using AI models
- `/api/install-packages` - Handles npm package installation
- `/api/detect-and-install-packages` - Auto-detects and installs packages from XML tags
- `/api/get-sandbox-files` - Retrieves sandbox file structure
- `/api/run-command` - Executes commands in sandbox
- `/api/sandbox-status` - Monitors sandbox health

### Package Detection System

The platform supports XML-based package detection in AI responses:
```xml
<package>react-router-dom</package>
<packages>axios, @heroicons/react</packages>
```

### Global State Management

- `global.activeSandbox` - Current E2B sandbox instance
- `global.sandboxState` - File cache and synchronization state
- `global.existingFiles` - Set of known files in sandbox

### File Management

Supported file extensions are configured in `appConfig.files.textFileExtensions`. The system excludes common build directories and manages file synchronization between the UI and E2B sandbox.

### AI Model Integration

Supports multiple AI providers through the AI SDK:
- OpenAI (GPT-5)
- Anthropic (Claude Sonnet 4)
- Google (Gemini 2.5 Pro)
- Groq/Moonshot (Kimi K2 Instruct - default)

Model selection and configuration is handled in `config/app.config.ts`.

## Key State Management Patterns

**Primary State Variables (app/page.tsx:46-135)**
- `sandboxData`: Current E2B sandbox connection info
- `generationProgress`: Real-time code generation tracking with file parsing
- `conversationContext`: Persistent context including scraped websites, generated components, and applied code history
- `chatMessages`: Chat history with metadata for file references and command outputs
- `activeTab`: Controls preview/generation view switching

**Real-time Streaming Architecture**
- Server-Sent Events (SSE) for live code generation streaming
- Live file parsing using regex patterns to extract `<file>` tags from streamed responses
- Dynamic syntax highlighting and file tree updates during generation
- Progressive file completion tracking with edit detection

**Website Cloning Workflow (`app/page.tsx:1980-2302`)**
1. Screenshot capture via `/api/scrape-screenshot`
2. Content extraction via `/api/scrape-url-enhanced` 
3. Parallel sandbox creation and AI generation
4. Streamed code generation with real-time file preview
5. Automatic code application and iframe refresh

## Important Implementation Notes

- Use `appConfig` from `@/config/app.config` for all configuration values
- Package installations use `--legacy-peer-deps` flag by default
- Vite development server runs on port 5173 in sandboxes
- File operations should respect the `excludePatterns` in config
- Global sandbox state must be properly managed to avoid memory leaks
- Always handle array and object initialization before operations to prevent undefined access errors
- SSE streaming responses must be parsed line-by-line with proper error handling
- File content is parsed using regex: `/<file path="([^"]+)">([^]*?)<\/file>/g`
- Generation progress state tracks both completed files and current file being streamed
- Edit mode detection based on `conversationContext.appliedCode.length > 0`
- Iframe refresh requires timestamp-based cache busting: `${sandboxData.url}?t=${Date.now()}`
- Home screen uses complex animation system with sun/orb effects and style selectors