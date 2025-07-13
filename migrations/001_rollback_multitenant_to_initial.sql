-- =====================================================
-- Rollback Migration: 001_rollback_multitenant_to_initial.sql
-- Description: Rollback multi-tenant architecture to basic schema
-- Created: 2025-07-13
-- WARNING: This will result in data loss for multi-tenant features
-- =====================================================

-- Rollback metadata
INSERT INTO schema_migrations (version, description, applied_at) 
VALUES ('001_rollback', 'Rollback multi-tenant to initial schema', NOW());

BEGIN;

-- =====================================================
-- STEP 1: BACKUP CURRENT DATA
-- =====================================================

-- Create backup tables for rollback recovery
CREATE TABLE IF NOT EXISTS rollback_tenants AS SELECT * FROM tenants;
CREATE TABLE IF NOT EXISTS rollback_tenant_users AS SELECT * FROM tenant_users;
CREATE TABLE IF NOT EXISTS rollback_projects AS SELECT * FROM projects;
CREATE TABLE IF NOT EXISTS rollback_workflows AS SELECT * FROM workflows;
CREATE TABLE IF NOT EXISTS rollback_agents AS SELECT * FROM agents;

RAISE NOTICE 'Created backup tables for rollback recovery';

-- =====================================================
-- STEP 2: CREATE SIMPLE SCHEMA TABLES
-- =====================================================

-- Simple users table (original structure)
CREATE TABLE users_simple (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'deleted'))
);

-- Simple user_onboarding table (original structure)
CREATE TABLE user_onboarding_simple (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users_simple(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    start_date TIMESTAMP DEFAULT NOW(),
    current_step INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'started' CHECK (status IN ('started', 'in_progress', 'email_sequence_completed', 'completed', 'abandoned')),
    checklist JSONB DEFAULT '{}',
    last_email_sent TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- STEP 3: MIGRATE DATA TO SIMPLE SCHEMA
-- =====================================================

-- Migrate users from multi-tenant to simple schema
INSERT INTO users_simple (email, password_hash, created_at, status)
SELECT 
    u.email,
    u.password_hash,
    u.created_at,
    CASE u.status
        WHEN 'pending' THEN 'pending'
        WHEN 'active' THEN 'active'
        WHEN 'suspended' THEN 'suspended'
        WHEN 'deleted' THEN 'deleted'
        ELSE 'active'
    END
FROM users u
WHERE EXISTS (
    SELECT 1 FROM tenant_users tu 
    WHERE tu.user_id = u.id 
    AND tu.tenant_id = '550e8400-e29b-41d4-a716-446655440000' -- Default tenant
);

-- Migrate user_onboarding data
INSERT INTO user_onboarding_simple (user_id, email, start_date, current_step, status, checklist, last_email_sent, created_at)
SELECT 
    us.id,
    uo.email,
    uo.start_date,
    uo.current_step,
    uo.status,
    uo.checklist,
    uo.last_email_sent,
    uo.created_at
FROM user_onboarding uo
JOIN users u ON u.id = uo.user_id
JOIN users_simple us ON us.email = u.email
WHERE uo.tenant_id = '550e8400-e29b-41d4-a716-446655440000'; -- Default tenant only

RAISE NOTICE 'Migrated % users to simple schema', (SELECT COUNT(*) FROM users_simple);
RAISE NOTICE 'Migrated % onboarding records to simple schema', (SELECT COUNT(*) FROM user_onboarding_simple);

-- =====================================================
-- STEP 4: DROP MULTI-TENANT TABLES
-- =====================================================

-- Disable RLS first
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE agents DISABLE ROW LEVEL SECURITY;
ALTER TABLE workflows DISABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys DISABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE usage_metrics DISABLE ROW LEVEL SECURITY;

-- Drop RLS policies
DROP POLICY IF EXISTS tenant_access ON tenants;
DROP POLICY IF EXISTS tenant_users_access ON tenant_users;
DROP POLICY IF EXISTS projects_access ON projects;
DROP POLICY IF EXISTS agents_access ON agents;
DROP POLICY IF EXISTS workflows_access ON workflows;
DROP POLICY IF EXISTS workflow_executions_access ON workflow_executions;
DROP POLICY IF EXISTS user_onboarding_access ON user_onboarding;
DROP POLICY IF EXISTS user_sessions_access ON user_sessions;
DROP POLICY IF EXISTS api_keys_access ON api_keys;
DROP POLICY IF EXISTS audit_logs_read ON audit_logs;
DROP POLICY IF EXISTS usage_metrics_access ON usage_metrics;

-- Drop triggers
DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_tenant_users_updated_at ON tenant_users;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_agents_updated_at ON agents;
DROP TRIGGER IF EXISTS update_workflows_updated_at ON workflows;
DROP TRIGGER IF EXISTS audit_tenants ON tenants;
DROP TRIGGER IF EXISTS audit_projects ON projects;
DROP TRIGGER IF EXISTS audit_api_keys ON api_keys;

-- Drop functions
DROP FUNCTION IF EXISTS get_user_tenants(UUID);
DROP FUNCTION IF EXISTS can_access_tenant(UUID, UUID);
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS create_audit_log();

-- Drop multi-tenant tables (cascade to handle dependencies)
DROP TABLE IF EXISTS usage_metrics CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS rate_limits CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS user_onboarding CASCADE;
DROP TABLE IF EXISTS workflow_executions CASCADE;
DROP TABLE IF EXISTS workflows CASCADE;
DROP TABLE IF EXISTS agents CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS tenant_users CASCADE;
DROP TABLE IF EXISTS tenant_subscriptions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

RAISE NOTICE 'Dropped all multi-tenant tables';

-- =====================================================
-- STEP 5: RENAME SIMPLE TABLES TO ORIGINAL NAMES
-- =====================================================

-- Rename simple tables to original names
ALTER TABLE users_simple RENAME TO users;
ALTER TABLE user_onboarding_simple RENAME TO user_onboarding;

-- Update sequences for proper ID generation
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));
SELECT setval('user_onboarding_id_seq', (SELECT COALESCE(MAX(id), 1) FROM user_onboarding));

-- =====================================================
-- STEP 6: CREATE BASIC INDEXES
-- =====================================================

-- Basic indexes for performance
CREATE INDEX idx_users_email_simple ON users(email);
CREATE INDEX idx_users_status_simple ON users(status);
CREATE INDEX idx_user_onboarding_user_id_simple ON user_onboarding(user_id);
CREATE INDEX idx_user_onboarding_email_simple ON user_onboarding(email);
CREATE INDEX idx_user_onboarding_status_simple ON user_onboarding(status);

-- =====================================================
-- STEP 7: DROP EXTENSIONS (IF NOT USED ELSEWHERE)
-- =====================================================

-- Note: Only drop extensions if they're not used by other parts of the system
-- DROP EXTENSION IF EXISTS "uuid-ossp";
-- DROP EXTENSION IF EXISTS "pgcrypto";

COMMIT;

-- =====================================================
-- ROLLBACK VALIDATION
-- =====================================================

DO $$
DECLARE
    user_count INTEGER;
    onboarding_count INTEGER;
BEGIN
    -- Count migrated data
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO onboarding_count FROM user_onboarding;
    
    RAISE NOTICE 'Rollback completed successfully:';
    RAISE NOTICE '- Users in simple schema: %', user_count;
    RAISE NOTICE '- Onboarding records in simple schema: %', onboarding_count;
    RAISE NOTICE '- Backup tables preserved for recovery';
    
    IF user_count = 0 THEN
        RAISE WARNING 'No users found in simple schema - check backup tables!';
    END IF;
END $$;

-- =====================================================
-- RECOVERY INSTRUCTIONS
-- =====================================================

/*
RECOVERY INSTRUCTIONS:

If you need to recover multi-tenant data after this rollback:

1. The following backup tables contain your multi-tenant data:
   - rollback_tenants
   - rollback_tenant_users  
   - rollback_projects
   - rollback_workflows
   - rollback_agents

2. To recover, you can:
   a) Run the forward migration again (001_initial_to_multitenant.sql)
   b) Restore data from backup tables
   c) Re-establish tenant relationships

3. Example recovery query:
   ```sql
   -- Restore a specific tenant's data
   SELECT * FROM rollback_tenants WHERE slug = 'your-tenant-slug';
   SELECT * FROM rollback_projects WHERE tenant_id = 'your-tenant-id';
   ```

4. To clean up backup tables (ONLY after confirming successful rollback):
   ```sql
   DROP TABLE rollback_tenants;
   DROP TABLE rollback_tenant_users;
   DROP TABLE rollback_projects;
   DROP TABLE rollback_workflows;
   DROP TABLE rollback_agents;
   ```

WARNING: This rollback loses multi-tenant isolation and advanced features.
Only proceed if you're certain you want to return to the simple schema.
*/