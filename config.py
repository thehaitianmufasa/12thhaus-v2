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
    
    # Logto Authentication Configuration
    LOGTO_ENDPOINT = os.getenv("LOGTO_ENDPOINT")  # e.g., https://your-tenant.logto.app
    LOGTO_APP_ID = os.getenv("LOGTO_APP_ID")
    LOGTO_APP_SECRET = os.getenv("LOGTO_APP_SECRET")
    LOGTO_RESOURCE_INDICATOR = os.getenv("LOGTO_RESOURCE_INDICATOR")  # Optional API resource
    
    # Multi-tenant Configuration
    MULTI_TENANT_ENABLED = os.getenv("MULTI_TENANT_ENABLED", "true") == "true"
    DEFAULT_ORG_ROLE = os.getenv("DEFAULT_ORG_ROLE", "viewer")
    ORG_STORAGE_BACKEND = os.getenv("ORG_STORAGE_BACKEND", "memory")  # memory, redis, database
    
    # Session Configuration
    SECRET_KEY = os.getenv("SECRET_KEY", os.urandom(24).hex())  # For Flask sessions
    SESSION_TYPE = os.getenv("SESSION_TYPE", "filesystem")
    SESSION_COOKIE_SECURE = os.getenv("SESSION_COOKIE_SECURE", "false") == "true"
    SESSION_COOKIE_HTTPONLY = os.getenv("SESSION_COOKIE_HTTPONLY", "true") == "true"
    SESSION_COOKIE_SAMESITE = os.getenv("SESSION_COOKIE_SAMESITE", "Lax")
    
    # API Security Configuration
    VALID_API_KEYS = os.getenv("VALID_API_KEYS", "").split(",")  # Comma-separated API keys
    REQUIRE_AUTH_FOR_APIS = os.getenv("REQUIRE_AUTH_FOR_APIS", "true") == "true"
    
    # JWT Configuration
    JWT_ISSUER = os.getenv("JWT_ISSUER")  # Usually same as LOGTO_ENDPOINT
    JWT_AUDIENCE = os.getenv("JWT_AUDIENCE")  # Usually same as LOGTO_APP_ID
    JWT_ALGORITHMS = os.getenv("JWT_ALGORITHMS", "RS256").split(",")
    
    # CORS Configuration (for API endpoints)
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
    CORS_ALLOW_CREDENTIALS = os.getenv("CORS_ALLOW_CREDENTIALS", "true") == "true"
    
    # Validate required environment variables
    @classmethod
    def validate(cls):
        required_vars = ["LANGCHAIN_API_KEY", "ANTHROPIC_API_KEY"]
        
        # Add Logto requirements if authentication is enabled
        if cls.REQUIRE_AUTH_FOR_APIS:
            required_vars.extend(["LOGTO_ENDPOINT", "LOGTO_APP_ID", "LOGTO_APP_SECRET"])
        
        missing_vars = [var for var in required_vars if not getattr(cls, var)]
        
        if missing_vars:
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
        
        # Validate Logto configuration
        if cls.LOGTO_ENDPOINT and not cls.LOGTO_ENDPOINT.startswith(('http://', 'https://')):
            raise ValueError("LOGTO_ENDPOINT must be a valid HTTP(S) URL")
        
        # Validate JWT configuration
        if not cls.JWT_ISSUER and cls.LOGTO_ENDPOINT:
            cls.JWT_ISSUER = cls.LOGTO_ENDPOINT
        
        if not cls.JWT_AUDIENCE and cls.LOGTO_APP_ID:
            cls.JWT_AUDIENCE = cls.LOGTO_APP_ID
        
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