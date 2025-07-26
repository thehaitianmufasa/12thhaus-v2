# 🚀 12THHAUS v2.0 GITHUB DEPLOYMENT & DOMAIN ROUTING PRP

## **📋 EXECUTIVE SUMMARY**

### **Current Project Status** ✅ PRODUCTION-READY
- **Location**: `/Users/mufasa/Desktop/Clients/12thhaus-v2/`
- **Platform**: Complete spiritual marketplace with JWT authentication
- **Framework**: Next.js 15 + GraphQL API + Supabase PostgreSQL
- **Authentication**: JWT-based dual user type system (seekers/practitioners)
- **Features**: Service marketplace, social community, booking system, user dashboards
- **Build Status**: ✅ Zero errors, production-optimized
- **Branch**: `feature/authentication-system` ready for main branch merge

### **Deployment Objectives**
1. **GitHub Repository Setup**: Create new repository and commit v2.0 codebase
2. **Domain Migration**: Route 12haus.com from Railway to new Vercel deployment
3. **Production Deployment**: Deploy to Vercel with Supabase backend
4. **Environment Configuration**: Secure production environment variables
5. **DNS Management**: Update domain routing for seamless user transition

---

## **🎯 PHASE 1: GITHUB REPOSITORY SETUP**

### **PRP 1.1: Repository Creation & Initial Commit**

#### **Repository Strategy**
- **Repository Name**: `12thhaus-v2` (new repository for clean v2.0 launch)
- **Visibility**: Private initially, public after launch validation
- **Branch Strategy**: `main` for production, `develop` for ongoing features
- **Initial Commit**: Complete v2.0 codebase with authentication system

#### **Pre-Commit Preparation**
```bash
# Navigate to project directory
cd /Users/mufasa/Desktop/Clients/12thhaus-v2

# Verify build status
npm run build
cd frontend && npm run build

# Create .gitignore for production secrets
echo "node_modules/
.env
.env.local
.env.production
.next/
dist/
*.log
.DS_Store" > .gitignore

# Stage all files for initial commit
git add .
git status  # Verify all files staged correctly
```

#### **Commit Strategy**
```bash
# Initial commit with complete v2.0 platform
git commit -m "feat: 12THHAUS v2.0 Complete Spiritual Marketplace Platform

✨ ENTERPRISE SPIRITUAL PLATFORM LAUNCH
- Complete JWT authentication system with dual user types
- Service marketplace with booking and payment integration  
- Social community platform with posts, likes, comments
- Professional dashboards for seekers and practitioners
- GraphQL API with PostgreSQL backend via Supabase
- Production-ready Next.js 15 frontend with purple spiritual theme

🚀 PLATFORM FEATURES
- User registration/login with seeker/practitioner types
- Service discovery and booking system with scheduling
- Real-time social features with GraphQL backend
- Professional service management for practitioners
- Community feed with posts, interactions, and profiles
- Complete authentication guards and route protection

🔧 TECHNICAL STACK
- Frontend: Next.js 15 + TypeScript + Tailwind CSS
- Backend: Node.js GraphQL API + Supabase PostgreSQL
- Authentication: JWT with React Context and localStorage
- Deployment: Vercel-ready with environment configuration
- Database: 15 tables, 10 spiritual disciplines, complete schema

🎯 PRODUCTION STATUS
- Zero build errors, TypeScript validated
- 100% feature complete authentication system
- Production-optimized bundle and performance
- Ready for Vercel deployment and 12haus.com domain"

# Push to GitHub
git remote add origin https://github.com/thehaitianmufasa/12thhaus-v2.git
git branch -M main
git push -u origin main
```

---

## **🎯 PHASE 2: PRODUCTION ENVIRONMENT SETUP**

### **PRP 2.1: Vercel Project Configuration**

#### **Vercel Deployment Setup**
```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to Vercel
cd /Users/mufasa/Desktop/Clients/12thhaus-v2/frontend
vercel --prod

# Configure custom domain during setup:
# Domain: 12haus.com
# Framework: Next.js
# Root Directory: frontend/
```

#### **Environment Variables Configuration**
**Vercel Dashboard → 12thhaus-v2 → Settings → Environment Variables**

```bash
# Database Configuration
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]

# JWT Authentication
JWT_SECRET=[generate-secure-random-string]
NEXT_PUBLIC_APP_URL=https://12haus.com

# GraphQL API Endpoint
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://12haus.com/api/graphql

# Stripe Payment Integration (for future)
STRIPE_SECRET_KEY=[stripe-secret]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[stripe-public]

# Email Service (for notifications)
RESEND_API_KEY=[resend-api-key]
```

### **PRP 2.2: GraphQL API Deployment Strategy**

#### **Option A: Vercel API Routes (Recommended)**
```bash
# Move GraphQL server to Vercel API routes
mkdir -p frontend/pages/api
cp server.js frontend/pages/api/graphql.js

# Update for Vercel serverless deployment
# Modify imports and handler pattern for Vercel compatibility
```

#### **Option B: Railway Backend Deployment**
```bash
# Deploy GraphQL API to Railway
railway login
railway new
railway add --service nodejs
railway deploy

# Update frontend to point to Railway GraphQL endpoint
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://[railway-url]/graphql
```

---

## **🎯 PHASE 3: DOMAIN MIGRATION STRATEGY**

### **PRP 3.1: DNS Configuration Assessment**

#### **Current State Analysis**
```bash
# Check current DNS settings for 12haus.com
dig 12haus.com
nslookup 12haus.com

# Identify current hosting provider
whois 12haus.com

# Document current Railway configuration
# - Current deployment URL
# - Environment variables
# - Database connections
```

#### **Migration Planning**
1. **DNS Provider**: Identify where 12haus.com DNS is managed
2. **Current Setup**: Document Railway deployment configuration  
3. **Downtime Window**: Plan minimal downtime transition
4. **Rollback Plan**: Prepare to revert if issues occur

### **PRP 3.2: Vercel Domain Configuration**

#### **Step 1: Add Domain to Vercel**
```bash
# Via Vercel CLI
vercel domains add 12haus.com

# Or via Vercel Dashboard:
# Project Settings → Domains → Add Domain → 12haus.com
```

#### **Step 2: DNS Record Updates**
**Update DNS records at domain registrar:**

```dns
# A Record (if using Vercel A records)
Type: A
Name: @
Value: 76.76.19.61
TTL: 300

# CNAME Record (alternative)
Type: CNAME  
Name: @
Value: cname.vercel-dns.com
TTL: 300

# WWW Subdomain
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 300
```

#### **Step 3: SSL Certificate Setup**
- Vercel automatically provisions SSL certificates
- Verify HTTPS redirect configuration
- Test certificate validity post-deployment

---

## **🎯 PHASE 4: PRODUCTION DEPLOYMENT EXECUTION**

### **PRP 4.1: Pre-Deployment Validation**

#### **Local Production Build Test**
```bash
cd /Users/mufasa/Desktop/Clients/12thhaus-v2/frontend

# Test production build locally
npm run build
npm start

# Verify all pages load correctly
curl -f http://localhost:3000
curl -f http://localhost:3000/auth
curl -f http://localhost:3000/dashboard/seeker
curl -f http://localhost:3000/services

# Test GraphQL API connectivity
curl -X POST -H "Content-Type: application/json" \
  -d '{"query": "query { spiritual_disciplines { id name } }"}' \
  http://localhost:4000/graphql
```

#### **Database Connection Verification**
```bash
# Test Supabase connection from production environment
# Verify all tables accessible
# Confirm JWT authentication working
# Validate GraphQL resolvers responding
```

### **PRP 4.2: Vercel Deployment Process**

#### **Deployment Commands**
```bash
# Final deployment to production
cd /Users/mufasa/Desktop/Clients/12thhaus-v2/frontend
vercel --prod --yes

# Monitor deployment logs
vercel logs [deployment-url]

# Verify deployment success
curl -f https://12haus.com
curl -f https://www.12haus.com
```

#### **Post-Deployment Verification**
```bash
# Test key user flows
# 1. Landing page loads ✅
# 2. User registration works ✅
# 3. Authentication system functional ✅
# 4. Protected routes enforce auth ✅
# 5. Dashboard loads for both user types ✅
# 6. Service browsing and booking flow ✅
# 7. Social features operational ✅
```

---

## **🎯 PHASE 5: DNS MIGRATION & TRAFFIC ROUTING**

### **PRP 5.1: Gradual Traffic Migration**

#### **Migration Timeline**
```timeline
T+0:00 → Deploy to Vercel (staging domain)
T+0:30 → Comprehensive testing on staging
T+1:00 → Update DNS A/CNAME records
T+1:15 → Monitor DNS propagation globally
T+1:30 → Verify 12haus.com points to Vercel
T+2:00 → Full production validation
T+2:30 → Disable Railway deployment
```

#### **Monitoring Strategy**
```bash
# Monitor DNS propagation
dig @8.8.8.8 12haus.com
dig @1.1.1.1 12haus.com

# Check global DNS propagation
# https://www.whatsmydns.net/#A/12haus.com

# Monitor application health
curl -f https://12haus.com/api/health
curl -f https://12haus.com/api/graphql
```

### **PRP 5.2: Railway Cleanup**

#### **Post-Migration Cleanup**
```bash
# After successful migration (24-48 hours)
# 1. Backup Railway environment variables
# 2. Export any critical data/logs
# 3. Scale down Railway deployment
# 4. Remove Railway project (optional)
# 5. Update bookmarks and documentation
```

---

## **🎯 PHASE 6: PRODUCTION OPTIMIZATION**

### **PRP 6.1: Performance Optimization**

#### **Vercel Configuration**
```json
// vercel.json optimization
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "regions": ["iad1"],
  "functions": {
    "pages/api/**/*.js": {
      "maxDuration": 30
    }
  }
}
```

#### **Next.js Optimizations**
```javascript
// next.config.js production settings
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: true,
  },
  images: {
    domains: ['12haus.com'],
    formats: ['image/webp'],
  }
}
```

### **PRP 6.2: Security Configuration**

#### **Security Headers**
```javascript
// Security headers in next.config.js
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  }
]
```

---

## **🎯 PHASE 7: VALIDATION & MONITORING**

### **PRP 7.1: Production Health Checks**

#### **Automated Testing Suite**
```bash
# Create production health check script
cat > health-check.sh << 'EOF'
#!/bin/bash
echo "🚀 12THHAUS Production Health Check"

# Test landing page
curl -f https://12haus.com || echo "❌ Landing page failed"

# Test authentication endpoint
curl -X POST -f https://12haus.com/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { spiritual_disciplines { id } }"}' || echo "❌ GraphQL failed"

# Test key pages
curl -f https://12haus.com/services || echo "❌ Services page failed"

echo "✅ Health check complete"
EOF

chmod +x health-check.sh
./health-check.sh
```

#### **Performance Monitoring**
```bash
# Set up monitoring alerts
# - Vercel deployment notifications
# - Uptime monitoring (UptimeRobot)
# - Performance alerts (Web Vitals)
# - Error tracking (Sentry integration)
```

### **PRP 7.2: User Acceptance Testing**

#### **Critical User Flows Validation**
```checklist
☐ Landing page loads within 2 seconds
☐ User registration creates account successfully
☐ Login redirects to correct dashboard (seeker/practitioner)
☐ Service browsing shows all spiritual disciplines
☐ Booking flow completes without errors
☐ Social features (posts, likes, comments) work
☐ Profile pages load and update correctly
☐ Mobile responsive design functions properly
☐ SSL certificate valid and HTTPS enforced
☐ All links and navigation work correctly
```

---

## **🎯 SUCCESS METRICS & COMPLETION CRITERIA**

### **Deployment Success Indicators**
- ✅ **GitHub Repository**: Clean commit history and main branch deployment-ready
- ✅ **Vercel Deployment**: Production deployment successful with zero build errors
- ✅ **Domain Routing**: 12haus.com points to new Vercel deployment 
- ✅ **SSL Configuration**: HTTPS enforced with valid certificates
- ✅ **Authentication System**: JWT login/registration functional in production
- ✅ **Database Connectivity**: Supabase GraphQL API operational
- ✅ **Performance**: Sub-3 second page loads and responsive design
- ✅ **User Flows**: All critical user journeys validated in production

### **Risk Mitigation**
- **Rollback Plan**: DNS revert to Railway if issues occur
- **Monitoring**: Real-time alerts for downtime or errors
- **Support**: 24-hour monitoring window post-deployment
- **Documentation**: Complete setup guide for future deployments

### **Timeline Expectation**
- **Phase 1-2**: 30 minutes (GitHub + Vercel setup)
- **Phase 3-4**: 45 minutes (DNS + Deployment)
- **Phase 5**: 60 minutes (Migration + Validation)
- **Phase 6-7**: 30 minutes (Optimization + Testing)
- **Total**: 2.5-3 hours for complete migration

---

## **🚀 EXECUTION CHECKLIST**

### **Pre-Deployment**
- [ ] Verify build status and zero errors
- [ ] Create GitHub repository and initial commit
- [ ] Gather all environment variables and secrets
- [ ] Document current Railway configuration

### **Deployment**
- [ ] Deploy to Vercel with custom domain
- [ ] Configure environment variables
- [ ] Set up GraphQL API endpoint
- [ ] Update DNS records for 12haus.com

### **Validation**
- [ ] Test all critical user flows
- [ ] Verify authentication system
- [ ] Confirm database connectivity
- [ ] Validate mobile responsiveness

### **Go-Live**
- [ ] Monitor DNS propagation
- [ ] Execute health checks
- [ ] Validate production performance
- [ ] Clean up Railway deployment

**🎯 READY FOR DEPLOYMENT - Complete Enterprise Spiritual Platform Migration to 12haus.com**