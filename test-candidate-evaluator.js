/**
 * Test script for n8n Candidate Evaluator Workflow
 * Run with: node test-candidate-evaluator.js
 */

const http = require('http');

const testData = {
  candidateProfile: {
    name: 'John Doe',
    email: 'john@example.com',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'MongoDB'],
    experience: '5 years',
    education: "Bachelor's in Computer Science",
    workHistory: [
      {
        title: 'Senior Full Stack Developer',
        company: 'Tech Corp',
        duration: '2020-Present',
        responsibilities: [
          'Led development of microservices architecture',
          'Mentored 3 junior developers',
          'Improved system performance by 40%',
          'Implemented CI/CD pipelines'
        ]
      },
      {
        title: 'Full Stack Developer',
        company: 'StartupXYZ',
        duration: '2018-2020',
        responsibilities: [
          'Built RESTful APIs using Node.js',
          'Developed React applications',
          'Worked with PostgreSQL databases'
        ]
      }
    ],
    summary: 'Experienced full-stack developer with strong leadership skills and proven track record of delivering scalable solutions'
  },
  jobRequirements: {
    title: 'Senior Full Stack Developer',
    requiredSkills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker'],
    niceToHaveSkills: ['Python', 'Kubernetes', 'GraphQL'],
    experienceLevel: 'Senior',
    educationLevel: "Bachelor's",
    responsibilities: [
      'Lead development of scalable web applications',
      'Mentor junior developers',
      'Architect microservices solutions',
      'Collaborate with product and design teams'
    ],
    qualifications: [
      '5+ years of full-stack development experience',
      "Bachelor's degree in Computer Science",
      'Strong problem-solving skills',
      'Experience with Agile methodologies'
    ]
  }
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 5678,
  path: '/webhook/evaluate-candidate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🚀 Testing Candidate Evaluator Workflow...');
console.log('📍 URL: http://localhost:5678/webhook/evaluate-candidate');
console.log('📦 Evaluating candidate against job requirements...\n');

const req = http.request(options, (res) => {
  console.log(`✅ Status Code: ${res.statusCode}\n`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📊 Evaluation Result:\n');
    console.log('Raw response length:', data.length);
    console.log('Raw response:', data);
    try {
      const result = JSON.parse(data);
      console.log(JSON.stringify(result, null, 2));
      
      if (result.success && result.evaluation) {
        const eval = result.evaluation;
        console.log('\n' + '='.repeat(60));
        console.log('✅ EVALUATION SUMMARY');
        console.log('='.repeat(60));
        console.log(`\n📈 Scores:`);
        console.log(`   Overall Score: ${eval.overallScore}/100`);
        console.log(`   Confidence: ${eval.confidence}%`);
        console.log(`   Technical Fit: ${eval.technicalFit?.score || 'N/A'}/100`);
        console.log(`   Experience Fit: ${eval.experienceFit?.score || 'N/A'}/100`);
        console.log(`   Culture Fit: ${eval.cultureFit?.score || 'N/A'}/100`);
        
        console.log(`\n🎯 Recommendation: ${eval.recommendation}`);
        
        console.log(`\n✅ Matched Skills (${eval.matchedSkills?.length || 0}):`);
        eval.matchedSkills?.forEach(skill => console.log(`   - ${skill}`));
        
        console.log(`\n❌ Missing Skills (${eval.missingSkills?.length || 0}):`);
        eval.missingSkills?.forEach(skill => console.log(`   - ${skill}`));
        
        console.log(`\n💪 Strengths (${eval.strengths?.length || 0}):`);
        eval.strengths?.forEach(strength => console.log(`   - ${strength}`));
        
        console.log(`\n⚠️  Concerns (${eval.concerns?.length || 0}):`);
        eval.concerns?.forEach(concern => console.log(`   - ${concern}`));
        
        if (eval.interviewRecommendations) {
          console.log(`\n🎤 Interview Focus Areas:`);
          eval.interviewRecommendations.focus?.forEach(area => console.log(`   - ${area}`));
          
          console.log(`\n❓ Suggested Interview Questions:`);
          eval.interviewRecommendations.questions?.forEach((q, i) => console.log(`   ${i + 1}. ${q}`));
        }
        
        console.log(`\n📋 Next Steps:`);
        console.log(`   ${eval.nextSteps}`);
        
        if (eval.salaryExpectation) {
          console.log(`\n💰 Salary Expectation:`);
          console.log(`   ${eval.salaryExpectation}`);
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ Evaluation Complete!');
        console.log('='.repeat(60));
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
  console.log('   2. Candidate evaluator workflow is created and activated');
  console.log('   3. Webhook path is /webhook-test/evaluate-candidate');
});

req.write(postData);
req.end();
