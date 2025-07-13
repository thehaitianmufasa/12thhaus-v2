from http.server import BaseHTTPRequestHandler
import json
import sys
import os
import asyncio
from urllib.parse import parse_qs

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from master_agent import get_master_agent
    from monitoring import get_monitor
except ImportError:
    pass

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Read the request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
            except json.JSONDecodeError:
                self.send_error_response(400, "Invalid JSON")
                return
            
            # Extract task parameters
            task_content = data.get('task')
            priority = data.get('priority', 'medium')
            context = data.get('context', {})
            
            if not task_content:
                self.send_error_response(400, "Task content is required")
                return
            
            # Process the task
            try:
                master_agent = get_master_agent()
                
                # Run async task processing
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                
                response = loop.run_until_complete(
                    master_agent.process_task(task_content, priority, context)
                )
                
                loop.close()
                
                # Record metrics if available
                try:
                    monitor = get_monitor()
                    # Could add task tracking here
                except:
                    pass
                
                response_data = {
                    "status": "completed",
                    "task": task_content,
                    "priority": priority,
                    "response": response,
                    "context": context
                }
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                self.wfile.write(json.dumps(response_data, indent=2).encode())
                
            except Exception as e:
                self.send_error_response(500, f"Task processing failed: {str(e)}")
                
        except Exception as e:
            self.send_error_response(500, f"Request handling failed: {str(e)}")
    
    def do_GET(self):
        # Simple GET endpoint for testing
        response_data = {
            "message": "Task endpoint is ready",
            "method": "POST",
            "expected_payload": {
                "task": "Your task description",
                "priority": "high|medium|low",
                "context": {}
            }
        }
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        self.wfile.write(json.dumps(response_data, indent=2).encode())
    
    def send_error_response(self, status_code, message):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        error_response = {
            "status": "error",
            "message": message
        }
        
        self.wfile.write(json.dumps(error_response).encode())