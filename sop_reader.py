"""
SOP (Standard Operating Procedure) file reading system for multi-agent coordination
"""
import os
import json
from typing import Dict, List, Any, Optional
from pathlib import Path
import logging
from langsmith import traceable

logger = logging.getLogger(__name__)

class SOPReader:
    """Handles reading and parsing of SOP files for agent coordination"""
    
    def __init__(self, sop_directory: str = "sop_files"):
        self.sop_directory = Path(sop_directory)
        self.sop_cache: Dict[str, Dict[str, Any]] = {}
        
        # Create SOP directory if it doesn't exist
        self.sop_directory.mkdir(exist_ok=True)
        
        # Load all SOP files on initialization
        self._load_all_sops()
    
    @traceable
    def _load_all_sops(self):
        """Load all SOP files from the directory"""
        logger.info(f"Loading SOP files from {self.sop_directory}")
        
        # Define supported file extensions
        supported_extensions = {'.json', '.txt', '.md', '.pdf'}
        
        for file_path in self.sop_directory.glob("*"):
            if file_path.suffix.lower() in supported_extensions:
                try:
                    sop_content = self._read_sop_file(file_path)
                    if sop_content:
                        self.sop_cache[file_path.stem] = sop_content
                        logger.info(f"Loaded SOP: {file_path.stem}")
                except Exception as e:
                    logger.error(f"Failed to load SOP {file_path}: {e}")
    
    @traceable
    def _read_sop_file(self, file_path: Path) -> Optional[Dict[str, Any]]:
        """Read and parse a single SOP file"""
        try:
            if file_path.suffix.lower() == '.json':
                with open(file_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            elif file_path.suffix.lower() in {'.txt', '.md'}:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    return {
                        'type': 'text',
                        'content': content,
                        'title': file_path.stem,
                        'file_path': str(file_path)
                    }
            elif file_path.suffix.lower() == '.pdf':
                # For PDF files, we'll store metadata and require external processing
                return {
                    'type': 'pdf',
                    'content': '[PDF content - requires external processing]',
                    'title': file_path.stem,
                    'file_path': str(file_path)
                }
        except Exception as e:
            logger.error(f"Error reading SOP file {file_path}: {e}")
            return None
    
    @traceable
    def get_sop(self, sop_name: str) -> Optional[Dict[str, Any]]:
        """Get a specific SOP by name"""
        return self.sop_cache.get(sop_name)
    
    @traceable
    def get_all_sops(self) -> Dict[str, Dict[str, Any]]:
        """Get all loaded SOPs"""
        return self.sop_cache.copy()
    
    @traceable
    def get_sops_by_type(self, sop_type: str) -> Dict[str, Dict[str, Any]]:
        """Get SOPs filtered by type"""
        return {
            name: sop for name, sop in self.sop_cache.items()
            if sop.get('type') == sop_type
        }
    
    @traceable
    def search_sops(self, query: str) -> List[Dict[str, Any]]:
        """Search SOPs by content or title"""
        results = []
        query_lower = query.lower()
        
        for name, sop in self.sop_cache.items():
            # Search in title
            if query_lower in sop.get('title', '').lower():
                results.append({
                    'name': name,
                    'sop': sop,
                    'match_type': 'title'
                })
            # Search in content
            elif query_lower in sop.get('content', '').lower():
                results.append({
                    'name': name,
                    'sop': sop,
                    'match_type': 'content'
                })
        
        return results
    
    @traceable
    def get_agent_specific_sop(self, agent_type: str) -> Optional[Dict[str, Any]]:
        """Get SOP specific to an agent type"""
        # Look for agent-specific SOPs
        agent_sop_name = f"{agent_type}_sop"
        return self.get_sop(agent_sop_name)
    
    @traceable
    def create_default_sops(self):
        """Create default SOP files for each agent type"""
        default_sops = {
            'code_generation_sop': {
                'type': 'agent_sop',
                'agent_type': 'code_generation',
                'title': 'Code Generation Agent SOP',
                'responsibilities': [
                    'Generate high-quality code from natural language prompts',
                    'Follow coding best practices and standards',
                    'Ensure code is well-documented and testable',
                    'Handle error cases and edge conditions'
                ],
                'protocols': {
                    'input_processing': 'Parse and validate user requirements',
                    'code_generation': 'Generate clean, efficient code',
                    'testing': 'Include unit tests where appropriate',
                    'documentation': 'Add comprehensive code comments'
                }
            },
            'deployment_sop': {
                'type': 'agent_sop',
                'agent_type': 'deployment',
                'title': 'Deployment Agent SOP',
                'responsibilities': [
                    'Handle CI/CD pipeline execution',
                    'Manage production deployments',
                    'Monitor deployment health and rollback if needed',
                    'Coordinate with infrastructure teams'
                ],
                'protocols': {
                    'pre_deployment': 'Run all tests and security checks',
                    'deployment': 'Execute deployment with monitoring',
                    'post_deployment': 'Verify deployment success and health',
                    'rollback': 'Automated rollback on failure detection'
                }
            },
            'business_intelligence_sop': {
                'type': 'agent_sop',
                'agent_type': 'business_intelligence',
                'title': 'Business Intelligence Agent SOP',
                'responsibilities': [
                    'Analyze business metrics and KPIs',
                    'Generate insights and recommendations',
                    'Create dashboards and reports',
                    'Monitor system performance and optimization'
                ],
                'protocols': {
                    'data_collection': 'Gather relevant business metrics',
                    'analysis': 'Apply statistical and ML techniques',
                    'reporting': 'Generate actionable insights',
                    'optimization': 'Recommend improvements'
                }
            },
            'customer_operations_sop': {
                'type': 'agent_sop',
                'agent_type': 'customer_operations',
                'title': 'Customer Operations Agent SOP',
                'responsibilities': [
                    'Handle customer support inquiries',
                    'Manage customer onboarding processes',
                    'Escalate complex issues to human agents',
                    'Maintain customer satisfaction metrics'
                ],
                'protocols': {
                    'inquiry_handling': 'Classify and route customer inquiries',
                    'onboarding': 'Guide new customers through setup',
                    'escalation': 'Identify when human intervention is needed',
                    'feedback': 'Collect and analyze customer feedback'
                }
            },
            'marketing_automation_sop': {
                'type': 'agent_sop',
                'agent_type': 'marketing_automation',
                'title': 'Marketing Automation Agent SOP',
                'responsibilities': [
                    'Generate marketing content and campaigns',
                    'Manage social media automation',
                    'Analyze campaign performance',
                    'Optimize marketing strategies'
                ],
                'protocols': {
                    'content_creation': 'Generate engaging marketing content',
                    'campaign_management': 'Execute multi-channel campaigns',
                    'performance_analysis': 'Track and analyze campaign metrics',
                    'optimization': 'Improve campaign effectiveness'
                }
            }
        }
        
        # Create SOP files
        for sop_name, sop_content in default_sops.items():
            file_path = self.sop_directory / f"{sop_name}.json"
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(sop_content, f, indent=2)
            logger.info(f"Created default SOP: {sop_name}")
        
        # Reload SOPs after creation
        self._load_all_sops()

# Global SOP reader instance
sop_reader = SOPReader()