-- =====================================================
-- Migration: 001_initial_to_multitenant.sql
-- Description: Migrate from basic schema to multi-tenant architecture
-- Created: 2025-07-13
-- =====================================================

-- Migration metadata
INSERT INTO schema_migrations (version, description, applied_at) 
VALUES ('001', 'Initial to multi-tenant migration', NOW());

BEGIN;

-- =====================================================
-- STEP 1: CREATE EXTENSIONS
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- STEP 2: CREATE CORE TENANT TABLES
-- =====================================================

-- Create tenants table
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    domain VARCHAR(255),
    plan_type VARCHAR(50) DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'enterprise')),
    max_users INTEGER DEFAULT 5,
    max_projects INTEGER DEFAULT 3,
    max_workflows INTEGER DEFAULT 10,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled'))
);

-- Create tenant_subscriptions table
CREATE TABLE tenant_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plan_type VARCHAR(50) NOT NULL,
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    trial_start TIMESTAMP,
    trial_end TIMESTAMP,
    status VARCHAR(20) DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'past_due', 'cancelled', 'unpaid')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- STEP 3: BACKUP EXISTING DATA
-- =====================================================

-- Backup existing users table (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        CREATE TABLE users_backup AS SELECT * FROM users;
        RAISE NOTICE 'Created backup of existing users table';
    END IF;
END $$;

-- Backup existing user_onboarding table (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_onboarding') THEN
        CREATE TABLE user_onboarding_backup AS SELECT * FROM user_onboarding;
        RAISE NOTICE 'Created backup of existing user_onboarding table';
    END IF;
END $$;

-- =====================================================
-- STEP 4: DROP EXISTING TABLES (IF THEY EXIST)
-- =====================================================

DROP TABLE IF EXISTS user_onboarding CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================
-- STEP 5: CREATE ENHANCED USER TABLES
-- =====================================================

-- Enhanced users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    phone VARCHAR(20),
    timezone VARCHAR(50) DEFAULT 'UTC',
    locale VARCHAR(10) DEFAULT 'en',
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'deleted'))
);

-- Tenant-User relationships
CREATE TABLE tenant_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    permissions JSONB DEFAULT '{}',
    invited_by UUID REFERENCES users(id),
    invited_at TIMESTAMP,
    joined_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, user_id)
);

-- =====================================================
-- STEP 6: CREATE APPLICATION TABLES
-- =====================================================

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_type VARCHAR(50) DEFAULT 'web-app' CHECK (project_type IN ('web-app', 'api', 'saas', 'dashboard')),
    prd_content TEXT,
    tech_stack JSONB DEFAULT '{}',
    repository_url TEXT,
    deployment_url TEXT,
    vercel_project_id VARCHAR(255),
    github_repo VARCHAR(255),
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'initializing' CHECK (status IN ('initializing', 'generating', 'ready', 'deploying', 'deployed', 'error', 'archived')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Agents table
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    agent_type VARCHAR(100) NOT NULL CHECK (agent_type IN ('code_generation', 'deployment', 'business_intelligence', 'customer_operations', 'marketing_automation')),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    configuration JSONB DEFAULT '{}',
    state JSONB DEFAULT '{}',
    last_execution TIMESTAMP,
    execution_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error', 'disabled')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Workflows table
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    workflow_type VARCHAR(100) NOT NULL,
    n8n_workflow_id VARCHAR(255),
    configuration JSONB DEFAULT '{}',
    trigger_config JSONB DEFAULT '{}',
    last_triggered TIMESTAMP,
    execution_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error', 'disabled')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Workflow executions table
CREATE TABLE workflow_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    triggered_by UUID REFERENCES users(id),
    n8n_execution_id VARCHAR(255),
    input_data JSONB,
    output_data JSONB,
    execution_time_ms INTEGER,
    status VARCHAR(20) NOT NULL CHECK (status IN ('running', 'success', 'error', 'cancelled')),
    error_message TEXT,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- =====================================================
-- STEP 7: CREATE USER EXPERIENCE TABLES
-- =====================================================

-- Enhanced user onboarding
CREATE TABLE user_onboarding (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    start_date TIMESTAMP DEFAULT NOW(),
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER DEFAULT 5,
    checklist JSONB DEFAULT '{}',
    last_email_sent TIMESTAMP,
    completion_percentage INTEGER DEFAULT 0,
    completed_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'started' CHECK (status IN ('started', 'in_progress', 'email_sequence_completed', 'completed', 'abandoned')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, user_id)
);

-- User sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    location JSONB,
    expires_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- STEP 8: CREATE SECURITY TABLES
-- =====================================================

-- API keys
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    key_prefix VARCHAR(20) NOT NULL,
    permissions JSONB DEFAULT '{}',
    last_used_at TIMESTAMP,
    usage_count INTEGER DEFAULT 0,
    rate_limit INTEGER DEFAULT 1000,
    expires_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Rate limiting
CREATE TABLE rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    endpoint VARCHAR(255) NOT NULL,
    requests_count INTEGER DEFAULT 1,
    window_start TIMESTAMP DEFAULT NOW(),
    window_end TIMESTAMP DEFAULT NOW() + INTERVAL '1 hour'
);

-- =====================================================
-- STEP 9: CREATE AUDIT & ANALYTICS TABLES
-- =====================================================

-- Audit logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Usage metrics
CREATE TABLE usage_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    metric_type VARCHAR(100) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    value NUMERIC,
    dimensions JSONB DEFAULT '{}',
    timestamp TIMESTAMP DEFAULT NOW(),
    date DATE DEFAULT CURRENT_DATE
);

-- =====================================================
-- STEP 10: MIGRATE EXISTING DATA
-- =====================================================

-- Create default tenant for existing data
INSERT INTO tenants (id, name, slug, plan_type, max_users, max_projects)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Default Tenant', 'default', 'pro', 100, 50)
ON CONFLICT (slug) DO NOTHING;

-- Migrate users from backup (if exists)
DO $$
DECLARE
    backup_record RECORD;
    new_user_id UUID;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users_backup') THEN
        FOR backup_record IN SELECT * FROM users_backup LOOP
            -- Insert user with new UUID
            INSERT INTO users (
                email, 
                password_hash, 
                email_verified, 
                created_at, 
                status
            ) VALUES (
                backup_record.email,
                backup_record.password_hash,
                COALESCE(backup_record.email_verified, FALSE),
                backup_record.created_at,
                CASE backup_record.status
                    WHEN 'pending' THEN 'pending'
                    WHEN 'active' THEN 'active'
                    ELSE 'active'
                END
            ) RETURNING id INTO new_user_id;
            
            -- Connect user to default tenant
            INSERT INTO tenant_users (tenant_id, user_id, role, status)
            VALUES ('550e8400-e29b-41d4-a716-446655440000', new_user_id, 'member', 'active');
            
            RAISE NOTICE 'Migrated user: %', backup_record.email;
        END LOOP;
    END IF;
END $$;

-- Migrate user_onboarding from backup (if exists)
DO $$
DECLARE
    backup_record RECORD;
    tenant_uuid UUID := '550e8400-e29b-41d4-a716-446655440000';
    user_uuid UUID;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_onboarding_backup') THEN
        FOR backup_record IN SELECT * FROM user_onboarding_backup LOOP
            -- Find migrated user by email
            SELECT u.id INTO user_uuid 
            FROM users u 
            WHERE u.email = backup_record.email 
            LIMIT 1;
            
            IF user_uuid IS NOT NULL THEN
                INSERT INTO user_onboarding (
                    tenant_id,
                    user_id,
                    email,
                    start_date,
                    current_step,
                    checklist,
                    status,
                    created_at
                ) VALUES (
                    tenant_uuid,
                    user_uuid,
                    backup_record.email,
                    backup_record.start_date,
                    backup_record.current_step,
                    backup_record.checklist,
                    backup_record.status,
                    backup_record.created_at
                ) ON CONFLICT (tenant_id, user_id) DO NOTHING;
                
                RAISE NOTICE 'Migrated onboarding for: %', backup_record.email;
            END IF;
        END LOOP;
    END IF;
END $$;

-- =====================================================
-- STEP 11: CREATE INDEXES
-- =====================================================

-- Tenant-aware indexes
CREATE INDEX idx_tenant_users_tenant_id ON tenant_users(tenant_id);
CREATE INDEX idx_tenant_users_user_id ON tenant_users(user_id);
CREATE INDEX idx_projects_tenant_id ON projects(tenant_id);
CREATE INDEX idx_projects_created_by ON projects(tenant_id, created_by);
CREATE INDEX idx_agents_tenant_id ON agents(tenant_id);
CREATE INDEX idx_agents_project_id ON agents(tenant_id, project_id);
CREATE INDEX idx_workflows_tenant_id ON workflows(tenant_id);
CREATE INDEX idx_workflows_project_id ON workflows(tenant_id, project_id);
CREATE INDEX idx_workflow_executions_tenant_id ON workflow_executions(tenant_id);
CREATE INDEX idx_workflow_executions_workflow_id ON workflow_executions(tenant_id, workflow_id);
CREATE INDEX idx_user_onboarding_tenant_user ON user_onboarding(tenant_id, user_id);
CREATE INDEX idx_user_sessions_tenant_user ON user_sessions(tenant_id, user_id);
CREATE INDEX idx_api_keys_tenant_id ON api_keys(tenant_id);
CREATE INDEX idx_rate_limits_tenant_id ON rate_limits(tenant_id);
CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_usage_metrics_tenant_date ON usage_metrics(tenant_id, date);

-- Performance indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_workflows_status ON workflows(status);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_usage_metrics_timestamp ON usage_metrics(timestamp);

-- =====================================================
-- STEP 12: CREATE FUNCTIONS
-- =====================================================

-- Helper function to get user's tenants
CREATE OR REPLACE FUNCTION get_user_tenants(user_uuid UUID)
RETURNS UUID[] AS $$
BEGIN
    RETURN ARRAY(
        SELECT tenant_id 
        FROM tenant_users 
        WHERE user_id = user_uuid 
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check tenant access
CREATE OR REPLACE FUNCTION can_access_tenant(tenant_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 
        FROM tenant_users 
        WHERE tenant_id = tenant_uuid 
        AND user_id = user_uuid 
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create audit log entries
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        tenant_id,
        user_id,
        action,
        resource_type,
        resource_id,
        old_values,
        new_values,
        ip_address,
        user_agent
    ) VALUES (
        COALESCE(NEW.tenant_id, OLD.tenant_id),
        auth.uid()::UUID,
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
        inet_client_addr(),
        current_setting('request.headers', true)::json->>'user-agent'
    );
    
    RETURN COALESCE(NEW, OLD);
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the main operation
        RAISE NOTICE 'Audit log creation failed: %', SQLERRM;
        RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 13: CREATE TRIGGERS
-- =====================================================

-- Updated_at triggers
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_users_updated_at BEFORE UPDATE ON tenant_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit triggers
CREATE TRIGGER audit_tenants AFTER INSERT OR UPDATE OR DELETE ON tenants
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_projects AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_api_keys AFTER INSERT OR UPDATE OR DELETE ON api_keys
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- =====================================================
-- STEP 14: ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tenant-aware tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 15: CREATE RLS POLICIES
-- =====================================================

-- RLS Policies for tenants table
CREATE POLICY tenant_access ON tenants
    FOR ALL USING (
        id = ANY(get_user_tenants(auth.uid()::UUID))
    );

-- RLS Policies for tenant_users table
CREATE POLICY tenant_users_access ON tenant_users
    FOR ALL USING (
        user_id = auth.uid()::UUID OR
        can_access_tenant(tenant_id, auth.uid()::UUID)
    );

-- RLS Policies for projects table
CREATE POLICY projects_access ON projects
    FOR ALL USING (
        can_access_tenant(tenant_id, auth.uid()::UUID)
    );

-- RLS Policies for agents table
CREATE POLICY agents_access ON agents
    FOR ALL USING (
        can_access_tenant(tenant_id, auth.uid()::UUID)
    );

-- RLS Policies for workflows table
CREATE POLICY workflows_access ON workflows
    FOR ALL USING (
        can_access_tenant(tenant_id, auth.uid()::UUID)
    );

-- RLS Policies for workflow_executions table
CREATE POLICY workflow_executions_access ON workflow_executions
    FOR ALL USING (
        can_access_tenant(tenant_id, auth.uid()::UUID)
    );

-- RLS Policies for user_onboarding table
CREATE POLICY user_onboarding_access ON user_onboarding
    FOR ALL USING (
        user_id = auth.uid()::UUID OR
        can_access_tenant(tenant_id, auth.uid()::UUID)
    );

-- RLS Policies for user_sessions table
CREATE POLICY user_sessions_access ON user_sessions
    FOR ALL USING (
        user_id = auth.uid()::UUID OR
        can_access_tenant(tenant_id, auth.uid()::UUID)
    );

-- RLS Policies for api_keys table
CREATE POLICY api_keys_access ON api_keys
    FOR ALL USING (
        user_id = auth.uid()::UUID OR
        can_access_tenant(tenant_id, auth.uid()::UUID)
    );

-- RLS Policies for audit_logs table (read-only for users)
CREATE POLICY audit_logs_read ON audit_logs
    FOR SELECT USING (
        can_access_tenant(tenant_id, auth.uid()::UUID)
    );

-- RLS Policies for usage_metrics table
CREATE POLICY usage_metrics_access ON usage_metrics
    FOR ALL USING (
        can_access_tenant(tenant_id, auth.uid()::UUID)
    );

-- =====================================================
-- CLEANUP BACKUP TABLES
-- =====================================================

-- Drop backup tables after successful migration
DROP TABLE IF EXISTS users_backup;
DROP TABLE IF EXISTS user_onboarding_backup;

COMMIT;

-- =====================================================
-- MIGRATION VALIDATION
-- =====================================================

-- Verify migration success
DO $$
DECLARE
    table_count INTEGER;
    index_count INTEGER;
    policy_count INTEGER;
BEGIN
    -- Count tables
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    
    -- Count indexes
    SELECT COUNT(*) INTO index_count 
    FROM pg_indexes 
    WHERE schemaname = 'public';
    
    -- Count RLS policies
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    RAISE NOTICE 'Migration completed successfully:';
    RAISE NOTICE '- Tables created: %', table_count;
    RAISE NOTICE '- Indexes created: %', index_count;
    RAISE NOTICE '- RLS policies created: %', policy_count;
END $$;