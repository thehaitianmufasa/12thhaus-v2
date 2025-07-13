# LangGraph Multi-Agent System

A sophisticated multi-agent system built with LangGraph and integrated with LangSmith for monitoring and observability. The system features a master agent that intelligently routes tasks to 5 specialized agents, each with their own Standard Operating Procedures (SOPs).

## Architecture

```
                    ┌─────────────────┐
                    │   Master Agent  │
                    │   (Task Router) │
                    └─────────┬───────┘
                              │
                    ┌─────────┴───────┐
                    │  Task Analysis  │
                    │  & Routing      │
                    └─────────┬───────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Code      │    │   Deployment    │    │   Business      │
│ Generation  │    │     Agent       │    │ Intelligence    │
│   Agent     │    │                 │    │     Agent       │
└─────────────┘    └─────────────────┘    └─────────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌─────────────┐    ┌─────────────────┐
│  Customer   │    │   Marketing     │
│ Operations  │    │  Automation     │
│   Agent     │    │     Agent       │
└─────────────┘    └─────────────────┘
        │                     │
        └─────────────────────┘
                    │
                    ▼
        ┌─────────────────────┐
        │   LangSmith         │
        │   Monitoring        │
        └─────────────────────┘
```

## Features

- **Master Agent**: Intelligent task routing based on content analysis
- **5 Specialized Agents**: Each with domain-specific expertise
- **SOP Integration**: Standard Operating Procedures for consistent behavior
- **LangSmith Integration**: Complete observability and monitoring
- **Task Coordination**: Queue management and resource coordination
- **Performance Monitoring**: Real-time metrics and health checks

## Specialized Agents

### 1. Code Generation Agent
- **Purpose**: Generate high-quality code from natural language prompts
- **Capabilities**: 
  - Code generation with best practices
  - Documentation and comments
  - Error handling
  - Basic testing examples

### 2. Deployment Agent
- **Purpose**: Handle CI/CD and production deployments
- **Capabilities**:
  - Deployment strategy planning
  - Risk assessment
  - Rollback procedures
  - Health monitoring

### 3. Business Intelligence Agent
- **Purpose**: Analyze metrics and provide business insights
- **Capabilities**:
  - Data analysis recommendations
  - KPI tracking
  - Visualization suggestions
  - Optimization insights

### 4. Customer Operations Agent
- **Purpose**: Handle customer support and onboarding
- **Capabilities**:
  - Customer inquiry resolution
  - Onboarding guidance
  - Issue escalation
  - Satisfaction tracking

### 5. Marketing Automation Agent
- **Purpose**: Generate marketing content and manage campaigns
- **Capabilities**:
  - Content creation
  - Campaign strategy
  - Performance analysis
  - Optimization recommendations

## Installation

1. **Clone or create the project directory**:
```bash
mkdir langgraph-multi-agent
cd langgraph-multi-agent
```

2. **Create virtual environment**:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**:
```bash
pip install langgraph langsmith langchain-anthropic python-dotenv
```

4. **Configure environment variables**:
Create a `.env` file with:
```env
LANGCHAIN_TRACING_V2=true
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
LANGCHAIN_API_KEY=your_langsmith_api_key_here
LANGCHAIN_PROJECT=langgraph-multi-agent
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

## Usage

### Command Line Interface

1. **Process a single task**:
```bash
python main.py task --task "Create a Python function to calculate fibonacci numbers"
```

2. **Process with priority and context**:
```bash
python main.py task --task "Deploy my Flask app" --priority high --context '{"platform": "AWS"}'
```

3. **Check system status**:
```bash
python main.py status
```

4. **Run demonstration**:
```bash
python main.py demo
```

5. **Interactive mode**:
```bash
python main.py interactive
```

### Python API

```python
from main import MultiAgentSystem
import asyncio

async def main():
    system = MultiAgentSystem()
    
    # Process a task
    response = await system.process_task(
        "Create a REST API using FastAPI",
        priority="high",
        context={"framework": "FastAPI", "database": "PostgreSQL"}
    )
    
    print(response)

asyncio.run(main())
```

## Configuration

### Environment Variables

- `LANGCHAIN_TRACING_V2`: Enable LangSmith tracing (default: true)
- `LANGCHAIN_ENDPOINT`: LangSmith API endpoint
- `LANGCHAIN_API_KEY`: Your LangSmith API key
- `LANGCHAIN_PROJECT`: Project name in LangSmith
- `ANTHROPIC_API_KEY`: Your Anthropic API key
- `AGENT_TEMPERATURE`: LLM temperature (default: 0.7)
- `AGENT_MAX_TOKENS`: Maximum tokens per response (default: 4000)

### SOP Files

The system automatically creates Standard Operating Procedure files for each agent in the `sop_files/` directory:

- `code_generation_sop.json`
- `deployment_sop.json`
- `business_intelligence_sop.json`
- `customer_operations_sop.json`
- `marketing_automation_sop.json`

You can customize these files to modify agent behavior and responsibilities.

## Monitoring

### LangSmith Integration

The system is fully integrated with LangSmith for:
- Request tracing
- Performance monitoring
- Error tracking
- Agent behavior analysis

### Health Checks

Monitor system health with:
```python
from monitoring import get_monitor

monitor = get_monitor()
health = monitor.get_system_health()
metrics = monitor.get_performance_metrics()
```

### Performance Metrics

- Task completion rates
- Response times
- Error rates
- Agent utilization
- System uptime

## File Structure

```
langgraph-multi-agent/
├── main.py                 # Main application entry point
├── config.py              # Configuration management
├── master_agent.py        # Master agent implementation
├── specialist_agents.py   # All specialized agents
├── sop_reader.py          # SOP file management
├── monitoring.py          # Monitoring and coordination
├── .env                   # Environment variables
├── README.md             # This file
└── sop_files/            # SOP files directory
    ├── code_generation_sop.json
    ├── deployment_sop.json
    ├── business_intelligence_sop.json
    ├── customer_operations_sop.json
    └── marketing_automation_sop.json
```

## Example Tasks

### Code Generation
```
Task: "Create a Python class for managing user authentication"
Agent: Code Generation Agent
Output: Complete Python class with methods, documentation, and examples
```

### Deployment
```
Task: "How do I deploy a Django app to production?"
Agent: Deployment Agent
Output: Step-by-step deployment guide with security considerations
```

### Business Intelligence
```
Task: "Analyze our customer retention metrics"
Agent: Business Intelligence Agent
Output: Analysis framework, key metrics, and recommendations
```

### Customer Operations
```
Task: "A customer can't access their dashboard"
Agent: Customer Operations Agent
Output: Troubleshooting steps and resolution process
```

### Marketing Automation
```
Task: "Create a product launch campaign"
Agent: Marketing Automation Agent
Output: Campaign strategy, content ideas, and success metrics
```

## Advanced Features

### Task Coordination
- Queue management for high-volume requests
- Resource locks for concurrent operations
- Priority-based task scheduling

### Error Handling
- Graceful degradation on agent failures
- Automatic retry mechanisms
- Comprehensive error logging

### Extensibility
- Easy addition of new specialist agents
- Configurable routing logic
- Plugin-based SOP system

## Troubleshooting

### Common Issues

1. **Missing API Keys**: Ensure all required environment variables are set
2. **Import Errors**: Check that all dependencies are installed
3. **Agent Failures**: Check logs for specific error messages
4. **LangSmith Issues**: Verify API key and endpoint configuration

### Debug Mode

Enable debug logging:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Contributing

1. Follow the existing code structure
2. Add comprehensive docstrings
3. Include LangSmith tracing decorators
4. Update SOPs when adding new agents
5. Add appropriate tests

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review LangSmith traces for errors
3. Examine agent logs for specific issues
4. Verify configuration settings