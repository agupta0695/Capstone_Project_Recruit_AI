# 🔄 HireFlow Application Flow

## Complete User Journey with Technical Details

---

## 📱 Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │Dashboard │  │  Roles   │  │Candidates│   │
│  │  Pages   │  │   Page   │  │  Pages   │  │  Pages   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/JWT
┌─────────────────────────────────────────────────────────────┐
│                    API ROUTES (Next.js)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │Dashboard │  │  Roles   │  │ Resumes  │   │
│  │   API    │  │   API    │  │   API    │  │   API    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ Prisma ORM
┌─────────────────────────────────────────────────────────────┐
│              DATABASE (Supabase PostgreSQL)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Users   │  │  Roles   │  │Candidates│  │ Settings │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Flow 1: User Registration & Authentication

### Step 1: Sign Up
```
User → /auth/signup (Page)
  ↓
Fills form: Name, Email, Company, Password
  ↓
Submit → POST /api/auth/signup (API)
  ↓
API validates input
  ↓
Check if user exists (Prisma query)
  ↓
Hash password (bcrypt, 10 rounds)
  ↓
Create User record in database
  ↓
Create UserSettings record (defaults)
  ↓
Generate JWT token (7-day expiry)
  ↓
Return: { token, user: { id, name, email, company } }
  ↓
Store token in localStorage
  ↓
Redirect → /dashboard
```

**Files Involved**:
- `app/auth/signup/page.tsx` - UI form
- `app/api/auth/signup/route.ts` - API logic
- `prisma/schema.prisma` - User & UserSettings models

**Database Changes**:
```sql
INSERT INTO users (id, name, email, company, password, role)
VALUES (uuid, 'Sarah', 'sarah@example.com', 'TechCo', '$2b$10$...', 'hr_user');

INSERT INTO user_settings (id, userId, requireShortlistApproval, ...)
VALUES (uuid, user_id, true, ...);
```

---

### Step 2: Sign In
```
User → /auth/login (Page)
  ↓
Enters: Email, Password
  ↓
Submit → POST /api/auth/login (API)
  ↓
Find user by email (Prisma query)
  ↓
Verify password (bcrypt.compare)
  ↓
Generate JWT token
  ↓
Return: { token, user }
  ↓
Store token in localStorage
  ↓
Redirect → /dashboard
```

**Files Involved**:
- `app/auth/login/page.tsx` - Login form
- `app/api/auth/login/route.ts` - Authentication logic

**Security**:
- Password never stored in plain text
- JWT signed with NEXTAUTH_SECRET
- Token includes: userId, email, expiry

---

## 📊 Flow 2: Dashboard Access

### Step 3: View Dashboard
```
User → /dashboard (Page)
  ↓
useEffect runs on mount
  ↓
Check localStorage for token
  ↓
If no token → Redirect to /auth/login
  ↓
If token exists → GET /api/dashboard (API)
  ↓
API: Verify JWT token
  ↓
Extract userId from token
  ↓
Fetch user data (Prisma)
  ↓
Fetch all roles for user (Prisma)
  ↓
Calculate statistics:
  - activeRoles = count(status='active')
  - pendingApprovals = sum(shortlisted)
  - timeSaved = (totalCandidates / 100) × 2 hrs
  ↓
Return: { user, stats, roles }
  ↓
Display dashboard with:
  - 3 stat cards
  - Role table
  - "New Role" button
```

**Files Involved**:
- `app/dashboard/page.tsx` - Dashboard UI
- `app/api/dashboard/route.ts` - Dashboard data API

**Database Queries**:
```sql
-- Get user
SELECT id, name, email, company FROM users WHERE id = $userId;

-- Get roles
SELECT id, title, department, status, totalCandidates, shortlisted, createdAt
FROM roles WHERE userId = $userId ORDER BY createdAt DESC;
```

---

## 🎯 Flow 3: Create Job Role

### Step 4: Create New Role
```
User clicks "New Role" button
  ↓
Navigate → /dashboard/roles/new (Page)
  ↓
Display form with fields:
  - Job Title (text)
  - Department (text)
  - Description (textarea)
  - Required Skills (comma-separated)
  - Experience Level (dropdown)
  - Education Level (dropdown)
  ↓
User fills form and submits
  ↓
Parse skills: "React, TypeScript, Node.js" → ["React", "TypeScript", "Node.js"]
  ↓
POST /api/roles (API)
  ↓
API: Verify JWT token
  ↓
Create role with evaluationCriteria:
  {
    requiredSkills: ["React", "TypeScript", "Node.js"],
    experienceLevel: "Senior",
    educationLevel: "Bachelor's"
  }
  ↓
Initialize counters:
  totalCandidates: 0
  screened: 0
  shortlisted: 0
  interviewed: 0
  rejected: 0
  ↓
Save to database (Prisma)
  ↓
Return: { id, title, ... }
  ↓
Redirect → /dashboard/roles/[id]
```

**Files Involved**:
- `app/dashboard/roles/new/page.tsx` - Role creation form
- `app/api/roles/route.ts` - POST endpoint

**Database Changes**:
```sql
INSERT INTO roles (
  id, userId, title, department, description,
  evaluationCriteria, status,
  totalCandidates, screened, shortlisted, interviewed, rejected
)
VALUES (
  uuid, user_id, 'Senior Frontend Developer', 'Engineering', '...',
  '{"requiredSkills":["React","TypeScript","Node.js"],...}', 'active',
  0, 0, 0, 0, 0
);
```

---

## 👁️ Flow 4: View Role Details

### Step 5: Select Role from Dashboard
```
User clicks on role row in dashboard
  ↓
onClick → router.push(`/dashboard/roles/${role.id}`)
  ↓
Navigate → /dashboard/roles/[id] (Page)
  ↓
useEffect runs with params.id
  ↓
GET /api/roles/[id] (API)
  ↓
API: Verify JWT token
  ↓
Fetch role with candidates (Prisma):
  - Include all candidates
  - Order by createdAt DESC
  ↓
Verify user ownership (role.userId === token.userId)
  ↓
Return: { id, title, evaluationCriteria, candidates, ... }
  ↓
Display role detail page:
  - Title & Department
  - 4 stat cards (Total, Screened, Shortlisted, Skills)
  - Upload button
  - Filter tabs (All, Shortlisted, Review, Rejected)
  - Candidate list
```

**Files Involved**:
- `app/dashboard/roles/[id]/page.tsx` - Role detail UI
- `app/api/roles/[id]/route.ts` - GET endpoint

**Database Query**:
```sql
SELECT r.*, c.*
FROM roles r
LEFT JOIN candidates c ON c.roleId = r.id
WHERE r.id = $roleId
ORDER BY c.createdAt DESC;
```

---

## 📄 Flow 5: Resume Upload & Processing

### Step 6: Upload Resumes
```
User clicks "Upload Resumes" button
  ↓
File input opens (accept=".pdf,.doc,.docx,.txt")
  ↓
User selects one or more files
  ↓
onChange event fires
  ↓
Create FormData:
  - formData.append('roleId', roleId)
  - formData.append('files', file1)
  - formData.append('files', file2)
  - ...
  ↓
POST /api/resumes/upload (API)
  ↓
API: Verify JWT token
  ↓
Parse FormData:
  - Extract files array
  - Extract roleId
  ↓
Validate inputs (files exist, roleId exists)
  ↓
Fetch role from database
  ↓
Verify user ownership
  ↓
Extract requiredSkills from evaluationCriteria
  ↓
FOR EACH FILE:
  ├─ Extract text (file.text())
  ├─ Parse resume:
  │  ├─ Name: First line
  │  ├─ Email: Regex /[\w.-]+@[\w.-]+\.\w+/
  │  ├─ Phone: Regex /[\d\s()+-]{10,}/
  │  └─ Skills: Keyword matching (javascript, react, python, etc.)
  ├─ Evaluate candidate:
  │  ├─ Match skills (case-insensitive)
  │  ├─ Calculate score: (matched / required) × 100
  │  └─ Auto-categorize:
  │     - Score ≥ 70 → Shortlisted
  │     - Score 50-69 → Review
  │     - Score < 50 → Rejected
  ├─ Create candidate record:
  │  ├─ profile: { name, email, phone, skills, resumeUrl }
  │  ├─ evaluation: { score, matchedSkills, reasoning }
  │  └─ status: Shortlisted/Review/Rejected
  └─ Log to console
  ↓
Update role statistics:
  - totalCandidates += files.length
  - screened += files.length
  - shortlisted += count(status='Shortlisted')
  ↓
Return: { success: true, processed: count, candidates: [...] }
  ↓
Show alert: "Successfully processed X resume(s)"
  ↓
Refresh page (fetchRole())
  ↓
Display candidates in list
```

**Files Involved**:
- `app/dashboard/roles/[id]/page.tsx` - Upload button & handler
- `app/api/resumes/upload/route.ts` - Upload processing

**Detailed Processing Example**:
```javascript
// Input: test-resume.txt
John Doe
Software Engineer

Email: john.doe@example.com
Phone: +91-9876543210

SKILLS
- JavaScript
- React
- Node.js
- TypeScript

// Parsing Result:
{
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+91-9876543210",
  skills: ["Javascript", "React", "Node", "Typescript"]
}

// Required Skills: ["React", "TypeScript", "Node.js", "JavaScript"]
// Matched: 4/4
// Score: 100
// Status: Shortlisted
```

**Database Changes**:
```sql
-- Create candidate
INSERT INTO candidates (
  id, roleId, profile, evaluation, status, source, appliedAt
)
VALUES (
  uuid, role_id,
  '{"name":"John Doe","email":"john@example.com","skills":["React","Node"]}',
  '{"score":100,"matchedSkills":["React","Node"],"reasoning":"Matched 4 skills"}',
  'Shortlisted', 'upload', NOW()
);

-- Update role stats
UPDATE roles
SET totalCandidates = totalCandidates + 1,
    screened = screened + 1,
    shortlisted = shortlisted + 1
WHERE id = role_id;
```

---

## 👤 Flow 6: View Candidate Details

### Step 7: Review Candidate
```
User clicks on candidate in list
  ↓
Navigate → /dashboard/candidates/[id] (Page)
  ↓
GET /api/candidates/[id] (API)
  ↓
API: Verify JWT token
  ↓
Fetch candidate with role (Prisma)
  ↓
Return: { id, profile, evaluation, status, role }
  ↓
Display candidate detail:
  - Name (from profile.name)
  - Email (from profile.email)
  - Phone (from profile.phone)
  - AI Score (from evaluation.score)
  - Skills with color coding:
    * Green = matched required skill
    * Gray = additional skill
  - AI Reasoning (from evaluation.reasoning)
  - Status badge
  - Override buttons (Shortlist, Review, Reject)
```

**Files Involved**:
- `app/dashboard/candidates/[id]/page.tsx` - Candidate detail UI
- `app/api/candidates/[id]/route.ts` - GET endpoint

---

### Step 8: Override AI Decision
```
User clicks "Review" button (or Shortlist/Reject)
  ↓
PATCH /api/candidates/[id] (API)
  ↓
API: Verify JWT token
  ↓
Update candidate status (Prisma)
  ↓
Return: { id, status, ... }
  ↓
Refresh candidate data
  ↓
Display updated status badge
```

**Database Changes**:
```sql
UPDATE candidates
SET status = 'Review',
    overridden = true,
    updatedAt = NOW()
WHERE id = candidate_id;
```

---

## 🔄 Flow 7: Filter Candidates

### Step 9: Filter by Status
```
User clicks "Shortlisted" tab
  ↓
setFilter('Shortlisted')
  ↓
filteredCandidates = candidates.filter(c => c.status === 'Shortlisted')
  ↓
Re-render candidate list with filtered results
```

**No API call needed** - filtering happens client-side

---

## 🔐 Security Flow

### JWT Token Lifecycle
```
1. GENERATION (Login/Signup)
   ↓
   jwt.sign({ userId, email }, SECRET, { expiresIn: '7d' })
   ↓
   Token stored in localStorage

2. USAGE (Every API call)
   ↓
   headers: { 'Authorization': `Bearer ${token}` }
   ↓
   API extracts token from header
   ↓
   jwt.verify(token, SECRET)
   ↓
   If valid: Extract userId, proceed
   ↓
   If invalid: Return 401 Unauthorized

3. EXPIRATION (After 7 days)
   ↓
   Token verification fails
   ↓
   User redirected to login
```

---

## 📊 Data Flow Summary

```
┌──────────────┐
│   Browser    │
│ (localStorage)│
│   stores JWT  │
└──────┬───────┘
       │
       ↓ Every request includes JWT
┌──────────────┐
│  API Routes  │
│ Verify token │
│ Extract user │
└──────┬───────┘
       │
       ↓ Prisma queries
┌──────────────┐
│  PostgreSQL  │
│   Database   │
│  (Supabase)  │
└──────────────┘
```

---

## 🎯 Key Features Flow

### Real-time Statistics Update
```
Upload Resume → Create Candidate → Update Role Stats → Refresh Dashboard
```

### Skill Matching Algorithm
```
Resume Skills: ["React", "Python", "Node"]
Required Skills: ["React", "TypeScript", "Node.js"]

Matching:
- "React" matches "React" ✅
- "Node" matches "Node.js" ✅ (case-insensitive)
- "Python" no match ❌
- "TypeScript" not in resume ❌

Score: 2/3 = 66.67 → 67
Status: Review (50-69 range)
```

### Auto-Categorization Logic
```
if (score >= 70) → Shortlisted (Green)
else if (score >= 50) → Review (Yellow)
else → Rejected (Red)
```

---

## 📁 Complete File Structure

```
app/
├── auth/
│   ├── login/page.tsx          → Login form
│   └── signup/page.tsx         → Signup form
├── dashboard/
│   ├── page.tsx                → Dashboard with stats & roles
│   ├── roles/
│   │   ├── new/page.tsx        → Create role form
│   │   └── [id]/page.tsx       → Role detail & upload
│   └── candidates/
│       └── [id]/page.tsx       → Candidate detail
├── api/
│   ├── auth/
│   │   ├── login/route.ts      → POST: Authenticate user
│   │   └── signup/route.ts     → POST: Create user
│   ├── dashboard/route.ts      → GET: Dashboard data
│   ├── roles/
│   │   ├── route.ts            → POST: Create role, GET: List roles
│   │   └── [id]/route.ts       → GET: Role detail
│   ├── resumes/
│   │   └── upload/route.ts     → POST: Upload & process resumes
│   └── candidates/
│       └── [id]/route.ts       → GET: Candidate, PATCH: Update status
├── layout.tsx                  → Root layout
├── page.tsx                    → Landing page
└── globals.css                 → Styles

prisma/
└── schema.prisma               → Database models

lib/
├── prisma.ts                   → Prisma client
└── ai/types.ts                 → TypeScript types
```

---

## 🚦 Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful GET/PATCH |
| 201 | Created | Successful POST (role/user created) |
| 400 | Bad Request | Missing fields, validation error |
| 401 | Unauthorized | Invalid/missing JWT token |
| 404 | Not Found | Role/candidate doesn't exist |
| 500 | Server Error | Database error, unexpected error |

---

## 🎉 Complete User Journey Example

```
1. Sarah visits http://localhost:3000
2. Clicks "Sign Up"
3. Creates account: sarah@techco.com
4. Redirected to dashboard (empty)
5. Clicks "New Role"
6. Creates "Senior Frontend Developer" role
   - Skills: React, TypeScript, Node.js
7. Redirected to role detail page
8. Clicks "Upload Resumes"
9. Selects 3 resume files
10. System processes:
    - John Doe: 100 score → Shortlisted
    - Jane Smith: 67 score → Review
    - Bob Wilson: 33 score → Rejected
11. Sees 3 candidates in list
12. Clicks "Shortlisted" tab → Shows John Doe
13. Clicks on John Doe
14. Reviews profile and AI reasoning
15. Clicks "Review" to override
16. Returns to dashboard
17. Sees stats: 1 Active Role, 1 Pending Approval
```

---

**Total Flow Time**: ~2-3 minutes from signup to first candidate review! 🚀
