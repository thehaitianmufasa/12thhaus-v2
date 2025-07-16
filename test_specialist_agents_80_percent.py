#!/usr/bin/env python3
"""
Comprehensive test suite to push specialist_agents.py above 80% coverage
Targets all uncovered functionality systematically
"""
import pytest
import asyncio
from unittest.mock import patch, MagicMock, AsyncMock
import json
import os
import sys
from pathlib import Path

# Add the current directory to the path
sys.path.insert(0, str(Path(__file__).parent))

from specialist_agents import (
    BaseSpecialistAgent, CodeGenerationAgent, DeploymentAgent,
    BusinessIntelligenceAgent, CustomerOperationsAgent, MarketingAutomationAgent,
    AGENT_REGISTRY, get_agent
)
from master_agent import TaskRequest, TaskResponse
from config import Config

class TestBaseSpecialistAgent:
    """Test BaseSpecialistAgent abstract class functionality"""
    
    def test_base_agent_initialization(self):
        """Test base agent initialization"""
        # Create a concrete implementation for testing
        class TestAgent(BaseSpecialistAgent):
            def _create_task_prompt(self, task_request):
                return f"Test prompt: {task_request.content}"
        
        agent = TestAgent("test_agent")
        assert agent.agent_type == "test_agent"
        assert agent.llm is not None
        assert agent.sop_reader is not None
    
    def test_get_system_prompt_with_sop(self):
        """Test system prompt generation with SOP data"""
        class TestAgent(BaseSpecialistAgent):
            def _create_task_prompt(self, task_request):
                return f"Test prompt: {task_request.content}"
        
        agent = TestAgent("test_agent")
        
        # Mock SOP data
        mock_sop = {
            'title': 'Test Agent SOP',
            'responsibilities': ['Task 1', 'Task 2'],
            'protocols': {'quality': 'high', 'speed': 'fast'}
        }
        agent.sop = mock_sop
        
        prompt = agent._get_system_prompt()
        
        assert 'Test Agent SOP' in prompt
        assert 'Task 1' in prompt
        assert 'Task 2' in prompt
        assert 'quality: high' in prompt
        assert 'speed: fast' in prompt
    
    def test_get_system_prompt_without_sop(self):
        """Test system prompt generation without SOP data"""
        class TestAgent(BaseSpecialistAgent):
            def _create_task_prompt(self, task_request):
                return f"Test prompt: {task_request.content}"
        
        agent = TestAgent("test_agent")
        agent.sop = None
        
        prompt = agent._get_system_prompt()
        
        assert 'test_agent agent' in prompt
        assert 'Help users with tasks' in prompt
    
    @pytest.mark.asyncio
    async def test_execute_task_success(self):
        """Test successful task execution"""
        class TestAgent(BaseSpecialistAgent):
            def _create_task_prompt(self, task_request):
                return f"Test prompt: {task_request.content}"
        
        agent = TestAgent("test_agent")
        
        # Mock LLM response
        mock_response = MagicMock()
        mock_response.content = "Test response content"
        
        with patch.object(agent, 'llm') as mock_llm:
            mock_llm.ainvoke = AsyncMock(return_value=mock_response)
        
        task_request = TaskRequest(
            content="Test task",
            priority="high",
            context={"key": "value"}
        )
        with patch.object(agent, 'llm') as mock_llm:
            mock_llm.ainvoke = AsyncMock(return_value=mock_response)
            
            response = await agent.execute_task(task_request)
        
        assert isinstance(response, TaskResponse)
        assert response.agent_type == "test_agent"
        assert response.content == "Test response content"
        assert response.status == "completed"
        assert response.metadata["task_priority"] == "high"
        assert response.metadata["context_used"] is True
    
    @pytest.mark.asyncio
    async def test_execute_task_failure(self):
        """Test task execution with error"""
        class TestAgent(BaseSpecialistAgent):
            def _create_task_prompt(self, task_request):
                return f"Test prompt: {task_request.content}"
        
        agent = TestAgent("test_agent")
        
        # Mock LLM to raise an exception
        with patch.object(agent, 'llm') as mock_llm:
            mock_llm.ainvoke = AsyncMock(side_effect=Exception("LLM Error"))
        
        task_request = TaskRequest(content="Test task", priority="medium")
        with patch.object(agent, 'llm') as mock_llm:
            mock_llm.ainvoke = AsyncMock(side_effect=Exception("LLM Error"))
            
            response = await agent.execute_task(task_request)
        
        assert response.status == "failed"
        assert "Error: LLM Error" in response.content
        assert response.metadata["error"] == "LLM Error"
    
    def test_process_response_default(self):
        """Test default response processing"""
        class TestAgent(BaseSpecialistAgent):
            def _create_task_prompt(self, task_request):
                return f"Test prompt: {task_request.content}"
        
        agent = TestAgent("test_agent")
        task_request = TaskRequest(content="Test task")
        
        processed = agent._process_response("  Test response  ", task_request)
        assert processed == "Test response"

class TestCodeGenerationAgent:
    """Test CodeGenerationAgent functionality"""
    
    @pytest.fixture
    def code_agent(self):
        """Create a CodeGenerationAgent for testing"""
        return CodeGenerationAgent()
    
    def test_initialization(self, code_agent):
        """Test CodeGenerationAgent initialization"""
        assert code_agent.agent_type == "code_generation"
        assert code_agent.llm is not None
    
    def test_create_task_prompt(self, code_agent):
        """Test task prompt creation for code generation"""
        task_request = TaskRequest(
            content="Create a Python function",
            priority="high",
            context={"type": "Web application context"}
        )
        
        prompt = code_agent._create_task_prompt(task_request)
        
        assert "Create a Python function" in prompt
        assert "Priority: high" in prompt
        assert "Context: {'type': 'Web application context'}" in prompt
        assert "Clean, well-commented code" in prompt
        assert "Error handling" in prompt
    
    def test_create_task_prompt_no_context(self, code_agent):
        """Test task prompt creation without context"""
        task_request = TaskRequest(content="Create a function", priority="low")
        
        prompt = code_agent._create_task_prompt(task_request)
        
        assert "Create a function" in prompt
        assert "Priority: low" in prompt
        assert "Context:" not in prompt
    
    def test_process_response_with_code_blocks(self, code_agent):
        """Test response processing with code blocks"""
        task_request = TaskRequest(content="Test task")
        response_with_code = "Here's the code:\n```python\nprint('hello')\n```"
        
        processed = code_agent._process_response(response_with_code, task_request)
        
        # Should return as-is when code blocks are present
        assert processed == response_with_code
    
    def test_process_response_without_code_blocks(self, code_agent):
        """Test response processing without code blocks"""
        task_request = TaskRequest(content="Test task")
        response_without_code = "This is a response without code blocks"
        
        processed = code_agent._process_response(response_without_code, task_request)
        
        # Should add formatting when no code blocks
        assert "Code Generation Response:" in processed
        assert response_without_code in processed
    
    @pytest.mark.asyncio
    async def test_generate_code(self, code_agent):
        """Test generate_code method"""
        request = {
            "type": "function",
            "description": "calculate fibonacci"
        }
        
        # Mock execute_task
        mock_response = TaskResponse(
            agent_type="code_generation",
            content="def fibonacci(n): return n if n <= 1 else fibonacci(n-1) + fibonacci(n-2)",
            status="completed"
        )
        code_agent.execute_task = AsyncMock(return_value=mock_response)
        
        result = await code_agent.generate_code(request)
        
        assert result["status"] == "success"
        assert "fibonacci" in result["code"]
    
    @pytest.mark.asyncio
    async def test_validate_code(self, code_agent):
        """Test validate_code method"""
        code = "print('hello world')"
        language = "python"
        
        result = await code_agent.validate_code(code, language)
        
        assert result["valid"] is True
        assert isinstance(result["syntax_errors"], list)
    
    @pytest.mark.asyncio
    async def test_generate_tests(self, code_agent):
        """Test generate_tests method"""
        code = "def add(a, b): return a + b"
        
        # Mock execute_task
        mock_response = TaskResponse(
            agent_type="code_generation",
            content="def test_add(): assert add(2, 3) == 5",
            status="completed"
        )
        code_agent.execute_task = AsyncMock(return_value=mock_response)
        
        result = await code_agent.generate_tests(code)
        
        assert "test_add" in result
    
    @pytest.mark.asyncio
    async def test_health_check(self, code_agent):
        """Test health_check method"""
        result = await code_agent.health_check()
        
        assert result["status"] == "healthy"
        assert result["agent"] == "code_generation"

class TestDeploymentAgent:
    """Test DeploymentAgent functionality"""
    
    @pytest.fixture
    def deployment_agent(self):
        """Create a DeploymentAgent for testing"""
        return DeploymentAgent()
    
    def test_initialization(self, deployment_agent):
        """Test DeploymentAgent initialization"""
        assert deployment_agent.agent_type == "deployment"
        assert deployment_agent.llm is not None
    
    def test_create_task_prompt(self, deployment_agent):
        """Test task prompt creation for deployment"""
        task_request = TaskRequest(
            content="Deploy web application",
            priority="critical",
            context={"environment": "Production environment"}
        )
        
        prompt = deployment_agent._create_task_prompt(task_request)
        
        assert "Deploy web application" in prompt
        assert "Priority: critical" in prompt
        assert "Context: {'environment': 'Production environment'}" in prompt
        assert "Deployment strategy" in prompt
        assert "Risk assessment" in prompt
        assert "Rollback procedures" in prompt
    
    def test_process_response_with_checklist(self, deployment_agent):
        """Test response processing with existing checklist"""
        task_request = TaskRequest(content="Test task")
        response_with_checklist = "Deploy the app\nChecklist:\n- Test\n- Deploy"
        
        processed = deployment_agent._process_response(response_with_checklist, task_request)
        
        # Should return as-is when checklist is present
        assert processed == response_with_checklist
    
    def test_process_response_without_checklist(self, deployment_agent):
        """Test response processing without checklist"""
        task_request = TaskRequest(content="Test task")
        response_without_checklist = "Deploy the application to production"
        
        processed = deployment_agent._process_response(response_without_checklist, task_request)
        
        # Should add checklist when not present
        assert "Deployment Checklist:" in processed
        assert "Pre-deployment tests passed" in processed
        assert response_without_checklist in processed
    
    @pytest.mark.asyncio
    async def test_generate_deployment_config(self, deployment_agent):
        """Test generate_deployment_config method"""
        app_config = {"name": "test-app", "port": 8000}
        
        result = await deployment_agent.generate_deployment_config(app_config)
        
        assert "dockerfile" in result
        assert "docker-compose.yml" in result
        assert "kubernetes" in result
        assert "FROM python:3.11" in result["dockerfile"]
    
    @pytest.mark.asyncio
    async def test_generate_ci_cd_pipeline(self, deployment_agent):
        """Test generate_ci_cd_pipeline method"""
        project = {"name": "test-project", "type": "web"}
        
        result = await deployment_agent.generate_ci_cd_pipeline(project)
        
        assert ".github/workflows" in result
        assert "deploy.yml" in result[".github/workflows"]
        assert "name: Deploy" in result[".github/workflows"]["deploy.yml"]
    
    @pytest.mark.asyncio
    async def test_validate_environment(self, deployment_agent):
        """Test validate_environment method"""
        env_config = {"NODE_ENV": "production", "PORT": "8000"}
        
        result = await deployment_agent.validate_environment(env_config)
        
        assert result["valid"] is True
        assert isinstance(result["missing_required"], list)
    
    @pytest.mark.asyncio
    async def test_health_check(self, deployment_agent):
        """Test health_check method"""
        result = await deployment_agent.health_check()
        
        assert result["status"] == "healthy"
        assert result["agent"] == "deployment"

class TestBusinessIntelligenceAgent:
    """Test BusinessIntelligenceAgent functionality"""
    
    @pytest.fixture
    def bi_agent(self):
        """Create a BusinessIntelligenceAgent for testing"""
        return BusinessIntelligenceAgent()
    
    def test_initialization(self, bi_agent):
        """Test BusinessIntelligenceAgent initialization"""
        assert bi_agent.agent_type == "business_intelligence"
        assert bi_agent.llm is not None
    
    def test_create_task_prompt(self, bi_agent):
        """Test task prompt creation for business intelligence"""
        task_request = TaskRequest(
            content="Analyze sales data",
            priority="high",
            context={"period": "Q3 performance review"}
        )
        
        prompt = bi_agent._create_task_prompt(task_request)
        
        assert "Analyze sales data" in prompt
        assert "Priority: high" in prompt
        assert "Context: {'period': 'Q3 performance review'}" in prompt
        assert "Data analysis approach" in prompt
        assert "Key metrics and KPIs" in prompt
        assert "actionable business insights" in prompt
    
    def test_process_response_with_summary(self, bi_agent):
        """Test response processing with existing summary"""
        task_request = TaskRequest(content="Test task")
        response_with_summary = "Summary: Key findings\nDetailed analysis follows..."
        
        processed = bi_agent._process_response(response_with_summary, task_request)
        
        # Should return as-is when summary is present
        assert processed == response_with_summary
    
    def test_process_response_without_summary(self, bi_agent):
        """Test response processing without summary"""
        task_request = TaskRequest(content="Test task")
        response_without_summary = "Detailed business analysis results"
        
        processed = bi_agent._process_response(response_without_summary, task_request)
        
        # Should add executive summary when not present
        assert "Executive Summary:" in processed
        assert response_without_summary in processed
    
    @pytest.mark.asyncio
    async def test_analyze_data(self, bi_agent):
        """Test analyze_data method"""
        data = {"sales": [100, 150, 200], "months": ["Jan", "Feb", "Mar"]}
        
        result = await bi_agent.analyze_data(data)
        
        assert "trend" in result
        assert "growth_rate" in result
        assert "forecast" in result
        assert result["trend"] == "increasing"
        assert isinstance(result["forecast"], list)
    
    @pytest.mark.asyncio
    async def test_generate_report(self, bi_agent):
        """Test generate_report method"""
        metrics = {"revenue": 100000, "users": 5000, "conversion": 0.05}
        
        result = await bi_agent.generate_report(metrics)
        
        assert "executive_summary" in result
        assert "key_insights" in result
        assert "recommendations" in result
        assert isinstance(result["key_insights"], list)
        assert isinstance(result["recommendations"], list)
    
    @pytest.mark.asyncio
    async def test_health_check(self, bi_agent):
        """Test health_check method"""
        result = await bi_agent.health_check()
        
        assert result["status"] == "healthy"
        assert result["agent"] == "business_intelligence"

class TestCustomerOperationsAgent:
    """Test CustomerOperationsAgent functionality"""
    
    @pytest.fixture
    def customer_agent(self):
        """Create a CustomerOperationsAgent for testing"""
        return CustomerOperationsAgent()
    
    def test_initialization(self, customer_agent):
        """Test CustomerOperationsAgent initialization"""
        assert customer_agent.agent_type == "customer_operations"
        assert customer_agent.llm is not None
    
    def test_create_task_prompt(self, customer_agent):
        """Test task prompt creation for customer operations"""
        task_request = TaskRequest(
            content="Handle customer complaint",
            priority="urgent",
            context={"customer_type": "Premium customer"}
        )
        
        prompt = customer_agent._create_task_prompt(task_request)
        
        assert "Handle customer complaint" in prompt
        assert "Priority: urgent" in prompt
        assert "Context: {'customer_type': 'Premium customer'}" in prompt
        assert "Customer-focused solution" in prompt
        assert "professional tone" in prompt
    
    def test_process_response_with_greeting(self, customer_agent):
        """Test response processing with existing greeting"""
        task_request = TaskRequest(content="Test task")
        response_with_greeting = "Dear Customer, thank you for contacting us..."
        
        processed = customer_agent._process_response(response_with_greeting, task_request)
        
        # Should return as-is when greeting is present
        assert processed == response_with_greeting
    
    def test_process_response_without_greeting(self, customer_agent):
        """Test response processing without greeting"""
        task_request = TaskRequest(content="Test task")
        response_without_greeting = "We will resolve your issue immediately"
        
        processed = customer_agent._process_response(response_without_greeting, task_request)
        
        # Should add customer service formatting when no greeting
        assert "Customer Service Response:" in processed
        assert response_without_greeting in processed
    
    @pytest.mark.asyncio
    async def test_route_ticket(self, customer_agent):
        """Test route_ticket method"""
        ticket = {
            "subject": "Technical Issue",
            "description": "App crashes on startup",
            "customer_tier": "premium"
        }
        
        result = await customer_agent.route_ticket(ticket)
        
        assert "department" in result
        assert "priority_score" in result
        assert "sla_hours" in result
        assert result["department"] == "technical_support"
        assert isinstance(result["priority_score"], int)
    
    @pytest.mark.asyncio
    async def test_generate_response(self, customer_agent):
        """Test generate_response method"""
        query = {"message": "How do I reset my password?"}
        
        # Mock execute_task
        mock_response = TaskResponse(
            agent_type="customer_operations",
            content="To reset your password, please follow these steps...",
            status="completed"
        )
        customer_agent.execute_task = AsyncMock(return_value=mock_response)
        
        result = await customer_agent.generate_response(query)
        
        assert "response_text" in result
        assert "confidence_score" in result
        assert "password" in result["response_text"]
        assert isinstance(result["confidence_score"], float)
    
    @pytest.mark.asyncio
    async def test_health_check(self, customer_agent):
        """Test health_check method"""
        result = await customer_agent.health_check()
        
        assert result["status"] == "healthy"
        assert result["agent"] == "customer_operations"

class TestMarketingAutomationAgent:
    """Test MarketingAutomationAgent functionality"""
    
    @pytest.fixture
    def marketing_agent(self):
        """Create a MarketingAutomationAgent for testing"""
        return MarketingAutomationAgent()
    
    def test_initialization(self, marketing_agent):
        """Test MarketingAutomationAgent initialization"""
        assert marketing_agent.agent_type == "marketing_automation"
        assert marketing_agent.llm is not None
    
    def test_create_task_prompt(self, marketing_agent):
        """Test task prompt creation for marketing automation"""
        task_request = TaskRequest(
            content="Create email campaign",
            priority="medium",
            context={"campaign": "Product launch"}
        )
        
        prompt = marketing_agent._create_task_prompt(task_request)
        
        assert "Create email campaign" in prompt
        assert "Priority: medium" in prompt
        assert "Context: {'campaign': 'Product launch'}" in prompt
        assert "Marketing strategy" in prompt
        assert "engagement and conversion" in prompt
    
    def test_process_response_with_metrics(self, marketing_agent):
        """Test response processing with existing metrics"""
        task_request = TaskRequest(content="Test task")
        response_with_metrics = "Campaign strategy\nMetrics: CTR, conversion rate"
        
        processed = marketing_agent._process_response(response_with_metrics, task_request)
        
        # Should return as-is when metrics are present
        assert processed == response_with_metrics
    
    def test_process_response_without_metrics(self, marketing_agent):
        """Test response processing without metrics"""
        task_request = TaskRequest(content="Test task")
        response_without_metrics = "Here's your marketing campaign strategy"
        
        processed = marketing_agent._process_response(response_without_metrics, task_request)
        
        # Should add metrics when not present
        assert "Key Metrics to Track:" in processed
        assert "Engagement rate" in processed
        assert response_without_metrics in processed
    
    @pytest.mark.asyncio
    async def test_generate_campaign(self, marketing_agent):
        """Test generate_campaign method"""
        brief = {
            "product": "AI Platform",
            "target_audience": "developers",
            "budget": 10000
        }
        
        result = await marketing_agent.generate_campaign(brief)
        
        assert "campaign_name" in result
        assert "channels" in result
        assert "messaging" in result
        assert "AI Platform" in result["campaign_name"]
        assert isinstance(result["channels"], list)
        assert "tagline" in result["messaging"]
    
    @pytest.mark.asyncio
    async def test_generate_content(self, marketing_agent):
        """Test generate_content method"""
        request = {
            "type": "blog post",
            "topic": "machine learning"
        }
        
        # Mock execute_task
        mock_response = TaskResponse(
            agent_type="marketing_automation",
            content="Machine learning is transforming industries...",
            status="completed"
        )
        marketing_agent.execute_task = AsyncMock(return_value=mock_response)
        
        result = await marketing_agent.generate_content(request)
        
        assert "title" in result
        assert "body" in result
        assert "meta_description" in result
        assert "machine learning" in result["title"]
        assert "machine learning" in result["body"].lower()
    
    @pytest.mark.asyncio
    async def test_health_check(self, marketing_agent):
        """Test health_check method"""
        result = await marketing_agent.health_check()
        
        assert result["status"] == "healthy"
        assert result["agent"] == "marketing_automation"

class TestAgentRegistry:
    """Test agent registry functionality"""
    
    def test_agent_registry_contents(self):
        """Test that all agents are in the registry"""
        expected_agents = [
            'code_generation',
            'deployment', 
            'business_intelligence',
            'customer_operations',
            'marketing_automation'
        ]
        
        for agent_type in expected_agents:
            assert agent_type in AGENT_REGISTRY
            assert issubclass(AGENT_REGISTRY[agent_type], BaseSpecialistAgent)
    
    def test_get_agent_success(self):
        """Test successful agent retrieval"""
        for agent_type in AGENT_REGISTRY.keys():
            agent = get_agent(agent_type)
            assert isinstance(agent, BaseSpecialistAgent)
            assert agent.agent_type == agent_type
    
    def test_get_agent_unknown_type(self):
        """Test get_agent with unknown agent type"""
        with pytest.raises(ValueError) as exc_info:
            get_agent("unknown_agent_type")
        
        assert "Unknown agent type: unknown_agent_type" in str(exc_info.value)

class TestAgentIntegration:
    """Integration tests for specialist agents"""
    
    @pytest.mark.asyncio
    async def test_all_agents_health_check(self):
        """Test health check for all agent types"""
        for agent_type in AGENT_REGISTRY.keys():
            agent = get_agent(agent_type)
            health = await agent.health_check()
            
            assert health["status"] == "healthy"
            assert health["agent"] == agent_type
    
    @pytest.mark.asyncio
    async def test_all_agents_execute_simple_task(self):
        """Test that all agents can execute a simple task"""
        simple_task = TaskRequest(
            content="Provide a brief overview of your capabilities",
            priority="low"
        )
        
        for agent_type in AGENT_REGISTRY.keys():
            agent = get_agent(agent_type)
            
            # Mock the LLM response
            mock_response = MagicMock()
            mock_response.content = f"I am a {agent_type} agent with various capabilities"
            
            with patch.object(agent, 'llm') as mock_llm:
                mock_llm.ainvoke = AsyncMock(return_value=mock_response)
                
                response = await agent.execute_task(simple_task)
            
            assert isinstance(response, TaskResponse)
            assert response.agent_type == agent_type
            assert response.status == "completed"
            assert agent_type in response.content

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--cov=specialist_agents", "--cov-report=term-missing"])
