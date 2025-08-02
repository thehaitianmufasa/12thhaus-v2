"""
Specialist Agents for the LangGraph Multi-Agent System
Each agent handles specific domain tasks with SOP context
"""
import asyncio
import logging
from typing import Dict, List, Any, Optional
from abc import ABC, abstractmethod
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_anthropic import ChatAnthropic
from langsmith import traceable
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

class BaseSpecialistAgent(ABC):
    """Base class for all specialist agents"""
    
    def __init__(self, agent_type: str):
        self.agent_type = agent_type
        self.llm = ChatAnthropic(
            model="claude-3-5-sonnet-20241022",
            temperature=0.1,
            max_tokens=4000
        )
        
        logger.info(f"Initialized {self.agent_type} agent")
    
    @traceable
    async def execute_task(self, task_request) -> dict:
        """Execute a task using this specialist agent"""
        try:
            # Get system prompt based on agent type
            system_prompt = self._get_system_prompt()
            
            # Create task-specific prompt
            task_prompt = self._create_task_prompt(task_request)
            
            # Execute task with LLM
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=task_prompt)
            ])
            
            # Process response
            processed_response = self._process_response(response.content, task_request)
            
            return {
                "agent_type": self.agent_type,
                "content": processed_response,
                "status": "completed",
                "metadata": {
                    "task_priority": getattr(task_request, 'priority', 'medium'),
                    "context_used": bool(getattr(task_request, 'context', None))
                }
            }
            
        except Exception as e:
            logger.error(f"Error in {self.agent_type} task execution: {e}")
            return {
                "agent_type": self.agent_type,
                "content": f"Error: {str(e)}",
                "status": "failed",
                "metadata": {"error": str(e)}
            }
    
    def _get_system_prompt(self) -> str:
        """Get the system prompt based on agent type"""
        prompts = {
            "technical-orchestrator": """You are the Technical Orchestrator Agent - master coordinator for multi-agent task delegation, workflow management, and inter-agent communication with v2.0 enhanced dynamic routing, error handling, and performance optimization. Use PROACTIVELY for complex tasks requiring multiple agents, project status updates, and strategic workflow coordination.""",
            
            "implementation-engineer": """You are the Implementation Engineer Agent - expert development engineer specializing in PRP execution, code implementation, testing, and deployment for LangGraph platform. Use PROACTIVELY for coding tasks, deployments, file operations, and technical implementation.""",
            
            "frontend-ui-specialist": """You are the Frontend UI Specialist Agent - expert frontend developer specializing in React, Next.js, UI/UX design, component systems, and accessibility for enterprise applications. Use PROACTIVELY for UI development, component creation, design system implementation, and frontend optimization.""",
            
            "devops-infrastructure-specialist": """You are the DevOps Infrastructure Specialist Agent - expert DevOps engineer specializing in cloud infrastructure, containerization, CI/CD pipelines, monitoring, and enterprise-scale deployment automation. Use PROACTIVELY for infrastructure management, deployment optimization, and system reliability.""",
            
            "data-analytics-specialist": """You are the Data Analytics Specialist Agent - expert data scientist and analytics engineer specializing in business intelligence, user behavior analysis, performance metrics, and data-driven decision making for SaaS platforms. Use PROACTIVELY for data analysis, metrics tracking, and business intelligence.""",
            
            "automation-specialist": """You are the Automation Specialist Agent - workflow automation expert specializing in n8n workflows, deployment automation, and process optimization. Use PROACTIVELY for automation tasks, workflow creation, and process optimization.""",
            
            "strategic-architect": """You are the Strategic Architect Agent - visionary business strategist specializing in market research, competitive analysis, and strategic planning for LangGraph platform and enterprise SaaS. Use PROACTIVELY for market analysis, business strategy, and strategic planning tasks.""",
            
            "security-specialist": """You are the Security Specialist Agent - expert cybersecurity engineer specializing in enterprise security, compliance, threat assessment, and security architecture for SaaS platforms. Use PROACTIVELY for security audits, compliance validation, and threat mitigation.""",
            
            "research-analyst": """You are the Research Analyst Agent - deep research specialist for competitive analysis, technical documentation, market intelligence, and evidence-based insights. Use PROACTIVELY for comprehensive research tasks, competitive analysis, and technical documentation gathering.""",
            
            "qa-verification": """You are the QA Verification Agent - quality assurance and verification specialist responsible for testing, validation, and DEV_VERIFICATION_PROTOCOL execution. Use PROACTIVELY for testing tasks, quality validation, and verification protocols.""",
            
            "code_generation": """You are the Code Generation Agent - specialist in generating clean, well-documented code with error handling and best practices. Focus on maintainable, production-ready code.""",
            
            "deployment": """You are the Deployment Agent - specialist in deployment strategies, CI/CD pipelines, and infrastructure management. Focus on secure, scalable deployments.""",
            
            "business_intelligence": """You are the Business Intelligence Agent - specialist in data analysis, reporting, and business insights. Focus on actionable business recommendations.""",
            
            "customer_operations": """You are the Customer Operations Agent - specialist in customer support, issue resolution, and customer success. Maintain helpful and professional communication.""",
            
            "marketing_automation": """You are the Marketing Automation Agent - specialist in marketing campaigns, content creation, and automation. Focus on engagement and conversion optimization."""
        }
        
        return prompts.get(self.agent_type, f"You are a {self.agent_type} agent. Help users with tasks related to your domain.")
    
    @abstractmethod
    def _create_task_prompt(self, task_request) -> str:
        """Create a task-specific prompt for this agent"""
        pass
    
    def _process_response(self, response_content: str, task_request) -> str:
        """Process the LLM response (can be overridden by subclasses)"""
        return response_content.strip()

# Implement all 15 agents...
class TechnicalOrchestratorAgent(BaseSpecialistAgent):
    def __init__(self):
        super().__init__("technical-orchestrator")
    
    def _create_task_prompt(self, task_request) -> str:
        content = getattr(task_request, 'content', str(task_request))
        return f"Technical Orchestration Task: {content}\n\nProvide multi-agent coordination strategy with task delegation and workflow management."

class ImplementationEngineerAgent(BaseSpecialistAgent):
    def __init__(self):
        super().__init__("implementation-engineer")
    
    def _create_task_prompt(self, task_request) -> str:
        content = getattr(task_request, 'content', str(task_request))
        return f"Implementation Engineering Task: {content}\n\nProvide code implementation with testing and deployment strategy."

class FrontendUISpecialistAgent(BaseSpecialistAgent):
    def __init__(self):
        super().__init__("frontend-ui-specialist")
    
    def _create_task_prompt(self, task_request) -> str:
        content = getattr(task_request, 'content', str(task_request))
        return f"Frontend UI Task: {content}\n\nProvide React/Next.js solution with enterprise-grade UI/UX design."

class DevOpsInfrastructureSpecialistAgent(BaseSpecialistAgent):
    def __init__(self):
        super().__init__("devops-infrastructure-specialist")
    
    def _create_task_prompt(self, task_request) -> str:
        content = getattr(task_request, 'content', str(task_request))
        return f"DevOps Infrastructure Task: {content}\n\nProvide cloud infrastructure and deployment automation solution."

class DataAnalyticsSpecialistAgent(BaseSpecialistAgent):
    def __init__(self):
        super().__init__("data-analytics-specialist")
    
    def _create_task_prompt(self, task_request) -> str:
        content = getattr(task_request, 'content', str(task_request))
        return f"Data Analytics Task: {content}\n\nProvide business intelligence and data-driven insights."

class AutomationSpecialistAgent(BaseSpecialistAgent):
    def __init__(self):
        super().__init__("automation-specialist")
    
    def _create_task_prompt(self, task_request) -> str:
        content = getattr(task_request, 'content', str(task_request))
        return f"Automation Task: {content}\n\nProvide workflow automation and process optimization solution."

class StrategicArchitectAgent(BaseSpecialistAgent):
    def __init__(self):
        super().__init__("strategic-architect")
    
    def _create_task_prompt(self, task_request) -> str:
        content = getattr(task_request, 'content', str(task_request))
        return f"Strategic Architecture Task: {content}\n\nProvide market research and strategic planning insights."

class SecuritySpecialistAgent(BaseSpecialistAgent):
    def __init__(self):
        super().__init__("security-specialist")
    
    def _create_task_prompt(self, task_request) -> str:
        content = getattr(task_request, 'content', str(task_request))
        return f"Security Task: {content}\n\nProvide enterprise security and compliance solution."

class ResearchAnalystAgent(BaseSpecialistAgent):
    def __init__(self):
        super().__init__("research-analyst")
    
    def _create_task_prompt(self, task_request) -> str:
        content = getattr(task_request, 'content', str(task_request))
        return f"Research Analysis Task: {content}\n\nProvide comprehensive research and competitive analysis."

class QAVerificationAgent(BaseSpecialistAgent):
    def __init__(self):
        super().__init__("qa-verification")
    
    def _create_task_prompt(self, task_request) -> str:
        content = getattr(task_request, 'content', str(task_request))
        return f"QA Verification Task: {content}\n\nProvide testing strategy and quality validation."

class CodeGenerationAgent(BaseSpecialistAgent):
    def __init__(self):
        super().__init__("code_generation")
    
    def _create_task_prompt(self, task_request) -> str:
        content = getattr(task_request, 'content', str(task_request))
        return f"Code Generation Task: {content}\n\nProvide clean, well-documented code with error handling."

class DeploymentAgent(BaseSpecialistAgent):
    def __init__(self):
        super().__init__("deployment")
    
    def _create_task_prompt(self, task_request) -> str:
        content = getattr(task_request, 'content', str(task_request))
        return f"Deployment Task: {content}\n\nProvide deployment strategy with security and scalability."

class BusinessIntelligenceAgent(BaseSpecialistAgent):
    def __init__(self):
        super().__init__("business_intelligence")
    
    def _create_task_prompt(self, task_request) -> str:
        content = getattr(task_request, 'content', str(task_request))
        return f"Business Intelligence Task: {content}\n\nProvide data analysis and actionable business insights."

class CustomerOperationsAgent(BaseSpecialistAgent):
    def __init__(self):
        super().__init__("customer_operations")
    
    def _create_task_prompt(self, task_request) -> str:
        content = getattr(task_request, 'content', str(task_request))
        return f"Customer Operations Task: {content}\n\nProvide customer-focused solution with professional service."

class MarketingAutomationAgent(BaseSpecialistAgent):
    def __init__(self):
        super().__init__("marketing_automation")
    
    def _create_task_prompt(self, task_request) -> str:
        content = getattr(task_request, 'content', str(task_request))
        return f"Marketing Automation Task: {content}\n\nProvide marketing strategy and campaign execution plan."

# Complete Agent Registry (15 Agents)
AGENT_REGISTRY = {
    'technical-orchestrator': TechnicalOrchestratorAgent,
    'implementation-engineer': ImplementationEngineerAgent,
    'frontend-ui-specialist': FrontendUISpecialistAgent,
    'devops-infrastructure-specialist': DevOpsInfrastructureSpecialistAgent,
    'data-analytics-specialist': DataAnalyticsSpecialistAgent,
    'automation-specialist': AutomationSpecialistAgent,
    'strategic-architect': StrategicArchitectAgent,
    'security-specialist': SecuritySpecialistAgent,
    'research-analyst': ResearchAnalystAgent,
    'qa-verification': QAVerificationAgent,
    'code_generation': CodeGenerationAgent,
    'deployment': DeploymentAgent,
    'business_intelligence': BusinessIntelligenceAgent,
    'customer_operations': CustomerOperationsAgent,
    'marketing_automation': MarketingAutomationAgent
}

def get_agent(agent_type: str) -> BaseSpecialistAgent:
    """Get a specialist agent instance by type"""
    agent_class = AGENT_REGISTRY.get(agent_type)
    if not agent_class:
        raise ValueError(f"Unknown agent type: {agent_type}. Available: {list(AGENT_REGISTRY.keys())}")
    return agent_class()

def list_available_agents() -> List[str]:
    """Get list of all available agent types"""
    return list(AGENT_REGISTRY.keys())

def get_agent_info(agent_type: str) -> Dict[str, Any]:
    """Get information about a specific agent"""
    if agent_type not in AGENT_REGISTRY:
        return {"error": f"Unknown agent type: {agent_type}"}
    
    agent = get_agent(agent_type)
    return {
        "agent_type": agent_type,
        "class_name": agent.__class__.__name__,
        "system_prompt": agent._get_system_prompt(),
        "status": "available"
    }