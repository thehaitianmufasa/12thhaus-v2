"""
End-to-End Tests for LangGraph Multi-Agent Platform
Tests complete user journeys and platform workflows
"""
import pytest
import asyncio
from playwright.async_api import async_playwright, expect
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from test_config import TEST_CONFIG, TEST_DATA

class TestPlatformE2E:
    """End-to-end tests for the complete platform"""
    
    @pytest.fixture
    async def browser_context(self):
        """Create browser context for testing"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='LangGraph-E2E-Test/1.0'
            )
            yield context
            await browser.close()
    
    @pytest.mark.asyncio
    async def test_api_health_check(self, browser_context):
        """Test API health endpoint"""
        page = await browser_context.new_page()
        
        # Test API endpoint
        response = await page.goto(f"{TEST_CONFIG['api']['base_url']}/health")
        assert response.status == 200
        
        # Check response content
        content = await response.json()
        assert content.get('status') == 'healthy'
    
    @pytest.mark.asyncio
    async def test_basic_page_load(self, browser_context):
        """Test basic page loading"""
        page = await browser_context.new_page()
        
        # Navigate to main page
        await page.goto(TEST_CONFIG['api']['base_url'])
        
        # Wait for page to load
        await page.wait_for_load_state('networkidle')
        
        # Check title exists
        title = await page.title()
        assert title is not None and len(title) > 0

if __name__ == "__main__":
    # Install playwright browsers if needed
    import subprocess
    subprocess.run(["playwright", "install", "chromium"], check=True)
    
    # Run tests
    pytest.main([__file__, "-v", "--tb=short"])
