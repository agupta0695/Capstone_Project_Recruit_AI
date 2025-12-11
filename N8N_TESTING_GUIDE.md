# n8n Workflow Testing Guide

## Step 1: Get Your Webhook URL

1. In n8n, click on the **Webhook node** in your workflow
2. Look for the **Production URL** in the node details
3. It should look like: `https://your-n8n-instance.com/webhook/parse-resume`
4. Copy this URL

## Step 2: Update Your .env File

Replace the placeholder in `.env`:

```bash
N8N_WEBHOOK_URL="https://your-actual-n8n-url.com/webhook/parse-resume"
```

**Example:**
```bash
N8N_WEBHOOK_URL="https://n8n.example.com/webhook/parse-resume"
```

## Step 3: Test Using the Test Script

Run the test script:

```bash
node test-n8n-webhook.js
```

**Expected Output:**
```
🚀 Testing n8n webhook...
📍 URL: https://your-n8n.com/webhook/parse-resume
📦 Sending test resume data...

✅ Status Code: 200
📥 Response:
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "(555) 123-4567",
  "experience": 8,
  "skills": ["JavaScript", "TypeScript", "React", "Node.js", ...],
  "matchScore": 85,
  ...
}

✅ Test completed successfully!
```

## Step 4: Test Using Postman/Insomnia

**Method:** POST  
**URL:** Your n8n webhook URL  
**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "resumeText": "John Doe\nEmail: john@example.com\nPhone: 555-1234\n\nSKILLS\n- React\n- Node.js\n- TypeScript\n\nEXPERIENCE\nSenior Developer at TechCorp (2020-Present)",
  "roleName": "Senior Full Stack Developer",
  "jobDescription": "Looking for experienced developer",
  "requiredSkills": ["React", "Node.js", "TypeScript"],
  "candidateId": "test-123",
  "roleId": "role-456",
  "callbackUrl": "http://localhost:3000/api/resumes/callback"
}
```

## Step 5: Test From Your Next.js App

1. Start your Next.js app:
```bash
npm run dev
```

2. Upload a resume through the UI at:
```
http://localhost:3000/dashboard/roles/[roleId]
```

3. Check the browser console and network tab for the API call

## Step 6: Monitor in n8n

1. Go to n8n dashboard
2. Click on **Executions** in the left sidebar
3. You should see your workflow executions
4. Click on any execution to see:
   - Input data received
   - AI Agent response
   - HTTP Request sent back
   - Any errors

## Troubleshooting

### Error: Connection Refused
- ✅ Check if n8n is running
- ✅ Verify the webhook URL is correct
- ✅ Make sure workflow is **activated** (toggle in top right)

### Error: 404 Not Found
- ✅ Check the webhook path matches: `/webhook/parse-resume`
- ✅ Verify workflow is saved and active

### Error: 500 Internal Server Error
- ✅ Check n8n execution logs
- ✅ Verify OpenAI API key is valid
- ✅ Check AI Agent configuration

### No Response / Timeout
- ✅ Increase timeout in HTTP Request node
- ✅ Check if AI model is responding (might be slow)
- ✅ Verify OpenAI API has credits

### Invalid JSON Response
- ✅ Check Output Parser configuration
- ✅ Verify the prompt asks for JSON only
- ✅ Review AI Agent response in execution logs

## Monitoring & Debugging

### View Execution Logs
1. In n8n, go to **Executions**
2. Click on any execution
3. See step-by-step data flow

### Enable Debug Mode
In your workflow:
1. Click **Settings** (gear icon)
2. Enable **Save Execution Progress**
3. Enable **Save Manual Executions**

### Check Webhook Calls
In n8n:
1. Click on Webhook node
2. Click **Listen for Test Event**
3. Send a test request
4. See the incoming data

## Performance Tips

1. **Use GPT-4-turbo** instead of GPT-4 (faster, cheaper)
2. **Set timeout** to 60 seconds in HTTP Request node
3. **Enable caching** in AI Agent settings
4. **Monitor API usage** in OpenAI dashboard

## Next Steps

Once testing is successful:
1. ✅ Update production webhook URL in `.env`
2. ✅ Set up error notifications in n8n
3. ✅ Configure retry logic for failed executions
4. ✅ Monitor execution logs regularly
5. ✅ Set up alerts for workflow failures

## Error Notifications Setup

1. In n8n workflow, click **Settings**
2. Go to **Error Workflow**
3. Select or create an error handling workflow
4. Configure notifications (Email, Slack, etc.)

## Production Checklist

- [ ] Webhook URL updated in `.env`
- [ ] Workflow is activated
- [ ] OpenAI API key is valid and has credits
- [ ] Error notifications configured
- [ ] Tested with sample resume
- [ ] Tested with real resume
- [ ] Callback endpoint is working
- [ ] Database is storing parsed data
- [ ] UI displays parsed information correctly
