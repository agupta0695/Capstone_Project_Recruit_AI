# HireFlow Testing Checklist

## ✅ Pre-Testing Setup

- [x] Dev server running on http://localhost:3000
- [x] Database connected (Supabase PostgreSQL)
- [x] All API routes created
- [x] All pages created
- [x] Test resume file available (`test-resume.txt`)

## 🧪 Testing Steps

### Step 1: Authentication ✅ (Already Tested)
- [x] Signup works
- [x] Login works
- [x] Dashboard loads
- [x] Token stored in localStorage

### Step 2: Create a Role (NEW - Test This Now)

1. **Navigate to Dashboard**
   - URL: http://localhost:3000/dashboard
   - Should see "New Role" button

2. **Click "New Role"**
   - Should redirect to: http://localhost:3000/dashboard/roles/new
   - Form should be visible

3. **Fill in the Form**
   ```
   Job Title: Senior Frontend Developer
   Department: Engineering
   Description: Looking for an experienced React developer to join our team
   Required Skills: React, TypeScript, Node.js, JavaScript
   Experience Level: Senior
   Education Level: Bachelor's
   ```

4. **Submit**
   - Click "Create Role" button
   - Should redirect to role detail page
   - URL will be: http://localhost:3000/dashboard/roles/[some-id]

### Step 3: Upload Resume (NEW - Test This Now)

1. **On Role Detail Page**
   - Should see "Upload Resumes" button
   - Should see 4 stat cards (Total, Screened, Shortlisted, Skills)
   - Should see tabs (All, Shortlisted, Review, Rejected)

2. **Click "Upload Resumes"**
   - File picker should open
   - Navigate to project root
   - Select `test-resume.txt`
   - Click Open

3. **Wait for Upload**
   - Button should show "Uploading..."
   - Check browser console (F12) for logs
   - Check terminal for server logs

4. **Verify Success**
   - Should see alert: "Successfully processed 1 resume(s)"
   - Page should refresh
   - Should see John Doe in candidate list
   - Score should be 100 (matches all required skills)
   - Status should be "Shortlisted" (green badge)

### Step 4: View Candidate Details

1. **Click on John Doe**
   - Should redirect to: http://localhost:3000/dashboard/candidates/[id]

2. **Verify Information**
   - Name: John Doe
   - Email: john.doe@example.com
   - Phone: +91-9876543210
   - AI Score: 100
   - Skills: React, TypeScript, Node.js, JavaScript (all green)
   - Status: Shortlisted

3. **Test Status Override**
   - Click "Review" button
   - Status should change to "Review" (yellow)
   - Click "Shortlist" button
   - Status should change back to "Shortlisted" (green)

### Step 5: Test Filtering

1. **Go Back to Role Page**
   - Click "← Back" button
   - Should return to role detail page

2. **Test Tabs**
   - Click "Shortlisted" tab - should show John Doe
   - Click "Review" tab - should show empty (unless you changed status)
   - Click "Rejected" tab - should show empty
   - Click "All" tab - should show John Doe

### Step 6: Test Multiple Uploads

1. **Create Another Test Resume**
   - Create a new file: `test-resume-2.txt`
   - Content:
   ```
   Jane Smith
   Backend Developer
   
   Email: jane.smith@example.com
   Phone: +91-9876543211
   
   SKILLS
   - Python
   - Django
   - PostgreSQL
   
   EXPERIENCE
   Backend Developer at TechCo (2021-2023)
   ```

2. **Upload Both Files**
   - Click "Upload Resumes"
   - Select both `test-resume.txt` and `test-resume-2.txt`
   - Click Open

3. **Verify Results**
   - Should see alert: "Successfully processed 2 resume(s)"
   - John Doe: Score 100, Shortlisted (matches React, TypeScript, Node.js, JavaScript)
   - Jane Smith: Score 0, Rejected (no matching skills)

### Step 7: Dashboard Statistics

1. **Return to Dashboard**
   - Click "HireFlow" logo or navigate to http://localhost:3000/dashboard

2. **Verify Stats Updated**
   - Active Roles: 1
   - Role should appear in table
   - Total Candidates: 2 (or 3 if you uploaded twice)
   - Shortlisted: 1 (or 2)

## 🐛 Troubleshooting

### Upload Not Working?

**Check Browser Console (F12):**
- Look for error messages
- Check Network tab for failed requests
- Verify FormData is being sent

**Check Server Logs:**
- Look for "=== Resume Upload Started ===" message
- Check for error messages
- Verify file processing logs

**Common Issues:**
1. **"Unauthorized" error**
   - Token expired or missing
   - Solution: Logout and login again

2. **"No files provided" error**
   - File input not working
   - Solution: Check file input element, try different file

3. **"Failed to extract text" error**
   - File format issue
   - Solution: Use .txt files for testing

4. **No candidates appear**
   - Database issue or parsing failed
   - Solution: Check server logs for errors

### Still Not Working?

1. **Restart Dev Server**
   ```bash
   # Stop: Ctrl+C in terminal
   # Start: npm run dev
   ```

2. **Clear Browser Cache**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

3. **Check Database**
   - Verify Supabase connection in .env
   - Check if tables exist

4. **Check File Permissions**
   - Ensure files are readable
   - Try copying test-resume.txt to Downloads folder

## ✅ Success Indicators

- ✅ No errors in browser console
- ✅ No errors in server logs
- ✅ Alert shows "Successfully processed X resume(s)"
- ✅ Candidates appear in list
- ✅ Scores are calculated correctly
- ✅ Status badges show correct colors
- ✅ Filtering works
- ✅ Candidate details page loads
- ✅ Manual overrides work
- ✅ Dashboard stats update

## 📊 Expected Results

| Resume | Skills Match | Score | Status |
|--------|-------------|-------|--------|
| John Doe (test-resume.txt) | 4/4 (React, TypeScript, Node.js, JavaScript) | 100 | Shortlisted |
| Jane Smith (test-resume-2.txt) | 0/4 | 0 | Rejected |

## 🎉 When Everything Works

You should be able to:
1. Create roles with specific skill requirements
2. Upload multiple resumes at once
3. See AI-scored candidates automatically
4. Filter candidates by status
5. View detailed candidate profiles
6. Override AI decisions manually
7. See updated statistics on dashboard

---

**Ready to Test?** Start with Step 2 above! 🚀
