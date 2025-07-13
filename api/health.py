from http.server import BaseHTTPRequestHandler
import json
import sys
import os
from datetime import datetime

# Add the parent directory to the path to import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from monitoring import get_monitor
    from config import Config
except ImportError:
    # Fallback for deployment
    pass

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Basic health check
            health_data = {
                "status": "healthy",
                "timestamp": datetime.now().isoformat(),
                "service": "langgraph-multi-agent",
                "version": "1.0.0"
            }
            
            # Try to get system health if monitoring is available
            try:
                monitor = get_monitor()
                system_health = monitor.get_system_health()
                health_data.update({
                    "system_health": system_health,
                    "langsmith_enabled": Config.LANGCHAIN_TRACING_V2 if 'Config' in globals() else False
                })
            except Exception as e:
                health_data["monitoring_status"] = f"Limited: {str(e)}"
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            self.wfile.write(json.dumps(health_data, indent=2).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            error_response = {
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }
            
            self.wfile.write(json.dumps(error_response).encode())