# Design Document - HireFlow

## Overview

HireFlow is an agentic AI hiring assistant designed to autonomously screen resumes, shortlist candidates with explainable reasoning, and auto-schedule interviews for lean HR teams in Indian tech startups. The system addresses the critical pain point of manual resume screening (8-12 hours per role) and interview scheduling chaos (10-15 emails per slot) by providing transparent AI automation with human-in-loop controls.

**Platform:** Web application (desktop-first, mobile-responsive) accessible via modern browsers. Primary use case is desktop/laptop usage during work hours, with mobile access for notifications and quick approvals.

**Design Philosophy:** AI should make HR more strategic, not more automated. Decisions stay human; workflows become autonomous. Trust comes from transparency—every automated action must be understandable, defensible, and reversible.

**Target User:** Solo Talent Acquisition Managers at 20-200 employee tech/SaaS startups who handle 300-500 resumes per role without dedicated HR support.

**Core Value Proposition:** Reduce early-stage hiring workload by 60-80% through autonomous AI screening with explainable reasoning and auto-scheduling, enabling HR to focus on strategic hiring conversations rather than administrative tasks.

**Technology Stack:**
- **Frontend:** React with Next.js (TypeScript)
- **UI Framework:** Tailwind CSS with custom components
- **Backend:** Node.js with Express or Next.js API routes
- **Database:** PostgreSQL
- **File Storage:** AWS S3 or Google Cloud Storage
- **AI/LLM:** OpenAI GPT-4 or similar (via API)
- **Agent Integration:** Model Context Protocol (MCP) for AI agent access to external services
- **External Services:** Gmail API, Google Calendar API (OAuth 2.0)

**MCP Integration Benefits:**
- **Standardized Tool Access:** AI agents can use MCP servers to interact with Gmail and Calendar
- **Better Context Management:** MCP provides structured context for AI decision-making
- **Extensibility:** Easy to add new integrations (LinkedIn, Slack, etc.) as MCP servers
- **Separation of Concerns:** AI logic separated from integration logic

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React/Next.js)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │ Role     │  │Candidate │  │Interview │   │
│  │          │  │ Detail   │  │ Profile  │  │Scheduling│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway / Backend                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Auth Service │  │ Role Service │  │ Candidate    │     │
│  │              │  │              │  │ Service      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Core AI Services                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Resume       │  │ Evaluation   │  │ Scheduling   │     │
│  │ Parser       │  │ Engine       │  │ Agent        │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    MCP Integration Layer                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Gmail MCP    │  │ Calendar MCP │  │ LLM Provider │     │
│  │ Server       │  │ Server       │  │ (OpenAI/etc) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ Gmail API    │  │ Google       │                        │
│  │              │  │ Calendar API │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Storage                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ PostgreSQL   │  │ S3/Blob      │  │ Redis Cache  │     │
│  │ (Structured) │  │ (Resumes)    │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Principles

1. **Separation of Concerns:** Clear boundaries between parsing, evaluation, and scheduling
2. **Transparency by Design:** All AI decisions logged with full reasoning
3. **Human-in-Loop:** Approval gates at critical decision points
4. **Scalability:** Async processing for batch resume handling
5. **Security:** OAuth for integrations, encrypted storage for PII
6. **Extensibility:** MCP-based plugin architecture for future integrations

### MCP Integration Architecture

HireFlow uses the Model Context Protocol (MCP) to enable AI agents to interact with external services in a standardized way:

**MCP Servers:**
1. **Gmail MCP Server:** Provides tools for reading emails, sending emails, and managing inbox
   - Tools: `read_emails`, `send_email`, `search_emails`
   - Used by: Resume ingestion, candidate communication

2. **Google Calendar MCP Server:** Provides tools for reading availability, creating events, updating events
   - Tools: `get_availability`, `create_event`, `update_event`, `delete_event`
   - Used by: Interview scheduling, availability management

**Benefits of MCP:**
- **Standardized Interface:** AI agents use consistent tool-calling patterns
- **Context Awareness:** MCP provides structured context about available tools and their usage
- **Easy Extension:** New integrations (LinkedIn, Slack, WhatsApp) can be added as MCP servers
- **Better Debugging:** Tool calls are logged and traceable
- **Separation of Concerns:** Integration logic isolated in MCP servers

**MCP vs Direct API:**
- **Direct API:** Frontend ↔ Backend ↔ Gmail/Calendar APIs (for user-initiated actions)
- **MCP:** AI Agent ↔ MCP Server ↔ Gmail/Calendar APIs (for autonomous agent actions)

This hybrid approach gives us the best of both worlds: direct API calls for user actions (fast, simple) and MCP for AI agent actions (structured, extensible).

## Components and Interfaces

### 1. Resume Parser Service

**Purpose:** Extract structured information from unstructured resume documents

**Input:**
- Resume file (PDF, DOCX, TXT)
- File metadata (filename, upload timestamp, source)

**Output:**
```typescript
interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  summary: string;
  rawText: string;
  parseConfidence: number; // 0-100
  parseErrors: string[];
}

interface WorkExperience {
  company: string;
  title: string;
  startDate: Date;
  endDate: Date | null;
  description: string;
  technologies: string[];
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationYear: number;
}
```

**Technology:** LLM-based extraction (GPT-4 or similar) with structured output parsing

**Error Handling:**
- Scanned images → Flag for manual review
- Missing fields → Mark as unavailable, continue processing
- Corrupted files → Log error, skip file, notify user

---

### 2. Job Description Parser

**Purpose:** Extract evaluation criteria from job descriptions

**Input:**
- Job description text
- Role metadata (title, department, level)

**Output:**
```typescript
interface EvaluationCriteria {
  roleId: string;
  requiredSkills: Skill[];
  niceToHaveSkills: Skill[];
  experienceLevel: {
    min: number;
    max: number;
    unit: 'years';
  };
  educationRequirements: string[];
  responsibilities: string[];
  ambiguousRequirements: string[]; // Flagged for clarification
  scoringWeights: {
    skills: number; // Default: 0.5
    experience: number; // Default: 0.3
    education: number; // Default: 0.2
  };
  customInstructions?: string; // Optional: HR User can provide additional context
}

interface Skill {
  name: string;
  importance: 'required' | 'nice-to-have';
  weight: number; // 0-1, relative importance within category
}
```

**Technology:** LLM-based extraction with prompt engineering for structured criteria

---

### 3. Evaluation Engine

**Purpose:** Score candidates against job requirements with explainable reasoning

**Input:**
- Candidate Profile
- Evaluation Criteria

**Output:**
```typescript
interface CandidateEvaluation {
  candidateId: string;
  roleId: string;
  score: number; // 0-100
  confidenceScore: number; // 0-100
  reasoning: string; // Human-readable explanation
  breakdown: {
    skillsMatch: number; // 0-100
    experienceMatch: number; // 0-100
    educationMatch: number; // 0-100
  };
  strengths: string[]; // Bullet points
  gaps: string[]; // Bullet points
  recommendation: 'shortlist' | 'review' | 'reject';
  timestamp: Date;
}
```

**Scoring Algorithm:**

The evaluation engine uses a weighted scoring approach that can be customized per role:

```
Total Score = (Skills Match × skills_weight) + 
              (Experience Match × experience_weight) + 
              (Education Match × education_weight)

Where weights sum to 1.0
```

**Default Weights (Configurable):**
- Skills: 0.5 (50%) - Primary filter for tech roles
- Experience: 0.3 (30%) - Important but can be compensated
- Education: 0.2 (20%) - Least critical for tech roles

**Rationale for Default Weights:**
- **Skills-Heavy:** Tech hiring prioritizes demonstrable skills over credentials
- **Experience-Moderate:** Years of experience matter, but quality > quantity
- **Education-Light:** Many great developers are self-taught or have non-traditional backgrounds
- **Configurable:** HR Users can adjust weights per role (e.g., senior roles may weight experience higher)

**Component Scoring:**

1. **Skills Match:**
   ```
   Required Skills Score = (Matched Required Skills / Total Required Skills) × 100
   Nice-to-Have Bonus = (Matched Nice-to-Have Skills / Total Nice-to-Have) × 10
   Skills Match = min(Required Skills Score + Nice-to-Have Bonus, 100)
   ```

2. **Experience Match:**
   ```
   Years Match = Based on whether candidate meets min/max years requirement
   Relevance Match = LLM evaluation of experience relevance to role
   Experience Match = (Years Match × 0.4) + (Relevance Match × 0.6)
   ```

3. **Education Match:**
   ```
   Degree Level Match = Based on degree level (Bachelor, Master, PhD)
   Field Relevance = Based on field alignment with role
   Education Match = (Degree Level × 0.5) + (Field Relevance × 0.5)
   ```

**Confidence Score Calculation:**
```
Confidence Score = Based on:
- Resume clarity (0-100): How well-structured and complete is the resume?
- Match strength (0-100): How strong are the matches (exact vs partial)?
- Ambiguity level (0-100): How much uncertainty in the evaluation?

Confidence = (Resume Clarity × 0.4) + (Match Strength × 0.4) + ((100 - Ambiguity) × 0.2)
```

**Why This Approach:**
1. **Transparent:** Each component is explainable
2. **Flexible:** Weights can be adjusted per role or company
3. **Fair:** Separates required vs nice-to-have to avoid over-penalizing
4. **Confidence-Aware:** Low confidence triggers manual review

**Technology:** LLM-based evaluation with structured prompts for consistent scoring

---

### 4. Scheduling Agent

**Purpose:** Autonomously coordinate interview scheduling

**Input:**
- Approved candidate list
- HR User calendar availability
- Scheduling preferences (duration, buffer time)

**Output:**
```typescript
interface InterviewSchedule {
  candidateId: string;
  roleId: string;
  proposedSlots: TimeSlot[];
  status: 'pending' | 'confirmed' | 'declined' | 'rescheduled';
  calendarEventId: string;
  emailThreadId: string;
}

interface TimeSlot {
  startTime: Date;
  endTime: Date;
  available: boolean;
}
```

**Workflow:**
1. Query HR User's calendar for availability
2. Generate available slots respecting preferences
3. Send email to candidate with slot options
4. Process candidate response
5. Create calendar event on confirmation
6. Send reminder if no response in 48 hours

**Technology:** Google Calendar API integration, email automation

---

### 5. Reasoning Logger

**Purpose:** Maintain audit trail of all AI decisions

**Input:**
- Action type (parse, evaluate, schedule)
- Input data
- Output data
- Reasoning text
- Confidence score

**Output:**
```typescript
interface ReasoningLog {
  id: string;
  timestamp: Date;
  actionType: 'parse' | 'evaluate' | 'schedule';
  entityId: string; // Candidate or role ID
  entityName: string;
  inputData: any;
  outputData: any;
  reasoning: string;
  confidenceScore: number;
  status: 'success' | 'failed';
  errorMessage?: string;
}
```

**Storage:** PostgreSQL with full-text search indexing on reasoning field

---

### 6. Integration Manager

**Purpose:** Handle OAuth connections and API interactions

**Supported Integrations:**
- Gmail (OAuth 2.0)
- Google Calendar (OAuth 2.0)

**Interface:**
```typescript
interface Integration {
  id: string;
  userId: string;
  provider: 'gmail' | 'google_calendar';
  status: 'connected' | 'disconnected' | 'error';
  accessToken: string; // Encrypted
  refreshToken: string; // Encrypted
  expiresAt: Date;
  scopes: string[];
  lastSyncedAt: Date;
}
```

**Security:** Tokens encrypted at rest, OAuth flow with PKCE, minimal scope requests

## Data Models

### User

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  company: string;
  role: 'hr_user' | 'admin';
  createdAt: Date;
  settings: UserSettings;
}

interface UserSettings {
  approvalGates: {
    requireShortlistApproval: boolean;
    requireSchedulingApproval: boolean;
    requireBulkRejectionApproval: boolean;
  };
  confidenceThreshold: number; // 0-100
  workingHours: {
    start: string; // "09:00"
    end: string; // "18:00"
    timezone: string;
  };
  interviewDuration: number; // minutes
  bufferTime: number; // minutes
  notificationPreferences: {
    email: boolean;
    inApp: boolean;
  };
}
```

### Role (Job Posting)

```typescript
interface Role {
  id: string;
  userId: string;
  title: string;
  department: string;
  description: string; // Full JD text
  evaluationCriteria: EvaluationCriteria;
  status: 'active' | 'paused' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  stats: {
    totalCandidates: number;
    screened: number;
    shortlisted: number;
    interviewed: number;
    rejected: number;
  };
}
```

### Candidate

```typescript
interface Candidate {
  id: string;
  roleId: string;
  profile: CandidateProfile;
  evaluation: CandidateEvaluation;
  status: 'new' | 'ai_reviewed' | 'shortlisted' | 'interview_scheduled' | 'interviewed' | 'rejected';
  source: 'upload' | 'email' | 'api';
  appliedAt: Date;
  statusHistory: StatusChange[];
  notes: string;
  overridden: boolean;
  overrideReason?: string;
}

interface StatusChange {
  from: string;
  to: string;
  timestamp: Date;
  triggeredBy: 'ai' | 'user';
  reason?: string;
}
```

### Interview

```typescript
interface Interview {
  id: string;
  candidateId: string;
  roleId: string;
  scheduledAt: Date;
  duration: number; // minutes
  status: 'pending_confirmation' | 'confirmed' | 'completed' | 'cancelled';
  calendarEventId: string;
  emailThreadId: string;
  reminderSentAt?: Date;
  confirmedAt?: Date;
  notes: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: File Format Validation
*For any* file upload, HireFlow should accept only PDF, DOCX, and TXT formats and reject all other formats with a clear error message.
**Validates: Requirements 1.1**

### Property 2: Batch Processing Integrity
*For any* batch of resume files uploaded with a role ID, all valid files should be processed and correctly associated with that role, maintaining the association throughout the system.
**Validates: Requirements 1.2**

### Property 3: Batch Processing Resilience
*For any* batch of files containing some corrupted or unreadable files, the system should log errors for the corrupted files, continue processing the remaining valid files without interruption, and report accurate counts of successes and failures.
**Validates: Requirements 1.3, 1.4, 15.1**

### Property 4: Resume Parsing Completeness
*For any* valid resume document, the Resume Parser should extract all available fields (name, contact info, experience, education, skills, location) and create a structured Candidate Profile, marking unavailable fields as such without failing.
**Validates: Requirements 2.1, 2.2, 2.3**

### Property 5: Job Description Parsing Completeness
*For any* valid job description, the JD Parser should extract all evaluation criteria (required skills, nice-to-have skills, experience level, education requirements, responsibilities) and create structured Evaluation Criteria.
**Validates: Requirements 3.1, 3.2**

### Property 6: Ambiguity Detection
*For any* job description containing ambiguous or unclear requirements, HireFlow should flag those requirements for HR User clarification before proceeding with candidate evaluation.
**Validates: Requirements 3.3**

### Property 7: Evaluation Update Propagation
*For any* role with existing candidate evaluations, when the Job Description is updated, all candidates should be re-evaluated using the new criteria, and any changes to shortlist recommendations should be reported to the HR User.
**Validates: Requirements 3.4**

### Property 8: Score Bounds and Structure
*For any* candidate evaluation, the Candidate Score should be in the range 0-100, the Confidence Score should be in the range 0-100, and the evaluation should include a complete breakdown (skills match, experience match, education match), reasoning text, strengths list, and gaps list.
**Validates: Requirements 4.1, 4.3, 4.4**

### Property 9: Candidate Ranking Correctness
*For any* set of candidates with scores, the candidates should be ranked in descending order by score, with ties broken consistently by application timestamp (earlier applications ranked higher).
**Validates: Requirements 4.2, 4.5**

### Property 10: Threshold Filtering
*For any* set of candidates and a minimum score threshold, only candidates with scores meeting or exceeding the threshold should be identified as Qualified Candidates.
**Validates: Requirements 5.1**

### Property 11: Explanation Grounding
*For any* candidate evaluation explanation, the explanation should reference specific skills, experiences, or qualifications from the Candidate Profile that match or don't match the Job Description, and should include both strengths and gaps.
**Validates: Requirements 5.3, 5.4**

### Property 12: Scheduling Constraint Satisfaction
*For any* interview scheduling request, all generated Interview Slots should fall within the HR User's configured availability (working hours, blocked dates), respect the specified buffer time between interviews, and exclude already-booked slots to prevent double-booking.
**Validates: Requirements 6.2, 6.5, 7.2, 7.3, 7.5**

### Property 13: Calendar Synchronization
*For any* interview slot selection by a candidate, both the candidate's and HR User's calendars should be updated with the confirmed interview event containing all required information (candidate name, role, interview type, notes).
**Validates: Requirements 6.3, 12.3**

### Property 14: Email Content Completeness
*For any* email sent by HireFlow (invitation, reminder, rejection, acknowledgment), the email should include the company name, position title, and a contact method for questions.
**Validates: Requirements 6.6, 10.4**

### Property 15: Availability Update Isolation
*For any* HR User availability update, the changes should apply to all future Interview Slot generation without affecting already confirmed interviews.
**Validates: Requirements 7.4**

### Property 16: Override Capability
*For any* candidate evaluation, the HR User should be able to manually override the AI decision (promote or reject) regardless of the AI score, and the override should trigger the appropriate workflow (scheduling for promotions, rejection email for rejections).
**Validates: Requirements 8.2, 8.3**

### Property 17: Audit Trail Completeness
*For any* automated decision made by HireFlow (parse, evaluate, schedule), the system should log the decision with timestamp, input data, output data, full reasoning, and confidence score, and the log should be searchable and filterable.
**Validates: Requirements 8.4, 11.1, 11.3, 11.4**

### Property 18: Candidate Display Completeness
*For any* role, when an HR User views candidate results, all candidates (both above and below threshold) should be displayed with their scores, reasoning, and status.
**Validates: Requirements 8.1, 9.1**

### Property 19: Filter Correctness
*For any* set of candidates and filter criteria (job posting, score range, application date, source), the filtered results should include only candidates that match all specified criteria.
**Validates: Requirements 9.3**

### Property 20: Export Completeness
*For any* candidate data export, the generated CSV should contain all candidate information including profile data, scores, reasoning, and complete status history.
**Validates: Requirements 9.4**

### Property 21: Metrics Calculation Correctness
*For any* dashboard view, the summary metrics (time saved, candidates processed, shortlist accuracy) should be calculated correctly based on actual system data.
**Validates: Requirements 9.5**

### Property 22: Rejection Workflow Completeness
*For any* candidate who is rejected (either by AI or manual override), HireFlow should send a polite rejection email with encouragement to apply for future positions.
**Validates: Requirements 10.3**

### Property 23: Confidence Threshold Enforcement
*For any* candidate evaluation where the Confidence Score is below the configured threshold, the candidate should be flagged for manual review instead of being auto-approved, regardless of the Candidate Score.
**Validates: Requirements 13.2, 13.3**

### Property 24: Configuration Application
*For any* change to approval gates or automation settings, the changes should apply immediately to all future actions without affecting already-in-progress workflows.
**Validates: Requirements 13.4**

### Property 25: Event-Driven Notifications
*For any* significant system event (batch completion, pending approvals, candidate response, error), HireFlow should send a notification to the HR User with relevant details, respecting the HR User's notification preferences (email, in-app, or both).
**Validates: Requirements 14.1, 14.2, 14.3, 14.4, 14.5**

### Property 26: Validation Prompting
*For any* attempt to evaluate candidates when Job Description criteria are missing or incomplete, HireFlow should prompt the HR User to clarify the criteria before proceeding with evaluation.
**Validates: Requirements 15.2**

### Property 27: Conflict Resolution
*For any* scheduling conflict detected, HireFlow should notify the HR User and suggest alternative Interview Slots that satisfy all constraints.
**Validates: Requirements 15.3**

### Property 28: Integration Error Recovery
*For any* integration failure (Gmail, Google Calendar), HireFlow should provide step-by-step troubleshooting instructions and offer to retry the connection.
**Validates: Requirements 15.4**

## Error Handling

### Error Categories

1. **Parsing Errors**
   - Corrupted files → Log error, skip file, continue batch
   - Scanned images → Flag for manual review
   - Missing fields → Mark as unavailable, continue
   - Special characters → Handle gracefully without failure

2. **Evaluation Errors**
   - Missing JD criteria → Prompt for clarification
   - Ambiguous requirements → Flag for review
   - Low confidence → Flag for manual review

3. **Scheduling Errors**
   - Calendar conflicts → Suggest alternatives
   - No available slots → Notify HR User
   - Candidate no-response → Send reminder after 48 hours

4. **Integration Errors**
   - OAuth failures → Provide reconnection instructions
   - API rate limits → Queue requests, retry with backoff
   - Network timeouts → Retry with exponential backoff

### Error Response Principles

1. **Graceful Degradation:** Errors should not stop the entire workflow
2. **Clear Communication:** Error messages in supportive, non-technical language
3. **Actionable Guidance:** Always provide next steps
4. **Audit Trail:** All errors logged with full context
5. **User Control:** HR User can always override or retry

### Example Error Messages

**Good:**
- "I couldn't parse this resume (scanned image). Want me to retry or flag as manual?"
- "I'm 65% confident on this candidate. Want to review together before deciding?"
- "Couldn't connect to Gmail. Let's try reconnecting. [Reconnect Button]"

**Bad:**
- "Error 500: Internal Server Error"
- "Parsing failed"
- "Invalid input"

## Testing Strategy

### Dual Testing Approach

HireFlow will use both unit testing and property-based testing to ensure comprehensive coverage:

- **Unit tests** verify specific examples, edge cases, and integration points
- **Property tests** verify universal properties that should hold across all inputs
- Together they provide comprehensive coverage: unit tests catch concrete bugs, property tests verify general correctness

### Unit Testing

**Framework:** Jest (JavaScript/TypeScript)

**Coverage Areas:**
- API endpoint responses
- Database operations
- Integration with external services (Gmail, Google Calendar)
- UI component rendering
- Specific edge cases (empty inputs, boundary values)

**Example Unit Tests:**
```typescript
describe('Resume Parser', () => {
  it('should extract name from a standard resume', () => {
    const resume = loadTestResume('standard-resume.pdf');
    const profile = parseResume(resume);
    expect(profile.name).toBe('John Doe');
  });

  it('should handle missing email gracefully', () => {
    const resume = loadTestResume('no-email-resume.pdf');
    const profile = parseResume(resume);
    expect(profile.email).toBeUndefined();
    expect(profile.parseErrors).toContain('Email not found');
  });
});
```

### Property-Based Testing

**Framework:** fast-check (JavaScript/TypeScript property-based testing library)

**Configuration:** Each property-based test will run a minimum of 100 iterations to ensure thorough coverage of the input space.

**Tagging Convention:** Each property-based test must be tagged with a comment explicitly referencing the correctness property in this design document using the format: `**Feature: ai-resume-screening, Property {number}: {property_text}**`

**Example Property-Based Tests:**

```typescript
import fc from 'fast-check';

/**
 * Feature: ai-resume-screening, Property 1: File Format Validation
 * For any file upload, HireFlow should accept only PDF, DOCX, and TXT formats
 */
describe('Property 1: File Format Validation', () => {
  it('should accept valid formats and reject invalid formats', () => {
    fc.assert(
      fc.property(
        fc.record({
          filename: fc.string(),
          extension: fc.oneof(
            fc.constant('pdf'),
            fc.constant('docx'),
            fc.constant('txt'),
            fc.constant('jpg'), // invalid
            fc.constant('png'), // invalid
            fc.constant('exe')  // invalid
          )
        }),
        (file) => {
          const validExtensions = ['pdf', 'docx', 'txt'];
          const result = validateFileFormat(file);
          
          if (validExtensions.includes(file.extension)) {
            expect(result.valid).toBe(true);
          } else {
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: ai-resume-screening, Property 8: Score Bounds and Structure
 * For any candidate evaluation, scores should be in valid ranges with complete structure
 */
describe('Property 8: Score Bounds and Structure', () => {
  it('should generate scores in valid ranges with complete breakdown', () => {
    fc.assert(
      fc.property(
        generateRandomCandidateProfile(),
        generateRandomEvaluationCriteria(),
        (profile, criteria) => {
          const evaluation = evaluateCandidate(profile, criteria);
          
          // Score bounds
          expect(evaluation.score).toBeGreaterThanOrEqual(0);
          expect(evaluation.score).toBeLessThanOrEqual(100);
          expect(evaluation.confidenceScore).toBeGreaterThanOrEqual(0);
          expect(evaluation.confidenceScore).toBeLessThanOrEqual(100);
          
          // Structure completeness
          expect(evaluation.breakdown).toBeDefined();
          expect(evaluation.breakdown.skillsMatch).toBeGreaterThanOrEqual(0);
          expect(evaluation.breakdown.experienceMatch).toBeGreaterThanOrEqual(0);
          expect(evaluation.breakdown.educationMatch).toBeGreaterThanOrEqual(0);
          expect(evaluation.reasoning).toBeDefined();
          expect(evaluation.strengths).toBeInstanceOf(Array);
          expect(evaluation.gaps).toBeInstanceOf(Array);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: ai-resume-screening, Property 9: Candidate Ranking Correctness
 * For any set of candidates, ranking should be correct with proper tie-breaking
 */
describe('Property 9: Candidate Ranking Correctness', () => {
  it('should rank candidates correctly by score and timestamp', () => {
    fc.assert(
      fc.property(
        fc.array(generateRandomCandidateWithScore(), { minLength: 2, maxLength: 50 }),
        (candidates) => {
          const ranked = rankCandidates(candidates);
          
          // Check descending order by score
          for (let i = 0; i < ranked.length - 1; i++) {
            if (ranked[i].score === ranked[i + 1].score) {
              // Tie-breaking: earlier timestamp should come first
              expect(ranked[i].appliedAt.getTime())
                .toBeLessThanOrEqual(ranked[i + 1].appliedAt.getTime());
            } else {
              expect(ranked[i].score).toBeGreaterThanOrEqual(ranked[i + 1].score);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Test Generators

Property-based tests require smart generators that constrain the input space intelligently:

```typescript
// Generator for realistic candidate profiles
function generateRandomCandidateProfile() {
  return fc.record({
    name: fc.fullName(),
    email: fc.emailAddress(),
    phone: fc.phoneNumber(),
    skills: fc.array(fc.constantFrom('Python', 'JavaScript', 'Java', 'React', 'Node.js'), 
                     { minLength: 1, maxLength: 10 }),
    experience: fc.array(
      fc.record({
        company: fc.company(),
        title: fc.jobTitle(),
        years: fc.integer({ min: 0, max: 20 })
      }),
      { minLength: 0, maxLength: 5 }
    ),
    education: fc.array(
      fc.record({
        degree: fc.constantFrom('Bachelor', 'Master', 'PhD'),
        field: fc.constantFrom('Computer Science', 'Engineering', 'Business')
      }),
      { minLength: 0, maxLength: 3 }
    )
  });
}

// Generator for evaluation criteria
function generateRandomEvaluationCriteria() {
  return fc.record({
    requiredSkills: fc.array(fc.skill(), { minLength: 1, maxLength: 5 }),
    experienceLevel: fc.record({
      min: fc.integer({ min: 0, max: 5 }),
      max: fc.integer({ min: 5, max: 20 })
    }),
    educationRequirements: fc.array(fc.degree(), { minLength: 0, maxLength: 2 })
  });
}
```

### Integration Testing

**Framework:** Playwright (for end-to-end UI testing)

**Coverage Areas:**
- Complete user workflows (upload → evaluate → approve → schedule)
- Integration with Gmail and Google Calendar
- Real-time dashboard updates
- Error recovery flows

### Testing Priorities

1. **Critical Path:** Resume parsing → Evaluation → Shortlisting → Scheduling
2. **Error Handling:** Graceful degradation, clear error messages
3. **Data Integrity:** Audit trails, status consistency
4. **User Control:** Overrides, approval gates
5. **Performance:** Batch processing speed, real-time updates

## Security and Privacy

### Data Protection

1. **PII Encryption:** All candidate data encrypted at rest (AES-256)
2. **Secure Storage:** Resume files stored in encrypted blob storage
3. **Access Control:** Role-based access control (RBAC)
4. **Data Retention:** Configurable retention policies, automatic deletion
5. **GDPR Compliance:** Right to access, right to deletion, data portability

### Authentication and Authorization

1. **OAuth 2.0:** For Gmail and Google Calendar integrations
2. **JWT Tokens:** For API authentication
3. **Session Management:** Secure session handling with timeout
4. **MFA Support:** Optional multi-factor authentication

### API Security

1. **Rate Limiting:** Prevent abuse and DoS attacks
2. **Input Validation:** Sanitize all user inputs
3. **CORS:** Properly configured cross-origin policies
4. **HTTPS Only:** All communication over TLS 1.3

### AI Security

1. **Prompt Injection Protection:** Sanitize inputs to LLM
2. **Output Validation:** Verify LLM outputs match expected structure
3. **Bias Monitoring:** Regular audits of evaluation decisions
4. **Explainability:** Full reasoning logs for accountability

## Performance Considerations

### Scalability Targets

- **Resume Processing:** 500 resumes in < 5 minutes
- **Evaluation:** Single candidate in < 3 seconds
- **Dashboard Load:** < 1 second for 1000 candidates
- **Real-time Updates:** < 500ms latency

### Optimization Strategies

1. **Async Processing:** Queue-based batch processing
2. **Caching:** Redis for frequently accessed data
3. **Database Indexing:** Optimized queries for filtering/search
4. **CDN:** Static assets served from edge locations
5. **Lazy Loading:** Progressive data loading in UI

### Monitoring

1. **Application Metrics:** Response times, error rates
2. **AI Metrics:** Evaluation accuracy, confidence distribution
3. **User Metrics:** Time saved, shortlist acceptance rate
4. **System Metrics:** CPU, memory, database performance

## Deployment Architecture

### Infrastructure

- **Frontend:** Vercel or Netlify (Next.js)
- **Backend:** AWS ECS or Google Cloud Run (containerized)
- **Database:** AWS RDS PostgreSQL or Google Cloud SQL
- **Storage:** AWS S3 or Google Cloud Storage
- **Cache:** Redis Cloud or AWS ElastiCache
- **Queue:** AWS SQS or Google Cloud Tasks

### CI/CD Pipeline

1. **Code Commit:** GitHub
2. **Automated Tests:** Run unit and property tests
3. **Build:** Docker container build
4. **Deploy:** Staging → Production with approval gate
5. **Monitoring:** Datadog or New Relic

### Disaster Recovery

- **Database Backups:** Daily automated backups
- **Point-in-Time Recovery:** 7-day retention
- **Multi-Region:** Failover to secondary region
- **RTO:** < 1 hour
- **RPO:** < 15 minutes

## Future Enhancements

### Phase 2 Features

1. **Video Interview Scheduling:** Integration with Zoom/Google Meet
2. **Candidate Sourcing:** Proactive candidate search on LinkedIn
3. **Interview Feedback:** Structured feedback collection
4. **Offer Management:** Automated offer letter generation

### Phase 3 Features

1. **Multi-Language Support:** Hindi, Tamil, Telugu
2. **WhatsApp Integration:** Candidate communication via WhatsApp
3. **Advanced Analytics:** Hiring funnel metrics, diversity tracking
4. **Custom Workflows:** Configurable approval chains

### AI Improvements

1. **Fine-Tuning:** Custom models trained on company-specific data
2. **Bias Detection:** Automated fairness audits
3. **Candidate Matching:** Proactive candidate recommendations
4. **Interview Question Generation:** Role-specific interview guides

## Conclusion

HireFlow is designed as a transparent, trustworthy AI assistant that reduces early-stage hiring workload by 60-80% while maintaining human control over all critical decisions. The architecture emphasizes explainability, auditability, and user empowerment, ensuring that HR professionals feel supported rather than replaced by AI automation.

The system's correctness is validated through 28 comprehensive properties covering parsing, evaluation, scheduling, error handling, and user control, implemented through property-based testing with a minimum of 100 iterations per property. This rigorous testing approach ensures that HireFlow behaves correctly across all valid inputs and edge cases, providing reliable automation that HR teams can trust.
