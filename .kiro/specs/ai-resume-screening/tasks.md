# Implementation Plan - HireFlow

## Overview

This implementation plan breaks down the HireFlow design into discrete, actionable coding tasks. Each task builds incrementally on previous tasks, with property-based tests integrated throughout to validate correctness. The plan follows an implementation-first approach: build features before writing comprehensive tests.

**Testing Strategy:**
- **MVP Phase:** 8 critical property tests + essential unit tests (validates core correctness)
- **Post-MVP Phase:** 20 comprehensive property tests (validates edge cases and production readiness)
- Tests marked with `*` are post-MVP (can be deferred until after initial user validation)

---

## Tasks - MVP Phase

- [x] 1. Set up project structure and core infrastructure


  - Initialize Next.js project with TypeScript and Tailwind CSS
  - Configure PostgreSQL database with Prisma ORM
  - Set up authentication with NextAuth.js
  - Configure environment variables and secrets management
  - Set up S3/Cloud Storage for resume file storage
  - _Requirements: All_

- [ ] 1.1 Write unit tests for database models and authentication
  - Test user creation and authentication flows
  - Test database connection and basic CRUD operations
  - _Requirements: All_
  - **MVP: Essential**

- [ ] 2. Implement Resume Parser Service
  - Create file upload endpoint accepting PDF, DOCX, TXT
  - Integrate LLM (OpenAI GPT-4) for resume text extraction
  - Implement structured parsing to extract name, contact, skills, experience, education
  - Handle missing fields gracefully (mark as unavailable)
  - Store parsed data in CandidateProfile model
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4_

- [ ] 2.1 Write property test for file format validation
  - **Property 1: File Format Validation**
  - **Validates: Requirements 1.1**
  - **MVP: Critical**

- [ ]* 2.2 Write property test for batch processing integrity
  - **Property 2: Batch Processing Integrity**
  - **Validates: Requirements 1.2**
  - **Post-MVP: Scalability validation**

- [ ]* 2.3 Write property test for batch processing resilience
  - **Property 3: Batch Processing Resilience**
  - **Validates: Requirements 1.3, 1.4, 15.1**
  - **Post-MVP: Edge case handling**

- [ ] 2.4 Write property test for resume parsing completeness
  - **Property 4: Resume Parsing Completeness**
  - **Validates: Requirements 2.1, 2.2, 2.3**
  - **MVP: Critical**

- [ ] 3. Implement Job Description Parser
  - Create JD input endpoint
  - Integrate LLM for extracting evaluation criteria (skills, experience, education)
  - Detect and flag ambiguous requirements
  - Store criteria in EvaluationCriteria model with configurable weights
  - Display extracted criteria to HR User for confirmation
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [ ]* 3.1 Write property test for JD parsing completeness
  - **Property 5: Job Description Parsing Completeness**
  - **Validates: Requirements 3.1, 3.2**
  - **Post-MVP: Comprehensive JD validation**

- [ ]* 3.2 Write property test for ambiguity detection
  - **Property 6: Ambiguity Detection**
  - **Validates: Requirements 3.3**
  - **Post-MVP: Automated ambiguity detection**

- [ ] 4. Implement Evaluation Engine
  - Create candidate evaluation service
  - Implement weighted scoring algorithm (skills, experience, education)
  - Generate Candidate Score (0-100) and Confidence Score (0-100)
  - Generate explainable reasoning with strengths and gaps
  - Create detailed breakdown (skills match, experience match, education match)
  - Store evaluations in CandidateEvaluation model
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.2, 5.3, 5.4_

- [ ] 4.1 Write property test for score bounds and structure
  - **Property 8: Score Bounds and Structure**
  - **Validates: Requirements 4.1, 4.3, 4.4**
  - **MVP: Critical**

- [ ] 4.2 Write property test for candidate ranking correctness
  - **Property 9: Candidate Ranking Correctness**
  - **Validates: Requirements 4.2, 4.5**
  - **MVP: Critical**

- [ ]* 4.3 Write property test for threshold filtering
  - **Property 10: Threshold Filtering**
  - **Validates: Requirements 5.1**
  - **Post-MVP: Edge case validation**

- [ ]* 4.4 Write property test for explanation grounding
  - **Property 11: Explanation Grounding**
  - **Validates: Requirements 5.3, 5.4**
  - **Post-MVP: AI hallucination prevention**

- [ ] 5. Implement Reasoning Logger
  - Create logging service for all AI decisions
  - Store logs with timestamp, action type, input/output data, reasoning, confidence
  - Implement searchable and filterable log interface
  - Create API endpoints for log retrieval
  - _Requirements: 8.4, 11.1, 11.2, 11.3, 11.4_

- [ ] 5.1 Write property test for audit trail completeness
  - **Property 17: Audit Trail Completeness**
  - **Validates: Requirements 8.4, 11.1, 11.3, 11.4**
  - **MVP: Critical**

- [ ] 6. Implement MCP Integration Layer
  - Set up MCP server infrastructure
  - Create Gmail MCP Server with tools: read_emails, send_email, search_emails
  - Create Google Calendar MCP Server with tools: get_availability, create_event, update_event
  - Implement OAuth 2.0 authentication for Gmail and Calendar
  - Store integration credentials securely (encrypted)
  - _Requirements: 12.1, 12.2, 12.4_

- [ ] 6.1 Write unit tests for MCP server tool calls
  - Test Gmail MCP tools (read, send, search)
  - Test Calendar MCP tools (availability, create, update)
  - _Requirements: 12.1, 12.2_
  - **MVP: Essential**

- [ ] 7. Implement Scheduling Agent
  - Create scheduling service using Calendar MCP Server
  - Generate available Interview Slots based on HR User availability preferences
  - Implement slot booking logic with double-booking prevention
  - Send interview invitation emails using Gmail MCP Server
  - Handle candidate responses and confirmations
  - Update calendars on confirmation
  - Send reminder emails after 48 hours of no response
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 7.1 Write property test for scheduling constraint satisfaction
  - **Property 12: Scheduling Constraint Satisfaction**
  - **Validates: Requirements 6.2, 6.5, 7.2, 7.3, 7.5**
  - **MVP: Critical**

- [ ]* 7.2 Write property test for calendar synchronization
  - **Property 13: Calendar Synchronization**
  - **Validates: Requirements 6.3, 12.3**
  - **Post-MVP: Integration validation**

- [ ] 7.3 Write property test for email content completeness
  - **Property 14: Email Content Completeness**
  - **Validates: Requirements 6.6, 10.4**
  - **MVP: Critical**

- [ ]* 7.4 Write property test for availability update isolation
  - **Property 15: Availability Update Isolation**
  - **Validates: Requirements 7.4**
  - **Post-MVP: Edge case handling**

- [ ] 8. Implement User Settings and Configuration
  - Create settings page UI
  - Implement approval gate configuration (shortlist, scheduling, bulk rejection)
  - Implement confidence threshold setting
  - Implement working hours and availability configuration
  - Implement interview duration and buffer time settings
  - Implement notification preferences (email, in-app)
  - Store settings in UserSettings model
  - _Requirements: 7.1, 13.1, 13.2, 13.3, 13.4, 13.5, 14.5_

- [ ]* 8.1 Write property test for confidence threshold enforcement
  - **Property 23: Confidence Threshold Enforcement**
  - **Validates: Requirements 13.2, 13.3**
  - **Post-MVP: Configuration validation**

- [ ]* 8.2 Write property test for configuration application
  - **Property 24: Configuration Application**
  - **Validates: Requirements 13.4**
  - **Post-MVP: Settings consistency**

- [ ] 9. Implement Dashboard UI
  - Create dashboard page with summary cards (Active Roles, Pending Approvals, Time Saved)
  - Display role list table with stats
  - Implement real-time updates using WebSockets or polling
  - Create "+ New Role" flow
  - _Requirements: 9.1, 9.2, 9.5_

- [ ]* 9.1 Write property test for candidate display completeness
  - **Property 18: Candidate Display Completeness**
  - **Validates: Requirements 8.1, 9.1**
  - **Post-MVP: UI validation**

- [ ]* 9.2 Write property test for metrics calculation correctness
  - **Property 21: Metrics Calculation Correctness**
  - **Validates: Requirements 9.5**
  - **Post-MVP: Metrics accuracy**

- [ ] 10. Implement Role Detail Page
  - Create role detail page with candidate list
  - Implement tabs (All, Shortlisted, Rejected, Needs Review)
  - Display candidate table with scores, status, AI reasoning preview
  - Implement batch actions (Approve Selected, Reject Selected)
  - Implement filtering by score, skills, experience, source
  - _Requirements: 4.2, 8.1, 9.1, 9.3_

- [ ]* 10.1 Write property test for filter correctness
  - **Property 19: Filter Correctness**
  - **Validates: Requirements 9.3**
  - **Post-MVP: Filter validation**

- [ ] 11. Implement Candidate Profile Page
  - Create candidate profile page with detailed evaluation
  - Display AI Match Score, Confidence Score, reasoning card
  - Show breakdown (skills match, experience match, education match)
  - Display strengths and gaps lists
  - Implement action buttons (Approve, Reject, Add Note)
  - Show resume preview
  - _Requirements: 4.3, 4.4, 5.2, 5.3, 5.4, 8.1_

- [ ] 12. Implement Approval Request Modal
  - Create approval modal for shortlist review
  - Display summary stats and AI reasoning
  - Show top candidate previews
  - Implement approval workflow (Approve, Modify, Reject)
  - Trigger scheduling on approval
  - _Requirements: 5.1, 5.2, 8.2, 8.3_

- [ ] 12.1 Write property test for override capability
  - **Property 16: Override Capability**
  - **Validates: Requirements 8.2, 8.3**
  - **MVP: Critical**

- [ ] 13. Implement Interview Scheduling Page
  - Create scheduling dashboard with interview list
  - Display status badges (Confirmed, Pending, Auto-scheduled)
  - Show pending confirmations section
  - Implement "Send reminder" functionality
  - Display mini calendar with interview dates
  - _Requirements: 6.1, 6.3, 6.4, 6.5_

- [ ] 14. Implement Reasoning Logs Page
  - Create logs page with searchable table
  - Implement filters (date, action type, confidence, candidate, role)
  - Display log entries with expandable details
  - Show full reasoning breakdown on expansion
  - _Requirements: 11.2, 11.3, 11.4_

- [ ] 15. Implement Candidate Communication
  - Create email templates for acknowledgment, invitation, rejection
  - Implement acknowledgment email within 24 hours of resume processing
  - Implement interview invitation email after approval
  - Implement rejection email for non-selected candidates
  - Ensure all emails include company name, position, contact method
  - Use supportive, professional tone
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ]* 15.1 Write property test for rejection workflow completeness
  - **Property 22: Rejection Workflow Completeness**
  - **Validates: Requirements 10.3**
  - **Post-MVP: Workflow validation**

- [ ] 16. Implement Notification System
  - Create notification service
  - Implement batch completion notifications
  - Implement pending approval notifications
  - Implement candidate response notifications
  - Implement error notifications
  - Respect user notification preferences (email, in-app, both)
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ]* 16.1 Write property test for event-driven notifications
  - **Property 25: Event-Driven Notifications**
  - **Validates: Requirements 14.1, 14.2, 14.3, 14.4, 14.5**
  - **Post-MVP: Notification validation**

- [ ] 17. Implement Error Handling and Recovery
  - Implement graceful error handling for parsing failures
  - Implement validation prompting for missing JD criteria
  - Implement conflict resolution for scheduling
  - Implement integration error recovery with troubleshooting instructions
  - Use supportive, non-technical error messages
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ]* 17.1 Write property test for validation prompting
  - **Property 26: Validation Prompting**
  - **Validates: Requirements 15.2**
  - **Post-MVP: Validation edge cases**

- [ ]* 17.2 Write property test for conflict resolution
  - **Property 27: Conflict Resolution**
  - **Validates: Requirements 15.3**
  - **Post-MVP: Conflict handling**

- [ ]* 17.3 Write property test for integration error recovery
  - **Property 28: Integration Error Recovery**
  - **Validates: Requirements 15.4**
  - **Post-MVP: Error recovery**

- [ ] 18. Implement Data Export
  - Create export functionality for candidate data
  - Generate CSV with all candidate information, scores, reasoning, status history
  - Implement export button on role detail page
  - _Requirements: 9.4_

- [ ]* 18.1 Write property test for export completeness
  - **Property 20: Export Completeness**
  - **Validates: Requirements 9.4**
  - **Post-MVP: Export validation**

- [ ] 19. Implement JD Update and Re-evaluation
  - Create JD update endpoint
  - Implement re-evaluation of all candidates when JD changes
  - Notify HR User of shortlist changes
  - _Requirements: 3.4_

- [ ]* 19.1 Write property test for evaluation update propagation
  - **Property 7: Evaluation Update Propagation**
  - **Validates: Requirements 3.4**
  - **Post-MVP: Update consistency**

- [ ] 20. Implement Email Inbox Integration
  - Create email ingestion service using Gmail MCP Server
  - Automatically ingest resumes from designated email addresses
  - Associate ingested resumes with correct role
  - _Requirements: 1.5_

- [ ] 21. Polish UI and UX
  - Apply HireFlow brand design (colors, typography, spacing)
  - Implement smooth transitions and micro-animations
  - Add loading states (skeleton screens)
  - Add empty states with encouraging messages
  - Ensure WCAG AA accessibility compliance
  - Implement keyboard navigation
  - Test mobile responsiveness
  - _Requirements: All (UI/UX)_

- [ ] 22. Implement Security and Privacy
  - Encrypt PII data at rest (AES-256)
  - Implement rate limiting on API endpoints
  - Implement input validation and sanitization
  - Configure CORS properly
  - Ensure HTTPS only
  - Implement prompt injection protection for LLM inputs
  - _Requirements: All (Security)_

- [ ] 23. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 24. Performance Optimization
  - Optimize batch resume processing (target: 500 resumes in <5 minutes)
  - Implement caching with Redis for frequently accessed data
  - Optimize database queries with proper indexing
  - Implement lazy loading in UI
  - _Requirements: All (Performance)_

- [ ]* 24.1 Write performance tests
  - Test batch processing speed
  - Test dashboard load time
  - Test real-time update latency
  - _Requirements: All (Performance)_
  - **Post-MVP: Performance optimization**

- [ ] 25. Deployment and Monitoring
  - Set up CI/CD pipeline (GitHub Actions)
  - Deploy to production (Vercel for frontend, Cloud Run for backend)
  - Set up database backups
  - Implement application monitoring (error tracking, performance metrics)
  - Set up AI metrics tracking (evaluation accuracy, confidence distribution)
  - _Requirements: All (Deployment)_

---

## Implementation Notes

### Testing Approach

- **MVP tests** (no `*` marker): 8 critical property tests + essential unit tests
- **Post-MVP tests** (marked with `*`): 20 comprehensive property tests for production readiness
- Each property test should run a minimum of 100 iterations
- Property tests must be tagged with: `**Feature: ai-resume-screening, Property {number}: {property_text}**`
- Unit tests focus on specific examples and integration points
- Write tests after implementing core functionality (implementation-first approach)
- Property-based tests validate universal correctness properties across all inputs
- Unit tests validate specific examples, edge cases, and integration points

### MVP vs Post-MVP Test Breakdown

**MVP Tests (8 Critical):**
1. ✅ Property 1: File Format Validation
2. ✅ Property 4: Resume Parsing Completeness
3. ✅ Property 8: Score Bounds and Structure
4. ✅ Property 9: Candidate Ranking Correctness
5. ✅ Property 12: Scheduling Constraint Satisfaction
6. ✅ Property 14: Email Content Completeness
7. ✅ Property 16: Override Capability
8. ✅ Property 17: Audit Trail Completeness

**Post-MVP Tests (20 Comprehensive):**
- Properties 2, 3, 5, 6, 7, 10, 11, 13, 15, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28
- Focus: Edge cases, scalability, comprehensive validation
- Implement after MVP user validation

### Development Sequence

1. **Phase 1 (Tasks 1-5):** Core backend services (parsing, evaluation, logging)
2. **Phase 2 (Tasks 6-8):** Integrations and scheduling
3. **Phase 3 (Tasks 9-14):** Frontend UI
4. **Phase 4 (Tasks 15-20):** Communication and automation
5. **Phase 5 (Tasks 21-25):** Polish, security, and deployment

### Key Dependencies

- Tasks 2-5 can be developed in parallel after Task 1
- Task 7 depends on Task 6 (MCP integration)
- Tasks 9-14 (UI) depend on Tasks 2-5 (backend services)
- Task 20 depends on Task 6 (Gmail MCP)

### Checkpoints

- **Checkpoint 1 (After Task 5):** Core AI services working
- **Checkpoint 2 (After Task 8):** Integrations and settings complete
- **Checkpoint 3 (After Task 14):** Full UI functional
- **Final Checkpoint (Task 23):** All tests passing, ready for polish

---

## Success Criteria

**MVP Success Criteria:**
- 8 critical correctness properties validated through property-based tests
- All 15 requirements implemented with core functionality
- Essential unit tests passing
- Basic error handling and user feedback working
- Core user workflows functional (upload → evaluate → approve → schedule)
- Integration with Gmail and Calendar working
- WCAG AA accessibility compliance for core features

**Post-MVP Success Criteria:**
- All 28 correctness properties validated through property-based tests
- Comprehensive edge case coverage
- Dashboard loads in <1 second for 1000 candidates
- Batch processing handles 500 resumes in <5 minutes
- All integration tests passing
- Zero critical security vulnerabilities
- Performance optimization complete
