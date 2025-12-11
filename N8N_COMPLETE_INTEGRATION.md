# Complete n8n Integration Guide

## Current Status
✅ n8n workflow is accessible
✅ AI Agent is parsing resumes
✅ Next.js app is calling n8n
❌ HTTP Request node sending expression as string instead of data

## Fix Required in n8n

### HTTP Request Node Configuration

**The issue:** You're using "Using Fields Below" but the expression isn't being evaluated.

**Solution:** Use "Using Expression" instead

1. **In HTTP Request node:**
   - **Specify Body**: Change to **"Using Expression"**
   - **Expression field**: Enter this EXACT code:
   ```javascript
   {{ { success: true, data: $json.output } }}
   ```

2. **Alternative - Use JSON mode correctly:**
   - **Specify Body**: "Using JSON"
   - **JSON field**: 
   ```json
   {
     "success": true,
     "data": {{ $json.output }}
   }
   ```
   Note: No quotes around `{{ $json.output }}`

## Complete Workflow Configuration

### Node 1: Webhook
```
Method: POST
Path: parse-resume
Response Mode: When Last Node Finishes
```

### Node 2: AI Agent
```
Source for Prompt: Define below
Prompt: 
You are an expert resume parser. Extract information from the following resume:

Resume:
{{ $json.body.text }}

Extract and return ONLY a JSON object with this exact structure:
{
  "name": "candidate's full name",
  "email": "email address", 
  "phone": "phone number",
  "experience": 5,
  "skills": ["skill1", "skill2"],
  "education": [{"degree": "", "institution": "", "year": ""}],
  "workHistory": [],
  "matchScore": 75,
  "strengths": ["strength1"],
  "concerns": [],
  "summary": "brief summary"
}

Return ONLY the JSON object, no markdown, no explanations.

Chat Model: OpenAI GPT-4-turbo
Temperature: 0.3
Max Tokens: 3000
Output Parser: Structured Output Parser
```

### Node 3: HTTP Request
```
URL: http://host.docker.internal:3001/api/resumes/callback
Method: POST
Authentication: None
Send Body: ON
Body Content Type: JSON
Specify Body: Using Expression

Expression:
{{ { success: true, data: $json.output } }}
```

## Testing Steps

### 1. Test AI Parsing Only (No Callback)
```bash
# Remove HTTP Request node temporarily
node test-n8n-simple.js
```

Expected output:
```json
{
  "output": {
    "name": "John Doe",
    "email": "john@example.com",
    "skills": ["React", "Node.js"],
    ...
  }
}
```

### 2. Test Full Workflow (With Callback)
```bash
# Add HTTP Request node back
node test-n8n-webhook.js
```

Expected output:
```json
{
  "success": true,
  "message": "Data received",
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    ...
  }
}
```

### 3. Test from Next.js App
1. Go to http://localhost:3001
2. Create or select a role
3. Upload a resume
4. Check if candidate appears with parsed data

## Environment Variables

Make sure these are set in `.env`:

```bash
N8N_WEBHOOK_URL="http://localhost:5678/webhook/parse-resume"
OPENAI_API_KEY="your-openai-api-key"
```

## Troubleshooting

### Issue: "{{ $json.output }}" appears as string
**Fix:** Use "Using Expression" mode, not "Using Fields Below"

### Issue: "Not Found" error from n8n
**Fix:** Make sure workflow is saved and activated

### Issue: "Connection refused" from Docker
**Fix:** Use `host.docker.internal` instead of `localhost`

### Issue: Empty data returned
**Fix:** Check AI Agent prompt uses `{{ $json.body.text }}`

## Data Flow

```
User uploads resume
    ↓
Next.js /api/resumes/upload
    ↓
n8n Webhook (receives resume text)
    ↓
AI Agent (GPT-4 parses resume)
    ↓
HTTP Request (sends to callback)
    ↓
Next.js /api/resumes/callback
    ↓
Database (stores parsed data)
    ↓
UI updates with candidate
```

## Quick Commands

```bash
# Test n8n parsing only
node test-n8n-simple.js

# Test full workflow
node test-n8n-webhook.js

# Test callback endpoint
node test-callback.js

# Start Next.js app
npm run dev
```

## Success Criteria

✅ `node test-n8n-simple.js` returns parsed resume data
✅ `node test-n8n-webhook.js` returns success with data
✅ Uploading resume in UI creates candidate with AI-parsed data
✅ n8n Executions show successful runs
✅ Database contains parsed candidate information

## Next Steps After Integration

1. Create JD parser workflow (similar to resume parser)
2. Create candidate evaluator workflow
3. Add error notifications
4. Monitor API usage and costs
5. Optimize prompts for better accuracy
