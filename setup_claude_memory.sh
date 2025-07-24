#!/bin/bash

echo "Setting up Claude Code Memory System..."

# Create memory directory if it doesn't exist
mkdir -p .claude_memory

# Create persistent context file
cat > .claude_memory/persistent_context.json << 'CONTEXT'
{
  "project_name": "LangGraph Multi-Agent Platform",
  "status": "production_ready",
  "test_coverage": "82%",
  "test_status": "87/87_passing",
  "last_updated": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "secrets_location": "~/Desktop/PROJECT_SECRETS_REFERENCE.txt",
  "main_directory": "/Users/mufasa/langgraph-multi-agent-platform/",
  "verification_protocol": "DEV_VERIFICATION_PROTOCOL.md",
  "guidelines_file": "CLAUDE_CODE_DEVELOPMENT_GUIDELINES.md"
}
CONTEXT

# Create MCP tools reference
cat > .claude_memory/mcp_tools_available.md << 'TOOLS'
# Available MCP Tools for Claude Code

## File & System Operations
- **Desktop Commander**: Terminal commands, file operations, system analysis
- **Memory MCP**: Persistent conversation history, knowledge graphs

## Development & Testing  
- **Playwright MCP**: Browser automation, frontend testing
- **Context 7 MCP**: Documentation lookup, best practices research

## Deployment & Infrastructure
- **Vercel Deployment MCP**: Production deployment management
- **Brave Search MCP**: Web search, market research

## Data & Automation
- **Apify Scraping MCP**: Web scraping, data collection

## Integration Notes
- Always coordinate with Desktop Claude for strategic decisions
- Use these tools proactively for comprehensive development
- Reference PROJECT_SECRETS_REFERENCE.txt for API keys
TOOLS

echo "Memory system initialized successfully!"
echo "Guidelines saved to: CLAUDE_CODE_DEVELOPMENT_GUIDELINES.md"
echo "Memory context saved to: .claude_memory/"