# Lovable-Ready Front-End Generation Prompt - HireFlow

## Complete Build Instructions for Lovable AI

You are a Lovable AI builder that generates fully functional, user-ready front-end interfaces for MVP products. Build a complete UI for my product using the information below. The design must follow my brand, use intuitive navigation, and generate all screens in one build.

---

## Product Context

**Product Name:** HireFlow

**Product Description:** An agentic AI assistant that autonomously screens resumes, shortlists candidates with explainable reasoning, and auto-schedules interviews for lean HR teams—reducing early-stage hiring workload by 60-80%.

**Primary User Persona:** Sarah Verma, 32, Talent Acquisition Manager at a 70-person SaaS startup in Bengaluru who handles 300-500 resumes per role with minimal HR bandwidth—wants relief from manual screening (8-12 hours per role) and scheduling chaos (10-15 emails per slot) to feel more strategic, confident, and in control of hiring decisions.

**Core Problem Solved:** Manual resume screening and interview scheduling consume the majority of HR time (8-12 hours screening + 10-15 emails per interview slot), causing pipeline delays, decision fatigue, burnout, and the risk of missing great candidates—preventing HR from doing strategic work.

**Brand Tone:** Intelligent, Trustworthy, Strategic, Efficient, Calm — speaks like a strategic assistant that respects HR expertise, uses conversational yet professional language, celebrates strategic wins ("You've accelerated hiring by 68%"), and takes accountability for errors ("I couldn't parse this resume").

**Color Palette:**
- **Primary:** Deep blue (#2563EB) — trust, intelligence, professionalism
- **Secondary:** Soft teal (#14B8A6) — calm, supportive, modern
- **Success:** Muted green (#10B981) — positive reinforcement
- **Warning:** Warm amber (#F59E0B) — attention without alarm
- **Neutrals:** Cool grays (#F9FAFB to #1F2937) — clean, uncluttered
- **Background:** Off-white (#FAFAFA) — reduces eye strain during long sessions

**Font Style:**
- **Primary:** Inter (modern, sans-serif, highly legible)
  - Bold (28px H1, 24px H2, 18px H3) for headings
  - Regular (16px primary, 14px secondary) for body text
  - Medium (16px buttons, 14px labels, 32px large numbers) for emphasis
- **Technical:** JetBrains Mono (13px) for reasoning logs and code snippets

**UI Style:**
- **Layout:** Clean card-based design with generous whitespace (16-24px padding), subtle shadows (0 1px 3px rgba(0,0,0,0.1)), 8px border-radius, sticky headers for context
- **Components:** 48px button height, 6px badge radius, 20px inline icons, 24px standalone icons
- **Spacing:** 4px base unit system (4, 8, 12, 16, 24, 32, 48px)
- **Interactions:** Smooth 200-300ms transitions, slide-in modals from right, skeleton loading states (not spinners), subtle micro-animations (check marks, gentle pulses)
- **Accessibility:** WCAG AA compliant (4.5:1 contrast), full keyboard navigation, 3px deep blue focus indicators, semantic HTML with ARIA labels

---

## Front-End Screens to Generate

Please generate all the following screens in one go (each connected in a logical flow):

### 1. Login / Signup Page
- Centered card (max-width 400px) on off-white background
- HireFlow logo at top
- Heading "Welcome back" in Inter Bold 28px, deep blue
- Email and password input fields
- Primary CTA "Sign in" button (deep blue, 48px height)
- Google OAuth button with icon
- "New to HireFlow? Sign up" footer link

### 2. Dashboard (Overview)
- Sidebar navigation (240px width): Dashboard, Roles, Approvals, Calendar, Logs, Settings
- 3 summary cards: Active Roles (4), Pending Approvals (12 with amber badge), Time Saved (9.5 hours with teal)
- "Your Roles" table with columns: Role Title, Candidates, Shortlisted, Status, Last Updated
- 4-5 sample role rows with status badges
- "+ New Role" button (top right, deep blue)
- Encouragement text: "You're making great progress"

### 3. Role Detail Page
- Sticky header: Role title, JD summary, stats bar, "Review Shortlist" CTA
- Tab navigation: All (287) | Shortlisted (12) | Rejected (245) | Needs Review (30)
- Candidate table: Name, Score (0-100 badge), Skills Match, Experience, Status, Source, Date
- AI score badges color-coded: 80+ green, 70-79 teal, <70 amber
- "🤖 AI Reviewed" icon in teal
- Batch action buttons: "Approve Selected", "Reject Selected"
- Filter dropdown

### 4. Candidate Profile Page
- Two-column layout (60/40 split)
- Left: Name, AI Match Score (92/100 in teal circle), Confidence meter (85%)
- AI Reasoning card (light blue background): "Why I shortlisted", breakdown bars, strengths/gaps
- Action buttons: "✅ Approve & Shortlist" (primary), "❌ Reject" (secondary), "✏️ Add Note"
- Right sidebar: Resume preview, extracted profile (skills, experience, education)

### 5. Approval Request Modal
- Centered card (800px) on semi-transparent overlay
- Header: 🎯 icon, role name, stats, "You saved 9.5 hours" badge
- AI Reasoning section (light blue): explanation, confidence bar, "View breakdown" link
- Top 3 candidates preview cards with scores and strengths
- Consequence message (amber): "Approving will trigger interview scheduling"
- Actions: "✅ Approve Shortlist" (primary), "✏️ Modify", "❌ Reject"

### 6. Interview Scheduling Page
- Header: title, stats (12 scheduled, 3 pending), Calendar/List toggle
- Interview table: Candidate, Role, Date/Time, Interviewer, Status, Actions
- Status badges: "✅ Confirmed" (green), "⏳ Pending" (amber), "🤖 Auto-scheduled" (teal)
- Pending confirmations section (amber card) with "Send reminder" buttons
- Right sidebar: mini calendar, "Schedule new interview" button

### 7. Reasoning Logs Page
- Header: title, search bar, filters (date, action type, confidence)
- Log table: Timestamp, Entity, Action (with icon badges), Reasoning Preview, Confidence, Status
- Expandable rows showing full reasoning in light blue background
- Technical details in JetBrains Mono
- Pagination: "Showing 1-50 of 1,247 logs"

### 8. Settings Page
- Header with tabs: Integrations | Approvals | Scheduling | Notifications | Profile
- Integration cards: Gmail (connected badge, toggle), Google Calendar (connected badge, toggle)
- Approval Settings: checkboxes for approval gates, confidence threshold slider
- Scheduling Rules: working hours, duration, buffer time dropdowns
- "Save Changes" button (disabled until changes made)

---

## Design Style and Layout Instructions

**Layout:**
- Responsive web design (desktop-first, mobile-friendly)
- Sidebar navigation (240px) on left for main screens
- Main content area max-width 1200px, centered
- Off-white background (#FAFAFA) for main canvas
- White cards with subtle shadows for content sections

**Navigation:**
- Persistent sidebar with icons + labels
- Active state: deep blue background with white text
- Hover state: light blue background (#EFF6FF)
- Top bar with user profile icon and notifications bell

**Design Style:**
- Modern minimal with rounded corners (8px border-radius)
- Generous whitespace (16-24px padding in cards)
- Soft shadows (0 1px 3px rgba(0,0,0,0.1))
- Card-based layout for all content sections

**Primary Color:** Deep blue (#2563EB) for all CTAs, links, active states

**Secondary Color:** Soft teal (#14B8A6) for accents, AI indicators, success states

**Button Style:**
- Primary: Deep blue background, white text, 48px height, 16px padding, 8px radius
- Secondary: Teal outline, teal text
- Tertiary: Gray outline, gray text
- Hover: Darken by 10%

**Iconography:**
- Clean, flat icons from Lucide or Heroicons
- 20px for inline, 24px for standalone
- Use 🤖 emoji for AI indicators, ✅ for success, ⚠️ for warnings

**Typography:**
- Font family: Inter (sans-serif)
- H1: Inter Bold 28px
- H2: Inter Bold 24px
- H3: Inter Bold 18px
- Body primary: Inter Regular 16px
- Body secondary: Inter Regular 14px
- Button text: Inter Medium 16px
- Large numbers: Inter Bold 32px
- Technical text: JetBrains Mono 13px

**Alignment:**
- All text left-aligned
- Primary CTAs right-aligned in headers
- Center-aligned for modals and login screen

---

## Flow & Navigation Logic

**User Flow:**
1. User starts on **Login** → clicks "Sign in with Google" → lands on **Dashboard**
2. From **Dashboard**:
   - Click role card → **Role Detail Page**
   - Click "Pending Approvals" card → **Approval Request Modal**
   - Click "Calendar" in sidebar → **Interview Scheduling Page**
   - Click "Logs" in sidebar → **Reasoning Logs Page**
   - Click "Settings" in sidebar → **Settings Page**
3. From **Role Detail Page**:
   - Click candidate row → **Candidate Profile Page**
   - Click "Review Shortlist" → **Approval Request Modal**
4. From **Candidate Profile Page**:
   - Click "✅ Approve & Shortlist" → **Approval Request Modal**
5. From **Approval Request Modal**:
   - Click "✅ Approve Shortlist" → Success toast → **Interview Scheduling Page**
6. **Settings** accessible from sidebar at any time

**Transitions:**
- Smooth 200-300ms fade transitions between pages
- Modals slide in from right with semi-transparent overlay
- Toast notifications appear bottom-right, auto-dismiss in 5s
- Hover states with light blue background (#EFF6FF)

---

## Required Functionality (Front-End Logic Only)

**Buttons & Inputs:**
- All buttons interactive (clickable, show hover states)
- Input fields accept text (no validation yet)
- Dropdowns expand/collapse
- Toggles switch on/off visually

**Dashboard Cards:**
- Show sample data: "4 Active Roles", "12 Pending Approvals", "9.5 hours Time Saved"
- Role table shows 4-5 sample rows with dummy data

**Role Detail Page:**
- Candidate table shows 10-15 sample rows
- Tabs switch between All/Shortlisted/Rejected/Needs Review views
- Filter dropdown expands (no filtering logic yet)

**Candidate Profile:**
- Shows sample candidate data (name, email, score, reasoning)
- Progress bars for Skills/Experience/Education matches
- Buttons are clickable (no backend action yet)

**Approval Request Modal:**
- Shows sample shortlist data (12 candidates, top 3 previewed)
- Buttons close modal or show success toast

**Interview Scheduling:**
- Shows sample interview list (12 scheduled, 3 pending)
- Toggle between Calendar/List views (List view only for MVP)
- "Send reminder" buttons show success toast

**Reasoning Logs:**
- Shows sample log entries (20-30 rows)
- Search bar accepts text (no search logic yet)
- Expandable rows show full reasoning on click

**Settings:**
- Toggles switch on/off visually
- "Save Changes" button shows success toast
- Integration cards show "Connected" status

**(No backend logic yet — just front-end placeholders for next phase.)**

---

## Text & Microcopy Guidelines

**Tone:** Supportive, strategic, human, conversational yet professional

**Examples:**

**Success states:**
- "You're all caught up! No pending approvals."
- "Nice! 12 interviews scheduled. You've accelerated hiring by 68%."
- "Great progress! You saved 9.5 hours this week."

**Empty states:**
- "No active roles yet. Create your first role to begin screening."
- "You're all caught up! No pending approvals."
- "No interviews scheduled yet. Approve candidates to get started."

**Loading states:**
- "Reviewing 287 resumes against your criteria..."
- "Fetching your data — one moment..."
- "Processing shortlist..."

**Error states:**
- "I couldn't parse this resume (scanned image). Want me to retry or flag as manual?"
- "Something didn't go through — we'll fix it fast."
- "Couldn't connect to Gmail. Let's try reconnecting."

**Guidance text:**
- "Let's set up your first role. I'll handle screening while you focus on interviews."
- "Here's my reasoning for 12 suggested shortlists. Review and approve when ready."
- "Approving will trigger interview scheduling for all 12 candidates."

**Avoid robotic phrasing:**
- ❌ "Error 404" → ✅ "Page not found. Let's get you back on track."
- ❌ "Invalid Input" → ✅ "Hmm, that doesn't look right. Can you check and try again?"
- ❌ "Success" → ✅ "Nice! Your changes have been saved."

---

## Accessibility & Usability

- **Minimum font size:** 14px for body text, 16px for interactive elements
- **Button color contrast:** ≥ 4.5:1 (WCAG AA)
- **Consistent color for primary CTAs:** Deep blue (#2563EB) across all screens
- **Tab and keyboard navigation friendly:** All interactive elements accessible via Tab, Enter, Esc
- **Descriptive alt text for icons:** "Add new role", "AI reviewed", "Success", "Warning"
- **Focus indicators:** 3px deep blue (#2563EB) outline on focused elements
- **Semantic HTML:** Proper heading hierarchy, button elements, form labels

---

## Output Expectations

**Generate all screens in one prototype flow:**
- All 8 screens fully designed with interactive elements
- No placeholders like "screen 2 coming soon"
- Each screen follows brand guidelines consistently

**Include header navigation:**
- Sidebar with Dashboard, Roles, Approvals, Calendar, Logs, Settings
- Active state highlighting
- User profile icon top-right

**Apply all brand styles consistently:**
- Deep blue (#2563EB) for all primary CTAs
- Teal (#14B8A6) for AI indicators and accents
- Inter font family throughout
- 8px border-radius on all cards and buttons
- 16-24px padding in cards
- Subtle shadows (0 1px 3px rgba(0,0,0,0.1))

**Label sections clearly:**
- Each page has clear heading
- Cards have descriptive titles
- Buttons have clear labels

**Ensure interactive transitions:**
- Hover states on buttons and rows
- Modal slide-in animation
- Toast notifications for success/error
- Smooth page transitions

---

## PRD Summary (for Documentation)

*The Lovable front-end includes 8 screens covering login, dashboard, role detail, candidate profile, approval requests, interview scheduling, reasoning logs, and settings. The UI uses a calm, professional color palette (deep blue #2563EB, soft teal #14B8A6, muted neutrals) and Inter typography, emphasizing transparency through visible AI reasoning, strategic language that elevates HR credibility, and generous whitespace that reduces cognitive load. The navigation is seamless with persistent sidebar access, enabling key actions (approve shortlist, schedule interviews, review logs) within 3 clicks. The design follows principles of clarity over cleverness, transparent AI, and strategic control—making Sarah feel relieved from operational burden, confident in data-backed decisions, and strategically empowered.*

---

💡 **Key Takeaway:** The user should feel like they have a calm, intelligent assistant working alongside them—relieved from chaos, confident in decisions, and strategically empowered to focus on what matters.

---

## Build Checklist for Lovable

- [ ] All 8 screens generated with full UI
- [ ] Sidebar navigation with active states
- [ ] Deep blue (#2563EB) primary CTAs consistently applied
- [ ] Inter font family used throughout
- [ ] Card-based layouts with 8px border-radius and subtle shadows
- [ ] Sample data placeholders in all tables and cards
- [ ] Interactive buttons with hover states
- [ ] Modal slide-in animations
- [ ] Toast notifications for success states
- [ ] Responsive layout (desktop-first, mobile-friendly)
- [ ] WCAG AA contrast compliance
- [ ] Keyboard navigation support
- [ ] Semantic HTML with proper headings
- [ ] Microcopy follows supportive, strategic tone
- [ ] Empty states with encouraging messages
- [ ] Loading states with skeleton screens
- [ ] All screens connected in logical flow

---

**(This prompt is complete, buildable, and executable in Lovable in one go — no user follow-up required.)**
