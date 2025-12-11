/**
 * Quick test to check which n8n workflows are active
 */

const http = require('http');

const workflows = [
  {
    name: 'Resume Parser',
    url: 'http://localhost:5678/webhook/parse-resume',
    data: { text: 'John Doe\nReact Developer' }
  },
  {
    name: 'JD Parser', 
    url: 'http://localhost:5678/webhook/parse-jd',
    data: { description: 'We need a React developer with 3+ years experience' }
  },
  {
    name: 'Candidate Evaluator',
    url: 'http://localhost:5678/webhook/evaluate-candidate',
    data: {
      candidateProfile: { name: 'John', skills: ['React'] },
      jobRequirements: { requiredSkills: ['React', 'Node.js'] }
    }
  }
];

async function testWorkflow(workflow) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(workflow.data);
    const url = new URL(workflow.url);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const status = res.statusCode === 200 ? '✅ ACTIVE' : 
                      res.statusCode === 404 ? '❌ NOT REGISTERED' : 
                      `⚠️  STATUS ${res.statusCode}`;
        console.log(`${workflow.name}: ${status}`);
        resolve();
      });
    });

    req.on('error', (e) => {
      console.log(`${workflow.name}: ❌ ERROR - ${e.message}`);
      resolve();
    });

    req.write(postData);
    req.end();
  });
}

async function checkAllWorkflows() {
  console.log('🔍 Checking n8n workflow status...\n');
  
  for (const workflow of workflows) {
    await testWorkflow(workflow);
  }
  
  console.log('\n💡 If any workflows show "NOT REGISTERED":');
  console.log('   1. Go to http://localhost:5678');
  console.log('   2. Find the workflow');
  console.log('   3. Click the "Active" toggle to turn it ON');
}

checkAllWorkflows();