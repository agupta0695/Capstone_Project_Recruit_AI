# Prototype Design Specifications - HireFlow

## Product Context Summary

**Product:** HireFlow — an agentic AI assistant that autonomously screens resumes, shortlists candidates with explainable reasoning, and auto-schedules interviews for lean HR teams—reducing early-stage hiring workload by 60-80%.

**Primary Persona:** Sarah Verma, 32, Talent Acquisition Manager at a 70-person SaaS startup in Bengaluru who handles 300-500 resumes per role—wants relief from manual screening and to feel more strategic and in control.

**Brand Vibe:** Intelligent, Trustworthy, Strategic, Efficient, Calm

**Color Tone:** Deep blue (#2563EB), soft teal (#14B8A6), muted neutrals

**Font/Style:** Inter (modern, sans-serif), clean card-based UI with generous whitespace

---

## Prototype Scope

### Core Screens (MVP Prototype)

1. **Login / Signup** — Authentication entry point
2. **Dashboard** — Overview of all active roles and pending approvals
3. **Role Detail** — Single role view with candidate list
4. **Candidate Profile** — Individual candidate evaluation with AI reasoning
5. **Approval Request** — Human-in-loop decision point for shortlist
6. **Interview Scheduling** — Calendar coordination view
7. **Reasoning Logs** — Audit trail of AI decisions
8. **Settings** — Configuration and integrations

### Screen Requirements

Each screen must:
- Reflect intelligent, supportive, calm, strategic brand voice
- Use consistent color palette (deep blue, teal, cool grays)
- Use Inter font family (Bold for headings, Regular for body)
- Feature card-based layouts with 16-24px padding
- Include intuitive navigation with clear CTAs
- Show AI reasoning and confidence scores where relevant
- Maintain <3 clicks to complete any action

---

## Screen-by-Screen Prompts (Tool-Ready)

### Screen 1: Login / Signup

**Goal:** Authenticate users and establish trust from first interaction

**Key Elements:** Email/password fields, Google OAuth button, "Welcome back" messaging

**Tone & Emotion:** Welcoming, professional, secure

**Prompt (≤250 words):**

```
Design a clean, professional login screen for HireFlow, an AI hiring assistant. 
Use off-white background (#FAFAFA) with centered login card (max-width 400px) 
featuring subtle shadow.

Include:
- HireFlow logo at top (simple icon + wordmark)
- Heading "Welcome back" in Inter Bold 28px, deep blue (#2563EB)
- Email input field with label "Work email"
- Password input field with "Forgot password?" link in teal (#14B8A6)
- Primary CTA button "Sign in" in deep blue with white text, 48px height
- Divider line with "or" text
- Google OAuth button with Google icon, white background, gray border
- Footer text "New to HireFlow? Sign up" with teal link

Use generous whitespace (24px padding inside card, 16px between elements). 
Buttons should have 12px padding, 8px border-radius. Overall feel: calm and 
professional. Add subtle hover state with slight darkening.
```

---

### Screen 2: Dashboard

**Goal:** Provide at-a-glance overview of roles, approvals, and automation impact

**Key Elements:** Summary cards, role list table, quick action button, sidebar navigation

**Tone & Emotion:** Calm, strategic, empowering

**Prompt (≤250 words):**

```
Design a calm, strategic dashboard for HireFlow where Talent Acquisition 
Managers see hiring overview. Use off-white background (#FAFAFA) with 
sidebar navigation on left (240px width, white background).

Top section: 3 summary cards in horizontal row with 16px gaps:
1. "Active Roles" card - shows number "4" in Inter Bold 32px, deep blue
2. "Pending Approvals" card - shows "12 candidates" with amber badge (#F59E0B)
3. "Time Saved This Week" card - shows "9.5 hours" with teal accent

Below cards: "Your Roles" section with clean table showing:
- Column headers: Role Title, Candidates, Shortlisted, Status, Last Updated
- 4-5 role rows with data, status badges (green for "Active", gray for "Paused")
- Each row clickable with subtle hover state (light blue background #EFF6FF)

Top right: Primary CTA button "+ New Role" in deep blue
Sidebar includes: Dashboard (active), Roles, Approvals, Calendar, Logs, Settings

Use Inter Regular 14px for body text, Inter Medium 16px for card numbers. 
Cards have subtle shadow, 16px padding, 8px border-radius. Overall feel: 
organized, calm, strategic. Show "You're making great progress" encouragement 
text below cards.
```

---

### Screen 3: Role Detail

**Goal:** Show all candidates for a role with AI scores and filtering

**Key Elements:** Role header, candidate list with scores, tabs, batch actions

**Tone & Emotion:** Efficient, transparent, in-control

**Prompt (≤250 words):**

```
Design a role detail screen for HireFlow showing all candidates for 
"Senior Backend Engineer" position. Use clean, efficient layout.

Header section (sticky):
- Role title "Senior Backend Engineer" in Inter Bold 24px, deep blue
- JD summary (2-3 lines) in gray text with "View full JD" teal link
- Stats bar: "287 candidates reviewed | 12 shortlisted | 9.5 hrs saved"
- Primary CTA "Review Shortlist" in deep blue button, 48px height

Tab navigation below header:
- All (287) | Shortlisted (12) | Rejected (245) | Needs Review (30)
- Active tab has deep blue underline

Candidate list (table format):
- Columns: Name, Score, Skills Match, Experience, Status, Source, Date
- Each row shows:
  - Candidate name with email below (smaller gray text)
  - AI score badge (0-100) with color coding: 80+ green, 70-79 teal, <70 amber
  - "🤖 AI Reviewed" icon in teal
  - Status badge (Shortlisted/Rejected/Pending)
  - Click row to expand reasoning preview
- Rows have 48px height, subtle hover states

Top right: Batch action buttons "Approve Selected" and "Reject Selected"
Filter dropdown on left: "Filter by score, skills, experience"

Use Inter Regular 14px, generous row spacing. Feel: efficient, transparent, 
data-driven but not overwhelming.
```

---

### Screen 4: Candidate Profile

**Goal:** Show detailed evaluation with full AI reasoning and approve/override controls

**Key Elements:** Resume preview, AI evaluation breakdown, reasoning text, confidence score

**Tone & Emotion:** Transparent, confident, collaborative

**Prompt (≤250 words):**

```
Design a detailed candidate profile screen for HireFlow with transparent 
AI reasoning. Use two-column layout (60/40 split).

Left column (main content):
- Candidate header: Name "Rahul Sharma" in Inter Bold 28px, email/phone below
- AI Match Score: Large "92/100" in teal circle with "Strong Match" label
- Confidence meter: "85% confidence" with progress bar (teal fill)

AI Reasoning card (prominent, light blue background #EFF6FF):
- Heading "Why I shortlisted this candidate" with 🤖 icon
- 3-4 sentence explanation in Inter Regular 16px
- Breakdown section:
  - Skills Match: 95% (green bar)
  - Experience Match: 88% (teal bar)
  - Education Match: 90% (teal bar)
- Strengths list (✅ checkmarks): "6 years Python/Django", "AWS + Kubernetes"
- Gaps list (⚠️ icons): "No PostgreSQL mentioned (minor gap)"

Bottom: Action buttons
- Primary "✅ Approve & Shortlist" (deep blue, large, 48px height)
- Secondary "❌ Reject" (red outline)
- Tertiary "✏️ Add Note" (gray outline)

Right column (sidebar):
- Resume preview (PDF thumbnail, "View full resume" link)
- Extracted profile: Skills tags, Experience timeline, Education

Feel: transparent, data-driven, empowering—Sarah feels confident making 
decision with AI reasoning clearly explained.
```

---

### Screen 5: Approval Request Modal

**Goal:** Present AI shortlist recommendation and request human approval

**Key Elements:** Summary stats, AI reasoning, top candidate previews, approve/modify/reject controls

**Tone & Emotion:** Respectful, strategic, collaborative

**Prompt (≤250 words):**

```
Design an approval request screen for HireFlow where AI asks Sarah to 
approve shortlist. Use centered card (max-width 800px) on semi-transparent 
overlay.

Header:
- Icon 🎯 with "Shortlist Approval Required"
- Role: "Senior Backend Engineer"
- Stats: "287 candidates reviewed | 12 recommended for shortlist"
- Time saved badge: "You saved 9.5 hours" in teal

AI Reasoning section (light blue background #EFF6FF):
- Heading "🤖 My Reasoning" in Inter Medium 18px
- 2-3 sentence explanation of shortlist criteria
- Confidence: "85% High Confidence" with progress bar (teal)
- "View detailed breakdown" link

Top 3 Candidates preview (compact cards):
Each card shows:
- Name, score (92/100), key strengths (✅ bullets), minor gaps (⚠️)
- "View full profile" link

Consequence message (amber background #FEF3C7, subtle):
"⚠️ Approving will trigger interview scheduling for all 12 candidates"

Action buttons (bottom, full-width):
- Primary "✅ Approve Shortlist" (deep blue, large, 48px height)
- Secondary "✏️ Modify Selection" (teal outline)
- Tertiary "❌ Reject & Review Manually" (gray outline)

Feel: respectful of Sarah's expertise, strategic language ("You've 
accelerated hiring by 68%"), collaborative tone, clear consequences.
```

---

### Screen 6: Interview Scheduling

**Goal:** Show scheduling status and allow management of interview coordination

**Key Elements:** Calendar view, upcoming interviews list, pending confirmations, conflict alerts

**Tone & Emotion:** Organized, efficient, in-control

**Prompt (≤250 words):**

```
Design an interview scheduling dashboard for HireFlow showing coordination 
status. Use clean, organized layout with toggle between calendar and list views.

Header:
- "Interview Scheduling" title in Inter Bold 24px
- Stats: "12 scheduled | 3 pending confirmation | 0 conflicts"
- View toggle: Calendar / List (active state with deep blue background)

List view (default):
Table showing upcoming interviews:
- Columns: Candidate, Role, Date/Time, Interviewer, Status, Actions
- Status badges:
  - "✅ Confirmed" (green)
  - "⏳ Pending" (amber)
  - "🤖 Auto-scheduled" (teal with icon)
- Each row has "Reschedule" and "Cancel" action links

Pending confirmations section (amber background card):
- "3 candidates awaiting confirmation"
- List with "Send reminder" button for each

Conflict alerts (if any, red background card):
- "⚠️ Scheduling conflict detected"
- Show details and "Propose alternative slots" button

Right sidebar:
- Mini calendar with interview dates highlighted in teal
- "Schedule new interview" button (deep blue)

Feel: organized, efficient, shows AI is handling coordination but Sarah 
stays in control. Use 🤖 icons to indicate automated actions. Calm colors, 
clear status indicators.
```

---

### Screen 7: Reasoning Logs

**Goal:** Provide full audit trail of all AI decisions for transparency

**Key Elements:** Searchable/filterable log table, timestamp, action type, reasoning preview

**Tone & Emotion:** Transparent, trustworthy, detailed

**Prompt (≤250 words):**

```
Design a reasoning logs screen for HireFlow showing audit trail of AI 
decisions. Use clean, data-dense layout with search and filters.

Header:
- "Reasoning Logs" title in Inter Bold 24px
- Search bar: "Search by candidate, role, or action"
- Filters: Date range, Action type (Parse/Evaluate/Schedule), Confidence level

Log table (full-width):
- Columns: Timestamp, Entity, Action, Reasoning Preview, Confidence, Status
- Each row shows:
  - Timestamp: "2 hours ago" in gray
  - Entity: "Rahul Sharma - Senior Backend Engineer" as link
  - Action: Badge with icon (🔍 Parse, ⚖️ Evaluate, 📅 Schedule)
  - Reasoning: First 50 chars with "..." and "View full" link
  - Confidence: Score badge (85%) with color coding
  - Status: ✅ Success or ❌ Failed

Expandable rows:
- Click row to expand full reasoning in light blue background
- Shows: Input data, Output data, Full reasoning text, Execution time
- Technical details in JetBrains Mono 13px (monospace)

Pagination at bottom: "Showing 1-50 of 1,247 logs"

Feel: transparent, trustworthy, detailed but not overwhelming. Sarah can 
audit any decision. Use subtle colors, clear typography hierarchy. 
Technical but accessible.
```

---

### Screen 8: Settings

**Goal:** Allow configuration of integrations, approval thresholds, automation behavior

**Key Elements:** Integration cards, approval settings, scheduling rules, notification preferences

**Tone & Emotion:** In-control, customizable, clear

**Prompt (≤250 words):**

```
Design a settings screen for HireFlow with clear configuration options. 
Use card-based layout with sections.

Header:
- "Settings" title in Inter Bold 24px
- Tabs: Integrations | Approvals | Scheduling | Notifications | Profile

Integrations section (active):
Two cards side-by-side:

1. Gmail Integration card:
   - Gmail icon with "Connected" green badge
   - Email: "sarah@company.com"
   - "Disconnect" button (gray outline)
   - Toggle: "Auto-ingest resumes from hr@company.com inbox"

2. Google Calendar Integration card:
   - Calendar icon with "Connected" green badge
   - "Disconnect" button
   - Toggle: "Auto-schedule interviews"

Approval Settings section:
- Heading "Human Approval Gates"
- Checkboxes with labels:
  - ✅ "Require approval before sending shortlist"
  - ✅ "Require approval before scheduling interviews"
  - ✅ "Require approval for bulk rejections (>50 candidates)"
- Slider: "Confidence threshold for auto-approval: 80%"

Scheduling Rules section:
- "Working hours: 9 AM - 6 PM" with edit button
- "Interview duration: 60 minutes" dropdown
- "Buffer time between interviews: 15 minutes" dropdown

Bottom: "Save Changes" button (deep blue, 48px height, disabled until 
changes made)

Feel: in-control, clear, organized. Sarah customizes AI behavior. Use 
toggle switches, clear labels, instant feedback on changes.
```

---

## Screen Flow (Navigation Logic)

### Primary User Flow

```
Login → Dashboard → [Click role card] → Role Detail → [Click candidate] → 
Candidate Profile → [Click "Approve"] → Approval Request Modal → 
[Click "Approve Shortlist"] → Success Toast → Interview Scheduling → 
Dashboard (with updated stats)
```

### Secondary Flows

```
Dashboard → [Click "Pending Approvals" card] → Approval Request
Dashboard → [Click "Calendar" in sidebar] → Interview Scheduling
Any screen → [Click "Logs" in sidebar] → Reasoning Logs
Any screen → [Click profile icon top-right] → Settings
```

### Dynamic Interactions

- **Modal popups:** Approval requests slide in from right with overlay
- **Hover states:** Candidate rows highlight with light blue background (#EFF6FF)
- **Loading animations:** Skeleton screens while AI processes resumes
- **Success feedback:** Toast notifications bottom-right, auto-dismiss in 5s
- **Expandable sections:** Reasoning logs expand inline with 300ms transition
- **Batch actions:** Multi-select candidates with checkboxes, bulk approve with confirmation

---

## Visual Priority (Key Actions per Screen)

| Screen | Primary Action | Visual Emphasis |
|--------|---------------|-----------------|
| **Login** | Sign in with email/password | Deep blue "Sign in" button, largest element |
| **Dashboard** | Review pending approvals | Amber badge on "Pending Approvals" card |
| **Role Detail** | Review shortlist | "Review Shortlist" button top-right, deep blue |
| **Candidate Profile** | Approve or reject candidate | "✅ Approve & Shortlist" button, full-width |
| **Approval Request** | Approve AI shortlist | "✅ Approve Shortlist" button, largest in modal |
| **Interview Scheduling** | Confirm pending interviews | Amber "Pending" section at top |
| **Reasoning Logs** | Search/filter logs | Search bar prominent at top |
| **Settings** | Connect integrations | Integration cards at top |

---

## Accessibility & Design Integrity

### Accessibility Requirements

- ✅ **Minimum font size:** 14px for body text, 16px for interactive elements
- ✅ **Contrast ratios:** WCAG AA compliant (4.5:1 minimum)
- ✅ **Keyboard navigation:** All interactive elements accessible via Tab, Enter, Esc
- ✅ **Focus indicators:** 3px deep blue outline on focused elements
- ✅ **Screen reader support:** Semantic HTML, ARIA labels, alt text for icons

### Friendly Microcopy Examples

- ❌ "No data" → ✅ "You're all caught up! No pending approvals."
- ❌ "Error" → ✅ "I couldn't parse this resume (scanned image). Want me to retry?"
- ❌ "Success" → ✅ "Nice! 12 interviews scheduled. You saved 9.5 hours this week."
- ❌ "Loading" → ✅ "Reviewing 287 resumes against your criteria..."
- ❌ "Empty state" → ✅ "Ready to start? Create your first role to begin screening."

### Visual Consistency Checklist

- ✅ **Primary CTA color:** Deep blue (#2563EB) across all screens
- ✅ **Button style:** 48px height, 16px horizontal padding, 8px border-radius
- ✅ **Card style:** White background, subtle shadow, 8px border-radius, 16-24px padding
- ✅ **Badge style:** 6px border-radius, 8px horizontal padding, Inter Medium 12px
- ✅ **Spacing system:** 4px base unit (4, 8, 12, 16, 24, 32, 48px)
- ✅ **Icon size:** 20px for inline icons, 24px for standalone icons

---

## Decision Log

| Decision Point | Options Considered | Decision Made | Rationale |
|----------------|-------------------|---------------|-----------|
| **Screen flow** | Linear wizard vs Hub-and-spoke vs Free navigation | **Hub-and-spoke (Dashboard center)** | Sarah jumps between roles, approvals, calendar frequently |
| **Information hierarchy** | Scores first vs Reasoning first vs Candidate name first | **Score + reasoning preview first** | Sarah needs quick triage |
| **Interaction pattern** | Swipe vs Tap vs Scroll | **Tap + scroll (web-first)** | Desktop is primary use case |
| **Error handling** | Red alerts vs Calm messaging vs Silent retry | **Calm messaging with retry options** | Reduces anxiety |
| **Navigation model** | Bottom nav vs Sidebar vs Top tabs | **Sidebar (persistent)** | Desktop-first; constant access |

---

## Deliverable Summary for PRD

*The prototype includes 8 core screens that represent the complete user flow from login to approval and scheduling. Each screen follows HireFlow's brand attributes (intelligent, trustworthy, strategic, efficient, calm), emphasizing transparency through visible AI reasoning, strategic language that elevates HR credibility, and calm visual design with muted blues/teals and generous whitespace. The design ensures simplicity and clarity, allowing users to complete key actions (approve shortlist, schedule interviews) in ≤3 clicks. Navigation follows a hub-and-spoke model with Dashboard as home base and persistent sidebar access to all sections.*

---

✅ **Key Takeaway:** The prototype should make Sarah feel like she has a calm, intelligent assistant working alongside her—relieved from chaos, confident in decisions, and strategically empowered to focus on what matters.
