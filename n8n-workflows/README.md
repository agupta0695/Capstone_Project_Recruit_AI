# n8n Workflows for HireAI

This folder contains n8n workflow templates for HireAI integration.

## Quick Setup

### 1. Install n8n

```bash
# Using npm
npm install n8n -g

# Or using Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### 2. Start n8n

```bash
n8n start
```

Access at: http://localhost:5678

### 3. Import Workflows

1. Open n8n at http://localhost:5678
2. Click "Workflows" → "Import from File"
3. Import each JSON file from this folder:
   - `resume-parser.json`
   - `jd-parser.json`
   - `candidate-evaluator.json`

### 4. Configure API Keys

For each workflow:
1. Open the workflow
2. Click on the OpenAI node (or your AI provider)
3. Add your API key in the credentials
4. Save the workflow

### 5. Activate Workflows

Click the "Active" toggle for each workflow.

## Workflows

### 1. Resume Parser (`resume-parser.json`)
- **Webhook URL**: `http://localhost:5678/webhook/parse-resume`
- **Purpose**: Extract structured data from resume text
- **Input**: `{ text: string, fileName: string }`
- **Output**: `{ name, email, phone, skills, experience, education }`

### 2. JD Parser (`jd-parser.json`)
- **Webhook URL**: `http://localhost:5678/webhook/parse-jd`
- **Purpose**: Extract requirements from job descriptions
- **Input**: `{ description: string }`
- **Output**: `{ requiredSkills, experienceLevel, educationLevel, ... }`

### 3. Candidate Evaluator (`candidate-evaluator.json`)
- **Webhook URL**: `http://localhost:5678/webhook/evaluate-candidate`
- **Purpose**: Score and evaluate candidates
- **Input**: `{ candidateProfile: object, jobRequirements: object }`
- **Output**: `{ score, confidence, reasoning, recommendation }`

## Testing

### Test Resume Parser

```bash
curl -X POST http://localhost:5678/webhook/parse-resume \
  -H "Content-Type: application/json" \
  -d '{
    "text": "John Doe\njohn@example.com\n+1234567890\nSkills: React, Node.js, TypeScript\nExperience: 5 years as Full Stack Developer",
    "fileName": "john-doe-resume.pdf"
  }'
```

### Test JD Parser

```bash
curl -X POST http://localhost:5678/webhook/parse-jd \
  -H "Content-Type: application/json" \
  -d '{
    "description": "We are looking for a Senior Frontend Developer with 5+ years experience in React, TypeScript, and Node.js. Bachelor degree required."
  }'
```

### Test Candidate Evaluator

```bash
curl -X POST http://localhost:5678/webhook/evaluate-candidate \
  -H "Content-Type: application/json" \
  -d '{
    "candidateProfile": {
      "name": "John Doe",
      "skills": ["React", "TypeScript", "Node.js"],
      "experience": "5 years"
    },
    "jobRequirements": {
      "requiredSkills": ["React", "TypeScript", "Node.js"],
      "experienceLevel": "Senior"
    }
  }'
```

## AI Provider Options

### OpenAI (Recommended)
- Model: `gpt-4o` or `gpt-4o-mini`
- Cost: ~$0.01 per resume
- Speed: 2-5 seconds

### Anthropic Claude
- Model: `claude-3-5-sonnet-20241022`
- Cost: ~$0.015 per resume
- Speed: 2-4 seconds

### Local LLM (Free)
- Use Ollama with `llama3.1` or `mistral`
- Cost: Free
- Speed: 5-15 seconds (depends on hardware)

## Environment Variables

Add to HireAI `.env`:

```env
N8N_WEBHOOK_URL=http://localhost:5678/webhook
```

For production:
```env
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook
```

## Troubleshooting

### Workflow not responding
- Check if n8n is running: http://localhost:5678
- Check if workflow is activated (toggle should be ON)
- Check webhook URL in browser

### API errors
- Verify API keys are configured
- Check API rate limits
- Review n8n execution logs

### Timeout errors
- Increase timeout in `lib/n8n.ts`
- Use faster AI models (gpt-4o-mini)
- Process in smaller batches

## Production Deployment

### n8n Cloud (Easiest)
1. Sign up at https://n8n.io
2. Import workflows
3. Update webhook URLs in HireAI

### Self-Hosted (Docker)
```yaml
# docker-compose.yml
version: '3'
services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=change_this_password
      - N8N_HOST=your-domain.com
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://your-domain.com/
    volumes:
      - ~/.n8n:/home/node/.n8n
```

## Support

- n8n Docs: https://docs.n8n.io
- HireAI Integration Guide: `../N8N_INTEGRATION_GUIDE.md`
- Community: https://community.n8n.io
