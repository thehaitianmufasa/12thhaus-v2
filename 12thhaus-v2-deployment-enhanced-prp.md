# 12THHAUS v2.0 GitHub Deployment & Domain Migration - Enhanced PRP
**Created:** 2025-07-26 | **Project:** 12thhaus-v2 | **Agent Type:** devops-infrastructure-specialist

---

## **📋 EXECUTIVE SUMMARY**
**Objective:** Deploy complete 12THHAUS v2.0 spiritual marketplace to new GitHub repository and migrate 12haus.com domain from Railway to Vercel  
**Expected Duration:** 2.5-3 hours total (30 min GitHub + 45 min DNS + 60 min migration + 30 min optimization)  
**Prerequisites:** Production-ready codebase, GitHub account, Vercel account, domain access, Railway deployment details  
**Success Criteria:** New repository created, code deployed, domain pointing to Vercel, zero downtime transition, all features operational

---

## **🔍 PRE-EXECUTION STATE ASSESSMENT**

### **Expected Starting State**
```
Project location: /Users/mufasa/Desktop/Clients/12thhaus-v2/
Build status: Zero errors, production-ready
Git status: May be connected to old langgraph-multi-agent-platform repo
Code status: Complete authentication system, service marketplace, booking system
Domain status: 12haus.com currently pointing to Railway deployment
```

### **State Discovery Protocol**
```bash
echo "=== 12THHAUS v2.0 DEPLOYMENT STATE ASSESSMENT ==="
cd /Users/mufasa/Desktop/Clients/12thhaus-v2
pwd

echo "=== PROJECT STRUCTURE ==="
ls -la
echo "Frontend exists:" && ls frontend/ || echo "❌ Frontend missing"
echo "Server exists:" && ls server.js || echo "❌ Server missing"
echo "Auth system:" && ls frontend/contexts/AuthContext.tsx || echo "❌ Auth missing"

echo "=== GIT STATUS ==="
git status 2>/dev/null || echo "No git repository"
git remote -v 2>/dev/null || echo "No git remotes"
git log --oneline -3 2>/dev/null || echo "No commit history"

echo "=== BUILD VALIDATION ==="
cd frontend && npm run build --dry-run 2>/dev/null && echo "✅ Frontend builds" || echo "❌ Frontend build issues"
cd .. && node -c server.js && echo "✅ Server syntax valid" || echo "❌ Server issues"

echo "=== TOOL AVAILABILITY ==="
which git && echo "✅ Git available" || echo "❌ Git missing"
which npm && echo "✅ NPM available" || echo "❌ NPM missing"
which vercel && echo "✅ Vercel CLI available" || echo "❌ Vercel CLI missing"
which gh && echo "✅ GitHub CLI available" || echo "❌ GitHub CLI missing"

echo "=== DOMAIN STATUS ==="
dig 12haus.com +short || echo "Domain lookup failed"
curl -s -I https://12haus.com | head -3 || echo "Domain not accessible"
```

### **State Validation Checklist**
- [ ] Current directory confirmed: `/Users/mufasa/Desktop/Clients/12thhaus-v2/`
- [ ] Required files present: `frontend/`, `server.js`, `CLAUDE.md`, `DEPLOYMENT_PRP.md`
- [ ] Git repository status: `Connected to langgraph repo (needs change)`
- [ ] Authentication system: `JWT auth with dual user types implemented`
- [ ] Build status: `Zero errors, production-ready`
- [ ] Domain status: `12haus.com pointing to Railway`

### **Deviation Handling**
| **If Found** | **Expected** | **Recovery Action** |
|--------------|--------------|-------------------|
| Wrong git remote | New 12thhaus-v2 repo | `git remote remove origin` then create new repo |
| Build errors | Zero errors | Fix errors before deployment |
| Missing auth files | Complete auth system | Verify authentication implementation |
| Domain down | Working Railway site | Check Railway status, document current state |
| No .gitignore | Proper exclusions | Create production .gitignore with secrets excluded |

---

## **🛠 EXECUTION STRATEGY**

### **Tool Inventory & Priority**
1. **Primary Tools (Use These First):**
   - `mcp__github-mcp__create_repository` - For creating new 12thhaus-v2 repository
   - `mcp__vercel__vercel-create-deployment` - For Vercel deployment
   - `bash` - For git operations, file management, DNS commands
   - `mcp__github-mcp__push_files` - For bulk file upload to repository

2. **Fallback Tools (If Primary Fails):**
   - GitHub CLI (`gh`) - Alternative for repository operations
   - Vercel CLI (`vercel`) - Alternative for deployment
   - Manual GitHub web interface - Last resort for repo creation

3. **Tool Selection Logic:**
   ```
   IF mcp__github-mcp__ tools available THEN use MCP GitHub tools
   ELSE IF gh CLI available THEN use GitHub CLI  
   ELSE provide manual instructions with exact steps
   
   IF mcp__vercel__ tools available THEN use MCP Vercel tools
   ELSE IF vercel CLI available THEN use Vercel CLI
   ELSE provide manual Vercel setup instructions
   ```

### **Execution Phases**

#### **Phase 1: GitHub Repository Setup (CRITICAL: Avoid Altering Existing Repos)**
```bash
# SAFETY CHECK: Disconnect from existing repository
cd /Users/mufasa/Desktop/Clients/12thhaus-v2
git remote -v  # Document current remote
git remote remove origin 2>/dev/null || echo "No origin to remove"

# Create proper .gitignore for production
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
frontend/node_modules/

# Environment files (CRITICAL: exclude secrets)
.env
.env.local
.env.production
.env.development

# Build outputs
.next/
frontend/.next/
frontend/out/
dist/
build/

# Logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# IDE files
.vscode/
.idea/

# Temporary files
tmp/
temp/
EOF

# Stage all files for initial commit
git add .
git status  # Verify staging
```
**Success Indicators:** Old remote removed, files staged, proper .gitignore created  
**Failure Recovery:** If git operations fail, reinitialize repository: `rm -rf .git && git init`

#### **Phase 2: New Repository Creation & Code Push**
```bash
# Use MCP tool to create NEW repository (not alter existing)
# Agent will execute:
# mcp__github-mcp__create_repository(
#   name="12thhaus-v2",
#   description="Enterprise Spiritual Community Platform with AI-Enhanced Practitioner Matching",
#   private=true,
#   autoInit=false
# )

# Commit with detailed message from DEPLOYMENT_PRP.md
git commit -m "🚀 12THHAUS v2.0 - Enterprise Spiritual Marketplace Platform

✨ ENTERPRISE SPIRITUAL PLATFORM LAUNCH
- Complete JWT authentication system with dual user types (seekers/practitioners)
- Service marketplace with booking and payment integration ready
- Social community platform with posts, likes, comments, shares, saves
- Professional dashboards for seekers and practitioners with full customization
- GraphQL API with PostgreSQL backend via Supabase (15 tables operational)
- Production-ready Next.js 15 frontend with purple spiritual theme

🚀 PLATFORM FEATURES OPERATIONAL
- User registration/login with seeker/practitioner differentiation
- Service discovery and booking system with practitioner scheduling
- Real-time social features with GraphQL backend integration
- Professional service management for practitioners with analytics
- Community feed with posts, interactions, profiles, and social discovery
- Complete authentication guards and route protection across platform

🔧 TECHNICAL STACK PRODUCTION-READY
- Frontend: Next.js 15 + TypeScript + Tailwind CSS + Apollo Client
- Backend: Node.js GraphQL API + JWT Authentication + Supabase PostgreSQL
- Authentication: JWT with React Context, localStorage persistence, 24h expiry
- Database: 15 tables + 10 spiritual disciplines + complete schema relationships
- Security: bcrypt password hashing, role-based access control, protected routes
- Performance: Zero build errors, TypeScript validated, production-optimized

🎯 DEPLOYMENT STATUS
- Phase 1-7 Complete: Foundation → Database → Frontend → Dashboards → Social → Enterprise → Authentication
- Build Status: Zero errors across frontend and backend
- Authentication: JWT system with dual user types fully operational
- Service Management: Complete CRUD operations for practitioners
- Booking System: 3-step booking flow with scheduling and session management
- Social Features: Real-time posts, likes, comments, shares with GraphQL backend
- Ready for: Vercel deployment, 12haus.com domain migration, production launch"

# Connect to NEW repository and push
git remote add origin https://github.com/thehaitianmufasa/12thhaus-v2.git
git branch -M main
git push -u origin main
```
**Success Indicators:** Repository created, all files pushed, build successful on GitHub  
**Failure Recovery:** If repository creation fails, use GitHub CLI or manual creation

#### **Phase 3: Vercel Deployment Setup**
```bash
# Deploy to Vercel with custom domain configuration
cd frontend

# Use MCP Vercel tool or CLI
# Agent will configure:
# - Domain: 12haus.com
# - Framework: Next.js
# - Root Directory: frontend/
# - Environment variables from .env.example template
```
**Success Indicators:** Vercel deployment successful, staging URL accessible  
**Failure Recovery:** If deployment fails, check build logs and environment variables

#### **Phase 4: DNS Migration (CRITICAL: Plan for zero downtime)**
```bash
# Document current DNS setup
dig 12haus.com +short
nslookup 12haus.com

# Configure Vercel domain
# Update DNS records at domain registrar:
# A Record: @ → 76.76.19.61 (or Vercel provided IP)
# CNAME: www → cname.vercel-dns.com

# Monitor DNS propagation
watch -n 30 'dig @8.8.8.8 12haus.com +short'
```
**Success Indicators:** DNS propagation complete, 12haus.com points to Vercel  
**Failure Recovery:** Revert DNS to Railway if issues occur within monitoring window

---

## **⚠️ CONTINGENCY MANAGEMENT**

### **Common Failure Scenarios**
| **Scenario** | **Detection** | **Recovery Action** | **Prevention** |
|--------------|---------------|-------------------|----------------|
| Repository already exists | GitHub API returns "name already exists" | Use different name: 12thhaus-v2-prod | Check GitHub before creation |
| Push authentication failure | git push fails with auth error | Use personal access token or SSH key | Verify GitHub auth before deployment |
| Build failure on Vercel | Deployment fails with build error | Fix environment variables, check dependencies | Test local build before deployment |
| DNS propagation issues | Domain doesn't resolve to Vercel | Wait 24-48h or contact domain registrar | Use TTL 300 for faster propagation |
| Railway site goes down | Current 12haus.com returns errors | Accelerate DNS switch to Vercel | Have Vercel deployment ready before DNS change |

### **Rollback Procedures**
```bash
# If GitHub deployment fails
git remote remove origin
# Delete repository manually on GitHub if created

# If DNS migration fails  
# Revert DNS records to Railway configuration
# A Record: @ → [Railway IP]
# CNAME: www → [Railway domain]

# If Vercel deployment fails
# Keep Railway running until issues resolved
```

### **Emergency Contacts/Resources**
- **GitHub Status:** https://www.githubstatus.com/
- **Vercel Status:** https://www.vercel-status.com/
- **Domain Registrar:** Check whois 12haus.com for registrar support
- **Railway Dashboard:** Monitor current deployment during transition

---

## **✅ VALIDATION & SUCCESS CRITERIA**

### **Execution Validation Checklist**
- [ ] **Phase 1:** New GitHub repository created without altering existing repos
- [ ] **Phase 1:** Complete 12thhaus v2.0 codebase pushed successfully
- [ ] **Phase 2:** Vercel deployment successful with zero build errors
- [ ] **Phase 2:** Environment variables configured correctly
- [ ] **Phase 3:** DNS records updated and propagation monitored
- [ ] **Phase 3:** 12haus.com resolves to new Vercel deployment
- [ ] **Phase 4:** SSL certificate valid and HTTPS enforced
- [ ] **Phase 4:** All critical user flows tested and operational

### **Success Testing Protocol**
```bash
echo "=== DEPLOYMENT SUCCESS VALIDATION ==="

# Test repository access
git ls-remote origin && echo "✅ Repository accessible" || echo "❌ Repository access failed"

# Test Vercel deployment
curl -f https://12haus.com && echo "✅ Domain accessible" || echo "❌ Domain issues"
curl -f https://12haus.com/auth && echo "✅ Auth page works" || echo "❌ Auth page issues"

# Test key user flows
curl -X POST -H "Content-Type: application/json" \
  -d '{"query": "query { spiritual_disciplines { id name } }"}' \
  https://12haus.com/api/graphql && echo "✅ GraphQL API working" || echo "❌ API issues"

# Test SSL and redirects
curl -I https://12haus.com | grep "200 OK" && echo "✅ HTTPS working" || echo "❌ HTTPS issues"

# Expected outputs:
# ✅ Repository accessible
# ✅ Domain accessible
# ✅ Auth page works
# ✅ GraphQL API working
# ✅ HTTPS working
```

### **Final State Documentation**
After successful execution, the system should have:
- **Repository:** New 12thhaus-v2 repository with complete platform code
- **Deployment:** Vercel hosting the platform at 12haus.com
- **Domain:** 12haus.com pointing to Vercel with valid SSL
- **Features:** All authentication, booking, and social features operational
- **Performance:** Sub-3 second page loads and mobile responsiveness
- **Analytics:** Deployment metrics and monitoring in place

---

## **📊 COMPLETION REPORT TEMPLATE**

```markdown
## 12THHAUS v2.0 Deployment - Execution Report

**Status:** ✅ SUCCESS / ❌ FAILED / ⚠️ PARTIAL  
**Duration:** [actual_time_taken]  
**Agent:** devops-infrastructure-specialist  

### Execution Summary
- **Phases Completed:** [X/4]
- **Repository:** https://github.com/thehaitianmufasa/12thhaus-v2
- **Deployment:** https://12haus.com
- **Domain Migration:** [Railway → Vercel transition status]
- **Contingencies Triggered:** [any_recovery_actions_taken]

### Technical Results
**GitHub Repository:**
- URL: https://github.com/thehaitianmufasa/12thhaus-v2
- Visibility: Private
- Files: [number] committed successfully
- Build Status: ✅ Zero errors

**Vercel Deployment:**
- URL: https://12haus.com
- Framework: Next.js 15
- Build Time: [duration]
- Environment: Production

**Domain Migration:**
- Previous: Railway hosting
- Current: Vercel hosting  
- DNS Propagation: [completion_status]
- SSL Certificate: [valid/invalid]

### Performance Validation
- **Page Load Speed:** [measurement]
- **Authentication:** [working/issues]
- **API Connectivity:** [operational/issues]
- **Mobile Response:** [tested/not_tested]

### Issues Encountered
[describe_any_problems_and_resolutions]

### Lessons Learned
[improvements_for_future_deployments]

### Post-Deployment Tasks
- [ ] Monitor site performance for 24 hours
- [ ] Configure analytics and monitoring
- [ ] Update team documentation with new URLs
- [ ] Schedule Railway cleanup after validation period
```

---

## **🔄 CONTINUOUS IMPROVEMENT**

### **Deployment Optimization Notes**
- **Build Performance:** Track build times and optimize if > 3 minutes
- **DNS Propagation:** Monitor global propagation speed and optimize TTL
- **Error Recovery:** Document effective recovery procedures for common failures
- **Tool Effectiveness:** Track MCP tool success vs fallback tool usage

### **Security Validation**
- **Repository Access:** Verify private repository permissions
- **Environment Variables:** Confirm no secrets in committed code
- **SSL Configuration:** Validate certificate and HTTPS redirects
- **Authentication:** Test JWT security and session management

---

**Enhanced PRP Version:** 1.0 (12THHAUS v2.0 Specific)  
**Original Source:** /Users/mufasa/Desktop/Clients/12thhaus-v2/DEPLOYMENT_PRP.md  
**Last Updated:** 2025-07-26  
**Compatible With:** GitHub MCP Tools, Vercel MCP Tools, 12haus.com Domain Migration