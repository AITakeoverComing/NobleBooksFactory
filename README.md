# NobleBooksFactory

An AI-powered book generation system that uses multi-agent architecture to research, write, and review complete non-fiction books automatically.

## 🎯 Overview

NobleBooksFactory implements the vision described in the PRD to create a comprehensive AI system that can generate high-quality non-fiction books from trending topics in under 48 hours. The system uses specialized AI agents working together to ensure quality and accuracy.

## 🏗️ Architecture

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS with responsive design
- **Routing**: React Router for navigation
- **Real-time**: Socket.io client for progress updates

### Backend
- **Server**: FastAPI (Python) with async support
- **AI Framework**: LangChain + LangGraph for multi-agent orchestration  
- **Database**: PostgreSQL + MongoDB + Redis (planned)
- **Real-time**: WebSocket for progress tracking
- **Multi-Agent**: Research, Content Generation, and Editorial agents

## 🤖 Multi-Agent System

### Core Agents

#### 1. Research Agent (`research_agent.py`)
- **Purpose**: Conducts comprehensive research on any topic
- **Capabilities**:
  - Web research via Serper/Tavily APIs with fallbacks
  - Intelligent research planning with targeted questions
  - Analysis and synthesis of findings  
  - Quality scoring and source verification
- **LLM**: Configurable (default: Claude for accuracy)

#### 2. Content Generation Agent (`content_agent.py`)
- **Purpose**: Creates structured, engaging book content
- **Capabilities**:
  - Book outline generation with logical progression
  - Chapter-by-chapter content creation with progress tracking
  - Introduction and conclusion generation
  - Table of contents and book assembly
  - Multiple writing styles and target audiences
- **LLM**: Configurable (default: GPT-4 for creativity)

#### 3. Editorial Agent (planned)
- **Purpose**: Quality assurance and content review
- **Capabilities**:
  - Grammar and style checking
  - Factual accuracy verification
  - Readability assessment
  - Book-wide consistency review
- **LLM**: Configurable (default: Claude for precision)

## 🔧 LLM Provider System

### Supported Providers
- **OpenAI**: GPT-4, GPT-3.5-turbo, GPT-4-turbo
- **Anthropic**: Claude-3-sonnet, Claude-3-opus, Claude-3-haiku
- **HuggingFace**: Mistral-7b, Llama-2-70b
- **Local**: Ollama or custom local models

### Configurable Assignment
Each agent can be assigned to different LLM providers via environment variables:
```bash
RESEARCH_AGENT_LLM=claude
CONTENT_AGENT_LLM=openai
EDITORIAL_AGENT_LLM=claude
```

### Automatic Fallback
If a preferred provider is unavailable, the system automatically falls back to the first available provider.

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+ 
- API keys for at least one LLM provider (OpenAI or Anthropic)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AITakeoverComing/NobleBooksFactory.git
   cd NobleBooksFactory
   ```

2. **Set up Python Backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   # OR for development
   pip install -e .
   ```

3. **Set up React Frontend**
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Configuration**
   ```bash
   cd backend
   cp .env.example .env
   # Add your API keys to .env (at minimum OPENAI_API_KEY or ANTHROPIC_API_KEY)
   ```

### Running the System

1. **Start Python Backend**
   ```bash
   cd backend
   python start.py
   # OR
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Start React Frontend** (in another terminal)
   ```bash
   cd frontend  
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - Health Check: http://localhost:8000/api/v1/health

## 🧪 Testing

### Structure Tests (No API Keys Required)
```bash
cd backend
node src/test/test-structure.js
```

### Full Agent Tests (Requires API Keys)
```bash
cd backend
node src/test/test-agents.js
```

### Test Results
All structure tests currently pass (4/4):
- ✅ Research Agent Structure
- ✅ Content Agent Structure  
- ✅ Editorial Agent Structure
- ✅ System Integration

## 🔄 Workflow

1. **Research Phase**
   - Topic analysis and research planning
   - Multi-source information gathering
   - Data synthesis and credibility assessment

2. **Content Generation Phase**
   - Book outline creation
   - Chapter-by-chapter writing
   - Introduction and conclusion generation
   - Complete book assembly

3. **Editorial Review Phase**
   - Grammar and style review
   - Fact-checking and accuracy verification
   - Consistency and readability assessment
   - Improvement recommendations

4. **Final Output**
   - Professional PDF generation (planned)
   - Marketplace publishing (planned)
   - Performance analytics (planned)

## 📋 Features Implemented

### ✅ Completed
- Multi-agent architecture with specialized AI agents
- Configurable LLM provider system with fallbacks
- Comprehensive research capabilities
- Structured content generation with multiple writing styles
- Advanced editorial review with quality scoring
- Complete test suite for structure validation
- Real-time server with Socket.io integration
- Modular, scalable architecture

### 🚧 In Progress
- API endpoints for frontend integration
- Database models and persistence
- Real-time progress tracking
- Book generation orchestration service

### 📋 Planned
- PDF generation with professional formatting
- Marketplace integration (Amazon KDP, etc.)
- Trend analysis for topic selection
- User authentication and project management
- Performance analytics and optimization

## 🔧 Configuration

### Environment Variables
```bash
# Server
PORT=3001
NODE_ENV=development

# LLM Providers
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-claude-key
HUGGINGFACE_API_KEY=your-hf-key

# Agent Assignments
RESEARCH_AGENT_LLM=claude
CONTENT_AGENT_LLM=openai
EDITORIAL_AGENT_LLM=claude

# Database (planned)
MONGODB_URI=mongodb://localhost:27017/bookgenius
POSTGRES_URI=postgresql://user:pass@localhost:5432/bookgenius
REDIS_URL=redis://localhost:6379
```

## 📚 API Documentation

### Health Check
```bash
GET /health
```

### Agent Status (planned)
```bash
GET /api/agents/status
POST /api/books/generate
GET /api/books/:id/status
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes following the existing patterns
4. Run tests to ensure everything works
5. Commit with clear, descriptive messages
6. Create a pull request

### Commit Guidelines
- Keep commits between 50-100 lines for code changes
- Use descriptive commit messages
- Test changes before committing

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Goals & Roadmap

Based on the PRD, our targets are:
- **Speed**: Complete book generation in under 48 hours
- **Quality**: 4.2+ average rating across all outputs
- **Scale**: Support 200+ books/month production
- **Cost**: 90% lower production costs vs traditional publishing

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/AITakeoverComing/NobleBooksFactory/issues)
- **Discussions**: [GitHub Discussions](https://github.com/AITakeoverComing/NobleBooksFactory/discussions)
- **Documentation**: See `/docs` directory (planned)

---

**Built with ❤️ using Claude Code** 🤖