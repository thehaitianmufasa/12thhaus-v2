# 🤖 n8n Workflows Setup Guide

## 📋 Overview

Your multi-agent system has generated three comprehensive n8n workflows:

1. **User Registration Workflow** - Handles new user signups with validation and email verification
2. **Error Alerts Workflow** - Manages error notifications with priority-based routing
3. **Customer Onboarding Workflow** - Automated email sequences for new users

## 🚀 Prerequisites

### Required Services
- **n8n** (v0.171.0 or higher) - Workflow automation platform
- **PostgreSQL** - Database for user and error storage
- **SMTP Service** - Email sending (Gmail, SendGrid, etc.)
- **Slack** (optional) - For error notifications

### Required Database Tables

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending',
  verified_at TIMESTAMP NULL
);

-- Error logs table
CREATE TABLE error_logs (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  error_message TEXT NOT NULL,
  severity VARCHAR(50) NOT NULL,
  context TEXT,
  source VARCHAR(100),
  user_id INTEGER REFERENCES users(id),
  stack_trace TEXT
);

-- User onboarding table
CREATE TABLE user_onboarding (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  email VARCHAR(255) NOT NULL,
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  current_step INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'started',
  checklist JSONB,
  last_email_sent TIMESTAMP,
  completed_at TIMESTAMP NULL
);
```

## 📥 Installation Steps

### 1. Install n8n
```bash
# Using npm
npm install n8n -g

# Using Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n
```

### 2. Configure n8n Environment
```bash
# Set environment variables
export N8N_BASIC_AUTH_ACTIVE=true
export N8N_BASIC_AUTH_USER=admin
export N8N_BASIC_AUTH_PASSWORD=your_secure_password
export N8N_HOST=0.0.0.0
export N8N_PORT=5678
export N8N_PROTOCOL=http
export WEBHOOK_TUNNEL_URL=https://your-domain.com
```

### 3. Start n8n
```bash
n8n start
```

Access n8n at: `http://localhost:5678`

## 🔧 Workflow Import Instructions

### 1. Import Workflows
1. Open n8n in your browser
2. Go to **Workflows** → **Import**
3. Import each workflow file:
   - `user-registration.json`
   - `error-alerts.json`
   - `customer-onboarding.json`

### 2. Configure Credentials

#### PostgreSQL Database
1. Go to **Credentials** → **Create New**
2. Select **Postgres**
3. Configure:
   - Host: `your-database-host`
   - Database: `your-database-name`
   - User: `your-database-user`
   - Password: `your-database-password`

#### SMTP Email
1. Go to **Credentials** → **Create New**
2. Select **SMTP**
3. Configure:
   - Host: `smtp.gmail.com` (or your SMTP host)
   - Port: `587`
   - User: `your-email@gmail.com`
   - Password: `your-app-password`

#### Slack (Optional)
1. Go to **Credentials** → **Create New**
2. Select **Slack**
3. Configure:
   - Access Token: `xoxb-your-slack-token`

### 3. Configure Webhooks

Each workflow has webhook URLs that you can use:

- **User Registration**: `https://your-n8n-domain/webhook/register`
- **Error Alerts**: `https://your-n8n-domain/webhook/error-alert`
- **Customer Onboarding**: `https://your-n8n-domain/webhook/start-onboarding`

### 4. Activate Workflows
1. Open each workflow
2. Click **Active** toggle in the top right
3. Verify webhook URLs are accessible

## 🧪 Testing the Workflows

### Test User Registration
```bash
curl -X POST https://your-n8n-domain/webhook/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepassword123"
  }'
```

### Test Error Alert
```bash
curl -X POST https://your-n8n-domain/webhook/error-alert \
  -H "Content-Type: application/json" \
  -d '{
    "error": "Database connection failed",
    "severity": "high",
    "context": "User authentication",
    "source": "API Server",
    "userId": 123
  }'
```

### Test Customer Onboarding
```bash
curl -X POST https://your-n8n-domain/webhook/start-onboarding \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 123,
    "email": "newuser@example.com"
  }'
```

## 🔄 Integration with Your System

### 1. User Registration Integration
Add this to your registration endpoint:

```javascript
// After successful user creation
const response = await fetch('https://your-n8n-domain/webhook/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: userEmail,
    password: userPassword
  })
});
```

### 2. Error Alert Integration
Add this to your error handling:

```javascript
// In your error handler
const alertError = async (error, context) => {
  await fetch('https://your-n8n-domain/webhook/error-alert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      error: error.message,
      severity: error.severity || 'medium',
      context: context,
      source: 'Application',
      userId: currentUserId,
      stack: error.stack
    })
  });
};
```

### 3. Onboarding Integration
Trigger after user registration:

```javascript
// After user registration is complete
const startOnboarding = async (userId, email) => {
  await fetch('https://your-n8n-domain/webhook/start-onboarding', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: userId,
      email: email
    })
  });
};
```

## 📊 Monitoring and Maintenance

### 1. Workflow Monitoring
- Check **Executions** tab in n8n for workflow runs
- Monitor success/failure rates
- Review execution logs for errors

### 2. Database Monitoring
```sql
-- Check recent registrations
SELECT * FROM users WHERE created_at > NOW() - INTERVAL '24 hours';

-- Check error patterns
SELECT severity, COUNT(*) FROM error_logs 
WHERE timestamp > NOW() - INTERVAL '24 hours' 
GROUP BY severity;

-- Check onboarding progress
SELECT status, COUNT(*) FROM user_onboarding 
GROUP BY status;
```

### 3. Performance Optimization
- Enable n8n workflow caching
- Use database indexes on frequently queried columns
- Monitor email delivery rates
- Set up Slack notification limits

## 🛠️ Customization Options

### Email Templates
Modify HTML templates in the email nodes to match your brand:
- Logo and colors
- Typography and styling
- Content and messaging

### Workflow Logic
Extend workflows with additional nodes:
- **Conditional logic** - Route based on user type
- **Data enrichment** - Add user analytics
- **External APIs** - Integrate with CRM systems
- **Scheduling** - Add time-based triggers

### Security Enhancements
- Enable HTTPS for all webhook endpoints
- Add authentication to webhook calls
- Implement rate limiting
- Add input sanitization

## 🔍 Troubleshooting

### Common Issues

1. **Webhook not responding**
   - Check if workflow is active
   - Verify webhook URL is correct
   - Check n8n logs for errors

2. **Database connection errors**
   - Verify database credentials
   - Check network connectivity
   - Ensure database tables exist

3. **Email not sending**
   - Check SMTP credentials
   - Verify email provider settings
   - Check spam folders

4. **Slack notifications failing**
   - Verify Slack token permissions
   - Check channel exists
   - Ensure bot is added to channel

### Debug Mode
Enable n8n debug mode:
```bash
export N8N_LOG_LEVEL=debug
n8n start
```

## 🎯 Next Steps

1. **Deploy to Production**
   - Use Docker for reliable deployment
   - Set up load balancing if needed
   - Configure backup strategies

2. **Advanced Features**
   - Add A/B testing for email campaigns
   - Implement advanced user segmentation
   - Add analytics and reporting

3. **Integration Expansion**
   - Connect to CRM systems
   - Add social media automation
   - Integrate with support systems

Your n8n workflows are now ready to automate user registration, error handling, and customer onboarding! 🚀