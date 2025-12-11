const http = require('http');

const paths = [
  '/webhook-test/evaluate-candidate',
  '/webhook-test/candidate-evaluator', 
  '/webhook-test/evaluator',
  '/webhook/evaluate-candidate',
  '/webhook/candidate-evaluator',
  '/webhook/evaluator'
];

function testPath(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5678,
      path: path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      resolve({ path, status: res.statusCode });
    });

    req.on('error', () => resolve({ path, status: 'ERROR' }));
    req.setTimeout(3000, () => {
      req.destroy();
      resolve({ path, status: 'TIMEOUT' });
    });

    req.write('{"test": true}');
    req.end();
  });
}

async function testAllPaths() {
  console.log('🔍 Testing webhook path variations...\n');
  
  for (const path of paths) {
    const result = await testPath(path);
    const status = result.status === 404 ? '❌ 404' : 
                   result.status === 200 ? '✅ 200' :
                   result.status === 500 ? '🔄 500' : `⚠️ ${result.status}`;
    console.log(`${status} ${path}`);
  }
}

testAllPaths();