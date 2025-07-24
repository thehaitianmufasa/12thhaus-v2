# Claude Code Development Guidelines & Memory System

## Core Development Standards

### Verification Requirements
- Always verify completion using DEV_VERIFICATION_PROTOCOL.md
- Test actual functionality, not just code existence  
- Update verification status before marking tasks complete

### Testing Requirements
- Write tests BEFORE implementation when possible
- Maintain current test coverage percentage (target: 82%+)
- All new features require corresponding test coverage
- Run full test suite before any deployment

### Development Workflow Integration
- Reference Task Master breakdown for context
- Follow PRP template specifications exactly
- Coordinate with Desktop Commander for file operations
- Update project status in memory after each major milestone

### Quality Requirements
- No code deployment without passing tests
- All PRs require linting success (`npm run lint`)
- Performance benchmarks must be maintained
- Security standards per enterprise requirements

### Tool Integration
- Use playwright MCP for frontend testing
- Leverage sequentialthinking for complex problem solving
- Reference COMPREHENSIVE_PROJECT_REFERENCE.md for full context
- Coordinate with Desktop Claude for strategic decisions

## Project Context Awareness
- **Platform**: LangGraph Multi-Agent Platform (Production-Ready)
- **Status**: 82% test coverage, 87/87 tests passing
- **Architecture**: 6 AI agents orchestrated by master brain
- **Target Market**: Enterprise customers ($2.5K-$50K/month)
- **Repository**: https://github.com/thehaitianmufasa/langgraph-multi-agent-platform

## API Secrets & Configuration
- **Location**: ~/Desktop/PROJECT_SECRETS_REFERENCE.txt
- **Contains**: LangGraph Platform keys, Biddy APIs, Infrastructure secrets
- **Access Method**: Always read from desktop file, never hardcode
- **Security**: Local file only, never commit to version control

## Available MCP Tools & Integration
- **Desktop Commander**: File operations, terminal commands, system analysis
- **Memory MCP**: Persistent conversation history, knowledge graph building
- **Brave Search MCP**: Web search, documentation lookup, market research
- **Playwright MCP**: Browser automation, frontend testing, UI validation
- **Context 7 MCP**: Current documentation, best practices research
- **Vercel Deployment MCP**: Production deployment management
- **Apify Scraping MCP**: Data collection, web scraping automation

## Key Project Directories
- **Main Platform**: /Users/mufasa/langgraph-multi-agent-platform/ (Clean base)
- **Biddy Development**: /Users/mufasa/langgraph-multi-agent-platform-biddy/
- **Task Master**: /Users/mufasa/claude-task-master/ (Strategic planning)
- **PRP Templates**: /Users/mufasa/prps-agentic-eng/ (Implementation context)
- **Backup**: gs://brainsnax-backups/ (Google Cloud auto-backup)

## Development Workflow Protocol
1. **Start**: Read Task Master breakdown and PRP specifications
2. **Setup**: Check DEV_VERIFICATION_PROTOCOL.md for current status
3. **Implement**: Follow TDD approach, write tests first
4. **Verify**: Test functionality, update verification protocol
5. **Deploy**: Ensure all quality gates pass before deployment
6. **Document**: Update memory and project status

## Git Standards
- Conventional Commits formatting required
- Conventional Branch naming (prefix-based)
- No mention of Claude as co-author in commits
- Run linting before commits (`npm run lint`)

## Visual Development Standards
- Use Playwright MCP for frontend changes verification
- Reference design principles in `/context/design-principles.md`
- Follow S-tier SaaS standards (Stripe, Airbnb, Linear inspired)
- WCAG AA+ accessibility compliance