'use client';

import { useState } from 'react';
import { 
  useAgentStatusUpdates, 
  useLiveWorkflowExecutions, 
  useDashboardActivity,
  useNotifications 
} from '@/hooks/use-subscriptions';

export function RealTimeFeed() {
  const [activeTab, setActiveTab] = useState<'agents' | 'workflows' | 'activity'>('agents');
  
  const { data: agentData } = useAgentStatusUpdates();
  const { data: workflowData } = useLiveWorkflowExecutions();
  const { data: activityData } = useDashboardActivity();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'queued':
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Real-Time Activity
        </h3>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('agents')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'agents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Agent Status
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                {agentData?.agents?.length || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('workflows')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'workflows'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Live Workflows
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                {workflowData?.workflow_executions?.length || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'activity'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Activity Feed
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                {activityData?.audit_logs?.length || 0}
              </span>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {activeTab === 'agents' && (
            <div className="space-y-3">
              {agentData?.agents?.map((agent: any) => (
                <div key={agent.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.169.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.611L5 14.5" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                      <p className="text-xs text-gray-500">{agent.project.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                      {agent.status}
                    </span>
                    <span className="text-xs text-gray-500">{formatTime(agent.updated_at)}</span>
                  </div>
                </div>
              ))}
              {(!agentData?.agents || agentData.agents.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">No active agents</p>
              )}
            </div>
          )}

          {activeTab === 'workflows' && (
            <div className="space-y-3">
              {workflowData?.workflow_executions?.map((execution: any) => (
                <div key={execution.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.25-4.875c.376.023.75.05 1.124.08.652.094 1.147.417 1.402.996a3.002 3.002 0 01-.101 2.557l-.709 1.183.851.212c.537.134.86.615.86 1.177v1.177a3.001 3.001 0 01-1.177 2.383l-1.383.919A3.002 3.002 0 0112 21.75a3.002 3.002 0 01-2.83-2.013l-1.382-.919A3.002 3.002 0 016.75 16.435v-1.177c0-.562.323-1.043.86-1.177l.851-.212-.709-1.183a3.002 3.002 0 01-.101-2.557c.255-.579.75-.902 1.402-.996.374-.03.748-.057 1.124-.08M15 6.75a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{execution.workflow.name}</p>
                      <p className="text-xs text-gray-500">{execution.workflow.project.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(execution.status)}`}>
                      {execution.status}
                    </span>
                    <span className="text-xs text-gray-500">{formatTime(execution.started_at)}</span>
                  </div>
                </div>
              ))}
              {(!workflowData?.workflow_executions || workflowData.workflow_executions.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">No running workflows</p>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-3">
              {activityData?.audit_logs?.map((activity: any) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action.replace('_', ' ')} {activity.resource_type}
                      </p>
                      <p className="text-xs text-gray-500">by {activity.user.full_name}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{formatTime(activity.created_at)}</span>
                </div>
              ))}
              {(!activityData?.audit_logs || activityData.audit_logs.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function NotificationCenter() {
  const { data, markAsRead } = useNotifications();

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Notifications
          {data?.user_notifications?.length > 0 && (
            <span className="ml-2 bg-red-100 text-red-800 py-0.5 px-2.5 rounded-full text-xs">
              {data.user_notifications.filter((n: any) => !n.read_at).length}
            </span>
          )}
        </h3>
        
        <div className="max-h-64 overflow-y-auto space-y-2">
          {data?.user_notifications?.map((notification: any) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg border cursor-pointer ${
                notification.read_at 
                  ? 'bg-gray-50 border-gray-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}
              onClick={() => !notification.read_at && markAsRead(notification.id)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {notification.metadata?.title || notification.action.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {notification.metadata?.message || 'System notification'}
                  </p>
                </div>
                {!notification.read_at && (
                  <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                )}
              </div>
            </div>
          ))}
          {(!data?.user_notifications || data.user_notifications.length === 0) && (
            <p className="text-sm text-gray-500 text-center py-4">No notifications</p>
          )}
        </div>
      </div>
    </div>
  );
}