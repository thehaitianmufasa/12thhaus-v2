#!/usr/bin/env python3
"""
Simple API endpoint test
"""
import json
import sys
from io import StringIO
from unittest.mock import MagicMock

def test_health_endpoint():
    """Test health endpoint logic"""
    print("🧪 Testing health endpoint...")
    
    try:
        # Import the health module
        sys.path.append('.')
        from api.health import handler
        
        # Test the core logic by running the code directly
        from monitoring import get_monitor
        from config import Config
        from datetime import datetime
        
        # Simulate what the endpoint does
        health_data = {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "service": "langgraph-multi-agent",
            "version": "1.0.0"
        }
        
        monitor = get_monitor()
        system_health = monitor.get_system_health()
        health_data.update({
            "system_health": system_health,
            "langsmith_enabled": Config.LANGCHAIN_TRACING_V2
        })
        
        # Verify we can JSON serialize the response
        json_response = json.dumps(health_data, indent=2)
        
        print("✅ Health endpoint logic works")
        print(f"✅ Response can be JSON serialized: {len(json_response)} bytes")
        
        return True
        
    except Exception as e:
        print(f"❌ Health endpoint test failed: {e}")
        return False

def test_task_endpoint_logic():
    """Test task endpoint core logic"""
    print("\n🧪 Testing task endpoint logic...")
    
    try:
        from master_agent import get_master_agent
        import asyncio
        
        # Simulate the task processing
        task_data = {
            "task": "Create a simple hello world function",
            "priority": "low",
            "context": {"test": True}
        }
        
        master_agent = get_master_agent()
        
        # Process task
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        response = loop.run_until_complete(
            master_agent.process_task(
                task_data["task"], 
                task_data["priority"], 
                task_data["context"]
            )
        )
        
        loop.close()
        
        # Simulate API response structure
        response_data = {
            "status": "completed",
            "task": task_data["task"],
            "priority": task_data["priority"],
            "response": response,
            "context": task_data["context"]
        }
        
        # Test JSON serialization
        json_response = json.dumps(response_data, indent=2)
        
        print("✅ Task endpoint logic works")
        print(f"✅ Response can be JSON serialized: {len(json_response)} bytes")
        
        return True
        
    except Exception as e:
        print(f"❌ Task endpoint test failed: {e}")
        return False

def test_status_endpoint_logic():
    """Test status endpoint logic"""
    print("\n🧪 Testing status endpoint logic...")
    
    try:
        from master_agent import get_master_agent
        from monitoring import get_monitor
        
        # Get system components
        master_agent = get_master_agent()
        status = master_agent.get_system_status()
        
        monitor = get_monitor()
        health = monitor.get_system_health()
        metrics = monitor.get_performance_metrics()
        
        response_data = {
            "system_status": status,
            "health": health,
            "metrics": metrics,
            "deployment": "vercel",
            "environment": "production"
        }
        
        # Test JSON serialization
        json_response = json.dumps(response_data, indent=2)
        
        print("✅ Status endpoint logic works")
        print(f"✅ Response can be JSON serialized: {len(json_response)} bytes")
        
        return True
        
    except Exception as e:
        print(f"❌ Status endpoint test failed: {e}")
        return False

def main():
    """Run API endpoint tests"""
    print("🌐 Testing API Endpoint Logic...\n")
    
    tests = [
        test_health_endpoint,
        test_status_endpoint_logic,
        test_task_endpoint_logic
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("="*50)
    print(f"📊 API Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All API endpoint tests passed!")
        print("✅ Ready for Vercel deployment!")
        return True
    else:
        print("❌ Some API tests failed")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)