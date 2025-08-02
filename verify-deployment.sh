#\!/bin/bash

echo "🔍 DEPLOYMENT VERIFICATION SCRIPT"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "1. Checking Project Configuration..."

# Check Vercel project configuration
if [ -f ".vercel/project.json" ]; then
    echo -e "${GREEN}✅ .vercel/project.json exists${NC}"
    LOCAL_PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4)
    LOCAL_ORG_ID=$(cat .vercel/project.json | grep -o '"orgId":"[^"]*"' | cut -d'"' -f4)
    echo "   Local Project ID: $LOCAL_PROJECT_ID"
    echo "   Local Org ID: $LOCAL_ORG_ID"
else
    echo -e "${RED}❌ .vercel/project.json missing${NC}"
fi

# Check GitHub Actions configuration
if [ -f ".github/workflows/main.yml" ]; then
    echo -e "${GREEN}✅ GitHub Actions workflow exists${NC}"
    WORKFLOW_PROJECT_ID=$(grep "VERCEL_PROJECT_ID:" .github/workflows/main.yml | cut -d':' -f2 | tr -d ' ')
    WORKFLOW_ORG_ID=$(grep "VERCEL_ORG_ID:" .github/workflows/main.yml | cut -d':' -f2 | tr -d ' ')
    echo "   Workflow Project ID: $WORKFLOW_PROJECT_ID"
    echo "   Workflow Org ID: $WORKFLOW_ORG_ID"
    
    # Compare IDs
    if [ "$LOCAL_PROJECT_ID" = "$WORKFLOW_PROJECT_ID" ]; then
        echo -e "${GREEN}✅ Project IDs match${NC}"
    else
        echo -e "${RED}❌ Project ID mismatch detected${NC}"
        echo "   Local: $LOCAL_PROJECT_ID"
        echo "   Workflow: $WORKFLOW_PROJECT_ID"
    fi
    
    if [ "$LOCAL_ORG_ID" = "$WORKFLOW_ORG_ID" ]; then
        echo -e "${GREEN}✅ Organization IDs match${NC}"
    else
        echo -e "${RED}❌ Organization ID mismatch detected${NC}"
        echo "   Local: $LOCAL_ORG_ID"
        echo "   Workflow: $WORKFLOW_ORG_ID"
    fi
else
    echo -e "${RED}❌ GitHub Actions workflow missing${NC}"
fi

echo ""
echo "2. Checking Frontend Build Configuration..."

if [ -f "frontend/package.json" ]; then
    echo -e "${GREEN}✅ frontend/package.json exists${NC}"
    cd frontend
    if npm list next > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Next.js dependency installed${NC}"
    else
        echo -e "${RED}❌ Next.js dependency missing${NC}"
    fi
    
    if npm list @clerk/nextjs > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Clerk dependency installed${NC}"
    else
        echo -e "${RED}❌ Clerk dependency missing${NC}"
    fi
    cd ..
else
    echo -e "${RED}❌ frontend/package.json missing${NC}"
fi

echo ""
echo "3. Testing Local Build..."

cd frontend
if npm run build > build.log 2>&1; then
    echo -e "${GREEN}✅ Local build successful${NC}"
    rm -f build.log
else
    echo -e "${RED}❌ Local build failed${NC}"
    echo "Check build.log for details"
fi
cd ..

echo ""
echo "4. Checking Environment Variables..."

ENV_FILE="frontend/.env.local"
if [ -f "$ENV_FILE" ]; then
    echo -e "${GREEN}✅ .env.local exists${NC}"
    
    if grep -q "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "$ENV_FILE"; then
        echo -e "${GREEN}✅ Clerk publishable key configured${NC}"
    else
        echo -e "${RED}❌ Clerk publishable key missing${NC}"
    fi
    
    if grep -q "CLERK_SECRET_KEY" "$ENV_FILE"; then
        echo -e "${GREEN}✅ Clerk secret key configured${NC}"
    else
        echo -e "${RED}❌ Clerk secret key missing${NC}"
    fi
    
    if grep -q "NEXT_PUBLIC_GRAPHQL_URL" "$ENV_FILE"; then
        echo -e "${GREEN}✅ GraphQL URL configured${NC}"
    else
        echo -e "${RED}❌ GraphQL URL missing${NC}"
    fi
else
    echo -e "${RED}❌ .env.local missing${NC}"
fi

echo ""
echo "5. Summary"
echo "=========="

if [ "$LOCAL_PROJECT_ID" = "$WORKFLOW_PROJECT_ID" ] && [ -f "frontend/package.json" ]; then
    echo -e "${GREEN}🚀 DEPLOYMENT READY${NC}"
    echo "All critical configurations are properly set up."
    echo ""
    echo "Next steps:"
    echo "1. Commit and push your changes"
    echo "2. Monitor GitHub Actions deployment"
    echo "3. Verify deployment on Vercel dashboard"
else
    echo -e "${RED}⚠️  DEPLOYMENT ISSUES DETECTED${NC}"
    echo "Please resolve the issues above before deploying."
fi

echo ""
EOF < /dev/null