#!/usr/bin/env python3
"""
Comprehensive test suite to push monitoring.py above 80% coverage
Targets all uncovered functionality systematically
"""
import pytest
import asyncio
from unittest.mock import patch, MagicMock, AsyncMock
import json
import os
import sys
from pathlib import Path
from datetime import datetime, timedelta

# Add the current directory to the path
sys.path.insert(0, str(Path(__file__).parent))

from monitoring import (
    AgentMonitor, CoordinationManager, SystemMetrics, AgentMetrics,
    get_monitor, get_coordinator, monitor, coordinator
)
from config import Config

class TestAgentMetrics:
    """Test AgentMetrics dataclass functionality"""
    
    def test_agent_metrics_initialization(self):
        """Test AgentMetrics creation with all parameters"""
        metrics = AgentMetrics(
            agent_type="test_agent",
            total_tasks=10,
            successful_tasks=8,
            failed_tasks=2,
            average_response_time=1.5,
            last_activity=datetime.now(),
            error_rate=0.2
        )
        assert metrics.agent_type == "test_agent"
        assert metrics.total_tasks == 10
        assert metrics.successful_tasks == 8
        assert metrics.failed_tasks == 2
        assert metrics.average_response_time == 1.5
        assert metrics.error_rate == 0.2

class TestSystemMetrics:
    """Test SystemMetrics dataclass functionality"""
    
    def test_system_metrics_initialization(self):
        """Test SystemMetrics creation with all parameters"""
        agent_metrics = {"test": AgentMetrics("test")}
        metrics = SystemMetrics(
            total_requests=100,
            successful_requests=95,
            failed_requests=5,
            average_routing_time=0.5,
            uptime=3600.0,
            agent_metrics=agent_metrics
        )
        assert metrics.total_requests == 100
        assert metrics.successful_requests == 95
        assert metrics.failed_requests == 5
        assert metrics.average_routing_time == 0.5
        assert metrics.uptime == 3600.0
        assert "test" in metrics.agent_metrics

class TestAgentMonitorComprehensive:
    """Comprehensive tests for AgentMonitor class"""
    
    @pytest.fixture
    def fresh_monitor(self):
        """Create a fresh monitor for each test"""
        return AgentMonitor()
    
    def test_monitor_initialization_with_langsmith(self, fresh_monitor):
        """Test monitor initialization with LangSmith"""
        with patch.object(Config, 'LANGCHAIN_API_KEY', 'test_key'):
            with patch('monitoring.LangSmithClient') as mock_client:
                monitor = AgentMonitor()
                mock_client.assert_called_once()
    
    def test_monitor_initialization_without_langsmith(self, fresh_monitor):
        """Test monitor initialization without LangSmith"""
        with patch.object(Config, 'LANGCHAIN_API_KEY', None):
            monitor = AgentMonitor()
            assert monitor.langsmith_client is None
    
    def test_record_task_start_new_agent(self, fresh_monitor):
        """Test recording task start for new agent type"""
        fresh_monitor.record_task_start("task1", "new_agent", "Test task")
        
        assert "new_agent" in fresh_monitor.metrics.agent_metrics
        assert fresh_monitor.metrics.agent_metrics["new_agent"].total_tasks == 1
        assert fresh_monitor.metrics.total_requests == 1
        assert len(fresh_monitor.task_history) == 1
    
    def test_record_task_start_existing_agent(self, fresh_monitor):
        """Test recording task start for existing agent type"""
        # First task
        fresh_monitor.record_task_start("task1", "existing_agent", "Test task 1")
        # Second task
        fresh_monitor.record_task_start("task2", "existing_agent", "Test task 2")
        
        assert fresh_monitor.metrics.agent_metrics["existing_agent"].total_tasks == 2
        assert fresh_monitor.metrics.total_requests == 2
    
    def test_record_task_completion_success(self, fresh_monitor):
        """Test successful task completion recording"""
        fresh_monitor.record_task_start("task1", "test_agent", "Test task")
        fresh_monitor.record_task_completion("task1", True, 1.5)
        
        agent_metrics = fresh_monitor.metrics.agent_metrics["test_agent"]
        assert agent_metrics.successful_tasks == 1
        assert agent_metrics.failed_tasks == 0
        assert agent_metrics.average_response_time == 1.5
        assert agent_metrics.error_rate == 0.0
        assert fresh_monitor.metrics.successful_requests == 1
    
    def test_record_task_completion_failure(self, fresh_monitor):
        """Test failed task completion recording"""
        fresh_monitor.record_task_start("task1", "test_agent", "Test task")
        fresh_monitor.record_task_completion("task1", False, 2.0, "Test error")
        
        agent_metrics = fresh_monitor.metrics.agent_metrics["test_agent"]
        assert agent_metrics.successful_tasks == 0
        assert agent_metrics.failed_tasks == 1
        assert agent_metrics.error_rate == 1.0
        assert fresh_monitor.metrics.failed_requests == 1
        
        # Check error is recorded in task history
        task_record = fresh_monitor.task_history[0]
        assert task_record["error"] == "Test error"
        assert task_record["status"] == "failed"
    
    def test_record_task_completion_unknown_task(self, fresh_monitor):
        """Test task completion for unknown task ID"""
        with patch('monitoring.logger') as mock_logger:
            fresh_monitor.record_task_completion("unknown_task", True, 1.0)
            mock_logger.warning.assert_called_once()
    
    def test_average_response_time_calculation(self, fresh_monitor):
        """Test average response time calculation over multiple tasks"""
        fresh_monitor.record_task_start("task1", "test_agent", "Task 1")
        fresh_monitor.record_task_completion("task1", True, 1.0)
        
        fresh_monitor.record_task_start("task2", "test_agent", "Task 2")
        fresh_monitor.record_task_completion("task2", True, 3.0)
        
        agent_metrics = fresh_monitor.metrics.agent_metrics["test_agent"]
        assert agent_metrics.average_response_time == 2.0  # (1.0 + 3.0) / 2
    
    def test_task_history_size_limit(self, fresh_monitor):
        """Test task history maintains size limit"""
        # Override max_history_size for testing
        fresh_monitor.max_history_size = 5
        
        # Add more tasks than the limit
        for i in range(10):
            fresh_monitor.record_task_start(f"task{i}", "test_agent", f"Task {i}")
        
        assert len(fresh_monitor.task_history) == 5
        # Should keep the last 5 tasks
        assert fresh_monitor.task_history[0]["task_id"] == "task5"
        assert fresh_monitor.task_history[-1]["task_id"] == "task9"
    
    def test_get_system_health_healthy(self, fresh_monitor):
        """Test system health reporting when healthy"""
        # Create successful tasks
        for i in range(10):
            fresh_monitor.record_task_start(f"task{i}", "test_agent", f"Task {i}")
            fresh_monitor.record_task_completion(f"task{i}", True, 1.0)
        
        health = fresh_monitor.get_system_health()
        
        assert health["system_status"] == "healthy"
        assert health["success_rate"] == 1.0
        assert health["total_requests"] == 10
        assert "test_agent" in health["agent_health"]
        assert health["agent_health"]["test_agent"]["status"] == "healthy"
    
    def test_get_system_health_warning(self, fresh_monitor):
        """Test system health reporting in warning state"""
        # Create mixed success/failure tasks (80% success rate)
        for i in range(10):
            fresh_monitor.record_task_start(f"task{i}", "test_agent", f"Task {i}")
            success = i < 8  # First 8 succeed, last 2 fail
            fresh_monitor.record_task_completion(f"task{i}", success, 1.0)
        
        health = fresh_monitor.get_system_health()
        
        assert health["system_status"] == "warning"  # 0.8 success rate
        assert health["success_rate"] == 0.8
    
    def test_get_system_health_unhealthy(self, fresh_monitor):
        """Test system health reporting when unhealthy"""
        # Create mostly failed tasks (60% success rate)
        for i in range(10):
            fresh_monitor.record_task_start(f"task{i}", "test_agent", f"Task {i}")
            success = i < 6  # First 6 succeed, last 4 fail
            fresh_monitor.record_task_completion(f"task{i}", success, 1.0)
        
        health = fresh_monitor.get_system_health()
        
        assert health["system_status"] == "unhealthy"  # 0.6 success rate
        assert health["success_rate"] == 0.6
    
    def test_get_performance_metrics(self, fresh_monitor):
        """Test performance metrics retrieval"""
        fresh_monitor.record_task_start("task1", "agent1", "Task 1")
        fresh_monitor.record_task_completion("task1", True, 1.5)
        
        fresh_monitor.record_task_start("task2", "agent2", "Task 2")
        fresh_monitor.record_task_completion("task2", False, 2.0)
        
        metrics = fresh_monitor.get_performance_metrics()
        
        assert metrics["system_metrics"]["total_requests"] == 2
        assert metrics["system_metrics"]["successful_requests"] == 1
        assert metrics["system_metrics"]["failed_requests"] == 1
        
        assert "agent1" in metrics["agent_metrics"]
        assert "agent2" in metrics["agent_metrics"]
        assert metrics["agent_metrics"]["agent1"]["successful_tasks"] == 1
        assert metrics["agent_metrics"]["agent2"]["failed_tasks"] == 1
    
    def test_get_recent_tasks(self, fresh_monitor):
        """Test recent tasks retrieval with limit"""
        # Add multiple tasks
        for i in range(15):
            fresh_monitor.record_task_start(f"task{i}", "test_agent", f"Task {i}")
        
        # Test default limit
        recent = fresh_monitor.get_recent_tasks()
        assert len(recent) == 10  # Default limit
        
        # Test custom limit
        recent_5 = fresh_monitor.get_recent_tasks(limit=5)
        assert len(recent_5) == 5
        
        # Should be sorted by start_time, most recent first
        assert recent[0]["task_id"] == "task14"
    
    def test_get_recent_tasks_datetime_serialization(self, fresh_monitor):
        """Test that datetime objects are properly serialized in recent tasks"""
        fresh_monitor.record_task_start("task1", "test_agent", "Task 1")
        fresh_monitor.record_task_completion("task1", True, 1.0)
        
        recent = fresh_monitor.get_recent_tasks()
        
        # Check that datetime is converted to ISO format string
        assert isinstance(recent[0]["start_time"], str)
        assert isinstance(recent[0]["end_time"], str)
    
    @pytest.mark.asyncio
    async def test_export_metrics_to_langsmith_success(self, fresh_monitor):
        """Test successful metrics export to LangSmith"""
        # Mock LangSmith client
        fresh_monitor.langsmith_client = MagicMock()
        
        with patch('monitoring.logger') as mock_logger:
            await fresh_monitor.export_metrics_to_langsmith()
            mock_logger.info.assert_called_with("Metrics exported to LangSmith")
    
    @pytest.mark.asyncio
    async def test_export_metrics_to_langsmith_no_client(self, fresh_monitor):
        """Test metrics export when no LangSmith client available"""
        fresh_monitor.langsmith_client = None
        
        with patch('monitoring.logger') as mock_logger:
            await fresh_monitor.export_metrics_to_langsmith()
            mock_logger.warning.assert_called_with("LangSmith client not available for metrics export")
    
    @pytest.mark.asyncio
    async def test_export_metrics_to_langsmith_error(self, fresh_monitor):
        """Test metrics export error handling"""
        fresh_monitor.langsmith_client = MagicMock()
        
        with patch.object(fresh_monitor, 'get_system_health', side_effect=Exception("Test error")):
            with patch('monitoring.logger') as mock_logger:
                await fresh_monitor.export_metrics_to_langsmith()
                mock_logger.error.assert_called_with("Failed to export metrics to LangSmith: Test error")
    
    def test_reset_metrics(self, fresh_monitor):
        """Test metrics reset functionality"""
        # Add some data
        fresh_monitor.record_task_start("task1", "test_agent", "Task 1")
        fresh_monitor.record_task_completion("task1", True, 1.0)
        
        # Verify data exists
        assert fresh_monitor.metrics.total_requests == 1
        assert len(fresh_monitor.task_history) == 1
        
        # Reset metrics
        old_start_time = fresh_monitor.start_time
        fresh_monitor.reset_metrics()
        
        # Verify reset
        assert fresh_monitor.metrics.total_requests == 0
        assert len(fresh_monitor.task_history) == 0
        assert fresh_monitor.start_time > old_start_time

class TestCoordinationManager:
    """Comprehensive tests for CoordinationManager class"""
    
    @pytest.fixture
    def fresh_coordinator(self):
        """Create a fresh coordinator for each test"""
        return CoordinationManager()
    
    def test_coordinator_initialization(self, fresh_coordinator):
        """Test coordinator initialization"""
        assert isinstance(fresh_coordinator.active_tasks, dict)
        assert isinstance(fresh_coordinator.resource_locks, dict)
        assert fresh_coordinator.max_concurrent_tasks == 10
        assert isinstance(fresh_coordinator.task_queue, asyncio.Queue)
        assert isinstance(fresh_coordinator.worker_tasks, list)
    
    @pytest.mark.asyncio
    async def test_start_coordination(self, fresh_coordinator):
        """Test coordination manager startup"""
        await fresh_coordinator.start_coordination()
        
        # Should have 3 worker tasks
        assert len(fresh_coordinator.worker_tasks) == 3
        
        # Clean up
        await fresh_coordinator.shutdown()
    
    @pytest.mark.asyncio
    async def test_coordinate_task(self, fresh_coordinator):
        """Test task coordination"""
        async def dummy_task():
            return "task_result"
        
        task_id = "test_task_1"
        await fresh_coordinator.coordinate_task(task_id, dummy_task(), "high")
        
        # Task should be in active tasks
        assert task_id in fresh_coordinator.active_tasks
        assert fresh_coordinator.active_tasks[task_id]["status"] == "queued"
        assert fresh_coordinator.active_tasks[task_id]["priority"] == "high"
    
    @pytest.mark.asyncio
    async def test_coordinate_task_at_capacity(self, fresh_coordinator):
        """Test task coordination when at capacity"""
        # Fill up to capacity
        for i in range(fresh_coordinator.max_concurrent_tasks):
            await fresh_coordinator.coordinate_task(f"task_{i}", asyncio.sleep(0.1), "medium")
        
        # Add one more task
        with patch('monitoring.logger') as mock_logger:
            await fresh_coordinator.coordinate_task("overflow_task", asyncio.sleep(0.1), "low")
            mock_logger.warning.assert_called()
    
    @pytest.mark.asyncio
    async def test_process_coordinated_task_success(self, fresh_coordinator):
        """Test successful coordinated task processing"""
        async def successful_task():
            return "success_result"
        
        task_info = {
            "task_id": "success_task",
            "coro": successful_task(),
            "priority": "medium"
        }
        
        # Add to active tasks first
        fresh_coordinator.active_tasks["success_task"] = {"status": "running"}
        
        await fresh_coordinator._process_coordinated_task(task_info)
        
        # Check task was marked as completed
        assert fresh_coordinator.active_tasks["success_task"]["status"] == "completed"
        assert fresh_coordinator.active_tasks["success_task"]["result"] == "success_result"
    
    @pytest.mark.asyncio
    async def test_process_coordinated_task_failure(self, fresh_coordinator):
        """Test failed coordinated task processing"""
        async def failing_task():
            raise Exception("Task failed")
        
        task_info = {
            "task_id": "failing_task",
            "coro": failing_task(),
            "priority": "medium"
        }
        
        # Add to active tasks first
        fresh_coordinator.active_tasks["failing_task"] = {"status": "running"}
        
        with patch('monitoring.logger') as mock_logger:
            await fresh_coordinator._process_coordinated_task(task_info)
            mock_logger.error.assert_called()
        
        # Check task was marked as failed
        assert fresh_coordinator.active_tasks["failing_task"]["status"] == "failed"
        assert "error" in fresh_coordinator.active_tasks["failing_task"]
    
    def test_get_coordination_status(self, fresh_coordinator):
        """Test coordination status retrieval"""
        # Add some active tasks
        fresh_coordinator.active_tasks["task1"] = {"status": "running"}
        fresh_coordinator.active_tasks["task2"] = {"status": "queued"}
        
        status = fresh_coordinator.get_coordination_status()
        
        assert status["active_tasks"] == 2
        assert status["max_concurrent_tasks"] == 10
        assert status["worker_tasks"] == 0  # No workers started yet
        assert "queued_tasks" in status
        assert "resource_locks" in status
    
    @pytest.mark.asyncio
    async def test_worker_task_processing(self, fresh_coordinator):
        """Test worker task processing loop"""
        # Start coordination to create workers
        await fresh_coordinator.start_coordination()
        
        # Add a task to the queue
        async def test_task():
            return "worker_result"
        
        await fresh_coordinator.coordinate_task("worker_test", test_task(), "medium")
        
        # Wait a moment for processing
        await asyncio.sleep(0.1)
        
        # Clean up
        await fresh_coordinator.shutdown()
    
    @pytest.mark.asyncio
    async def test_worker_cancellation(self, fresh_coordinator):
        """Test worker task cancellation during shutdown"""
        await fresh_coordinator.start_coordination()
        
        # Verify workers are running
        assert len(fresh_coordinator.worker_tasks) == 3
        assert all(not task.done() for task in fresh_coordinator.worker_tasks)
        
        # Shutdown should cancel workers
        await fresh_coordinator.shutdown()
        
        # Verify workers are cancelled
        assert all(task.done() for task in fresh_coordinator.worker_tasks)
    
    @pytest.mark.asyncio
    async def test_worker_exception_handling(self, fresh_coordinator):
        """Test worker exception handling"""
        await fresh_coordinator.start_coordination()
        
        # Create a task that will cause an exception in processing
        task_info = {
            "task_id": "exception_task",
            "coro": None,  # This will cause an exception
            "priority": "medium"
        }
        
        with patch('monitoring.logger') as mock_logger:
            # Put the problematic task in queue
            await fresh_coordinator.task_queue.put(task_info)
            
            # Wait a moment for processing
            await asyncio.sleep(0.1)
            
            # Worker should handle the exception and continue
            mock_logger.error.assert_called()
        
        await fresh_coordinator.shutdown()

class TestGlobalInstances:
    """Test global monitor and coordinator instances"""
    
    def test_get_monitor(self):
        """Test get_monitor returns the global instance"""
        global_monitor = get_monitor()
        assert isinstance(global_monitor, AgentMonitor)
        assert global_monitor is monitor
    
    def test_get_coordinator(self):
        """Test get_coordinator returns the global instance"""
        global_coordinator = get_coordinator()
        assert isinstance(global_coordinator, CoordinationManager)
        assert global_coordinator is coordinator

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--cov=monitoring", "--cov-report=term-missing"])
