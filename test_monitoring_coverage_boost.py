#!/usr/bin/env python3
"""
Comprehensive test suite to boost monitoring.py coverage above 80%
Tests all uncovered functionality and edge cases
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
    get_monitor, get_coordinator
)
import config

class TestAgentMetrics:
    """Test AgentMetrics dataclass"""
    
    def test_agent_metrics_defaults(self):
        """Test AgentMetrics initialization with defaults"""
        metrics = AgentMetrics(agent_type="test_agent")
        assert metrics.agent_type == "test_agent"
        assert metrics.total_tasks == 0
        assert metrics.successful_tasks == 0
        assert metrics.failed_tasks == 0
        assert metrics.average_response_time == 0.0
        assert metrics.last_activity is None
        assert metrics.error_rate == 0.0

class TestSystemMetrics:
    """Test SystemMetrics dataclass"""
    
    def test_system_metrics_defaults(self):
        """Test SystemMetrics initialization with defaults"""
        metrics = SystemMetrics()
        assert metrics.total_requests == 0
        assert metrics.successful_requests == 0
        assert metrics.failed_requests == 0
        assert metrics.average_routing_time == 0.0
        assert metrics.uptime == 0.0
        assert isinstance(metrics.agent_metrics, dict)
        assert len(metrics.agent_metrics) == 0

class TestAgentMonitor:
    """Test AgentMonitor functionality"""
    
    @pytest.fixture
    def monitor(self):
        """Create a fresh monitor for each test"""
        return AgentMonitor()
    
    def test_monitor_initialization(self, monitor):
        """Test monitor initialization"""
        assert monitor.start_time is not None