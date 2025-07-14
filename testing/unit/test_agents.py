"""
Unit Tests for Multi-Agent System Components
Tests individual agent functionality in isolation
"""
import pytest
import asyncio
from unittest.mock import Mock, AsyncMock, patch
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from master_agent import MasterAgent
from specialist_agents import (
    CodeGenerationAgent,
    DeploymentAgent,
    BusinessIntelligenceAgent,
    CustomerOperationsAgent,
    MarketingAutomationAgent
)
from test_config import TEST_CONFIG, TEST_DATA

class TestMasterAgent:
    """Test Master Agent functionality"""
    
    @pytest.fixture
    async def master_agent(self):
        """Create a master agent instance for testing"""
        agent = MasterAgent()
        await agent.initialize()
        return agent
    
    @pytest.mark.asyncio
    async def test_master_agent_initialization(self, master_agent):
        """Test master agent initializes correctly"""
        assert master_agent is not None
        assert master_agent.status == "ready"
        assert len(master_agent.available_agents) >= 5
    
    @pytest.mark.asyncio
    async def test_task_distribution(self, master_agent):
        """Test master agent distributes tasks correctly"""
        test_task = {
            "type": "code_generation",
            "payload": {
                "description": "Create a REST API endpoint",
                "requirements": ["FastAPI", "PostgreSQL", "JWT Auth"]
            }
        }
        
        result = await master_agent.distribute_task(test_task)
        assert result["status"] == "assigned"
        assert result["assigned_agent"] == "code_generation_agent"
        assert "task_id" in result
    
    @pytest.mark.asyncio
    async def test_multi_agent_coordination(self, master_agent):
        """Test coordination between multiple agents"""
        complex_task = {
            "type": "full_stack_application",
            "payload": {
                "name": "Test App",
                "components": ["backend", "frontend", "database", "deployment"]
            }
        }
        
        result = await master_agent.coordinate_agents(complex_task)
        assert result["status"] == "completed"
        assert len(result["agent_results"]) >= 3
        assert all(r["status"] == "success" for r in result["agent_results"])

class TestCodeGenerationAgent:
    """Test Code Generation Agent functionality"""
    
    @pytest.fixture
    def code_agent(self):
        """Create a code generation agent instance"""
        return CodeGenerationAgent()
    
    @pytest.mark.asyncio
    async def test_code_generation_basic(self, code_agent):
        """Test basic code generation"""
        request = {
            "type": "api_endpoint",
            "framework": "fastapi",
            "description": "User registration endpoint with email validation"
        }
        
        result = await code_agent.generate_code(request)
        assert result["status"] == "success"
        assert "code" in result
        assert "from fastapi import" in result["code"]
        assert "async def register_user" in result["code"]
    
    @pytest.mark.asyncio
    async def test_code_validation(self, code_agent):
        """Test generated code validation"""
        code_sample = '''
def add_numbers(a, b):
    return a + b
'''
        
        validation_result = await code_agent.validate_code(code_sample, "python")
        assert validation_result["valid"] == True
        assert validation_result["syntax_errors"] == []
    
    @pytest.mark.asyncio
    async def test_test_generation(self, code_agent):
        """Test automatic test generation for code"""
        code_sample = '''
def calculate_discount(price, discount_percent):
    if discount_percent < 0 or discount_percent > 100:
        raise ValueError("Discount must be between 0 and 100")
    return price * (1 - discount_percent / 100)
'''
        
        tests = await code_agent.generate_tests(code_sample)
        assert "test_calculate_discount" in tests
        assert "pytest" in tests or "unittest" in tests
        assert "assert" in tests

class TestDeploymentAgent:
    """Test Deployment Agent functionality"""
    
    @pytest.fixture
    def deployment_agent(self):
        """Create a deployment agent instance"""
        return DeploymentAgent()
    
    @pytest.mark.asyncio
    async def test_deployment_configuration(self, deployment_agent):
        """Test deployment configuration generation"""
        app_config = {
            "name": "test-app",
            "type": "web",
            "framework": "nextjs",
            "database": "postgresql"
        }
        
        deploy_config = await deployment_agent.generate_deployment_config(app_config)
        assert "dockerfile" in deploy_config
        assert "docker-compose.yml" in deploy_config
        assert "kubernetes" in deploy_config
    
    @pytest.mark.asyncio
    async def test_ci_cd_pipeline(self, deployment_agent):
        """Test CI/CD pipeline generation"""
        project = {
            "repo": "github.com/test/app",
            "branch": "main",
            "environments": ["dev", "staging", "prod"]
        }
        
        pipeline = await deployment_agent.generate_ci_cd_pipeline(project)
        assert ".github/workflows" in pipeline
        assert "deploy.yml" in pipeline[".github/workflows"]
        assert "npm test" in pipeline[".github/workflows"]["deploy.yml"]
    
    @pytest.mark.asyncio
    async def test_environment_validation(self, deployment_agent):
        """Test environment configuration validation"""
        env_config = {
            "NODE_ENV": "production",
            "DATABASE_URL": "postgresql://user:pass@localhost/db",
            "API_KEY": "test-key-123"
        }
        
        validation = await deployment_agent.validate_environment(env_config)
        assert validation["valid"] == True
        assert validation["missing_required"] == []

class TestBusinessIntelligenceAgent:
    """Test Business Intelligence Agent functionality"""
    
    @pytest.fixture
    def bi_agent(self):
        """Create a business intelligence agent instance"""
        return BusinessIntelligenceAgent()
    
    @pytest.mark.asyncio
    async def test_data_analysis(self, bi_agent):
        """Test data analysis capabilities"""
        sample_data = {
            "sales": [100, 150, 200, 180, 220, 250],
            "months": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
        }
        
        analysis = await bi_agent.analyze_data(sample_data)
        assert "trend" in analysis
        assert "growth_rate" in analysis
        assert "forecast" in analysis
        assert analysis["trend"] == "increasing"
    
    @pytest.mark.asyncio
    async def test_report_generation(self, bi_agent):
        """Test automated report generation"""
        metrics = {
            "revenue": 150000,
            "users": 5000,
            "conversion_rate": 0.03,
            "churn_rate": 0.05
        }
        
        report = await bi_agent.generate_report(metrics)
        assert "executive_summary" in report
        assert "key_insights" in report
        assert "recommendations" in report
        assert len(report["key_insights"]) >= 3

class TestCustomerOperationsAgent:
    """Test Customer Operations Agent functionality"""
    
    @pytest.fixture
    def ops_agent(self):
        """Create a customer operations agent instance"""
        return CustomerOperationsAgent()
    
    @pytest.mark.asyncio
    async def test_ticket_routing(self, ops_agent):
        """Test customer ticket routing"""
        ticket = {
            "subject": "Cannot login to account",
            "priority": "high",
            "customer_tier": "premium",
            "description": "Getting 'invalid password' error"
        }
        
        routing = await ops_agent.route_ticket(ticket)
        assert routing["department"] == "technical_support"
        assert routing["priority_score"] >= 8
        assert routing["sla_hours"] == 2
    
    @pytest.mark.asyncio
    async def test_response_generation(self, ops_agent):
        """Test automated response generation"""
        query = {
            "type": "billing_inquiry",
            "message": "Why was I charged twice this month?"
        }
        
        response = await ops_agent.generate_response(query)
        assert "response_text" in response
        assert "confidence_score" in response
        assert response["confidence_score"] >= 0.8
        assert "billing" in response["response_text"].lower()

class TestMarketingAutomationAgent:
    """Test Marketing Automation Agent functionality"""
    
    @pytest.fixture
    def marketing_agent(self):
        """Create a marketing automation agent instance"""
        return MarketingAutomationAgent()
    
    @pytest.mark.asyncio
    async def test_campaign_generation(self, marketing_agent):
        """Test marketing campaign generation"""
        campaign_brief = {
            "product": "AI Development Platform",
            "target_audience": "Enterprise developers",
            "goal": "increase_signups",
            "budget": 10000
        }
        
        campaign = await marketing_agent.generate_campaign(campaign_brief)
        assert "campaign_name" in campaign
        assert "channels" in campaign
        assert "messaging" in campaign
        assert "email" in campaign["channels"]
        assert "linkedin" in campaign["channels"]
    
    @pytest.mark.asyncio
    async def test_content_generation(self, marketing_agent):
        """Test marketing content generation"""
        content_request = {
            "type": "blog_post",
            "topic": "Multi-Agent AI Systems",
            "tone": "professional",
            "length": "medium"
        }
        
        content = await marketing_agent.generate_content(content_request)
        assert "title" in content
        assert "body" in content
        assert "meta_description" in content
        assert len(content["body"]) >= 500

# Performance tests for individual agents
class TestAgentPerformance:
    """Test performance characteristics of agents"""
    
    @pytest.mark.asyncio
    async def test_agent_response_times(self):
        """Test that agents respond within SLA"""
        agents = [
            MasterAgent(),
            CodeGenerationAgent(),
            DeploymentAgent(),
            BusinessIntelligenceAgent(),
            CustomerOperationsAgent(),
            MarketingAutomationAgent()
        ]
        
        for agent in agents:
            start_time = asyncio.get_event_loop().time()
            await agent.health_check()
            response_time = (asyncio.get_event_loop().time() - start_time) * 1000
            
            agent_name = agent.__class__.__name__
            assert response_time < TEST_CONFIG["agents"].get(
                agent_name.lower().replace("agent", "_agent"), 
                {"timeout": 60}
            )["timeout"] * 1000

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
