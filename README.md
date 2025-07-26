# 🚀 12thhaus v2.0 - Spiritual Community Platform

A production-ready spiritual community marketplace connecting practitioners with seekers through AI-enhanced experiences. Built on the advanced 12thhaus Spiritual Platform for enterprise-grade scalability and intelligent automation.

## 🎯 What 12thhaus Offers

**For Seekers**: Discover authentic spiritual practitioners, book sessions, and join a supportive community on your spiritual journey.

**For Practitioners**: Share your gifts, manage your practice, and connect with seekers who resonate with your offerings.

**Example User Journey**:
1. Seeker searches: *"Find a tarot reader for relationship guidance"*
2. AI-powered matching suggests qualified practitioners
3. Real-time booking with calendar integration
4. Session completion with review system
5. Community connection through posts and interactions
6. Ongoing spiritual journey tracking and recommendations

## 🏗️ Platform Architecture

```
                        ┌─────────────────────┐
                        │  12thhaus Web App   │
                        │  (Next.js Frontend) │
                        └──────────┬──────────┘
                                   │
                        ┌──────────┴──────────┐
                        │   GraphQL API       │
                        │   (Hasura Engine)   │
                        └──────────┬──────────┘
                                   │
                        ┌──────────┴──────────┐
                        │   Spiritual DB      │
                        │   (PostgreSQL)      │
                        └──────────┬──────────┘
                                   │
                     ┌─────────────┴─────────────┐
                     │                           │
            ┌────────▼────────┐         ┌───────▼────────┐
            │ Spiritual Agent │         │  N8N Workflow  │
            │ (Matchmaking)   │◄────────┤    Engine      │
            └────────┬────────┘         └────────────────┘
                     │
           ┌─────────┴───────┐
           │ User Journey    │
           │ Intelligence    │
           └─────────┬───────┘
                     │
   ┌─────────────────┼─────────────────┐
   │                 │                 │
   ▼                 ▼                 ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Practitioner│ │   Booking   │ │  Community  │
│ Management  │ │   Agent     │ │   Agent     │
│   Agent     │ │             │ │             │
└─────────────┘ └─────────────┘ └─────────────┘
   │                 │                 │
   ▼                 ▼                 ▼
┌─────────────┐ ┌─────────────┐
│  Payment    │ │  Content    │
│ Processing  │ │ Moderation  │
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

### 🔐 **Spiritual Community Security**
- Multi-user architecture (Practitioners & Seekers)
- Verified practitioner profiles with certification tracking
- Secure payment processing for spiritual services
- Privacy-focused community interactions

### 💳 **Spiritual Services Marketplace**
- Service catalog with categories (Tarot, Astrology, Healing, etc.)
- Real-time booking with practitioner availability
- Integrated payment processing via Stripe
- Review and rating system for service quality

### 🤖 **AI-Enhanced Spiritual Journey**
- **Spiritual Matchmaking Agent**: Connects seekers with ideal practitioners
- **Journey Tracking Agent**: Monitors spiritual growth and progress
- **Content Curation Agent**: Recommends relevant spiritual content
- **Community Engagement Agent**: Facilitates meaningful connections
- **Safety & Moderation Agent**: Maintains authentic spiritual community

### 🔄 **Spiritual Practice Automation**
- Automated booking confirmations and reminders
- Follow-up care sequences for ongoing spiritual support
- Community post engagement and spiritual discussion facilitation
- Practitioner performance analytics and growth insights

### 📊 **Community Dashboard**
- Live spiritual community feed with real-time interactions
- Practitioner management tools (services, availability, earnings)
- Seeker journey tracking and spiritual milestone celebrations
- Mobile-responsive design for on-the-go spiritual connection

## 🛠️ Technology Stack

### **Frontend**
- **Next.js 15** - React framework optimized for spiritual community UX
- **TypeScript** - Type-safe development for reliable spiritual platform
- **Tailwind CSS** - Purple-themed spiritual aesthetics
- **Apollo Client** - Real-time spiritual community interactions

### **Backend**
- **Hasura** - GraphQL API for spiritual data management
- **PostgreSQL** - Secure spiritual community database
- **N8N** - Spiritual journey workflow automation
- **Stripe** - Trusted payment processing for spiritual services

### **AI & Spiritual Intelligence**
- **12thhaus** - Agent orchestration for spiritual experiences
- **LangSmith** - AI monitoring for spiritual community safety
- **Anthropic Claude** - Ethical AI for spiritual guidance

### **Infrastructure**
- **Vercel** - Global spiritual community hosting
- **GitHub Actions** - Continuous spiritual platform evolution
- **Docker** - Containerized spiritual services

## 🚀 Quick Start

### 1. Clone and Setup
```bash
git clone https://github.com/your-repo/12thhaus-v2.git
cd 12thhaus-v2
```

### 2. Backend Setup (Spiritual Data Layer)
```bash
cd backend
docker-compose up -d
```

### 3. Frontend Setup (Spiritual Community Interface)
```bash
cd frontend
npm install
cp .env.example .env.local
# Add your spiritual platform environment variables
npm run dev
```

### 4. Configure Spiritual Platform Environment

**Frontend (.env.local)**:
```env
# Hasura Spiritual Data API
NEXT_PUBLIC_HASURA_GRAPHQL_URL=http://localhost:8080/v1/graphql
NEXT_PUBLIC_HASURA_GRAPHQL_WS_URL=ws://localhost:8080/v1/graphql
HASURA_GRAPHQL_ADMIN_SECRET=12thhaus-admin-secret

# 12thhaus Authentication
NEXTAUTH_SECRET=12thhaus-spiritual-secret
NEXTAUTH_URL=http://localhost:3000

# Spiritual Services Payment Processing
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
```

**AI Spiritual Agents (.env)**:
```env
# LangSmith Spiritual Journey Monitoring
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_langsmith_api_key
LANGCHAIN_PROJECT=12thhaus-spiritual-platform

# AI Spiritual Guidance
ANTHROPIC_API_KEY=your_anthropic_api_key
```

## 💡 Spiritual Platform Usage

### **Web Community**
1. Go to `http://localhost:3000`
2. Choose your path: Seeker or Practitioner
3. Complete spiritual profile setup
4. Begin your 12thhaus journey

### **API Integration**
```typescript
// Example: Book a spiritual session via GraphQL
mutation BookSpiriualSession($input: BookingInput!) {
  createBooking(input: $input) {
    id
    practitioner {
      name
      specialties
    }
    service {
      name
      duration
      price
    }
    scheduledAt
    status
  }
}
```

### **Spiritual Agent Integration**
```python
# Process spiritual matchmaking through AI agent
response = await spiritual_matchmaking_agent.find_practitioner(
    seeker_preferences={
        "service_type": "tarot_reading",
        "experience_level": "beginner",
        "budget_range": "$50-100",
        "availability": "evening"
    }
)
```

## 📁 Project Structure

```
12thhaus-v2/
├── frontend/                 # Next.js spiritual community app
│   ├── src/
│   │   ├── app/             # Spiritual user journeys
│   │   ├── components/      # Spiritual UI components
│   │   ├── hooks/           # Spiritual interaction hooks
│   │   └── lib/             # Spiritual platform utilities
│   ├── public/              # Spiritual assets (purple theme)
│   └── package.json
├── backend/                 # Hasura + PostgreSQL spiritual data
│   ├── hasura/
│   │   ├── migrations/      # Spiritual database schema
│   │   ├── metadata/        # Spiritual GraphQL config
│   │   └── seeds/           # Spiritual community data
│   └── docker-compose.yml
├── agents/                  # Spiritual AI agent system
│   ├── spiritual_agents.py  # Specialized spiritual agents
│   ├── matchmaking_agent.py # Practitioner-seeker matching
│   ├── journey_agent.py     # Spiritual growth tracking
│   └── monitoring.py        # Spiritual platform health
├── workflows/               # Spiritual automation
│   └── templates/           # Spiritual journey workflows
└── README.md               # This spiritual platform guide
```

## 🎯 Current Status

**12thhaus v2.0 Migration** - **Phase 1: Foundation Setup** ✅

✅ **Completed Streams**:
- **Repository Setup**: 12thhaus framework successfully adapted for 12thhaus
- **Branding Migration**: All references updated to spiritual community focus
- **Architecture Planning**: Spiritual-specific agent system designed
- **Technology Stack**: Next.js + Hasura + AI agents configured for spiritual marketplace

🎉 **Spiritual Community Platform Ready**:
- **Dual User Types**: Practitioners and Seekers supported
- **Service Marketplace**: Spiritual services booking and payment system
- **AI Enhancement**: Intelligent practitioner matching and journey guidance
- **Community Features**: Posts, messaging, and spiritual growth tracking

## 🔧 Development

### **Run Spiritual Platform**
```bash
cd frontend && npm run dev
cd backend && docker-compose up
```

### **Build Spiritual Community**
```bash
cd frontend && npm run build
```

### **Deploy Spiritual Platform**
The 12thhaus platform automatically deploys via GitHub Actions to Vercel.

## 📊 Spiritual Services by Plan

| Feature | Seeker (Free) | Practitioner ($49/mo) | Spiritual Business ($199/mo) |
|---------|---------------|----------------------|----------------------------|
| Sessions | 3/month | Unlimited | Unlimited |
| Practitioners | Browse All | Full Profile | Custom Branding |
| Community | Full Access | Full Access + Posting | Moderation Tools |
| AI Guidance | Basic | Advanced Matching | Custom Algorithms |
| Support | Community | Priority | Dedicated Spiritual Coach |

## 🤝 Contributing to the Spiritual Community

1. Fork the 12thhaus repository
2. Create your spiritual feature branch (`git checkout -b feature/spiritual-enhancement`)
3. Commit your changes (`git commit -m 'Add spiritual community feature'`)
4. Push to the branch (`git push origin feature/spiritual-enhancement`)
5. Open a Pull Request for spiritual community review

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Spiritual Platform Support

- **Documentation**: Check spiritual platform docs and community guides
- **Issues**: Create a GitHub issue for spiritual platform bugs or suggestions
- **Monitoring**: Use LangSmith dashboard for spiritual agent debugging
- **Community**: Join our spiritual discussions for questions and spiritual growth tips

---

**Built with ❤️ for the spiritual community using 12thhaus, Next.js, and ethical AI**