"""  
Authentication middleware for 12thhaus Spiritual Platform
Provides JWT validation and organization context extraction
"""
import json
import os
from functools import wraps
from typing import Optional, Dict, Any, List
from flask import request, g, jsonify
from jose import jwt, JWTError
import requests

# Import with fallback for config
try:
    from .logto_config import logto_config
except ImportError:
    # Fallback config for testing
    class FallbackConfig:
        def __init__(self):
            self.LOGTO_ENDPOINT = os.getenv('LOGTO_ENDPOINT', 'https://vopm4n.logto.app')
            self.LOGTO_APP_ID = os.getenv('LOGTO_APP_ID', '')
            self.LOGTO_APP_SECRET = os.getenv('LOGTO_APP_SECRET', '')
            self.LOGTO_RESOURCE_INDICATOR = os.getenv('LOGTO_RESOURCE_INDICATOR', '')
    
    logto_config = FallbackConfig()


class AuthError(Exception):
    """Authentication error exception"""
    def __init__(self, error: Dict[str, Any], status_code: int):
        self.error = error
        self.status_code = status_code


def get_token_auth_header() -> str:
    """Extract Bearer token from Authorization header"""
    auth = request.headers.get("Authorization", None)
    
    if not auth:
        raise AuthError({
            "code": "authorization_header_missing",
            "description": "Authorization header is expected"
        }, 401)
    
    parts = auth.split()
    
    if len(parts) < 2:
        raise AuthError({
            "code": "invalid_header", 
            "description": "Authorization header must be bearer token"
        }, 401)
    
    elif parts[0].lower() != "bearer":
        raise AuthError({
            "code": "invalid_header",
            "description": "Authorization header must start with Bearer"
        }, 401)
    
    return parts[1]


def validate_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    """Validate JWT token and return payload"""
    try:
        # Get JWKS from Logto endpoint
        jwks_uri = f"{logto_config.LOGTO_ENDPOINT}/oidc/jwks"
        response = requests.get(jwks_uri, timeout=10)
        response.raise_for_status()
        jwks = response.json()
        
        # Get token header to determine algorithm
        unverified_header = jwt.get_unverified_header(token)
        algorithm = unverified_header.get('alg', 'RS256')
        
        # Decode and verify token
        payload = jwt.decode(
            token,
            jwks,
            algorithms=[algorithm],
            audience=logto_config.LOGTO_APP_ID,  # Use APP_ID as audience
            issuer=f"{logto_config.LOGTO_ENDPOINT}/oidc",
            options={"verify_at_hash": False}
        )
        
        return payload
        
    except JWTError as e:
        print(f"JWT validation error: {str(e)}")
        return None
    except Exception as e:
        print(f"Token validation failed: {str(e)}")
        return None


def verify_decode_jwt(token: str) -> Dict[str, Any]:
    """Verify and decode JWT token using Logto JWKS - raises AuthError on failure"""
    payload = validate_jwt_token(token)
    if not payload:
        raise AuthError({
            "code": "invalid_token", 
            "description": "Unable to parse or validate authentication token"
        }, 401)
    
    return payload


def require_auth(f):
    """Decorator to require authentication for API endpoints"""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            token = get_token_auth_header()
            payload = verify_decode_jwt(token)
            
            # Store user information in Flask's application context
            g.current_user = {
                "id": payload.get("sub"),
                "email": payload.get("email"),
                "organizations": payload.get("organizations", []),
                "scopes": payload.get("scope", "").split(),
                "token": token
            }
            
        except AuthError as e:
            return jsonify(e.error), e.status_code
        
        return f(*args, **kwargs)
    
    return decorated


def get_current_user() -> Optional[Dict[str, Any]]:
    """Get current authenticated user from request context"""
    return getattr(g, 'current_user', None)


def get_organization_context() -> Optional[str]:
    """Extract organization ID from request headers or query params"""
    # Try header first (preferred for API calls)
    org_id = request.headers.get('X-Organization-ID')
    
    # Fall back to query parameter
    if not org_id:
        org_id = request.args.get('organization_id')
    
    return org_id


def get_organization_from_token(token: str) -> Optional[str]:
    """Extract organization ID from JWT token"""
    try:
        payload = validate_jwt_token(token)
        if not payload:
            return None
        
        # Check for organization in token claims
        organizations = payload.get("organizations", [])
        if organizations and isinstance(organizations, list):
            # Return first organization ID
            return organizations[0].get("id") if organizations[0] else None
        
        # Check for org_id claim directly
        return payload.get("org_id")
        
    except Exception as e:
        print(f"Error extracting organization from token: {str(e)}")
        return None


def validate_organization_access(organization_id: str) -> bool:
    """Validate if current user has access to specified organization"""
    user = get_current_user()
    if not user:
        return False
    
    user_orgs = user.get("organizations", [])
    return any(org.get("id") == organization_id for org in user_orgs)