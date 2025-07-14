#!/usr/bin/env python3
"""
Basic tests for the LangGraph Multi-Agent System
"""
import pytest
import asyncio
from unittest.mock import patch, MagicMock

def test_config_loading():
    """Test that configuration loads properly"""
    try:
        from config import Config
        # Test that required environment variables are defined
        assert hasattr(Config, 'LANGCHAIN_API_KEY')
        assert hasattr(Config, 'ANTHROPIC_API_KEY')
        print("✅ Config loading test passed")
    except Exception as e:
        pytest.fail(f"Config loading failed: {e}")

def test_sop_reader():
    """Test SOP reader functionality"""
    try:
        from sop_reader import sop_reader
        
        # Test that SOPs are loaded
        all_sops = sop_reader.get_all_sops()
        assert len(all_sops) > 0, "No SOPs loaded"
        
        # Test that master SOP is present
        master_sop = sop_reader.get_sop("Master SOP implementation_guide")
        assert master_sop is not None, "Master SOP not found"
        
        print(f"✅ SOP reader test passed - {len(all_sops)} SOPs loaded")
    except Exception as e:
        pytest.fail(f"SOP reader test failed: {e}")

def test_monitoring_system():
    """Test monitoring system"""
    try:
        from monitoring import get_monitor
        
        monitor = get_monitor()
        health = monitor.get_system_health()
        
        assert 'system_status' in health
        assert health['system_status'] in ['healthy', 'warning', 'unhealthy']
        
        print("✅ Monitoring system test passed")
    except Exception as e:
        pytest.fail(f"Monitoring system test failed: {e}")

@pytest.mark.asyncio
async def test_master_agent_initialization():
    """Test master agent can be initialized"""
    try:
        # Mock the API calls to avoid actual API usage in tests
        with patch('langchain_anthropic.ChatAnthropic') as mock_llm:
            mock_llm.return_value = MagicMock()
            
            from master_agent import get_master_agent
            
            master_agent = get_master_agent()
            status = master_agent.get_system_status()
            
            assert 'master_agent' in status
            assert status['master_agent'] == 'active'
            assert 'available_agents' in status
            assert len(status['available_agents']) == 5
            
            print("✅ Master agent initialization test passed")
    except Exception as e:
        pytest.fail(f"Master agent test failed: {e}")

def test_api_endpoints_structure():
    """Test that API endpoint files exist and are structured correctly"""
    import os
    
    api_files = ['health.py', 'status.py', 'task.py', 'index.py']
    
    for file in api_files:
        file_path = os.path.join('api', file)
        assert os.path.exists(file_path), f"API file {file} not found"
        
        # Basic check that file contains handler class
        with open(file_path, 'r') as f:
            content = f.read()
            assert 'class handler' in content, f"Handler class not found in {file}"
            assert 'BaseHTTPRequestHandler' in content, f"BaseHTTPRequestHandler not imported in {file}"
    
    print("✅ API endpoints structure test passed")

def test_github_workflow_exists():
    """Test that GitHub workflow file exists"""
    import os
    
    workflow_path = '.github/workflows/main.yml'
    assert os.path.exists(workflow_path), "GitHub workflow file not found"
    
    with open(workflow_path, 'r') as f:
        content = f.read()
        assert 'CI/CD Pipeline' in content
        assert 'jobs:' in content
        assert any(keyword in content for keyword in ['test:', 'test-backend:'])
        # The workflow uses 'deploy-frontend' instead of just 'deploy'
        assert any(keyword in content for keyword in ['deploy:', 'deploy-frontend:', 'deployment'])
    
    print("✅ GitHub workflow test passed")

def test_vercel_config():
    """Test that Vercel configuration exists"""
    import os
    import json
    
    vercel_path = 'vercel.json'
    assert os.path.exists(vercel_path), "Vercel config file not found"
    
    with open(vercel_path, 'r') as f:
        config = json.load(f)
        assert 'version' in config
        assert 'builds' in config
        assert 'routes' in config
        assert 'env' in config
    
    print("✅ Vercel configuration test passed")

if __name__ == "__main__":
    # Run tests directly if called as script
    import sys
    
    print("🧪 Running basic tests for LangGraph Multi-Agent System...")
    
    test_functions = [
        test_config_loading,
        test_sop_reader,
        test_monitoring_system,
        test_api_endpoints_structure,
        test_github_workflow_exists,
        test_vercel_config
    ]
    
    passed = 0
    total = len(test_functions)
    
    for test_func in test_functions:
        try:
            test_func()
            passed += 1
        except Exception as e:
            print(f"❌ {test_func.__name__} failed: {e}")
    
    # Test async function
    try:
        asyncio.run(test_master_agent_initialization())
        passed += 1
        total += 1
    except Exception as e:
        print(f"❌ test_master_agent_initialization failed: {e}")
        total += 1
    
    print(f"\n📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed!")
        sys.exit(0)
    else:
        print("❌ Some tests failed")
        sys.exit(1)