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

from config import Config
from sop_reader import sop_reader
from master_agent import TaskRequest, TaskResponse

logger = logging.getLogger(__name__)

class BaseSpecialistAgent(ABC):
    """Base class for all specialist agents"""
    
    def __init__(self, agent_type: str):
        self.agent_type = agent_type
        self.llm = ChatAnthropic(
            model="claude-3-5-sonnet-20241022",
            temperature=Config.AGENT_TEMPERATURE,
            max_tokens=Config.AGENT_MAX_TOKENS,
            api_key=Config.ANTHROPIC_API_KEY
        )
        self.sop_reader = sop_reader
        self.sop = self.sop_reader.get_agent_specific_sop(agent_type)
        
        logger.info(f"Initialized {self.agent_type} agent")
    
    @traceable
    async def execute_task(self, task_request: TaskRequest) -> TaskResponse:
        """Execute a task using this specialist agent"""
        try:
            # Get system prompt based on SOP
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
            
            return TaskResponse(
                agent_type=self.agent_type,
                content=processed_response,
                status="completed",
                metadata={
                    "task_priority": task_request.priority,
                    "context_used": bool(task_request.context)
                }
            )
            
        except Exception as e:
            logger.error(f"Error in {self.agent_type} task execution: {e}")
            return TaskResponse(
                agent_type=self.agent_type,
                content=f"Error: {str(e)}",
                status="failed",
                metadata={"error": str(e)}
            )
    
    def _get_system_prompt(self) -> str:
        """Get the system prompt based on agent SOP"""
        if not self.sop:
            return f"You are a {self.agent_type} agent. Help users with tasks related to your domain."
        
        responsibilities = self.sop.get('responsibilities', [])
        protocols = self.sop.get('protocols', {})
        
        prompt = f"""You are a {self.sop.get('title', f'{self.agent_type} Agent')}.

Your responsibilities include:
{chr(10).join(f'- {resp}' for resp in responsibilities)}

Your protocols are:
{chr(10).join(f'- {key}: {value}' for key, value in protocols.items())}

Always follow these guidelines:
1. Stay within your domain of expertise
2. Follow the established protocols
3. Provide clear, actionable responses
4. Ask for clarification when needed
5. Escalate complex issues when appropriate
"""
        return prompt
    
    @abstractmethod
    def _create_task_prompt(self, task_request: TaskRequest) -> str:
        """Create a task-specific prompt for this agent"""
        pass
    
    def _process_response(self, response_content: str, task_request: TaskRequest) -> str:
        """Process the LLM response (can be overridden by subclasses)"""
        return response_content.strip()

class CodeGenerationAgent(BaseSpecialistAgent):
    """Agent specialized in code generation and programming tasks"""
    
    def __init__(self):
        super().__init__("code_generation")
    
    def _create_task_prompt(self, task_request: TaskRequest) -> str:
        """Create prompt for code generation tasks"""
        context_info = ""
        if task_request.context:
            context_info = f"\nContext: {task_request.context}"
        
        return f"""Code Generation Task:
{task_request.content}

Priority: {task_request.priority}
{context_info}

Please provide:
1. Clean, well-commented code
2. Error handling where appropriate
3. Basic usage examples
4. Any necessary dependencies or setup instructions

Focus on best practices and maintainable code."""
    
    def _process_response(self, response_content: str, task_request: TaskRequest) -> str:
        """Process code generation response"""
        # Add code generation specific processing
        if "```" not in response_content:
            # If no code blocks, format the response better
            response_content = f"Code Generation Response:\n\n{response_content}"
        
        return response_content

class DeploymentAgent(BaseSpecialistAgent):
    """Agent specialized in deployment and CI/CD tasks"""
    
    def __init__(self):
        super().__init__("deployment")
    
    def _create_task_prompt(self, task_request: TaskRequest) -> str:
        """Create prompt for deployment tasks"""
        context_info = ""
        if task_request.context:
            context_info = f"\nContext: {task_request.context}"
        
        return f"""Deployment Task:
{task_request.content}

Priority: {task_request.priority}
{context_info}

Please provide:
1. Deployment strategy and steps
2. Risk assessment and mitigation
3. Rollback procedures
4. Monitoring and health checks
5. Post-deployment verification steps

Consider security, scalability, and reliability."""
    
    def _process_response(self, response_content: str, task_request: TaskRequest) -> str:
        """Process deployment response"""
        # Add deployment checklist if not present
        if "checklist" not in response_content.lower():
            response_content += "\n\n**Deployment Checklist:**\n- [ ] Pre-deployment tests passed\n- [ ] Security scan completed\n- [ ] Backup created\n- [ ] Monitoring in place\n- [ ] Rollback plan ready"
        
        return response_content

class BusinessIntelligenceAgent(BaseSpecialistAgent):
    """Agent specialized in business intelligence and analytics"""
    
    def __init__(self):
        super().__init__("business_intelligence")
    
    def _create_task_prompt(self, task_request: TaskRequest) -> str:
        """Create prompt for business intelligence tasks"""
        context_info = ""
        if task_request.context:
            context_info = f"\nContext: {task_request.context}"
        
        return f"""Business Intelligence Task:
{task_request.content}

Priority: {task_request.priority}
{context_info}

Please provide:
1. Data analysis approach
2. Key metrics and KPIs to track
3. Insights and recommendations
4. Visualization suggestions
5. Action items for improvement

Focus on actionable business insights."""
    
    def _process_response(self, response_content: str, task_request: TaskRequest) -> str:
        """Process business intelligence response"""
        # Add executive summary if not present
        if "summary" not in response_content.lower():
            response_content = f"**Executive Summary:**\n[Key findings and recommendations]\n\n{response_content}"
        
        return response_content

class CustomerOperationsAgent(BaseSpecialistAgent):
    """Agent specialized in customer operations and support"""
    
    def __init__(self):
        super().__init__("customer_operations")
    
    def _create_task_prompt(self, task_request: TaskRequest) -> str:
        """Create prompt for customer operations tasks"""
        context_info = ""
        if task_request.context:
            context_info = f"\nContext: {task_request.context}"
        
        return f"""Customer Operations Task:
{task_request.content}

Priority: {task_request.priority}
{context_info}

Please provide:
1. Customer-focused solution
2. Step-by-step resolution process
3. Escalation criteria (if applicable)
4. Follow-up actions
5. Customer satisfaction measures

Maintain a helpful and professional tone."""
    
    def _process_response(self, response_content: str, task_request: TaskRequest) -> str:
        """Process customer operations response"""
        # Ensure customer-friendly tone
        if not response_content.startswith("Dear") and not response_content.startswith("Hello"):
            response_content = f"Customer Service Response:\n\n{response_content}"
        
        return response_content

class MarketingAutomationAgent(BaseSpecialistAgent):
    """Agent specialized in marketing automation and campaigns"""
    
    def __init__(self):
        super().__init__("marketing_automation")
    
    def _create_task_prompt(self, task_request: TaskRequest) -> str:
        """Create prompt for marketing automation tasks"""
        context_info = ""
        if task_request.context:
            context_info = f"\nContext: {task_request.context}"
        
        return f"""Marketing Automation Task:
{task_request.content}

Priority: {task_request.priority}
{context_info}

Please provide:
1. Marketing strategy and approach
2. Content creation guidelines
3. Campaign execution plan
4. Success metrics and KPIs
5. Optimization recommendations

Focus on engagement and conversion optimization."""
    
    def _process_response(self, response_content: str, task_request: TaskRequest) -> str:
        """Process marketing automation response"""
        # Add campaign metrics if not present
        if "metric" not in response_content.lower():
            response_content += "\n\n**Key Metrics to Track:**\n- Engagement rate\n- Click-through rate\n- Conversion rate\n- ROI"
        
        return response_content

# Agent registry for easy access
AGENT_REGISTRY = {
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
        raise ValueError(f"Unknown agent type: {agent_type}")
    return agent_class()