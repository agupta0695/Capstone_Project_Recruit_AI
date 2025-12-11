# n8n Workflow Troubleshooting Guide

## Current Status

✅ **Webhook**: Working - receives data correctly
✅ **AI Agent**: Working - parses resume when tested alone
✅ **Next.js Callback**: Working - endpoint responds correctly
❌ **Full Workflow**: Failing with 500 error

## Common Issues & Solutions

### Issue 1: HTTP Request Node Can't Access AI Agent Output

**Symptom**: Error in HTTP Request node about missing data

**Solution**: Check the HTTP Request JSON body configuration

**Correct format:**
```json
{
  "success": true,
  "data": {{ $json.output }}
}
```

**Note**: No quotes around `{{ $json.output }}`

### Issue 2: Wrong Data Path in HTTP Request

**Check**: The AI Agent output structure

If AI Agent returns:
```json
{
  "output": { "name": "John", ... }
}
```

Then HTTP Request should use: `{{ $json.output }}`

If AI Agent returns:
```json
{
  "name": "John", ...
}
```

Then HTTP Request should use: `{{ $json }}`

### Issue 3: HTTP Request URL Wrong

**Check**: Make sure URL matches your Next.js port

If Next.js is on port 3001:
```
http://localhost:3001/api/resumes/callback
```

Not:
```
http://localhost:3000/api/resumes/callback
```

### Issue 4: AI Agent Still Using Chat Trigger Mode

**Check**: AI Agent "Source for Prompt" setting

Must be: **"Define below"**
Not: **"Connected Chat Trigger Node"**

### Issue 5: Workflow Not Saved/Activated

**Check**:
1. Click "Save" button
2. Toggle "Active" to ON
3. Refresh the page

## Debugging Steps

### Step 1: Test Each Node Individually

1. **Test Webhook alone**:
   - Click "Execute workflow"
   - Send test data
   - Check webhook output

2. **Test AI Agent alone**:
   - Use `node test-n8n-simple.js`
   - Should return parsed data

3. **Test HTTP Request alone**:
   - Use `node test-callback.js`
   - Should return 200 status

### Step 2: Check Execution Logs

1. Go to **Executions** in n8n
2. Click on failed execution
3. Look for red error icon
4. Click on that node
5. Read the error message

### Step 3: Check Data Flow

1. Click on each node in the execution
2. Check the "Output" tab
3. Verify data structure matches expectations

## Quick Fixes

### Fix 1: Remove HTTP Request Temporarily

Test without callback:
1. Delete HTTP Request node
2. Workflow: Webhook → AI Agent
3. Test with: `node test-n8n-simple.js`
4. Should return parsed data

### Fix 2: Simplify HTTP Request Body

Use minimal body:
```json
{{ $json }}
```

This sends the entire AI Agent output.

### Fix 3: Add Error Handling

In HTTP Request Settings:
- **On Error**: Continue
- **Always Output Data**: ON

This prevents workflow from stopping on errors.

## Testing Commands

```bash
# Test AI parsing only (no callback)
node test-n8n-simple.js

# Test full workflow (with callback)
node test-n8n-webhook.js

# Test Next.js callback directly
node test-callback.js

# Test with debug output
node test-webhook-debug.js
```

## Expected Results

### Successful AI Parsing:
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

### Successful Callback:
```json
{
  "success": true,
  "message": "Data received",
  "data": { ... }
}
```

## Still Having Issues?

Check these in order:

1. ✅ Is n8n running? (http://localhost:5678)
2. ✅ Is Next.js running? (http://localhost:3001)
3. ✅ Is workflow saved and active?
4. ✅ Is OpenAI API key valid?
5. ✅ Do you have OpenAI credits?
6. ✅ Is the prompt using `{{ $json.body.text }}`?
7. ✅ Is HTTP Request using correct port?
8. ✅ Is HTTP Request JSON body correct?

## Get Help

If still stuck, provide:
1. Screenshot of n8n execution error
2. Error message from failed node
3. Output from: `node test-n8n-simple.js`
4. Output from: `node test-callback.js`
