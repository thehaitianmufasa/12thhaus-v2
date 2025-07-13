"""
Main application for LangGraph Multi-Agent System
Provides CLI interface and demonstrates system capabilities
"""
import asyncio
import logging
import sys
from typing import Dict, Any, Optional
import argparse
from pathlib import Path

from config import Config
from master_agent import get_master_agent
from sop_reader import sop_reader
from specialist_agents import AGENT_REGISTRY

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class MultiAgentSystem:
    """Main system class that coordinates all agents"""
    
    def __init__(self):
        self.master_agent = get_master_agent()
        self.is_initialized = False
    
    async def initialize(self):
        """Initialize the multi-agent system"""
        try:
            # Validate configuration
            Config.validate()
            
            # Initialize SOP reader and create default SOPs
            sop_reader.create_default_sops()
            
            # Log system status
            status = self.master_agent.get_system_status()
            logger.info(f"System initialized: {status}")
            
            self.is_initialized = True
            
        except Exception as e:
            logger.error(f"System initialization failed: {e}")
            raise
    
    async def process_task(self, task_content: str, priority: str = "medium", context: Dict[str, Any] = None) -> str:
        """Process a task through the multi-agent system"""
        if not self.is_initialized:
            await self.initialize()
        
        try:
            response = await self.master_agent.process_task(task_content, priority, context)
            return response
        except Exception as e:
            logger.error(f"Task processing failed: {e}")
            return f"Error: {str(e)}"
    
    def get_system_info(self) -> Dict[str, Any]:
        """Get comprehensive system information"""
        return {
            "status": "active" if self.is_initialized else "not_initialized",
            "agents": list(AGENT_REGISTRY.keys()),
            "sop_files": len(sop_reader.get_all_sops()),
            "langsmith_enabled": Config.LANGCHAIN_TRACING_V2,
            "config": {
                "temperature": Config.AGENT_TEMPERATURE,
                "max_tokens": Config.AGENT_MAX_TOKENS,
                "project": Config.LANGCHAIN_PROJECT
            }
        }

async def run_cli():
    """Run the CLI interface"""
    parser = argparse.ArgumentParser(description="LangGraph Multi-Agent System")
    parser.add_argument("command", choices=["task", "status", "demo", "interactive"], 
                       help="Command to run")
    parser.add_argument("--task", type=str, help="Task to process")
    parser.add_argument("--priority", type=str, default="medium", 
                       choices=["high", "medium", "low"], help="Task priority")
    parser.add_argument("--context", type=str, help="Additional context (JSON format)")
    
    args = parser.parse_args()
    
    # Initialize system
    system = MultiAgentSystem()
    
    if args.command == "task":
        if not args.task:
            print("Error: --task argument required for task command")
            sys.exit(1)
        
        context = {}
        if args.context:
            try:
                import json
                context = json.loads(args.context)
            except json.JSONDecodeError:
                print("Error: Invalid JSON format for context")
                sys.exit(1)
        
        print(f"Processing task: {args.task}")
        print(f"Priority: {args.priority}")
        if context:
            print(f"Context: {context}")
        print("-" * 50)
        
        response = await system.process_task(args.task, args.priority, context)
        print(response)
    
    elif args.command == "status":
        await system.initialize()
        info = system.get_system_info()
        print("System Status:")
        print(f"- Status: {info['status']}")
        print(f"- Available Agents: {', '.join(info['agents'])}")
        print(f"- SOP Files Loaded: {info['sop_files']}")
        print(f"- LangSmith Enabled: {info['langsmith_enabled']}")
        print(f"- Configuration: {info['config']}")
    
    elif args.command == "demo":
        await run_demo(system)
    
    elif args.command == "interactive":
        await run_interactive(system)

async def run_demo(system: MultiAgentSystem):
    """Run a demonstration of the multi-agent system"""
    print("=== LangGraph Multi-Agent System Demo ===\n")
    
    demo_tasks = [
        {
            "task": "Create a Python function to calculate fibonacci numbers",
            "priority": "medium",
            "context": {"language": "python", "include_tests": True}
        },
        {
            "task": "How do I deploy a Flask app to production?",
            "priority": "high",
            "context": {"platform": "AWS", "framework": "Flask"}
        },
        {
            "task": "Analyze our monthly sales data and provide insights",
            "priority": "medium",
            "context": {"data_source": "sales_db", "period": "monthly"}
        },
        {
            "task": "Help a customer who can't log into their account",
            "priority": "high",
            "context": {"issue_type": "login", "customer_tier": "premium"}
        },
        {
            "task": "Create a social media campaign for our new product launch",
            "priority": "medium",
            "context": {"product": "SaaS tool", "target_audience": "developers"}
        }
    ]
    
    for i, demo_task in enumerate(demo_tasks, 1):
        print(f"Demo Task {i}: {demo_task['task']}")
        print(f"Priority: {demo_task['priority']}")
        print(f"Context: {demo_task['context']}")
        print("-" * 60)
        
        response = await system.process_task(
            demo_task["task"], 
            demo_task["priority"], 
            demo_task["context"]
        )
        
        print(response)
        print("=" * 60)
        print()

async def run_interactive(system: MultiAgentSystem):
    """Run interactive mode"""
    print("=== Interactive Multi-Agent System ===")
    print("Type 'quit' to exit, 'status' for system info, 'help' for commands")
    print()
    
    while True:
        try:
            user_input = input("Enter task: ").strip()
            
            if user_input.lower() in ['quit', 'exit']:
                print("Goodbye!")
                break
            
            elif user_input.lower() == 'status':
                await system.initialize()
                info = system.get_system_info()
                print(f"System Status: {info['status']}")
                print(f"Available Agents: {', '.join(info['agents'])}")
                continue
            
            elif user_input.lower() == 'help':
                print("Available commands:")
                print("- Any text: Process as a task")
                print("- 'status': Show system status")
                print("- 'quit'/'exit': Exit the program")
                continue
            
            elif not user_input:
                continue
            
            # Process the task
            print("Processing...")
            response = await system.process_task(user_input)
            print(f"\nResponse:\n{response}\n")
            
        except KeyboardInterrupt:
            print("\nGoodbye!")
            break
        except Exception as e:
            print(f"Error: {e}")

def main():
    """Main entry point"""
    try:
        asyncio.run(run_cli())
    except KeyboardInterrupt:
        print("\nExiting...")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Application error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()