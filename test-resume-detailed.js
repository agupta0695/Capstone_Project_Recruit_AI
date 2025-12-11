/**
 * Detailed test for resume parser to debug the response
 */

const http = require('http');

const testData = {
  text: `John Doe
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
University of Technology (2014-2018)`,
  fileName: 'john-doe-resume.pdf'
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 5678,
  path: '/webhook/parse-resume',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🚀 Testing Resume Parser (Detailed)...');
console.log('📍 URL: http://localhost:5678/webhook/parse-resume');
console.log('📦 Sending detailed resume...\n');

const req = http.request(options, (res) => {
  console.log(`✅ Status Code: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);
  console.log('');
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📊 Raw Response:');
    console.log('Length:', data.length);
    console.log('Content:', data);
    console.log('');
    
    try {
      const result = JSON.parse(data);
      console.log('📋 Parsed JSON:');
      console.log(JSON.stringify(result, null, 2));
      
      // Check if we got actual parsed data
      if (result.output && typeof result.output === 'object') {
        console.log('\n✅ SUCCESS: Got structured data');
        const parsed = result.output;
        console.log(`Name: ${parsed.name}`);
        console.log(`Email: ${parsed.email}`);
        console.log(`Skills: ${parsed.skills?.join(', ')}`);
        console.log(`Experience: ${parsed.experience}`);
      } else if (result.data && typeof result.data === 'object') {
        console.log('\n✅ SUCCESS: Got structured data in .data');
        const parsed = result.data;
        console.log(`Name: ${parsed.name}`);
        console.log(`Email: ${parsed.email}`);
        console.log(`Skills: ${parsed.skills?.join(', ')}`);
        console.log(`Experience: ${parsed.experience}`);
      } else {
        console.log('\n⚠️  Response format issue - not getting structured data');
        console.log('Expected: { output: { name, email, skills, ... } }');
        console.log('Got:', typeof result);
      }
    } catch (e) {
      console.log('\n❌ Response is not valid JSON');
      console.log('Error:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Error:', e.message);
});

req.write(postData);
req.end();