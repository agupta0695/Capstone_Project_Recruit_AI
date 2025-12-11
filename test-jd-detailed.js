/**
 * Detailed test for JD parser to show the expression issue
 */

const http = require('http');

const testData = {
  description: `Senior Full Stack Developer

We are seeking a Senior Full Stack Developer with 5+ years of experience to join our growing team.

Required Skills:
- React.js and modern JavaScript (ES6+)
- Node.js and Express.js
- TypeScript
- PostgreSQL or MySQL
- AWS services (EC2, S3, RDS)
- Docker and containerization
- Git version control

Nice to Have:
- Python or Java experience
- Kubernetes
- GraphQL
- Redis
- Microservices architecture

Requirements:
- Bachelor's degree in Computer Science or related field
- 5+ years of full-stack development experience
- Strong problem-solving and communication skills
- Experience with Agile/Scrum methodologies
- Ability to work in a fast-paced startup environment

Responsibilities:
- Design and develop scalable web applications
- Lead technical architecture decisions
- Mentor junior developers
- Collaborate with product and design teams
- Participate in code reviews and technical discussions

Benefits:
- Competitive salary: $120,000 - $150,000
- Health, dental, and vision insurance
- 401(k) with company matching
- Flexible work arrangements (remote/hybrid)
- Professional development budget`
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 5678,
  path: '/webhook/parse-jd',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🚀 Testing JD Parser (Detailed)...');
console.log('📍 URL: http://localhost:5678/webhook/parse-jd');
console.log('📦 Sending comprehensive job description...\n');

const req = http.request(options, (res) => {
  console.log(`✅ Status Code: ${res.statusCode}\n`);
  
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
      
      if (result.data && typeof result.data === 'object') {
        console.log('\n✅ SUCCESS: Got structured JD data');
        const parsed = result.data;
        console.log(`Required Skills: ${parsed.requiredSkills?.join(', ')}`);
        console.log(`Experience Level: ${parsed.experienceLevel}`);
        console.log(`Education Level: ${parsed.educationLevel}`);
        console.log(`Salary Range: ${parsed.salaryRange}`);
      } else if (result.data === '{{ $json.output }}') {
        console.log('\n⚠️  EXPRESSION ISSUE: Getting literal string instead of parsed data');
        console.log('🔧 FIX NEEDED in n8n:');
        console.log('   1. Go to http://localhost:5678');
        console.log('   2. Open JD Parser workflow');
        console.log('   3. Click "Respond to Webhook" node');
        console.log('   4. Fix the Response Body expression');
      } else {
        console.log('\n⚠️  Unexpected response format');
        console.log('Expected structured JD data, got:', typeof result.data);
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