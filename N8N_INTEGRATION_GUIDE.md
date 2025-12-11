# 🔗 n8n Integration Guide for HireAI

## Overview

This guide explains how to integrate HireAI with n8n for automated Job Description (JD) and Resume parsing using AI workflows.

## Architecture

```
HireAI (Next.js) ←→ n8n Workflows ←→ AI Services (OpenAI/Anthropic/Local LLM)
```

## Integration Approaches

### Option 1: Webhook-Based Integration (Recommended)

HireAI sends data to n8n via webhooks, n8n processes with AI, returns results.

### Option 2: API-Based Integration

HireAI calls n8n workflows via HTTP requests.

### Option 3: Database Polling

n8n monitors HireAI database for new entries and processes them.

---

## 🚀 Setup Guide

### Prerequisites

1. **n8n Installation**
   ```bash
   # Using Docker
   docker run -it --rm \
     --name n8n \
     -p 5678:5678 \
     -v ~/.n8n:/home/node/.n8n \
     n8nio/n8n
   
   # Or using npm
   npm install n8n -g
   n8n start
   ```

2. **Access n8n**: http://localhost:5678

3. **API Keys** (choose one or more):
   - OpenAI API Key (for GPT-4)
   - Anthropic API Key (for Claude)
   - Local LLM (Ollama, LM Studio)

---

## 📋 Workflow 1: Resume Parsing

### n8n Workflow Setup

1. **Create New Workflow** in n8n
2. **Add Webhook Node** (Trigger)
   - Method: POST
   - Path: `/webhook/parse-resume`
   - Response Mode: "When Last Node Finishes"

3. **Add HTTP Request Node** (Extract Text)
   - If resume is URL: Download file
   - If resume is base64: Decode

4. **Add Code Node** (Text Extraction)
   ```javascript
   // Extract text from PDF/DOCX
   const items = $input.all();
   const output = [];
   
   for (const item of items) {
     const fileContent = item.binary.data;
     const fileType = item.json.fileType;
     
     let text = '';
     
     if (fileType === 'pdf') {
       // Use pdf-parse library
       const pdfParse = require('pdf-parse');
       const data = await pdfParse(fileContent);
       text = data.text;
     } else if (fileType === 'docx') {
       // Use mammoth library
       const mammoth = require('mammoth');
       const result = await mammoth.extractRawText({buffer: fileContent});
       text = result.value;
     } else {
       text = fileContent.toString();
     }
     
     output.push({
       json: {
         text: text,
         fileName: item.json.fileName
       }
     });
   }
   
   return output;
   ```

5. **Add OpenAI Node** (Parse Resume)
   - Operation: Message a Model
   - Model: gpt-4o or gpt-4o-mini
   - Prompt:
   ```
   Extract the following information from this resume in JSON format:
   
   {
     "name": "Full name",
     "email": "Email address",
     "phone": "Phone number",
     "skills": ["skill1", "skill2", ...],
     "experience": "Years of experience or description",
     "education": "Highest education level",
     "summary": "Brief professional summary"
   }
   
   Resume text:
   {{ $json.text }}
   
   Return ONLY valid JSON, no additional text.
   ```

6. **Add Code Node** (Format Response)
   ```javascript
   const items = $input.all();
   const output = [];
   
   for (const item of items) {
     try {
       const aiResponse = item.json.message.content;
       const parsed = JSON.parse(aiResponse);
       
       output.push({
         json: {
           success: true,
           data: parsed
         }
       });
     } catch (error) {
       output.push({
         json: {
           success: false,
           error: error.message
         }
       });
     }
   }
   
   return output;
   ```

7. **Add Respond to Webhook Node**
   - Response Body: `{{ $json }}`

### HireAI Integration

Update `app/api/resumes/upload/route.ts`:

```typescript
// Add this function
async function parseResumeWithN8n(text: string, fileName: string) {
  try {
    const response = await fetch('http://localhost:5678/webhook/parse-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        fileName: fileName,
        fileType: fileName.endsWith('.pdf') ? 'pdf' : 
                  fileName.endsWith('.docx') ? 'docx' : 'txt'
      }),
    });

    if (!response.ok) {
      throw new Error('n8n parsing failed');
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('n8n parsing error:', error);
    // Fallback to existing parsing logic
    return null;
  }
}

// In the upload handler, replace the parsing logic:
const parsedData = await parseResumeWithN8n(text, file.name);

if (parsedData) {
  // Use n8n parsed data
  profile = {
    name: parsedData.name || 'Unknown',
    email: parsedData.email || '',
    phone: parsedData.phone || '',
    skills: parsedData.skills || [],
    experience: parsedData.experience || '',
    education: parsedData.education || '',
  };
} else {
  // Fallback to existing logic
  // ... existing parsing code
}
```

---

## 📋 Workflow 2: Job Description Parsing

### n8n Workflow Setup

1. **Create New Workflow** in n8n
2. **Add Webhook Node** (Trigger)
   - Method: POST
   - Path: `/webhook/parse-jd`

3. **Add OpenAI Node** (Parse JD)
   - Model: gpt-4o
   - Prompt:
   ```
   Extract structured information from this job description:
   
   {
     "requiredSkills": ["skill1", "skill2", ...],
     "niceToHaveSkills": ["skill1", "skill2", ...],
     "experienceLevel": "Entry-Level|Mid-Level|Senior|Lead",
     "educationLevel": "Bachelor's|Master's|PhD|Any",
     "responsibilities": ["resp1", "resp2", ...],
     "qualifications": ["qual1", "qual2", ...],
     "summary": "Brief role summary"
   }
   
   Job Description:
   {{ $json.description }}
   
   Return ONLY valid JSON.
   ```

4. **Add Code Node** (Format Response)
5. **Add Respond to Webhook Node**

### HireAI Integration

Update `app/api/roles/route.ts`:

```typescript
async function parseJDWithN8n(description: string) {
  try {
    const response = await fetch('http://localhost:5678/webhook/parse-jd', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: description,
      }),
    });

    if (!response.ok) {
      throw new Error('n8n JD parsing failed');
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
  } catch (error) {
    console.error('n8n JD parsing error:', error);
    return null;
  }
}

// In the POST handler:
const parsedJD = await parseJDWithN8n(description);

const evaluationCriteria = parsedJD ? {
  requiredSkills: parsedJD.requiredSkills,
  niceToHaveSkills: parsedJD.niceToHaveSkills,
  experienceLevel: parsedJD.experienceLevel,
  educationLevel: parsedJD.educationLevel,
  responsibilities: parsedJD.responsibilities,
  qualifications: parsedJD.qualifications,
} : {
  requiredSkills: requiredSkills,
  experienceLevel: experienceLevel,
  educationLevel: educationLevel,
};
```

---

## 📋 Workflow 3: Candidate Scoring & Evaluation

### n8n Workflow Setup

1. **Create New Workflow**
2. **Add Webhook Node**
   - Path: `/webhook/evaluate-candidate`

3. **Add OpenAI Node** (Evaluate Match)
   - Prompt:
   ```
   Evaluate this candidate against the job requirements:
   
   JOB REQUIREMENTS:
   {{ $json.jobRequirements }}
   
   CANDIDATE PROFILE:
   {{ $json.candidateProfile }}
   
   Provide evaluation in JSON format:
   {
     "score": 0-100,
     "confidence": 0-100,
     "matchedSkills": ["skill1", "skill2"],
     "missingSkills": ["skill1", "skill2"],
     "strengths": ["strength1", "strength2"],
     "gaps": ["gap1", "gap2"],
     "reasoning": "Detailed explanation of the score",
     "recommendation": "Shortlisted|Review|Rejected"
   }
   
   Return ONLY valid JSON.
   ```

4. **Add Respond to Webhook Node**

### HireAI Integration

Update `app/api/resumes/upload/route.ts`:

```typescript
async function evaluateCandidateWithN8n(candidateProfile: any, jobRequirements: any) {
  try {
    const response = await fetch('http://localhost:5678/webhook/evaluate-candidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        candidateProfile: candidateProfile,
        jobRequirements: jobRequirements,
      }),
    });

    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('n8n evaluation error:', error);
    return null;
  }
}

// Use in evaluation:
const aiEvaluation = await evaluateCandidateWithN8n(profile, role.evaluationCriteria);

if (aiEvaluation) {
  evaluation = {
    score: aiEvaluation.score,
    confidence: aiEvaluation.confidence,
    matchedSkills: aiEvaluation.matchedSkills,
    reasoning: aiEvaluation.reasoning,
  };
  
  status = aiEvaluation.recommendation;
}
```

---

## 🔧 Environment Configuration

Add to `.env`:

```env
# n8n Configuration
N8N_WEBHOOK_URL=http://localhost:5678/webhook
N8N_API_KEY=your_n8n_api_key_if_needed

# AI Provider (choose one)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 📊 Advanced Features

### 1. Batch Processing

n8n workflow with batch processing:
- Add **Split In Batches** node
- Process 10 resumes at a time
- Prevents API rate limits

### 2. Error Handling

Add **Error Trigger** node:
- Catches failed workflows
- Logs errors to database
- Sends notifications

### 3. Caching

Add **Redis** node:
- Cache parsed resumes
- Avoid re-parsing same files
- Faster processing

### 4. Monitoring

Add **Webhook** node to send metrics:
- Processing time
- Success/failure rates
- API usage

---

## 🎯 Complete Integration Example

Create `lib/n8n.ts`:

```typescript
const N8N_BASE_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook';

export async function parseResume(text: string, fileName: string) {
  const response = await fetch(`${N8N_BASE_URL}/parse-resume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, fileName }),
  });
  
  const result = await response.json();
  return result.success ? result.data : null;
}

export async function parseJobDescription(description: string) {
  const response = await fetch(`${N8N_BASE_URL}/parse-jd`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description }),
  });
  
  const result = await response.json();
  return result.success ? result.data : null;
}

export async function evaluateCandidate(profile: any, requirements: any) {
  const response = await fetch(`${N8N_BASE_URL}/evaluate-candidate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidateProfile: profile, jobRequirements: requirements }),
  });
  
  const result = await response.json();
  return result.success ? result.data : null;
}
```

Then use in your API routes:

```typescript
import { parseResume, parseJobDescription, evaluateCandidate } from '@/lib/n8n';

// In resume upload
const parsed = await parseResume(text, file.name);

// In role creation
const parsedJD = await parseJobDescription(description);

// In evaluation
const evaluation = await evaluateCandidate(profile, requirements);
```

---

## 🔒 Security Best Practices

1. **Use API Keys**: Secure n8n webhooks with authentication
2. **Rate Limiting**: Implement rate limits on webhooks
3. **Input Validation**: Validate all data before sending to n8n
4. **HTTPS**: Use HTTPS in production
5. **Environment Variables**: Never hardcode URLs or keys

---

## 🚀 Deployment

### n8n Cloud
- Sign up at https://n8n.io
- Deploy workflows
- Use production webhook URLs

### Self-Hosted
```bash
# Docker Compose
version: '3'
services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your_password
    volumes:
      - ~/.n8n:/home/node/.n8n
```

---

## 📈 Performance Tips

1. **Async Processing**: Use background jobs for large batches
2. **Caching**: Cache AI responses for similar inputs
3. **Parallel Processing**: Process multiple resumes simultaneously
4. **Fallback Logic**: Always have fallback to local parsing
5. **Monitoring**: Track API usage and costs

---

## 🎉 Next Steps

1. Set up n8n locally
2. Create the 3 workflows (Resume, JD, Evaluation)
3. Test with sample data
4. Integrate with HireAI
5. Monitor and optimize
6. Deploy to production

---

## 📚 Resources

- n8n Documentation: https://docs.n8n.io
- OpenAI API: https://platform.openai.com/docs
- Anthropic API: https://docs.anthropic.com
- n8n Community: https://community.n8n.io

---

**Ready to integrate? Start with Workflow 1 (Resume Parsing) and test it before moving to the others!** 🚀
