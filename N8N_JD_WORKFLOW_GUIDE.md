# n8n Job Description Parser Workflow

## Overview
This workflow parses job descriptions and extracts structured information like required skills, experience level, responsibilities, and qualifications.

---

## Workflow Setup

### Node 1: Webhook (Trigger)

**Configuration:**
- **HTTP Method**: `POST`
- **Path**: `parse-jd`
- **Response Mode**: `When Last Node Finishes`
- **Authentication**: None

**Expected Input:**
```json
{
  "description": "Full job description text here...",
  "title": "Job title",
  "department": "Department name"
}
```

---

### Node 2: AI Agent

**Configuration:**

**Source for Prompt**: `Define below`

**Prompt (User Message):**
```
You are an expert HR analyst. Extract structured information from the following job description:

Job Title: {{ $json.body.title }}
Department: {{ $json.body.department }}

Job Description:
{{ $json.body.description }}

Extract and return ONLY a JSON object with this exact structure:
{
  "requiredSkills": ["skill1", "skill2", "skill3"],
  "niceToHaveSkills": ["skill1", "skill2"],
  "experienceLevel": "Entry-Level | Mid-Level | Senior | Lead",
  "educationLevel": "High School | Bachelor's | Master's | PhD",
  "responsibilities": ["responsibility1", "responsibility2"],
  "qualifications": ["qualification1", "qualification2"],
  "summary": "Brief summary of the role",
  "keyRequirements": ["requirement1", "requirement2"],
  "benefits": ["benefit1", "benefit2"],
  "workMode": "Remote | Hybrid | On-site",
  "salaryRange": "Salary range if mentioned"
}

Important: 
- Extract ALL skills mentioned in the description
- Separate must-have skills from nice-to-have skills
- Be thorough with responsibilities and qualifications
- Return ONLY the JSON object, no markdown, no explanations
```

**Options:**
- **Chat Model**: OpenAI GPT-4-turbo
  - **Temperature**: 0.3
  - **Max Tokens**: 3000
- **Output Parser**: Structured Output Parser
  - **Schema Type**: JSON Schema
  - **JSON Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "requiredSkills": {
        "type": "array",
        "items": {"type": "string"}
      },
      "niceToHaveSkills": {
        "type": "array",
        "items": {"type": "string"}
      },
      "experienceLevel": {"type": "string"},
      "educationLevel": {"type": "string"},
      "responsibilities": {
        "type": "array",
        "items": {"type": "string"}
      },
      "qualifications": {
        "type": "array",
        "items": {"type": "string"}
      },
      "summary": {"type": "string"},
      "keyRequirements": {
        "type": "array",
        "items": {"type": "string"}
      },
      "benefits": {
        "type": "array",
        "items": {"type": "string"}
      },
      "workMode": {"type": "string"},
      "salaryRange": {"type": "string"}
    },
    "required": ["requiredSkills", "experienceLevel", "summary"]
  }
  ```

---

### Node 3: HTTP Request (Optional - Callback)

**Configuration:**
- **URL**: `http://host.docker.internal:3000/api/roles/jd-callback`
- **Method**: `POST`
- **Send Body**: ON
- **Body Content Type**: JSON
- **Specify Body**: `Using Expression`
- **Expression**:
  ```javascript
  {{ { success: true, data: $json.output } }}
  ```

**Settings:**
- **On Error**: Stop Workflow
- **Always Output Data**: ON

---

## Testing the Workflow

### Test Data

```json
{
  "title": "Senior Full Stack Developer",
  "department": "Engineering",
  "description": "We are looking for a Senior Full Stack Developer with 5+ years of experience. Must have strong skills in React, Node.js, and TypeScript. Experience with AWS and Docker is required. Nice to have: Python, Kubernetes. Responsibilities include leading development of microservices, mentoring junior developers, and architecting scalable solutions. Bachelor's degree in Computer Science required. We offer competitive salary, remote work, and health benefits."
}
```

### Test Command

```bash
curl -X POST http://localhost:5678/webhook/parse-jd \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Full Stack Developer",
    "department": "Engineering",
    "description": "We are looking for a Senior Full Stack Developer with 5+ years of experience..."
  }'
```

### Expected Output

```json
{
  "success": true,
  "data": {
    "requiredSkills": ["React", "Node.js", "TypeScript", "AWS", "Docker"],
    "niceToHaveSkills": ["Python", "Kubernetes"],
    "experienceLevel": "Senior",
    "educationLevel": "Bachelor's",
    "responsibilities": [
      "Leading development of microservices",
      "Mentoring junior developers",
      "Architecting scalable solutions"
    ],
    "qualifications": [
      "5+ years of experience",
      "Bachelor's degree in Computer Science"
    ],
    "summary": "Senior Full Stack Developer role focusing on microservices architecture and team leadership",
    "keyRequirements": [
      "5+ years experience",
      "React, Node.js, TypeScript",
      "AWS and Docker experience"
    ],
    "benefits": ["Competitive salary", "Remote work", "Health benefits"],
    "workMode": "Remote",
    "salaryRange": "Not specified"
  }
}
```

---

## Integration with Next.js

### 1. Create JD Callback Endpoint

File: `app/api/roles/jd-callback/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📥 JD parsing callback:', body);

    const { roleId, data } = body;

    if (roleId && data) {
      // Update role with parsed JD data
      await prisma.role.update({
        where: { id: roleId },
        data: {
          evaluationCriteria: {
            requiredSkills: data.requiredSkills,
            niceToHaveSkills: data.niceToHaveSkills,
            experienceLevel: data.experienceLevel,
            educationLevel: data.educationLevel,
            responsibilities: data.responsibilities,
            qualifications: data.qualifications,
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: 'JD parsed and role updated',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'JD parsed successfully',
      data,
    });
  } catch (error) {
    console.error('❌ JD callback error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process JD' },
      { status: 500 }
    );
  }
}
```

### 2. Update lib/n8n.ts

The `parseJobDescription` function is already implemented in `lib/n8n.ts`.

### 3. Use in Role Creation

When creating a role, call n8n to parse the JD:

```typescript
const parsedJD = await parseJobDescription(jobDescription);

if (parsedJD) {
  // Use parsed data
  evaluationCriteria = {
    requiredSkills: parsedJD.requiredSkills,
    niceToHaveSkills: parsedJD.niceToHaveSkills,
    experienceLevel: parsedJD.experienceLevel,
    // ... etc
  };
}
```

---

## Workflow Activation

1. **Save the workflow** in n8n
2. **Activate** the workflow (toggle ON)
3. **Copy the Production Webhook URL**
4. **Update `.env`**:
   ```bash
   N8N_JD_WEBHOOK_URL="http://localhost:5678/webhook/parse-jd"
   ```

---

## Testing Checklist

- [ ] Webhook receives JD data correctly
- [ ] AI Agent extracts all required fields
- [ ] Required skills are comprehensive
- [ ] Nice-to-have skills are separated
- [ ] Experience level is correctly identified
- [ ] Responsibilities are extracted
- [ ] Output is valid JSON
- [ ] Callback endpoint receives data (if configured)

---

## Benefits of JD Parsing

1. **Consistent Structure**: All JDs parsed into same format
2. **Better Matching**: Extracted skills used for candidate scoring
3. **Time Saving**: Automatic extraction vs manual entry
4. **Accuracy**: AI identifies skills humans might miss
5. **Scalability**: Parse hundreds of JDs quickly

---

## Next Steps

1. Create the workflow in n8n
2. Test with sample JD
3. Create callback endpoint
4. Integrate with role creation form
5. Test end-to-end flow

---

## Cost Estimation

**Per JD Parsing:**
- GPT-4-turbo: ~$0.01 - $0.02
- GPT-3.5-turbo: ~$0.001 - $0.002

**Monthly (50 JDs):**
- GPT-4-turbo: ~$0.50 - $1.00
- GPT-3.5-turbo: ~$0.05 - $0.10

Very affordable for comprehensive JD parsing!
