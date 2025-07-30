# 🔑 GitHub Environment Variables for Production Deployment

## ✅ Current Status: VERCEL_TOKEN Added
The deployment will now start, but you'll need these additional variables for full functionality.

## 🎯 Essential Variables for Production

### **Database (Required for GraphQL API)**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
```

### **Authentication (Required for User Login)**
```
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
JWT_SECRET=your-jwt-secret-for-graphql-auth
```

### **Payment System (Required for Booking)**
```
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### **AI Features (Optional but Recommended)**
```
ANTHROPIC_API_KEY=your-anthropic-api-key
LANGCHAIN_API_KEY=your-langsmith-api-key
```

## 🚀 Deployment Strategy Options

### **Option 1: Deploy Basic Version First (Recommended)**
Current deployment will work for:
- ✅ Static pages (landing, about, etc.)
- ⚠️ Limited functionality (no user auth, no booking)

### **Option 2: Add All Variables for Full Platform**
Go to: https://github.com/thehaitianmufasa/12thhaus-v2/settings/secrets/actions

Add each variable as a repository secret.

## 📋 Variables by Priority

### **Priority 1: Core Platform (Add These Next)**
1. `SUPABASE_URL` - Database connection
2. `SUPABASE_ANON_KEY` - Database access
3. `JWT_SECRET` - Authentication
4. `NEXTAUTH_SECRET` - Session management

### **Priority 2: Full Functionality**
5. `STRIPE_SECRET_KEY` - Payment processing
6. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Frontend payments
7. `ANTHROPIC_API_KEY` - AI features

### **Priority 3: Advanced Features**
8. `LANGCHAIN_API_KEY` - AI tracking
9. `STRIPE_WEBHOOK_SECRET` - Payment webhooks
10. `N8N_API_KEY` - Workflow automation

## 🔧 Current Deployment Status

**What Works Now:**
- Static pages and basic navigation
- UI components and design
- Build process and deployment

**What Needs Variables:**
- User authentication and registration
- GraphQL API connections
- Service booking and payments
- Real-time features

## 📝 Quick Setup Guide

1. **Check your desktop secrets file**: `/Users/mufasa/Desktop/PROJECT_SECRETS_REFERENCE.txt`
2. **Add to GitHub Secrets**: Copy values to repository secrets
3. **Re-deploy**: Push any commit to trigger new deployment

---

💡 **Tip**: You can deploy incrementally - add essential variables first, then add more features as you configure additional services.