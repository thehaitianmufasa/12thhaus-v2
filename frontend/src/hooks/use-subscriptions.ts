'use client';

import { useSubscription } from '@apollo/client';
import { useAuth } from './use-auth';
import { useEffect, useState } from 'react';

// Mock GraphQL subscription documents - will be replaced with generated types
const PROJECT_UPDATES_SUBSCRIPTION = `
  subscription ProjectUpdates($tenant_id: uuid!) {
    projects(
      where: {tenant_id: {_eq: $tenant_id}}
      order_by: {updated_at: desc}
    ) {
      id
      name
      status
      updated_at
      agents_aggregate {
        aggregate {
          count
        }
      }
      workflows_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`;

const AGENT_STATUS_UPDATES_SUBSCRIPTION = `
  subscription AllAgentUpdates($tenant_id: uuid!) {
    agents(
      where: {tenant_id: {_eq: $tenant_id}}
      order_by: {updated_at: desc}
    ) {
      id
      name
      type
      status
      updated_at
      project {
        id
        name
      }
    }
  }
`;

const WORKFLOW_EXECUTION_UPDATES_SUBSCRIPTION = `
  subscription LiveWorkflowExecutions($tenant_id: uuid!) {
    workflow_executions(
      where: {
        tenant_id: {_eq: $tenant_id}
        status: {_in: ["running", "queued"]}
      }
      order_by: {started_at: desc}
    ) {
      id
      status
      started_at
      workflow {
        id
        name
        project {
          id
          name
        }
      }
    }
  }
`;

const DASHBOARD_ACTIVITY_SUBSCRIPTION = `
  subscription DashboardActivityFeed($tenant_id: uuid!) {
    audit_logs(
      where: {tenant_id: {_eq: $tenant_id}}
      order_by: {created_at: desc}
      limit: 20
    ) {
      id
      action
      resource_type
      resource_id
      changes
      created_at
      user {
        id
        full_name
        email
      }
    }
  }
`;

export function useProjectUpdates() {
  const { tenantId } = useAuth();
  const [projects, setProjects] = useState([]);

  // Mock subscription for now - will be replaced with actual useSubscription
  useEffect(() => {
    if (!tenantId) return;

    // Simulate real-time updates
    const interval = setInterval(() => {
      // Mock project data updates
      const mockProjects = [
        {
          id: '1',
          name: 'E-commerce Assistant',
          status: 'active',
          updated_at: new Date().toISOString(),
          agents_aggregate: { aggregate: { count: 5 } },
          workflows_aggregate: { aggregate: { count: 3 } },
        },
        {
          id: '2',
          name: 'Customer Support Bot',
          status: 'active',
          updated_at: new Date(Date.now() - 300000).toISOString(),
          agents_aggregate: { aggregate: { count: 8 } },
          workflows_aggregate: { aggregate: { count: 5 } },
        },
      ];
      setProjects(mockProjects as any);
    }, 5000);

    return () => clearInterval(interval);
  }, [tenantId]);

  return {
    data: { projects },
    loading: false,
    error: null,
  };
}

export function useAgentStatusUpdates() {
  const { tenantId } = useAuth();
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    if (!tenantId) return;

    // Simulate agent status updates
    const interval = setInterval(() => {
      const mockAgents = [
        {
          id: '1',
          name: 'Customer Service Agent',
          type: 'support',
          status: Math.random() > 0.8 ? 'error' : 'active',
          updated_at: new Date().toISOString(),
          project: { id: '1', name: 'E-commerce Assistant' },
        },
        {
          id: '2',
          name: 'Order Processing Agent',
          type: 'automation',
          status: 'active',
          updated_at: new Date(Date.now() - 120000).toISOString(),
          project: { id: '1', name: 'E-commerce Assistant' },
        },
        {
          id: '3',
          name: 'Language Detection Agent',
          type: 'nlp',
          status: 'active',
          updated_at: new Date(Date.now() - 180000).toISOString(),
          project: { id: '2', name: 'Customer Support Bot' },
        },
      ];
      setAgents(mockAgents as any);
    }, 3000);

    return () => clearInterval(interval);
  }, [tenantId]);

  return {
    data: { agents },
    loading: false,
    error: null,
  };
}

export function useLiveWorkflowExecutions() {
  const { tenantId } = useAuth();
  const [executions, setExecutions] = useState([]);

  useEffect(() => {
    if (!tenantId) return;

    // Simulate live workflow executions
    const interval = setInterval(() => {
      const mockExecutions = [
        {
          id: `exec-${Date.now()}`,
          status: Math.random() > 0.7 ? 'running' : 'queued',
          started_at: new Date().toISOString(),
          workflow: {
            id: '1',
            name: 'Customer Onboarding',
            project: { id: '1', name: 'E-commerce Assistant' },
          },
        },
        {
          id: `exec-${Date.now() - 1000}`,
          status: 'running',
          started_at: new Date(Date.now() - 45000).toISOString(),
          workflow: {
            id: '2',
            name: 'Support Ticket Classification',
            project: { id: '2', name: 'Customer Support Bot' },
          },
        },
      ];
      setExecutions(mockExecutions as any);
    }, 8000);

    return () => clearInterval(interval);
  }, [tenantId]);

  return {
    data: { workflow_executions: executions },
    loading: false,
    error: null,
  };
}

export function useDashboardActivity() {
  const { tenantId } = useAuth();
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (!tenantId) return;

    // Simulate activity feed updates
    const interval = setInterval(() => {
      const actions = ['project_created', 'agent_started', 'workflow_completed', 'user_invited'];
      const resources = ['project', 'agent', 'workflow', 'user'];
      
      const newActivity = {
        id: `activity-${Date.now()}`,
        action: actions[Math.floor(Math.random() * actions.length)],
        resource_type: resources[Math.floor(Math.random() * resources.length)],
        resource_id: `resource-${Math.floor(Math.random() * 100)}`,
        changes: { status: 'updated' },
        created_at: new Date().toISOString(),
        user: {
          id: '1',
          full_name: 'System',
          email: 'system@platform.com',
        },
      };

      setActivities(prev => [newActivity, ...prev.slice(0, 19)] as any);
    }, 12000);

    return () => clearInterval(interval);
  }, [tenantId]);

  return {
    data: { audit_logs: activities },
    loading: false,
    error: null,
  };
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    // Simulate notifications
    const interval = setInterval(() => {
      const notificationTypes = [
        'agent_failed',
        'workflow_completed',
        'project_created',
        'invitation_received',
      ];

      if (Math.random() > 0.7) {
        const newNotification = {
          id: `notif-${Date.now()}`,
          action: notificationTypes[Math.floor(Math.random() * notificationTypes.length)],
          resource_type: 'system',
          resource_id: `resource-${Math.floor(Math.random() * 100)}`,
          metadata: { title: 'System Update', message: 'Your workflow has completed successfully.' },
          created_at: new Date().toISOString(),
          read_at: null,
        };

        setNotifications(prev => [newNotification, ...prev.slice(0, 9)] as any);
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [user]);

  return {
    data: { user_notifications: notifications },
    loading: false,
    error: null,
    markAsRead: (notificationId: string) => {
      setNotifications(prev =>
        prev.map((notif: any) =>
          notif.id === notificationId
            ? { ...notif, read_at: new Date().toISOString() }
            : notif
        )
      );
    },
  };
}

export function useSystemHealth() {
  const { tenantId } = useAuth();
  const [health, setHealth] = useState({
    activeAgents: 0,
    runningWorkflows: 0,
    failedWorkflows: 0,
  });

  useEffect(() => {
    if (!tenantId) return;

    // Simulate system health metrics
    const interval = setInterval(() => {
      setHealth({
        activeAgents: Math.floor(Math.random() * 50) + 10,
        runningWorkflows: Math.floor(Math.random() * 20) + 2,
        failedWorkflows: Math.floor(Math.random() * 5),
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [tenantId]);

  return {
    data: {
      agents_aggregate: { aggregate: { count: health.activeAgents } },
      workflow_executions_aggregate: { aggregate: { count: health.runningWorkflows } },
      failed_workflows: { aggregate: { count: health.failedWorkflows } },
    },
    loading: false,
    error: null,
  };
}