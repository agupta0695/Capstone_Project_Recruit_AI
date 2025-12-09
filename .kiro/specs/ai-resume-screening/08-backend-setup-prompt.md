# HireFlow - Backend + Authentication Setup (Supabase)

## Complete Backend Architecture Prompt

You are an AI product engineer helping me create a working backend using Supabase and Gmail-based authentication that connects to my Lovable-generated front end. Build everything as a single setup that can be deployed immediately — including tables, relationships, and API routes.

---

## Context

**Product:** HireFlow — An agentic AI assistant that autonomously screens resumes, shortlists candidates with explainable reasoning, and auto-schedules interviews for lean HR teams—reducing early-stage hiring workload by 60-80%.

**Core Features:**
1. **Resume Parsing & Screening** - Parse PDF/DOCX resumes, extract structured data, evaluate against JD
2. **AI Candidate Evaluation** - Score candidates (0-100), generate explainable reasoning, create shortlists
3. **Human Approval Workflow** - Present AI recommendations, request approval, log decisions
4. **Interview Scheduling** - Auto-coordinate calendar slots, send invites, handle confirmations
5. **Reasoning Logs & Audit Trail** - Store all AI decisions with timestamps, reasoning, confidence scores

**Primary User:** Sarah Verma, 32, Talent Acquisition Manager at 70-person SaaS startup in Bengaluru who handles 300-500 resumes per role with minimal HR bandwidth.

**Authentication Method:** Gmail login (OAuth via Supabase Auth)

**Tech Stack:** 
- Supabase (backend + DB + auth + storage)
- Lovable/React front end
- OpenAI GPT-4 (for resume parsing, evaluation, reasoning)
- Gmail API (email ingestion)
- Google Calendar API (interview scheduling)

---


## 🧩 1️⃣ Setup Overview

Create the following system structure using Supabase:

### Authentication
1. Use built-in **Supabase Auth with Google OAuth** (no passwords)
2. Store user profile info in a `users` table linked to `auth.users.id`
3. Enable email verification for extra security
4. Maintain session tokens on client (secure, httpOnly cookies)

### Database Tables

| Table | Key Columns | Relationships | Purpose |
|-------|-------------|---------------|---------|
| **users** | id, email, name, company_id, role, created_at | Primary key, references auth.users | Store Gmail-authenticated users |
| **companies** | id, name, domain, settings (JSONB), created_at | Primary key | Multi-tenant workspace isolation |
| **roles** | id, company_id, title, jd_text, jd_parsed (JSONB), status, priority, created_at | company_id → companies.id | Job descriptions and hiring roles |
| **candidates** | id, role_id, name, email, phone, resume_url, resume_parsed (JSONB), source, status, created_at | role_id → roles.id | Candidate profiles and resumes |
| **evaluations** | id, candidate_id, role_id, match_score, reasoning, breakdown (JSONB), confidence, decision, agent_version, created_at | candidate_id → candidates.id, role_id → roles.id | AI evaluation results |
| **interviews** | id, candidate_id, role_id, interviewer_id, scheduled_at, duration_minutes, calendar_event_id, status, meeting_link, created_at | candidate_id → candidates.id, interviewer_id → users.id | Interview scheduling data |
| **approvals** | id, type, entity_id, requested_by, approved_by, status, agent_reasoning, user_comment, original_data (JSONB), modified_data (JSONB), created_at | approved_by → users.id | Human approval workflow |
| **reasoning_logs** | id, entity_type, entity_id, action, input_data (JSONB), output_data (JSONB), reasoning, confidence, tool_name, execution_time_ms, success, error_message, created_at | N/A | Audit trail of all agent actions |
| **emails** | id, candidate_id, direction, subject, body, gmail_message_id, attachments (JSONB), processed, created_at | candidate_id → candidates.id | Email communication history |

### Storage Buckets
- **resumes** - Private bucket for PDF/DOCX resume files
- **company-assets** - Private bucket for company logos, JD templates

---


## 🔑 2️⃣ Authentication & Access Flow

### Login Flow
1. User clicks "Sign in with Google" on login page
2. Supabase Auth redirects to Google OAuth consent screen
3. User grants Gmail + Calendar permissions
4. Google returns auth code to Supabase
5. Supabase creates session token (JWT) and user record
6. Client stores session token in secure cookie
7. Redirect to Dashboard

### Session Management
- **Token Storage:** Secure, httpOnly cookies (not localStorage)
- **Token Expiry:** 7 days (configurable)
- **Refresh:** Automatic token refresh before expiry
- **Validation:** Every API call validates token via Supabase Auth

### Access Control (Row-Level Security)
- Each query filters by `company_id` to prevent cross-company data access
- Users can only see data for their company
- RLS policies enforce this at database level

### Logout Flow
1. User clicks "Sign out"
2. Client calls Supabase `signOut()`
3. Session token invalidated
4. Redirect to login page

**Example Flow:**
```
Login with Google → Auth token → Fetch Dashboard → Load roles for user's company_id
```

---


## 🧠 3️⃣ API Endpoints (Supabase Edge Functions + REST)

Create the following REST endpoints via Supabase Edge Functions or standard APIs:

### Authentication Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/auth/google` | GET | Initiate Google OAuth flow | ❌ |
| `/auth/callback` | GET | Handle OAuth callback | ❌ |
| `/auth/logout` | POST | Sign out user | ✅ |
| `/auth/session` | GET | Get current session | ✅ |

### Role Management Endpoints

| Endpoint | Method | Description | Connected Table | Auth Required |
|----------|--------|-------------|-----------------|---------------|
| `/api/roles` | GET | Fetch all roles for company | roles | ✅ |
| `/api/roles` | POST | Create new role with JD | roles | ✅ |
| `/api/roles/:id` | GET | Get single role details | roles | ✅ |
| `/api/roles/:id` | PUT | Update role (JD, status) | roles | ✅ |
| `/api/roles/:id` | DELETE | Delete role | roles | ✅ |

### Candidate Management Endpoints

| Endpoint | Method | Description | Connected Table | Auth Required |
|----------|--------|-------------|-----------------|---------------|
| `/api/candidates` | GET | Fetch candidates (filter by role_id, status) | candidates | ✅ |
| `/api/candidates` | POST | Upload resume, trigger parsing | candidates | ✅ |
| `/api/candidates/:id` | GET | Get candidate profile + evaluation | candidates, evaluations | ✅ |
| `/api/candidates/:id/status` | PUT | Update candidate status | candidates | ✅ |

### Evaluation Endpoints

| Endpoint | Method | Description | Connected Table | Auth Required |
|----------|--------|-------------|-----------------|---------------|
| `/api/evaluations/:candidate_id` | GET | Get evaluation for candidate | evaluations | ✅ |
| `/api/evaluations/batch` | POST | Trigger batch evaluation for role | evaluations | ✅ |

### Approval Endpoints

| Endpoint | Method | Description | Connected Table | Auth Required |
|----------|--------|-------------|-----------------|---------------|
| `/api/approvals` | GET | Fetch pending approvals | approvals | ✅ |
| `/api/approvals/:id` | PUT | Approve/reject/modify decision | approvals | ✅ |

### Interview Scheduling Endpoints

| Endpoint | Method | Description | Connected Table | Auth Required |
|----------|--------|-------------|-----------------|---------------|
| `/api/interviews` | GET | Fetch scheduled interviews | interviews | ✅ |
| `/api/interviews` | POST | Schedule interview (auto-coordinate) | interviews | ✅ |
| `/api/interviews/:id` | PUT | Reschedule or cancel interview | interviews | ✅ |
| `/api/interviews/:id/confirm` | POST | Confirm interview attendance | interviews | ✅ |

### Reasoning Logs Endpoints

| Endpoint | Method | Description | Connected Table | Auth Required |
|----------|--------|-------------|-----------------|---------------|
| `/api/logs` | GET | Fetch reasoning logs (filter by entity, action, date) | reasoning_logs | ✅ |
| `/api/logs/:id` | GET | Get detailed log entry | reasoning_logs | ✅ |

### Settings Endpoints

| Endpoint | Method | Description | Connected Table | Auth Required |
|----------|--------|-------------|-----------------|---------------|
| `/api/settings` | GET | Fetch user/company settings | companies | ✅ |
| `/api/settings` | PUT | Update settings (approval thresholds, scheduling rules) | companies | ✅ |

### File Upload Endpoints

| Endpoint | Method | Description | Storage Bucket | Auth Required |
|----------|--------|-------------|----------------|---------------|
| `/api/upload/resume` | POST | Upload resume file (PDF/DOCX) | resumes | ✅ |
| `/api/upload/jd` | POST | Upload JD file | company-assets | ✅ |

---


## 📧 4️⃣ Integration with Gmail & Google Calendar APIs

### Gmail API Integration (Resume Ingestion)

**Purpose:** Auto-ingest resumes from hr@company.com inbox

**Setup:**
1. Enable Gmail API in Google Cloud Console
2. Configure OAuth scopes: `gmail.readonly`, `gmail.send`
3. Store OAuth tokens in Supabase (encrypted)
4. Set up webhook or polling (every 5 minutes) to check for new emails

**Function: `ingestResumesFromGmail()`**
```typescript
// Pseudo-code
async function ingestResumesFromGmail(userId: string) {
  // 1. Fetch emails with label "Resumes" or from specific address
  const emails = await gmailAPI.listMessages({
    userId: 'me',
    q: 'label:resumes has:attachment'
  });
  
  // 2. For each email with PDF/DOCX attachment
  for (const email of emails) {
    const attachments = await gmailAPI.getAttachments(email.id);
    
    // 3. Upload to Supabase Storage
    const resumeUrl = await supabase.storage
      .from('resumes')
      .upload(`${userId}/${filename}`, file);
    
    // 4. Create candidate record
    await supabase.from('candidates').insert({
      role_id: roleId,
      email: extractedEmail,
      resume_url: resumeUrl,
      source: 'email'
    });
    
    // 5. Trigger AI parsing
    await triggerResumeParsingAgent(candidateId);
  }
}
```

**Trigger:** Scheduled Edge Function (runs every 5 minutes) or webhook from Gmail

---

### Google Calendar API Integration (Interview Scheduling)

**Purpose:** Auto-schedule interviews, find available slots, send invites

**Setup:**
1. Enable Google Calendar API in Google Cloud Console
2. Configure OAuth scopes: `calendar.readonly`, `calendar.events`
3. Store OAuth tokens in Supabase (encrypted)

**Function: `scheduleInterview()`**
```typescript
// Pseudo-code
async function scheduleInterview(
  candidateId: string,
  interviewerId: string,
  duration: number = 60
) {
  // 1. Get interviewer's calendar
  const calendar = await calendarAPI.getCalendar(interviewerId);
  
  // 2. Find available slots (next 7 days, working hours 9-6)
  const availableSlots = await calendarAPI.freebusy.query({
    timeMin: new Date(),
    timeMax: addDays(new Date(), 7),
    items: [{ id: calendar.id }]
  });
  
  // 3. Propose first available slot
  const slot = availableSlots[0];
  
  // 4. Create calendar event
  const event = await calendarAPI.events.insert({
    calendarId: calendar.id,
    summary: `Interview: ${candidateName}`,
    start: { dateTime: slot.start },
    end: { dateTime: slot.end },
    attendees: [
      { email: candidateEmail },
      { email: interviewerEmail }
    ],
    conferenceData: {
      createRequest: { requestId: uuid() } // Auto-generate Meet link
    }
  });
  
  // 5. Store in database
  await supabase.from('interviews').insert({
    candidate_id: candidateId,
    interviewer_id: interviewerId,
    scheduled_at: slot.start,
    calendar_event_id: event.id,
    meeting_link: event.hangoutLink,
    status: 'confirmed'
  });
  
  // 6. Send confirmation email
  await sendEmail(candidateEmail, 'Interview Scheduled', emailTemplate);
}
```

**Trigger:** After approval of shortlist, or manual scheduling request

---


## 🤖 5️⃣ AI Agent Integration (OpenAI GPT-4)

### Resume Parsing Agent

**Purpose:** Extract structured data from PDF/DOCX resumes

**OpenAI Prompt:**
```
You are a resume parser. Extract the following information from this resume:
- Full name
- Email address
- Phone number
- Skills (array of strings)
- Work experience (array of objects with: company, title, duration_months, description)
- Education (array of objects with: degree, institution, year)
- Summary (2-3 sentence overview)

Return as JSON. If information is missing, use null.
```

**Function: `parseResume()`**
```typescript
async function parseResume(resumeText: string): Promise<CandidateProfile> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: resumeParserPrompt },
      { role: 'user', content: resumeText }
    ],
    response_format: { type: 'json_object' }
  });
  
  const parsed = JSON.parse(response.choices[0].message.content);
  
  // Store in database
  await supabase.from('candidates').update({
    resume_parsed: parsed
  }).eq('id', candidateId);
  
  return parsed;
}
```

---

### Candidate Evaluation Agent

**Purpose:** Score candidate against JD requirements with explainable reasoning

**OpenAI Prompt:**
```
You are an expert recruiter evaluating candidates. Compare this candidate profile against the job requirements and provide:

1. Match score (0-100)
2. Reasoning (2-3 sentences explaining the score)
3. Breakdown scores:
   - Skills match (0-100)
   - Experience match (0-100)
   - Education match (0-100)
4. Strengths (array of strings)
5. Gaps (array of strings)
6. Confidence (0-100, how confident you are in this evaluation)

Candidate Profile:
{candidateProfile}

Job Requirements:
{jobRequirements}

Return as JSON.
```

**Function: `evaluateCandidate()`**
```typescript
async function evaluateCandidate(
  candidateId: string,
  roleId: string
): Promise<Evaluation> {
  // 1. Fetch candidate profile and JD
  const candidate = await supabase.from('candidates')
    .select('resume_parsed').eq('id', candidateId).single();
  const role = await supabase.from('roles')
    .select('jd_parsed').eq('id', roleId).single();
  
  // 2. Call OpenAI
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: evaluationPrompt },
      { role: 'user', content: JSON.stringify({
        candidateProfile: candidate.resume_parsed,
        jobRequirements: role.jd_parsed
      })}
    ],
    response_format: { type: 'json_object' }
  });
  
  const evaluation = JSON.parse(response.choices[0].message.content);
  
  // 3. Store evaluation
  await supabase.from('evaluations').insert({
    candidate_id: candidateId,
    role_id: roleId,
    match_score: evaluation.match_score,
    reasoning: evaluation.reasoning,
    breakdown: evaluation.breakdown,
    confidence: evaluation.confidence,
    agent_version: 'gpt-4-2024'
  });
  
  // 4. Log reasoning
  await logReasoning('candidate', candidateId, 'evaluate', 
    { candidate, role }, evaluation, evaluation.confidence);
  
  return evaluation;
}
```

---

### Decision Agent

**Purpose:** Decide whether to shortlist, maybe, or reject based on threshold

**Function: `decideAction()`**
```typescript
async function decideAction(
  evaluationId: string,
  threshold: number = 70
): Promise<Decision> {
  const evaluation = await supabase.from('evaluations')
    .select('*').eq('id', evaluationId).single();
  
  let decision: 'shortlist' | 'maybe' | 'reject';
  let requiresApproval = false;
  
  if (evaluation.match_score >= 80) {
    decision = 'shortlist';
    requiresApproval = evaluation.confidence < 70; // Low confidence = require approval
  } else if (evaluation.match_score >= threshold) {
    decision = 'maybe';
    requiresApproval = true; // Always require approval for "maybe"
  } else {
    decision = 'reject';
    requiresApproval = false; // Auto-reject low scores
  }
  
  // Update candidate status
  await supabase.from('candidates').update({
    status: decision
  }).eq('id', evaluation.candidate_id);
  
  // Create approval request if needed
  if (requiresApproval) {
    await supabase.from('approvals').insert({
      type: 'shortlist',
      entity_id: evaluation.candidate_id,
      requested_by: 'agent',
      status: 'pending',
      agent_reasoning: evaluation.reasoning
    });
  }
  
  return { decision, requiresApproval };
}
```

---


## ⚙️ 6️⃣ Supabase Table Definitions (SQL)

Use this structure when setting up your tables in Supabase SQL Editor:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS (extends auth.users)
create table public.users (
  id uuid references auth.users primary key,
  email text unique not null,
  name text,
  company_id uuid references public.companies(id),
  role text default 'recruiter', -- 'admin', 'recruiter', 'hiring_manager'
  created_at timestamp with time zone default now()
);

-- COMPANIES
create table public.companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  domain text,
  settings jsonb default '{
    "approval_threshold": 70,
    "auto_schedule": true,
    "working_hours": {"start": "09:00", "end": "18:00"},
    "interview_duration": 60,
    "buffer_time": 15
  }'::jsonb,
  created_at timestamp with time zone default now()
);

-- ROLES (Job Descriptions)
create table public.roles (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references public.companies(id) not null,
  title text not null,
  jd_text text,
  jd_parsed jsonb, -- {required_skills, preferred_skills, min_experience_years, etc.}
  status text default 'active', -- 'active', 'paused', 'closed'
  priority integer default 3, -- 1-5 for agent prioritization
  created_by uuid references public.users(id),
  created_at timestamp with time zone default now()
);

-- CANDIDATES
create table public.candidates (
  id uuid primary key default uuid_generate_v4(),
  role_id uuid references public.roles(id) not null,
  name text,
  email text,
  phone text,
  resume_url text, -- Supabase Storage URL
  resume_parsed jsonb, -- {skills, experience, education, summary}
  source text, -- 'email', 'upload', 'linkedin', 'naukri'
  status text default 'new', -- 'new', 'screening', 'shortlisted', 'rejected', 'interviewing'
  created_at timestamp with time zone default now()
);

-- EVALUATIONS
create table public.evaluations (
  id uuid primary key default uuid_generate_v4(),
  candidate_id uuid references public.candidates(id) not null,
  role_id uuid references public.roles(id) not null,
  match_score integer check (match_score >= 0 and match_score <= 100),
  reasoning text not null,
  breakdown jsonb, -- {skills_match: 85, experience_match: 75, education_match: 90}
  confidence integer check (confidence >= 0 and confidence <= 100),
  decision text, -- 'shortlist', 'maybe', 'reject'
  agent_version text default 'gpt-4-2024',
  created_at timestamp with time zone default now()
);

-- INTERVIEWS
create table public.interviews (
  id uuid primary key default uuid_generate_v4(),
  candidate_id uuid references public.candidates(id) not null,
  role_id uuid references public.roles(id) not null,
  interviewer_id uuid references public.users(id) not null,
  scheduled_at timestamp with time zone not null,
  duration_minutes integer default 60,
  calendar_event_id text, -- Google Calendar event ID
  status text default 'proposed', -- 'proposed', 'confirmed', 'completed', 'cancelled'
  meeting_link text,
  created_at timestamp with time zone default now()
);

-- APPROVALS
create table public.approvals (
  id uuid primary key default uuid_generate_v4(),
  type text not null, -- 'shortlist', 'schedule', 'reject'
  entity_id uuid not null, -- candidate_id or role_id
  requested_by text default 'agent',
  requested_at timestamp with time zone default now(),
  approved_by uuid references public.users(id),
  approved_at timestamp with time zone,
  status text default 'pending', -- 'pending', 'approved', 'rejected', 'modified'
  agent_reasoning text,
  user_comment text,
  original_data jsonb,
  modified_data jsonb
);

-- REASONING_LOGS (Audit Trail)
create table public.reasoning_logs (
  id uuid primary key default uuid_generate_v4(),
  entity_type text not null, -- 'candidate', 'interview', 'role'
  entity_id uuid not null,
  action text not null, -- 'parse', 'evaluate', 'decide', 'schedule'
  input_data jsonb,
  output_data jsonb,
  reasoning text,
  confidence integer,
  tool_name text, -- 'parseResume', 'evaluateCandidate', etc.
  execution_time_ms integer,
  success boolean default true,
  error_message text,
  created_at timestamp with time zone default now()
);

-- EMAILS
create table public.emails (
  id uuid primary key default uuid_generate_v4(),
  candidate_id uuid references public.candidates(id),
  direction text not null, -- 'inbound', 'outbound'
  subject text,
  body text,
  gmail_message_id text,
  attachments jsonb,
  processed boolean default false,
  created_at timestamp with time zone default now()
);

-- Create indexes for performance
create index idx_candidates_role_id on public.candidates(role_id);
create index idx_candidates_status on public.candidates(status);
create index idx_evaluations_candidate_id on public.evaluations(candidate_id);
create index idx_interviews_candidate_id on public.interviews(candidate_id);
create index idx_approvals_status on public.approvals(status);
create index idx_reasoning_logs_entity on public.reasoning_logs(entity_type, entity_id);
create index idx_reasoning_logs_created_at on public.reasoning_logs(created_at desc);
```

---


## 🔐 7️⃣ Row-Level Security (RLS) Policies

Enable RLS on all tables to isolate company data:

```sql
-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.companies enable row level security;
alter table public.roles enable row level security;
alter table public.candidates enable row level security;
alter table public.evaluations enable row level security;
alter table public.interviews enable row level security;
alter table public.approvals enable row level security;
alter table public.reasoning_logs enable row level security;
alter table public.emails enable row level security;

-- USERS: Users can only see their own profile
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

-- COMPANIES: Users can only see their own company
create policy "Users can view own company"
  on public.companies for select
  using (id = (select company_id from public.users where id = auth.uid()));

-- ROLES: Users can only see roles for their company
create policy "Users can view company roles"
  on public.roles for select
  using (company_id = (select company_id from public.users where id = auth.uid()));

create policy "Users can create roles for their company"
  on public.roles for insert
  with check (company_id = (select company_id from public.users where id = auth.uid()));

create policy "Users can update company roles"
  on public.roles for update
  using (company_id = (select company_id from public.users where id = auth.uid()));

-- CANDIDATES: Users can only see candidates for their company's roles
create policy "Users can view company candidates"
  on public.candidates for select
  using (
    role_id in (
      select id from public.roles 
      where company_id = (select company_id from public.users where id = auth.uid())
    )
  );

create policy "Users can create candidates"
  on public.candidates for insert
  with check (
    role_id in (
      select id from public.roles 
      where company_id = (select company_id from public.users where id = auth.uid())
    )
  );

-- EVALUATIONS: Users can only see evaluations for their company's candidates
create policy "Users can view company evaluations"
  on public.evaluations for select
  using (
    candidate_id in (
      select c.id from public.candidates c
      join public.roles r on c.role_id = r.id
      where r.company_id = (select company_id from public.users where id = auth.uid())
    )
  );

-- INTERVIEWS: Users can only see interviews for their company
create policy "Users can view company interviews"
  on public.interviews for select
  using (
    candidate_id in (
      select c.id from public.candidates c
      join public.roles r on c.role_id = r.id
      where r.company_id = (select company_id from public.users where id = auth.uid())
    )
  );

-- APPROVALS: Users can view and update approvals for their company
create policy "Users can view company approvals"
  on public.approvals for select
  using (
    entity_id in (
      select c.id from public.candidates c
      join public.roles r on c.role_id = r.id
      where r.company_id = (select company_id from public.users where id = auth.uid())
    )
  );

create policy "Users can update approvals"
  on public.approvals for update
  using (
    entity_id in (
      select c.id from public.candidates c
      join public.roles r on c.role_id = r.id
      where r.company_id = (select company_id from public.users where id = auth.uid())
    )
  );

-- REASONING_LOGS: Users can view logs for their company's entities
create policy "Users can view company logs"
  on public.reasoning_logs for select
  using (
    entity_id in (
      select c.id from public.candidates c
      join public.roles r on c.role_id = r.id
      where r.company_id = (select company_id from public.users where id = auth.uid())
    )
  );

-- EMAILS: Users can view emails for their company's candidates
create policy "Users can view company emails"
  on public.emails for select
  using (
    candidate_id in (
      select c.id from public.candidates c
      join public.roles r on c.role_id = r.id
      where r.company_id = (select company_id from public.users where id = auth.uid())
    )
  );
```

---


## 🔐 8️⃣ Security & Non-Functional Guidelines

### Security Requirements

**Authentication:**
- ✅ Google OAuth only (no password storage)
- ✅ Email verification enabled
- ✅ Session tokens stored in httpOnly cookies
- ✅ Token expiry: 7 days with auto-refresh
- ✅ CSRF protection enabled

**Data Protection:**
- ✅ Row-Level Security (RLS) on all tables
- ✅ Company data isolation via `company_id`
- ✅ Resume files in private Supabase Storage buckets
- ✅ Signed URLs for resume access (expire in 1 hour)
- ✅ All API traffic over HTTPS/TLS 1.3
- ✅ Encryption at rest (Supabase default)

**API Security:**
- ✅ All endpoints require valid Supabase session token
- ✅ Rate limiting: 100 requests/minute per user
- ✅ Input validation on all endpoints
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS prevention (sanitize user inputs)

**PII Handling:**
- ✅ Resume files stored in private buckets
- ✅ Candidate emails/phones encrypted
- ✅ GDPR-compliant data deletion (cascade deletes)
- ✅ Audit logs for all data access

### Performance Requirements

**Expected Latency:**
- API calls: < 200ms (p95)
- Resume parsing: < 30 seconds
- Candidate evaluation: < 10 seconds
- Dashboard load: < 1 second

**Scalability:**
- MVP: Support 5,000 users
- Year 1: Support 50,000 users
- Database: Auto-scaling with Supabase
- Storage: Unlimited (Supabase Storage)

**Reliability:**
- Uptime: 99.9% SLA
- Backup: Daily auto-backups (Supabase)
- Disaster recovery: Point-in-time recovery (7 days)
- Monitoring: Supabase Dashboard + Sentry for errors

### Data Retention

- **Candidates:** Retain for 2 years after role closed
- **Reasoning logs:** Retain for 90 days (configurable)
- **Emails:** Retain for 1 year
- **Resumes:** Retain for 2 years, then auto-delete

---


## 📋 9️⃣ Decision Log

### Backend Architecture Decisions

| Decision Point | Options Considered | Decision Made | Rationale |
|----------------|-------------------|---------------|-----------|
| **Database structure** | Normalized vs Denormalized vs Hybrid | **Normalized with JSONB for flexibility** | Normalized for data integrity; JSONB for resume_parsed, jd_parsed allows schema evolution without migrations |
| **Authentication method** | Email/password vs OAuth only vs Both | **OAuth only (Google)** | User convenience (no password management); aligns with Gmail/Calendar integration needs; faster onboarding |
| **API design** | REST vs GraphQL vs RPC | **REST with Supabase PostgREST** | Simplicity for MVP; Supabase auto-generates REST APIs; can add GraphQL later if needed |
| **Real-time vs Polling** | WebSockets vs Polling vs Hybrid | **Hybrid (Realtime for approvals, polling for logs)** | Realtime for critical updates (approval requests); polling for non-critical (logs) to reduce server load |
| **File storage** | Supabase Storage vs S3 vs Cloudinary | **Supabase Storage** | Integrated with Supabase; private buckets; signed URLs; no additional service needed |
| **AI provider** | OpenAI vs Anthropic vs Open-source | **OpenAI GPT-4** | Best structured output quality; function calling; proven reliability; can switch later if needed |
| **Email integration** | Gmail API vs SendGrid vs Both | **Gmail API for ingestion, SendGrid for outbound** | Gmail API for resume ingestion (user's inbox); SendGrid for transactional emails (reliable delivery) |

### Data Model Decisions

**Why separate `evaluations` table vs embedded in `candidates`:**
- Allows multiple evaluations per candidate (re-evaluation after JD update)
- Enables A/B testing of different AI models
- Cleaner audit trail for AI decisions

**Why separate `approvals` table:**
- Decouples approval workflow from entity tables
- Supports multiple approval types (shortlist, schedule, reject)
- Enables approval history and rollback

**Why JSONB for `resume_parsed` and `jd_parsed`:**
- Schema flexibility (resumes vary widely in structure)
- No migrations needed when adding new fields
- Fast querying with GIN indexes
- Supports nested data (experience array, education array)

**Why `reasoning_logs` separate from `evaluations`:**
- Logs all agent actions (not just evaluations)
- Supports debugging and monitoring
- Can be purged independently (90-day retention)

### Security vs Convenience Trade-offs

**Chose OAuth-only authentication:**
- **Pro:** Faster onboarding, no password management, aligns with integrations
- **Con:** Requires Google account (acceptable for target market)
- **Mitigation:** Can add email/password later if needed

**Chose RLS over application-level security:**
- **Pro:** Database-enforced isolation, prevents data leaks even if app logic fails
- **Con:** More complex queries, slight performance overhead
- **Mitigation:** Indexed foreign keys, query optimization

**Chose private storage buckets with signed URLs:**
- **Pro:** Secure resume access, URLs expire automatically
- **Con:** Requires generating new URLs for each access
- **Mitigation:** Cache URLs on client for 30 minutes

### Scalability Decisions Deferred

**Using single-region deployment for MVP:**
- **Current:** All data in single Supabase region (closest to India)
- **Future:** Multi-region replication after validating demand
- **Rationale:** Premature optimization; focus on product-market fit first

**Using synchronous AI calls:**
- **Current:** API waits for OpenAI response (10-30 seconds)
- **Future:** Queue-based async processing for batch operations
- **Rationale:** Simpler for MVP; acceptable latency for single-candidate evaluation

**No CDN for resume files:**
- **Current:** Direct Supabase Storage access
- **Future:** CloudFront/Cloudflare CDN for faster global access
- **Rationale:** Target market is India-focused; single region sufficient

---


## 📄 10️⃣ PRD Summary (for Backend Section)

*The backend is powered by Supabase with Google OAuth authentication, providing a fully managed PostgreSQL database, authentication, and file storage. The system stores users, companies, roles (job descriptions), candidates, evaluations, interviews, approvals, and reasoning logs in normalized relational tables with JSONB fields for flexible schema evolution. Row-Level Security (RLS) enforces company-level data isolation, ensuring users only access their organization's data. Supabase Edge Functions handle API endpoints for role management, candidate operations, evaluations, approvals, and interview scheduling. The system integrates with Gmail API for resume ingestion, Google Calendar API for interview coordination, and OpenAI GPT-4 for autonomous resume parsing, candidate evaluation, and explainable reasoning generation. All AI decisions are logged in a comprehensive audit trail with timestamps, reasoning text, confidence scores, and execution metrics. The architecture ensures speed (<200ms API latency), security (OAuth + RLS + encryption), and scalability (supporting 5,000+ users in MVP phase) while maintaining simplicity for rapid iteration.*

---

## 🚀 11️⃣ Deployment Checklist

### Supabase Setup

- [ ] Create Supabase project (select region closest to India)
- [ ] Run SQL schema creation script (all tables + indexes)
- [ ] Enable RLS on all tables
- [ ] Create RLS policies for each table
- [ ] Create storage buckets: `resumes`, `company-assets`
- [ ] Set bucket policies to private
- [ ] Enable email verification in Auth settings
- [ ] Configure Google OAuth provider (Client ID + Secret)
- [ ] Add authorized redirect URLs for production

### API Configuration

- [ ] Deploy Supabase Edge Functions for:
  - Resume parsing agent
  - Candidate evaluation agent
  - Interview scheduling agent
  - Gmail ingestion (scheduled function)
- [ ] Set environment variables:
  - `OPENAI_API_KEY`
  - `GMAIL_CLIENT_ID`
  - `GMAIL_CLIENT_SECRET`
  - `GOOGLE_CALENDAR_CLIENT_ID`
  - `GOOGLE_CALENDAR_CLIENT_SECRET`
- [ ] Configure rate limiting (100 req/min per user)
- [ ] Enable CORS for front-end domain

### Integration Setup

- [ ] Enable Gmail API in Google Cloud Console
- [ ] Enable Google Calendar API in Google Cloud Console
- [ ] Configure OAuth consent screen
- [ ] Add OAuth scopes:
  - `gmail.readonly`
  - `gmail.send`
  - `calendar.readonly`
  - `calendar.events`
- [ ] Create service account for server-side operations
- [ ] Store OAuth tokens securely in Supabase

### Monitoring & Logging

- [ ] Enable Supabase Dashboard monitoring
- [ ] Set up Sentry for error tracking
- [ ] Configure log retention (90 days for reasoning_logs)
- [ ] Set up alerts for:
  - API error rate > 5%
  - Database CPU > 80%
  - Storage > 80% capacity

### Testing

- [ ] Test Google OAuth login flow
- [ ] Test resume upload and parsing
- [ ] Test candidate evaluation with sample JD
- [ ] Test approval workflow
- [ ] Test interview scheduling
- [ ] Test RLS policies (cross-company data isolation)
- [ ] Load test: 100 concurrent users

---

## 📚 12️⃣ Environment Variables

Create `.env.local` file with:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# Google OAuth (for Supabase Auth)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Gmail API
GMAIL_CLIENT_ID=your-gmail-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-gmail-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token

# Google Calendar API
GOOGLE_CALENDAR_CLIENT_ID=your-calendar-client-id.apps.googleusercontent.com
GOOGLE_CALENDAR_CLIENT_SECRET=your-calendar-client-secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Optional: SendGrid for transactional emails
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@hireflow.ai
```

---

## 🧪 13️⃣ Sample API Usage

### Example: Create Role and Upload Resume

```typescript
// 1. Create a new role
const { data: role, error } = await supabase
  .from('roles')
  .insert({
    company_id: user.company_id,
    title: 'Senior Backend Engineer',
    jd_text: 'We are looking for...',
    status: 'active',
    priority: 1
  })
  .select()
  .single();

// 2. Upload resume file
const file = event.target.files[0];
const { data: upload, error: uploadError } = await supabase.storage
  .from('resumes')
  .upload(`${user.id}/${file.name}`, file);

// 3. Create candidate record
const { data: candidate, error: candidateError } = await supabase
  .from('candidates')
  .insert({
    role_id: role.id,
    resume_url: upload.path,
    source: 'upload',
    status: 'new'
  })
  .select()
  .single();

// 4. Trigger AI parsing (Edge Function)
const { data: parsed } = await supabase.functions.invoke('parse-resume', {
  body: { candidate_id: candidate.id }
});

// 5. Trigger evaluation (Edge Function)
const { data: evaluation } = await supabase.functions.invoke('evaluate-candidate', {
  body: { candidate_id: candidate.id, role_id: role.id }
});

// 6. Check if approval needed
if (evaluation.requires_approval) {
  // Show approval request in UI
  console.log('Approval required:', evaluation.reasoning);
}
```

---

💡 **Key Takeaway:** The autonomous agent loop (parse → evaluate → decide → request approval → schedule) powered by OpenAI GPT-4 with transparent reasoning logged at every step is what makes HireFlow truly functional end-to-end—transforming Sarah from a resume-scanning machine into a strategic hiring partner.
