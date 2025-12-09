# 🚀 Quick Test Guide - HireFlow

**Server**: http://localhost:3000 (already running)

---

## ⚡ 5-Minute Test

### Step 1: Sign Up (30 seconds)
```
URL: http://localhost:3000/auth/signup

Fill in:
- Name: Test User
- Email: test@example.com
- Company: TestCo
- Password: password123
- Confirm: password123

Click: Sign Up
→ Redirects to dashboard
```

### Step 2: Create Role (1 minute)
```
Click: "New Role" button

Fill in:
- Job Title: Senior Frontend Developer
- Department: Engineering
- Description: Looking for experienced React developer
- Required Skills: React, TypeScript, Node.js, JavaScript
- Experience Level: Senior
- Education Level: Bachelor's

Click: Create Role
→ Redirects to role detail page
```

### Step 3: Upload Resume (1 minute)
```
Click: "Upload Resumes" button

Select: test-resume.txt (in project root)

Click: Open

Wait for: "Successfully processed 1 resume(s)" alert

Result: John Doe appears in list
- Score: 100
- Status: Shortlisted (green badge)
```

### Step 4: View Candidate (30 seconds)
```
Click: John Doe in the list

See:
- Name: John Doe
- Email: john.doe@example.com
- Phone: +91-9876543210
- AI Score: 100
- Skills: React, Typescript, Node, Javascript (all green)
- Reasoning: "Matched 4 skills from required: React, TypeScript, Node.js, JavaScript"
```

### Step 5: Test Filtering (30 seconds)
```
Click: Back button

Try tabs:
- All: Shows John Doe
- Shortlisted: Shows John Doe
- Review: Empty
- Rejected: Empty
```

### Step 6: Check Dashboard (30 seconds)
```
Click: "HireFlow" logo (top left)

See:
- Active Roles: 1
- Pending Approvals: 1
- Time Saved: 0.0 hrs
- Role table with 1 role
```

---

## ✅ What to Verify

### Authentication ✅
- [ ] Sign up creates account
- [ ] Login works with credentials
- [ ] Dashboard loads after login
- [ ] Logout redirects to login

### Role Management ✅
- [ ] New role form validates fields
- [ ] Role is created in database
- [ ] Role appears in dashboard table
- [ ] Click role opens detail page

### Resume Upload ✅
- [ ] Upload button opens file picker
- [ ] Multiple files can be selected
- [ ] Upload shows loading state
- [ ] Success alert appears
- [ ] Candidates appear in list

### Parsing & Scoring ✅
- [ ] Name extracted correctly
- [ ] Email extracted correctly
- [ ] Phone extracted correctly
- [ ] Skills matched correctly
- [ ] Score calculated correctly (100 for test resume)
- [ ] Status is "Shortlisted" (green)

### Display ✅
- [ ] Candidate list shows all data
- [ ] Filter tabs work
- [ ] Candidate detail page loads
- [ ] Skills are color-coded (green = matched)
- [ ] AI reasoning is displayed

---

## 🐛 Debugging

### If Upload Fails:

**Check Browser Console (F12)**:
```javascript
// Should see:
Files selected: 1
Adding file: test-resume.txt, 1234, text/plain
Uploading to /api/resumes/upload...
Response status: 200
Response data: { success: true, processed: 1, ... }
```

**Check Server Terminal**:
```
=== Resume Upload Started ===
FormData received
Files count: 1, RoleId: xxx
Processing 1 files for role: Senior Frontend Developer
Required skills: React, TypeScript, Node.js, JavaScript
Processing file: test-resume.txt, size: 1234, type: text/plain
Extracted text length: 1234
Parsed: John Doe, skills: React, Typescript, Node, Javascript
Score: 100
Created candidate: abc123
=== Upload Complete ===
```

### Common Issues:

1. **"Unauthorized" error**
   - Solution: Logout and login again

2. **No candidates appear**
   - Check server logs for errors
   - Verify file was selected
   - Try refreshing page

3. **Score is 0**
   - Check required skills match resume skills
   - Skills are case-insensitive but must be in keyword list

---

## 📊 Expected Results

| Test | Expected Result |
|------|----------------|
| Sign up | Account created, redirects to dashboard |
| Create role | Role appears in dashboard table |
| Upload test-resume.txt | John Doe, Score 100, Shortlisted |
| View candidate | Full profile with green skills |
| Filter by Shortlisted | Shows John Doe |
| Filter by Rejected | Empty |
| Dashboard stats | Active Roles: 1, Pending: 1 |

---

## 🎯 Success Criteria

✅ All 6 steps complete without errors  
✅ John Doe appears with score 100  
✅ Status is "Shortlisted" (green)  
✅ All 4 skills are green (matched)  
✅ Dashboard shows correct stats  

**If all above are true: SYSTEM WORKING PERFECTLY!** 🎉

---

## 📁 Files Reference

- **Test Resume**: `test-resume.txt` (project root)
- **System Check**: `SYSTEM_CHECK_REPORT.md`
- **Verification**: `VERIFICATION_COMPLETE.md`
- **Full Guide**: `MVP_COMPLETE.md`

---

**Ready to test? Start at Step 1!** 🚀
