"""
Logto Configuration for 12thhaus Spiritual Platform
Handles authentication client setup and configuration
"""
import os
from typing import Optional, Dict, Any, List

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # dotenv not installed, that's fine
    pass

from logto import LogtoClient, LogtoConfig as BaseLogtoConfig, UserInfoScope, Storage
from flask import session


class SessionStorage(Storage):
    """Flask session-based storage for Logto client"""
    
    def get(self, key: str) -> Optional[str]:
        return session.get(key, None)
    
    def set(self, key: str, value: Optional[str]) -> None:
        session[key] = value
    
    def delete(self, key: str) -> None:
        session.pop(key, None)


class LogtoConfig:
    """Configuration manager for Logto authentication"""
    
    def __init__(self):
        # Logto Configuration from environment
        self.LOGTO_ENDPOINT = os.getenv("LOGTO_ENDPOINT")
        self.LOGTO_APP_ID = os.getenv("LOGTO_APP_ID")
        self.LOGTO_APP_SECRET = os.getenv("LOGTO_APP_SECRET")
        self.LOGTO_RESOURCE_INDICATOR = os.getenv("LOGTO_RESOURCE_INDICATOR", "https://api.langgraph-platform.com")
        
        # Multi-tenant Configuration
        self.MULTI_TENANT_ENABLED = os.getenv("MULTI_TENANT_ENABLED", "true").lower() == "true"
        self.DEFAULT_ORG_ROLE = os.getenv("DEFAULT_ORG_ROLE", "viewer")
        
        # Validate required configuration
        self._validate_config()
    
    def _validate_config(self):
        """Validate required Logto configuration"""
        # Only validate if not in test mode
        if os.getenv('TESTING', '').lower() == 'true':
            return
            
        required_vars = [
            ("LOGTO_ENDPOINT", self.LOGTO_ENDPOINT),
            ("LOGTO_APP_ID", self.LOGTO_APP_ID), 
            ("LOGTO_APP_SECRET", self.LOGTO_APP_SECRET)
        ]
        
        missing_vars = [var_name for var_name, var_value in required_vars if not var_value]
        
        if missing_vars:
            print(f"Warning: Missing Logto environment variables: {', '.join(missing_vars)}")
            print("To fix this, ensure your .env file contains all required Logto credentials.")
            # Don't raise error, just warn for now
    
    def get_client_config(self) -> BaseLogtoConfig:
        """Get Logto client configuration"""
        return BaseLogtoConfig(
            endpoint=self.LOGTO_ENDPOINT,
            appId=self.LOGTO_APP_ID,
            appSecret=self.LOGTO_APP_SECRET,
            scopes=[
                UserInfoScope.organizations,  # For multi-tenant support
                "read",                       # Basic read permissions
                "write"                       # Basic write permissions  
            ],
            resources=[self.LOGTO_RESOURCE_INDICATOR]
        )


# Global configuration instance
logto_config = LogtoConfig()


def get_logto_client() -> Optional[LogtoClient]:
    """Get configured Logto client with session storage"""
    try:
        if not all([logto_config.LOGTO_ENDPOINT, logto_config.LOGTO_APP_ID, logto_config.LOGTO_APP_SECRET]):
            print("Logto client cannot be created: missing required configuration")
            return None
            
        return LogtoClient(
            logto_config.get_client_config(),
            storage=SessionStorage()
        )
    except Exception as e:
        print(f"Failed to create Logto client: {str(e)}")
        return None


def get_organization_scopes(organization_id: str) -> List[str]:
    """Get organization-specific scopes for RBAC"""
    base_scopes = ["read", "write"]
    org_scopes = [f"org:{organization_id}:{scope}" for scope in base_scopes]
    return base_scopes + org_scopes


def validate_organization_access(user_organizations: List[Dict[str, Any]], organization_id: str) -> bool:
    """Validate if user has access to specified organization"""
    return any(org.get("id") == organization_id for org in user_organizations)