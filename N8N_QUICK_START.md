# 🚀 n8n Quick Start for HireAI

## 5-Minute Setup Guide

### Step 1: Install n8n (Choose One)

**Option A: Using npm (Recommended for development)**
```bash
npm install n8n -g
n8n start
```

**Option B: Using Docker**
```bash
docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n
```

**Option C: n8n Cloud (Easiest for production)**
- Go to https://n8n.io and sign up
- Skip to Step 3

### Step 2: Access n8n

Open your browser: **http://localhost:5678**

Create an account (first time only)

### Step 3: Create Resume Parser Workflow

1. **Click "Add Workflow"**

2. **Add Webhook Node** (Trigger)
   - Click the "+" button
   - Search for "Webhook"
   - Configure:
     - HTTP Method: `POST`
     - Path: `parse-resume`
     - Response Mode: "When Last Node Finishes"

3. **Add OpenAI Node**
   - Click "+" after Webhook
   - Search for "OpenAI"
   - Click "Create New Credential"
   - Enter your OpenAI API Key
   - Configure:
     - Resource: "Chat"
     - Operation: "Message a Model"
     - Model: `gpt-4o-mini` (cheaper) or `gpt-4o` (better)
     - Prompt:
     ```
     Extract information from this resume in JSON format:
     
     {
       "name": "Full name",
       "email": "Email",
       "phone": "Phone",
       "skills": ["skill1", "skill2"],
       "experience": "Years or description",
       "education": "Highest level"
     }
     
     Resume: {{ $json.text }}
     
     Return ONLY valid JSON.
     ```

4. **Add Code Node**
   - Click "+" after OpenAI
   - Search for "Code"
   - Paste this code:
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

5. **Add Respond to Webhook Node**
   - Click "+" after Code
   - Search for "Respond to Webhook"
   - Configure:
     - Response Body: `{{ $json }}`

6. **Save & Activate**
   - Click "Save" (top right)
   - Toggle "Active" to ON

### Step 4: Get Webhook URL

Click on the Webhook node → Copy the "Production URL"

Example: `http://localhost:5678/webhook/parse-resume`

### Step 5: Test the Workflow

**Using curl:**
```bash
curl -X POST http://localhost:5678/webhook/parse-resume \
  -H "Content-Type: application/json" \
  -d '{
    "text": "John Doe\njohn@example.com\n+1234567890\nSkills: React, TypeScript, Node.js\n5 years experience as Full Stack Developer\nBachelor in Computer Science"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "skills": ["React", "TypeScript", "Node.js"],
    "experience": "5 years",
    "education": "Bachelor in Computer Science"
  }
}
```

### Step 6: Integrate with HireAI

1. **Add to `.env`:**
   ```env
   N8N_WEBHOOK_URL=http://localhost:5678/webhook
   OPENAI_API_KEY=your_openai_key_here
   ```

2. **The integration is already set up!**
   - The `lib/n8n.ts` file is ready
   - Just ensure n8n is running

3. **Test in HireAI:**
   - Go to http://localhost:3000
   - Create a role
   - Upload a resume
   - It will automatically use n8n for parsing!

---

## 🎯 What You Get

✅ **AI-Powered Parsing**: GPT-4 extracts resume data accurately
✅ **Automatic Integration**: HireAI uses n8n automatically
✅ **Fallback Logic**: If n8n fails, uses built-in parser
✅ **Cost Effective**: ~$0.001 per resume with gpt-4o-mini

---

## 💡 Pro Tips

### 1. Use Cheaper Models
- `gpt-4o-mini`: $0.15 per 1M tokens (recommended)
- `gpt-4o`: $2.50 per 1M tokens (more accurate)

### 2. Add Caching
Add a Redis node before OpenAI to cache results

### 3. Batch Processing
Process multiple resumes in one request to save API calls

### 4. Error Handling
Add an "Error Trigger" node to catch and log failures

### 5. Monitoring
Add a webhook to send metrics to your analytics

---

## 🔧 Troubleshooting

### "Workflow not found"
- Make sure workflow is saved and activated (toggle ON)

### "OpenAI API error"
- Check your API key is valid
- Verify you have credits in your OpenAI account

### "Timeout"
- Increase timeout in `lib/n8n.ts` (default 30s)
- Use faster model (gpt-4o-mini)

### "Connection refused"
- Make sure n8n is running: `n8n start`
- Check URL: http://localhost:5678

---

## 📊 Cost Estimation

**With gpt-4o-mini:**
- 100 resumes/day = ~$0.10/day = $3/month
- 1000 resumes/day = ~$1/day = $30/month

**With gpt-4o:**
- 100 resumes/day = ~$1.50/day = $45/month
- 1000 resumes/day = ~$15/day = $450/month

**Recommendation**: Start with gpt-4o-mini, upgrade if needed

---

## 🚀 Next Steps

1. ✅ Set up Resume Parser (you just did!)
2. 📝 Create JD Parser workflow (similar steps)
3. 🎯 Create Candidate Evaluator workflow
4. 🔄 Test end-to-end flow
5. 📈 Monitor and optimize

---

## 📚 Additional Resources

- **Full Integration Guide**: `N8N_INTEGRATION_GUIDE.md`
- **Workflow Templates**: `n8n-workflows/` folder
- **n8n Documentation**: https://docs.n8n.io
- **OpenAI Pricing**: https://openai.com/pricing

---

**You're all set! n8n is now powering your resume parsing with AI.** 🎉

**Test it now**: Upload a resume in HireAI and watch the magic happen!
