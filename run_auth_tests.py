#!/usr/bin/env python3
"""
Test runner for Logto authentication integration tests.

This script runs all authentication-related tests and provides a summary.
"""

import os
import sys
import unittest
from io import StringIO

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def run_auth_tests():
    """Run authentication integration tests."""
    print("🔐 Running Logto Authentication Integration Tests")
    print("=" * 60)
    
    # Set up test environment
    os.environ.setdefault('LOGTO_ENDPOINT', 'https://test.logto.app')
    os.environ.setdefault('LOGTO_APP_ID', 'test-app-id')
    os.environ.setdefault('LOGTO_APP_SECRET', 'test-secret')
    os.environ.setdefault('SECRET_KEY', 'test-secret-key')
    os.environ.setdefault('JWT_ISSUER', 'https://test.logto.app')
    os.environ.setdefault('JWT_AUDIENCE', 'test-app-id')
    
    # Discover and run tests
    loader = unittest.TestLoader()
    suite = loader.discover('tests', pattern='test_auth_*.py')
    
    # Run tests with detailed output
    stream = StringIO()
    runner = unittest.TextTestRunner(
        stream=stream,
        verbosity=2,
        descriptions=True,
        failfast=False
    )
    
    result = runner.run(suite)
    
    # Print results
    output = stream.getvalue()
    print(output)
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print(f"Skipped: {len(result.skipped) if hasattr(result, 'skipped') else 0}")
    
    if result.failures:
        print("\n❌ FAILURES:")
        for test, traceback in result.failures:
            print(f"  - {test}: {traceback.split('AssertionError:')[-1].strip() if 'AssertionError:' in traceback else 'See details above'}")
    
    if result.errors:
        print("\n💥 ERRORS:")
        for test, traceback in result.errors:
            print(f"  - {test}: {traceback.split('Exception:')[-1].strip() if 'Exception:' in traceback else 'See details above'}")
    
    # Overall status
    if result.wasSuccessful():
        print("\n✅ ALL TESTS PASSED - LOGTO INTEGRATION READY!")
        print("\n🎉 Your Logto authentication system is fully operational!")
        print("Next steps:")
        print("  1. Set up your actual Logto tenant credentials in .env")
        print("  2. Deploy the authentication endpoints")
        print("  3. Test with real Logto authentication flow")
        return True
    else:
        print("\n❌ SOME TESTS FAILED - REVIEW REQUIRED")
        print("Please fix the failing tests before deploying to production.")
        return False


def check_dependencies():
    """Check if required dependencies are available."""
    print("🔍 Checking dependencies...")
    
    missing_deps = []
    
    try:
        import jwt
        print("  ✅ PyJWT")
    except ImportError:
        missing_deps.append("PyJWT")
        print("  ❌ PyJWT")
    
    try:
        import logto
        print("  ✅ Logto Python SDK")
    except ImportError:
        missing_deps.append("logto")
        print("  ❌ Logto Python SDK")
    
    try:
        import flask
        print("  ✅ Flask")
    except ImportError:
        missing_deps.append("Flask")
        print("  ❌ Flask")
    
    if missing_deps:
        print(f"\n❌ Missing dependencies: {', '.join(missing_deps)}")
        print("Install them with: pip install " + " ".join(missing_deps))
        return False
    
    print("  ✅ All dependencies available\n")
    return True


def main():
    """Main test runner function."""
    print("🚀 Logto Authentication Integration Test Suite")
    print("=" * 60)
    
    # Check dependencies
    if not check_dependencies():
        print("Please install missing dependencies before running tests.")
        sys.exit(1)
    
    # Run tests
    success = run_auth_tests()
    
    if success:
        print("\n🎯 INTEGRATION STATUS: COMPLETE ✅")
        sys.exit(0)
    else:
        print("\n🎯 INTEGRATION STATUS: NEEDS WORK ❌")
        sys.exit(1)


if __name__ == '__main__':
    main()