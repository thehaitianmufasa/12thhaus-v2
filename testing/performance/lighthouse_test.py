"""
Lighthouse Performance Testing Configuration
Automated performance audits for web dashboard
"""
import json
import subprocess
import os
from pathlib import Path
from datetime import datetime
import statistics

class LighthouseRunner:
    """Run Lighthouse performance tests and analyze results"""
    
    def __init__(self, base_url="http://localhost:3000", output_dir="testing/reports/lighthouse"):
        self.base_url = base_url
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Performance targets
        self.targets = {
            "performance": 90,
            "accessibility": 95,
            "best-practices": 90,
            "seo": 90,
            "pwa": 80
        }
        
        # Core Web Vitals targets
        self.web_vitals_targets = {
            "first-contentful-paint": 1800,  # 1.8s
            "speed-index": 3400,              # 3.4s
            "largest-contentful-paint": 2500, # 2.5s
            "interactive": 3800,              # 3.8s
            "total-blocking-time": 200,       # 200ms
            "cumulative-layout-shift": 0.1,   # 0.1
        }
    
    def run_lighthouse(self, url_path="", device="desktop", iterations=3):
        """Run Lighthouse audit with multiple iterations"""
        url = f"{self.base_url}{url_path}"
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        results = []
        for i in range(iterations):
            print(f"Running Lighthouse iteration {i+1}/{iterations} for {url}")
            
            output_path = self.output_dir / f"lighthouse_{timestamp}_iter{i+1}.json"
            
            # Lighthouse CLI command
            cmd = [
                "lighthouse",
                url,
                "--output=json",
                f"--output-path={output_path}",
                "--quiet",
                "--chrome-flags='--headless'",
                f"--preset={device}",
                "--only-categories=performance,accessibility,best-practices,seo,pwa"
            ]
            
            if device == "mobile":
                cmd.append("--throttling-method=devtools")
            
            # Run Lighthouse
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                with open(output_path, 'r') as f:
                    report = json.load(f)
                    results.append(report)
            else:
                print(f"Error running Lighthouse: {result.stderr}")
        
        return self.analyze_results(results, url_path)
    
    def analyze_results(self, results, url_path):
        """Analyze multiple Lighthouse runs and return aggregated metrics"""
        if not results:
            return None
        
        analysis = {
            "url": url_path,
            "timestamp": datetime.now().isoformat(),
            "iterations": len(results),
            "scores": {},
            "metrics": {},
            "passed": True
        }
        
        # Aggregate scores
        for category in self.targets.keys():
            scores = [r['categories'][category]['score'] * 100 for r in results if category in r['categories']]
            if scores:
                analysis["scores"][category] = {
                    "mean": statistics.mean(scores),
                    "median": statistics.median(scores),
                    "min": min(scores),
                    "max": max(scores),
                    "target": self.targets[category],
                    "passed": statistics.mean(scores) >= self.targets[category]
                }
                if not analysis["scores"][category]["passed"]:
                    analysis["passed"] = False
        
        # Aggregate metrics
        for metric_key, target in self.web_vitals_targets.items():
            values = []
            for r in results:
                if 'audits' in r and metric_key in r['audits']:
                    value = r['audits'][metric_key]['numericValue']
                    values.append(value)
            
            if values:
                analysis["metrics"][metric_key] = {
                    "mean": statistics.mean(values),
                    "median": statistics.median(values),
                    "min": min(values),
                    "max": max(values),
                    "target": target,
                    "passed": statistics.mean(values) <= target
                }
                if not analysis["metrics"][metric_key]["passed"]:
                    analysis["passed"] = False
        
        # Save analysis
        analysis_path = self.output_dir / f"analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(analysis_path, 'w') as f:
            json.dump(analysis, f, indent=2)
        
        return analysis
    
    def run_full_audit(self):
        """Run complete performance audit for all key pages"""
        pages = [
            {"path": "/", "name": "Homepage"},
            {"path": "/dashboard", "name": "Dashboard"},
            {"path": "/projects", "name": "Projects List"},
            {"path": "/agents", "name": "Agents Management"},
            {"path": "/monitoring", "name": "Monitoring Dashboard"},
            {"path": "/billing", "name": "Billing Page"}
        ]
        
        all_results = []
        
        for page in pages:
            print(f"\n🔍 Testing {page['name']}...")
            
            # Desktop test
            desktop_result = self.run_lighthouse(page['path'], 'desktop')
            if desktop_result:
                desktop_result['device'] = 'desktop'
                desktop_result['page_name'] = page['name']
                all_results.append(desktop_result)
                self.print_summary(desktop_result)
            
            # Mobile test
            mobile_result = self.run_lighthouse(page['path'], 'mobile')
            if mobile_result:
                mobile_result['device'] = 'mobile'
                mobile_result['page_name'] = page['name']
                all_results.append(mobile_result)
                self.print_summary(mobile_result)
        
        # Generate final report
        self.generate_report(all_results)
        
        return all_results
    
    def print_summary(self, result):
        """Print test result summary"""
        print(f"\n📊 Results for {result.get('page_name', result['url'])} ({result.get('device', 'unknown')}):")
        print(f"   Overall: {'✅ PASSED' if result['passed'] else '❌ FAILED'}")
        
        if 'scores' in result:
            print("\n   Scores:")
            for category, data in result['scores'].items():
                status = '✅' if data['passed'] else '❌'
                print(f"   {status} {category.title()}: {data['mean']:.1f} (target: {data['target']})")
        
        if 'metrics' in result:
            print("\n   Core Web Vitals:")
            for metric, data in result['metrics'].items():
                status = '✅' if data['passed'] else '❌'
                metric_name = metric.replace('-', ' ').title()
                print(f"   {status} {metric_name}: {data['mean']:.0f}ms (target: {data['target']}ms)")
    
    def generate_report(self, results):
        """Generate comprehensive HTML report"""
        html_template = """
<!DOCTYPE html>
<html>
<head>
    <title>LangGraph Platform - Lighthouse Performance Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; }
        h1 { color: #333; }
        .summary { background: #e8f4f8; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .page-results { margin: 20px 0; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
        .metric { display: inline-block; margin: 10px 20px 10px 0; }
        .passed { color: #22c55e; }
        .failed { color: #ef4444; }
        .score { font-size: 24px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
        th { background: #f8f9fa; }
        .chart { margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 LangGraph Platform - Performance Audit Report</h1>
        <div class="summary">
            <h2>Summary</h2>
            <p>Generated: {timestamp}</p>
            <p>Total Pages Tested: {total_pages}</p>
            <p>Overall Status: {overall_status}</p>
        </div>
        
        {page_results}
        
        <div class="recommendations">
            <h2>Recommendations</h2>
            {recommendations}
        </div>
    </div>
</body>
</html>
        """
        
        # Build page results HTML
        page_results_html = ""
        for result in results:
            status = "passed" if result['passed'] else "failed"
            page_results_html += f"""
            <div class="page-results">
                <h3>{result.get('page_name', result['url'])} - {result.get('device', 'Unknown')}</h3>
                <div class="{status}">
                    Status: {'✅ PASSED' if result['passed'] else '❌ FAILED'}
                </div>
                <div class="scores">
            """
            
            for category, data in result.get('scores', {}).items():
                status_class = "passed" if data['passed'] else "failed"
                page_results_html += f"""
                    <div class="metric">
                        <div class="{status_class} score">{data['mean']:.0f}</div>
                        <div>{category.title()}</div>
                    </div>
                """
            
            page_results_html += "</div></div>"
        
        # Generate recommendations
        recommendations = self.generate_recommendations(results)
        recommendations_html = "<ul>" + "".join([f"<li>{r}</li>" for r in recommendations]) + "</ul>"
        
        # Fill template
        html_content = html_template.format(
            timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            total_pages=len(results),
            overall_status='✅ All tests passed' if all(r['passed'] for r in results) else '❌ Some tests failed',
            page_results=page_results_html,
            recommendations=recommendations_html
        )
        
        # Save report
        report_path = self.output_dir / f"performance_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
        with open(report_path, 'w') as f:
            f.write(html_content)
        
        print(f"\n📄 Report saved to: {report_path}")
    
    def generate_recommendations(self, results):
        """Generate specific recommendations based on results"""
        recommendations = []
        
        for result in results:
            page_name = result.get('page_name', result['url'])
            
            # Check performance score
            if 'scores' in result and 'performance' in result['scores']:
                perf_score = result['scores']['performance']['mean']
                if perf_score < 90:
                    recommendations.append(
                        f"{page_name}: Optimize performance - current score {perf_score:.0f}/100"
                    )
            
            # Check Core Web Vitals
            if 'metrics' in result:
                if 'largest-contentful-paint' in result['metrics']:
                    lcp = result['metrics']['largest-contentful-paint']['mean']
                    if lcp > 2500:
                        recommendations.append(
                            f"{page_name}: Reduce Largest Contentful Paint (currently {lcp:.0f}ms)"
                        )
                
                if 'total-blocking-time' in result['metrics']:
                    tbt = result['metrics']['total-blocking-time']['mean']
                    if tbt > 200:
                        recommendations.append(
                            f"{page_name}: Minimize JavaScript execution time (TBT: {tbt:.0f}ms)"
                        )
        
        if not recommendations:
            recommendations.append("All performance targets met! Consider setting more aggressive targets.")
        
        return recommendations

if __name__ == "__main__":
    # Run performance audit
    runner = LighthouseRunner()
    results = runner.run_full_audit()
    
    # Check if all passed
    all_passed = all(r['passed'] for r in results)
    exit(0 if all_passed else 1)
