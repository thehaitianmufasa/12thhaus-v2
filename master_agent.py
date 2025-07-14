"""
Master Agent for LangGraph Multi-Agent System
Handles task routing and coordination between specialist agents
"""
import asyncio
import logging
from typing import Dict, List, Any, Optional, Tuple
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_anthropic import ChatAnthropic
from langsmith import traceable
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import create_react_agent
from pydantic import BaseModel, Field

from config import Config
from sop_reader import sop_reader

logger = logging.getLogger(__name__)

class TaskRequest(BaseModel):
    """Represents a task request to be routed to an appropriate agent"""
    content: str = Field(..., description="The task content or request")
    priority: str = Field(default="medium", description="Priority level (high, medium, low)")
    context: Dict[str, Any] = Field(default_factory=dict, description="Additional context")
    requester: str = Field(default="user", description="Who requested the task")

class TaskResponse(BaseModel):
    """Represents a response from a specialist agent"""
    agent_type: str = Field(..., description="Type of agent that handled the task")
    content: str = Field(..., description="The response content")
    status: str = Field(..., description="Task status (completed, failed, in_progress)")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")

class AgentState(BaseModel):
    """State of the multi-agent system"""
    task_request: TaskRequest
    routing_decision: Optional[str] = None
    agent_responses: List[TaskResponse] = Field(default_factory=list)
    final_response: Optional[str] = None
    error: Optional[str] = None

class MasterAgent:
    """
    Master Agent that coordinates task routing and agent communication
    """
    
    def __init__(self):
        # Validate configuration
        Config.validate()
        
        # Initialize LLM with LangSmith tracing
        self.llm = ChatAnthropic(
            model="claude-3-5-sonnet-20241022",
            temperature=Config.AGENT_TEMPERATURE,
            max_tokens=Config.AGENT_MAX_TOKENS,
            api_key=Config.ANTHROPIC_API_KEY
        )
        
        # Initialize SOP reader
        self.sop_reader = sop_reader
        
        # Create default SOPs if they don't exist
        self.sop_reader.create_default_sops()
        
        # Agent type mappings
        self.agent_types = {
            'code_generation': 'Code Generation Agent',
            'deployment': 'Deployment Agent',
            'business_intelligence': 'Business Intelligence Agent',
            'customer_operations': 'Customer Operations Agent',
            'marketing_automation': 'Marketing Automation Agent'
        }
        
        # Initialize the master workflow
        self.workflow = self._create_workflow()
        
        logger.info("Master Agent initialized with LangSmith tracing")
    
    @traceable
    def _create_workflow(self) -> StateGraph:
        """Create the master agent workflow using LangGraph"""
        workflow = StateGraph(AgentState)
        
        # Add nodes
        workflow.add_node("route_task", self._route_task)
        workflow.add_node("execute_task", self._execute_task)
        workflow.add_node("synthesize_response", self._synthesize_response)
        
        # Add edges
        workflow.add_edge("route_task", "execute_task")
        workflow.add_edge("execute_task", "synthesize_response")
        workflow.add_edge("synthesize_response", END)
        
        # Set entry point
        workflow.set_entry_point("route_task")
        
        return workflow.compile()
    
    @traceable
    async def _route_task(self, state: AgentState) -> AgentState:
        """Route the task to the appropriate specialist agent"""
        try:
            # Get task routing prompt
            routing_prompt = self._get_routing_prompt(state.task_request)
            
            # Get routing decision from LLM
            response = await self.llm.ainvoke([
                SystemMessage(content=routing_prompt),
                HumanMessage(content=state.task_request.content)
            ])
            
            # Parse routing decision
            routing_decision = self._parse_routing_decision(response.content)
            
            state.routing_decision = routing_decision
            logger.info(f"Task routed to: {routing_decision}")
            
            return state
            
        except Exception as e:
            logger.error(f"Error in task routing: {e}")
            state.error = f"Routing error: {str(e)}"
            return state
    
    @traceable
    def _get_routing_prompt(self, task_request: TaskRequest) -> str:
        """Generate the routing prompt based on available agents and SOPs"""
        # Get all agent SOPs
        agent_sops = {
            agent_type: self.sop_reader.get_agent_specific_sop(agent_type)
            for agent_type in self.agent_types.keys()
        }
        
        # Build routing prompt
        prompt = f"""You are a Master Agent responsible for routing tasks to specialist agents.
        
Available Agents:
{self._format_agent_descriptions(agent_sops)}

Task Details:
- Content: {task_request.content}
- Priority: {task_request.priority}
- Context: {task_request.context}

Instructions:
1. Analyze the task request carefully
2. Consider which specialist agent is best suited for this task
3. Choose exactly ONE agent type from the available options
4. Respond with ONLY the agent type (e.g., "code_generation", "deployment", etc.)

If the task doesn't clearly fit any agent, choose the most appropriate one or "code_generation" as default.
"""
        return prompt
    
    def _format_agent_descriptions(self, agent_sops: Dict[str, Any]) -> str:
        """Format agent descriptions for the routing prompt"""
        descriptions = []
        
        for agent_type, sop in agent_sops.items():
            if sop:
                responsibilities = sop.get('responsibilities', [])
                desc = f"- {self.agent_types[agent_type]} ({agent_type}): {'; '.join(responsibilities[:3])}"
                descriptions.append(desc)
            else:
                desc = f"- {self.agent_types[agent_type]} ({agent_type}): General purpose agent"
                descriptions.append(desc)
        
        return "\n".join(descriptions)
    
    @traceable
    def _parse_routing_decision(self, response_content: str) -> str:
        """Parse the routing decision from LLM response"""
        # Clean up the response
        decision = response_content.strip().lower()
        
        # Check if it's a valid agent type
        if decision in self.agent_types:
            return decision
        
        # Try to find agent type in response
        for agent_type in self.agent_types.keys():
            if agent_type in decision:
                return agent_type
        
        # Default to code generation if no match
        logger.warning(f"Could not parse routing decision: {response_content}, defaulting to code_generation")
        return "code_generation"
    
    @traceable
    async def _execute_task(self, state: AgentState) -> AgentState:
        """Execute the task using the selected specialist agent"""
        try:
            if not state.routing_decision:
                raise ValueError("No routing decision available")
            
            # Get the specialist agent
            specialist_agent = self._get_specialist_agent(state.routing_decision)
            
            # Execute task with specialist agent
            response = await specialist_agent.execute_task(state.task_request)
            
            # Add response to state
            state.agent_responses.append(response)
            
            return state
            
        except Exception as e:
            logger.error(f"Error in task execution: {e}")
            state.error = f"Execution error: {str(e)}"
            return state
    
    def _get_specialist_agent(self, agent_type: str):
        """Get the specialist agent instance"""
        # Import specialist agents
        from specialist_agents import (
            CodeGenerationAgent,
            DeploymentAgent,
            BusinessIntelligenceAgent,
            CustomerOperationsAgent,
            MarketingAutomationAgent
        )
        
        agent_classes = {
            'code_generation': CodeGenerationAgent,
            'deployment': DeploymentAgent,
            'business_intelligence': BusinessIntelligenceAgent,
            'customer_operations': CustomerOperationsAgent,
            'marketing_automation': MarketingAutomationAgent
        }
        
        agent_class = agent_classes.get(agent_type)
        if not agent_class:
            raise ValueError(f"Unknown agent type: {agent_type}")
        
        return agent_class()
    
    @traceable
    async def _synthesize_response(self, state: AgentState) -> AgentState:
        """Synthesize the final response from agent outputs"""
        try:
            if state.error:
                state.final_response = f"Error: {state.error}"
                return state
            
            if not state.agent_responses:
                state.final_response = "No response received from specialist agents"
                return state
            
            # For now, just return the first (and should be only) response
            response = state.agent_responses[0]
            
            if response.status == "completed":
                state.final_response = response.content
            else:
                state.final_response = f"Task {response.status}: {response.content}"
            
            return state
            
        except Exception as e:
            logger.error(f"Error in response synthesis: {e}")
            state.error = f"Synthesis error: {str(e)}"
            state.final_response = f"Error: {str(e)}"
            return state
    
    @traceable
    async def process_task(self, task_content: str, priority: str = "medium", context: Dict[str, Any] = None) -> str:
        """Process a task request through the multi-agent system"""
        try:
            # Create task request
            task_request = TaskRequest(
                content=task_content,
                priority=priority,
                context=context or {}
            )
            
            # Create initial state
            initial_state = AgentState(task_request=task_request)
            
            # Execute workflow
            final_state = await self.workflow.ainvoke(initial_state)
            
            # Handle dict response from workflow
            if isinstance(final_state, dict):
                return final_state.get("final_response", "No response generated")
            else:
                return final_state.final_response or "No response generated"
            
        except Exception as e:
            logger.error(f"Error processing task: {e}")
            return f"Error processing task: {str(e)}"
    
    @traceable
    def get_system_status(self) -> Dict[str, Any]:
        """Get the current system status"""
        return {
            "master_agent": "active",
            "available_agents": list(self.agent_types.keys()),
            "sop_files_loaded": len(self.sop_reader.get_all_sops()),
            "langsmith_tracing": Config.LANGCHAIN_TRACING_V2
        }
    
    async def health_check(self):
        """Check agent health status"""
        return {"status": "healthy", "agent": "master"}
    
    async def distribute_task(self, task):
        """Distribute task to appropriate agent"""
        # Route to appropriate agent based on task type
        return {
            "status": "assigned",
            "assigned_agent": f"{task['type']}_agent",
            "task_id": f"task_{hash(str(task))}"
        }
    
    async def coordinate_agents(self, complex_task):
        """Coordinate multiple agents for complex tasks"""
        # Simulate multi-agent coordination
        return {
            "status": "completed",
            "agent_results": [
                {"agent": "code_generation", "status": "success"},
                {"agent": "deployment", "status": "success"},
                {"agent": "business_intelligence", "status": "success"}
            ]
        }

# Global master agent instance
master_agent = None

def get_master_agent() -> MasterAgent:
    """Get or create the master agent instance"""
    global master_agent
    if master_agent is None:
        master_agent = MasterAgent()
    return master_agent