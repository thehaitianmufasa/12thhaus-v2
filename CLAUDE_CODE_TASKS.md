# Claude Code Execution Tasks - Phase 4 Technical Completion

## Task 1: Test Suite Completion

### Step 1.1: Fix Async Test Configuration
```bash
cd /Users/mufasa/Desktop/langgraph-multi-agent

# Update pytest.ini to support async
cat > pytest.ini << 'EOF'
[tool:pytest]
asyncio_mode = auto
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short --strict-markers
markers =
    slow: marks tests as slow (deselect with '-m "not slow"')
    integration: marks tests as integration tests
    unit: marks tests as unit tests
EOF
```

### Step 1.2: Fix test_system.py Async Issues
```python
# Add this to the top of test_system.py
import pytest
import asyncio
from unittest.mock import patch, AsyncMock, MagicMock

# Update any async test functions to use pytest.mark.asyncio
# Example pattern to apply:
@pytest.mark.asyncio
async def test_async_function():
    # test code here
    pass
```

### Step 1.3: Create Missing Test Files
```bash
# Create test directory structure
mkdir -p tests/unit tests/integration tests/load

# Create unit test files
cat > tests/unit/test_auth.py << 'EOF'
import pytest
from unittest.mock import Mock, patch
import jwt
from datetime import datetime, timedelta

class TestAuthentication:
    def test_jwt_token_generation(self):
        """Test JWT token generation"""
        # Add test implementation
        pass
    
    def test_token_validation(self):
        """Test token validation"""
        pass
    
    def test_refresh_token_flow(self):
        """Test refresh token mechanism"""
        pass
EOF

cat > tests/unit/test_api.py << 'EOF'
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

class TestAPIEndpoints:
    def test_health_check(self):
        response = client.get("/health")
        assert response.status_code == 200
    
    def test_create_agent(self):
        """Test agent creation endpoint"""
        pass
    
    def test_execute_task(self):
        """Test task execution endpoint"""
        pass
EOF
```

### Step 1.4: Create Integration Tests
```bash
cat > tests/integration/test_workflows.py << 'EOF'
import pytest
import asyncio
from master_agent import MasterAgent
from specialist_agents import CodeGenerationAgent

class TestAgentWorkflows:
    @pytest.mark.asyncio
    async def test_full_agent_workflow(self):
        """Test complete agent workflow from request to completion"""
        master = MasterAgent()
        result = await master.process_request("Create a simple API")
        assert result is not None
    
    @pytest.mark.asyncio
    async def test_multi_agent_coordination(self):
        """Test multiple agents working together"""
        pass
EOF

cat > tests/integration/test_e2e.py << 'EOF'
import pytest
from playwright.async_api import async_playwright

class TestEndToEnd:
    @pytest.mark.asyncio
    async def test_full_platform_flow(self):
        """Test complete user journey"""
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            # Add E2E test implementation
            await browser.close()
EOF
```

## Task 2: Performance Optimization

### Step 2.1: Database Optimization
```bash
# Create indexes migration
cat > migrations/add_performance_indexes.sql << 'EOF'
-- Add indexes for frequently queried columns
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX idx_tasks_agent_id ON tasks(agent_id);
CREATE INDEX idx_executions_task_id ON executions(task_id);

-- Composite indexes for common queries
CREATE INDEX idx_tasks_agent_status ON tasks(agent_id, status);
CREATE INDEX idx_agents_tenant_active ON agents(tenant_id, is_active);

-- Full text search indexes
CREATE INDEX idx_tasks_description_gin ON tasks USING gin(to_tsvector('english', description));
EOF

# Create database optimization script
cat > scripts/optimize_db.py << 'EOF'
import psycopg2
from config import DATABASE_URL

def optimize_database():
    """Run database optimization tasks"""
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    # Analyze tables for query planning
    tables = ['agents', 'tasks', 'executions', 'tenants']
    for table in tables:
        cur.execute(f"ANALYZE {table};")
    
    # Set optimal connection pool settings
    cur.execute("ALTER SYSTEM SET max_connections = 200;")
    cur.execute("ALTER SYSTEM SET shared_buffers = '256MB';")
    
    conn.commit()
    cur.close()
    conn.close()

if __name__ == "__main__":
    optimize_database()
EOF
```

### Step 2.2: Implement Caching
```bash
# Create Redis caching layer
cat > cache.py << 'EOF'
import redis
import json
from functools import wraps
from typing import Optional, Any

redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

def cache_result(expiration: int = 3600):
    """Decorator to cache function results"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{str(args)}:{str(kwargs)}"
            
            # Try to get from cache
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            redis_client.setex(cache_key, expiration, json.dumps(result))
            return result
        return wrapper
    return decorator
EOF
```

## Task 3: Security Implementation

### Step 3.1: JWT Configuration
```bash
cat > security/jwt_config.py << 'EOF'
from datetime import datetime, timedelta
from typing import Optional
import jwt
from passlib.context import CryptContext

SECRET_KEY = "your-secret-key-here"  # Move to env
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
EOF
```

### Step 3.2: Rate Limiting
```bash
cat > security/rate_limiter.py << 'EOF'
from fastapi import HTTPException
from collections import defaultdict
from datetime import datetime, timedelta
import asyncio

class RateLimiter:
    def __init__(self, calls: int = 100, period: int = 60):
        self.calls = calls
        self.period = timedelta(seconds=period)
        self.calls_made = defaultdict(list)
    
    async def check_rate_limit(self, key: str):
        now = datetime.now()
        # Clean old calls
        self.calls_made[key] = [
            call_time for call_time in self.calls_made[key]
            if now - call_time < self.period
        ]
        
        if len(self.calls_made[key]) >= self.calls:
            raise HTTPException(status_code=429, detail="Rate limit exceeded")
        
        self.calls_made[key].append(now)

rate_limiter = RateLimiter()
EOF
```

## Task 4: Run Complete Test Suite

### Step 4.1: Install Test Dependencies
```bash
pip install pytest pytest-asyncio pytest-cov pytest-mock pytest-xdist
pip install playwright httpx
pip install bandit safety black flake8 mypy
```

### Step 4.2: Run All Tests with Coverage
```bash
# Run full test suite
python3 -m pytest -v --cov=. --cov-report=html --cov-report=term-missing

# Run security scan
bandit -r . -ll -i -f json -o security_report.json
safety check --json > safety_report.json

# Run code quality checks
black --check .
flake8 . --max-line-length=100
mypy . --ignore-missing-imports
```

### Step 4.3: Generate Test Report
```bash
# Create test summary
cat > test_report.md << 'EOF'
# Test Coverage Report

## Summary
- Total Coverage: XX%
- Tests Passed: XX/XX
- Security Issues: 0 Critical, 0 High

## Coverage by Module
- master_agent.py: XX%
- specialist_agents.py: XX%
- api/: XX%
- frontend/: XX%

## Next Steps
1. Add missing tests for uncovered code
2. Fix any failing tests
3. Address security warnings
EOF
```

## Task 5: Create Load Testing Scripts

### Step 5.1: K6 Load Test Script
```javascript
// save as load_test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 1000 }, // Ramp up to 1000
    { duration: '5m', target: 1000 }, // Stay at 1000
    { duration: '2m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(99)<200'], // 99% of requests under 200ms
    http_req_failed: ['rate<0.01'], // Error rate under 1%
  },
};

export default function() {
  // Test agent creation
  let payload = JSON.stringify({
    name: 'Test Agent',
    type: 'code_generation',
    config: {}
  });
  
  let params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ${__ENV.API_TOKEN}'
    },
  };
  
  let response = http.post('http://localhost:8000/api/agents', payload, params);
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  sleep(1);
}
```

## Execute These Tasks Now

1. Start in the project directory
2. Run each command in sequence
3. Fix any errors that arise
4. Document results in test_report.md
5. Commit changes with meaningful messages

Ready to begin execution!