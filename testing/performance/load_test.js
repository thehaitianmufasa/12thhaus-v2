"""
Performance Testing Suite using k6
Load testing and performance benchmarking for LangGraph platform
"""

// K6 Load Test Configuration
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';
import { SharedArray } from 'k6/data';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Custom metrics
const errorRate = new Rate('errors');
const agentResponseTime = new Rate('agent_response_time');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 },    // Warm up
    { duration: '5m', target: 50 },    // Ramp up to 50 users
    { duration: '10m', target: 100 },  // Stay at 100 users
    { duration: '5m', target: 500 },   // Ramp up to 500 users
    { duration: '10m', target: 500 },  // Stay at 500 users
    { duration: '5m', target: 1000 },  // Peak load - 1000 users
    { duration: '10m', target: 1000 }, // Sustain peak load
    { duration: '5m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],           // Error rate < 1%
    http_req_duration: ['p(95)<500'],         // 95% requests < 500ms
    'http_req_duration{api:auth}': ['p(95)<200'],     // Auth requests < 200ms
    'http_req_duration{api:agents}': ['p(95)<1000'],  // Agent requests < 1s
    'http_req_duration{api:tasks}': ['p(95)<5000'],   // Task execution < 5s
    errors: ['rate<0.05'],                    // Overall error rate < 5%
  },
  ext: {
    loadimpact: {
      projectID: 123456,
      name: 'LangGraph Platform Load Test',
      distribution: {
        'amazon:us:ashburn': { loadZone: 'amazon:us:ashburn', percent: 50 },
        'amazon:eu:dublin': { loadZone: 'amazon:eu:dublin', percent: 30 },
        'amazon:ap:singapore': { loadZone: 'amazon:ap:singapore', percent: 20 },
      },
    },
  },
};

// Test data
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';
const test_users = new SharedArray('users', function () {
  return JSON.parse(open('./test_users.json'));
});

// Helper functions
function authenticateUser(user) {
  const payload = JSON.stringify({
    email: user.email,
    password: user.password,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: { api: 'auth' },
  };

  const res = http.post(`${BASE_URL}/api/v1/auth/login`, payload, params);
  check(res, {
    'login successful': (r) => r.status === 200,
    'token received': (r) => r.json('token') !== '',
  });

  errorRate.add(res.status !== 200);
  
  return res.json('token');
}

// Test scenarios
export function setup() {
  // Setup code - create test data
  console.log('Setting up test data...');
  
  // Create test organization
  const orgPayload = JSON.stringify({
    name: 'Load Test Org',
    plan: 'enterprise',
  });
  
  http.post(`${BASE_URL}/api/v1/setup/organization`, orgPayload, {
    headers: { 'Content-Type': 'application/json' },
  });
  
  return { timestamp: new Date().toISOString() };
}

export default function (data) {
  // Select random user
  const user = test_users[Math.floor(Math.random() * test_users.length)];
  const token = authenticateUser(user);
  
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // Scenario 1: Browse Dashboard
  group('Dashboard Access', function () {
    const res = http.get(`${BASE_URL}/api/v1/dashboard`, {
      headers: authHeaders,
      tags: { api: 'dashboard' },
    });
    
    check(res, {
      'dashboard loaded': (r) => r.status === 200,
      'metrics received': (r) => r.json('metrics') !== null,
    });
    
    errorRate.add(res.status !== 200);
  });

  sleep(randomIntBetween(1, 3));

  // Scenario 2: List Agents
  group('Agent Management', function () {
    const res = http.get(`${BASE_URL}/api/v1/agents`, {
      headers: authHeaders,
      tags: { api: 'agents' },
    });
    
    check(res, {
      'agents listed': (r) => r.status === 200,
      'agent count correct': (r) => r.json('agents').length >= 5,
    });
    
    agentResponseTime.add(res.timings.duration < 1000);
  });

  sleep(randomIntBetween(1, 2));

  // Scenario 3: Create and Execute Task
  group('Task Execution', function () {
    // Create task
    const taskPayload = JSON.stringify({
      name: `Perf Test Task ${randomString(8)}`,
      type: 'code_generation',
      payload: {
        description: 'Generate a simple REST API endpoint',
        language: 'python',
        framework: 'fastapi',
      },
    });
    
    const createRes = http.post(`${BASE_URL}/api/v1/tasks`, taskPayload, {
      headers: authHeaders,
      tags: { api: 'tasks' },
    });
    
    check(createRes, {
      'task created': (r) => r.status === 201,
      'task id returned': (r) => r.json('task_id') !== '',
    });
    
    if (createRes.status === 201) {
      const taskId = createRes.json('task_id');
      
      // Poll task status
      let taskComplete = false;
      let pollCount = 0;
      const maxPolls = 30; // Max 30 seconds
      
      while (!taskComplete && pollCount < maxPolls) {
        const statusRes = http.get(`${BASE_URL}/api/v1/tasks/${taskId}`, {
          headers: authHeaders,
          tags: { api: 'tasks' },
        });
        
        if (statusRes.json('status') === 'completed') {
          taskComplete = true;
          check(statusRes, {
            'task completed': (r) => r.json('status') === 'completed',
            'output generated': (r) => r.json('output') !== null,
          });
        }
        
        pollCount++;
        sleep(1);
      }
      
      check(null, {
        'task completed in time': () => taskComplete,
      });
    }
  });

  sleep(randomIntBetween(2, 5));

  // Scenario 4: WebSocket Connection
  group('Real-time Updates', function () {
    const ws = new WebSocket(`ws://${BASE_URL}/ws?token=${token}`);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'subscribe',
        channel: 'agent_status',
      }));
    };
    
    ws.onmessage = (e) => {
      const message = JSON.parse(e.data);
      check(message, {
        'valid message format': (m) => m.type && m.data,
      });
    };
    
    sleep(5); // Keep connection open for 5 seconds
    ws.close();
  });

  sleep(randomIntBetween(5, 10));
}

// Scenario for testing agent coordination
export function agentCoordinationTest() {
  const user = test_users[0];
  const token = authenticateUser(user);
  
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // Create complex multi-agent task
  const complexTaskPayload = JSON.stringify({
    name: 'Full Stack Application',
    type: 'multi_agent_coordination',
    agents: ['code_generation', 'deployment', 'business_intelligence'],
    payload: {
      project_name: 'E-commerce Platform',
      requirements: [
        'User authentication',
        'Product catalog',
        'Shopping cart',
        'Payment integration',
        'Admin dashboard',
      ],
      tech_stack: {
        frontend: 'nextjs',
        backend: 'fastapi',
        database: 'postgresql',
        cache: 'redis',
      },
    },
  });

  const res = http.post(`${BASE_URL}/api/v1/tasks/complex`, complexTaskPayload, {
    headers: authHeaders,
    tags: { api: 'tasks', type: 'complex' },
    timeout: '300s',
  });

  check(res, {
    'complex task accepted': (r) => r.status === 202,
    'all agents assigned': (r) => r.json('assigned_agents').length === 3,
  });
}

// Scenario for testing rate limits
export function rateLimitTest() {
  const user = test_users[0];
  const token = authenticateUser(user);
  
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // Burst requests to test rate limiting
  const requests = [];
  for (let i = 0; i < 150; i++) {
    requests.push(
      http.get(`${BASE_URL}/api/v1/agents`, {
        headers: authHeaders,
        tags: { api: 'agents', test: 'rate_limit' },
      })
    );
  }

  // Check rate limit responses
  let rateLimited = 0;
  requests.forEach((res) => {
    if (res.status === 429) {
      rateLimited++;
    }
  });

  check(null, {
    'rate limiting works': () => rateLimited > 0,
    'some requests succeed': () => rateLimited < requests.length,
  });
}

export function teardown(data) {
  // Cleanup code
  console.log(`Test completed at ${new Date().toISOString()}`);
  console.log(`Test started at ${data.timestamp}`);
}

// Helper function
function randomIntBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
