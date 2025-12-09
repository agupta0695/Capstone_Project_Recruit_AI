# 🎨 HireFlow Redesign Plan

Based on the reference images, here's the complete redesign plan:

## Design System

### Colors
- Primary: #6366F1 (Indigo)
- Secondary: #14B8A6 (Teal)
- Success: #10B981 (Green)
- Warning: #F59E0B (Orange)
- Error: #EF4444 (Red)
- Background: #F9FAFB
- Card: #FFFFFF
- Text Primary: #1F2937
- Text Secondary: #6B7280

### Typography
- Font Family: Inter (same as current)
- Headings: Bold, larger sizes
- Body: Regular, 14-16px

### Components to Create/Update

1. **Login Page** ✅
   - Centered card design
   - "Welcome back" heading
   - Email/Password inputs
   - "Sign in with Google" option
   - "Sign up" link

2. **Dashboard** ✅
   - Left sidebar navigation
   - 3 stat cards (Active Roles, Pending Approvals, Time Saved)
   - "Your Roles" table
   - Clean, spacious layout

3. **Role Detail Page** ✅
   - Role title and description
   - "Review Shortlist" button
   - Stats (candidates reviewed, shortlisted, time saved)
   - Tabs (All, Shortlisted, Rejected, Needs Review)
   - Candidate table with scores

4. **Candidate Detail Page** ✅
   - AI Match Score (circular progress)
   - Confidence meter
   - "Why I shortlisted" section
   - Breakdown (Skills, Experience, Education)
   - Strengths & Gaps
   - Resume preview
   - Extracted profile
   - Action buttons (Approve, Reject, Add Note)

5. **Approval Modal** ✅
   - Shortlist approval required
   - Candidates reviewed count
   - AI Reasoning section
   - Top 3 candidates cards
   - Action buttons (Reject, Modify, Approve)

6. **Interview Scheduling** ✅
   - List/Calendar toggle
   - Scheduled interviews table
   - Calendar view
   - Awaiting confirmation section
   - Status badges

7. **Reasoning Logs** ✅
   - Search and filters
   - Log entries table
   - Expandable details
   - Input/Output data
   - Full reasoning text

8. **Settings** ✅
   - Tab navigation
   - Integrations (Gmail, Google Calendar)
   - Human Approval Gates (checkboxes)
   - Confidence threshold slider
   - Scheduling rules

## Screen Flow

```
Login → Dashboard → Role Detail → Candidate Detail
                  ↓
                Approvals → Approve Shortlist
                  ↓
                Calendar → Schedule Interviews
                  ↓
                Logs → View AI Reasoning
                  ↓
                Settings → Configure
```

## Implementation Order

1. Update global styles (colors, fonts)
2. Redesign Sidebar component
3. Redesign Dashboard
4. Redesign Role pages
5. Redesign Candidate pages
6. Add Approvals page (new)
7. Add Calendar page (new)
8. Add Logs page (new)
9. Update Settings page
10. Add approval modal
11. Polish and test

## Key Improvements

- Cleaner, more spacious layout
- Better visual hierarchy
- Consistent color usage
- Modern card designs
- Better data visualization
- Improved status badges
- Circular progress indicators
- Better typography
- Smooth transitions
