#!/bin/bash
# Quick Test Execution Script for Phase 4A
# Run this to execute all tests and generate reports

echo "🚀 LangGraph Platform - Phase 4A Test Execution"
echo "=============================================="
echo ""

# Activate virtual environment
source venv/bin/activate

# Create reports directory if it doesn't exist
mkdir -p testing/reports/{unit,e2e,performance,security}

echo "📊 Step 1: Running existing project tests..."
echo "-------------------------------------------"
python -m pytest test_*.py -v --tb=short --html=testing/reports/existing_tests_report.html --self-contained-html || true

echo ""
echo "🧪 Step 2: Running unit tests..."
echo "--------------------------------"
python -m pytest testing/unit/ -v --cov=. --cov-report=html --cov-report=term || true

echo ""
echo "🌐 Step 3: Running E2E tests..."
echo "-------------------------------"
echo "Note: Ensure your application is running on http://localhost:8000"
python -m pytest testing/e2e/ -v --html=testing/reports/e2e/e2e_report.html --self-contained-html || true

echo ""
echo "⚡ Step 4: Running performance tests..."
echo "--------------------------------------"
# Check if k6 is installed
if command -v k6 &> /dev/null; then
    echo "Running k6 load tests..."
    k6 run --out json=testing/reports/performance/k6_results.json testing/performance/load_test.js || true
else
    echo "⚠️  k6 not installed. Install with: brew install k6"
fi

# Run Lighthouse if available
echo "Running Lighthouse audit (if available)..."
python testing/performance/lighthouse_test.py 2>/dev/null || echo "⚠️  Lighthouse tests skipped (requires web UI)"

echo ""
echo "🔒 Step 5: Running security audit..."
echo "-----------------------------------"
python testing/security/security_audit.py || true

echo ""
echo "📊 Step 6: Generating coverage report..."
echo "---------------------------------------"
python -m pytest --cov=. --cov-report=html --cov-report=term --cov-report=json -q

echo ""
echo "✅ Test execution complete!"
echo ""
echo "📄 Reports available at:"
echo "  - HTML Coverage: htmlcov/index.html"
echo "  - Test Reports: testing/reports/"
echo "  - Coverage JSON: coverage.json"
echo ""
echo "📈 Next steps:"
echo "  1. Review test results"
echo "  2. Fix any failing tests"
echo "  3. Improve coverage to 80%+"
echo "  4. Address security vulnerabilities"
echo "  5. Optimize performance bottlenecks"
