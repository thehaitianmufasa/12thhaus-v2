from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from master_agent import get_master_agent
    from monitoring import get_monitor
except ImportError:
    # Fallback for deployment issues
    pass

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Get system status
            try:
                master_agent = get_master_agent()
                status = master_agent.get_system_status()
                
                monitor = get_monitor()
                health = monitor.get_system_health()
                metrics = monitor.get_performance_metrics()
                
                response_data = {
                    "system_status": status,
                    "health": health,
                    "metrics": metrics,
                    "deployment": "vercel",
                    "environment": "production"
                }
                
            except Exception as e:
                response_data = {
                    "status": "partial",
                    "message": "System partially available",
                    "error": str(e),
                    "deployment": "vercel",
                    "environment": "production"
                }
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            self.wfile.write(json.dumps(response_data, indent=2).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            error_response = {
                "status": "error",
                "message": str(e)
            }
            
            self.wfile.write(json.dumps(error_response).encode())