"""
Authentication and authorization decorators for the 12thhaus Spiritual Platform.

This module provides decorators for protecting API endpoints with authentication
and role-based access control.
"""

import functools
from typing import Optional, List, Callable, Any
from flask import request, jsonify, g
from jose import jwt, JWTError
import os

from .middleware import validate_jwt_token, get_organization_from_token


def authenticated(f: Callable) -> Callable:
    """
    Decorator to ensure the user is authenticated.
    
    Validates the JWT token and adds user information to the request context.
    
    Returns:
        401 if no valid token is provided
        403 if token is invalid or expired
    """
    @functools.wraps(f)
    def decorated_function(*args: Any, **kwargs: Any) -> Any:
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid authorization header'}), 401
        
        token = auth_header.split(' ')[1]
        
        # Validate token
        payload = validate_jwt_token(token)
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 403
        
        # Add user info to request context
        g.user_id = payload.get('sub')
        g.user_email = payload.get('email')
        g.user_roles = payload.get('roles', [])
        g.organizations = payload.get('organizations', [])
        
        return f(*args, **kwargs)
    
    return decorated_function


def organization_required(f: Callable) -> Callable:
    """
    Decorator to ensure the user has an active organization context.
    
    Must be used after @authenticated decorator.
    Validates that the user belongs to an organization and sets the current org context.
    
    Returns:
        403 if user doesn't belong to any organization
    """
    @functools.wraps(f)
    def decorated_function(*args: Any, **kwargs: Any) -> Any:
        # Check if user is authenticated first
        if not hasattr(g, 'user_id'):
            return jsonify({'error': 'Authentication required'}), 401
        
        # Get organization from token or header
        org_id = request.headers.get('X-Organization-Id')
        if not org_id:
            # Try to get from token
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                org_id = get_organization_from_token(token)
        
        if not org_id:
            # Check if user has any organizations
            if not g.organizations:
                return jsonify({'error': 'User does not belong to any organization'}), 403
            
            # Use first organization as default
            org_id = g.organizations[0].get('id')
        
        # Validate user belongs to this organization
        user_orgs = [org.get('id') for org in g.organizations]
        if org_id not in user_orgs:
            return jsonify({'error': 'User does not have access to this organization'}), 403
        
        # Set organization context
        g.organization_id = org_id
        
        # Find organization details
        for org in g.organizations:
            if org.get('id') == org_id:
                g.organization = org
                g.organization_role = org.get('role', 'viewer')
                break
        
        return f(*args, **kwargs)
    
    return decorated_function


def role_required(*required_roles: str) -> Callable:
    """
    Decorator to ensure the user has one of the required roles in the current organization.
    
    Must be used after @organization_required decorator.
    
    Args:
        *required_roles: Variable number of role names that are allowed access
        
    Common roles:
        - 'admin': Full organization management
        - 'editor': Can create and modify resources
        - 'viewer': Read-only access
    
    Returns:
        403 if user doesn't have any of the required roles
    """
    def decorator(f: Callable) -> Callable:
        @functools.wraps(f)
        def decorated_function(*args: Any, **kwargs: Any) -> Any:
            # Check if user is authenticated and has organization context
            if not hasattr(g, 'user_id'):
                return jsonify({'error': 'Authentication required'}), 401
            
            if not hasattr(g, 'organization_id'):
                return jsonify({'error': 'Organization context required'}), 403
            
            # Get user's role in current organization
            user_role = getattr(g, 'organization_role', None)
            
            if not user_role:
                return jsonify({'error': 'User has no role in this organization'}), 403
            
            # Check if user has any of the required roles
            if user_role not in required_roles:
                return jsonify({
                    'error': f'Insufficient permissions. Required roles: {", ".join(required_roles)}'
                }), 403
            
            return f(*args, **kwargs)
        
        return decorated_function
    
    return decorator


def optional_auth(f: Callable) -> Callable:
    """
    Decorator for endpoints that work with or without authentication.
    
    If a valid token is provided, user info is added to the request context.
    If no token or invalid token, the endpoint still executes but without user context.
    """
    @functools.wraps(f)
    def decorated_function(*args: Any, **kwargs: Any) -> Any:
        # Try to get token from Authorization header
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            
            # Try to validate token
            payload = validate_jwt_token(token)
            if payload:
                # Add user info to request context
                g.user_id = payload.get('sub')
                g.user_email = payload.get('email')
                g.user_roles = payload.get('roles', [])
                g.organizations = payload.get('organizations', [])
                
                # Try to get organization context
                org_id = request.headers.get('X-Organization-Id')
                if not org_id:
                    org_id = get_organization_from_token(token)
                
                if org_id and g.organizations:
                    user_orgs = [org.get('id') for org in g.organizations]
                    if org_id in user_orgs:
                        g.organization_id = org_id
                        for org in g.organizations:
                            if org.get('id') == org_id:
                                g.organization = org
                                g.organization_role = org.get('role', 'viewer')
                                break
        
        return f(*args, **kwargs)
    
    return decorated_function


def require_api_key(f: Callable) -> Callable:
    """
    Decorator to validate API key authentication for service-to-service calls.
    
    Checks for X-API-Key header and validates against configured keys.
    """
    @functools.wraps(f)
    def decorated_function(*args: Any, **kwargs: Any) -> Any:
        api_key = request.headers.get('X-API-Key')
        if not api_key:
            return jsonify({'error': 'Missing API key'}), 401
        
        # Validate API key (you would check against stored keys)
        valid_api_keys = os.environ.get('VALID_API_KEYS', '').split(',')
        if api_key not in valid_api_keys:
            return jsonify({'error': 'Invalid API key'}), 403
        
        # Add API key info to context
        g.api_key = api_key
        g.is_service_account = True
        
        return f(*args, **kwargs)
    
    return decorated_function