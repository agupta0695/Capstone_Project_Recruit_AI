/**
 * Draft Generation Module for HireAI
 * 
 * Generates personalized emails, interview questions, and communications
 * using AI-powered templates and candidate evaluation data
 */

import type { InterviewSchedule } from './calendar';

export interface EmailDraft {
  id: string;
  type: 'interview_invitation' | 'rejection' | 'offer' | 'follow_up' | 'feedback_request';
  to: string;
  cc?: string[];
  subject: string;
  body: string;
  attachments?: string[];
  scheduledSend?: Date;
  priority: 'low' | 'normal' | 'high';
  tags: string[];
}

export interface InterviewQuestions {
  id: string;
  interviewType: 'technical' | 'behavioral' | 'final' | 'screening';
  candidateName: string;
  roleTitle: string;
  questions: Array<{
    category: string;
    question: string;
    followUp?: string[];
    expectedAnswer?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    timeAllocation: number; // minutes
  }>;
  totalDuration: number;
  focusAreas: string[];
}

export interface CommunicationDraft {
  id: string;
  type: 'email' | 'sms' | 'slack' | 'teams';
  recipient: {
    name: string;
    email: string;
    phone?: string;
  };
  content: string;
  metadata: {
    candidateId: string;
    roleId: string;
    interviewId?: string;
    evaluationScore?: number;
  };
}

/**
 * Generate personalized interview invitation email
 */
export function generateInterviewInvitation(
  schedule: InterviewSchedule,
  candidateEvaluation: any
): EmailDraft {
  const interviewTypeDisplay = schedule.type.charAt(0).toUpperCase() + schedule.type.slice(1);
  const dateStr = schedule.scheduledTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const timeStr = schedule.scheduledTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  // Personalize based on evaluation
  let personalizedIntro = '';
  if (candidateEvaluation?.overallScore >= 85) {
    personalizedIntro = `We were impressed by your strong background in ${candidateEvaluation.matchedSkills?.slice(0, 3).join(', ')} and your experience in ${candidateEvaluation.strengths?.[0]?.toLowerCase() || 'software development'}.`;
  } else if (candidateEvaluation?.overallScore >= 70) {
    personalizedIntro = `Thank you for your interest in our ${schedule.roleTitle} position. We'd like to learn more about your experience with ${candidateEvaluation.matchedSkills?.slice(0, 2).join(' and ')}.`;
  } else {
    personalizedIntro = `Thank you for applying to our ${schedule.roleTitle} position. We'd like to discuss your background and experience.`;
  }

  // Generate interview focus areas
  const focusAreas = candidateEvaluation?.interviewRecommendations?.focus || [
    'Technical skills assessment',
    'Problem-solving approach',
    'Team collaboration experience'
  ];

  const body = `
Dear ${schedule.candidateName},

${personalizedIntro}

We would like to invite you for a ${interviewTypeDisplay.toLowerCase()} interview for the ${schedule.roleTitle} position.

**Interview Details:**
• **Date & Time:** ${dateStr} at ${timeStr}
• **Duration:** ${schedule.duration} minutes
• **Interviewer:** ${schedule.interviewerName}
• **Format:** Virtual meeting via Zoom
• **Meeting Link:** ${schedule.meetingLink}

**What to Expect:**
This ${interviewTypeDisplay.toLowerCase()} interview will focus on:
${focusAreas.map(area => `• ${area}`).join('\n')}

**Preparation Tips:**
• Please test your audio/video setup beforehand
• Have your resume and portfolio ready to discuss
• Prepare examples of your work related to ${candidateEvaluation?.matchedSkills?.slice(0, 2).join(' and ') || 'the role requirements'}
• Feel free to prepare questions about the role and our team

If you need to reschedule or have any questions, please reply to this email or contact us at hiring@company.com.

We look forward to speaking with you!

Best regards,
${schedule.interviewerName}
${MOCK_INTERVIEWERS.find(i => i.id === schedule.interviewerId)?.role || 'Hiring Team'}
Company Name

---
This interview was automatically scheduled based on your application evaluation. Interview ID: ${schedule.id}
  `.trim();

  return {
    id: `email-${schedule.id}`,
    type: 'interview_invitation',
    to: schedule.candidateEmail,
    cc: [schedule.interviewerEmail],
    subject: `Interview Invitation - ${schedule.roleTitle} Position at Company Name`,
    body,
    priority: candidateEvaluation?.overallScore >= 80 ? 'high' : 'normal',
    tags: ['interview', 'invitation', schedule.type, `score-${candidateEvaluation?.overallScore || 'unknown'}`]
  };
}

/**
 * Generate personalized rejection email
 */
export function generateRejectionEmail(
  candidateName: string,
  candidateEmail: string,
  roleTitle: string,
  evaluation: any
): EmailDraft {
  // Personalize rejection based on evaluation
  let feedback = '';
  if (evaluation?.concerns?.length > 0) {
    const mainConcern = evaluation.concerns[0];
    if (mainConcern.includes('experience')) {
      feedback = 'While your background shows promise, we are looking for candidates with more extensive experience in our core technology stack.';
    } else if (mainConcern.includes('skills')) {
      feedback = 'We were impressed by your application, but we are seeking candidates with stronger alignment to our specific technical requirements.';
    } else {
      feedback = 'After careful consideration, we have decided to move forward with candidates whose experience more closely matches our current needs.';
    }
  } else {
    feedback = 'While your qualifications are impressive, we have decided to proceed with other candidates at this time.';
  }

  const encouragement = evaluation?.strengths?.length > 0 
    ? `We were particularly impressed by your ${evaluation.strengths[0].toLowerCase()}.`
    : 'We encourage you to apply for future opportunities that may be a better fit.';

  const body = `
Dear ${candidateName},

Thank you for your interest in the ${roleTitle} position at Company Name and for taking the time to submit your application.

${feedback}

${encouragement} We will keep your resume on file and may reach out if a suitable position becomes available in the future.

We wish you the best of luck in your job search and future endeavors.

Best regards,
The Hiring Team
Company Name

---
Application ID: ${evaluation?.applicationId || 'N/A'}
  `.trim();

  return {
    id: `rejection-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    type: 'rejection',
    to: candidateEmail,
    subject: `Update on Your Application - ${roleTitle} Position`,
    body,
    priority: 'normal',
    tags: ['rejection', 'application-update']
  };
}

/**
 * Generate interview questions based on candidate evaluation
 */
export function generateInterviewQuestions(
  candidateName: string,
  roleTitle: string,
  interviewType: 'technical' | 'behavioral' | 'final' | 'screening',
  evaluation: any
): InterviewQuestions {
  const questions: InterviewQuestions['questions'] = [];
  let totalDuration = 0;

  if (interviewType === 'technical') {
    // Technical questions based on matched and missing skills
    const matchedSkills = evaluation?.matchedSkills || [];
    const missingSkills = evaluation?.missingSkills || [];

    // Questions for matched skills (to validate)
    matchedSkills.slice(0, 3).forEach((skill: string) => {
      questions.push({
        category: 'Technical Validation',
        question: `Can you walk me through a recent project where you used ${skill}? What challenges did you face and how did you solve them?`,
        followUp: [
          `What would you do differently if you had to rebuild that solution?`,
          `How did you ensure code quality and maintainability?`
        ],
        difficulty: 'medium',
        timeAllocation: 15
      });
      totalDuration += 15;
    });

    // Questions for missing skills (to assess learning ability)
    if (missingSkills.length > 0) {
      questions.push({
        category: 'Learning & Adaptability',
        question: `I notice you haven't worked extensively with ${missingSkills[0]}. How would you approach learning this technology for our role?`,
        followUp: [
          `Can you give an example of how you've quickly learned a new technology in the past?`,
          `What resources do you typically use when learning new tools?`
        ],
        difficulty: 'medium',
        timeAllocation: 10
      });
      totalDuration += 10;
    }

    // System design question
    questions.push({
      category: 'System Design',
      question: `Design a system for ${roleTitle.includes('Senior') ? 'a high-traffic web application' : 'a simple web application'} that handles user authentication and data storage.`,
      followUp: [
        'How would you handle scaling this system?',
        'What security considerations would you implement?',
        'How would you monitor and debug issues?'
      ],
      difficulty: roleTitle.includes('Senior') ? 'hard' : 'medium',
      timeAllocation: 25
    });
    totalDuration += 25;

  } else if (interviewType === 'behavioral') {
    // Behavioral questions based on evaluation concerns and strengths
    const strengths = evaluation?.strengths || [];
    const concerns = evaluation?.concerns || [];

    questions.push({
      category: 'Leadership & Collaboration',
      question: `Tell me about a time when you had to work with a difficult team member. How did you handle the situation?`,
      followUp: [
        'What would you do differently next time?',
        'How do you typically build rapport with new team members?'
      ],
      difficulty: 'medium',
      timeAllocation: 12
    });
    totalDuration += 12;

    if (strengths.some((s: string) => s.includes('leadership'))) {
      questions.push({
        category: 'Leadership',
        question: `I see you have leadership experience. Can you describe a time when you had to make a difficult technical decision that affected your team?`,
        followUp: [
          'How did you communicate this decision to stakeholders?',
          'What was the outcome and what did you learn?'
        ],
        difficulty: 'medium',
        timeAllocation: 15
      });
      totalDuration += 15;
    }

    questions.push({
      category: 'Problem Solving',
      question: `Describe a challenging technical problem you solved recently. Walk me through your thought process.`,
      followUp: [
        'How did you validate your solution?',
        'Who did you collaborate with to solve this?'
      ],
      difficulty: 'medium',
      timeAllocation: 15
    });
    totalDuration += 15;

  } else if (interviewType === 'screening') {
    // Basic screening questions
    questions.push({
      category: 'Background',
      question: `Tell me about yourself and what interests you about this ${roleTitle} position.`,
      followUp: [
        'What attracted you to our company?',
        'Where do you see yourself in 2-3 years?'
      ],
      difficulty: 'easy',
      timeAllocation: 10
    });
    totalDuration += 10;

    questions.push({
      category: 'Technical Overview',
      question: `Can you briefly describe your experience with ${evaluation?.matchedSkills?.slice(0, 2).join(' and ') || 'web development'}?`,
      followUp: [
        'What projects are you most proud of?',
        'What technologies are you most excited to work with?'
      ],
      difficulty: 'easy',
      timeAllocation: 15
    });
    totalDuration += 15;
  }

  // Add closing questions
  questions.push({
    category: 'Closing',
    question: `Do you have any questions about the role, team, or company?`,
    difficulty: 'easy',
    timeAllocation: 10
  });
  totalDuration += 10;

  return {
    id: `questions-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    interviewType,
    candidateName,
    roleTitle,
    questions,
    totalDuration,
    focusAreas: evaluation?.interviewRecommendations?.focus || [
      'Technical skills',
      'Problem-solving',
      'Team collaboration'
    ]
  };
}

/**
 * Generate follow-up email after interview
 */
export function generateFollowUpEmail(
  candidateName: string,
  candidateEmail: string,
  interviewerName: string,
  roleTitle: string,
  interviewType: string,
  nextSteps: string
): EmailDraft {
  const body = `
Dear ${candidateName},

Thank you for taking the time to interview with us today for the ${roleTitle} position. It was a pleasure speaking with you about your experience and learning more about your background.

**Next Steps:**
${nextSteps}

We will be in touch within the next 3-5 business days with an update on your application status.

If you have any questions in the meantime, please don't hesitate to reach out.

Thank you again for your interest in joining our team.

Best regards,
${interviewerName}
Company Name
  `.trim();

  return {
    id: `followup-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    type: 'follow_up',
    to: candidateEmail,
    subject: `Thank you for interviewing - ${roleTitle} Position`,
    body,
    priority: 'normal',
    tags: ['follow-up', 'post-interview']
  };
}

/**
 * Generate offer letter draft
 */
export function generateOfferLetter(
  candidateName: string,
  candidateEmail: string,
  roleTitle: string,
  evaluation: any,
  salaryOffer: number,
  startDate: Date
): EmailDraft {
  const startDateStr = startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const body = `
Dear ${candidateName},

We are delighted to extend an offer for the position of ${roleTitle} at Company Name!

After careful consideration of your qualifications and our interview discussions, we believe you would be an excellent addition to our team.

**Offer Details:**
• **Position:** ${roleTitle}
• **Annual Salary:** $${salaryOffer.toLocaleString()}
• **Start Date:** ${startDateStr}
• **Benefits:** Health, dental, vision insurance, 401(k) matching, PTO, and more
• **Work Arrangement:** Hybrid (3 days in office, 2 days remote)

**Next Steps:**
Please review the attached offer letter and employment agreement. If you choose to accept this offer, please sign and return the documents by [DATE].

We are excited about the possibility of you joining our team and contributing to our continued success.

Congratulations, and we look forward to hearing from you soon!

Best regards,
The Hiring Team
Company Name

---
Offer based on evaluation score: ${evaluation?.overallScore}/100
  `.trim();

  return {
    id: `offer-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    type: 'offer',
    to: candidateEmail,
    subject: `Job Offer - ${roleTitle} Position at Company Name`,
    body,
    attachments: ['offer_letter.pdf', 'employment_agreement.pdf'],
    priority: 'high',
    tags: ['offer', 'job-offer', 'high-priority']
  };
}

/**
 * Batch generate communications for multiple candidates
 */
export function batchGenerateCommunications(
  candidates: Array<{
    id: string;
    name: string;
    email: string;
    roleTitle: string;
    evaluation: any;
    status: 'shortlisted' | 'rejected' | 'interview_scheduled' | 'offer_extended';
    interviewSchedule?: InterviewSchedule;
  }>
): EmailDraft[] {
  const drafts: EmailDraft[] = [];

  candidates.forEach(candidate => {
    switch (candidate.status) {
      case 'interview_scheduled':
        if (candidate.interviewSchedule) {
          drafts.push(generateInterviewInvitation(candidate.interviewSchedule, candidate.evaluation));
        }
        break;
      
      case 'rejected':
        drafts.push(generateRejectionEmail(
          candidate.name,
          candidate.email,
          candidate.roleTitle,
          candidate.evaluation
        ));
        break;
      
      case 'offer_extended':
        const salaryOffer = calculateSalaryOffer(candidate.evaluation);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 14); // 2 weeks from now
        
        drafts.push(generateOfferLetter(
          candidate.name,
          candidate.email,
          candidate.roleTitle,
          candidate.evaluation,
          salaryOffer,
          startDate
        ));
        break;
    }
  });

  return drafts;
}

/**
 * Calculate salary offer based on evaluation
 */
function calculateSalaryOffer(evaluation: any): number {
  const baseRanges = {
    'Junior': { min: 70000, max: 90000 },
    'Mid-Level': { min: 90000, max: 120000 },
    'Senior': { min: 120000, max: 160000 },
    'Lead': { min: 160000, max: 200000 }
  };

  const experienceLevel = evaluation?.experienceLevel || 'Mid-Level';
  const range = baseRanges[experienceLevel as keyof typeof baseRanges] || baseRanges['Mid-Level'];
  
  // Adjust based on evaluation score
  const score = evaluation?.overallScore || 70;
  const scoreMultiplier = score / 100;
  
  const offerAmount = range.min + ((range.max - range.min) * scoreMultiplier);
  
  // Round to nearest 5000
  return Math.round(offerAmount / 5000) * 5000;
}

// Mock interviewers data for draft generation
const MOCK_INTERVIEWERS = [
  {
    id: 'int-001',
    name: 'Sarah Chen',
    email: 'sarah.chen@company.com',
    role: 'Senior Engineering Manager'
  },
  {
    id: 'int-002', 
    name: 'Michael Rodriguez',
    email: 'michael.rodriguez@company.com',
    role: 'Principal Engineer'
  },
  {
    id: 'int-003',
    name: 'Emily Johnson',
    email: 'emily.johnson@company.com',
    role: 'HR Director'
  }
];