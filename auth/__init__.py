"""
Authentication module for LangGraph Multi-Agent Platform
Provides Logto integration for enterprise multi-tenant authentication
"""

from .logto_config import LogtoConfig, get_logto_client
from .middleware import (
    require_auth, 
    get_current_user, 
    get_organization_context,
    validate_jwt_token,
    get_organization_from_token
)
from .decorators import authenticated, organization_required, role_required
from .organizations import OrganizationManager, OrganizationRole

__all__ = [
    'LogtoConfig',
    'get_logto_client', 
    'require_auth',
    'get_current_user',
    'get_organization_context',
    'validate_jwt_token',
    'get_organization_from_token',
    'authenticated',
    'organization_required', 
    'role_required',
    'OrganizationManager',
    'OrganizationRole'
]