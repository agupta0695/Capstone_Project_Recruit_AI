# ✅ n8n Integration Setup Checklist

## Pre-Integration Checklist

### HireAI Setup
- [x] HireAI application running at http://localhost:3000
- [x] Database connected (PostgreSQL/Supabase)
- [x] Can create roles and upload resumes
- [x] Basic parsing working

### Requirements
- [ ] Node.js installed (v18+)
- [ ] npm or Docker installed
- [ ] OpenAI API account created
- [ ] OpenAI API key obtained
- [ ] Credit card added to OpenAI account (for API usage)

---

## n8n Installation Checklist

### Option A: npm Installation
- [ ] Run: `npm install n8n -g`
- [ ] Run: `n8n start`
- [ ] Access: http://localhost:5678
- [ ] Create n8n account (first time)

### Option B: Docker Installation
- [ ] Docker installed
- [ ] Run: `docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n`
- [ ] Access: http://localhost:5678
- [ ] Create n8n account (first time)

### Option C: n8n Cloud
- [ ] Sign up at https://n8n.io
- [ ] Choose plan (free tier available)
- [ ] Access your instance URL

---

## Workflow 1: Resume Parser Setup

### Create Workflow
- [ ] Open n8n at http://localhost:5678
- [ ] Click "Add Workflow"
- [ ] Name it "HireAI - Resume Parser"

### Add Nodes
- [ ] Add Webhook node
  - [ ] Set HTTP Method: POST
  - [ ] Set Path: `parse-resume`
  - [ ] Set Response Mode: "When Last Node Finishes"
  - [ ] Copy webhook URL

- [ ] Add OpenAI node
  - [ ] Click "Create New Credential"
  - [ ] Paste OpenAI API key
  - [ ] Select Model: `gpt-4o-mini` or `gpt-4o`
  - [ ] Add prompt (see N8N_QUICK_START.md)

- [ ] Add Code node
  - [ ] Paste formatting code (see N8N_QUICK_START.md)

- [ ] Add Respond to Webhook node
  - [ ] Set Response Body: `{{ $json }}`

### Activate & Test
- [ ] Click "Save"
- [ ] Toggle "Active" to ON
- [ ] Test with curl command
- [ ] Verify JSON response

---

## Workflow 2: JD Parser Setup (Optional but Recommended)

### Create Workflow
- [ ] Click "Add Workflow"
- [ ] Name it "HireAI - JD Parser"

### Add Nodes
- [ ] Add Webhook node (path: `parse-jd`)
- [ ] Add OpenAI node (with JD parsing prompt)
- [ ] Add Code node (format response)
- [ ] Add Respond to Webhook node

### Activate & Test
- [ ] Save and activate
- [ ] Test with sample JD
- [ ] Verify structured output

---

## Workflow 3: Candidate Evaluator Setup (Optional but Recommended)

### Create Workflow
- [ ] Click "Add Workflow"
- [ ] Name it "HireAI - Candidate Evaluator"

### Add Nodes
- [ ] Add Webhook node (path: `evaluate-candidate`)
- [ ] Add OpenAI node (with evaluation prompt)
- [ ] Add Code node (format response)
- [ ] Add Respond to Webhook node

### Activate & Test
- [ ] Save and activate
- [ ] Test with sample data
- [ ] Verify scoring output

---

## HireAI Integration Checklist

### Environment Configuration
- [ ] Open `.env` file in HireAI
- [ ] Add: `N8N_WEBHOOK_URL=http://localhost:5678/webhook`
- [ ] Add: `OPENAI_API_KEY=your_key_here` (optional, for fallback)
- [ ] Save file

### Verify Integration Files
- [ ] Check `lib/n8n.ts` exists
- [ ] Check functions are exported:
  - [ ] `parseResume()`
  - [ ] `parseJobDescription()`
  - [ ] `evaluateCandidate()`

### Restart HireAI
- [ ] Stop dev server (Ctrl+C)
- [ ] Run: `npm run dev`
- [ ] Wait for compilation
- [ ] Access: http://localhost:3000

---

## Testing Checklist

### Test Resume Parsing
- [ ] Login to HireAI
- [ ] Create a test role
- [ ] Upload a sample resume (PDF/DOCX/TXT)
- [ ] Wait for processing
- [ ] Check candidate profile
- [ ] Verify fields are populated:
  - [ ] Name
  - [ ] Email
  - [ ] Phone
  - [ ] Skills
  - [ ] Experience
  - [ ] Education

### Test n8n Workflow Directly
- [ ] Open n8n
- [ ] Go to "Executions" tab
- [ ] Check recent executions
- [ ] Verify success status
- [ ] Review input/output data

### Test Error Handling
- [ ] Stop n8n server
- [ ] Upload resume in HireAI
- [ ] Verify fallback parsing works
- [ ] Check no errors in console
- [ ] Restart n8n
- [ ] Upload another resume
- [ ] Verify n8n is used again

---

## Monitoring Checklist

### n8n Monitoring
- [ ] Check "Executions" tab regularly
- [ ] Monitor success/failure rates
- [ ] Review execution times
- [ ] Check for error patterns

### OpenAI Usage
- [ ] Login to OpenAI dashboard
- [ ] Check API usage
- [ ] Monitor costs
- [ ] Set up usage alerts (recommended)

### HireAI Logs
- [ ] Check browser console for errors
- [ ] Review server logs
- [ ] Monitor API response times
- [ ] Track parsing accuracy

---

## Optimization Checklist

### Performance
- [ ] Test with multiple resumes
- [ ] Measure average processing time
- [ ] Optimize prompts if needed
- [ ] Consider batch processing

### Cost Optimization
- [ ] Use gpt-4o-mini for most cases
- [ ] Implement caching for repeated resumes
- [ ] Set up usage limits
- [ ] Monitor daily costs

### Accuracy
- [ ] Test with various resume formats
- [ ] Check parsing accuracy
- [ ] Refine prompts based on results
- [ ] Collect user feedback

---

## Production Deployment Checklist

### n8n Production Setup
- [ ] Choose deployment method:
  - [ ] n8n Cloud (easiest)
  - [ ] Self-hosted Docker
  - [ ] Self-hosted npm
- [ ] Set up production instance
- [ ] Import workflows
- [ ] Configure authentication
- [ ] Set up HTTPS
- [ ] Update webhook URLs

### HireAI Production Setup
- [ ] Update `.env` with production n8n URL
- [ ] Deploy to Vercel/AWS/etc.
- [ ] Test production integration
- [ ] Set up monitoring
- [ ] Configure error alerts

### Security
- [ ] Enable n8n authentication
- [ ] Use HTTPS for all connections
- [ ] Secure API keys
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Regular security audits

---

## Documentation Checklist

### Team Documentation
- [ ] Document n8n setup process
- [ ] Create troubleshooting guide
- [ ] Document prompt templates
- [ ] Share API key management process

### User Documentation
- [ ] Update user guide
- [ ] Document new features
- [ ] Create FAQ
- [ ] Provide support contact

---

## Maintenance Checklist

### Weekly
- [ ] Review n8n execution logs
- [ ] Check OpenAI usage and costs
- [ ] Monitor error rates
- [ ] Review user feedback

### Monthly
- [ ] Optimize prompts based on data
- [ ] Update workflows if needed
- [ ] Review and adjust costs
- [ ] Update documentation

### Quarterly
- [ ] Evaluate AI model performance
- [ ] Consider model upgrades
- [ ] Review architecture
- [ ] Plan improvements

---

## Success Criteria

### Integration is Successful When:
- [x] n8n is running and accessible
- [ ] All 3 workflows are created and active
- [ ] HireAI can communicate with n8n
- [ ] Resume parsing works end-to-end
- [ ] Parsed data is accurate (95%+)
- [ ] Processing time is acceptable (<5s)
- [ ] Fallback works when n8n is down
- [ ] No errors in production
- [ ] Costs are within budget
- [ ] Users are satisfied with results

---

## Quick Reference

### Important URLs
- HireAI: http://localhost:3000
- n8n: http://localhost:5678
- OpenAI Dashboard: https://platform.openai.com

### Important Files
- Integration: `lib/n8n.ts`
- Environment: `.env`
- Documentation: `N8N_INTEGRATION_GUIDE.md`
- Quick Start: `N8N_QUICK_START.md`

### Support Resources
- n8n Docs: https://docs.n8n.io
- OpenAI Docs: https://platform.openai.com/docs
- n8n Community: https://community.n8n.io

---

## Next Steps After Completion

1. [ ] Test with real resumes
2. [ ] Gather user feedback
3. [ ] Optimize prompts
4. [ ] Add more workflows (email, scheduling)
5. [ ] Scale as needed

---

**Print this checklist and check off items as you complete them!** ✅

**Estimated Time**: 30-60 minutes for complete setup
