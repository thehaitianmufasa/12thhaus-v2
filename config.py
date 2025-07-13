"""
Configuration for LangGraph Multi-Agent System with LangSmith integration
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    # LangSmith Configuration
    LANGCHAIN_TRACING_V2 = os.getenv("LANGCHAIN_TRACING_V2", "true") == "true"
    LANGCHAIN_ENDPOINT = os.getenv("LANGCHAIN_ENDPOINT", "https://api.smith.langchain.com")
    LANGCHAIN_API_KEY = os.getenv("LANGCHAIN_API_KEY")
    LANGCHAIN_PROJECT = os.getenv("LANGCHAIN_PROJECT", "langgraph-multi-agent")
    
    # Anthropic Configuration (for Claude)
    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
    
    # Agent Configuration
    AGENT_TEMPERATURE = float(os.getenv("AGENT_TEMPERATURE", "0.7"))
    AGENT_MAX_TOKENS = int(os.getenv("AGENT_MAX_TOKENS", "4000"))
    
    # Validate required environment variables
    @classmethod
    def validate(cls):
        required_vars = ["LANGCHAIN_API_KEY", "ANTHROPIC_API_KEY"]
        missing_vars = [var for var in required_vars if not getattr(cls, var)]
        
        if missing_vars:
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
        
        return True

# Apply configuration to environment
if Config.LANGCHAIN_API_KEY:
    os.environ["LANGCHAIN_API_KEY"] = Config.LANGCHAIN_API_KEY
if Config.ANTHROPIC_API_KEY:
    os.environ["ANTHROPIC_API_KEY"] = Config.ANTHROPIC_API_KEY
if Config.LANGCHAIN_TRACING_V2:
    os.environ["LANGCHAIN_TRACING_V2"] = "true"
    os.environ["LANGCHAIN_ENDPOINT"] = Config.LANGCHAIN_ENDPOINT
    os.environ["LANGCHAIN_PROJECT"] = Config.LANGCHAIN_PROJECT