"""
Organization management for the 12thhaus Spiritual Platform.

This module handles organization creation, member management, role assignments,
and invitation system for multi-tenant support.
"""

import uuid
import secrets
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import json
import os
from logto import LogtoClient

from .logto_config import get_logto_client


class OrganizationRole(Enum):
    """Organization roles with hierarchical permissions."""
    ADMIN = "admin"     # Full organization management
    EDITOR = "editor"   # Can create and modify resources
    VIEWER = "viewer"   # Read-only access


@dataclass
class Organization:
    """Organization data model."""
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    metadata: Optional[Dict] = None


@dataclass
class OrganizationMember:
    """Organization member data model."""
    user_id: str
    organization_id: str
    role: OrganizationRole
    joined_at: datetime
    invited_by: Optional[str] = None


@dataclass
class OrganizationInvitation:
    """Organization invitation data model."""
    id: str
    organization_id: str
    email: str
    role: OrganizationRole
    token: str
    expires_at: datetime
    created_by: str
    created_at: datetime
    accepted_at: Optional[datetime] = None
    accepted_by: Optional[str] = None


class OrganizationManager:
    """
    Manages organizations, members, and invitations.
    
    This class provides methods for creating organizations, managing members,
    sending invitations, and handling role assignments.
    """
    
    def __init__(self, storage_backend: Optional[str] = "memory"):
        """
        Initialize the OrganizationManager.
        
        Args:
            storage_backend: Storage backend to use ('memory', 'redis', 'database')
                           For production, use 'database' with proper persistence
        """
        self.storage_backend = storage_backend
        self.logto_client = get_logto_client()
        
        # In-memory storage for demo (replace with proper database in production)
        self._organizations: Dict[str, Organization] = {}
        self._members: Dict[str, List[OrganizationMember]] = {}
        self._invitations: Dict[str, OrganizationInvitation] = {}
        self._user_organizations: Dict[str, List[str]] = {}
    
    def create_organization(self, 
                          name: str, 
                          created_by: str,
                          slug: Optional[str] = None,
                          description: Optional[str] = None,
                          metadata: Optional[Dict] = None) -> Organization:
        """
        Create a new organization.
        
        Args:
            name: Organization name
            created_by: User ID of the creator
            slug: URL-friendly identifier (auto-generated if not provided)
            description: Organization description
            metadata: Additional metadata
            
        Returns:
            Created organization
        """
        org_id = str(uuid.uuid4())
        
        if not slug:
            # Generate slug from name
            slug = name.lower().replace(' ', '-').replace('_', '-')
            slug = ''.join(c for c in slug if c.isalnum() or c == '-')
        
        organization = Organization(
            id=org_id,
            name=name,
            slug=slug,
            description=description,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            metadata=metadata or {}
        )
        
        # Store organization
        self._organizations[org_id] = organization
        
        # Add creator as admin
        self.add_member(org_id, created_by, OrganizationRole.ADMIN, invited_by=None)
        
        return organization
    
    def get_organization(self, org_id: str) -> Optional[Organization]:
        """Get organization by ID."""
        return self._organizations.get(org_id)
    
    def update_organization(self, 
                          org_id: str,
                          name: Optional[str] = None,
                          description: Optional[str] = None,
                          metadata: Optional[Dict] = None) -> Optional[Organization]:
        """Update organization details."""
        org = self._organizations.get(org_id)
        if not org:
            return None
        
        if name:
            org.name = name
        if description is not None:
            org.description = description
        if metadata is not None:
            org.metadata = metadata
        
        org.updated_at = datetime.utcnow()
        return org
    
    def delete_organization(self, org_id: str) -> bool:
        """
        Delete an organization and all associated data.
        
        Args:
            org_id: Organization ID
            
        Returns:
            True if deleted, False if not found
        """
        if org_id not in self._organizations:
            return False
        
        # Remove organization
        del self._organizations[org_id]
        
        # Remove all members
        if org_id in self._members:
            for member in self._members[org_id]:
                if member.user_id in self._user_organizations:
                    self._user_organizations[member.user_id].remove(org_id)
            del self._members[org_id]
        
        # Remove all invitations
        invitation_ids = [
            inv_id for inv_id, inv in self._invitations.items()
            if inv.organization_id == org_id
        ]
        for inv_id in invitation_ids:
            del self._invitations[inv_id]
        
        return True
    
    def add_member(self, 
                   org_id: str, 
                   user_id: str, 
                   role: OrganizationRole,
                   invited_by: Optional[str] = None) -> Optional[OrganizationMember]:
        """
        Add a member to an organization.
        
        Args:
            org_id: Organization ID
            user_id: User ID to add
            role: Role to assign
            invited_by: User ID of inviter
            
        Returns:
            Created member or None if organization doesn't exist
        """
        if org_id not in self._organizations:
            return None
        
        member = OrganizationMember(
            user_id=user_id,
            organization_id=org_id,
            role=role,
            joined_at=datetime.utcnow(),
            invited_by=invited_by
        )
        
        # Store member
        if org_id not in self._members:
            self._members[org_id] = []
        self._members[org_id].append(member)
        
        # Update user's organization list
        if user_id not in self._user_organizations:
            self._user_organizations[user_id] = []
        self._user_organizations[user_id].append(org_id)
        
        return member
    
    def remove_member(self, org_id: str, user_id: str) -> bool:
        """Remove a member from an organization."""
        if org_id not in self._members:
            return False
        
        # Find and remove member
        self._members[org_id] = [
            m for m in self._members[org_id] if m.user_id != user_id
        ]
        
        # Update user's organization list
        if user_id in self._user_organizations:
            self._user_organizations[user_id] = [
                o for o in self._user_organizations[user_id] if o != org_id
            ]
        
        return True
    
    def update_member_role(self, 
                          org_id: str, 
                          user_id: str, 
                          new_role: OrganizationRole) -> bool:
        """Update a member's role in an organization."""
        if org_id not in self._members:
            return False
        
        for member in self._members[org_id]:
            if member.user_id == user_id:
                member.role = new_role
                return True
        
        return False
    
    def get_member(self, org_id: str, user_id: str) -> Optional[OrganizationMember]:
        """Get a specific member of an organization."""
        if org_id not in self._members:
            return None
        
        for member in self._members[org_id]:
            if member.user_id == user_id:
                return member
        
        return None
    
    def get_organization_members(self, org_id: str) -> List[OrganizationMember]:
        """Get all members of an organization."""
        return self._members.get(org_id, [])
    
    def get_user_organizations(self, user_id: str) -> List[Tuple[Organization, OrganizationRole]]:
        """
        Get all organizations a user belongs to with their roles.
        
        Returns:
            List of (Organization, Role) tuples
        """
        result = []
        org_ids = self._user_organizations.get(user_id, [])
        
        for org_id in org_ids:
            org = self._organizations.get(org_id)
            if org:
                member = self.get_member(org_id, user_id)
                if member:
                    result.append((org, member.role))
        
        return result
    
    def create_invitation(self,
                         org_id: str,
                         email: str,
                         role: OrganizationRole,
                         created_by: str,
                         expires_in_hours: int = 72) -> Optional[OrganizationInvitation]:
        """
        Create an invitation to join an organization.
        
        Args:
            org_id: Organization ID
            email: Email to invite
            role: Role to assign when accepted
            created_by: User ID of inviter
            expires_in_hours: Hours until expiration (default 72)
            
        Returns:
            Created invitation or None if organization doesn't exist
        """
        if org_id not in self._organizations:
            return None
        
        invitation = OrganizationInvitation(
            id=str(uuid.uuid4()),
            organization_id=org_id,
            email=email,
            role=role,
            token=secrets.token_urlsafe(32),
            expires_at=datetime.utcnow() + timedelta(hours=expires_in_hours),
            created_by=created_by,
            created_at=datetime.utcnow()
        )
        
        self._invitations[invitation.id] = invitation
        return invitation
    
    def get_invitation_by_token(self, token: str) -> Optional[OrganizationInvitation]:
        """Find an invitation by its token."""
        for invitation in self._invitations.values():
            if invitation.token == token and invitation.expires_at > datetime.utcnow():
                return invitation
        return None
    
    def accept_invitation(self, 
                         token: str, 
                         user_id: str) -> Optional[OrganizationMember]:
        """
        Accept an invitation and add user to organization.
        
        Args:
            token: Invitation token
            user_id: User ID accepting the invitation
            
        Returns:
            Created member or None if invitation is invalid
        """
        invitation = self.get_invitation_by_token(token)
        if not invitation or invitation.accepted_at:
            return None
        
        # Mark invitation as accepted
        invitation.accepted_at = datetime.utcnow()
        invitation.accepted_by = user_id
        
        # Add user to organization
        return self.add_member(
            invitation.organization_id,
            user_id,
            invitation.role,
            invited_by=invitation.created_by
        )
    
    def revoke_invitation(self, invitation_id: str) -> bool:
        """Revoke an invitation."""
        if invitation_id in self._invitations:
            del self._invitations[invitation_id]
            return True
        return False
    
    def get_organization_invitations(self, 
                                   org_id: str, 
                                   include_expired: bool = False) -> List[OrganizationInvitation]:
        """Get all invitations for an organization."""
        invitations = [
            inv for inv in self._invitations.values()
            if inv.organization_id == org_id
        ]
        
        if not include_expired:
            invitations = [
                inv for inv in invitations
                if inv.expires_at > datetime.utcnow() and not inv.accepted_at
            ]
        
        return invitations
    
    def switch_organization_context(self, user_id: str, org_id: str) -> Optional[Dict]:
        """
        Switch user's active organization context.
        
        Args:
            user_id: User ID
            org_id: Organization ID to switch to
            
        Returns:
            Organization context dict or None if user doesn't belong to org
        """
        member = self.get_member(org_id, user_id)
        if not member:
            return None
        
        org = self.get_organization(org_id)
        if not org:
            return None
        
        return {
            'organization_id': org.id,
            'organization_name': org.name,
            'organization_slug': org.slug,
            'role': member.role.value,
            'joined_at': member.joined_at.isoformat()
        }
    
    def check_permission(self, 
                        user_id: str, 
                        org_id: str, 
                        required_role: OrganizationRole) -> bool:
        """
        Check if user has required role in organization.
        
        Uses role hierarchy: ADMIN > EDITOR > VIEWER
        """
        member = self.get_member(org_id, user_id)
        if not member:
            return False
        
        role_hierarchy = {
            OrganizationRole.VIEWER: 0,
            OrganizationRole.EDITOR: 1,
            OrganizationRole.ADMIN: 2
        }
        
        user_level = role_hierarchy.get(member.role, -1)
        required_level = role_hierarchy.get(required_role, 999)
        
        return user_level >= required_level


# Global instance for easy access
_organization_manager: Optional[OrganizationManager] = None


def get_organization_manager() -> OrganizationManager:
    """Get or create the global OrganizationManager instance."""
    global _organization_manager
    if _organization_manager is None:
        # In production, use proper storage backend
        storage_backend = os.environ.get('ORG_STORAGE_BACKEND', 'memory')
        _organization_manager = OrganizationManager(storage_backend=storage_backend)
    return _organization_manager