#!/usr/bin/env python3
"""
Project Creation Script for 12thhaus Spiritual Platform

This script generates complete AI-powered applications from Product Requirements Documents (PRDs).
It combines 12thhaus multi-agent coordination, n8n automation workflows, 
and full deployment pipelines.
"""

import os
import sys
import json
import argparse
import asyncio
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict

# Add current directory to Python path
sys.path.append(str(Path(__file__).parent))

from master_agent import MasterAgent
from specialist_agents import (
    CodeGenerationAgent,
    DeploymentAgent, 
    BusinessIntelligenceAgent,
    CustomerOperationsAgent,
    MarketingAutomationAgent
)

@dataclass
class ProjectConfig:
    """Configuration for a new project."""
    name: str
    description: str
    project_type: str
    prd_path: Optional[str] = None
    output_dir: str = "./output"
    agents: List[str] = None
    workflows: List[str] = None
    stack: Dict[str, str] = None
    deployment_target: str = "vercel"
    database: str = "supabase"
    auth: str = "clerk"
    
    def __post_init__(self):
        if self.agents is None:
            self.agents = ["code_generation", "deployment", "business_intelligence"]
        if self.workflows is None:
            self.workflows = ["development_workflow", "deployment_workflow"]
        if self.stack is None:
            self.stack = {
                "frontend": "next.js",
                "backend": "supabase",
                "database": "postgresql",
                "auth": "clerk",
                "deployment": "vercel",
                "api_layer": "hasura",
                "storage": "cloudinary",
                "automation": "n8n"
            }

class ProjectCreator:
    """Creates new projects using the multi-agent system."""
    
    def __init__(self):
        self.master_agent = MasterAgent()
        self.agents = {
            "code_generation": CodeGenerationAgent(),
            "deployment": DeploymentAgent(),
            "business_intelligence": BusinessIntelligenceAgent(),
            "customer_operations": CustomerOperationsAgent(),
            "marketing_automation": MarketingAutomationAgent()
        }
        
    async def create_project(self, config: ProjectConfig) -> Dict[str, Any]:
        """Create a new project based on the configuration."""
        print(f"🚀 Creating project: {config.name}")
        print(f"📝 Type: {config.project_type}")
        print(f"📂 Output: {config.output_dir}")
        
        # Create output directory
        project_path = Path(config.output_dir) / self._sanitize_name(config.name)
        project_path.mkdir(parents=True, exist_ok=True)
        
        # Save project metadata
        metadata = {
            "name": config.name,
            "description": config.description,
            "type": config.project_type,
            "created_at": datetime.now().isoformat(),
            "stack": config.stack,
            "agents_used": config.agents,
            "workflows": config.workflows,
            "status": "initializing"
        }
        
        # Step 1: Analyze PRD if provided
        if config.prd_path:
            prd_analysis = await self._analyze_prd(config.prd_path)
            metadata["prd_analysis"] = prd_analysis
        
        # Step 2: Generate project structure
        structure = await self._generate_project_structure(config, metadata)
        
        # Step 3: Execute multi-agent workflow
        workflow_result = await self._execute_workflow(config, metadata, project_path)
        
        # Step 4: Setup deployment pipeline
        deployment_config = await self._setup_deployment(config, project_path)
        
        # Step 5: Generate documentation
        docs = await self._generate_documentation(config, metadata, workflow_result)
        
        # Save final metadata
        metadata.update({
            "structure": structure,
            "workflow_result": workflow_result,
            "deployment_config": deployment_config,
            "documentation": docs,
            "status": "completed",
            "completed_at": datetime.now().isoformat()
        })
        
        # Write project metadata
        with open(project_path / "project.json", "w") as f:
            json.dump(metadata, f, indent=2)
            
        # Create setup script
        await self._create_setup_script(project_path, config)
        
        print(f"✅ Project '{config.name}' created successfully!")
        print(f"📁 Location: {project_path}")
        print(f"🛠️  To get started:")
        print(f"   cd {project_path}")
        print(f"   ./setup.sh")
        print(f"   npm run dev")
        
        return metadata
    
    async def _analyze_prd(self, prd_path: str) -> Dict[str, Any]:
        """Analyze Product Requirements Document."""
        print("📋 Analyzing PRD...")
        
        with open(prd_path, 'r') as f:
            prd_content = f.read()
        
        # Use Business Intelligence agent to analyze PRD
        analysis_task = {
            "type": "prd_analysis",
            "content": prd_content,
            "requirements": [
                "Extract key features",
                "Identify technical requirements", 
                "Suggest tech stack",
                "Estimate complexity"
            ]
        }
        
        result = await self.agents["business_intelligence"].process(analysis_task)
        return result
    
    async def _generate_project_structure(self, config: ProjectConfig, metadata: Dict) -> Dict[str, Any]:
        """Generate the basic project structure."""
        print("🏗️  Generating project structure...")
        
        structure = {
            "frontend": {
                "framework": config.stack["frontend"],
                "pages": ["index", "dashboard", "settings"],
                "components": ["layout", "navigation", "forms"],
                "styles": ["globals.css", "components.css"]
            },
            "backend": {
                "database": config.stack["database"],
                "api": config.stack["api_layer"],
                "auth": config.stack["auth"],
                "functions": ["user-management", "data-processing"]
            },
            "infrastructure": {
                "deployment": config.stack["deployment"],
                "storage": config.stack["storage"],
                "automation": config.stack["automation"]
            }
        }
        
        return structure
    
    async def _execute_workflow(self, config: ProjectConfig, metadata: Dict, project_path: Path) -> Dict[str, Any]:
        """Execute the multi-agent workflow to generate the project."""
        print("🤖 Executing multi-agent workflow...")
        
        # Prepare workflow task
        workflow_task = {
            "type": "project_generation",
            "config": asdict(config),
            "metadata": metadata,
            "output_path": str(project_path)
        }
        
        # Route task through master agent
        result = await self.master_agent.route_task(workflow_task)
        
        return result
    
    async def _setup_deployment(self, config: ProjectConfig, project_path: Path) -> Dict[str, Any]:
        """Setup deployment configuration."""
        print("🚀 Setting up deployment pipeline...")
        
        deployment_task = {
            "type": "deployment_setup",
            "target": config.deployment_target,
            "project_path": str(project_path),
            "config": asdict(config)
        }
        
        result = await self.agents["deployment"].process(deployment_task)
        
        # Create deployment files
        deployment_files = {
            "vercel.json": {
                "version": 2,
                "builds": [{"src": "package.json", "use": "@vercel/node"}],
                "routes": [{"src": "/(.*)", "dest": "/"}]
            },
            ".github/workflows/deploy.yml": self._generate_github_actions(config)
        }
        
        for file_path, content in deployment_files.items():
            file_full_path = project_path / file_path
            file_full_path.parent.mkdir(parents=True, exist_ok=True)
            
            if isinstance(content, dict):
                with open(file_full_path, 'w') as f:
                    json.dump(content, f, indent=2)
            else:
                with open(file_full_path, 'w') as f:
                    f.write(content)
        
        return result
    
    async def _generate_documentation(self, config: ProjectConfig, metadata: Dict, workflow_result: Dict) -> Dict[str, Any]:
        """Generate project documentation."""
        print("📚 Generating documentation...")
        
        docs_task = {
            "type": "documentation_generation",
            "project_config": asdict(config),
            "metadata": metadata,
            "workflow_result": workflow_result
        }
        
        # This would typically use a content generation agent
        docs = {
            "readme": f"# {config.name}\n\n{config.description}\n\n## Quick Start\n\n1. Install dependencies: `npm install`\n2. Set up environment: `cp .env.example .env`\n3. Start development: `npm run dev`",
            "api_docs": "API documentation generated",
            "deployment_guide": "Deployment guide generated"
        }
        
        return docs
    
    async def _create_setup_script(self, project_path: Path, config: ProjectConfig):
        """Create setup script for the project."""
        setup_script = f"""#!/bin/bash
# Setup script for {config.name}

echo "🚀 Setting up {config.name}..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file
if [ ! -f .env ]; then
    echo "🔧 Creating environment file..."
    cp .env.example .env
    echo "⚠️  Please update .env with your API keys"
fi

# Setup database
echo "🗄️  Setting up database..."
# Add database setup commands here

# Run initial build
echo "🏗️  Building project..."
npm run build

echo "✅ Setup complete!"
echo "🎯 Next steps:"
echo "   1. Update your .env file with API keys"
echo "   2. Run 'npm run dev' to start development"
echo "   3. Visit http://localhost:3000"
"""

        setup_path = project_path / "setup.sh"
        with open(setup_path, 'w') as f:
            f.write(setup_script)
        
        # Make executable
        setup_path.chmod(0o755)
    
    def _generate_github_actions(self, config: ProjectConfig) -> str:
        """Generate GitHub Actions workflow."""
        return f"""name: Deploy to {config.deployment_target.title()}

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    - run: npm ci
    - run: npm run test
    
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v3
    - name: Deploy to {config.deployment_target.title()}
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{{{ secrets.VERCEL_TOKEN }}}}
        vercel-org-id: ${{{{ secrets.VERCEL_ORG_ID }}}}
        vercel-project-id: ${{{{ secrets.VERCEL_PROJECT_ID }}}}
        vercel-args: '--prod'
"""
    
    def _sanitize_name(self, name: str) -> str:
        """Sanitize project name for filesystem."""
        return "".join(c.lower() if c.isalnum() else '-' for c in name).strip('-')

async def main():
    """Main function."""
    parser = argparse.ArgumentParser(description="Create a new 12thhaus multi-agent project")
    parser.add_argument("--name", required=True, help="Project name")
    parser.add_argument("--description", default="", help="Project description")
    parser.add_argument("--type", default="web-app", choices=["web-app", "api", "saas", "dashboard"], help="Project type")
    parser.add_argument("--prd", help="Path to Product Requirements Document")
    parser.add_argument("--output", default="./output", help="Output directory")
    
    args = parser.parse_args()
    
    # Create project configuration
    config = ProjectConfig(
        name=args.name,
        description=args.description,
        project_type=args.type,
        prd_path=args.prd,
        output_dir=args.output
    )
    
    # Create project
    creator = ProjectCreator()
    result = await creator.create_project(config)
    
    print(f"\n🎉 Project creation completed!")
    print(f"📊 Summary: {len(result.get('workflow_result', {}))} components generated")

if __name__ == "__main__":
    asyncio.run(main())
