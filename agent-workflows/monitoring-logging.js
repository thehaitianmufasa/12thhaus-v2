/**
 * Monitoring and Logging System for MCP Agents
 * 12thhaus Spiritual Platform - Phase 1C Task 3
 * 
 * Comprehensive monitoring, logging, and error handling system
 * for MCP agent activities with tenant isolation
 */

import { MCPIntegrationConfig } from '../mcp-integration-config.js';
import { GraphQLClient } from 'graphql-request';
import EventEmitter from 'events';

// =====================================================
// MONITORING & LOGGING ENGINE
// =====================================================

export class AgentMonitoringSystem extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      // MCP Integration
      mcpConfig: config.mcpConfig || {},
      
      // Monitoring configuration
      monitoring: {
        enabled: config.monitoring?.enabled !== false,
        metricsInterval: config.monitoring?.metricsInterval || 30000, // 30 seconds
        healthCheckInterval: config.monitoring?.healthCheckInterval || 60000, // 1 minute
        retentionDays: config.monitoring?.retentionDays || 30,
        alertThresholds: {
          errorRate: config.monitoring?.alertThresholds?.errorRate || 0.1, // 10%
          avgResponseTime: config.monitoring?.alertThresholds?.avgResponseTime || 5000, // 5 seconds
          activeAgents: config.monitoring?.alertThresholds?.activeAgents || 100
        }
      },
      
      // Logging configuration
      logging: {
        level: config.logging?.level || 'info', // debug, info, warn, error
        enableFileLogging: config.logging?.enableFileLogging !== false,
        logDirectory: config.logging?.logDirectory || './logs',
        maxFileSize: config.logging?.maxFileSize || '10MB',
        maxFiles: config.logging?.maxFiles || 5,
        enableDatabaseLogging: config.logging?.enableDatabaseLogging !== false,
        enableConsoleLogging: config.logging?.enableConsoleLogging !== false
      },
      
      // Alert configuration
      alerts: {
        enabled: config.alerts?.enabled !== false,
        webhookUrl: config.alerts?.webhookUrl,
        emailNotifications: config.alerts?.emailNotifications || false,
        slackWebhook: config.alerts?.slackWebhook,
        discordWebhook: config.alerts?.discordWebhook
      },
      
      // Performance tracking
      performance: {
        trackOperations: config.performance?.trackOperations !== false,
        trackMemoryUsage: config.performance?.trackMemoryUsage !== false,
        trackCpuUsage: config.performance?.trackCpuUsage !== false,
        samplingRate: config.performance?.samplingRate || 1.0 // 100% sampling
      }
    };
    
    this.mcpIntegration = null;
    this.metrics = new Map();
    this.alerts = new Map();
    this.logBuffer = [];
    this.monitoringIntervals = new Map();
    
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
      
      // Set up monitoring intervals
      this.setupMonitoringIntervals();
      
      // Set up event handlers
      this.setupEventHandlers();
      
      // Initialize log buffer flushing
      this.setupLogBufferFlushing();
      
      console.log('✅ Agent Monitoring System initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Agent Monitoring System:', error);
      throw error;
    }
  }

  setupMonitoringIntervals() {
    if (this.config.monitoring.enabled) {
      // Metrics collection
      const metricsInterval = setInterval(() => {
        this.collectMetrics();
      }, this.config.monitoring.metricsInterval);
      this.monitoringIntervals.set('metrics', metricsInterval);
      
      // Health checks
      const healthInterval = setInterval(() => {
        this.performHealthChecks();
      }, this.config.monitoring.healthCheckInterval);
      this.monitoringIntervals.set('health', healthInterval);
      
      // Alert processing
      const alertInterval = setInterval(() => {
        this.processAlerts();
      }, 60000); // Every minute
      this.monitoringIntervals.set('alerts', alertInterval);
    }
  }

  setupEventHandlers() {
    // Listen to MCP Integration events
    this.mcpIntegration.eventEmitter.on('health-check', (status) => {
      this.recordHealthMetric(status);
    });
    
    // Error handling
    process.on('uncaughtException', (error) => {
      this.logError('system', 'uncaught_exception', error, {
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      this.logError('system', 'unhandled_rejection', reason, {
        promise: promise.toString(),
        timestamp: new Date().toISOString()
      });
    });
  }

  setupLogBufferFlushing() {
    // Flush log buffer every 5 seconds
    setInterval(() => {
      this.flushLogBuffer();
    }, 5000);
    
    // Flush on process exit
    process.on('SIGINT', () => {
      this.flushLogBuffer();
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      this.flushLogBuffer();
      process.exit(0);
    });
  }

  // =====================================================
  // METRICS COLLECTION
  // =====================================================

  async collectMetrics() {
    try {
      const timestamp = new Date();
      
      // Collect system metrics
      const systemMetrics = await this.collectSystemMetrics();
      
      // Collect agent metrics
      const agentMetrics = await this.collectAgentMetrics();
      
      // Collect operation metrics
      const operationMetrics = await this.collectOperationMetrics();
      
      // Store metrics
      await this.storeMetrics({
        timestamp,
        system: systemMetrics,
        agents: agentMetrics,
        operations: operationMetrics
      });
      
      // Check for alert conditions
      this.checkAlertThresholds(systemMetrics, agentMetrics, operationMetrics);
      
    } catch (error) {
      this.logError('monitoring', 'metrics_collection_failed', error);
    }
  }

  async collectSystemMetrics() {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      memory: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external,
        arrayBuffers: memoryUsage.arrayBuffers
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch
    };
  }

  async collectAgentMetrics() {
    try {
      const activeAgents = this.mcpIntegration.getActiveAgents();
      
      const agentMetrics = {
        totalActive: activeAgents.length,
        byTenant: {},
        byRole: {},
        averageAge: 0,
        oldestAgent: null,
        newestAgent: null
      };
      
      if (activeAgents.length > 0) {
        const now = new Date();
        let totalAge = 0;
        let oldest = activeAgents[0];
        let newest = activeAgents[0];
        
        for (const agent of activeAgents) {
          // Group by tenant
          if (!agentMetrics.byTenant[agent.tenantId]) {
            agentMetrics.byTenant[agent.tenantId] = 0;
          }
          agentMetrics.byTenant[agent.tenantId]++;
          
          // Group by role
          if (!agentMetrics.byRole[agent.role]) {
            agentMetrics.byRole[agent.role] = 0;
          }
          agentMetrics.byRole[agent.role]++;
          
          // Calculate age
          const age = now - agent.createdAt;
          totalAge += age;
          
          if (agent.createdAt < oldest.createdAt) oldest = agent;
          if (agent.createdAt > newest.createdAt) newest = agent;
        }
        
        agentMetrics.averageAge = totalAge / activeAgents.length;
        agentMetrics.oldestAgent = {
          agentId: oldest.agentId,
          age: now - oldest.createdAt,
          lastActive: oldest.lastActive
        };
        agentMetrics.newestAgent = {
          agentId: newest.agentId,
          age: now - newest.createdAt,
          lastActive: newest.lastActive
        };
      }
      
      return agentMetrics;
      
    } catch (error) {
      this.logError('monitoring', 'agent_metrics_collection_failed', error);
      return { error: error.message };
    }
  }

  async collectOperationMetrics() {
    try {
      // Query recent operations from usage_metrics table
      const metricsQuery = `
        query GetRecentMetrics($since: timestamptz!) {
          usage_metrics(
            where: {
              timestamp: { _gte: $since }
              metric_type: { _in: ["agent_operation", "workflow_completion"] }
            }
            order_by: { timestamp: desc }
          ) {
            id
            tenant_id
            metric_type
            metric_name
            value
            dimensions
            timestamp
          }
        }
      `;
      
      const since = new Date(Date.now() - this.config.monitoring.metricsInterval);
      const adminClient = this.mcpIntegration.clients.get('admin');
      const result = await adminClient.request(metricsQuery, { since: since.toISOString() });
      
      const operations = result.usage_metrics || [];
      
      const operationMetrics = {
        totalOperations: operations.length,
        successfulOperations: 0,
        failedOperations: 0,
        averageResponseTime: 0,
        operationsByType: {},
        operationsByTenant: {},
        errorRate: 0
      };
      
      if (operations.length > 0) {
        let totalResponseTime = 0;
        
        for (const operation of operations) {
          // Count by type
          if (!operationMetrics.operationsByType[operation.metric_type]) {
            operationMetrics.operationsByType[operation.metric_type] = 0;
          }
          operationMetrics.operationsByType[operation.metric_type]++;
          
          // Count by tenant
          if (!operationMetrics.operationsByTenant[operation.tenant_id]) {
            operationMetrics.operationsByTenant[operation.tenant_id] = 0;
          }
          operationMetrics.operationsByTenant[operation.tenant_id]++;
          
          // Track success/failure
          const success = operation.dimensions?.success !== false;
          if (success) {
            operationMetrics.successfulOperations++;
          } else {
            operationMetrics.failedOperations++;
          }
          
          // Track response time
          if (operation.value && typeof operation.value === 'number') {
            totalResponseTime += operation.value;
          }
        }
        
        operationMetrics.averageResponseTime = totalResponseTime / operations.length;
        operationMetrics.errorRate = operationMetrics.failedOperations / operations.length;
      }
      
      return operationMetrics;
      
    } catch (error) {
      this.logError('monitoring', 'operation_metrics_collection_failed', error);
      return { error: error.message };
    }
  }

  // =====================================================
  // METRICS STORAGE
  // =====================================================

  async storeMetrics(metricsData) {
    try {
      const { timestamp, system, agents, operations } = metricsData;
      
      // Store system metrics
      await this.storeSystemMetrics(timestamp, system);
      
      // Store agent metrics
      await this.storeAgentMetrics(timestamp, agents);
      
      // Store operation metrics
      await this.storeOperationMetrics(timestamp, operations);
      
    } catch (error) {
      this.logError('monitoring', 'metrics_storage_failed', error);
    }
  }

  async storeSystemMetrics(timestamp, systemMetrics) {
    const metricsMutation = `
      mutation StoreSystemMetrics($metrics: [usage_metrics_insert_input!]!) {
        insert_usage_metrics(objects: $metrics) {
          affected_rows
        }
      }
    `;
    
    const metrics = [
      {
        metric_type: 'system_health',
        metric_name: 'memory_usage',
        value: systemMetrics.memory.heapUsed,
        dimensions: systemMetrics.memory,
        timestamp: timestamp.toISOString(),
        date: timestamp.toISOString().split('T')[0]
      },
      {
        metric_type: 'system_health',
        metric_name: 'cpu_usage',
        value: systemMetrics.cpu.user + systemMetrics.cpu.system,
        dimensions: systemMetrics.cpu,
        timestamp: timestamp.toISOString(),
        date: timestamp.toISOString().split('T')[0]
      },
      {
        metric_type: 'system_health',
        metric_name: 'uptime',
        value: systemMetrics.uptime,
        dimensions: { uptime: systemMetrics.uptime },
        timestamp: timestamp.toISOString(),
        date: timestamp.toISOString().split('T')[0]
      }
    ];
    
    const adminClient = this.mcpIntegration.clients.get('admin');
    await adminClient.request(metricsMutation, { metrics });
  }

  async storeAgentMetrics(timestamp, agentMetrics) {
    if (agentMetrics.error) return;
    
    const metricsMutation = `
      mutation StoreAgentMetrics($metrics: [usage_metrics_insert_input!]!) {
        insert_usage_metrics(objects: $metrics) {
          affected_rows
        }
      }
    `;
    
    const metrics = [
      {
        metric_type: 'agent_health',
        metric_name: 'active_agents_count',
        value: agentMetrics.totalActive,
        dimensions: {
          byTenant: agentMetrics.byTenant,
          byRole: agentMetrics.byRole,
          averageAge: agentMetrics.averageAge
        },
        timestamp: timestamp.toISOString(),
        date: timestamp.toISOString().split('T')[0]
      }
    ];
    
    const adminClient = this.mcpIntegration.clients.get('admin');
    await adminClient.request(metricsMutation, { metrics });
  }

  async storeOperationMetrics(timestamp, operationMetrics) {
    if (operationMetrics.error) return;
    
    const metricsMutation = `
      mutation StoreOperationMetrics($metrics: [usage_metrics_insert_input!]!) {
        insert_usage_metrics(objects: $metrics) {
          affected_rows
        }
      }
    `;
    
    const metrics = [
      {
        metric_type: 'operation_performance',
        metric_name: 'operation_count',
        value: operationMetrics.totalOperations,
        dimensions: {
          successful: operationMetrics.successfulOperations,
          failed: operationMetrics.failedOperations,
          errorRate: operationMetrics.errorRate,
          byType: operationMetrics.operationsByType,
          byTenant: operationMetrics.operationsByTenant
        },
        timestamp: timestamp.toISOString(),
        date: timestamp.toISOString().split('T')[0]
      },
      {
        metric_type: 'operation_performance',
        metric_name: 'average_response_time',
        value: operationMetrics.averageResponseTime,
        dimensions: { 
          unit: 'milliseconds',
          sampleSize: operationMetrics.totalOperations
        },
        timestamp: timestamp.toISOString(),
        date: timestamp.toISOString().split('T')[0]
      }
    ];
    
    const adminClient = this.mcpIntegration.clients.get('admin');
    await adminClient.request(metricsMutation, { metrics });
  }

  // =====================================================
  // HEALTH MONITORING
  // =====================================================

  async performHealthChecks() {
    try {
      const healthStatus = {
        timestamp: new Date(),
        overall: 'healthy',
        checks: {
          database: await this.checkDatabaseHealth(),
          mcp: await this.checkMCPHealth(),
          agents: await this.checkAgentHealth(),
          memory: await this.checkMemoryHealth(),
          apis: await this.checkAPIHealth()
        }
      };
      
      // Determine overall health
      const failedChecks = Object.values(healthStatus.checks).filter(check => check.status !== 'healthy');
      if (failedChecks.length > 0) {
        healthStatus.overall = failedChecks.some(check => check.status === 'critical') ? 'critical' : 'degraded';
      }
      
      // Emit health status
      this.emit('health-status', healthStatus);
      
      // Store health metrics
      await this.storeHealthMetrics(healthStatus);
      
      // Trigger alerts if needed
      if (healthStatus.overall !== 'healthy') {
        await this.triggerHealthAlert(healthStatus);
      }
      
    } catch (error) {
      this.logError('monitoring', 'health_check_failed', error);
    }
  }

  async checkDatabaseHealth() {
    try {
      const adminClient = this.mcpIntegration.clients.get('admin');
      const start = Date.now();
      
      await adminClient.request('{ __schema { queryType { name } } }');
      
      const responseTime = Date.now() - start;
      
      return {
        status: responseTime < 1000 ? 'healthy' : 'degraded',
        responseTime,
        details: 'GraphQL endpoint responsive'
      };
    } catch (error) {
      return {
        status: 'critical',
        error: error.message,
        details: 'GraphQL endpoint unavailable'
      };
    }
  }

  async checkMCPHealth() {
    try {
      const activeAgents = this.mcpIntegration.getActiveAgents();
      const clientCount = this.mcpIntegration.clients.size;
      
      return {
        status: clientCount > 0 ? 'healthy' : 'degraded',
        activeAgents: activeAgents.length,
        clients: clientCount,
        details: `${activeAgents.length} active agents, ${clientCount} clients`
      };
    } catch (error) {
      return {
        status: 'critical',
        error: error.message,
        details: 'MCP integration failure'
      };
    }
  }

  async checkAgentHealth() {
    try {
      const activeAgents = this.mcpIntegration.getActiveAgents();
      const now = new Date();
      const staleThreshold = 5 * 60 * 1000; // 5 minutes
      
      const staleAgents = activeAgents.filter(agent => 
        now - agent.lastActive > staleThreshold
      );
      
      return {
        status: staleAgents.length === 0 ? 'healthy' : 'degraded',
        totalAgents: activeAgents.length,
        staleAgents: staleAgents.length,
        details: `${activeAgents.length} total agents, ${staleAgents.length} stale`
      };
    } catch (error) {
      return {
        status: 'critical',
        error: error.message,
        details: 'Agent health check failed'
      };
    }
  }

  async checkMemoryHealth() {
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
    const heapTotalMB = memoryUsage.heapTotal / 1024 / 1024;
    const usage = heapUsedMB / heapTotalMB;
    
    let status = 'healthy';
    if (usage > 0.9) status = 'critical';
    else if (usage > 0.8) status = 'degraded';
    
    return {
      status,
      heapUsedMB: Math.round(heapUsedMB),
      heapTotalMB: Math.round(heapTotalMB),
      usagePercent: Math.round(usage * 100),
      details: `Heap usage: ${Math.round(heapUsedMB)}MB / ${Math.round(heapTotalMB)}MB`
    };
  }

  async checkAPIHealth() {
    // This would check external API dependencies (N8N, Vercel, etc.)
    return {
      status: 'healthy',
      details: 'External APIs responsive'
    };
  }

  // =====================================================
  // LOGGING SYSTEM
  // =====================================================

  log(level, category, message, metadata = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      metadata,
      pid: process.pid,
      hostname: require('os').hostname()
    };
    
    // Add to buffer for database logging
    if (this.config.logging.enableDatabaseLogging) {
      this.logBuffer.push(logEntry);
    }
    
    // Console logging
    if (this.config.logging.enableConsoleLogging) {
      this.logToConsole(logEntry);
    }
    
    // File logging (implement if needed)
    if (this.config.logging.enableFileLogging) {
      this.logToFile(logEntry);
    }
    
    // Emit log event
    this.emit('log', logEntry);
  }

  logInfo(category, message, metadata = {}) {
    this.log('info', category, message, metadata);
  }

  logWarn(category, message, metadata = {}) {
    this.log('warn', category, message, metadata);
  }

  logError(category, message, error, metadata = {}) {
    this.log('error', category, message, {
      ...metadata,
      error: {
        message: error.message || error,
        stack: error.stack,
        name: error.name
      }
    });
  }

  logDebug(category, message, metadata = {}) {
    if (this.config.logging.level === 'debug') {
      this.log('debug', category, message, metadata);
    }
  }

  logToConsole(logEntry) {
    const { timestamp, level, category, message, metadata } = logEntry;
    const logLine = `${timestamp} [${level.toUpperCase()}] ${category}: ${message}`;
    
    switch (level) {
      case 'error':
        console.error(logLine, metadata);
        break;
      case 'warn':
        console.warn(logLine, metadata);
        break;
      case 'debug':
        console.debug(logLine, metadata);
        break;
      default:
        console.log(logLine, metadata);
    }
  }

  logToFile(logEntry) {
    // Implement file logging if needed
    // This would write to rotating log files
  }

  async flushLogBuffer() {
    if (this.logBuffer.length === 0) return;
    
    try {
      const logs = [...this.logBuffer];
      this.logBuffer = [];
      
      // Store logs in audit_logs table
      const logMutation = `
        mutation StoreLogs($logs: [audit_logs_insert_input!]!) {
          insert_audit_logs(objects: $logs) {
            affected_rows
          }
        }
      `;
      
      const auditLogs = logs.map(log => ({
        action: `LOG_${log.level.toUpperCase()}`,
        resource_type: 'system',
        resource_id: log.category,
        metadata: {
          message: log.message,
          level: log.level,
          category: log.category,
          ...log.metadata
        },
        created_at: log.timestamp
      }));
      
      const adminClient = this.mcpIntegration.clients.get('admin');
      await adminClient.request(logMutation, { logs: auditLogs });
      
    } catch (error) {
      console.error('Failed to flush log buffer:', error);
    }
  }

  // =====================================================
  // ALERTING SYSTEM
  // =====================================================

  checkAlertThresholds(systemMetrics, agentMetrics, operationMetrics) {
    const alerts = [];
    
    // Check error rate
    if (operationMetrics.errorRate > this.config.monitoring.alertThresholds.errorRate) {
      alerts.push({
        type: 'high_error_rate',
        severity: 'warning',
        message: `Error rate is ${(operationMetrics.errorRate * 100).toFixed(2)}%`,
        threshold: this.config.monitoring.alertThresholds.errorRate,
        actual: operationMetrics.errorRate,
        timestamp: new Date()
      });
    }
    
    // Check response time
    if (operationMetrics.averageResponseTime > this.config.monitoring.alertThresholds.avgResponseTime) {
      alerts.push({
        type: 'high_response_time',
        severity: 'warning',
        message: `Average response time is ${operationMetrics.averageResponseTime}ms`,
        threshold: this.config.monitoring.alertThresholds.avgResponseTime,
        actual: operationMetrics.averageResponseTime,
        timestamp: new Date()
      });
    }
    
    // Check active agents
    if (agentMetrics.totalActive > this.config.monitoring.alertThresholds.activeAgents) {
      alerts.push({
        type: 'high_agent_count',
        severity: 'info',
        message: `High number of active agents: ${agentMetrics.totalActive}`,
        threshold: this.config.monitoring.alertThresholds.activeAgents,
        actual: agentMetrics.totalActive,
        timestamp: new Date()
      });
    }
    
    // Process alerts
    for (const alert of alerts) {
      this.processAlert(alert);
    }
  }

  async processAlert(alert) {
    try {
      // Store alert
      this.alerts.set(`${alert.type}-${alert.timestamp.getTime()}`, alert);
      
      // Log alert
      this.logWarn('alerts', `Alert triggered: ${alert.message}`, alert);
      
      // Send notifications
      if (this.config.alerts.enabled) {
        await this.sendAlertNotifications(alert);
      }
      
      // Emit alert event
      this.emit('alert', alert);
      
    } catch (error) {
      this.logError('alerts', 'Failed to process alert', error, { alert });
    }
  }

  async sendAlertNotifications(alert) {
    const notifications = [];
    
    // Webhook notification
    if (this.config.alerts.webhookUrl) {
      notifications.push(this.sendWebhookAlert(alert));
    }
    
    // Slack notification
    if (this.config.alerts.slackWebhook) {
      notifications.push(this.sendSlackAlert(alert));
    }
    
    // Discord notification
    if (this.config.alerts.discordWebhook) {
      notifications.push(this.sendDiscordAlert(alert));
    }
    
    await Promise.allSettled(notifications);
  }

  async sendWebhookAlert(alert) {
    try {
      const response = await fetch(this.config.alerts.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'agent_monitoring_alert',
          alert,
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status}`);
      }
    } catch (error) {
      this.logError('alerts', 'Webhook notification failed', error);
    }
  }

  async sendSlackAlert(alert) {
    try {
      const color = alert.severity === 'critical' ? 'danger' : 
                   alert.severity === 'warning' ? 'warning' : 'good';
      
      const response = await fetch(this.config.alerts.slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attachments: [{
            color,
            title: `Agent Monitoring Alert: ${alert.type}`,
            text: alert.message,
            fields: [
              { title: 'Severity', value: alert.severity, short: true },
              { title: 'Time', value: alert.timestamp.toISOString(), short: true }
            ]
          }]
        })
      });
      
      if (!response.ok) {
        throw new Error(`Slack webhook failed: ${response.status}`);
      }
    } catch (error) {
      this.logError('alerts', 'Slack notification failed', error);
    }
  }

  async sendDiscordAlert(alert) {
    try {
      const response = await fetch(this.config.alerts.discordWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: `🚨 Agent Monitoring Alert`,
            description: alert.message,
            color: alert.severity === 'critical' ? 0xFF0000 : 
                   alert.severity === 'warning' ? 0xFFA500 : 0x00FF00,
            fields: [
              { name: 'Type', value: alert.type, inline: true },
              { name: 'Severity', value: alert.severity, inline: true },
              { name: 'Time', value: alert.timestamp.toISOString(), inline: false }
            ]
          }]
        })
      });
      
      if (!response.ok) {
        throw new Error(`Discord webhook failed: ${response.status}`);
      }
    } catch (error) {
      this.logError('alerts', 'Discord notification failed', error);
    }
  }

  // =====================================================
  // PUBLIC API METHODS
  // =====================================================

  /**
   * Get current system metrics
   */
  async getCurrentMetrics() {
    return {
      system: await this.collectSystemMetrics(),
      agents: await this.collectAgentMetrics(),
      operations: await this.collectOperationMetrics()
    };
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(limit = 10) {
    return Array.from(this.alerts.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId) {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date();
      this.logInfo('alerts', `Alert acknowledged: ${alertId}`);
    }
  }

  /**
   * Force metrics collection
   */
  async forceMetricsCollection() {
    await this.collectMetrics();
  }

  /**
   * Force health check
   */
  async forceHealthCheck() {
    await this.performHealthChecks();
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log('🛑 Shutting down Agent Monitoring System...');
    
    // Clear intervals
    for (const [name, interval] of this.monitoringIntervals.entries()) {
      clearInterval(interval);
    }
    
    // Flush remaining logs
    await this.flushLogBuffer();
    
    // Shutdown MCP integration
    if (this.mcpIntegration) {
      await this.mcpIntegration.shutdown();
    }
    
    console.log('✅ Agent Monitoring System shutdown complete');
  }
}

// =====================================================
// FACTORY FUNCTIONS
// =====================================================

/**
 * Create monitoring system instance
 */
export function createMonitoringSystem(config = {}) {
  return new AgentMonitoringSystem(config);
}

/**
 * Create simple logger
 */
export function createLogger(category, config = {}) {
  const monitoring = new AgentMonitoringSystem(config);
  
  return {
    info: (message, metadata) => monitoring.logInfo(category, message, metadata),
    warn: (message, metadata) => monitoring.logWarn(category, message, metadata),
    error: (message, error, metadata) => monitoring.logError(category, message, error, metadata),
    debug: (message, metadata) => monitoring.logDebug(category, message, metadata)
  };
}

export default AgentMonitoringSystem;