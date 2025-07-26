/**
 * Agent Workflows for Project Generation
 * 12thhaus Spiritual Platform - Phase 1C Task 2
 * 
 * Comprehensive workflow system for creating tenant projects with
 * multi-agent coordination and N8N webhook integration
 */

import { MCPIntegrationConfig } from '../mcp-integration-config.js';
import { GraphQLClient } from 'graphql-request';
import { createClient } from '@supabase/supabase-js';
import EventEmitter from 'events';

// =====================================================
// PROJECT GENERATION WORKFLOW ENGINE
// =====================================================

export class ProjectGenerationWorkflow extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      // MCP Integration
      mcpConfig: config.mcpConfig || {},
      
      // N8N Webhook endpoints
      n8n: {
        baseUrl: config.n8n?.baseUrl || process.env.N8N_WEBHOOK_URL || 'http://localhost:5678',
        projectCreationWebhook: config.n8n?.projectCreationWebhook || '/webhook/project-creation',
        codeGenerationWebhook: config.n8n?.codeGenerationWebhook || '/webhook/code-generation',
        deploymentWebhook: config.n8n?.deploymentWebhook || '/webhook/deployment-setup',
        statusUpdateWebhook: config.n8n?.statusUpdateWebhook || '/webhook/status-update'
      },
      
      // Agent configuration
      agents: {
        codeGeneration: config.agents?.codeGeneration || 'code_generation_agent',
        deployment: config.agents?.deployment || 'deployment_agent',
        businessIntelligence: config.agents?.businessIntelligence || 'bi_agent',
        customerOps: config.agents?.customerOps || 'customer_ops_agent',
        marketingAutomation: config.agents?.marketingAutomation || 'marketing_agent'
      },
      
      // Workflow timeouts
      timeouts: {
        codeGeneration: config.timeouts?.codeGeneration || 600000, // 10 minutes
        deployment: config.timeouts?.deployment || 900000, // 15 minutes
        initialization: config.timeouts?.initialization || 300000, // 5 minutes
        agentResponse: config.timeouts?.agentResponse || 120000 // 2 minutes
      },
      
      // Project templates
      templates: {
        webApp: {
          defaultTechStack: {
            frontend: 'next.js',
            backend: 'node.js',
            database: 'postgresql',
            deployment: 'vercel',
            styling: 'tailwindcss'
          },
          requiredAgents: ['code_generation', 'deployment'],
          estimatedTime: 600000 // 10 minutes
        },
        mobileApp: {
          defaultTechStack: {
            framework: 'react-native',
            backend: 'node.js',
            database: 'postgresql',
            deployment: 'expo'
          },
          requiredAgents: ['code_generation', 'deployment'],
          estimatedTime: 900000 // 15 minutes
        },
        apiService: {
          defaultTechStack: {
            framework: 'express.js',
            database: 'postgresql',
            deployment: 'vercel',
            documentation: 'openapi'
          },
          requiredAgents: ['code_generation', 'deployment'],
          estimatedTime: 480000 // 8 minutes
        }
      }
    };
    
    this.mcpIntegration = null;
    this.activeWorkflows = new Map();
    this.agentStates = new Map();
    
    this.initialize();
  }

  // =====================================================
  // INITIALIZATION
  // =====================================================

  async initialize() {
    try {
      // Initialize MCP Integration
      this.mcpIntegration = new MCPIntegrationConfig(this.config.mcpConfig);
      await this.mcpIntegration.initialize();
      
      // Set up event handlers
      this.setupEventHandlers();
      
      console.log('✅ Project Generation Workflow initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Project Generation Workflow:', error);
      throw error;
    }
  }

  setupEventHandlers() {
    // Handle MCP health events
    this.mcpIntegration.eventEmitter.on('health-check', (status) => {
      this.emit('system-health', status);
    });
    
    // Handle workflow timeouts
    setInterval(() => {
      this.checkWorkflowTimeouts();
    }, 30000); // Check every 30 seconds
    
    // Cleanup completed workflows
    setInterval(() => {
      this.cleanupCompletedWorkflows();
    }, 300000); // Cleanup every 5 minutes
  }

  // =====================================================
  // MAIN WORKFLOW ORCHESTRATION
  // =====================================================

  /**
   * Start complete project generation workflow
   * @param {Object} projectRequest - Project creation request
   * @param {string} agentId - MCP Agent identifier
   * @param {string} tenantId - Tenant context
   * @param {string} userId - User who initiated the request
   */
  async createProject(projectRequest, agentId, tenantId, userId) {
    const workflowId = `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      console.log(`🚀 Starting project creation workflow: ${workflowId}`);
      
      // Initialize workflow state
      const workflowState = {
        id: workflowId,
        agentId,
        tenantId,
        userId,
        projectRequest,
        status: 'initializing',
        startedAt: new Date(),
        steps: [],
        agents: new Map(),
        project: null,
        errors: []
      };
      
      this.activeWorkflows.set(workflowId, workflowState);
      
      // Execute workflow steps
      const result = await this.executeWorkflowSteps(workflowId, workflowState);
      
      // Mark workflow as completed
      workflowState.status = 'completed';
      workflowState.completedAt = new Date();
      workflowState.result = result;
      
      this.emit('workflow-completed', {
        workflowId,
        result,
        duration: workflowState.completedAt - workflowState.startedAt
      });
      
      return result;
      
    } catch (error) {
      console.error(`❌ Workflow ${workflowId} failed:`, error);
      
      const workflowState = this.activeWorkflows.get(workflowId);
      if (workflowState) {
        workflowState.status = 'failed';
        workflowState.error = error.message;
        workflowState.completedAt = new Date();
      }
      
      this.emit('workflow-failed', {
        workflowId,
        error: error.message
      });
      
      throw error;
    }
  }

  async executeWorkflowSteps(workflowId, workflowState) {
    const { agentId, tenantId, userId, projectRequest } = workflowState;
    
    // Step 1: Create authenticated agent client
    await this.executeStep(workflowId, 'agent-setup', async () => {
      const client = await this.mcpIntegration.createAgentClient(
        agentId, 
        tenantId, 
        userId, 
        'user'
      );
      workflowState.agents.set('primary', { agentId, client });
      return { agentId, status: 'authenticated' };
    });
    
    // Step 2: Create project record in database
    const project = await this.executeStep(workflowId, 'project-creation', async () => {
      const projectData = this.prepareProjectData(projectRequest, tenantId, userId);
      const result = await this.mcpIntegration.createProject(agentId, projectData);
      workflowState.project = result.insert_projects_one;
      return result.insert_projects_one;
    });
    
    // Step 3: Initialize required agents for project type
    await this.executeStep(workflowId, 'agent-initialization', async () => {
      const template = this.config.templates[projectRequest.project_type] || this.config.templates.webApp;
      const requiredAgents = template.requiredAgents;
      
      const agentInitResults = [];
      for (const agentType of requiredAgents) {
        const agentResult = await this.initializeProjectAgent(
          workflowId,
          agentType,
          project.id,
          tenantId,
          userId,
          projectRequest
        );
        agentInitResults.push(agentResult);
      }
      
      return { agents: agentInitResults };
    });
    
    // Step 4: Trigger N8N code generation workflow
    await this.executeStep(workflowId, 'code-generation-trigger', async () => {
      const webhookPayload = {
        workflowId,
        projectId: project.id,
        tenantId,
        userId,
        projectData: projectRequest,
        agentId,
        timestamp: new Date().toISOString()
      };
      
      const webhookResult = await this.triggerN8NWebhook(
        this.config.n8n.codeGenerationWebhook,
        webhookPayload
      );
      
      return { webhookTriggered: true, n8nResponse: webhookResult };
    });
    
    // Step 5: Monitor code generation progress
    const codeGenResult = await this.executeStep(workflowId, 'code-generation-monitor', async () => {
      return await this.monitorCodeGeneration(workflowId, project.id, agentId);
    });
    
    // Step 6: Trigger deployment setup if code generation successful
    let deploymentResult = null;
    if (codeGenResult.status === 'success') {
      deploymentResult = await this.executeStep(workflowId, 'deployment-setup', async () => {
        const deploymentPayload = {
          workflowId,
          projectId: project.id,
          tenantId,
          userId,
          repositoryUrl: codeGenResult.repositoryUrl,
          techStack: projectRequest.tech_stack,
          agentId,
          timestamp: new Date().toISOString()
        };
        
        const webhookResult = await this.triggerN8NWebhook(
          this.config.n8n.deploymentWebhook,
          deploymentPayload
        );
        
        return await this.monitorDeployment(workflowId, project.id, agentId);
      });
    }
    
    // Step 7: Update project status and metadata
    await this.executeStep(workflowId, 'project-finalization', async () => {
      const finalStatus = deploymentResult?.status === 'success' ? 'ready' : 'code-generated';
      const metadata = {
        workflow_id: workflowId,
        code_generation: codeGenResult,
        deployment: deploymentResult,
        agents_used: Array.from(workflowState.agents.keys()),
        completion_timestamp: new Date().toISOString()
      };
      
      return await this.mcpIntegration.updateProjectStatus(
        agentId, 
        project.id, 
        finalStatus, 
        metadata
      );
    });
    
    // Step 8: Log workflow completion
    await this.executeStep(workflowId, 'workflow-logging', async () => {
      await this.logWorkflowCompletion(workflowId, workflowState);
      return { logged: true };
    });
    
    return {
      workflowId,
      project,
      codeGeneration: codeGenResult,
      deployment: deploymentResult,
      status: 'completed',
      duration: Date.now() - workflowState.startedAt.getTime()
    };
  }

  // =====================================================
  // WORKFLOW STEP EXECUTION
  // =====================================================

  async executeStep(workflowId, stepName, stepFunction) {
    const workflowState = this.activeWorkflows.get(workflowId);
    if (!workflowState) {
      throw new Error(`Workflow ${workflowId} not found`);
    }
    
    const step = {
      name: stepName,
      status: 'running',
      startedAt: new Date(),
      result: null,
      error: null
    };
    
    workflowState.steps.push(step);
    
    try {
      console.log(`📋 Executing step: ${stepName} for workflow ${workflowId}`);
      
      const result = await stepFunction();
      
      step.status = 'completed';
      step.completedAt = new Date();
      step.result = result;
      step.duration = step.completedAt - step.startedAt;
      
      this.emit('step-completed', {
        workflowId,
        stepName,
        result,
        duration: step.duration
      });
      
      return result;
      
    } catch (error) {
      step.status = 'failed';
      step.error = error.message;
      step.completedAt = new Date();
      
      workflowState.errors.push({
        step: stepName,
        error: error.message,
        timestamp: new Date()
      });
      
      this.emit('step-failed', {
        workflowId,
        stepName,
        error: error.message
      });
      
      throw error;
    }
  }

  // =====================================================
  // PROJECT AGENT MANAGEMENT
  // =====================================================

  async initializeProjectAgent(workflowId, agentType, projectId, tenantId, userId, projectRequest) {
    try {
      const agentId = `${agentType}-${projectId}-${Date.now()}`;
      
      // Register agent in database
      const agentRegistration = await this.mcpIntegration.registerAgent(
        agentId,
        tenantId,
        agentType,
        {
          project_id: projectId,
          workflow_id: workflowId,
          project_type: projectRequest.project_type,
          tech_stack: projectRequest.tech_stack,
          initialization_timestamp: new Date().toISOString()
        }
      );
      
      // Create authenticated client for agent
      const agentClient = await this.mcpIntegration.createAgentClient(
        agentId,
        tenantId,
        userId,
        'user'
      );
      
      // Store agent state
      const workflowState = this.activeWorkflows.get(workflowId);
      workflowState.agents.set(agentType, {
        agentId,
        client: agentClient,
        type: agentType,
        projectId,
        status: 'initialized',
        registeredAt: new Date()
      });
      
      console.log(`🤖 Initialized ${agentType} agent: ${agentId}`);
      
      return {
        agentId,
        agentType,
        status: 'initialized',
        capabilities: this.mcpIntegration.getAgentCapabilities(agentType)
      };
      
    } catch (error) {
      console.error(`❌ Failed to initialize ${agentType} agent:`, error);
      throw error;
    }
  }

  // =====================================================
  // N8N WEBHOOK INTEGRATION
  // =====================================================

  async triggerN8NWebhook(webhookPath, payload) {
    try {
      const webhookUrl = `${this.config.n8n.baseUrl}${webhookPath}`;
      
      console.log(`📡 Triggering N8N webhook: ${webhookUrl}`);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Source': 'langgraph-mcp-integration',
          'X-Workflow-ID': payload.workflowId
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`N8N webhook failed: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      console.log(`✅ N8N webhook triggered successfully: ${webhookUrl}`);
      
      return result;
      
    } catch (error) {
      console.error(`❌ Failed to trigger N8N webhook ${webhookPath}:`, error);
      throw error;
    }
  }

  // =====================================================
  // CODE GENERATION MONITORING
  // =====================================================

  async monitorCodeGeneration(workflowId, projectId, agentId) {
    console.log(`👀 Monitoring code generation for project ${projectId}`);
    
    const startTime = Date.now();
    const timeout = this.config.timeouts.codeGeneration;
    const pollInterval = 10000; // Poll every 10 seconds
    
    return new Promise((resolve, reject) => {
      const monitor = setInterval(async () => {
        try {
          // Check if timeout exceeded
          if (Date.now() - startTime > timeout) {
            clearInterval(monitor);
            reject(new Error(`Code generation timeout exceeded for project ${projectId}`));
            return;
          }
          
          // Query project status via GraphQL
          const statusQuery = `
            query GetProjectStatus($projectId: uuid!) {
              projects_by_pk(id: $projectId) {
                id
                status
                repository_url
                metadata
                updated_at
                workflows {
                  workflow_executions(
                    where: { status: { _in: ["running", "success", "error"] } }
                    order_by: { started_at: desc }
                    limit: 1
                  ) {
                    id
                    status
                    output_data
                    error_message
                  }
                }
              }
            }
          `;
          
          const result = await this.mcpIntegration.executeAgentOperation(
            agentId,
            statusQuery,
            { projectId }
          );
          
          const project = result.projects_by_pk;
          if (!project) {
            clearInterval(monitor);
            reject(new Error(`Project ${projectId} not found during monitoring`));
            return;
          }
          
          // Check for completion
          const latestExecution = project.workflows[0]?.workflow_executions[0];
          if (latestExecution) {
            if (latestExecution.status === 'success') {
              clearInterval(monitor);
              resolve({
                status: 'success',
                projectId,
                repositoryUrl: project.repository_url,
                executionId: latestExecution.id,
                output: latestExecution.output_data,
                duration: Date.now() - startTime
              });
              return;
            } else if (latestExecution.status === 'error') {
              clearInterval(monitor);
              reject(new Error(`Code generation failed: ${latestExecution.error_message}`));
              return;
            }
          }
          
          // Log progress
          console.log(`⏳ Code generation in progress for project ${projectId}...`);
          
        } catch (error) {
          clearInterval(monitor);
          reject(error);
        }
      }, pollInterval);
    });
  }

  // =====================================================
  // DEPLOYMENT MONITORING
  // =====================================================

  async monitorDeployment(workflowId, projectId, agentId) {
    console.log(`🚀 Monitoring deployment for project ${projectId}`);
    
    const startTime = Date.now();
    const timeout = this.config.timeouts.deployment;
    const pollInterval = 15000; // Poll every 15 seconds
    
    return new Promise((resolve, reject) => {
      const monitor = setInterval(async () => {
        try {
          // Check if timeout exceeded
          if (Date.now() - startTime > timeout) {
            clearInterval(monitor);
            reject(new Error(`Deployment timeout exceeded for project ${projectId}`));
            return;
          }
          
          // Query deployment status
          const statusQuery = `
            query GetDeploymentStatus($projectId: uuid!) {
              projects_by_pk(id: $projectId) {
                id
                status
                deployment_url
                vercel_project_id
                metadata
                updated_at
              }
            }
          `;
          
          const result = await this.mcpIntegration.executeAgentOperation(
            agentId,
            statusQuery,
            { projectId }
          );
          
          const project = result.projects_by_pk;
          if (!project) {
            clearInterval(monitor);
            reject(new Error(`Project ${projectId} not found during deployment monitoring`));
            return;
          }
          
          // Check for deployment completion
          if (project.deployment_url && project.status === 'ready') {
            clearInterval(monitor);
            resolve({
              status: 'success',
              projectId,
              deploymentUrl: project.deployment_url,
              vercelProjectId: project.vercel_project_id,
              duration: Date.now() - startTime
            });
            return;
          } else if (project.status === 'error') {
            clearInterval(monitor);
            reject(new Error(`Deployment failed for project ${projectId}`));
            return;
          }
          
          // Log progress
          console.log(`⏳ Deployment in progress for project ${projectId}...`);
          
        } catch (error) {
          clearInterval(monitor);
          reject(error);
        }
      }, pollInterval);
    });
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  prepareProjectData(projectRequest, tenantId, userId) {
    const template = this.config.templates[projectRequest.project_type] || this.config.templates.webApp;
    
    return {
      name: projectRequest.name,
      description: projectRequest.description,
      project_type: projectRequest.project_type,
      prd_content: projectRequest.prd_content,
      tech_stack: {
        ...template.defaultTechStack,
        ...(projectRequest.tech_stack || {})
      },
      settings: {
        auto_deployment: projectRequest.auto_deployment !== false,
        public_repository: projectRequest.public_repository === true,
        environment: projectRequest.environment || 'development',
        ...projectRequest.settings
      },
      metadata: {
        template_used: template,
        estimated_completion_time: template.estimatedTime,
        created_via: 'mcp-agent-workflow',
        workflow_version: '1.0.0',
        tenant_id: tenantId,
        user_id: userId
      }
    };
  }

  async logWorkflowCompletion(workflowId, workflowState) {
    try {
      const completionLog = {
        workflow_id: workflowId,
        tenant_id: workflowState.tenantId,
        user_id: workflowState.userId,
        project_id: workflowState.project?.id,
        status: workflowState.status,
        duration_ms: workflowState.completedAt - workflowState.startedAt,
        steps_completed: workflowState.steps.filter(s => s.status === 'completed').length,
        total_steps: workflowState.steps.length,
        agents_used: Array.from(workflowState.agents.keys()),
        errors: workflowState.errors,
        metadata: {
          project_request: workflowState.projectRequest,
          workflow_steps: workflowState.steps,
          completion_timestamp: new Date().toISOString()
        }
      };
      
      // Log to usage metrics table
      const logMutation = `
        mutation LogWorkflowCompletion($input: usage_metrics_insert_input!) {
          insert_usage_metrics_one(object: $input) {
            id
          }
        }
      `;
      
      await this.mcpIntegration.executeAgentOperation(
        workflowState.agentId,
        logMutation,
        {
          input: {
            tenant_id: workflowState.tenantId,
            user_id: workflowState.userId,
            metric_type: 'workflow_completion',
            metric_name: 'project_generation_workflow',
            value: completionLog.duration_ms,
            dimensions: completionLog,
            timestamp: new Date().toISOString(),
            date: new Date().toISOString().split('T')[0]
          }
        }
      );
      
      console.log(`📊 Workflow completion logged: ${workflowId}`);
      
    } catch (error) {
      console.error(`❌ Failed to log workflow completion for ${workflowId}:`, error);
    }
  }

  checkWorkflowTimeouts() {
    for (const [workflowId, workflowState] of this.activeWorkflows.entries()) {
      if (workflowState.status === 'running') {
        const runtime = Date.now() - workflowState.startedAt.getTime();
        const maxRuntime = this.config.timeouts.initialization + 
                          this.config.timeouts.codeGeneration + 
                          this.config.timeouts.deployment;
        
        if (runtime > maxRuntime) {
          console.warn(`⚠️ Workflow ${workflowId} has exceeded maximum runtime`);
          workflowState.status = 'timeout';
          workflowState.error = 'Maximum workflow runtime exceeded';
          
          this.emit('workflow-timeout', { workflowId, runtime });
        }
      }
    }
  }

  cleanupCompletedWorkflows() {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    
    for (const [workflowId, workflowState] of this.activeWorkflows.entries()) {
      if (['completed', 'failed', 'timeout'].includes(workflowState.status) &&
          workflowState.completedAt &&
          workflowState.completedAt.getTime() < cutoffTime) {
        
        console.log(`🧹 Cleaning up completed workflow: ${workflowId}`);
        this.activeWorkflows.delete(workflowId);
      }
    }
  }

  // =====================================================
  // PUBLIC API METHODS
  // =====================================================

  /**
   * Get workflow status
   */
  getWorkflowStatus(workflowId) {
    return this.activeWorkflows.get(workflowId);
  }

  /**
   * List all active workflows
   */
  getActiveWorkflows() {
    return Array.from(this.activeWorkflows.entries()).map(([id, state]) => ({
      workflowId: id,
      status: state.status,
      startedAt: state.startedAt,
      projectId: state.project?.id,
      tenantId: state.tenantId,
      currentStep: state.steps[state.steps.length - 1]?.name
    }));
  }

  /**
   * Cancel active workflow
   */
  async cancelWorkflow(workflowId) {
    const workflowState = this.activeWorkflows.get(workflowId);
    if (!workflowState) {
      throw new Error(`Workflow ${workflowId} not found`);
    }
    
    workflowState.status = 'cancelled';
    workflowState.completedAt = new Date();
    
    this.emit('workflow-cancelled', { workflowId });
    
    return { workflowId, status: 'cancelled' };
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log('🛑 Shutting down Project Generation Workflow...');
    
    // Cancel all active workflows
    for (const workflowId of this.activeWorkflows.keys()) {
      await this.cancelWorkflow(workflowId);
    }
    
    // Shutdown MCP integration
    if (this.mcpIntegration) {
      await this.mcpIntegration.shutdown();
    }
    
    console.log('✅ Project Generation Workflow shutdown complete');
  }
}

// =====================================================
// WORKFLOW FACTORY FUNCTIONS
// =====================================================

/**
 * Create project generation workflow instance
 */
export function createProjectWorkflow(config = {}) {
  return new ProjectGenerationWorkflow(config);
}

/**
 * Quick start project creation
 */
export async function quickCreateProject(projectRequest, agentConfig = {}) {
  const workflow = new ProjectGenerationWorkflow(agentConfig);
  
  const agentId = `quick-agent-${Date.now()}`;
  const tenantId = projectRequest.tenant_id;
  const userId = projectRequest.user_id;
  
  return await workflow.createProject(projectRequest, agentId, tenantId, userId);
}

// =====================================================
// EXPORT DEFAULT
// =====================================================

export default ProjectGenerationWorkflow;