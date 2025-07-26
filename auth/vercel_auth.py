"""
Vercel-compatible authentication decorators for 12thhaus Spiritual Platform.

This module provides authentication decorators that work with Vercel's
BaseHTTPRequestHandler pattern for serverless functions.
"""

import json
import functools
from typing import Callable, Any, Optional
from http.server import BaseHTTPRequestHandler

from .middleware import validate_jwt_token, get_organization_from_token
from .organizations import get_organization_manager


class AuthenticationError(Exception):
    """Custom exception for authentication errors."""
    def __init__(self, message: str, status_code: int = 401):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


def send_error_response(handler: BaseHTTPRequestHandler, message: str, status_code: int):
    """Send a JSON error response."""
    handler.send_response(status_code)
    handler.send_header('Content-Type', 'application/json')
    handler.send_header('Access-Control-Allow-Origin', '*')
    handler.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    handler.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Organization-Id')
    handler.end_headers()
    
    response = {
        'error': message,
        'status_code': status_code
    }
    handler.wfile.write(json.dumps(response).encode())


def authenticated_vercel(f: Callable) -> Callable:
    """
    Decorator for Vercel serverless functions that require authentication.
    
    Validates JWT token and adds user information to the handler instance.
    """
    @functools.wraps(f)
    def decorated_function(handler: BaseHTTPRequestHandler, *args: Any, **kwargs: Any) -> Any:
        try:
            # Get token from Authorization header
            auth_header = handler.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                send_error_response(handler, 'Missing or invalid authorization header', 401)
                return
            
            token = auth_header.split(' ')[1]
            
            # Validate token
            payload = validate_jwt_token(token)
            if not payload:
                send_error_response(handler, 'Invalid or expired token', 403)
                return
            
            # Add user info to handler instance
            handler.user_id = payload.get('sub')
            handler.user_email = payload.get('email')
            handler.user_roles = payload.get('roles', [])
            handler.organizations = payload.get('organizations', [])
            
            # Try to get organization context
            org_id = handler.headers.get('X-Organization-Id')
            if not org_id:
                org_id = get_organization_from_token(token)
            
            handler.organization_id = org_id
            handler.organization_role = None
            
            if org_id and handler.organizations:
                user_orgs = [org.get('id') for org in handler.organizations]
                if org_id in user_orgs:
                    for org in handler.organizations:
                        if org.get('id') == org_id:
                            handler.organization = org
                            handler.organization_role = org.get('role', 'viewer')
                            break
            
            return f(handler, *args, **kwargs)
            
        except Exception as e:
            send_error_response(handler, f'Authentication error: {str(e)}', 500)
            return
    
    return decorated_function


def optional_auth_vercel(f: Callable) -> Callable:
    """
    Decorator for Vercel serverless functions with optional authentication.
    
    If a valid token is provided, user info is added to the handler.
    If no token or invalid token, the function still executes.
    """
    @functools.wraps(f)
    def decorated_function(handler: BaseHTTPRequestHandler, *args: Any, **kwargs: Any) -> Any:
        try:
            # Initialize default values
            handler.user_id = None
            handler.user_email = None
            handler.user_roles = []
            handler.organizations = []
            handler.organization_id = None
            handler.organization_role = None
            handler.is_authenticated = False
            
            # Try to get token from Authorization header
            auth_header = handler.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                
                # Try to validate token
                payload = validate_jwt_token(token)
                if payload:
                    # Add user info to handler instance
                    handler.user_id = payload.get('sub')
                    handler.user_email = payload.get('email')
                    handler.user_roles = payload.get('roles', [])
                    handler.organizations = payload.get('organizations', [])
                    handler.is_authenticated = True
                    
                    # Try to get organization context
                    org_id = handler.headers.get('X-Organization-Id')
                    if not org_id:
                        org_id = get_organization_from_token(token)
                    
                    handler.organization_id = org_id
                    
                    if org_id and handler.organizations:
                        user_orgs = [org.get('id') for org in handler.organizations]
                        if org_id in user_orgs:
                            for org in handler.organizations:
                                if org.get('id') == org_id:
                                    handler.organization = org
                                    handler.organization_role = org.get('role', 'viewer')
                                    break
            
            return f(handler, *args, **kwargs)
            
        except Exception as e:
            # Log error but continue execution
            print(f"Optional auth error: {str(e)}")
            return f(handler, *args, **kwargs)
    
    return decorated_function


def organization_required_vercel(f: Callable) -> Callable:
    """
    Decorator for Vercel functions that require organization context.
    
    Must be used after @authenticated_vercel.
    """
    @functools.wraps(f)
    def decorated_function(handler: BaseHTTPRequestHandler, *args: Any, **kwargs: Any) -> Any:
        try:
            # Check if user is authenticated
            if not hasattr(handler, 'user_id') or not handler.user_id:
                send_error_response(handler, 'Authentication required', 401)
                return
            
            # Check if organization context is available
            if not hasattr(handler, 'organization_id') or not handler.organization_id:
                if not handler.organizations:
                    send_error_response(handler, 'User does not belong to any organization', 403)
                    return
                
                # Use first organization as default
                handler.organization_id = handler.organizations[0].get('id')
                handler.organization = handler.organizations[0]
                handler.organization_role = handler.organizations[0].get('role', 'viewer')
            
            return f(handler, *args, **kwargs)
            
        except Exception as e:
            send_error_response(handler, f'Organization context error: {str(e)}', 500)
            return
    
    return decorated_function


def role_required_vercel(*required_roles: str) -> Callable:
    """
    Decorator for Vercel functions that require specific roles.
    
    Must be used after @organization_required_vercel.
    """
    def decorator(f: Callable) -> Callable:
        @functools.wraps(f)
        def decorated_function(handler: BaseHTTPRequestHandler, *args: Any, **kwargs: Any) -> Any:
            try:
                # Check authentication and organization context
                if not hasattr(handler, 'user_id') or not handler.user_id:
                    send_error_response(handler, 'Authentication required', 401)
                    return
                
                if not hasattr(handler, 'organization_id') or not handler.organization_id:
                    send_error_response(handler, 'Organization context required', 403)
                    return
                
                # Check role
                user_role = getattr(handler, 'organization_role', None)
                if not user_role or user_role not in required_roles:
                    send_error_response(
                        handler,
                        f'Insufficient permissions. Required roles: {", ".join(required_roles)}',
                        403
                    )
                    return
                
                return f(handler, *args, **kwargs)
                
            except Exception as e:
                send_error_response(handler, f'Role validation error: {str(e)}', 500)
                return
        
        return decorated_function
    
    return decorator


def api_key_required_vercel(f: Callable) -> Callable:
    """
    Decorator for Vercel functions that require API key authentication.
    
    Useful for service-to-service communication.
    """
    @functools.wraps(f)
    def decorated_function(handler: BaseHTTPRequestHandler, *args: Any, **kwargs: Any) -> Any:
        try:
            # Get API key from header
            api_key = handler.headers.get('X-API-Key')
            if not api_key:
                send_error_response(handler, 'Missing API key', 401)
                return
            
            # Validate API key (get from environment)
            import os
            valid_api_keys = os.environ.get('VALID_API_KEYS', '').split(',')
            if api_key not in valid_api_keys or not api_key:
                send_error_response(handler, 'Invalid API key', 403)
                return
            
            # Add API key info to handler
            handler.api_key = api_key
            handler.is_service_account = True
            
            return f(handler, *args, **kwargs)
            
        except Exception as e:
            send_error_response(handler, f'API key validation error: {str(e)}', 500)
            return
    
    return decorated_function


def handle_cors_preflight(handler: BaseHTTPRequestHandler):
    """Handle CORS preflight requests."""
    if handler.command == 'OPTIONS':
        handler.send_response(200)
        handler.send_header('Access-Control-Allow-Origin', '*')
        handler.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        handler.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Organization-Id, X-API-Key')
        handler.send_header('Access-Control-Max-Age', '3600')
        handler.end_headers()
        return True
    return False