/**
 * Calendar Integration Module for HireAI
 * 
 * Simulates calendar integration for autonomous interview scheduling
 * In production, this would integrate with Google Calendar, Outlook, or Calendly
 */

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
  interviewerId?: string;
  interviewerName?: string;
}

export interface InterviewSchedule {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  roleId: string;
  roleTitle: string;
  interviewerId: string;
  interviewerName: string;
  interviewerEmail: string;
  scheduledTime: Date;
  duration: number; // minutes
  type: 'technical' | 'behavioral' | 'final' | 'screening';
  meetingLink?: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  attendees: Array<{
    email: string;
    name: string;
    role: 'organizer' | 'required' | 'optional';
  }>;
  location?: string;
  meetingLink?: string;
}

// Simulated interviewer availability
const MOCK_INTERVIEWERS = [
  {
    id: 'int-001',
    name: 'Sarah Chen',
    email: 'sarah.chen@company.com',
    role: 'Senior Engineering Manager',
    specialties: ['technical', 'leadership'],
    timezone: 'America/New_York'
  },
  {
    id: 'int-002', 
    name: 'Michael Rodriguez',
    email: 'michael.rodriguez@company.com',
    role: 'Principal Engineer',
    specialties: ['technical', 'system-design'],
    timezone: 'America/Los_Angeles'
  },
  {
    id: 'int-003',
    name: 'Emily Johnson',
    email: 'emily.johnson@company.com',
    role: 'HR Director',
    specialties: ['behavioral', 'cultural-fit'],
    timezone: 'America/Chicago'
  }
];

/**
 * Get available time slots for the next 2 weeks
 */
export function getAvailableTimeSlots(
  interviewType: 'technical' | 'behavioral' | 'final' | 'screening' = 'technical',
  daysAhead: number = 14
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const now = new Date();
  
  // Get suitable interviewers for the type
  const suitableInterviewers = MOCK_INTERVIEWERS.filter(interviewer =>
    interviewer.specialties.includes(interviewType) || 
    interviewer.specialties.includes('technical')
  );

  for (let day = 1; day <= daysAhead; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() + day);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Generate slots for business hours (9 AM - 5 PM)
    for (let hour = 9; hour < 17; hour++) {
      for (const interviewer of suitableInterviewers) {
        const start = new Date(date);
        start.setHours(hour, 0, 0, 0);
        
        const end = new Date(start);
        end.setHours(hour + 1, 0, 0, 0);
        
        // Simulate some unavailability (70% availability)
        const available = Math.random() > 0.3;
        
        slots.push({
          start,
          end,
          available,
          interviewerId: interviewer.id,
          interviewerName: interviewer.name
        });
      }
    }
  }
  
  return slots.filter(slot => slot.available);
}

/**
 * Find optimal interview slot based on candidate evaluation
 */
export function findOptimalInterviewSlot(
  candidateEvaluation: any,
  interviewType: 'technical' | 'behavioral' | 'final' | 'screening' = 'technical'
): TimeSlot | null {
  const availableSlots = getAvailableTimeSlots(interviewType);
  
  if (availableSlots.length === 0) return null;
  
  // Prioritize slots based on evaluation urgency
  let priorityDays = 7; // Default: within a week
  
  if (candidateEvaluation.overallScore >= 85) {
    priorityDays = 3; // High priority: within 3 days
  } else if (candidateEvaluation.overallScore >= 70) {
    priorityDays = 5; // Medium priority: within 5 days
  }
  
  const prioritySlots = availableSlots.filter(slot => {
    const daysDiff = Math.ceil((slot.start.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysDiff <= priorityDays;
  });
  
  // Return earliest available priority slot, or earliest available slot
  const slotsToConsider = prioritySlots.length > 0 ? prioritySlots : availableSlots;
  return slotsToConsider.sort((a, b) => a.start.getTime() - b.start.getTime())[0];
}

/**
 * Schedule an interview
 */
export async function scheduleInterview(
  candidateId: string,
  candidateName: string,
  candidateEmail: string,
  roleId: string,
  roleTitle: string,
  interviewType: 'technical' | 'behavioral' | 'final' | 'screening',
  candidateEvaluation?: any
): Promise<InterviewSchedule | null> {
  try {
    // Find optimal time slot
    const timeSlot = findOptimalInterviewSlot(candidateEvaluation, interviewType);
    
    if (!timeSlot) {
      console.log('❌ No available interview slots found');
      return null;
    }
    
    // Get interviewer details
    const interviewer = MOCK_INTERVIEWERS.find(int => int.id === timeSlot.interviewerId);
    if (!interviewer) {
      console.log('❌ Interviewer not found');
      return null;
    }
    
    // Generate meeting link (simulate Zoom/Teams integration)
    const meetingLink = `https://zoom.us/j/${Math.random().toString().substr(2, 10)}`;
    
    // Create interview schedule
    const schedule: InterviewSchedule = {
      id: `interview-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      candidateId,
      candidateName,
      candidateEmail,
      roleId,
      roleTitle,
      interviewerId: interviewer.id,
      interviewerName: interviewer.name,
      interviewerEmail: interviewer.email,
      scheduledTime: timeSlot.start,
      duration: interviewType === 'technical' ? 90 : 60,
      type: interviewType,
      meetingLink,
      status: 'scheduled',
      notes: `Auto-scheduled based on candidate evaluation score: ${candidateEvaluation?.overallScore || 'N/A'}`
    };
    
    console.log(`✅ Interview scheduled: ${candidateName} with ${interviewer.name} on ${timeSlot.start.toLocaleString()}`);
    
    return schedule;
  } catch (error) {
    console.error('❌ Error scheduling interview:', error);
    return null;
  }
}

/**
 * Create calendar event from interview schedule
 */
export function createCalendarEvent(schedule: InterviewSchedule): CalendarEvent {
  const endTime = new Date(schedule.scheduledTime);
  endTime.setMinutes(endTime.getMinutes() + schedule.duration);
  
  return {
    id: `cal-${schedule.id}`,
    title: `${schedule.type.charAt(0).toUpperCase() + schedule.type.slice(1)} Interview - ${schedule.candidateName}`,
    description: `
Interview Details:
• Candidate: ${schedule.candidateName}
• Role: ${schedule.roleTitle}
• Type: ${schedule.type.charAt(0).toUpperCase() + schedule.type.slice(1)} Interview
• Duration: ${schedule.duration} minutes
• Meeting Link: ${schedule.meetingLink}

${schedule.notes ? `Notes: ${schedule.notes}` : ''}
    `.trim(),
    start: schedule.scheduledTime,
    end: endTime,
    attendees: [
      {
        email: schedule.interviewerEmail,
        name: schedule.interviewerName,
        role: 'organizer'
      },
      {
        email: schedule.candidateEmail,
        name: schedule.candidateName,
        role: 'required'
      }
    ],
    location: 'Virtual Meeting',
    meetingLink: schedule.meetingLink
  };
}

/**
 * Batch schedule interviews for multiple candidates
 */
export async function batchScheduleInterviews(
  candidates: Array<{
    id: string;
    name: string;
    email: string;
    roleId: string;
    roleTitle: string;
    evaluation: any;
  }>
): Promise<InterviewSchedule[]> {
  const schedules: InterviewSchedule[] = [];
  
  // Sort candidates by evaluation score (highest first)
  const sortedCandidates = candidates.sort((a, b) => 
    (b.evaluation?.overallScore || 0) - (a.evaluation?.overallScore || 0)
  );
  
  for (const candidate of sortedCandidates) {
    // Determine interview type based on evaluation
    let interviewType: 'technical' | 'behavioral' | 'screening' = 'screening';
    
    if (candidate.evaluation?.overallScore >= 80) {
      interviewType = 'technical';
    } else if (candidate.evaluation?.overallScore >= 60) {
      interviewType = 'behavioral';
    }
    
    const schedule = await scheduleInterview(
      candidate.id,
      candidate.name,
      candidate.email,
      candidate.roleId,
      candidate.roleTitle,
      interviewType,
      candidate.evaluation
    );
    
    if (schedule) {
      schedules.push(schedule);
    }
    
    // Add small delay to avoid conflicts
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return schedules;
}

/**
 * Get interviewer availability summary
 */
export function getInterviewerAvailability(): Array<{
  interviewer: typeof MOCK_INTERVIEWERS[0];
  availableSlots: number;
  nextAvailable: Date | null;
}> {
  const availability = MOCK_INTERVIEWERS.map(interviewer => {
    const slots = getAvailableTimeSlots().filter(slot => 
      slot.interviewerId === interviewer.id
    );
    
    return {
      interviewer,
      availableSlots: slots.length,
      nextAvailable: slots.length > 0 ? slots[0].start : null
    };
  });
  
  return availability.sort((a, b) => b.availableSlots - a.availableSlots);
}