/**
 * Test script for error notification system
 * Tests various error scenarios and notifications
 */

const http = require('http');

// Test scenarios
const testScenarios = [
  {
    name: 'Resume Parser - Success',
    url: 'http://localhost:5678/webhook/parse-resume',
    data: { text: 'John Doe\nReact Developer\njohn@example.com', fileName: 'test.pdf' },
    expectedStatus: 200
  },
  {
    name: 'Resume Parser - Timeout (simulated)',
    url: 'http://localhost:5678/webhook/parse-resume-timeout',
    data: { text: 'Test resume', fileName: 'test.pdf' },
    expectedStatus: 404
  },
  {
    name: 'JD Parser - Success',
    url: 'http://localhost:5678/webhook/parse-jd',
    data: { description: 'Senior React Developer with 5+ years experience' },
    expectedStatus: 200
  },
  {
    name: 'JD Parser - Invalid URL',
    url: 'http://localhost:5678/webhook/invalid-jd',
    data: { description: 'Test job description' },
    expectedStatus: 404
  },
  {
    name: 'Candidate Evaluator - Success',
    url: 'http://localhost:5678/webhook/evaluate-candidate',
    data: {
      candidateProfile: { name: 'John', skills: ['React'] },
      jobRequirements: { requiredSkills: ['React', 'Node.js'] }
    },
    expectedStatus: 200
  },
  {
    name: 'Candidate Evaluator - Connection Error',
    url: 'http://localhost:9999/webhook/evaluate-candidate',
    data: { candidateProfile: {}, jobRequirements: {} },
    expectedStatus: 'CONNECTION_ERROR'
  }
];

async function testScenario(scenario) {
  return new Promise((resolve) => {
    console.log(`\n🧪 Testing: ${scenario.name}`);
    console.log(`📍 URL: ${scenario.url}`);
    
    const postData = JSON.stringify(scenario.data);
    const url = new URL(scenario.url);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const status = res.statusCode;
        const success = status === scenario.expectedStatus;
        
        console.log(`📊 Status: ${status} ${success ? '✅' : '❌'}`);
        
        if (status === 200) {
          try {
            const result = JSON.parse(data);
            if (result.success || result.overallScore !== undefined) {
              console.log(`✅ Response: Valid data received`);
            } else {
              console.log(`⚠️  Response: Unexpected format`);
            }
          } catch (e) {
            console.log(`❌ Response: Invalid JSON`);
          }
        } else if (status === 404) {
          console.log(`❌ Workflow not registered or inactive`);
        } else {
          console.log(`⚠️  Unexpected status: ${status}`);
        }
        
        resolve({ scenario: scenario.name, status, success, data });
      });
    });

    req.on('error', (e) => {
      const isExpectedError = scenario.expectedStatus === 'CONNECTION_ERROR';
      console.log(`${isExpectedError ? '✅' : '❌'} Connection Error: ${e.message}`);
      resolve({ 
        scenario: scenario.name, 
        status: 'CONNECTION_ERROR', 
        success: isExpectedError, 
        error: e.message 
      });
    });

    req.on('timeout', () => {
      console.log(`⏰ Request timeout`);
      req.destroy();
      resolve({ 
        scenario: scenario.name, 
        status: 'TIMEOUT', 
        success: false, 
        error: 'Request timeout' 
      });
    });

    req.write(postData);
    req.end();
  });
}

async function runAllTests() {
  console.log('🚀 Starting Error Notification System Tests');
  console.log('=' .repeat(60));
  
  const results = [];
  
  for (const scenario of testScenarios) {
    const result = await testScenario(scenario);
    results.push(result);
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);
  
  if (failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    failed.forEach(f => {
      console.log(`   - ${f.scenario}: ${f.status} ${f.error ? `(${f.error})` : ''}`);
    });
  }
  
  console.log('\n💡 Error Notification Types to Test:');
  console.log('   - N8N_RESUME_PARSER_FAILED');
  console.log('   - N8N_JD_PARSER_FAILED');
  console.log('   - N8N_EVALUATOR_FAILED');
  console.log('   - N8N_TIMEOUT');
  console.log('   - N8N_CONNECTION_FAILED');
  console.log('   - FILE_TOO_LARGE');
  console.log('   - FILE_TYPE_UNSUPPORTED');
  console.log('   - PDF_EXTRACTION_FAILED');
  
  console.log('\n🎯 Next Steps:');
  console.log('   1. Ensure all n8n workflows are active');
  console.log('   2. Test file upload with various file types');
  console.log('   3. Test with oversized files');
  console.log('   4. Test network disconnection scenarios');
  console.log('   5. Verify notifications appear in UI');
}

runAllTests().catch(console.error);