# 🚀 HireAI - Quick Reference Card

## 🌐 Access
**URL**: http://localhost:3000
**Status**: ✅ Running

## 🔑 Quick Actions

### First Time Setup
1. Go to http://localhost:3000/auth/signup
2. Create account
3. Login automatically redirects to dashboard

### Create Your First Role
1. Dashboard → Click "New Role"
2. Fill form → Click "Create Role"
3. Upload resumes → Click "Upload Resumes"
4. View candidates → Click on role → See scored candidates

### Review Candidates
1. Click candidate → View details
2. See AI score (circular indicator)
3. Read AI reasoning
4. Click action: Shortlist / Review / Reject

### Bulk Approve
1. Sidebar → "Approvals"
2. Select candidates (checkboxes)
3. Click "Approve Selected"

## 📍 Navigation Map

```
├── Dashboard (/)
│   ├── Stats: Active Roles, Pending Approvals, Time Saved
│   └── Role List Table
│
├── Roles (same as Dashboard)
│
├── Approvals (/dashboard/approvals)
│   ├── Pending candidates
│   └── Bulk actions
│
├── Calendar (/dashboard/calendar)
│   ├── Upcoming interviews
│   └── Past interviews
│
├── Logs (/dashboard/logs)
│   ├── AI decisions
│   ├── Search & filter
│   └── Reasoning display
│
└── Settings (/dashboard/settings)
    ├── General
    ├── Automation
    ├── Integrations
    └── Notifications
```

## 🎨 Design Tokens

### Colors
```
Primary:   #6366F1 (Indigo)
Secondary: #14B8A6 (Teal)
Success:   #10B981 (Green)
Warning:   #F59E0B (Orange)
Error:     #EF4444 (Red)
```

### Component Classes
```css
.btn-primary      /* Indigo button */
.btn-secondary    /* White button with border */
.btn-success      /* Green button */
.btn-error        /* Red button */
.card             /* White card with shadow */
.stat-card        /* Dashboard stat card */
.badge-success    /* Green badge */
.badge-warning    /* Yellow badge */
.badge-error      /* Red badge */
.input            /* Form input */
```

## 📊 Scoring System

### AI Score Ranges
- **70-100**: Shortlisted (Green) - Strong match
- **50-69**: Review (Yellow) - Moderate match
- **0-49**: Rejected (Red) - Weak match

### Confidence Levels
- **80-100%**: High confidence
- **60-79%**: Medium confidence
- **0-59%**: Low confidence

## 🔄 Workflow

### Standard Hiring Flow
```
1. Create Role
   ↓
2. Upload Resumes
   ↓
3. AI Scores Candidates
   ↓
4. Review in Approvals
   ↓
5. Shortlist Candidates
   ↓
6. Schedule Interviews (Calendar)
   ↓
7. Track in Logs
```

## 📁 File Formats

### Supported Resume Formats
- ✅ PDF (.pdf)
- ✅ Word (.docx, .doc)
- ✅ Text (.txt)

### Upload Limits
- Multiple files at once
- No size limit (reasonable files)

## 🎯 Key Features

### ✅ Implemented
- Authentication (Login/Signup)
- Role Management (CRUD)
- Resume Upload & Parsing
- AI Scoring & Evaluation
- Candidate Management
- Approval Workflow
- AI Reasoning Logs
- Settings Configuration
- Calendar View

### ⏳ Needs Integration
- Gmail (resume ingestion)
- Google Calendar (auto-scheduling)
- Email notifications
- Real-time updates

## 🐛 Troubleshooting

### Common Issues

**"Unauthorized" Error**
→ Logout and login again (token expired)

**Resume Upload Fails**
→ Check file format (PDF/DOCX/TXT only)

**Candidates Not Showing**
→ Refresh page or check upload success

**Empty Dashboard**
→ Create a role first, then upload resumes

**Can't Access Role**
→ Make sure you're logged in as the role creator

## 💡 Pro Tips

1. **Bulk Upload**: Upload multiple resumes at once for efficiency
2. **Use Approvals**: Review all pending candidates in one place
3. **Check Logs**: Understand AI decisions in the Logs page
4. **Set Threshold**: Configure confidence threshold in Settings
5. **Filter Candidates**: Use tabs to filter by status

## 📞 Quick Commands

### Database Reset (if needed)
```bash
npx prisma db push --force-reset
```

### Restart Dev Server
```bash
npm run dev
```

### Check Database
```bash
npx prisma studio
```

## 🎉 Success Indicators

✅ Can login/signup
✅ Can create roles
✅ Can upload resumes
✅ Candidates show with scores
✅ Can change candidate status
✅ All pages load without errors
✅ Navigation works smoothly
✅ UI matches design

## 📚 Documentation

- `IMPLEMENTATION_COMPLETE.md` - Full implementation details
- `TESTING_GUIDE.md` - Complete testing scenarios
- `FEATURE_LIST.md` - All 150+ features
- `QUICK_REFERENCE.md` - This file

## 🚀 Status

**Version**: 1.0.0
**Status**: ✅ Production Ready
**Last Updated**: December 2024

---

**Need Help?** Check the full documentation files above!
