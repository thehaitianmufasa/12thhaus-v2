#!/bin/bash

# Quick memory refresh for Claude Code
memory_refresh() {
    echo "=== Claude Code Memory Refresh ==="
    echo "Project: 12thhaus Spiritual Platform"
    echo "Status: Production-Ready (82% test coverage)"
    echo "Guidelines: ./CLAUDE_CODE_DEVELOPMENT_GUIDELINES.md"
    echo "Secrets: ~/Desktop/PROJECT_SECRETS_REFERENCE.txt"
    echo "Verification: ./DEV_VERIFICATION_PROTOCOL.md"
    echo "=================================="
}

# Show available MCP tools
show_tools() {
    cat .claude_memory/mcp_tools_available.md
}

# Update project status
update_status() {
    local new_status="$1"
    echo "Updating project status: $new_status"
    # Add logic to update persistent context
}

# Quick project summary
project_summary() {
    echo "=== 12thhaus Spiritual Platform ==="
    echo "Architecture: 6 AI agents with master orchestration"
    echo "Test Coverage: 82% (87/87 tests passing)"
    echo "Target Market: Enterprise ($2.5K-$50K/month)"
    echo "Repository: github.com/thehaitianmufasa/12thhaus-spiritual-platform"
    echo "====================================="
}

# Development checklist
dev_checklist() {
    echo "=== Development Checklist ==="
    echo "[ ] Read DEV_VERIFICATION_PROTOCOL.md"
    echo "[ ] Write tests before implementation"
    echo "[ ] Run npm run lint before commits"
    echo "[ ] Update verification status"
    echo "[ ] Check test coverage (target: 82%+)"
    echo "============================"
}

# Export functions for use
export -f memory_refresh
export -f show_tools
export -f update_status
export -f project_summary
export -f dev_checklist