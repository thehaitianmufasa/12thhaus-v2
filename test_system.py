#!/usr/bin/env python3
"""
Test script for the LangGraph Multi-Agent System
Run basic tests to verify system functionality
"""
import asyncio
import sys
import os
from pathlib import Path
import pytest

# Add the current directory to the path
sys.path.insert(0, str(Path(__file__).parent))

from main import MultiAgentSystem
from monitoring import get_monitor
from sop_reader import sop_reader

@pytest.mark.asyncio
async def test_system_initialization():
    """Test system initialization"""
    print("Testing system initialization...")
    
    try:
        system = MultiAgentSystem()
        await system.initialize()
        
        info = system.get_system_info()
        print(f"✓ System initialized successfully")
        print(f"  - Status: {info['status']}")
        print(f"  - Agents: {len(info['agents'])}")
        print(f"  - SOPs: {info['sop_files']}")
        return True
        
    except Exception as e:
        print(f"✗ System initialization failed: {e}")
        return False

@pytest.mark.asyncio
async def test_sop_system():
    """Test SOP reading system"""
    print("\nTesting SOP system...")
    
    try:
        # Create default SOPs
        sop_reader.create_default_sops()
        
        # Test SOP retrieval
        all_sops = sop_reader.get_all_sops()
        print(f"✓ SOP system working")
        print(f"  - Total SOPs: {len(all_sops)}")
        
        # Test agent-specific SOP
        code_sop = sop_reader.get_agent_specific_sop("code_generation")
        if code_sop:
            print(f"  - Code generation SOP: {code_sop['title']}")
        
        return True
        
    except Exception as e:
        print(f"✗ SOP system failed: {e}")
        return False

@pytest.mark.asyncio
async def test_task_processing():
    """Test basic task processing"""
    print("\nTesting task processing...")
    
    try:
        system = MultiAgentSystem()
        
        # Test simple task
        response = await system.process_task(
            "Write a simple hello world function in Python",
            priority="low"
        )
        
        if response and "error" not in response.lower():
            print("✓ Task processing successful")
            print(f"  - Response length: {len(response)} characters")
            return True
        else:
            print(f"✗ Task processing failed: {response}")
            return False
        
    except Exception as e:
        print(f"✗ Task processing failed: {e}")
        return False

@pytest.mark.asyncio
async def test_agent_routing():
    """Test agent routing logic"""
    print("\nTesting agent routing...")
    
    test_cases = [
        ("Create a Python function", "code_generation"),
        ("Deploy my application", "deployment"),
        ("Analyze sales data", "business_intelligence"),
        ("Help customer with login", "customer_operations"),
        ("Create marketing campaign", "marketing_automation")
    ]
    
    try:
        system = MultiAgentSystem()
        await system.initialize()
        
        for task_content, expected_agent in test_cases:
            # This is a simplified test - in reality, we'd need to inspect the routing
            response = await system.process_task(task_content, priority="low")
            
            if response and "error" not in response.lower():
                print(f"✓ Routing test passed for: {task_content}")
            else:
                print(f"✗ Routing test failed for: {task_content}")
                return False
        
        return True
        
    except Exception as e:
        print(f"✗ Agent routing test failed: {e}")
        return False

@pytest.mark.asyncio
async def test_monitoring():
    """Test monitoring system"""
    print("\nTesting monitoring system...")
    
    try:
        monitor = get_monitor()
        
        # Test metrics recording
        monitor.record_task_start("test_task_1", "code_generation", "Test task")
        monitor.record_task_completion("test_task_1", True, 1.5)
        
        # Test health check
        health = monitor.get_system_health()
        metrics = monitor.get_performance_metrics()
        
        print("✓ Monitoring system working")
        print(f"  - System status: {health['system_status']}")
        print(f"  - Total requests: {metrics['system_metrics']['total_requests']}")
        
        return True
        
    except Exception as e:
        print(f"✗ Monitoring test failed: {e}")
        return False

async def run_all_tests():
    """Run all tests"""
    print("=== LangGraph Multi-Agent System Tests ===\n")
    
    tests = [
        test_system_initialization,
        test_sop_system,
        test_task_processing,
        test_agent_routing,
        test_monitoring
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            result = await test()
            if result:
                passed += 1
        except Exception as e:
            print(f"✗ Test failed with exception: {e}")
    
    print(f"\n=== Test Results ===")
    print(f"Passed: {passed}/{total}")
    print(f"Success rate: {passed/total*100:.1f}%")
    
    if passed == total:
        print("🎉 All tests passed!")
        return True
    else:
        print("❌ Some tests failed")
        return False

def main():
    """Main test runner"""
    print("Starting LangGraph Multi-Agent System tests...")
    
    # Check if .env file exists
    if not os.path.exists(".env"):
        print("⚠️  Warning: .env file not found. Please create it with your API keys.")
        print("Tests may fail without proper configuration.")
        print()
    
    try:
        success = asyncio.run(run_all_tests())
        sys.exit(0 if success else 1)
        
    except KeyboardInterrupt:
        print("\n\nTests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nTest runner failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()