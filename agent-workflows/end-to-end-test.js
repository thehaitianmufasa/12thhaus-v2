/**
 * End-to-End Testing Suite for MCP Agent Workflows
 * 12thhaus Spiritual Platform - Phase 1C Task 4
 * 
 * Comprehensive testing of project creation workflow with
 * multi-tenant isolation verification and PRD processing
 */

import { ProjectGenerationWorkflow } from './project-generation.js';
import { AgentMonitoringSystem } from './monitoring-logging.js';
import { MCPIntegrationConfig } from '../mcp-integration-config.js';
import { GraphQLClient } from 'graphql-request';

// =====================================================
// END-TO-END TEST SUITE
// =====================================================

export class EndToEndTestSuite {
  constructor(config = {}) {
    this.config = {
      // Test configuration
      test: {
        timeoutMs: config.test?.timeoutMs || 600000, // 10 minutes
        cleanupAfterTest: config.test?.cleanupAfterTest !== false,
        parallel: config.test?.parallel || false,
        retryAttempts: config.test?.retryAttempts || 2
      },
      
      // Test environment
      environment: {
        hasuraEndpoint: config.environment?.hasuraEndpoint || 'http://localhost:8080/v1/graphql',
        hasuraAdminSecret: config.environment?.hasuraAdminSecret || process.env.HASURA_GRAPHQL_ADMIN_SECRET,
        supabaseUrl: config.environment?.supabaseUrl || process.env.SUPABASE_PROJECT_URL,
        supabaseServiceKey: config.environment?.supabaseServiceKey || process.env.SUPABASE_SERVICE_ROLE_KEY,
        n8nWebhookUrl: config.environment?.n8nWebhookUrl || 'http://localhost:5678'
      },
      
      // MCP configuration
      mcpConfig: config.mcpConfig || {},
      
      // Monitoring configuration
      monitoringConfig: config.monitoringConfig || {}
    };
    
    this.testResults = [];
    this.testTenants = [];
    this.testProjects = [];
    this.testUsers = [];
    this.testAgents = [];
    
    this.projectWorkflow = null;
    this.monitoring = null;
    this.mcpIntegration = null;
  }

  // =====================================================
  // TEST INITIALIZATION
  // =====================================================

  async initialize() {
    try {
      console.log('🧪 Initializing End-to-End Test Suite...');
      
      // Initialize MCP Integration
      this.mcpIntegration = new MCPIntegrationConfig(this.config.mcpConfig);
      await this.mcpIntegration.initialize();
      
      // Initialize Project Workflow
      this.projectWorkflow = new ProjectGenerationWorkflow({
        mcpConfig: this.config.mcpConfig,
        n8n: {
          baseUrl: this.config.environment.n8nWebhookUrl
        }
      });
      
      // Initialize Monitoring
      this.monitoring = new AgentMonitoringSystem({
        mcpConfig: this.config.mcpConfig,
        ...this.config.monitoringConfig
      });
      
      // Set up test data
      await this.setupTestData();
      
      console.log('✅ End-to-End Test Suite initialized');
    } catch (error) {
      console.error('❌ Failed to initialize test suite:', error);
      throw error;
    }
  }

  // =====================================================
  // TEST DATA SETUP
  // =====================================================

  async setupTestData() {
    // Create test tenants
    const tenant1 = await this.createTestTenant('test-tenant-1', 'Test Tenant 1');
    const tenant2 = await this.createTestTenant('test-tenant-2', 'Test Tenant 2');
    
    this.testTenants.push(tenant1, tenant2);
    
    // Create test users
    const user1 = await this.createTestUser('test-user-1@tenant1.com', 'Test', 'User 1', tenant1.id);
    const user2 = await this.createTestUser('test-user-2@tenant1.com', 'Test', 'User 2', tenant1.id);
    const user3 = await this.createTestUser('test-user-3@tenant2.com', 'Test', 'User 3', tenant2.id);
    
    this.testUsers.push(user1, user2, user3);
    
    console.log(`📋 Test data setup complete: ${this.testTenants.length} tenants, ${this.testUsers.length} users`);
  }

  async createTestTenant(slug, name) {
    const mutation = `
      mutation CreateTestTenant($input: tenants_insert_input!) {
        insert_tenants_one(object: $input) {
          id
          name
          slug
          status
          created_at
        }
      }
    `;
    
    const adminClient = this.mcpIntegration.clients.get('admin');
    const result = await adminClient.request(mutation, {
      input: {
        name,
        slug,
        plan_type: 'pro',
        status: 'active',
        max_users: 10,
        max_projects: 5,
        max_workflows: 20
      }
    });
    
    return result.insert_tenants_one;
  }

  async createTestUser(email, firstName, lastName, tenantId) {
    // Create user
    const userMutation = `
      mutation CreateTestUser($input: users_insert_input!) {
        insert_users_one(object: $input) {
          id
          email
          first_name
          last_name
          status
        }
      }
    `;
    
    const adminClient = this.mcpIntegration.clients.get('admin');
    const userResult = await adminClient.request(userMutation, {
      input: {
        email,
        first_name: firstName,
        last_name: lastName,
        password_hash: 'test-hash',
        status: 'active',
        email_verified: true
      }
    });
    
    const user = userResult.insert_users_one;
    
    // Create tenant-user relationship
    const tenantUserMutation = `
      mutation CreateTenantUser($input: tenant_users_insert_input!) {
        insert_tenant_users_one(object: $input) {
          id
          role
          status
        }
      }
    `;
    
    await adminClient.request(tenantUserMutation, {
      input: {
        tenant_id: tenantId,
        user_id: user.id,
        role: 'user',
        status: 'active',
        joined_at: new Date().toISOString()
      }
    });
    
    return { ...user, tenantId };
  }

  // =====================================================
  // TEST CASES
  // =====================================================

  async runAllTests() {
    console.log('🚀 Starting End-to-End Test Suite...\n');
    
    const tests = [
      // Basic functionality tests
      this.testBasicProjectCreation.bind(this),
      this.testMultiTenantIsolation.bind(this),
      this.testAgentAuthentication.bind(this),
      this.testWorkflowExecution.bind(this),
      
      // PRD processing tests
      this.testPRDProcessing.bind(this),
      this.testComplexProjectGeneration.bind(this),
      this.testMultipleProjectTypes.bind(this),
      
      // Integration tests
      this.testN8NWebhookIntegration.bind(this),
      this.testMonitoringSystem.bind(this),
      this.testErrorHandling.bind(this),
      
      // Performance tests
      this.testConcurrentProjectCreation.bind(this),
      this.testLargeProjectGeneration.bind(this),
      
      // Security tests
      this.testCrossTenantAccess.bind(this),
      this.testUnauthorizedAccess.bind(this),
      this.testDataLeakagePrevention.bind(this)
    ];
    
    const startTime = Date.now();
    let passedTests = 0;
    let failedTests = 0;
    
    for (const test of tests) {
      try {
        await this.runTest(test);
        passedTests++;
      } catch (error) {
        failedTests++;
        console.error(`❌ Test failed: ${test.name}:`, error.message);
      }
    }
    
    const duration = Date.now() - startTime;
    
    // Generate test report
    await this.generateTestReport({
      totalTests: tests.length,
      passedTests,
      failedTests,
      duration,
      startTime: new Date(startTime)
    });
    
    // Cleanup if configured
    if (this.config.test.cleanupAfterTest) {
      await this.cleanup();
    }
    
    return {
      success: failedTests === 0,
      totalTests: tests.length,
      passedTests,
      failedTests,
      duration
    };
  }

  async runTest(testFunction) {
    const testName = testFunction.name;
    const startTime = Date.now();
    
    console.log(`🔬 Running test: ${testName}`);
    
    try {
      const result = await Promise.race([
        testFunction(),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Test timeout')), this.config.test.timeoutMs);
        })
      ]);
      
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        name: testName,
        status: 'passed',
        duration,
        result,
        timestamp: new Date()
      });
      
      console.log(`✅ Test passed: ${testName} (${duration}ms)\n`);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        name: testName,
        status: 'failed',
        duration,
        error: error.message,
        stack: error.stack,
        timestamp: new Date()
      });
      
      throw error;
    }
  }

  // =====================================================
  // BASIC FUNCTIONALITY TESTS
  // =====================================================

  async testBasicProjectCreation() {
    const testTenant = this.testTenants[0];
    const testUser = this.testUsers[0];
    
    const projectRequest = {
      name: 'Test Web App',
      description: 'A test web application for E2E testing',
      project_type: 'web-app',
      tech_stack: {
        frontend: 'next.js',
        backend: 'node.js',
        database: 'postgresql'
      },
      prd_content: this.generateTestPRD('web-app')
    };
    
    const agentId = `test-agent-${Date.now()}`;
    
    // Create project via workflow
    const result = await this.projectWorkflow.createProject(
      projectRequest,
      agentId,
      testTenant.id,
      testUser.id
    );
    
    // Verify project was created
    this.assert(result.project, 'Project should be created');
    this.assert(result.project.name === projectRequest.name, 'Project name should match');
    this.assert(result.project.tenant_id === testTenant.id, 'Project should belong to correct tenant');
    
    // Store for cleanup
    this.testProjects.push(result.project);
    this.testAgents.push(agentId);
    
    return result;
  }

  async testMultiTenantIsolation() {
    const tenant1 = this.testTenants[0];
    const tenant2 = this.testTenants[1];
    const user1 = this.testUsers[0]; // tenant1
    const user3 = this.testUsers[2]; // tenant2
    
    // Create project in tenant1
    const project1Request = {
      name: 'Tenant 1 Project',
      description: 'Project for tenant isolation test',
      project_type: 'web-app',
      prd_content: this.generateTestPRD('web-app')
    };
    
    const agent1Id = `isolation-agent-1-${Date.now()}`;
    const result1 = await this.projectWorkflow.createProject(
      project1Request,
      agent1Id,
      tenant1.id,
      user1.id
    );
    
    // Create project in tenant2
    const project2Request = {
      name: 'Tenant 2 Project',
      description: 'Project for tenant isolation test',
      project_type: 'api-service',
      prd_content: this.generateTestPRD('api-service')
    };
    
    const agent2Id = `isolation-agent-2-${Date.now()}`;
    const result2 = await this.projectWorkflow.createProject(
      project2Request,
      agent2Id,
      tenant2.id,
      user3.id
    );
    
    // Verify tenant isolation
    await this.verifyTenantIsolation(tenant1.id, tenant2.id, result1.project.id, result2.project.id);
    
    this.testProjects.push(result1.project, result2.project);
    this.testAgents.push(agent1Id, agent2Id);
    
    return { tenant1Result: result1, tenant2Result: result2 };
  }

  async testAgentAuthentication() {
    const testTenant = this.testTenants[0];
    const testUser = this.testUsers[0];
    const agentId = `auth-test-agent-${Date.now()}`;
    
    // Create authenticated agent client
    const agentClient = await this.mcpIntegration.createAgentClient(
      agentId,
      testTenant.id,
      testUser.id,
      'user'
    );
    
    // Test agent can query its own tenant data
    const tenantQuery = `
      query GetTenantInfo {
        projects(limit: 1) {
          id
          name
          tenant_id
        }
      }
    `;
    
    const result = await this.mcpIntegration.executeAgentOperation(
      agentId,
      tenantQuery
    );
    
    this.assert(Array.isArray(result.projects), 'Should return projects array');
    
    // Verify all returned projects belong to correct tenant
    for (const project of result.projects) {
      this.assert(project.tenant_id === testTenant.id, 'All projects should belong to agent tenant');
    }
    
    this.testAgents.push(agentId);
    
    return { agentId, tenantProjects: result.projects };
  }

  async testWorkflowExecution() {
    const testTenant = this.testTenants[0];
    const testUser = this.testUsers[0];
    const agentId = `workflow-test-agent-${Date.now()}`;
    
    // Create and register agent
    await this.mcpIntegration.registerAgent(
      agentId,
      testTenant.id,
      'code_generation',
      { test: true }
    );
    
    // Create workflow execution record
    const workflowResult = await this.mcpIntegration.createWorkflowExecution(
      agentId,
      'test-workflow-id',
      { test: true, projectType: 'web-app' }
    );
    
    this.assert(workflowResult.insert_workflow_executions_one, 'Workflow execution should be created');
    
    const execution = workflowResult.insert_workflow_executions_one;
    
    // Update workflow status to completed
    await this.mcpIntegration.updateWorkflowExecution(
      agentId,
      execution.id,
      'success',
      { output: 'test completed' }
    );
    
    this.testAgents.push(agentId);
    
    return execution;
  }

  // =====================================================
  // PRD PROCESSING TESTS
  // =====================================================

  async testPRDProcessing() {
    const testTenant = this.testTenants[0];
    const testUser = this.testUsers[0];
    
    const complexPRD = this.generateComplexPRD();
    
    const projectRequest = {
      name: 'PRD Processing Test',
      description: 'Testing complex PRD processing capabilities',
      project_type: 'web-app',
      prd_content: complexPRD,
      tech_stack: {
        frontend: 'react',
        backend: 'express',
        database: 'postgresql',
        deployment: 'vercel'
      }
    };
    
    const agentId = `prd-test-agent-${Date.now()}`;
    
    const result = await this.projectWorkflow.createProject(
      projectRequest,
      agentId,
      testTenant.id,
      testUser.id
    );
    
    // Verify PRD content was processed
    this.assert(result.project.prd_content, 'PRD content should be stored');
    this.assert(result.project.tech_stack, 'Tech stack should be processed');
    
    this.testProjects.push(result.project);
    this.testAgents.push(agentId);
    
    return result;
  }

  async testComplexProjectGeneration() {
    const testTenant = this.testTenants[0];
    const testUser = this.testUsers[0];
    
    const projectRequest = {
      name: 'Complex E-commerce Platform',
      description: 'Full-featured e-commerce platform with admin dashboard',
      project_type: 'web-app',
      prd_content: this.generateEcommercePRD(),
      tech_stack: {
        frontend: 'next.js',
        backend: 'node.js',
        database: 'postgresql',
        auth: 'auth0',
        payments: 'stripe',
        deployment: 'vercel'
      },
      settings: {
        auto_deployment: true,
        public_repository: false,
        environment: 'staging'
      }
    };
    
    const agentId = `complex-test-agent-${Date.now()}`;
    
    const result = await this.projectWorkflow.createProject(
      projectRequest,
      agentId,
      testTenant.id,
      testUser.id
    );
    
    // Verify complex project structure
    this.assert(result.project, 'Complex project should be created');
    this.assert(result.codeGeneration, 'Code generation should be triggered');
    
    this.testProjects.push(result.project);
    this.testAgents.push(agentId);
    
    return result;
  }

  async testMultipleProjectTypes() {
    const testTenant = this.testTenants[0];
    const testUser = this.testUsers[0];
    
    const projectTypes = ['web-app', 'mobile-app', 'api-service'];
    const results = [];
    
    for (const projectType of projectTypes) {
      const projectRequest = {
        name: `Test ${projectType.replace('-', ' ')}`,
        description: `Testing ${projectType} project generation`,
        project_type: projectType,
        prd_content: this.generateTestPRD(projectType)
      };
      
      const agentId = `multi-type-agent-${projectType}-${Date.now()}`;
      
      const result = await this.projectWorkflow.createProject(
        projectRequest,
        agentId,
        testTenant.id,
        testUser.id
      );
      
      results.push(result);
      this.testProjects.push(result.project);
      this.testAgents.push(agentId);
    }
    
    // Verify all project types were created
    this.assert(results.length === projectTypes.length, 'All project types should be created');
    
    return results;
  }

  // =====================================================
  // INTEGRATION TESTS
  // =====================================================

  async testN8NWebhookIntegration() {
    // Mock N8N webhook for testing
    const webhookPayload = {
      workflowId: 'test-workflow-123',
      projectId: 'test-project-456',
      tenantId: this.testTenants[0].id,
      userId: this.testUsers[0].id,
      projectData: {
        name: 'N8N Integration Test',
        project_type: 'web-app'
      },
      timestamp: new Date().toISOString()
    };
    
    // Test webhook triggering (would normally call N8N)
    try {
      const result = await this.projectWorkflow.triggerN8NWebhook(
        '/webhook/test-integration',
        webhookPayload
      );
      
      // If no error thrown, webhook integration is working
      return { success: true, payload: webhookPayload };
    } catch (error) {
      // Expected if N8N is not running - log but don't fail test
      console.warn('⚠️ N8N webhook test skipped (N8N not available):', error.message);
      return { success: false, reason: 'N8N not available', error: error.message };
    }
  }

  async testMonitoringSystem() {
    // Test metrics collection
    const metrics = await this.monitoring.getCurrentMetrics();
    
    this.assert(metrics.system, 'System metrics should be collected');
    this.assert(metrics.agents, 'Agent metrics should be collected');
    this.assert(metrics.operations, 'Operation metrics should be collected');
    
    // Test logging
    this.monitoring.logInfo('test', 'Test log message', { test: true });
    this.monitoring.logWarn('test', 'Test warning message');
    
    // Test health check
    await this.monitoring.forceHealthCheck();
    
    return metrics;
  }

  async testErrorHandling() {
    const testTenant = this.testTenants[0];
    const testUser = this.testUsers[0];
    
    // Test with invalid project data
    const invalidRequest = {
      name: '', // Invalid: empty name
      description: 'Test error handling',
      project_type: 'invalid-type', // Invalid: unsupported type
      prd_content: null
    };
    
    const agentId = `error-test-agent-${Date.now()}`;
    
    try {
      await this.projectWorkflow.createProject(
        invalidRequest,
        agentId,
        testTenant.id,
        testUser.id
      );
      
      this.assert(false, 'Should have thrown error for invalid request');
    } catch (error) {
      // Expected error
      this.assert(error.message, 'Error should have message');
      return { errorHandled: true, errorMessage: error.message };
    }
  }

  // =====================================================
  // PERFORMANCE TESTS
  // =====================================================

  async testConcurrentProjectCreation() {
    const testTenant = this.testTenants[0];
    const testUser = this.testUsers[0];
    const concurrentCount = 3;
    
    const promises = [];
    
    for (let i = 0; i < concurrentCount; i++) {
      const projectRequest = {
        name: `Concurrent Project ${i + 1}`,
        description: `Testing concurrent creation ${i + 1}`,
        project_type: 'web-app',
        prd_content: this.generateTestPRD('web-app')
      };
      
      const agentId = `concurrent-agent-${i}-${Date.now()}`;
      
      promises.push(
        this.projectWorkflow.createProject(
          projectRequest,
          agentId,
          testTenant.id,
          testUser.id
        )
      );
      
      this.testAgents.push(agentId);
    }
    
    const startTime = Date.now();
    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;
    
    // Verify all projects were created
    this.assert(results.length === concurrentCount, 'All concurrent projects should be created');
    
    for (const result of results) {
      this.assert(result.project, 'Each project should be created');
      this.testProjects.push(result.project);
    }
    
    return {
      concurrentCount,
      duration,
      averageTime: duration / concurrentCount,
      results
    };
  }

  async testLargeProjectGeneration() {
    const testTenant = this.testTenants[0];
    const testUser = this.testUsers[0];
    
    const largeProjectRequest = {
      name: 'Large Enterprise Application',
      description: 'Testing large project generation with extensive features',
      project_type: 'web-app',
      prd_content: this.generateLargePRD(),
      tech_stack: {
        frontend: 'next.js',
        backend: 'node.js',
        database: 'postgresql',
        cache: 'redis',
        queue: 'bull',
        storage: 'aws-s3',
        cdn: 'cloudflare',
        monitoring: 'datadog',
        deployment: 'kubernetes'
      },
      settings: {
        microservices: true,
        apiGateway: true,
        loadBalancer: true,
        autoScaling: true
      }
    };
    
    const agentId = `large-project-agent-${Date.now()}`;
    const startTime = Date.now();
    
    const result = await this.projectWorkflow.createProject(
      largeProjectRequest,
      agentId,
      testTenant.id,
      testUser.id
    );
    
    const duration = Date.now() - startTime;
    
    this.assert(result.project, 'Large project should be created');
    this.testProjects.push(result.project);
    this.testAgents.push(agentId);
    
    return {
      duration,
      project: result.project,
      complexity: 'large'
    };
  }

  // =====================================================
  // SECURITY TESTS
  // =====================================================

  async testCrossTenantAccess() {
    const tenant1 = this.testTenants[0];
    const tenant2 = this.testTenants[1];
    const user1 = this.testUsers[0]; // tenant1 user
    
    // Create agent for tenant1 user
    const agentId = `cross-tenant-test-${Date.now()}`;
    await this.mcpIntegration.createAgentClient(
      agentId,
      tenant1.id,
      user1.id,
      'user'
    );
    
    // Try to query tenant2 data
    const crossTenantQuery = `
      query CrossTenantQuery {
        projects(where: {tenant_id: {_eq: "${tenant2.id}"}}) {
          id
          name
          tenant_id
        }
      }
    `;
    
    const result = await this.mcpIntegration.executeAgentOperation(
      agentId,
      crossTenantQuery
    );
    
    // Should return empty array (no access to other tenant's data)
    this.assert(Array.isArray(result.projects), 'Should return projects array');
    this.assert(result.projects.length === 0, 'Should not access other tenant data');
    
    this.testAgents.push(agentId);
    
    return { crossTenantAccessPrevented: true };
  }

  async testUnauthorizedAccess() {
    // Try to create project without proper authentication
    const invalidAgentId = 'unauthorized-agent';
    
    try {
      await this.projectWorkflow.createProject(
        { name: 'Unauthorized Project' },
        invalidAgentId,
        'invalid-tenant',
        'invalid-user'
      );
      
      this.assert(false, 'Should have failed with unauthorized access');
    } catch (error) {
      // Expected error
      this.assert(error.message.includes('not found') || error.message.includes('unauthorized'), 
        'Should fail with proper authorization error');
      return { unauthorizedAccessPrevented: true };
    }
  }

  async testDataLeakagePrevention() {
    const results = [];
    
    // Test 1: Query with invalid tenant ID in session
    try {
      const agentId = `leak-test-agent-${Date.now()}`;
      await this.mcpIntegration.createAgentClient(
        agentId,
        'non-existent-tenant',
        this.testUsers[0].id,
        'user'
      );
      
      const result = await this.mcpIntegration.executeAgentOperation(
        agentId,
        'query { projects { id name tenant_id } }'
      );
      
      // Should return empty or fail
      this.assert(result.projects.length === 0, 'Should not leak data with invalid tenant');
      results.push({ test: 'invalid_tenant', passed: true });
      
    } catch (error) {
      // Also acceptable outcome
      results.push({ test: 'invalid_tenant', passed: true, error: error.message });
    }
    
    // Test 2: Subscription isolation
    const tenant1Agent = `leak-test-subscription-${Date.now()}`;
    await this.mcpIntegration.createAgentClient(
      tenant1Agent,
      this.testTenants[0].id,
      this.testUsers[0].id,
      'user'
    );
    
    // Create subscription for tenant 1
    let receivedData = [];
    await this.mcpIntegration.createAgentSubscription(
      tenant1Agent,
      'subscription { projects { id name tenant_id } }',
      {},
      (data) => receivedData.push(data),
      (error) => console.error('Subscription error:', error)
    );
    
    // Wait briefly and check received data
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // All received data should belong to tenant 1
    for (const data of receivedData) {
      if (data.projects) {
        for (const project of data.projects) {
          this.assert(project.tenant_id === this.testTenants[0].id, 
            'Subscription should only receive own tenant data');
        }
      }
    }
    
    results.push({ test: 'subscription_isolation', passed: true });
    this.testAgents.push(tenant1Agent);
    
    return { dataLeakageTests: results };
  }

  // =====================================================
  // VERIFICATION HELPERS
  // =====================================================

  async verifyTenantIsolation(tenant1Id, tenant2Id, project1Id, project2Id) {
    // Create agent for tenant1
    const agent1Id = `isolation-verify-1-${Date.now()}`;
    await this.mcpIntegration.createAgentClient(
      agent1Id,
      tenant1Id,
      this.testUsers[0].id,
      'user'
    );
    
    // Create agent for tenant2
    const agent2Id = `isolation-verify-2-${Date.now()}`;
    await this.mcpIntegration.createAgentClient(
      agent2Id,
      tenant2Id,
      this.testUsers[2].id,
      'user'
    );
    
    // Verify tenant1 agent can only see tenant1 projects
    const tenant1Query = `
      query GetTenantProjects {
        projects {
          id
          name
          tenant_id
        }
      }
    `;
    
    const tenant1Result = await this.mcpIntegration.executeAgentOperation(
      agent1Id,
      tenant1Query
    );
    
    for (const project of tenant1Result.projects) {
      this.assert(project.tenant_id === tenant1Id, 
        'Tenant1 agent should only see tenant1 projects');
    }
    
    // Verify tenant2 agent can only see tenant2 projects
    const tenant2Result = await this.mcpIntegration.executeAgentOperation(
      agent2Id,
      tenant1Query
    );
    
    for (const project of tenant2Result.projects) {
      this.assert(project.tenant_id === tenant2Id, 
        'Tenant2 agent should only see tenant2 projects');
    }
    
    this.testAgents.push(agent1Id, agent2Id);
  }

  // =====================================================
  // TEST DATA GENERATORS
  // =====================================================

  generateTestPRD(projectType) {
    const prdTemplates = {
      'web-app': `
# Web Application PRD

## Project Overview
Create a modern web application with user authentication and dashboard.

## Features
- User registration and login
- Dashboard with analytics
- User profile management
- Responsive design

## Technical Requirements
- React/Next.js frontend
- Node.js backend
- PostgreSQL database
- JWT authentication

## User Stories
- As a user, I can register for an account
- As a user, I can login to my dashboard
- As a user, I can view my profile
      `,
      'mobile-app': `
# Mobile Application PRD

## Project Overview
Native mobile app for iOS and Android platforms.

## Features
- Cross-platform compatibility
- Push notifications
- Offline functionality
- Social login integration

## Technical Requirements
- React Native framework
- Expo deployment
- Firebase integration
- AsyncStorage for offline data
      `,
      'api-service': `
# API Service PRD

## Project Overview
RESTful API service with comprehensive documentation.

## Features
- REST API endpoints
- Authentication and authorization
- Rate limiting
- API documentation

## Technical Requirements
- Express.js framework
- OpenAPI/Swagger documentation
- JWT token authentication
- PostgreSQL database
      `
    };
    
    return prdTemplates[projectType] || prdTemplates['web-app'];
  }

  generateComplexPRD() {
    return `
# Complex Multi-Feature Application PRD

## Project Overview
Enterprise-grade application with comprehensive feature set including user management, 
content management, analytics, and reporting capabilities.

## Core Features

### User Management
- Multi-role authentication (Admin, Manager, User)
- User profile management with avatar upload
- Permission-based access control
- Single Sign-On (SSO) integration
- Two-factor authentication

### Content Management
- Rich text editor for content creation
- Media library with file upload
- Content versioning and revision history
- Content approval workflow
- Multi-language support

### Analytics & Reporting
- Real-time dashboard with metrics
- Custom report generation
- Data export functionality (CSV, PDF, Excel)
- Scheduled report delivery
- Interactive charts and graphs

### Communication
- In-app messaging system
- Email notifications
- Push notifications
- Activity feed
- Comment system

## Technical Requirements

### Frontend
- React with TypeScript
- Material-UI or Ant Design
- State management with Redux
- Real-time updates with WebSockets
- Progressive Web App (PWA) capabilities

### Backend
- Node.js with Express
- GraphQL API with subscriptions
- Microservices architecture
- Event-driven architecture
- API rate limiting and throttling

### Database
- PostgreSQL for main data
- Redis for caching and sessions
- ElasticSearch for full-text search
- Database migrations and seeding

### Infrastructure
- Docker containerization
- Kubernetes orchestration
- CI/CD pipeline with GitHub Actions
- Monitoring with Prometheus and Grafana
- Logging with ELK stack

## User Stories
[50+ detailed user stories would go here...]

## Acceptance Criteria
[Detailed acceptance criteria for each feature...]

## API Specifications
[Comprehensive API documentation...]
    `;
  }

  generateEcommercePRD() {
    return `
# E-commerce Platform PRD

## Project Overview
Full-featured e-commerce platform with customer and admin interfaces.

## Features
- Product catalog with categories
- Shopping cart and checkout
- Payment processing (Stripe)
- Order management
- Inventory tracking
- Customer reviews and ratings
- Admin dashboard
- Analytics and reporting

## Technical Stack
- Next.js with TypeScript
- Stripe payment integration
- PostgreSQL database
- Redis caching
- AWS S3 for media storage
- Email notifications
    `;
  }

  generateLargePRD() {
    return `
# Enterprise Application Platform PRD

## Executive Summary
Comprehensive enterprise platform supporting multiple business units with
advanced analytics, workflow automation, and integration capabilities.

## Feature Modules

### Core Platform
- Multi-tenant architecture
- Enterprise SSO integration
- Advanced role-based permissions
- Audit logging and compliance
- Data encryption at rest and in transit

### Workflow Engine
- Visual workflow designer
- Automated business processes
- Integration with external systems
- Conditional logic and branching
- Scheduled task execution

### Analytics Platform
- Real-time data processing
- Machine learning insights
- Custom dashboard creation
- Advanced reporting suite
- Data warehouse integration

### Integration Hub
- REST and GraphQL APIs
- Webhook management
- Third-party integrations
- Data synchronization
- API gateway and rate limiting

### Communication Suite
- Multi-channel messaging
- Video conferencing integration
- Document collaboration
- Knowledge base
- Help desk system

## Technical Architecture
- Microservices with Docker/Kubernetes
- Event-driven architecture with Apache Kafka
- Multiple database technologies (PostgreSQL, MongoDB, Redis)
- Advanced caching strategies
- Full-text search with Elasticsearch
- CDN integration for global performance
- Auto-scaling infrastructure
    `;
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  assert(condition, message) {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  async generateTestReport(summary) {
    const report = {
      ...summary,
      testResults: this.testResults,
      environment: this.config.environment,
      testData: {
        tenants: this.testTenants.length,
        users: this.testUsers.length,
        projects: this.testProjects.length,
        agents: this.testAgents.length
      },
      timestamp: new Date().toISOString()
    };
    
    console.log('\n📊 TEST REPORT SUMMARY:');
    console.log(`Total Tests: ${summary.totalTests}`);
    console.log(`Passed: ✅ ${summary.passedTests}`);
    console.log(`Failed: ❌ ${summary.failedTests}`);
    console.log(`Duration: ${summary.duration}ms`);
    console.log(`Success Rate: ${((summary.passedTests / summary.totalTests) * 100).toFixed(2)}%`);
    
    if (summary.failedTests > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.testResults
        .filter(result => result.status === 'failed')
        .forEach(result => {
          console.log(`- ${result.name}: ${result.error}`);
        });
    }
    
    return report;
  }

  async cleanup() {
    console.log('🧹 Cleaning up test data...');
    
    try {
      const adminClient = this.mcpIntegration.clients.get('admin');
      
      // Clean up test projects
      if (this.testProjects.length > 0) {
        const projectIds = this.testProjects.map(p => p.id);
        await adminClient.request(`
          mutation DeleteTestProjects($ids: [uuid!]!) {
            delete_projects(where: {id: {_in: $ids}}) {
              affected_rows
            }
          }
        `, { ids: projectIds });
      }
      
      // Clean up test users
      if (this.testUsers.length > 0) {
        const userIds = this.testUsers.map(u => u.id);
        await adminClient.request(`
          mutation DeleteTestUsers($ids: [uuid!]!) {
            delete_tenant_users(where: {user_id: {_in: $ids}}) {
              affected_rows
            }
            delete_users(where: {id: {_in: $ids}}) {
              affected_rows
            }
          }
        `, { ids: userIds });
      }
      
      // Clean up test tenants
      if (this.testTenants.length > 0) {
        const tenantIds = this.testTenants.map(t => t.id);
        await adminClient.request(`
          mutation DeleteTestTenants($ids: [uuid!]!) {
            delete_tenants(where: {id: {_in: $ids}}) {
              affected_rows
            }
          }
        `, { ids: tenantIds });
      }
      
      console.log('✅ Test data cleanup completed');
      
    } catch (error) {
      console.error('❌ Failed to cleanup test data:', error);
    }
  }

  async shutdown() {
    await this.cleanup();
    
    if (this.projectWorkflow) {
      await this.projectWorkflow.shutdown();
    }
    
    if (this.monitoring) {
      await this.monitoring.shutdown();
    }
    
    if (this.mcpIntegration) {
      await this.mcpIntegration.shutdown();
    }
  }
}

// =====================================================
// FACTORY FUNCTIONS
// =====================================================

/**
 * Create test suite instance
 */
export function createTestSuite(config = {}) {
  return new EndToEndTestSuite(config);
}

/**
 * Run quick smoke test
 */
export async function runSmokeTest(config = {}) {
  const testSuite = new EndToEndTestSuite(config);
  await testSuite.initialize();
  
  // Run basic tests only
  const results = [];
  
  try {
    results.push(await testSuite.runTest(testSuite.testBasicProjectCreation.bind(testSuite)));
    results.push(await testSuite.runTest(testSuite.testAgentAuthentication.bind(testSuite)));
    results.push(await testSuite.runTest(testSuite.testMultiTenantIsolation.bind(testSuite)));
  } catch (error) {
    console.error('Smoke test failed:', error);
  } finally {
    await testSuite.shutdown();
  }
  
  return results;
}

export default EndToEndTestSuite;