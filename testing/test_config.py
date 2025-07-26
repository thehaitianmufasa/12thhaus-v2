"""
Test Configuration for 12thhaus Spiritual Platform
Phase 4A Testing Infrastructure
"""
import os
import pytest
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).parent.parent
TESTING_DIR = Path(__file__).parent
REPORTS_DIR = TESTING_DIR / "reports"

# Test environment configuration
TEST_CONFIG = {
    "api": {
        "base_url": os.getenv("TEST_API_URL", "http://localhost:8000"),
        "timeout": 30,
        "retry_attempts": 3
    },
    "database": {
        "test_db": os.getenv("TEST_DATABASE_URL", "postgresql://test:test@localhost/langgraph_test"),
        "pool_size": 5
    },
    "agents": {
        "master_agent": {
            "timeout": 60,
            "max_retries": 3
        },
        "code_generation_agent": {
            "timeout": 120,
            "max_output_size": 1048576  # 1MB
        },
        "deployment_agent": {
            "timeout": 300,
            "environments": ["dev", "staging", "prod"]
        },
        "business_intelligence_agent": {
            "timeout": 90,
            "max_data_size": 10485760  # 10MB
        },
        "customer_operations_agent": {
            "timeout": 45,
            "response_time_sla": 5  # seconds
        },
        "marketing_automation_agent": {
            "timeout": 60,
            "batch_size": 100
        }
    },
    "performance": {
        "load_test": {
            "virtual_users": [10, 50, 100, 500, 1000],
            "duration": "30m",
            "ramp_up": "5m"
        },
        "thresholds": {
            "api_response_time_p95": 500,  # ms
            "api_response_time_p99": 1000,  # ms
            "error_rate": 0.01,  # 1%
            "success_rate": 0.99  # 99%
        }
    },
    "security": {
        "owasp_checks": [
            "SQL_INJECTION",
            "XSS",
            "BROKEN_AUTH",
            "SENSITIVE_DATA_EXPOSURE",
            "XXE",
            "BROKEN_ACCESS_CONTROL",
            "SECURITY_MISCONFIGURATION",
            "INSECURE_DESERIALIZATION",
            "KNOWN_VULNERABILITIES",
            "INSUFFICIENT_LOGGING"
        ],
        "rate_limits": {
            "api_calls_per_minute": 100,
            "api_calls_per_hour": 5000
        }
    }
}

# Test data fixtures
TEST_DATA = {
    "users": {
        "test_admin": {
            "email": "admin@test.langgraph.ai",
            "role": "admin",
            "tenant_id": "test-tenant-001"
        },
        "test_user": {
            "email": "user@test.langgraph.ai",
            "role": "user",
            "tenant_id": "test-tenant-002"
        }
    },
    "projects": {
        "test_project": {
            "name": "Test E-commerce Platform",
            "description": "Automated test project for multi-agent system",
            "agents": ["code_generation", "deployment", "business_intelligence"]
        }
    },
    "workflows": {
        "test_workflow": {
            "name": "Full Stack App Generation",
            "steps": [
                "requirement_analysis",
                "code_generation",
                "testing",
                "deployment",
                "monitoring"
            ]
        }
    }
}

# Performance benchmarks
PERFORMANCE_BENCHMARKS = {
    "agent_response_times": {
        "master_agent": {"p50": 100, "p95": 500, "p99": 1000},
        "code_generation_agent": {"p50": 5000, "p95": 15000, "p99": 30000},
        "deployment_agent": {"p50": 10000, "p95": 30000, "p99": 60000},
        "business_intelligence_agent": {"p50": 2000, "p95": 8000, "p99": 15000},
        "customer_operations_agent": {"p50": 50, "p95": 200, "p99": 500},
        "marketing_automation_agent": {"p50": 1000, "p95": 5000, "p99": 10000}
    },
    "system_metrics": {
        "cpu_usage": {"warning": 70, "critical": 90},
        "memory_usage": {"warning": 80, "critical": 95},
        "disk_io": {"warning": 80, "critical": 95}
    }
}

@pytest.fixture
def test_config():
    """Provide test configuration to test functions"""
    return TEST_CONFIG

@pytest.fixture
def test_data():
    """Provide test data to test functions"""
    return TEST_DATA

@pytest.fixture
def performance_benchmarks():
    """Provide performance benchmarks to test functions"""
    return PERFORMANCE_BENCHMARKS
