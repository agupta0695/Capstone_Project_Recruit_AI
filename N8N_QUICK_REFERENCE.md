# n8n Quick Reference

## 🔗 Important URLs

**Get Your Webhook URL:**
1. Open n8n workflow
2. Click Webhook node
3. Copy **Production URL**

**Format:** `https://your-n8n.com/webhook/parse-resume`

---

## ⚙️ Configuration Summary

### Webhook Node
```
Method: POST
Path: parse-resume
Response Mode: When Last Node Finishes
```

### AI Agent Node
```
Prompt Source: Define below
Output Format: Required (ON)
Memory: Simple Memory
```

### Chat Model
```
Provider: OpenAI
Model: gpt-4-turbo
Temperature: 0.3
Max Tokens: 3000
```

### Output Parser
```
Type: Structured Output Parser
Schema: JSON Schema (see below)
```

---

## 📋 JSON Schema for Output Parser

```json
{
  "type": "object",
  "properties": {
    "name": {"type": "string"},
    "email": {"type": "string"},
    "phone": {"type": "string"},
    "experience": {"type": "number"},
    "skills": {"type": "array", "items": {"type": "string"}},
    "education": {"type": "array"},
    "workHistory": {"type": "array"},
    "matchScore": {"type": "number"},
    "strengths": {"type": "array", "items": {"type": "string"}},
    "concerns": {"type": "array", "items": {"type": "string"}},
    "summary": {"type": "string"}
  },
  "required": ["name", "email", "matchScore"]
}
```

---

## 🧪 Quick Test Commands

### Test with Node.js script:
```bash
node test-n8n-webhook.js
```

### Test with curl:
```bash
curl -X POST https://your-n8n.com/webhook/parse-resume \
  -H "Content-Type: application/json" \
  -d '{
    "resumeText": "John Doe\njohn@example.com\n555-1234",
    "roleName": "Developer",
    "jobDescription": "Full stack role",
    "requiredSkills": ["React", "Node.js"]
  }'
```

---

## 🔍 Monitoring

**View Executions:**
- n8n Dashboard → Executions (left sidebar)

**Check Logs:**
- Click any execution → See step-by-step data

**Debug Mode:**
- Workflow Settings → Enable "Save Execution Progress"

---

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| Connection refused | Check if n8n is running & workflow is active |
| 404 Not Found | Verify webhook path and workflow is saved |
| Timeout | Increase timeout in HTTP Request node |
| Invalid JSON | Check Output Parser and AI prompt |
| No API credits | Add credits to OpenAI account |

---

## 📊 Expected Data Flow

```
Next.js App
    ↓ (POST with resume data)
n8n Webhook
    ↓
AI Agent (GPT-4)
    ↓ (parsed JSON)
HTTP Request
    ↓ (POST callback)
Next.js API (/api/resumes/callback)
    ↓
Database (Prisma)
    ↓
UI Update
```

---

## 🎯 Quick Actions

**Activate Workflow:**
- Toggle switch in top right corner

**Test Workflow:**
- Click "Execute workflow" button

**View Webhook URL:**
- Click Webhook node → See Production URL

**Check API Usage:**
- OpenAI Dashboard → Usage

**Restart Workflow:**
- Deactivate → Save → Activate

---

## 📝 Environment Variables

Add to `.env`:
```bash
N8N_WEBHOOK_URL="https://your-n8n.com/webhook/parse-resume"
OPENAI_API_KEY="sk-..."
```

---

## 🚀 Production Deployment

1. ✅ Get production webhook URL
2. ✅ Update `.env` with real URL
3. ✅ Activate workflow in n8n
4. ✅ Test with sample data
5. ✅ Set up error notifications
6. ✅ Monitor first few executions
7. ✅ Deploy Next.js app

---

## 📞 Support Resources

- **n8n Docs:** https://docs.n8n.io
- **OpenAI API:** https://platform.openai.com/docs
- **Community:** https://community.n8n.io
