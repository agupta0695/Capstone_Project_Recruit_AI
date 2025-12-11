# 🧪 HireAI Testing Guide

## Quick Start Testing

### Prerequisites
✅ Dev server is running at http://localhost:3000
✅ Database is connected (PostgreSQL via Supabase)
✅ All pages are implemented and error-free

## Test Scenarios

### 1. Authentication Flow
**Test Login:**
1. Go to http://localhost:3000/auth/login
2. Enter your credentials
3. Click "Sign In"
4. ✅ Should redirect to dashboard

**Test Signup:**
1. Go to http://localhost:3000/auth/signup
2. Fill in all fields (name, email, company, password)
3. Click "Create Account"
4. ✅ Should create account and redirect to dashboard

### 2. Dashboard
**Test Dashboard View:**
1. After login, you should see:
   - ✅ 3 stat cards (Active Roles, Pending Approvals, Time Saved)
   - ✅ "Open Roles" section with table
   - ✅ "New Role" button
2. If no roles exist:
   - ✅ Should show empty state with "Create First Role" button

### 3. Create New Role
**Test Role Creation:**
1. Click "New Role" button
2. Fill in the form:
   - Job Title: "Senior Frontend Developer"
   - Department: "Engineering"
   - Description: "We're looking for an experienced React developer..."
   - Required Skills: "React, TypeScript, Node.js"
   - Experience Level: "Senior"
   - Education Level: "Bachelor's"
3. Click "Create Role"
4. ✅ Should redirect to dashboard
5. ✅ New role should appear in the table

### 4. Role Detail & Resume Upload
**Test Role Detail:**
1. Click on a role from the dashboard
2. You should see:
   - ✅ Role header with title, department, status badge
   - ✅ 4 stat cards (Total, Screened, Shortlisted, Skills)
   - ✅ "Upload Resumes" button
   - ✅ Tabs: All, Shortlisted, Review, Rejected
   - ✅ Action buttons: Pause/Activate, Delete

**Test Resume Upload:**
1. Click "Upload Resumes" button
2. Select one or more resume files (PDF, DOCX, or TXT)
3. ✅ Should show "Uploading..." state
4. ✅ Should process resumes and show success message
5. ✅ Candidates should appear in the list with scores

**Test Candidate List:**
1. After upload, candidates should show:
   - ✅ Name and email
   - ✅ AI Score (colored: green ≥70, yellow ≥50, red <50)
   - ✅ Status badge (Shortlisted, Review, Rejected)
   - ✅ Hover effect on cards
2. Click on a candidate
3. ✅ Should navigate to candidate detail page

### 5. Candidate Detail
**Test Candidate View:**
1. On candidate detail page, you should see:
   - ✅ Circular score indicator (animated)
   - ✅ Candidate profile (name, email, phone)
   - ✅ Skills assessment (matched vs additional)
   - ✅ AI evaluation with reasoning
   - ✅ Action buttons (Shortlist, Review, Reject)

**Test Status Update:**
1. Click "Shortlist Candidate" button
2. ✅ Status should update
3. ✅ Badge color should change
4. Go back to role detail
5. ✅ Candidate should appear in "Shortlisted" tab

### 6. Approvals Page
**Test Approvals:**
1. Navigate to "Approvals" from sidebar
2. You should see:
   - ✅ List of candidates with status "Review"
   - ✅ Checkbox for each candidate
   - ✅ AI recommendation for each
   - ✅ "View Details" and "Approve & Schedule Interview" buttons

**Test Bulk Actions:**
1. Select multiple candidates (checkboxes)
2. ✅ Should show selection bar at top
3. Click "Approve Selected"
4. ✅ Should update all selected candidates
5. ✅ Candidates should move to "Shortlisted"

### 7. Calendar Page
**Test Calendar:**
1. Navigate to "Calendar" from sidebar
2. You should see:
   - ✅ 3 stat cards (Upcoming, This Week, Completed)
   - ✅ "Upcoming Interviews" section
   - ✅ "Past Interviews" section (if any)
3. If no interviews:
   - ✅ Should show empty state

### 8. Logs Page
**Test Logs:**
1. Navigate to "Logs" from sidebar
2. You should see:
   - ✅ Search bar
   - ✅ Filter tabs (All, Shortlisted, Review, Rejected)
   - ✅ List of AI decisions with reasoning
   - ✅ Confidence bars for each decision

**Test Search & Filter:**
1. Type candidate name in search
2. ✅ Should filter logs
3. Click different filter tabs
4. ✅ Should show only matching logs

### 9. Settings Page
**Test Settings:**
1. Navigate to "Settings" from sidebar
2. You should see:
   - ✅ Sidebar with tabs (General, Automation, Integrations, Notifications)
   - ✅ Content area with settings

**Test Automation Settings:**
1. Click "Automation" tab
2. Toggle "Auto-Approve Candidates"
3. Adjust "Confidence Threshold" slider
4. Click "Save Changes"
5. ✅ Should save successfully

**Test Integrations:**
1. Click "Integrations" tab
2. You should see:
   - ✅ Gmail integration card
   - ✅ Google Calendar integration card
   - ✅ Connect/Disconnect buttons

### 10. Role Actions
**Test Pause/Activate:**
1. Go to role detail page
2. Click "Pause" button
3. ✅ Status badge should change to "Paused"
4. Click "Activate" button
5. ✅ Status badge should change to "Active"

**Test Delete:**
1. Click "Delete" button
2. ✅ Should show confirmation modal
3. Click "Delete" in modal
4. ✅ Should delete role and redirect to dashboard

### 11. Navigation
**Test Sidebar:**
1. Click each menu item:
   - ✅ Dashboard
   - ✅ Roles (same as Dashboard)
   - ✅ Approvals
   - ✅ Calendar
   - ✅ Logs
   - ✅ Settings
2. ✅ Active item should be highlighted
3. ✅ Hover effects should work

**Test Logout:**
1. Click "Logout" button in sidebar
2. ✅ Should clear token
3. ✅ Should redirect to login page

## Visual Testing Checklist

### Design System
- ✅ Primary color: Indigo (#6366F1)
- ✅ Secondary color: Teal (#14B8A6)
- ✅ Font: Inter
- ✅ Rounded corners on cards and buttons
- ✅ Consistent spacing
- ✅ Shadow effects on cards
- ✅ Smooth transitions

### Components
- ✅ Buttons have hover effects
- ✅ Cards have border on hover
- ✅ Badges have correct colors
- ✅ Icons are consistent
- ✅ Loading states show spinners
- ✅ Empty states have illustrations

### Responsive Design
- ✅ Sidebar is fixed on desktop
- ✅ Cards stack on mobile
- ✅ Tables scroll horizontally on mobile
- ✅ Forms are full-width on mobile

## Expected Results

### After Complete Testing:
1. ✅ All authentication flows work
2. ✅ Roles can be created, viewed, updated, deleted
3. ✅ Resumes can be uploaded and parsed
4. ✅ Candidates are scored and categorized
5. ✅ Approvals workflow functions
6. ✅ Logs show AI reasoning
7. ✅ Settings can be configured
8. ✅ Navigation works smoothly
9. ✅ UI matches reference design
10. ✅ No console errors

## Common Issues & Solutions

### Issue: "Unauthorized" error
**Solution**: Token expired. Logout and login again.

### Issue: Resume upload fails
**Solution**: Check file format (PDF, DOCX, TXT only) and size.

### Issue: Candidates not showing
**Solution**: Refresh the page or check if resumes were processed successfully.

### Issue: Empty states everywhere
**Solution**: Create a role and upload resumes first.

## Performance Checks

- ✅ Pages load in < 2 seconds
- ✅ Animations are smooth (60fps)
- ✅ No layout shifts
- ✅ Images/icons load quickly
- ✅ Forms respond instantly

## Browser Compatibility

Test in:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## Success Criteria

All tests pass = ✅ **Ready for Production!**

## Next Steps After Testing

1. Fix any bugs found
2. Optimize performance if needed
3. Add more test data
4. Prepare for deployment
5. Document any edge cases

---

**Happy Testing! 🎉**
