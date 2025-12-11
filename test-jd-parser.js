/**
 * Test script for n8n JD Parser Workflow
 * Run with: node test-jd-parser.js
 */

const http = require('http');

const testJD = {
  title: 'Senior Full Stack Developer',
  department: 'Engineering',
  description: `
We are seeking a Senior Full Stack Developer to join our growing engineering team.

REQUIRED SKILLS:
- 5+ years of professional software development experience
- Strong proficiency in React, Node.js, and TypeScript
- Experience with PostgreSQL and MongoDB
- AWS cloud services (EC2, S3, Lambda)
- Docker and containerization
- RESTful API design and development

NICE TO HAVE:
- Python programming
- Kubernetes orchestration
- GraphQL
- CI/CD pipeline experience
- Microservices architecture

RESPONSIBILITIES:
- Lead development of scalable web applications
- Architect and implement microservices
- Mentor junior developers
- Code review and quality assurance
- Collaborate with product and design teams
- Participate in technical planning and sprint planning

QUALIFICATIONS:
- Bachelor's degree in Computer Science or related field
- 5+ years of full-stack development experience
- Strong problem-solving and analytical skills
- Excellent communication skills
- Experience with Agile/Scrum methodologies

BENEFITS:
- Competitive salary ($120k - $160k)
- Remote work flexibility
- Health, dental, and vision insurance
- 401(k) matching
- Professional development budget
- Flexible PTO

WORK MODE: Hybrid (2 days in office, 3 days remote)
  `.trim()
};

const postData = JSON.stringify(testJD);

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

console.log('🚀 Testing n8n JD Parser...');
console.log('📍 URL: http://localhost:5678/webhook/parse-jd');
console.log('📦 Sending job description...\n');

const req = http.request(options, (res) => {
  console.log(`✅ Status Code: ${res.statusCode}\n`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📥 Parsed JD Data:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
      
      if (parsed.success && parsed.data) {
        console.log('\n✅ JD Parsing Successful!');
        console.log(`\n📊 Summary:`);
        console.log(`   Required Skills: ${parsed.data.requiredSkills?.length || 0}`);
        console.log(`   Nice-to-Have Skills: ${parsed.data.niceToHaveSkills?.length || 0}`);
        console.log(`   Experience Level: ${parsed.data.experienceLevel || 'N/A'}`);
        console.log(`   Responsibilities: ${parsed.data.responsibilities?.length || 0}`);
        console.log(`   Work Mode: ${parsed.data.workMode || 'N/A'}`);
      }
    } catch (e) {
      console.log(data);
      console.log('\n⚠️  Response is not JSON');
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Error:', e.message);
  console.log('\n💡 Make sure:');
  console.log('   1. n8n is running');
  console.log('   2. JD parser workflow is created and activated');
  console.log('   3. Webhook path is /webhook-test/parser-jd');
});

req.write(postData);
req.end();
