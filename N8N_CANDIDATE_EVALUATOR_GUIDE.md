# n8n Candidate Evaluator Workflow

## Overview
This workflow performs comprehensive evaluation of candidates against job requirements, providing detailed analysis, match scores, and interview recommendations.

---

## Workflow Setup

### Node 1: Webhook (Trigger)

**Configuration:**
- **HTTP Method**: `POST`
- **Path**: `evaluate-candidate`
- **Response Mode**: `When Last Node Finishes`
- **Authentication**: None

**Expected Input:**
```json
{
  "candidateProfile": {
    "name": "John Doe",
    "email": "john@example.com",
    "skills": ["React", "Node.js", "TypeScript"],
    "experience": "5 years",
    "education": "Bachelor's in Computer Science",
    "workHistory": [
      {
        "title": "Senior Developer",
        "company": "Tech Corp",
        "duration": "2020-Present",
        "responsibilities": ["Led team", "Built features"]
      }
    ],
    "summary": "Experienced full-stack developer"
  },
  "jobRequirements": {
    "title": "Senior Full Stack Developer",
    "requiredSkills": ["React", "Node.js", "TypeScript", "AWS"],
    "niceToHaveSkills": ["Python", "Kubernetes"],
    "experienceLevel": "Senior",
    "educationLevel": "Bachelor's",
    "responsibilities": ["Lead development", "Mentor team"],
    "qualifications": ["5+ years experience", "Bachelor's degree"]
  }
}
```

---

### Node 2: AI Agent

**Configuration:**

**Source for Prompt**: `Define below`

**Prompt (User Message):**
```
You are an expert technical recruiter and hiring manager. Perform a comprehensive evaluation of this candidate against the job requirements.

CANDIDATE PROFILE:
Name: {{ $json.body.candidateProfile.name }}
Skills: {{ $json.body.candidateProfile.skills }}
Experience: {{ $json.body.candidateProfile.experience }}
Education: {{ $json.body.candidateProfile.education }}
Summary: {{ $json.body.candidateProfile.summary }}

JOB REQUIREMENTS:
Title: {{ $json.body.jobRequirements.title }}
Required Skills: {{ $json.body.jobRequirements.requiredSkills }}
Nice-to-Have Skills: {{ $json.body.jobRequirements.niceToHaveSkills }}
Experience Level: {{ $json.body.jobRequirements.experienceLevel }}
Education Level: {{ $json.body.jobRequirements.educationLevel }}
Responsibilities: {{ $json.body.jobRequirements.responsibilities }}

Provide a detailed evaluation in JSON format:
{
  "overallScore": 85,
  "confidence": 90,
  "recommendation": "Strongly Recommend | Recommend | Consider | Not Recommended",
  "matchedSkills": ["React", "Node.js", "TypeScript"],
  "missingSkills": ["AWS"],
  "strengths": [
    "Strong technical background in required technologies",
    "Relevant experience level",
    "Good educational background"
  ],
  "concerns": [
    "Missing AWS experience",
    "Limited cloud infrastructure knowledge"
  ],
  "cultureFit": {
    "score": 80,
    "reasoning": "Shows leadership and collaboration skills"
  },
  "technicalFit": {
    "score": 90,
    "reasoning": "Strong match on core technical requirements"
  },
  "experienceFit": {
    "score": 85,
    "reasoning": "Experience level aligns well with senior role"
  },
  "detailedAnalysis": {
    "technicalSkills": "Candidate demonstrates strong proficiency in React, Node.js, and TypeScript...",
    "experience": "5 years of experience aligns well with senior role requirements...",
    "education": "Bachelor's degree meets the educational requirements...",
    "workHistory": "Previous roles show progressive responsibility and relevant experience..."
  },
  "interviewRecommendations": {
    "focus": ["AWS experience", "Cloud architecture", "Team leadership"],
    "questions": [
      "Can you describe your experience with cloud platforms?",
      "How have you mentored junior developers?",
      "Tell us about a complex system you've architected"
    ]
  },
  "nextSteps": "Schedule technical interview focusing on system design and cloud architecture",
  "salaryExpectation": "Based on experience and skills, candidate likely expects $120k-$150k range"
}

IMPORTANT:
- Be thorough and objective
- Consider both technical and soft skills
- Provide actionable insights
- Be honest about gaps
- Return ONLY valid JSON, no markdown, no explanations
```

**Options:**
- **Chat Model**: OpenAI GPT-4-turbo
  - **Temperature**: 0.4 (slightly higher for nuanced evaluation)
  - **Max Tokens**: 4000 (detailed analysis needs more tokens)
- **Output Parser**: Structured Output Parser
  - **Schema Type**: JSON Schema
  - **JSON Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "overallScore": {"type": "number", "minimum": 0, "maximum": 100},
      "confidence": {"type": "number", "minimum": 0, "maximum": 100},
      "recommendation": {"type": "string"},
      "matchedSkills": {"type": "array", "items": {"type": "string"}},
      "missingSkills": {"type": "array", "items": {"type": "string"}},
      "strengths": {"type": "array", "items": {"type": "string"}},
      "concerns": {"type": "array", "items": {"type": "string"}},
      "cultureFit": {
        "type": "object",
        "properties": {
          "score": {"type": "number"},
          "reasoning": {"type": "string"}
        }
      },
      "technicalFit": {
        "type": "object",
        "properties": {
          "score": {"type": "number"},
          "reasoning": {"type": "string"}
        }
      },
      "experienceFit": {
        "type": "object",
        "properties": {
          "score": {"type": "number"},
          "reasoning": {"type": "string"}
        }
      },
      "detailedAnalysis": {
        "type": "object",
        "properties": {
          "technicalSkills": {"type": "string"},
          "experience": {"type": "string"},
          "education": {"type": "string"},
          "workHistory": {"type": "string"}
        }
      },
      "interviewRecommendations": {
        "type": "object",
        "properties": {
          "focus": {"type": "array", "items": {"type": "string"}},
          "questions": {"type": "array", "items": {"type": "string"}}
        }
      },
      "nextSteps": {"type": "string"},
      "salaryExpectation": {"type": "string"}
    },
    "required": ["overallScore", "recommendation", "matchedSkills", "strengths"]
  }
  ```

---

### Node 3: Respond to Webhook

**Configuration:**
- **Response Body**: `Using Expression`
- **Expression**:
  ```javascript
  {{ { success: true, evaluation: $json.output } }}
  ```

---

## Testing the Workflow

### Test Script

Create `test-candidate-evaluator.js`:

```javascript
const http = require('http');

const testData = {
  candidateProfile: {
    name: 'John Doe',
    email: 'john@example.com',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
    experience: '5 years',
    education: "Bachelor's in Computer Science",
    workHistory: [
      {
        title: 'Senior Full Stack Developer',
        company: 'Tech Corp',
        duration: '2020-Present',
        responsibilities: [
          'Led development of microservices',
          'Mentored 3 junior developers',
          'Improved system performance by 40%'
        ]
      },
      {
        title: 'Full Stack Developer',
        company: 'StartupXYZ',
        duration: '2018-2020',
        responsibilities: [
          'Built RESTful APIs',
          'Developed React applications'
        ]
      }
    ],
    summary: 'Experienced full-stack developer with strong leadership skills'
  },
  jobRequirements: {
    title: 'Senior Full Stack Developer',
    requiredSkills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker'],
    niceToHaveSkills: ['Python', 'Kubernetes', 'GraphQL'],
    experienceLevel: 'Senior',
    educationLevel: "Bachelor's",
    responsibilities: [
      'Lead development of scalable applications',
      'Mentor junior developers',
      'Architect microservices'
    ],
    qualifications: [
      '5+ years experience',
      "Bachelor's degree",
      'Strong problem-solving skills'
    ]
  }
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 5678,
  path: '/webhook-test/evaluate-candidate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🚀 Testing Candidate Evaluator...\n');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}\n`);
  
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('📊 Evaluation Result:\n');
      console.log(JSON.stringify(result, null, 2));
      
      if (result.success && result.evaluation) {
        const eval = result.evaluation;
        console.log('\n✅ Evaluation Summary:');
        console.log(`   Overall Score: ${eval.overallScore}/100`);
        console.log(`   Confidence: ${eval.confidence}%`);
        console.log(`   Recommendation: ${eval.recommendation}`);
        console.log(`   Matched Skills: ${eval.matchedSkills?.length || 0}`);
        console.log(`   Missing Skills: ${eval.missingSkills?.length || 0}`);
        console.log(`   Strengths: ${eval.strengths?.length || 0}`);
        console.log(`   Concerns: ${eval.concerns?.length || 0}`);
      }
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Error:', e.message);
});

req.write(postData);
req.end();
```

---

## Integration with Next.js

### Update lib/n8n.ts

The `evaluateCandidate` function is already implemented. Just update the webhook URL:

```typescript
const N8N_EVALUATOR_WEBHOOK_URL = process.env.N8N_EVALUATOR_WEBHOOK_URL || 'http://localhost:5678/webhook-test/evaluate-candidate';
```

### Update .env

```bash
N8N_EVALUATOR_WEBHOOK_URL="http://localhost:5678/webhook-test/evaluate-candidate"
```

### Use in Candidate Detail Page

```typescript
import { evaluateCandidate } from '@/lib/n8n';

// When viewing candidate details
const evaluation = await evaluateCandidate(
  candidateProfile,
  jobRequirements
);

if (evaluation) {
  // Display comprehensive evaluation
  // Show scores, strengths, concerns
  // Display interview questions
  // Show next steps
}
```

---

## Benefits

1. **Comprehensive Analysis**: Beyond simple skill matching
2. **Interview Preparation**: Suggested questions and focus areas
3. **Objective Evaluation**: AI-powered unbiased assessment
4. **Time Saving**: Instant detailed evaluation vs manual review
5. **Consistency**: Same evaluation criteria for all candidates
6. **Actionable Insights**: Clear next steps and recommendations

---

## Use Cases

### 1. Initial Screening
- Quick evaluation of all applicants
- Identify top candidates for interview
- Filter out clearly unqualified candidates

### 2. Interview Preparation
- Review evaluation before interview
- Use suggested questions
- Focus on identified gaps

### 3. Hiring Decision
- Compare evaluations across candidates
- Review detailed analysis
- Make data-driven decisions

### 4. Feedback Generation
- Use evaluation for rejection emails
- Provide constructive feedback
- Maintain candidate experience

---

## Cost Estimation

**Per Evaluation**: ~$0.02 - $0.04 (GPT-4-turbo, more tokens)

**Monthly (100 evaluations)**:
- ~$2 - $4/month

Still very affordable for comprehensive AI evaluation!

---

## Workflow Activation

1. **Create workflow** in n8n
2. **Add all three nodes**
3. **Configure AI Agent** with the detailed prompt
4. **Save and activate**
5. **Test** with `node test-candidate-evaluator.js`

---

## Expected Output Example

```json
{
  "success": true,
  "evaluation": {
    "overallScore": 82,
    "confidence": 88,
    "recommendation": "Recommend",
    "matchedSkills": ["React", "Node.js", "TypeScript", "Docker"],
    "missingSkills": ["AWS"],
    "strengths": [
      "Strong technical skills in core technologies",
      "Relevant senior-level experience",
      "Demonstrated leadership through mentoring",
      "Progressive career growth"
    ],
    "concerns": [
      "Missing AWS cloud experience",
      "No mention of Kubernetes or container orchestration at scale"
    ],
    "cultureFit": {
      "score": 85,
      "reasoning": "Shows collaboration and mentoring abilities"
    },
    "technicalFit": {
      "score": 88,
      "reasoning": "Strong match on 4 out of 5 required skills"
    },
    "experienceFit": {
      "score": 90,
      "reasoning": "5 years experience aligns perfectly with senior role"
    },
    "detailedAnalysis": {
      "technicalSkills": "Candidate has strong proficiency in React, Node.js, and TypeScript...",
      "experience": "5 years of progressive experience with clear growth trajectory...",
      "education": "Bachelor's degree meets requirements...",
      "workHistory": "Demonstrates leadership and technical excellence..."
    },
    "interviewRecommendations": {
      "focus": ["AWS experience", "Cloud architecture", "System design"],
      "questions": [
        "Describe your experience with cloud platforms and services",
        "How would you architect a scalable microservices system?",
        "Tell us about your mentoring approach and successes"
      ]
    },
    "nextSteps": "Schedule technical interview focusing on system design and cloud architecture. Consider AWS training if hired.",
    "salaryExpectation": "$120k-$150k based on experience and market rates"
  }
}
```

---

## Next Steps

1. Create the workflow in n8n
2. Test with sample data
3. Integrate with candidate detail page
4. Use evaluations for hiring decisions
5. Track evaluation accuracy over time

This completes your AI-powered hiring system with comprehensive candidate evaluation! 🎉
