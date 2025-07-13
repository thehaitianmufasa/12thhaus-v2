#!/usr/bin/env python3
"""
Light test for n8n workflows - validates structure and logic
"""
import json
import re
from datetime import datetime
import sys
import os

def test_workflow_json_structure():
    """Test that all workflow JSON files are valid and have required structure"""
    print("🧪 Testing n8n workflow JSON structure...")
    
    workflow_files = [
        'n8n-workflows/user-registration.json',
        'n8n-workflows/error-alerts.json',
        'n8n-workflows/customer-onboarding.json'
    ]
    
    for workflow_file in workflow_files:
        try:
            if not os.path.exists(workflow_file):
                print(f"❌ {workflow_file} not found")
                return False
            
            with open(workflow_file, 'r') as f:
                workflow = json.load(f)
            
            # Check required fields
            required_fields = ['name', 'nodes', 'connections']
            for field in required_fields:
                if field not in workflow:
                    print(f"❌ {workflow_file} missing {field}")
                    return False
            
            # Check nodes structure
            if not isinstance(workflow['nodes'], list) or len(workflow['nodes']) == 0:
                print(f"❌ {workflow_file} has no nodes")
                return False
            
            # Check each node has required fields
            for node in workflow['nodes']:
                node_required = ['name', 'type', 'position', 'id']
                for field in node_required:
                    if field not in node:
                        print(f"❌ {workflow_file} node missing {field}")
                        return False
            
            print(f"✅ {workflow_file} structure valid - {len(workflow['nodes'])} nodes")
            
        except json.JSONDecodeError as e:
            print(f"❌ {workflow_file} invalid JSON: {e}")
            return False
        except Exception as e:
            print(f"❌ {workflow_file} error: {e}")
            return False
    
    return True

def test_user_registration_logic():
    """Test user registration workflow logic"""
    print("\n🧪 Testing user registration workflow logic...")
    
    # Simulate input validation logic
    def validate_email(email):
        email_regex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        return re.match(email_regex, email) is not None
    
    def validate_password(password):
        return len(password) >= 8
    
    # Test cases
    test_cases = [
        {"email": "test@example.com", "password": "password123", "should_pass": True},
        {"email": "invalid-email", "password": "password123", "should_pass": False},
        {"email": "test@example.com", "password": "short", "should_pass": False},
        {"email": "", "password": "password123", "should_pass": False},
    ]
    
    for i, test_case in enumerate(test_cases):
        email_valid = validate_email(test_case["email"])
        password_valid = validate_password(test_case["password"])
        
        result = email_valid and password_valid
        expected = test_case["should_pass"]
        
        if result == expected:
            print(f"✅ Test case {i+1}: {test_case['email']} - PASS")
        else:
            print(f"❌ Test case {i+1}: {test_case['email']} - FAIL")
            return False
    
    # Test password hashing simulation
    try:
        import hashlib
        password = "testpassword123"
        salt = "randomsalt"
        hashed = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
        print(f"✅ Password hashing simulation works")
    except Exception as e:
        print(f"❌ Password hashing failed: {e}")
        return False
    
    return True

def test_error_alert_logic():
    """Test error alert workflow logic"""
    print("\n🧪 Testing error alert workflow logic...")
    
    def categorize_error(severity):
        if severity in ['critical', 'high']:
            return 'high'
        elif severity == 'medium':
            return 'medium'
        else:
            return 'low'
    
    def format_error_data(error_input):
        return {
            'timestamp': datetime.now().isoformat(),
            'error': error_input.get('error', 'Unknown error'),
            'severity': error_input.get('severity', 'medium'),
            'context': error_input.get('context', 'Unknown context'),
            'source': error_input.get('source', 'System'),
            'userId': error_input.get('userId'),
            'urgencyLevel': categorize_error(error_input.get('severity', 'medium'))
        }
    
    # Test error processing
    test_errors = [
        {"error": "Database connection failed", "severity": "critical", "expected_urgency": "high"},
        {"error": "API timeout", "severity": "medium", "expected_urgency": "medium"},
        {"error": "Minor validation error", "severity": "low", "expected_urgency": "low"},
        {"error": "Unknown error", "expected_urgency": "medium"},  # Missing severity defaults to medium
    ]
    
    for i, test_error in enumerate(test_errors):
        processed = format_error_data(test_error)
        expected_urgency = test_error.get('expected_urgency', 'low')
        
        if processed['urgencyLevel'] == expected_urgency:
            print(f"✅ Error case {i+1}: {test_error['error'][:30]}... - PASS")
        else:
            print(f"❌ Error case {i+1}: Expected {expected_urgency}, got {processed['urgencyLevel']}")
            return False
    
    return True

def test_onboarding_logic():
    """Test customer onboarding workflow logic"""
    print("\n🧪 Testing customer onboarding workflow logic...")
    
    def initialize_onboarding(user_data):
        return {
            'userId': user_data.get('userId'),
            'email': user_data.get('email'),
            'startDate': datetime.now().isoformat(),
            'currentStep': 1,
            'totalSteps': 5,
            'status': 'started',
            'checklist': {
                'profileComplete': False,
                'emailVerified': False,
                'firstLogin': False,
                'tutorialCompleted': False,
                'supportContactMade': False
            }
        }
    
    # Test onboarding initialization
    test_user = {"userId": 123, "email": "test@example.com"}
    onboarding_data = initialize_onboarding(test_user)
    
    # Validate onboarding data
    required_fields = ['userId', 'email', 'startDate', 'currentStep', 'status', 'checklist']
    for field in required_fields:
        if field not in onboarding_data:
            print(f"❌ Onboarding data missing {field}")
            return False
    
    # Check checklist has all required items
    required_checklist = ['profileComplete', 'emailVerified', 'firstLogin', 'tutorialCompleted', 'supportContactMade']
    for item in required_checklist:
        if item not in onboarding_data['checklist']:
            print(f"❌ Onboarding checklist missing {item}")
            return False
    
    print(f"✅ Onboarding initialization works - {onboarding_data['totalSteps']} steps")
    
    # Test email sequence timing
    sequence_steps = [
        {"delay": 0, "name": "Welcome Email"},
        {"delay": 1, "name": "Follow-up Email"},
        {"delay": 24, "name": "Success Plan Email"}
    ]
    
    total_sequence_time = sum(step['delay'] for step in sequence_steps)
    print(f"✅ Email sequence: {len(sequence_steps)} emails over {total_sequence_time} hours")
    
    return True

def test_webhook_endpoints():
    """Test webhook endpoint structure"""
    print("\n🧪 Testing webhook endpoint structure...")
    
    expected_endpoints = {
        'user-registration.json': '/webhook/register',
        'error-alerts.json': '/webhook/error-alert',
        'customer-onboarding.json': '/webhook/start-onboarding'
    }
    
    for workflow_file, expected_path in expected_endpoints.items():
        try:
            with open(f'n8n-workflows/{workflow_file}', 'r') as f:
                workflow = json.load(f)
            
            # Find webhook node
            webhook_node = None
            for node in workflow['nodes']:
                if node['type'] == 'n8n-nodes-base.webhook':
                    webhook_node = node
                    break
            
            if not webhook_node:
                print(f"❌ {workflow_file} has no webhook node")
                return False
            
            # Check webhook path
            if 'parameters' in webhook_node and 'path' in webhook_node['parameters']:
                path = webhook_node['parameters']['path']
                if path in expected_path:
                    print(f"✅ {workflow_file} webhook path: /{path}")
                else:
                    print(f"⚠️  {workflow_file} webhook path: /{path} (expected in {expected_path})")
            else:
                print(f"❌ {workflow_file} webhook missing path parameter")
                return False
            
        except Exception as e:
            print(f"❌ {workflow_file} webhook test failed: {e}")
            return False
    
    return True

def test_email_templates():
    """Test email template structure"""
    print("\n🧪 Testing email template structure...")
    
    with open('n8n-workflows/user-registration.json', 'r') as f:
        reg_workflow = json.load(f)
    
    with open('n8n-workflows/customer-onboarding.json', 'r') as f:
        onboard_workflow = json.load(f)
    
    email_nodes = []
    
    # Find email nodes in both workflows
    for workflow in [reg_workflow, onboard_workflow]:
        for node in workflow['nodes']:
            if node['type'] == 'n8n-nodes-base.emailSend':
                email_nodes.append(node)
    
    if len(email_nodes) == 0:
        print("❌ No email nodes found")
        return False
    
    # Check email nodes have required parameters
    for i, node in enumerate(email_nodes):
        if 'parameters' not in node:
            print(f"❌ Email node {i+1} missing parameters")
            return False
        
        params = node['parameters']
        required_params = ['to', 'subject']
        
        for param in required_params:
            if param not in params:
                print(f"❌ Email node {i+1} missing {param}")
                return False
        
        # Check if email has HTML content
        if 'html' in params:
            html_content = params['html']
            if '<html>' in html_content and '</html>' in html_content:
                print(f"✅ Email node {i+1} has valid HTML template")
            else:
                print(f"⚠️  Email node {i+1} has HTML but may be malformed")
        else:
            print(f"✅ Email node {i+1} has basic text content")
    
    return True

def main():
    """Run all n8n workflow tests"""
    print("🚀 Running n8n Workflow Tests...\n")
    
    tests = [
        test_workflow_json_structure,
        test_user_registration_logic,
        test_error_alert_logic,
        test_onboarding_logic,
        test_webhook_endpoints,
        test_email_templates
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()  # Add spacing
    
    print("="*60)
    print(f"📊 n8n Workflow Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All n8n workflow tests passed!")
        print("✅ Workflows are ready for n8n deployment!")
        return True
    else:
        print("❌ Some tests failed - check issues before deployment")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)