/**
 * MCP Bridge Integration with Supabase/Hasura
 * LangGraph Multi-Agent Platform - Phase 1C
 * 
 * Connects MCP agents to the multi-tenant GraphQL infrastructure
 * with proper authentication and tenant context
 */

import { GraphQLClient } from 'graphql-request';
import { WebSocketClient } from 'graphql-ws';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import EventEmitter from 'events';

// =====================================================
// MCP INTEGRATION CONFIGURATION
// =====================================================

export class MCPIntegrationConfig {
  constructor(config = {}) {
    this.config = {
      // Hasura GraphQL configuration
      hasura: {
        endpoint: config.hasura?.endpoint || process.env.HASURA_GRAPHQL_ENDPOINT || 'http://localhost:8080/v1/graphql',
        adminSecret: config.hasura?.adminSecret || process.env.HASURA_GRAPHQL_ADMIN_SECRET,
        websocketEndpoint: config.hasura?.websocketEndpoint || 'ws://localhost:8080/v1/graphql',
        timeout: config.hasura?.timeout || 30000,
        retries: config.hasura?.retries || 3
      },
      
      // Supabase configuration  
      supabase: {
        url: config.supabase?.url || process.env.SUPABASE_PROJECT_URL,
        anonKey: config.supabase?.anonKey || process.env.SUPABASE_ANON_KEY,
        serviceRoleKey: config.supabase?.serviceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY
      },
      
      // JWT configuration for agent authentication
      jwt: {
        secret: config.jwt?.secret || process.env.HASURA_GRAPHQL_JWT_SECRET?.replace(/^{"type":"HS256","key":"([^"]+)"}$/, '$1'),
        algorithm: config.jwt?.algorithm || 'HS256',
        expiresIn: config.jwt?.expiresIn || '24h',
        issuer: config.jwt?.issuer || 'langgraph-platform',
        audience: config.jwt?.audience || 'mcp-agents'
      },
      
      // MCP agent configuration
      agents: {
        timeout: config.agents?.timeout || 60000,
        maxConcurrency: config.agents?.maxConcurrency || 10,
        retryAttempts: config.agents?.retryAttempts || 3,
        healthCheckInterval: config.agents?.healthCheckInterval || 30000
      },
      
      // Monitoring and logging
      monitoring: {
        enabled: config.monitoring?.enabled !== false,
        logLevel: config.monitoring?.logLevel || 'info',
        metricsEndpoint: config.monitoring?.metricsEndpoint || '/metrics',
        enableTracing: config.monitoring?.enableTracing !== false
      }
    };
    
    this.clients = new Map();
    this.subscriptions = new Map();
    this.eventEmitter = new EventEmitter();
    this.agentContexts = new Map();
    
    this.initialize();
  }

  // =====================================================
  // INITIALIZATION
  // =====================================================

  async initialize() {
    try {
      // Initialize GraphQL clients
      await this.initializeGraphQLClients();
      
      // Initialize Supabase clients
      await this.initializeSupabaseClients();
      
      // Set up event handlers
      this.setupEventHandlers();
      
      // Start health monitoring
      if (this.config.monitoring.enabled) {
        this.startHealthMonitoring();
      }
      
      console.log('✅ MCP Integration initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize MCP Integration:', error);
      throw error;
    }
  }

  async initializeGraphQLClients() {
    // Admin client for system operations
    this.clients.set('admin', new GraphQLClient(this.config.hasura.endpoint, {
      headers: {
        'X-Hasura-Admin-Secret': this.config.hasura.adminSecret,
        'Content-Type': 'application/json'
      },
      timeout: this.config.hasura.timeout
    }));
    
    // WebSocket client for subscriptions
    this.clients.set('websocket', new WebSocketClient({
      url: this.config.hasura.websocketEndpoint,
      connectionParams: {
        headers: {
          'X-Hasura-Admin-Secret': this.config.hasura.adminSecret
        }
      }
    }));
  }

  async initializeSupabaseClients() {
    // Admin client with service role key
    this.clients.set('supabase-admin', createClient(
      this.config.supabase.url,
      this.config.supabase.serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    ));
    
    // Regular client with anon key
    this.clients.set('supabase', createClient(
      this.config.supabase.url,
      this.config.supabase.anonKey
    ));
  }

  // =====================================================
  // AGENT AUTHENTICATION & CONTEXT
  // =====================================================

  /**
   * Create authenticated GraphQL client for MCP agent
   * @param {string} agentId - Unique agent identifier
   * @param {string} tenantId - Tenant context
   * @param {string} userId - User context (optional)
   * @param {string} role - Agent role (admin, tenant_admin, user)
   */
  async createAgentClient(agentId, tenantId, userId = null, role = 'user') {
    try {
      // Generate JWT token for agent
      const agentToken = this.generateAgentJWT(agentId, tenantId, userId, role);
      
      // Create authenticated GraphQL client
      const client = new GraphQLClient(this.config.hasura.endpoint, {
        headers: {
          'Authorization': `Bearer ${agentToken}`,
          'Content-Type': 'application/json',
          'X-MCP-Agent-ID': agentId,
          'X-MCP-Agent-Type': 'langgraph-agent'
        },
        timeout: this.config.hasura.timeout
      });
      
      // Store agent context
      this.agentContexts.set(agentId, {
        tenantId,
        userId,
        role,
        client,
        token: agentToken,
        createdAt: new Date(),
        lastActive: new Date()
      });
      
      // Store client reference
      this.clients.set(`agent-${agentId}`, client);
      
      console.log(`🤖 Created authenticated client for agent ${agentId} in tenant ${tenantId}`);
      return client;
      
    } catch (error) {
      console.error(`❌ Failed to create agent client for ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Generate JWT token for MCP agent authentication
   */
  generateAgentJWT(agentId, tenantId, userId, role) {
    const payload = {
      sub: userId || `agent-${agentId}`,
      agent_id: agentId,
      tenant_id: tenantId,
      tenant_ids: [tenantId],
      role: role,
      iss: this.config.jwt.issuer,
      aud: this.config.jwt.audience,
      'https://hasura.io/jwt/claims': {
        'x-hasura-allowed-roles': this.getRoleHierarchy(role),
        'x-hasura-default-role': role,
        'x-hasura-user-id': userId || `agent-${agentId}`,
        'x-hasura-tenant-id': tenantId,
        'x-hasura-tenant-ids': [tenantId],
        'x-hasura-agent-id': agentId
      }
    };

    return jwt.sign(payload, this.config.jwt.secret, {
      algorithm: this.config.jwt.algorithm,
      expiresIn: this.config.jwt.expiresIn
    });
  }

  getRoleHierarchy(role) {
    const hierarchies = {
      'admin': ['admin', 'tenant_admin', 'user'],
      'tenant_admin': ['tenant_admin', 'user'],
      'user': ['user'],
      'agent': ['user'] // Agents get user-level permissions by default
    };
    return hierarchies[role] || ['user'];
  }

  // =====================================================
  // AGENT OPERATIONS
  // =====================================================

  /**
   * Execute GraphQL operation with agent context
   */
  async executeAgentOperation(agentId, operation, variables = {}) {
    try {
      const context = this.agentContexts.get(agentId);
      if (!context) {
        throw new Error(`Agent context not found for ${agentId}`);
      }

      // Update last active timestamp
      context.lastActive = new Date();

      // Execute operation
      const startTime = Date.now();
      const result = await context.client.request(operation, variables);
      const duration = Date.now() - startTime;

      // Log operation for monitoring
      await this.logAgentOperation(agentId, {
        operation: operation.substring(0, 100) + '...',
        variables,
        duration,
        success: true,
        timestamp: new Date()
      });

      return result;

    } catch (error) {
      // Log error
      await this.logAgentOperation(agentId, {
        operation: operation.substring(0, 100) + '...',
        variables,
        error: error.message,
        success: false,
        timestamp: new Date()
      });

      throw error;
    }
  }

  /**
   * Create agent subscription with tenant context
   */
  async createAgentSubscription(agentId, subscription, variables = {}, onData, onError) {
    try {
      const context = this.agentContexts.get(agentId);
      if (!context) {
        throw new Error(`Agent context not found for ${agentId}`);
      }

      const wsClient = this.clients.get('websocket');
      const subscriptionId = `${agentId}-${Date.now()}`;

      const unsubscribe = wsClient.subscribe(
        {
          query: subscription,
          variables
        },
        {
          next: (data) => {
            context.lastActive = new Date();
            onData(data);
          },
          error: (error) => {
            console.error(`Subscription error for agent ${agentId}:`, error);
            if (onError) onError(error);
          },
          complete: () => {
            console.log(`Subscription completed for agent ${agentId}`);
            this.subscriptions.delete(subscriptionId);
          }
        }
      );

      this.subscriptions.set(subscriptionId, {
        agentId,
        unsubscribe,
        createdAt: new Date()
      });

      return subscriptionId;

    } catch (error) {
      console.error(`Failed to create subscription for agent ${agentId}:`, error);
      throw error;
    }
  }

  // =====================================================
  // PROJECT OPERATIONS
  // =====================================================

  /**
   * Create new project through agent
   */
  async createProject(agentId, projectData) {
    const mutation = `
      mutation CreateProject($input: projects_insert_input!) {
        insert_projects_one(object: $input) {
          id
          name
          description
          project_type
          tenant_id
          created_by
          status
          created_at
          tech_stack
          metadata
        }
      }
    `;

    return await this.executeAgentOperation(agentId, mutation, {
      input: {
        name: projectData.name,
        description: projectData.description,
        project_type: projectData.project_type || 'web-app',
        prd_content: projectData.prd_content,
        tech_stack: projectData.tech_stack || {},
        settings: projectData.settings || {},
        metadata: {
          ...projectData.metadata,
          created_by_agent: agentId,
          generation_timestamp: new Date().toISOString()
        }
      }
    });
  }

  /**
   * Update project status through agent
   */
  async updateProjectStatus(agentId, projectId, status, metadata = {}) {
    const mutation = `
      mutation UpdateProjectStatus($id: uuid!, $status: String!, $metadata: jsonb) {
        update_projects_by_pk(
          pk_columns: { id: $id }
          _set: { 
            status: $status
            metadata: $metadata
            updated_at: "now()"
          }
        ) {
          id
          name
          status
          updated_at
        }
      }
    `;

    return await this.executeAgentOperation(agentId, mutation, {
      id: projectId,
      status,
      metadata: {
        ...metadata,
        last_updated_by_agent: agentId,
        status_change_timestamp: new Date().toISOString()
      }
    });
  }

  // =====================================================
  // WORKFLOW OPERATIONS
  // =====================================================

  /**
   * Create workflow execution record
   */
  async createWorkflowExecution(agentId, workflowId, inputData) {
    const mutation = `
      mutation CreateWorkflowExecution($input: workflow_executions_insert_input!) {
        insert_workflow_executions_one(object: $input) {
          id
          workflow_id
          status
          started_at
          input_data
          n8n_execution_id
        }
      }
    `;

    return await this.executeAgentOperation(agentId, mutation, {
      input: {
        workflow_id: workflowId,
        input_data: inputData,
        status: 'running',
        started_at: new Date().toISOString(),
        triggered_by: this.agentContexts.get(agentId)?.userId,
        metadata: {
          triggered_by_agent: agentId
        }
      }
    });
  }

  /**
   * Update workflow execution status
   */
  async updateWorkflowExecution(agentId, executionId, status, outputData = null, errorMessage = null) {
    const mutation = `
      mutation UpdateWorkflowExecution(
        $id: uuid!
        $status: String!
        $outputData: jsonb
        $errorMessage: String
        $completedAt: timestamptz
        $executionTime: Int
      ) {
        update_workflow_executions_by_pk(
          pk_columns: { id: $id }
          _set: {
            status: $status
            output_data: $outputData
            error_message: $errorMessage
            completed_at: $completedAt
            execution_time_ms: $executionTime
          }
        ) {
          id
          status
          completed_at
          execution_time_ms
        }
      }
    `;

    const now = new Date();
    const context = this.agentContexts.get(agentId);
    const executionTime = context?.executionStartTime ? 
      now.getTime() - context.executionStartTime.getTime() : null;

    return await this.executeAgentOperation(agentId, mutation, {
      id: executionId,
      status,
      outputData,
      errorMessage,
      completedAt: ['success', 'error', 'cancelled'].includes(status) ? now.toISOString() : null,
      executionTime
    });
  }

  // =====================================================
  // AGENT REGISTRATION & TRACKING
  // =====================================================

  /**
   * Register agent in database
   */
  async registerAgent(agentId, tenantId, agentType, configuration = {}) {
    const mutation = `
      mutation RegisterAgent($input: agents_insert_input!) {
        insert_agents_one(
          object: $input
          on_conflict: {
            constraint: agents_pkey
            update_columns: [name, description, configuration, status, updated_at]
          }
        ) {
          id
          agent_type
          name
          status
          created_at
          updated_at
        }
      }
    `;

    const adminClient = this.clients.get('admin');
    return await adminClient.request(mutation, {
      input: {
        id: agentId,
        tenant_id: tenantId,
        agent_type: agentType,
        name: `${agentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Agent`,
        description: `MCP ${agentType} agent for tenant ${tenantId}`,
        configuration: {
          ...configuration,
          mcp_integration: true,
          version: '1.0.0',
          capabilities: this.getAgentCapabilities(agentType)
        },
        status: 'active'
      }
    });
  }

  getAgentCapabilities(agentType) {
    const capabilities = {
      'code_generation': ['project_creation', 'code_scaffolding', 'dependency_management'],
      'deployment': ['vercel_deployment', 'github_integration', 'domain_configuration'],
      'business_intelligence': ['analytics_setup', 'reporting', 'metrics_tracking'],
      'customer_operations': ['user_onboarding', 'support_automation', 'lifecycle_management'],
      'marketing_automation': ['email_campaigns', 'lead_scoring', 'conversion_tracking']
    };
    return capabilities[agentType] || ['general_purpose'];
  }

  /**
   * Update agent status and execution metrics
   */
  async updateAgentStatus(agentId, status, executionCount = null) {
    const mutation = `
      mutation UpdateAgentStatus(
        $id: uuid!
        $status: String!
        $lastExecution: timestamptz
        $executionCount: Int
      ) {
        update_agents_by_pk(
          pk_columns: { id: $id }
          _set: {
            status: $status
            last_execution: $lastExecution
            execution_count: $executionCount
            updated_at: "now()"
          }
        ) {
          id
          status
          last_execution
          execution_count
          updated_at
        }
      }
    `;

    const adminClient = this.clients.get('admin');
    return await adminClient.request(mutation, {
      id: agentId,
      status,
      lastExecution: new Date().toISOString(),
      executionCount
    });
  }

  // =====================================================
  // MONITORING & LOGGING
  // =====================================================

  async logAgentOperation(agentId, operationData) {
    if (!this.config.monitoring.enabled) return;

    try {
      const context = this.agentContexts.get(agentId);
      if (!context) return;

      // Insert into usage_metrics table for tracking
      const mutation = `
        mutation LogAgentOperation($input: usage_metrics_insert_input!) {
          insert_usage_metrics_one(object: $input) {
            id
            timestamp
          }
        }
      `;

      const adminClient = this.clients.get('admin');
      await adminClient.request(mutation, {
        input: {
          tenant_id: context.tenantId,
          user_id: context.userId,
          metric_type: 'agent_operation',
          metric_name: `agent_${agentId}_operation`,
          value: operationData.duration || 0,
          dimensions: {
            agent_id: agentId,
            operation_type: operationData.operation_type || 'graphql_operation',
            success: operationData.success,
            error: operationData.error || null,
            ...operationData
          },
          timestamp: new Date().toISOString(),
          date: new Date().toISOString().split('T')[0]
        }
      });

    } catch (error) {
      console.error('Failed to log agent operation:', error);
    }
  }

  setupEventHandlers() {
    // Agent context cleanup
    setInterval(() => {
      this.cleanupInactiveAgents();
    }, 5 * 60 * 1000); // Every 5 minutes

    // Subscription cleanup
    setInterval(() => {
      this.cleanupOldSubscriptions();
    }, 10 * 60 * 1000); // Every 10 minutes
  }

  startHealthMonitoring() {
    setInterval(async () => {
      await this.performHealthCheck();
    }, this.config.agents.healthCheckInterval);
  }

  async performHealthCheck() {
    try {
      // Check GraphQL endpoint
      const adminClient = this.clients.get('admin');
      await adminClient.request('{ __schema { queryType { name } } }');
      
      // Check Supabase connection
      const supabase = this.clients.get('supabase-admin');
      await supabase.from('tenants').select('count').limit(1);
      
      // Emit health status
      this.eventEmitter.emit('health-check', {
        status: 'healthy',
        timestamp: new Date(),
        activeAgents: this.agentContexts.size,
        activeSubscriptions: this.subscriptions.size
      });

    } catch (error) {
      this.eventEmitter.emit('health-check', {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date()
      });
    }
  }

  // =====================================================
  // CLEANUP & UTILITY METHODS
  // =====================================================

  cleanupInactiveAgents() {
    const now = new Date();
    const maxInactiveTime = 30 * 60 * 1000; // 30 minutes

    for (const [agentId, context] of this.agentContexts.entries()) {
      if (now - context.lastActive > maxInactiveTime) {
        console.log(`🧹 Cleaning up inactive agent: ${agentId}`);
        this.agentContexts.delete(agentId);
        this.clients.delete(`agent-${agentId}`);
      }
    }
  }

  cleanupOldSubscriptions() {
    const now = new Date();
    const maxAge = 60 * 60 * 1000; // 1 hour

    for (const [subscriptionId, subscription] of this.subscriptions.entries()) {
      if (now - subscription.createdAt > maxAge) {
        console.log(`🧹 Cleaning up old subscription: ${subscriptionId}`);
        subscription.unsubscribe();
        this.subscriptions.delete(subscriptionId);
      }
    }
  }

  /**
   * Get agent context information
   */
  getAgentContext(agentId) {
    return this.agentContexts.get(agentId);
  }

  /**
   * List all active agents
   */
  getActiveAgents() {
    return Array.from(this.agentContexts.entries()).map(([agentId, context]) => ({
      agentId,
      tenantId: context.tenantId,
      userId: context.userId,
      role: context.role,
      createdAt: context.createdAt,
      lastActive: context.lastActive
    }));
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log('🛑 Shutting down MCP Integration...');
    
    // Close all subscriptions
    for (const [subscriptionId, subscription] of this.subscriptions.entries()) {
      subscription.unsubscribe();
    }
    this.subscriptions.clear();

    // Clear agent contexts
    this.agentContexts.clear();

    // Close WebSocket connection
    const wsClient = this.clients.get('websocket');
    if (wsClient) {
      wsClient.terminate();
    }

    console.log('✅ MCP Integration shutdown complete');
  }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Create MCP integration instance
 */
export function createMCPIntegration(config = {}) {
  return new MCPIntegrationConfig(config);
}

/**
 * Common GraphQL queries and mutations for agents
 */
export const AgentQueries = {
  // Get tenant projects
  GET_TENANT_PROJECTS: `
    query GetTenantProjects($limit: Int = 50) {
      projects(
        order_by: { updated_at: desc }
        limit: $limit
      ) {
        id
        name
        description
        project_type
        status
        tech_stack
        created_at
        updated_at
        created_by_user {
          first_name
          last_name
          email
        }
      }
    }
  `,

  // Get project workflows
  GET_PROJECT_WORKFLOWS: `
    query GetProjectWorkflows($projectId: uuid!) {
      workflows(where: { project_id: { _eq: $projectId } }) {
        id
        name
        workflow_type
        status
        configuration
        last_triggered
        execution_count
      }
    }
  `,

  // Get workflow executions
  GET_WORKFLOW_EXECUTIONS: `
    query GetWorkflowExecutions($workflowId: uuid!, $limit: Int = 20) {
      workflow_executions(
        where: { workflow_id: { _eq: $workflowId } }
        order_by: { started_at: desc }
        limit: $limit
      ) {
        id
        status
        started_at
        completed_at
        execution_time_ms
        error_message
        input_data
        output_data
      }
    }
  `
};

export default MCPIntegrationConfig;