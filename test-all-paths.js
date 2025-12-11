/**
 * Test all possible webhook paths to find active workflows
 */

const http = require('http');

const testPaths = [
  // JD Parser variations
  '/webhook/parser-jd',
  '/webhook-test/parser-jd', 
  '/webhook/parse-jd',
  '/webhook-test/parse-jd',
  '/webhook/jd-parser',
  '/webhook-test/jd-parser',
  
  // Candidate Evaluator variations
  '/webhook/evaluate-candidate',
  '/webhook-test/evaluate-candidate',
  '/webhook/candidate-evaluator',
  '/webhook-test/candidate-evaluator',
  '/webhook/evaluator',
  '/webhook-test/evaluator'
];

async function testPath(path, data) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 5678,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        const status = res.statusCode === 200 ? '✅ ACTIVE' : 
                      res.statusCode === 404 ? '❌ NOT FOUND' : 
                      `⚠️  STATUS ${res.statusCode}`;
        console.log(`${path}: ${status}`);
        if (res.statusCode === 200) {
          console.log(`   Response: ${responseData.substring(0, 100)}...`);
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.log(`${path}: ❌ ERROR - ${e.message}`);
      resolve();
    });

    req.write(postData);
    req.end();
  });
}

async function testAllPaths() {
  console.log('🔍 Testing all possible webhook paths...\n');
  
  console.log('📋 JD Parser paths:');
  const jdData = { description: 'Senior React Developer with 5+ years experience' };
  
  for (const path of testPaths.slice(0, 6)) {
    await testPath(path, jdData);
  }
  
  console.log('\n🎯 Candidate Evaluator paths:');
  const evalData = {
    candidateProfile: { name: 'John', skills: ['React'] },
    jobRequirements: { requiredSkills: ['React', 'Node.js'] }
  };
  
  for (const path of testPaths.slice(6)) {
    await testPath(path, evalData);
  }
  
  console.log('\n💡 If any path shows "✅ ACTIVE", use that URL in your .env file');
}

testAllPaths();