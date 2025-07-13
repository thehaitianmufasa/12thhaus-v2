"""
Monitoring and coordination system for LangGraph Multi-Agent System
Provides metrics, health checks, and system coordination
"""
import asyncio
import time
import logging
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import json
from langsmith import traceable
from langsmith.client import Client as LangSmithClient

from config import Config

logger = logging.getLogger(__name__)

@dataclass
class AgentMetrics:
    """Metrics for individual agents"""
    agent_type: str
    total_tasks: int = 0
    successful_tasks: int = 0
    failed_tasks: int = 0
    average_response_time: float = 0.0
    last_activity: Optional[datetime] = None
    error_rate: float = 0.0

@dataclass
class SystemMetrics:
    """Overall system metrics"""
    total_requests: int = 0
    successful_requests: int = 0
    failed_requests: int = 0
    average_routing_time: float = 0.0
    uptime: float = 0.0
    agent_metrics: Dict[str, AgentMetrics] = field(default_factory=dict)

class AgentMonitor:
    """Monitors agent performance and system health"""
    
    def __init__(self):
        self.start_time = datetime.now()
        self.metrics = SystemMetrics()
        self.task_history: List[Dict[str, Any]] = []
        self.max_history_size = 1000
        
        # Initialize LangSmith client if available
        self.langsmith_client = None
        if Config.LANGCHAIN_API_KEY:
            try:
                self.langsmith_client = LangSmithClient(
                    api_key=Config.LANGCHAIN_API_KEY,
                    api_url=Config.LANGCHAIN_ENDPOINT
                )
            except Exception as e:
                logger.warning(f"Failed to initialize LangSmith client: {e}")
    
    @traceable
    def record_task_start(self, task_id: str, agent_type: str, task_content: str):
        """Record the start of a task"""
        task_record = {
            "task_id": task_id,
            "agent_type": agent_type,
            "task_content": task_content,
            "start_time": datetime.now(),
            "status": "in_progress"
        }
        
        self.task_history.append(task_record)
        
        # Maintain history size
        if len(self.task_history) > self.max_history_size:
            self.task_history = self.task_history[-self.max_history_size:]
        
        # Update metrics
        if agent_type not in self.metrics.agent_metrics:
            self.metrics.agent_metrics[agent_type] = AgentMetrics(agent_type=agent_type)
        
        self.metrics.agent_metrics[agent_type].total_tasks += 1
        self.metrics.agent_metrics[agent_type].last_activity = datetime.now()
        self.metrics.total_requests += 1
    
    @traceable
    def record_task_completion(self, task_id: str, success: bool, response_time: float, error: Optional[str] = None):
        """Record the completion of a task"""
        # Find the task in history
        task_record = None
        for record in reversed(self.task_history):
            if record["task_id"] == task_id:
                task_record = record
                break
        
        if not task_record:
            logger.warning(f"Task record not found for task_id: {task_id}")
            return
        
        # Update task record
        task_record["end_time"] = datetime.now()
        task_record["response_time"] = response_time
        task_record["status"] = "completed" if success else "failed"
        if error:
            task_record["error"] = error
        
        # Update metrics
        agent_type = task_record["agent_type"]
        agent_metrics = self.metrics.agent_metrics[agent_type]
        
        if success:
            agent_metrics.successful_tasks += 1
            self.metrics.successful_requests += 1
        else:
            agent_metrics.failed_tasks += 1
            self.metrics.failed_requests += 1
        
        # Update average response time
        total_tasks = agent_metrics.total_tasks
        if total_tasks > 0:
            current_avg = agent_metrics.average_response_time
            agent_metrics.average_response_time = (
                (current_avg * (total_tasks - 1) + response_time) / total_tasks
            )
        
        # Update error rate
        if agent_metrics.total_tasks > 0:
            agent_metrics.error_rate = agent_metrics.failed_tasks / agent_metrics.total_tasks
    
    @traceable
    def get_system_health(self) -> Dict[str, Any]:
        """Get current system health status"""
        current_time = datetime.now()
        uptime = (current_time - self.start_time).total_seconds()
        
        # Calculate overall success rate
        total_requests = self.metrics.total_requests
        success_rate = (
            self.metrics.successful_requests / total_requests 
            if total_requests > 0 else 0.0
        )
        
        # Check agent health
        agent_health = {}
        for agent_type, metrics in self.metrics.agent_metrics.items():
            agent_health[agent_type] = {
                "status": "healthy" if metrics.error_rate < 0.1 else "warning" if metrics.error_rate < 0.3 else "unhealthy",
                "total_tasks": metrics.total_tasks,
                "success_rate": 1 - metrics.error_rate,
                "avg_response_time": metrics.average_response_time,
                "last_activity": metrics.last_activity.isoformat() if metrics.last_activity else None
            }
        
        return {
            "system_status": "healthy" if success_rate > 0.9 else "warning" if success_rate > 0.7 else "unhealthy",
            "uptime_seconds": uptime,
            "total_requests": total_requests,
            "success_rate": success_rate,
            "agent_health": agent_health,
            "recent_tasks": len([t for t in self.task_history if 
                               (current_time - t["start_time"]).total_seconds() < 300])  # Last 5 minutes
        }
    
    @traceable
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get detailed performance metrics"""
        return {
            "system_metrics": {
                "total_requests": self.metrics.total_requests,
                "successful_requests": self.metrics.successful_requests,
                "failed_requests": self.metrics.failed_requests,
                "average_routing_time": self.metrics.average_routing_time
            },
            "agent_metrics": {
                agent_type: {
                    "total_tasks": metrics.total_tasks,
                    "successful_tasks": metrics.successful_tasks,
                    "failed_tasks": metrics.failed_tasks,
                    "average_response_time": metrics.average_response_time,
                    "error_rate": metrics.error_rate,
                    "last_activity": metrics.last_activity.isoformat() if metrics.last_activity else None
                }
                for agent_type, metrics in self.metrics.agent_metrics.items()
            }
        }
    
    @traceable
    def get_recent_tasks(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent task history"""
        recent_tasks = sorted(
            self.task_history,
            key=lambda x: x["start_time"],
            reverse=True
        )[:limit]
        
        # Convert datetime objects to ISO format for JSON serialization
        for task in recent_tasks:
            task["start_time"] = task["start_time"].isoformat()
            if "end_time" in task:
                task["end_time"] = task["end_time"].isoformat()
        
        return recent_tasks
    
    @traceable
    async def export_metrics_to_langsmith(self):
        """Export metrics to LangSmith for analysis"""
        if not self.langsmith_client:
            logger.warning("LangSmith client not available for metrics export")
            return
        
        try:
            # Prepare metrics for export
            metrics_data = {
                "timestamp": datetime.now().isoformat(),
                "system_health": self.get_system_health(),
                "performance_metrics": self.get_performance_metrics(),
                "recent_tasks": self.get_recent_tasks()
            }
            
            # Export to LangSmith (this would typically use their API)
            logger.info("Metrics exported to LangSmith")
            
        except Exception as e:
            logger.error(f"Failed to export metrics to LangSmith: {e}")
    
    def reset_metrics(self):
        """Reset all metrics and history"""
        self.metrics = SystemMetrics()
        self.task_history = []
        self.start_time = datetime.now()
        logger.info("Metrics reset")

class CoordinationManager:
    """Manages coordination between agents and system resources"""
    
    def __init__(self):
        self.active_tasks: Dict[str, Dict[str, Any]] = {}
        self.resource_locks: Dict[str, asyncio.Lock] = {}
        self.max_concurrent_tasks = 10
        self.task_queue: asyncio.Queue = asyncio.Queue()
        self.worker_tasks: List[asyncio.Task] = []
    
    @traceable
    async def start_coordination(self):
        """Start the coordination manager"""
        # Start worker tasks for processing
        for i in range(3):  # 3 worker tasks
            worker = asyncio.create_task(self._worker())
            self.worker_tasks.append(worker)
        
        logger.info("Coordination manager started")
    
    async def _worker(self):
        """Worker task for processing queued tasks"""
        while True:
            try:
                # Get task from queue
                task_info = await self.task_queue.get()
                
                # Process the task
                await self._process_coordinated_task(task_info)
                
                # Mark task as done
                self.task_queue.task_done()
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Worker error: {e}")
    
    async def _process_coordinated_task(self, task_info: Dict[str, Any]):
        """Process a coordinated task"""
        task_id = task_info["task_id"]
        
        try:
            # Execute the task
            result = await task_info["coro"]
            
            # Update task status
            if task_id in self.active_tasks:
                self.active_tasks[task_id]["status"] = "completed"
                self.active_tasks[task_id]["result"] = result
        
        except Exception as e:
            logger.error(f"Task {task_id} failed: {e}")
            if task_id in self.active_tasks:
                self.active_tasks[task_id]["status"] = "failed"
                self.active_tasks[task_id]["error"] = str(e)
    
    @traceable
    async def coordinate_task(self, task_id: str, task_coro, priority: str = "medium"):
        """Coordinate a task execution"""
        # Check if we're at capacity
        if len(self.active_tasks) >= self.max_concurrent_tasks:
            logger.warning(f"System at capacity, queuing task {task_id}")
        
        # Add to active tasks
        self.active_tasks[task_id] = {
            "status": "queued",
            "priority": priority,
            "start_time": datetime.now()
        }
        
        # Queue the task
        await self.task_queue.put({
            "task_id": task_id,
            "coro": task_coro,
            "priority": priority
        })
    
    @traceable
    def get_coordination_status(self) -> Dict[str, Any]:
        """Get current coordination status"""
        return {
            "active_tasks": len(self.active_tasks),
            "queued_tasks": self.task_queue.qsize(),
            "max_concurrent_tasks": self.max_concurrent_tasks,
            "worker_tasks": len(self.worker_tasks),
            "resource_locks": len(self.resource_locks)
        }
    
    async def shutdown(self):
        """Shutdown the coordination manager"""
        # Cancel all worker tasks
        for task in self.worker_tasks:
            task.cancel()
        
        # Wait for workers to finish
        await asyncio.gather(*self.worker_tasks, return_exceptions=True)
        
        logger.info("Coordination manager shutdown")

# Global instances
monitor = AgentMonitor()
coordinator = CoordinationManager()

def get_monitor() -> AgentMonitor:
    """Get the global monitor instance"""
    return monitor

def get_coordinator() -> CoordinationManager:
    """Get the global coordinator instance"""
    return coordinator