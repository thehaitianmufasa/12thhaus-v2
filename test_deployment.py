#!/usr/bin/env python3
"""
Simple deployment functionality test
"""
import sys
import json
from datetime import datetime

def test_health_logic():
    """Test the health check logic without HTTP handler"""
    print("🧪 Testing health check logic...")
    
    try:
        from monitoring import get_monitor
        from config import Config
        
        # Basic health check data
        health_data = {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "service": "langgraph-multi-agent",
            "version": "1.0.0"
        }
        
        # Try to get system health
        monitor = get_monitor()
        system_health = monitor.get_system_health()
        health_data.update({
            "system_health": system_health,
            "langsmith_enabled": Config.LANGCHAIN_TRACING_V2
        })
        
        print(f"✅ Health check data: {health_data['status']}")
        print(f"✅ System health: {system_health['system_status']}")
        print(f"✅ LangSmith enabled: {health_data['langsmith_enabled']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_system_status():
    """Test system status functionality"""
    print("\n🧪 Testing system status...")
    
    try:
        from master_agent import get_master_agent
        from monitoring import get_monitor
        
        # Get system status
        master_agent = get_master_agent()
        status = master_agent.get_system_status()
        
        monitor = get_monitor()
        health = monitor.get_system_health()
        
        print(f"✅ Master agent status: {status['master_agent']}")
        print(f"✅ Available agents: {len(status['available_agents'])}")
        print(f"✅ SOPs loaded: {status['sop_files_loaded']}")
        print(f"✅ System health: {health['system_status']}")
        
        return True
        
    except Exception as e:
        print(f"❌ System status test failed: {e}")
        return False

def test_simple_task():
    """Test basic task processing"""
    print("\n🧪 Testing simple task processing...")
    
    try:
        from master_agent import get_master_agent
        import asyncio
        
        master_agent = get_master_agent()
        
        # Simple test task
        task = "What is 2 + 2?"
        
        # Run async task
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        response = loop.run_until_complete(
            master_agent.process_task(task, "low")
        )
        
        loop.close()
        
        print(f"✅ Task processed successfully")
        print(f"✅ Response length: {len(response)} characters")
        print(f"✅ Sample response: {response[:100]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Task processing failed: {e}")
        return False

def test_api_imports():
    """Test that API files can be imported"""
    print("\n🧪 Testing API file imports...")
    
    api_files = ['health', 'status', 'task', 'index']
    
    for api_file in api_files:
        try:
            # Test import
            module = __import__(f'api.{api_file}', fromlist=['handler'])
            
            # Check handler exists
            if hasattr(module, 'handler'):
                print(f"✅ api/{api_file}.py imports successfully")
            else:
                print(f"❌ api/{api_file}.py missing handler class")
                return False
                
        except Exception as e:
            print(f"❌ api/{api_file}.py import failed: {e}")
            return False
    
    return True

def test_vercel_config():
    """Test Vercel configuration"""
    print("\n🧪 Testing Vercel configuration...")
    
    try:
        import os
        
        # Check vercel.json exists
        if os.path.exists('vercel.json'):
            print("✅ vercel.json exists")
            
            with open('vercel.json', 'r') as f:
                config = json.load(f)
                
            required_keys = ['version', 'builds', 'routes', 'env']
            for key in required_keys:
                if key in config:
                    print(f"✅ vercel.json has {key}")
                else:
                    print(f"❌ vercel.json missing {key}")
                    return False
                    
        else:
            print("❌ vercel.json not found")
            return False
            
        return True
        
    except Exception as e:
        print(f"❌ Vercel config test failed: {e}")
        return False

def main():
    """Run all deployment tests"""
    print("🚀 Running Deployment Readiness Tests...\n")
    
    tests = [
        test_health_logic,
        test_system_status,
        test_api_imports,
        test_vercel_config,
        test_simple_task
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()  # Add spacing between tests
    
    print("="*50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All deployment tests passed!")
        print("✅ System is ready for deployment!")
        return True
    else:
        print("❌ Some tests failed - check issues before deployment")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)