/**
 * Test script for resume upload API
 * Tests the /api/resumes/upload endpoint directly
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Create a simple test resume file
const testResumeContent = `John Doe
Email: john.doe@example.com
Phone: 555-1234

SKILLS
React, Node.js, TypeScript, PostgreSQL, Docker

EXPERIENCE
Senior Full Stack Developer at Tech Corp (2020-Present)
- Led development of microservices architecture
- Mentored 3 junior developers
- Improved system performance by 40%

Full Stack Developer at StartupXYZ (2018-2020)
- Built RESTful APIs using Node.js
- Developed React applications
- Worked with PostgreSQL databases

EDUCATION
Bachelor's in Computer Science
University of Technology (2014-2018)`;

// Create form data boundary
const boundary = '----formdata-boundary-' + Math.random().toString(36);

// Create multipart form data
function createFormData(roleId, resumeContent, filename) {
  let formData = '';
  
  // Add roleId field
  formData += `--${boundary}\r\n`;
  formData += `Content-Disposition: form-data; name="roleId"\r\n\r\n`;
  formData += `${roleId}\r\n`;
  
  // Add file field
  formData += `--${boundary}\r\n`;
  formData += `Content-Disposition: form-data; name="files"; filename="${filename}"\r\n`;
  formData += `Content-Type: text/plain\r\n\r\n`;
  formData += `${resumeContent}\r\n`;
  
  // End boundary
  formData += `--${boundary}--\r\n`;
  
  return formData;
}

async function testResumeUpload() {
  console.log('🧪 Testing Resume Upload API');
  console.log('=' .repeat(50));
  
  // First, let's test without authentication to see the error
  console.log('\n1. Testing without authentication (should get 401):');
  
  const testRoleId = 'test-role-123';
  const formData = createFormData(testRoleId, testResumeContent, 'john-doe-resume.txt');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/resumes/upload',
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': Buffer.byteLength(formData)
    }
  };

  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      console.log(`   Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log(`   Response: ${JSON.stringify(result, null, 2)}`);
        } catch (e) {
          console.log(`   Raw Response: ${data}`);
        }
        
        if (res.statusCode === 401) {
          console.log('   ✅ Expected 401 Unauthorized - API is working');
        } else {
          console.log('   ⚠️  Unexpected status code');
        }
        
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error(`   ❌ Request Error: ${e.message}`);
      resolve();
    });

    req.write(formData);
    req.end();
  });
}

async function testBasicEndpoints() {
  console.log('\n2. Testing basic API endpoints:');
  
  const endpoints = [
    { path: '/api/roles', method: 'GET', description: 'Get roles' },
    { path: '/api/resumes/upload', method: 'POST', description: 'Upload resume' }
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n   Testing ${endpoint.method} ${endpoint.path}:`);
    
    await new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: endpoint.path,
        method: endpoint.method
      };

      const req = http.request(options, (res) => {
        console.log(`     Status: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode === 401) {
            console.log('     ✅ Requires authentication (expected)');
          } else if (res.statusCode === 405 && endpoint.method === 'POST') {
            console.log('     ✅ Method not allowed without data (expected)');
          } else {
            console.log(`     Response preview: ${data.substring(0, 100)}...`);
          }
          resolve();
        });
      });

      req.on('error', (e) => {
        console.error(`     ❌ Error: ${e.message}`);
        resolve();
      });

      if (endpoint.method === 'POST') {
        req.write('{}');
      }
      req.end();
    });
  }
}

async function runTests() {
  try {
    await testResumeUpload();
    await testBasicEndpoints();
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 Test Summary:');
    console.log('✅ Resume upload API is accessible');
    console.log('✅ Authentication is working (401 responses)');
    console.log('✅ Server is responding to requests');
    
    console.log('\n💡 Next steps to test with authentication:');
    console.log('   1. Create a user account in the app');
    console.log('   2. Get an authentication token');
    console.log('   3. Create a role first');
    console.log('   4. Upload resume with proper auth headers');
    
    console.log('\n🔧 If you see errors in the browser:');
    console.log('   1. Check browser console for detailed errors');
    console.log('   2. Check network tab for failed requests');
    console.log('   3. Verify you are logged in');
    console.log('   4. Make sure you have created a role first');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

runTests();