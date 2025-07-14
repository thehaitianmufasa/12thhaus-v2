#!/usr/bin/env python3
"""
Comprehensive Test Runner for LangGraph Multi-Agent Platform
Phase 4A Testing Orchestration
"""
import os
import sys
import subprocess
import json
import time
from datetime import datetime
from pathlib import Path

class TestOrchestrator:
    """Orchestrate all testing phases"""
    
    def __init__(self):
        self.base_dir = Path(__file__).parent.parent
        self.testing_dir = self.base_dir / "testing"
        self.reports_dir = self.testing_dir / "reports"
        self.timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Ensure directories exist
        self.reports_dir.mkdir(parents=True, exist_ok=True)
        (self.reports_dir / "lighthouse").mkdir(exist_ok=True)
        (self.reports_dir / "security").mkdir(exist_ok=True)
        (self.reports_dir / "load").mkdir(exist_ok=True)
        
        self.results = {
            "timestamp": self.timestamp,
            "phases": {},
            "summary": {
                "total_tests": 0,
                "passed": 0,
                "failed": 0,
                "coverage": 0,
                "performance_score": 0,
                "security_score": 0
            }
        }
    
    def run_phase_4a(self):
        """Execute Phase 4A: Comprehensive Testing"""
        print("🚀 Starting Phase 4A: Comprehensive Testing Suite\n")
        
        # Step 1: Initial Analysis
        print("=" * 60)
        print("📊 Step 1: Initial Analysis")
        print("=" * 60)
        self.run_initial_analysis()
        
        # Step 2: Unit Tests
        print("\n" + "=" * 60)
        print("🧪 Step 2: Unit Tests")
        print("=" * 60)
        self.run_unit_tests()
        
        # Step 3: E2E Tests
        print("\n" + "=" * 60)
        print("🌐 Step 3: End-to-End Tests")
        print("=" * 60)
        self.run_e2e_tests()
        
        # Step 4: Performance Tests
        print("\n" + "=" * 60)
        print("⚡ Step 4: Performance Tests")
        print("=" * 60)
        self.run_performance_tests()
        
        # Step 5: Security Audit
        print("\n" + "=" * 60)
        print("🔒 Step 5: Security Audit")
        print("=" * 60)
        self.run_security_audit()
        
        # Generate Final Report
        self.generate_final_report()
    
    def run_initial_analysis(self):
        """Analyze current project state"""
        print("Analyzing project structure and test coverage...")
        
        # Check Python files
        py_files = list(self.base_dir.glob("**/*.py"))
        py_files = [f for f in py_files if "venv" not in str(f) and "__pycache__" not in str(f)]
        
        # Check test files
        test_files = [f for f in py_files if f.name.startswith("test_")]
        
        # Run coverage analysis
        cmd = [
            sys.executable, "-m", "pytest",
            "--cov=.", "--cov-report=json",
            "--cov-report=term-missing",
            "-v"
        ]
        
        try:
            result = subprocess.run(
                cmd,
                cwd=self.base_dir,
                capture_output=True,
                text=True,
                timeout=300
            )
            
            # Parse coverage report
            coverage_file = self.base_dir / "coverage.json"
            if coverage_file.exists():
                with open(coverage_file) as f:
                    coverage_data = json.load(f)
                    coverage_percent = coverage_data.get("totals", {}).get("percent_covered", 0)
                    self.results["summary"]["coverage"] = coverage_percent
            
            self.results["phases"]["initial_analysis"] = {
                "total_files": len(py_files),
                "test_files": len(test_files),
                "coverage": self.results["summary"]["coverage"],
                "status": "completed"
            }
            
            print(f"✅ Analysis Complete:")
            print(f"   - Total Python files: {len(py_files)}")
            print(f"   - Test files: {len(test_files)}")
            print(f"   - Coverage: {self.results['summary']['coverage']:.1f}%")
            
        except Exception as e:
            print(f"❌ Error during analysis: {e}")
            self.results["phases"]["initial_analysis"] = {"status": "failed", "error": str(e)}
    
    def run_unit_tests(self):
        """Run unit tests"""
        print("Running unit tests...")
        
        cmd = [
            sys.executable, "-m", "pytest",
            "testing/unit/",
            "-v",
            "--html=testing/reports/unit_test_report.html",
            "--self-contained-html",
            "--tb=short"
        ]
        
        try:
            result = subprocess.run(
                cmd,
                cwd=self.base_dir,
                capture_output=True,
                text=True,
                timeout=600
            )
            
            # Parse results
            lines = result.stdout.split('\n')
            for line in lines:
                if "passed" in line and "failed" in line:
                    # Extract test counts
                    parts = line.split()
                    for i, part in enumerate(parts):
                        if part == "passed":
                            passed = int(parts[i-1])
                            self.results["summary"]["passed"] += passed
                        elif part == "failed":
                            failed = int(parts[i-1])
                            self.results["summary"]["failed"] += failed
            
            self.results["phases"]["unit_tests"] = {
                "status": "completed" if result.returncode == 0 else "failed",
                "return_code": result.returncode
            }
            
            print(f"{'✅' if result.returncode == 0 else '❌'} Unit tests completed")
            
        except Exception as e:
            print(f"❌ Error running unit tests: {e}")
            self.results["phases"]["unit_tests"] = {"status": "failed", "error": str(e)}
    
    def run_e2e_tests(self):
        """Run end-to-end tests"""
        print("Running E2E tests with Playwright...")
        
        # First, ensure the application is running
        print("Note: Ensure your application is running on http://localhost:8000")
        
        cmd = [
            sys.executable, "-m", "pytest",
            "testing/e2e/",
            "-v",
            "--html=testing/reports/e2e_test_report.html",
            "--self-contained-html",
            "--headed"  # Run in headed mode for debugging
        ]
        
        try:
            result = subprocess.run(
                cmd,
                cwd=self.base_dir,
                capture_output=True,
                text=True,
                timeout=900  # 15 minutes for E2E tests
            )
            
            self.results["phases"]["e2e_tests"] = {
                "status": "completed" if result.returncode == 0 else "failed",
                "return_code": result.returncode
            }
            
            print(f"{'✅' if result.returncode == 0 else '❌'} E2E tests completed")
            
        except Exception as e:
            print(f"❌ Error running E2E tests: {e}")
            self.results["phases"]["e2e_tests"] = {"status": "failed", "error": str(e)}
    
    def run_performance_tests(self):
        """Run performance tests"""
        print("Running performance tests...")
        
        # Run Lighthouse tests
        print("\n📊 Running Lighthouse performance audit...")
        lighthouse_cmd = [
            sys.executable,
            "testing/performance/lighthouse_test.py"
        ]
        
        try:
            result = subprocess.run(
                lighthouse_cmd,
                cwd=self.base_dir,
                capture_output=True,
                text=True,
                timeout=600
            )
            
            # Check for Lighthouse results
            lighthouse_reports = list((self.reports_dir / "lighthouse").glob("*.json"))
            if lighthouse_reports:
                # Get latest report
                latest_report = max(lighthouse_reports, key=lambda p: p.stat().st_mtime)
                with open(latest_report) as f:
                    lighthouse_data = json.load(f)
                    if "scores" in lighthouse_data:
                        perf_score = lighthouse_data["scores"].get("performance", {}).get("mean", 0)
                        self.results["summary"]["performance_score"] = perf_score
            
            print(f"✅ Lighthouse audit completed")
            
        except subprocess.TimeoutExpired:
            print("⚠️  Lighthouse tests timed out - skipping")
        except Exception as e:
            print(f"⚠️  Lighthouse not available: {e}")
        
        # Run k6 load tests
        print("\n📊 Running k6 load tests...")
        k6_cmd = ["k6", "run", "--out", "json=testing/reports/load/k6_results.json", "testing/performance/load_test.js"]
        
        try:
            result = subprocess.run(
                k6_cmd,
                cwd=self.base_dir,
                capture_output=True,
                text=True,
                timeout=1800  # 30 minutes for load test
            )
            
            self.results["phases"]["performance_tests"] = {
                "status": "completed",
                "lighthouse_score": self.results["summary"]["performance_score"],
                "load_test": "completed" if result.returncode == 0 else "failed"
            }
            
            print(f"✅ Load tests completed")
            
        except FileNotFoundError:
            print("⚠️  k6 not installed - install with: brew install k6")
            self.results["phases"]["performance_tests"] = {
                "status": "partial",
                "note": "k6 not installed"
            }
        except Exception as e:
            print(f"❌ Error running performance tests: {e}")
    
    def run_security_audit(self):
        """Run security audit"""
        print("Running comprehensive security audit...")
        
        cmd = [
            sys.executable,
            "testing/security/security_audit.py"
        ]
        
        try:
            result = subprocess.run(
                cmd,
                cwd=self.base_dir,
                capture_output=True,
                text=True,
                timeout=600
            )
            
            # Check for security report
            security_reports = list((self.reports_dir / "security").glob("*.json"))
            if security_reports:
                latest_report = max(security_reports, key=lambda p: p.stat().st_mtime)
                with open(latest_report) as f:
                    security_data = json.load(f)
                    total = security_data.get("total_tests", 1)
                    passed = security_data.get("passed", 0)
                    security_score = (passed / total) * 100 if total > 0 else 0
                    self.results["summary"]["security_score"] = security_score
            
            self.results["phases"]["security_audit"] = {
                "status": "completed",
                "security_score": self.results["summary"]["security_score"]
            }
            
            print(f"✅ Security audit completed")
            
        except Exception as e:
            print(f"❌ Error running security audit: {e}")
            self.results["phases"]["security_audit"] = {"status": "failed", "error": str(e)}
    
    def generate_final_report(self):
        """Generate comprehensive final report"""
        print("\n" + "=" * 60)
        print("📊 FINAL REPORT - Phase 4A Testing")
        print("=" * 60)
        
        # Calculate overall health score
        coverage_weight = 0.3
        performance_weight = 0.3
        security_weight = 0.4
        
        overall_score = (
            self.results["summary"]["coverage"] * coverage_weight +
            self.results["summary"]["performance_score"] * performance_weight +
            self.results["summary"]["security_score"] * security_weight
        )
        
        self.results["summary"]["overall_score"] = overall_score
        
        # Print summary
        print(f"\n🎯 Overall Platform Health Score: {overall_score:.1f}%")
        print(f"\n📊 Metrics:")
        print(f"   - Test Coverage: {self.results['summary']['coverage']:.1f}%")
        print(f"   - Performance Score: {self.results['summary']['performance_score']:.1f}")
        print(f"   - Security Score: {self.results['summary']['security_score']:.1f}%")
        
        # Determine readiness
        if overall_score >= 85:
            print(f"\n✅ Platform is PRODUCTION READY!")
            print(f"   Phase 4A brings platform to {overall_score:.0f}% completion")
        else:
            print(f"\n⚠️  Platform needs improvement (Current: {overall_score:.0f}%)")
            print("   Address the following before production:")
            
            if self.results["summary"]["coverage"] < 80:
                print("   - Increase test coverage to at least 80%")
            if self.results["summary"]["performance_score"] < 90:
                print("   - Optimize performance to achieve 90+ Lighthouse score")
            if self.results["summary"]["security_score"] < 95:
                print("   - Fix security vulnerabilities")
        
        # Save final report
        report_path = self.reports_dir / f"phase_4a_report_{self.timestamp}.json"
        with open(report_path, 'w') as f:
            json.dump(self.results, f, indent=2)
        
        print(f"\n📄 Full report saved to: {report_path}")
        
        # Next steps
        print("\n📋 Next Steps for Phase 4B:")
        print("   1. Fix any identified issues")
        print("   2. Complete production documentation")
        print("   3. Set up monitoring and alerting")
        print("   4. Configure auto-scaling")
        print("   5. Implement backup strategies")
        print("   6. Prepare customer onboarding materials")

if __name__ == "__main__":
    orchestrator = TestOrchestrator()
    orchestrator.run_phase_4a()
