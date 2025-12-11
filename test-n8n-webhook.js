/**
 * Test script for n8n Resume Parser Webhook
 * Run with: node test-n8n-webhook.js
 */

const https = require('https');
const http = require('http');

// Configuration
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/parse-resume';

// Sample resume data (matching the format expected by lib/n8n.ts)
const testData = {
  sessionId: 'test-session-' + Date.now(), // Add sessionId for AI Agent
  text: `John Doe
Email: john.doe@example.com
Phone: (555) 123-4567

PROFESSIONAL SUMMARY
Senior Software Engineer with 8 years of experience in full-stack development.

SKILLS
- JavaScript, TypeScript, React, Node.js
- Python, Django, FastAPI
- PostgreSQL, MongoDB
- AWS, Docker, Kubernetes

EXPERIENCE
Senior Software Engineer | Tech Corp | 2020 - Present
- Led development of microservices architecture
- Mentored junior developers
- Improved system performance by 40%

Software Engineer | StartupXYZ | 2016 - 2020
- Built RESTful APIs using Node.js
- Developed React frontend applications
- Implemented CI/CD pipelines

EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2016`,
  fileName: 'john-doe-resume.pdf',
  fileType: 'pdf'
};

// Parse URL
const url = new URL(N8N_WEBHOOK_URL);
const isHttps = url.protocol === 'https:';
const client = isHttps ? https : http;

// Prepare request
const postData = JSON.stringify(testData);

const options = {
  hostname: url.hostname,
  port: url.port || (isHttps ? 443 : 80),
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🚀 Testing n8n webhook...');
console.log('📍 URL:', N8N_WEBHOOK_URL);
console.log('📦 Sending test resume data...\n');

// Send request
const req = client.request(options, (res) => {
  console.log(`✅ Status Code: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n📥 Response:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
      console.log('\n✅ Test completed successfully!');
    } catch (e) {
      console.log(data);
      console.log('\n⚠️  Response is not JSON');
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Error:', e.message);
  console.log('\n💡 Make sure:');
  console.log('   1. Your n8n instance is running');
  console.log('   2. The workflow is activated');
  console.log('   3. The webhook URL is correct in .env');
});

req.write(postData);
req.end();
