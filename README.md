# Agent-Dev Desktop Assistant

A desktop application with ChatGPT-like interface for AI-powered development assistance. The app features automatic project detection, local LLM integration with internet fallback, and a modern chat interface similar to Warp.

## Features

🤖 **Dual LLM Support**
- Local LLM (Ollama) for privacy and speed
- Internet-based LLM (OpenAI) as fallback
- Automatic fallback when local LLM is unavailable

🎯 **Project-Aware Assistant**
- Automatic project scanning and detection
- Context-aware responses based on selected project
- Support for multiple programming languages and frameworks

💬 **Modern Chat Interface**
- ChatGPT-like conversation experience
- Real-time message streaming
- Code syntax highlighting
- Markdown support

⚡ **Unified Entry Point**
- Single command starts both server and UI
- Automatic dependency management
- Cross-platform support

## Quick Start

### Prerequisites

- Node.js 16+ installed
- (Optional) Ollama installed for local LLM support

### Installation & Setup

1. **Clone and Setup**
   ```bash
   git clone <your-repo>
   cd agent-dev
   node setup.js
   ```

   OR manually:
   ```bash
   npm run install-all
   npm start
   ```

### Configuration

1. **Environment Variables** (`.env` file):
   ```env
   # Local LLM Configuration
   MODEL_NAME=llama3:8b-instruct-q4_K_M
   
   # OpenAI Configuration (optional)
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Server Configuration
   PORT=3001
   ```

2. **Local LLM Setup** (Optional but recommended):
   ```bash
   # Install Ollama
   curl https://ollama.ai/install.sh | sh
   
   # Download a model
   ollama pull llama3:8b-instruct-q4_K_M
   ```

## Usage

### Project Selection

1. Launch the application with `npm start`
2. The left sidebar will show automatically detected projects
3. Click on any project to select it as context
4. Start chatting about your project!

### Chat Interface

- **Local Mode**: Uses your local Ollama installation
- **Internet Mode**: Uses OpenAI API (requires API key)
- **Auto-Fallback**: Tries local first, falls back to internet

### Example Conversations

```
User: "Add error handling to my Express routes"
Assistant: *analyzes your project structure and provides specific code improvements*

User: "How do I optimize this React component?"
Assistant: *provides optimization suggestions based on your actual code*
```

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│                 │    │                  │    │                 │
│  React Desktop  │◄──►│  Express Server  │◄──►│  Local/Internet │
│      App        │    │   + Socket.IO    │    │      LLMs       │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    Port 3000               Port 3001              Ollama/OpenAI
```

### Key Components

- **Desktop App** (`/desktop`): React-based UI with modern chat interface
- **Server** (`/server`): Express + Socket.IO for real-time communication
- **LLM Integration** (`/utils`): Handles both local and internet-based AI
- **Project Scanner** (`/utils`): Automatically detects and analyzes projects

## Development

### Available Scripts

- `npm start` - Start both server and desktop app
- `npm run server` - Start only the server
- `npm run desktop` - Start only the desktop app  
- `npm run build` - Build desktop app for production
- `npm run cli` - Use the legacy CLI interface

### Project Structure

```
agent-dev/
├── server/           # Express server with Socket.IO
├── desktop/          # React desktop application
├── utils/            # LLM integration and utilities
├── agents/           # Specialized AI agents
├── cli/              # Legacy CLI interface
└── prompts/          # AI prompt templates
```

## Supported Project Types

- **Node.js** (package.json)
- **Python** (requirements.txt, setup.py)
- **Rust** (Cargo.toml)
- **Go** (go.mod)
- **Java** (pom.xml, build.gradle)
- **PHP** (composer.json)
- **C/C++** (Makefile, CMakeLists.txt)
- **Git Repositories** (.git)

## Contributing

This project is designed to be easily extensible:

1. **Adding new LLM providers**: Extend `/utils/` with new integrations
2. **New project types**: Update the project scanner in `/utils/projectScanner.js`
3. **Enhanced UI**: Modify the React components in `/desktop/src/`
4. **New agents**: Add specialized agents in `/agents/`

## License

MIT License - see LICENSE file for details.


We welcome all contributors! Whether you want to:

- Add new code transformations
- Improve the CLI UI/UX
- Integrate new local models
- Optimize performance
- Write docs or test cases

Just open a PR or issue. Let's build an open, offline-friendly AI developer tool together!
