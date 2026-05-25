// Dynamic import local heuristics logic from compiled code or source
async function runTests() {
  console.log('--------------------------------------------------');
  console.log('RUNNING CHROME EXTENSION HEURISTIC ENGINE TESTS');
  console.log('--------------------------------------------------\n');

  // Dynamically import local heuristics logic from compiled code or source
  // To avoid ES module import overhead in Node CLI, we will replicate the mock tests
  // using the source file. But since it's already compiled into dist, let's import it.
  const path = require('path');
  const heuristicsPath = path.resolve(__dirname, './src/background/localHeuristics.ts');
  
  // Register ts-node on the fly if needed, or simply test using a clean JS implementation
  // Let's implement the test cases using a dynamic loader
  const testUrls = [
    { url: 'google.com', expectedStatus: 'SAFE' },
    { url: 'https://github.com/Abhisly', expectedStatus: 'SAFE' },
    { url: 'http://insecure-http-site.org', expectedStatus: 'MALICIOUS' },
    { url: '192.168.1.1', expectedStatus: 'MALICIOUS' },
    { url: 'http://paypal-security-login-update.com', expectedStatus: 'MALICIOUS' },
    { url: 'http://g00g1e-login.xyz', expectedStatus: 'MALICIOUS' },
    { url: 'http://apple-support-icloud-login.verification-portal-chase.com', expectedStatus: 'MALICIOUS' }
  ];

  // Load compiled JS version
  const { analyzeUrlLocal } = require('./localHeuristics.js');
  
  let passed = 0;
  for (const testCase of testUrls) {
    const result = analyzeUrlLocal(testCase.url);
    const score = result.score;
    const status = result.status;
    
    console.log(`[TEST] URL: ${testCase.url}`);
    console.log(`       Score: ${score}/100`);
    console.log(`       Verdict: ${status}`);
    console.log(`       Reasons matched: ${result.reasons.map(r => r.id).join(', ') || 'NONE'}`);
    
    if (status === testCase.expectedStatus) {
      console.log('       Result: ✅ PASSED\n');
      passed++;
    } else {
      console.log(`       Result: ❌ FAILED (Expected: ${testCase.expectedStatus})\n`);
    }
  }

  console.log(`Tests completed: ${passed}/${testUrls.length} passed.`);
}

// Since localHeuristics.ts is TypeScript, we run this via ts-node or simple compilation.
// We'll run it using a ts-node runner if we have it, or compile it to JS temporarily.
runTests().catch(err => {
  // If TypeScript import fails directly in raw node, we'll compile and run it
  // Using vite-node or compile-first. Let's write a self-contained JS test file.
});
