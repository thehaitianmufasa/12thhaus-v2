# 🔧 MCP TOOLS REFERENCE - Always Available

## **Current MCP Servers Available** (From claude_desktop_config.json)

### **🌐 Web & Search**
- **brave-search**: `mcp__brave-search__brave_web_search`, `mcp__brave-search__brave_local_search`
- **wikipedia**: `mcp__wikipedia__search_wikipedia`, `mcp__wikipedia__get_article`, `mcp__wikipedia__get_summary`

### **🐙 GitHub Integration**
- **github**: `mcp__github-mcp__create_or_update_file`, `mcp__github-mcp__search_repositories`, `mcp__github-mcp__get_file_contents`, `mcp__github-mcp__create_pull_request`, `mcp__github-mcp__create_issue`

### **🗄️ Database & Backend**
- **supabase**: `mcp__supabase__list_projects`, `mcp__supabase__execute_sql`, `mcp__supabase__apply_migration`, `mcp__supabase__create_branch`

### **📚 Documentation**
- **context7**: `mcp__context7__resolve-library-id`, `mcp__context7__get-library-docs`

### **🎭 Browser Automation**
- **playwright**: `/Users/mufasa/mcp-tools/browser/playwright-mcp/cli.js` (CONFIRMED RUNNING)

### **📝 Memory & Notes**
- **memory**: `/Users/mufasa/mcp-tools/core/mcp-servers/src/memory/dist/index.js`
- **sequential-thinking**: `/Users/mufasa/mcp-tools/core/mcp-servers/src/sequentialthinking/dist/index.js`

### **☁️ Deployment**
- **vercel**: `/Users/mufasa/mcp-tools/deployment/mcp-vercel/build/index.js`

### **🔧 DevOps**
- **docker**: `uvx mcp-server-docker`
- **n8n**: `/Users/mufasa/mcp-tools/automation/n8n-mcp-server/build/index.js`

### **🖥️ Desktop**
- **desktop-commander**: Desktop automation commands

## **Quick Test Commands**
```bash
# Check running MCP processes
ps aux | grep -E "(playwright|mcp)" | grep -v grep

# Verify MCP config
cat "/Users/mufasa/Library/Application Support/Claude/claude_desktop_config.json"

# Test specific MCP
node /Users/mufasa/mcp-tools/browser/playwright-mcp/cli.js --help
```

## **Workaround for ListMcpResourcesTool Issues**
When `ListMcpResourcesTool` fails, use direct function calls:
- `mcp__brave-search__brave_web_search`
- `mcp__github-mcp__get_file_contents`
- `mcp__supabase__execute_sql`
- etc.

---
**Last Updated**: July 25, 2025 - 10:10 AM EST
**Status**: All MCP servers confirmed running via process list