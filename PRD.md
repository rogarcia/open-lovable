# Product Requirements Document (PRD)

## AI-Powered Low-Code Development Platform

### Executive Summary
Transform the existing website cloning application into a conversational AI coding platform that enables users to build web applications through natural language descriptions. The platform leverages E2B sandboxes for live execution and multiple AI models for code generation.

### Product Vision
Create a streamlined, accessible platform where users can describe applications in plain English and watch them come to life in real-time, without needing deep coding knowledge.

### Target Users
- Entrepreneurs wanting to prototype ideas quickly
- Designers who need functional prototypes
- Developers seeking rapid prototyping tools
- Students learning web development
- Small businesses needing simple web applications

### Core Functionality

#### 1. Project Initialization
- **Natural Language Input**: Users describe their desired application in plain text
- **Template Selection**: Pre-configured starting points (React app, dashboard, landing page, CRUD app)
- **Instant Sandbox Creation**: Automatic E2B environment provisioning with Vite + React + Tailwind

#### 2. Conversational Development
- **Multi-turn Conversations**: Maintain context across multiple requests
- **Intelligent Edit Mode**: Understand whether to create new files or modify existing ones
- **Real-time Streaming**: Show code generation progress with live updates
- **File Explorer**: Visual representation of project structure

#### 3. Code Execution & Preview
- **Live Preview**: Instant rendering in embedded iframe
- **Hot Module Replacement**: Changes reflect immediately
- **Auto Package Installation**: Detect and install npm dependencies automatically
- **Error Recovery**: Handle and display build errors gracefully

#### 4. Export & Persistence
- **ZIP Download**: Export complete project for local development
- **Sandbox Persistence**: 15-minute sandbox lifetime with ability to recreate
- **Conversation History**: Track all changes and modifications

### Technical Requirements

#### Frontend
- Next.js with TypeScript
- Tailwind CSS for styling
- React Syntax Highlighter for code display
- Framer Motion for animations

#### Backend
- E2B Code Interpreter SDK for sandboxes
- Multiple AI provider support (OpenAI, Anthropic, Google, Groq)
- Streaming responses via Server-Sent Events
- File system management via E2B APIs

#### AI Models
- Primary: GPT-5, Claude Sonnet 4, Gemini 2.5 Pro
- Fallback: Groq models for faster responses
- Context window management for long conversations

### Success Metrics
- Time to first running application < 30 seconds
- Successful code generation rate > 90%
- User can make 5+ iterative changes without errors
- Package auto-installation success rate > 95%

### Out of Scope for MVP
- User authentication/accounts
- Project persistence beyond session
- Collaborative editing
- Custom deployment options
- Visual drag-and-drop builders
- Database integrations

### Constraints
- E2B sandbox timeout: 15 minutes
- Maximum file size: 1MB per file
- Supported frameworks: React only (initially)
- Browser compatibility: Modern browsers only
