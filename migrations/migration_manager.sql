-- =====================================================
-- Migration Management System
-- Database migration tracking and execution utilities
-- =====================================================

-- Create schema_migrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    version VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    applied_at TIMESTAMP DEFAULT NOW(),
    applied_by VARCHAR(100) DEFAULT current_user,
    checksum VARCHAR(64),
    execution_time_ms INTEGER,
    status VARCHAR(20) DEFAULT 'applied' CHECK (status IN ('applied', 'failed', 'rolled_back'))
);

-- Create migration execution log
CREATE TABLE IF NOT EXISTS migration_logs (
    id SERIAL PRIMARY KEY,
    migration_version VARCHAR(50) NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('apply', 'rollback')),
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('running', 'success', 'failed')),
    error_message TEXT,
    executed_by VARCHAR(100) DEFAULT current_user
);

-- =====================================================
-- MIGRATION UTILITY FUNCTIONS
-- =====================================================

-- Function to check if a migration has been applied
CREATE OR REPLACE FUNCTION migration_applied(migration_version VARCHAR(50))
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM schema_migrations 
        WHERE version = migration_version 
        AND status = 'applied'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get pending migrations
CREATE OR REPLACE FUNCTION get_pending_migrations()
RETURNS TABLE(version VARCHAR(50), description TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT sm.version, sm.description
    FROM schema_migrations sm
    WHERE sm.status != 'applied'
    ORDER BY sm.version;
END;
$$ LANGUAGE plpgsql;

-- Function to record migration start
CREATE OR REPLACE FUNCTION start_migration(
    migration_version VARCHAR(50),
    migration_action VARCHAR(20) DEFAULT 'apply'
) RETURNS INTEGER AS $$
DECLARE
    log_id INTEGER;
BEGIN
    INSERT INTO migration_logs (migration_version, action, started_at, status)
    VALUES (migration_version, migration_action, NOW(), 'running')
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to record migration completion
CREATE OR REPLACE FUNCTION complete_migration(
    log_id INTEGER,
    success BOOLEAN DEFAULT TRUE,
    error_msg TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    UPDATE migration_logs 
    SET 
        completed_at = NOW(),
        status = CASE WHEN success THEN 'success' ELSE 'failed' END,
        error_message = error_msg
    WHERE id = log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to validate database schema integrity
CREATE OR REPLACE FUNCTION validate_schema_integrity()
RETURNS TABLE(
    check_name VARCHAR(100),
    status VARCHAR(20),
    details TEXT
) AS $$
BEGIN
    -- Check if required tables exist
    RETURN QUERY
    SELECT 
        'required_tables' AS check_name,
        CASE WHEN COUNT(*) >= 10 THEN 'PASS' ELSE 'FAIL' END AS status,
        FORMAT('Found %s core tables', COUNT(*)) AS details
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('users', 'tenants', 'projects', 'workflows', 'agents');
    
    -- Check if required indexes exist
    RETURN QUERY
    SELECT 
        'required_indexes' AS check_name,
        CASE WHEN COUNT(*) >= 15 THEN 'PASS' ELSE 'WARN' END AS status,
        FORMAT('Found %s indexes', COUNT(*)) AS details
    FROM pg_indexes 
    WHERE schemaname = 'public';
    
    -- Check if RLS is enabled
    RETURN QUERY
    SELECT 
        'row_level_security' AS check_name,
        CASE WHEN COUNT(*) >= 5 THEN 'PASS' ELSE 'FAIL' END AS status,
        FORMAT('RLS enabled on %s tables', COUNT(*)) AS details
    FROM pg_tables pt
    JOIN pg_class pc ON pc.relname = pt.tablename
    WHERE pt.schemaname = 'public' 
    AND pc.relrowsecurity = true;
    
    -- Check if required functions exist
    RETURN QUERY
    SELECT 
        'required_functions' AS check_name,
        CASE WHEN COUNT(*) >= 3 THEN 'PASS' ELSE 'FAIL' END AS status,
        FORMAT('Found %s required functions', COUNT(*)) AS details
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname IN ('get_user_tenants', 'can_access_tenant', 'update_updated_at_column');
    
    -- Check foreign key constraints
    RETURN QUERY
    SELECT 
        'foreign_keys' AS check_name,
        CASE WHEN COUNT(*) >= 10 THEN 'PASS' ELSE 'WARN' END AS status,
        FORMAT('Found %s foreign key constraints', COUNT(*)) AS details
    FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
    AND constraint_type = 'FOREIGN KEY';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MIGRATION STATUS QUERIES
-- =====================================================

-- View to show migration history
CREATE OR REPLACE VIEW migration_history AS
SELECT 
    sm.version,
    sm.description,
    sm.applied_at,
    sm.applied_by,
    sm.status,
    ml.action,
    ml.started_at,
    ml.completed_at,
    ml.error_message
FROM schema_migrations sm
LEFT JOIN migration_logs ml ON sm.version = ml.migration_version
ORDER BY sm.version DESC;

-- View to show current schema status
CREATE OR REPLACE VIEW schema_status AS
SELECT
    'total_tables' AS metric,
    COUNT(*)::TEXT AS value
FROM information_schema.tables
WHERE table_schema = 'public'
UNION ALL
SELECT
    'total_indexes' AS metric,
    COUNT(*)::TEXT AS value
FROM pg_indexes
WHERE schemaname = 'public'
UNION ALL
SELECT
    'rls_enabled_tables' AS metric,
    COUNT(*)::TEXT AS value
FROM pg_tables pt
JOIN pg_class pc ON pc.relname = pt.tablename
WHERE pt.schemaname = 'public' 
AND pc.relrowsecurity = true
UNION ALL
SELECT
    'total_functions' AS metric,
    COUNT(*)::TEXT AS value
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
UNION ALL
SELECT
    'applied_migrations' AS metric,
    COUNT(*)::TEXT AS value
FROM schema_migrations
WHERE status = 'applied';

-- =====================================================
-- EXAMPLE USAGE QUERIES
-- =====================================================

/*
-- Check if a specific migration has been applied
SELECT migration_applied('001');

-- Get all pending migrations
SELECT * FROM get_pending_migrations();

-- View migration history
SELECT * FROM migration_history;

-- Check current schema status
SELECT * FROM schema_status;

-- Validate schema integrity
SELECT * FROM validate_schema_integrity();

-- Example of running a migration with logging
DO $$
DECLARE
    log_id INTEGER;
BEGIN
    -- Start migration logging
    log_id := start_migration('001', 'apply');
    
    -- Your migration code would go here
    -- ... actual migration statements ...
    
    -- Mark as completed successfully
    PERFORM complete_migration(log_id, TRUE);
    
    RAISE NOTICE 'Migration completed successfully';
EXCEPTION
    WHEN OTHERS THEN
        -- Mark as failed with error message
        PERFORM complete_migration(log_id, FALSE, SQLERRM);
        RAISE;
END $$;
*/

-- =====================================================
-- BACKUP AND RESTORE UTILITIES
-- =====================================================

-- Function to create a schema backup
CREATE OR REPLACE FUNCTION create_schema_backup(backup_name VARCHAR(100))
RETURNS TEXT AS $$
DECLARE
    backup_schema VARCHAR(100);
    table_record RECORD;
    result_msg TEXT;
BEGIN
    -- Create backup schema name with timestamp
    backup_schema := 'backup_' || backup_name || '_' || to_char(NOW(), 'YYYYMMDD_HH24MISS');
    
    -- Create backup schema
    EXECUTE format('CREATE SCHEMA %I', backup_schema);
    
    -- Copy all tables to backup schema
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format(
            'CREATE TABLE %I.%I AS SELECT * FROM public.%I',
            backup_schema,
            table_record.tablename,
            table_record.tablename
        );
    END LOOP;
    
    result_msg := format('Schema backup created: %s', backup_schema);
    
    -- Log the backup
    INSERT INTO migration_logs (migration_version, action, status, completed_at)
    VALUES (backup_name, 'backup', 'success', NOW());
    
    RETURN result_msg;
END;
$$ LANGUAGE plpgsql;

-- Function to list available backups
CREATE OR REPLACE FUNCTION list_schema_backups()
RETURNS TABLE(backup_schema VARCHAR(100), created_at TIMESTAMP) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schema_name::VARCHAR(100),
        NOW() -- Placeholder - actual creation time would need to be tracked
    FROM information_schema.schemata
    WHERE schema_name LIKE 'backup_%'
    ORDER BY schema_name DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INITIALIZATION
-- =====================================================

-- Initialize migration system
INSERT INTO schema_migrations (version, description) VALUES
('000', 'Migration system initialization')
ON CONFLICT (version) DO NOTHING;

-- Create initial log entry
INSERT INTO migration_logs (migration_version, action, status, completed_at)
VALUES ('000', 'apply', 'success', NOW())
ON CONFLICT DO NOTHING;

COMMENT ON TABLE schema_migrations IS 'Tracks applied database migrations';
COMMENT ON TABLE migration_logs IS 'Logs migration execution history';
COMMENT ON FUNCTION migration_applied(VARCHAR) IS 'Checks if a migration version has been applied';
COMMENT ON FUNCTION validate_schema_integrity() IS 'Validates database schema integrity and completeness';