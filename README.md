# 🚀 LangGraph Multi-Agent Platform

A production-ready, multi-tenant AI agent platform that automatically builds and deploys applications. Think of it as your personal AI development team that can take natural language requests and turn them into live applications.

## 🎯 What This Platform Does

**In Simple Terms**: You describe what you want, and our AI agents build it for you automatically.

**Example Flow**:
1. You say: *"Build me a customer survey app for my restaurant"*
2. Master Agent analyzes your request
3. Code Generation Agent writes the application
4. Deployment Agent publishes it live to the web
5. Business Intelligence Agent sets up analytics
6. Customer Operations Agent handles user support

## 🏗️ Platform Architecture

```
                        ┌─────────────────────┐
                        │    Web Dashboard    │
                        │  (Next.js Frontend) │
                        └──────────┬──────────┘
                                   │
                        ┌──────────┴──────────┐
                        │   GraphQL API       │
                        │   (Hasura Engine)   │
                        └──────────┬──────────┘
                                   │
                        ┌──────────┴──────────┐
                        │  Multi-Tenant DB    │
                        │   (PostgreSQL)      │
                        └──────────┬──────────┘
                                   │
                     ┌─────────────┴─────────────┐
                     │                           │
            ┌────────▼────────┐         ┌───────▼────────┐
            │  Master Agent   │         │  N8N Workflow  │
            │ (Task Router)   │◄────────┤    Engine      │
            └────────┬────────┘         └────────────────┘
                     │
           ┌─────────┴───────┐
           │ Task Analysis   │
           │ & Routing       │
           └─────────┬───────┘
                     │
   ┌─────────────────┼─────────────────┐
   │                 │                 │
   ▼                 ▼                 ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│    Code     │ │ Deployment  │ │  Business   │
│ Generation  │ │    Agent    │ │Intelligence │
│   Agent     │ │             │ │   Agent     │
└─────────────┘ └─────────────┘ └─────────────┘
   │                 │                 │
   ▼                 ▼                 ▼
┌─────────────┐ ┌─────────────┐
│  Customer   │ │  Marketing  │
│ Operations  │ │ Automation  │
│   Agent     │ │   Agent     │
└─────────────┘ └─────────────┘
   │                 │
   └─────────────────┘
           │
           ▼
┌─────────────────────┐
│   LangSmith         │
│   Monitoring        │
└─────────────────────┘
```

## ✨ Key Features

### 🔐 **Enterprise Authentication & Security**
- Multi-tenant architecture with complete data isolation
- Role-based access control (Admin, Tenant Admin, User)
- JWT authentication with NextAuth.js
- Row-level security in PostgreSQL

### 💳 **Complete Payment Infrastructure**
- Stripe integration with subscription management
- Free, Pro ($49/mo), Enterprise ($199/mo) plans
- Usage tracking and billing automation
- Customer portal for subscription management

### 🤖 **AI Agent System**
- **Master Agent**: Routes tasks to specialized agents
- **Code Generation Agent**: Writes applications from descriptions
- **Deployment Agent**: Publishes apps to production
- **Business Intelligence Agent**: Creates analytics and insights
- **Customer Operations Agent**: Handles support and onboarding
- **Marketing Automation Agent**: Manages campaigns and content

### 🔄 **Workflow Automation**
- N8N integration for complex business processes
- Real-time monitoring and error handling
- Automated deployment pipelines
- Multi-channel notifications (Email, SMS, Slack, Webhooks)

### 📊 **Real-Time Dashboard**
- Live project management interface
- Real-time GraphQL subscriptions
- Mobile-responsive design
- Comprehensive settings and API key management

## 🛠️ Technology Stack

### **Frontend**
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern styling
- **Apollo Client** - GraphQL state management

### **Backend**
- **Hasura** - GraphQL API engine
- **PostgreSQL** - Multi-tenant database
- **N8N** - Workflow automation
- **Stripe** - Payment processing

### **AI & Monitoring**
- **LangGraph** - Agent orchestration
- **LangSmith** - AI monitoring and observability
- **Anthropic Claude** - Language model

### **Infrastructure**
- **Vercel** - Frontend hosting and serverless functions
- **GitHub Actions** - CI/CD pipeline
- **Docker** - Containerization

## 🚀 Quick Start

### 1. Clone and Setup
```bash
git clone https://github.com/your-repo/langgraph-multi-agent-platform.git
cd langgraph-multi-agent-platform
```

### 2. Backend Setup (Hasura + PostgreSQL)
```bash
cd backend
docker-compose up -d
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Add your environment variables
npm run dev
```

### 4. Configure Environment Variables

**Frontend (.env.local)**:
```env
# Hasura GraphQL
NEXT_PUBLIC_HASURA_GRAPHQL_URL=http://localhost:8080/v1/graphql
NEXT_PUBLIC_HASURA_GRAPHQL_WS_URL=ws://localhost:8080/v1/graphql
HASURA_GRAPHQL_ADMIN_SECRET=admin-secret

# Authentication
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# Stripe (Optional for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
```

**AI Agents (.env)**:
```env
# LangSmith Monitoring
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_langsmith_api_key
LANGCHAIN_PROJECT=langgraph-multi-agent

# AI Model
ANTHROPIC_API_KEY=your_anthropic_api_key
```

## 💡 Usage Examples

### **Web Dashboard**
1. Go to `http://localhost:3000`
2. Create an account (automatically sets up your tenant)
3. Complete the onboarding wizard
4. Start creating projects with AI agents

### **API Integration**
```typescript
// Example: Create a project via GraphQL
mutation CreateProject($input: CreateProjectInput!) {
  createProject(input: $input) {
    id
    name
    status
  }
}
```

### **Agent Task Processing**
```python
# Process a task through the Master Agent
response = await master_agent.process_task(
    task="Build a customer feedback form",
    priority="high",
    context={"industry": "restaurant", "platform": "web"}
)
```

## 📁 Project Structure

```
langgraph-multi-agent/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom hooks
│   │   └── lib/             # Utilities and config
│   ├── public/              # Static assets
│   └── package.json
├── backend/                 # Hasura + PostgreSQL
│   ├── hasura/
│   │   ├── migrations/      # Database schema
│   │   ├── metadata/        # Hasura configuration
│   │   └── seeds/           # Initial data
│   └── docker-compose.yml
├── agents/                  # AI agent system
│   ├── master_agent.py      # Task routing
│   ├── specialist_agents.py # Specialized agents
│   ├── sop_files/          # Standard operating procedures
│   └── monitoring.py        # LangSmith integration
├── workflows/               # N8N automation
│   └── templates/           # Workflow templates
├── BENCHMARKS.md           # Development progress
└── README.md               # This file
```

## 🎯 Current Status

**Day 20 of 30-day sprint** - **75% Complete**

✅ **Completed Streams**:
- **Stream 1**: Foundation & Architecture (100%)
- **Stream 2**: Workflow Automation (100%)  
- **Stream 3**: User Experience + Payment System (100%)

🚧 **Next**: Stream 4 - Testing & Documentation

## 🔧 Development

### **Run Tests**
```bash
cd frontend && npm test
cd backend && npm run test:hasura
```

### **Build for Production**
```bash
cd frontend && npm run build
```

### **Deploy**
The platform automatically deploys via GitHub Actions to Vercel.

## 📊 Features by Plan

| Feature | Free | Pro ($49/mo) | Enterprise ($199/mo) |
|---------|------|-------------|---------------------|
| Users | 2 | 10 | Unlimited |
| Projects | 3 | 25 | Unlimited |
| Workflows | 5 | Unlimited | Unlimited |
| AI Agents | Basic | Advanced | Custom |
| Support | Community | Priority | Dedicated |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the inline docs and code comments
- **Issues**: Create a GitHub issue for bugs or feature requests
- **Monitoring**: Use LangSmith dashboard for AI agent debugging
- **Community**: Join our discussions for questions and tips

---

**Built with ❤️ using LangGraph, Next.js, and modern AI**