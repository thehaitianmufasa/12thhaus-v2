-- =====================================================
-- Performance Indexes for Multi-Tenant Architecture
-- LangGraph Multi-Agent Platform
-- Optimized for tenant isolation and query performance
-- =====================================================

-- =====================================================
-- CORE TENANT INDEXES
-- =====================================================

-- Tenant table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenants_slug_active 
ON tenants(slug) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenants_status_created 
ON tenants(status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenants_plan_type 
ON tenants(plan_type) WHERE status = 'active';

-- Tenant subscription indexes for billing queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_subscriptions_tenant_status 
ON tenant_subscriptions(tenant_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_subscriptions_stripe 
ON tenant_subscriptions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_subscriptions_expiry 
ON tenant_subscriptions(current_period_end) WHERE status IN ('active', 'trialing');

-- =====================================================
-- USER & AUTHENTICATION INDEXES
-- =====================================================

-- User table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_verified 
ON users(email) WHERE email_verified = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_status_last_login 
ON users(status, last_login_at DESC NULLS LAST);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_status 
ON users(created_at DESC, status);

-- Tenant-User relationship indexes (critical for RLS)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_users_user_tenant_active 
ON tenant_users(user_id, tenant_id) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_users_tenant_role 
ON tenant_users(tenant_id, role) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_users_invited_by 
ON tenant_users(invited_by, created_at DESC) WHERE invited_by IS NOT NULL;

-- User session indexes for security
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_token 
ON user_sessions(session_token) WHERE expires_at > NOW();

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_user_active 
ON user_sessions(user_id, last_activity DESC) WHERE expires_at > NOW();

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_tenant_user 
ON user_sessions(tenant_id, user_id, last_activity DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_cleanup 
ON user_sessions(expires_at) WHERE expires_at < NOW();

-- =====================================================
-- APPLICATION DATA INDEXES
-- =====================================================

-- Projects table indexes (heavily queried)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_tenant_status 
ON projects(tenant_id, status, updated_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_created_by_date 
ON projects(tenant_id, created_by, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_type_status 
ON projects(tenant_id, project_type, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_deployment_url 
ON projects(deployment_url) WHERE deployment_url IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_github_repo 
ON projects(github_repo) WHERE github_repo IS NOT NULL;

-- Compound index for project search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_search 
ON projects(tenant_id, name, description) WHERE status != 'archived';

-- Agents table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agents_tenant_type 
ON agents(tenant_id, agent_type, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agents_project_type 
ON agents(tenant_id, project_id, agent_type) WHERE project_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agents_last_execution 
ON agents(tenant_id, last_execution DESC NULLS LAST) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agents_execution_count 
ON agents(tenant_id, execution_count DESC) WHERE status = 'active';

-- Workflows table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workflows_tenant_type 
ON workflows(tenant_id, workflow_type, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workflows_project_active 
ON workflows(tenant_id, project_id, status) WHERE project_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workflows_n8n_id 
ON workflows(n8n_workflow_id) WHERE n8n_workflow_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workflows_last_triggered 
ON workflows(tenant_id, last_triggered DESC NULLS LAST) WHERE status = 'active';

-- Workflow executions indexes (high volume table)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workflow_executions_tenant_date 
ON workflow_executions(tenant_id, started_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workflow_executions_workflow_status 
ON workflow_executions(tenant_id, workflow_id, status, started_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workflow_executions_triggered_by 
ON workflow_executions(tenant_id, triggered_by, started_at DESC) WHERE triggered_by IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workflow_executions_n8n_id 
ON workflow_executions(n8n_execution_id) WHERE n8n_execution_id IS NOT NULL;

-- Index for performance monitoring
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workflow_executions_performance 
ON workflow_executions(tenant_id, execution_time_ms DESC, started_at DESC) WHERE status = 'success';

-- =====================================================
-- USER EXPERIENCE INDEXES
-- =====================================================

-- User onboarding indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_onboarding_tenant_status 
ON user_onboarding(tenant_id, status, start_date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_onboarding_completion 
ON user_onboarding(tenant_id, completion_percentage DESC, updated_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_onboarding_step 
ON user_onboarding(tenant_id, current_step, status) WHERE status != 'completed';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_onboarding_abandoned 
ON user_onboarding(tenant_id, updated_at) WHERE status = 'abandoned';

-- =====================================================
-- SECURITY & API INDEXES
-- =====================================================

-- API keys indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_keys_tenant_user 
ON api_keys(tenant_id, user_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_keys_prefix 
ON api_keys(key_prefix) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_keys_last_used 
ON api_keys(tenant_id, last_used_at DESC NULLS LAST) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_keys_expiry 
ON api_keys(expires_at) WHERE expires_at IS NOT NULL AND status = 'active';

-- Rate limiting indexes (high frequency access)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rate_limits_api_key_window 
ON rate_limits(api_key_id, window_start, window_end) WHERE api_key_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rate_limits_user_endpoint 
ON rate_limits(tenant_id, user_id, endpoint, window_start) WHERE user_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rate_limits_cleanup 
ON rate_limits(window_end) WHERE window_end < NOW();

-- =====================================================
-- AUDIT & ANALYTICS INDEXES
-- =====================================================

-- Audit logs indexes (compliance and security)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_tenant_date 
ON audit_logs(tenant_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_action 
ON audit_logs(tenant_id, user_id, action, created_at DESC) WHERE user_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_resource 
ON audit_logs(tenant_id, resource_type, resource_id, created_at DESC) WHERE resource_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_ip_address 
ON audit_logs(ip_address, created_at DESC) WHERE ip_address IS NOT NULL;

-- Partial index for security events
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_security_events 
ON audit_logs(tenant_id, created_at DESC) 
WHERE action IN ('LOGIN', 'LOGOUT', 'API_KEY_CREATED', 'PASSWORD_CHANGED');

-- Usage metrics indexes (analytics queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_usage_metrics_tenant_date_type 
ON usage_metrics(tenant_id, date DESC, metric_type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_usage_metrics_tenant_metric 
ON usage_metrics(tenant_id, metric_name, timestamp DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_usage_metrics_user_date 
ON usage_metrics(tenant_id, user_id, date DESC) WHERE user_id IS NOT NULL;

-- Partial index for aggregation queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_usage_metrics_aggregation 
ON usage_metrics(tenant_id, metric_type, date) WHERE value IS NOT NULL;

-- =====================================================
-- COMPOSITE INDEXES FOR COMPLEX QUERIES
-- =====================================================

-- Multi-tenant dashboard queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dashboard_projects_overview 
ON projects(tenant_id, status, created_at DESC, created_by);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dashboard_workflows_activity 
ON workflow_executions(tenant_id, status, started_at DESC, workflow_id);

-- User activity tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_activity_tracking 
ON audit_logs(tenant_id, user_id, created_at DESC) 
WHERE action NOT IN ('SELECT', 'VIEW');

-- Performance monitoring
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_performance_monitoring 
ON workflow_executions(tenant_id, workflow_id, execution_time_ms DESC, started_at DESC) 
WHERE status = 'success' AND execution_time_ms IS NOT NULL;

-- =====================================================
-- JSONB INDEXES FOR METADATA QUERIES
-- =====================================================

-- Projects tech stack queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_tech_stack_gin 
ON projects USING GIN(tech_stack) WHERE tech_stack IS NOT NULL;

-- Agent configuration queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agents_configuration_gin 
ON agents USING GIN(configuration) WHERE configuration IS NOT NULL;

-- Workflow configuration queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workflows_configuration_gin 
ON workflows USING GIN(configuration) WHERE configuration IS NOT NULL;

-- User onboarding checklist queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_onboarding_checklist_gin 
ON user_onboarding USING GIN(checklist) WHERE checklist IS NOT NULL;

-- Usage metrics dimensions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_usage_metrics_dimensions_gin 
ON usage_metrics USING GIN(dimensions) WHERE dimensions IS NOT NULL;

-- =====================================================
-- TEXT SEARCH INDEXES
-- =====================================================

-- Project name and description search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_text_search 
ON projects USING GIN(to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, '')));

-- Workflow name search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workflows_text_search 
ON workflows USING GIN(to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, '')));

-- Agent name search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agents_text_search 
ON agents USING GIN(to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, '')));

-- =====================================================
-- UNIQUE CONSTRAINTS & INDEXES
-- =====================================================

-- Ensure unique API key prefixes per tenant
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_api_keys_tenant_prefix_unique 
ON api_keys(tenant_id, key_prefix) WHERE status = 'active';

-- Ensure unique workflow N8N IDs
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_workflows_n8n_id_unique 
ON workflows(n8n_workflow_id) WHERE n8n_workflow_id IS NOT NULL;

-- Ensure unique session tokens
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_token_unique 
ON user_sessions(session_token) WHERE expires_at > NOW();

-- =====================================================
-- MAINTENANCE INDEXES
-- =====================================================

-- Cleanup old sessions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cleanup_expired_sessions 
ON user_sessions(expires_at) WHERE expires_at < NOW() - INTERVAL '1 day';

-- Cleanup old rate limit records
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cleanup_old_rate_limits 
ON rate_limits(window_end) WHERE window_end < NOW() - INTERVAL '1 hour';

-- Archive old audit logs
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_archive_old_audit_logs 
ON audit_logs(created_at) WHERE created_at < NOW() - INTERVAL '90 days';

-- =====================================================
-- QUERY OPTIMIZATION HINTS
-- =====================================================

/*
PERFORMANCE OPTIMIZATION NOTES:

1. TENANT ISOLATION QUERIES:
   - Always include tenant_id in WHERE clauses
   - Use (tenant_id, other_columns) composite indexes
   - Consider tenant_id as the first column in multi-column indexes

2. PAGINATION QUERIES:
   - Use cursor-based pagination with (tenant_id, id) or (tenant_id, created_at, id)
   - Avoid OFFSET for large datasets

3. SEARCH QUERIES:
   - Use GIN indexes for JSONB and full-text search
   - Combine text search with tenant_id filtering

4. ANALYTICS QUERIES:
   - Pre-aggregate data in usage_metrics table
   - Use date-based partitioning for time-series data
   - Consider materialized views for complex reports

5. REAL-TIME QUERIES:
   - Use partial indexes for active/non-archived records
   - Index frequently updated timestamps (last_activity, updated_at)

6. MAINTENANCE:
   - Run VACUUM ANALYZE regularly on high-write tables
   - Monitor index usage with pg_stat_user_indexes
   - Drop unused indexes to reduce write overhead

EXAMPLE OPTIMIZED QUERIES:

-- Get user's active projects
SELECT * FROM projects 
WHERE tenant_id = $1 AND status = 'active' 
ORDER BY updated_at DESC LIMIT 20;
-- Uses: idx_projects_tenant_status

-- Get recent workflow executions for a project
SELECT * FROM workflow_executions we
JOIN workflows w ON w.id = we.workflow_id
WHERE we.tenant_id = $1 AND w.project_id = $2
AND we.started_at > NOW() - INTERVAL '7 days'
ORDER BY we.started_at DESC LIMIT 50;
-- Uses: idx_workflow_executions_tenant_date, idx_workflows_project_active

-- Search projects by name
SELECT * FROM projects
WHERE tenant_id = $1 
AND to_tsvector('english', name || ' ' || description) @@ plainto_tsquery('english', $2)
AND status != 'archived'
ORDER BY updated_at DESC;
-- Uses: idx_projects_text_search, idx_projects_tenant_status
*/

-- =====================================================
-- INDEX STATISTICS VIEW
-- =====================================================

CREATE OR REPLACE VIEW index_usage_stats AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    ROUND(
        CASE 
            WHEN idx_scan = 0 THEN 0 
            ELSE idx_tup_read::NUMERIC / idx_scan 
        END, 2
    ) as avg_tuples_per_scan,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC, pg_relation_size(indexrelid) DESC;

-- =====================================================
-- INDEX MONITORING QUERIES
-- =====================================================

/*
-- Check index usage statistics
SELECT * FROM index_usage_stats;

-- Find unused indexes (potential candidates for removal)
SELECT 
    schemaname, tablename, indexname, 
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes 
WHERE schemaname = 'public' AND idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;

-- Check table sizes and index ratios
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(tablename::regclass)) as total_size,
    pg_size_pretty(pg_relation_size(tablename::regclass)) as table_size,
    pg_size_pretty(pg_total_relation_size(tablename::regclass) - pg_relation_size(tablename::regclass)) as index_size,
    ROUND(
        (pg_total_relation_size(tablename::regclass) - pg_relation_size(tablename::regclass))::NUMERIC / 
        pg_relation_size(tablename::regclass) * 100, 2
    ) as index_ratio_percent
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC;
*/

COMMENT ON VIEW index_usage_stats IS 'Monitor index usage and performance statistics for optimization';