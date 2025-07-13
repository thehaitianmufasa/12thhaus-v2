# 🚀 Deployment Guide: GitHub Actions + Vercel + LangSmith

## ✅ Setup Complete

Your LangGraph Multi-Agent System is now ready for deployment with:
- **GitHub Actions CI/CD Pipeline**
- **Vercel Serverless Deployment**
- **LangSmith Monitoring Integration**
- **Automated Testing**

## 📋 Pre-Deployment Checklist

### 1. GitHub Repository Setup
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit: LangGraph Multi-Agent System"

# Create GitHub repository and push
gh repo create langgraph-multi-agent --public
git remote add origin https://github.com/YOUR_USERNAME/langgraph-multi-agent.git
git push -u origin main
```

### 2. GitHub Secrets Configuration
Go to your GitHub repository → Settings → Secrets and Variables → Actions

Add these secrets:
```
LANGCHAIN_API_KEY=your_langsmith_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
VERCEL_DEPLOYMENT_URL=https://your-app.vercel.app
```

### 3. Vercel Setup
1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login and link project:**
   ```bash
   vercel login
   vercel link
   ```

3. **Get your organization and project IDs:**
   ```bash
   vercel org ls    # Get ORG_ID
   vercel project ls # Get PROJECT_ID
   ```

4. **Add environment variables in Vercel dashboard:**
   - Go to Vercel dashboard → Your Project → Settings → Environment Variables
   - Add:
     - `LANGCHAIN_TRACING_V2` = `true`
     - `LANGCHAIN_API_KEY` = `your_langsmith_key`
     - `ANTHROPIC_API_KEY` = `your_anthropic_key`
     - `LANGCHAIN_PROJECT` = `langgraph-multi-agent-prod`

## 🚀 Deployment Process

### Automatic Deployment
1. **Push to main branch:**
   ```bash
   git push origin main
   ```

2. **GitHub Actions will automatically:**
   - ✅ Run tests
   - ✅ Validate LangSmith integration
   - ✅ Deploy to Vercel
   - ✅ Run health checks
   - ✅ Notify deployment status

### Manual Deployment
```bash
# Deploy directly to Vercel
vercel --prod

# Or deploy specific branch
vercel --prod --target production
```

## 📊 Monitoring & Health Checks

### Available Endpoints
Once deployed, your system will have these endpoints:

- **Health Check:** `https://your-app.vercel.app/health`
- **System Status:** `https://your-app.vercel.app/status`
- **Task Processing:** `https://your-app.vercel.app/task` (POST)
- **Home:** `https://your-app.vercel.app/`

### LangSmith Integration
- **Traces:** View at [smith.langchain.com](https://smith.langchain.com)
- **Project:** `langgraph-multi-agent-prod`
- **Monitoring:** Real-time agent performance and errors

### Example API Usage
```bash
# Health check
curl https://your-app.vercel.app/health

# Process a task
curl -X POST https://your-app.vercel.app/task \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Create a Python function that sorts a list",
    "priority": "medium",
    "context": {"language": "python"}
  }'
```

## 🔧 Troubleshooting

### Common Issues

1. **Deployment fails on tests:**
   ```bash
   # Run tests locally first
   pytest test_basic.py
   ```

2. **Environment variables not set:**
   - Check GitHub Secrets
   - Verify Vercel environment variables
   - Ensure `.env` file is not committed

3. **API endpoints return 500:**
   - Check Vercel function logs
   - Verify all dependencies in requirements.txt
   - Check LangSmith API key validity

4. **GitHub Actions workflow fails:**
   - Check workflow logs in GitHub Actions tab
   - Verify all secrets are set correctly
   - Ensure requirements.txt is up to date

### Debug Commands
```bash
# Check Vercel logs
vercel logs

# Test local deployment
vercel dev

# Run tests with verbose output
pytest test_basic.py -v

# Check system status locally
python main.py status
```

## 🔄 Rollback Procedures

### Automatic Rollback
The GitHub Actions workflow includes automatic rollback if:
- Health checks fail
- Tests don't pass
- Deployment errors occur

### Manual Rollback
```bash
# List deployments
vercel ls

# Rollback to previous version
vercel rollback DEPLOYMENT_URL
```

## 📈 Scaling Considerations

### Vercel Limits
- **Function Timeout:** 10s (hobby), 15s+ (pro)
- **Memory:** 1GB (hobby), 3GB+ (pro)
- **Concurrent Executions:** 10 (hobby), 1000+ (pro)

### Optimization Tips
1. **Cold Starts:** Keep functions warm with health checks
2. **Memory Usage:** Monitor in Vercel dashboard
3. **API Limits:** Implement rate limiting
4. **LangSmith Costs:** Monitor token usage

## 🎯 Next Steps

1. **Custom Domain:** Add custom domain in Vercel dashboard
2. **SSL Certificate:** Automatic with Vercel
3. **Monitoring Alerts:** Set up Vercel monitoring alerts
4. **Performance Optimization:** Monitor LangSmith traces
5. **Load Testing:** Test with production workloads

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [LangSmith Documentation](https://docs.smith.langchain.com/)
- [System Repository](https://github.com/YOUR_USERNAME/langgraph-multi-agent)

---

Your LangGraph Multi-Agent System is now production-ready! 🎉