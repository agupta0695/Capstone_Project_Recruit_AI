import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { 
  getAvailableTimeSlots, 
  scheduleInterview, 
  batchScheduleInterviews,
  getInterviewerAvailability,
  createCalendarEvent
} from '@/lib/calendar';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key';

function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  
  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

// POST - Schedule interview(s)
export async function POST(request: NextRequest) {
  const user = verifyToken(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { 
      candidateId, 
      candidateIds, 
      interviewType = 'technical',
      mode = 'single' 
    } = body;

    if (mode === 'batch' && candidateIds?.length > 0) {
      // Batch interview scheduling
      console.log(`📅 Batch scheduling interviews for ${candidateIds.length} candidates`);
      
      const candidates = await prisma.candidate.findMany({
        where: {
          id: { in: candidateIds },
          role: { userId: user.userId }
        },
        include: {
          role: true
        }
      });

      if (candidates.length === 0) {
        return NextResponse.json({ error: 'No candidates found' }, { status: 404 });
      }

      // Prepare candidate data for batch scheduling
      const candidateData = candidates.map(candidate => ({
        id: candidate.id,
        name: (candidate.profile as any)?.name || 'Unknown',
        email: (candidate.profile as any)?.email || '',
        roleId: candidate.roleId,
        roleTitle: candidate.role.title,
        evaluation: candidate.evaluation
      }));

      // Execute batch scheduling
      const schedules = await batchScheduleInterviews(candidateData);

      // Store interview schedules in database
      const interviewRecords = await Promise.all(
        schedules.map(schedule => 
          prisma.interviewSchedule.create({
            data: {
              id: schedule.id,
              candidateId: schedule.candidateId,
              roleId: schedule.roleId,
              interviewerId: schedule.interviewerId,
              interviewerName: schedule.interviewerName,
              interviewerEmail: schedule.interviewerEmail,
              scheduledTime: schedule.scheduledTime,
              duration: schedule.duration,
              type: schedule.type,
              meetingLink: schedule.meetingLink,
              status: schedule.status,
              notes: schedule.notes,
              userId: user.userId
            }
          }).catch((error: any) => {
            console.error(`Failed to store interview ${schedule.id}:`, error);
            return null;
          })
        )
      );

      return NextResponse.json({
        success: true,
        mode: 'batch',
        scheduled: schedules.length,
        interviews: schedules.map(s => ({
          id: s.id,
          candidateId: s.candidateId,
          candidateName: s.candidateName,
          interviewerName: s.interviewerName,
          scheduledTime: s.scheduledTime,
          type: s.type,
          meetingLink: s.meetingLink,
          status: s.status
        }))
      });

    } else if (candidateId) {
      // Single interview scheduling
      const candidate = await prisma.candidate.findFirst({
        where: {
          id: candidateId,
          role: { userId: user.userId }
        },
        include: {
          role: true
        }
      });

      if (!candidate) {
        return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
      }

      const candidateProfile = candidate.profile as any;
      const schedule = await scheduleInterview(
        candidate.id,
        candidateProfile?.name || 'Unknown',
        candidateProfile?.email || '',
        candidate.roleId,
        candidate.role.title,
        interviewType,
        candidate.evaluation
      );

      if (!schedule) {
        return NextResponse.json({ 
          error: 'No available interview slots found' 
        }, { status: 400 });
      }

      // Store interview in database
      try {
        await prisma.interviewSchedule.create({
          data: {
            id: schedule.id,
            candidateId: schedule.candidateId,
            roleId: schedule.roleId,
            interviewerId: schedule.interviewerId,
            interviewerName: schedule.interviewerName,
            interviewerEmail: schedule.interviewerEmail,
            scheduledTime: schedule.scheduledTime,
            duration: schedule.duration,
            type: schedule.type,
            meetingLink: schedule.meetingLink,
            status: schedule.status,
            notes: schedule.notes,
            userId: user.userId
          }
        });
      } catch (dbError) {
        console.error('Failed to store interview:', dbError);
        // Continue anyway, interview is still scheduled
      }

      // Create calendar event via n8n workflow
      let calendarEvent = null;
      try {
        console.log('📅 Creating calendar event via n8n...');
        
        const calendarData = {
          title: `Interview: ${schedule.candidateName} - ${candidate.role.title}`,
          description: `Interview with ${schedule.candidateName} for ${candidate.role.title} position.\n\nType: ${schedule.type}\nDuration: ${schedule.duration} minutes`,
          startTime: schedule.scheduledTime,
          endTime: new Date(new Date(schedule.scheduledTime).getTime() + schedule.duration * 60000).toISOString(),
          attendees: [
            candidateProfile?.email || '',
            schedule.interviewerEmail
          ].filter(email => email).join(','),
          location: 'Online Meeting',
          meetingId: schedule.id
        };

        const calendarResponse = await fetch('http://host.docker.internal:5678/webhook/schedule-event', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(calendarData)
        });

        if (calendarResponse.ok) {
          calendarEvent = await calendarResponse.json();
          console.log('✅ Calendar event created via n8n:', calendarEvent.eventId);
          
          // Update meeting link in database
          if (calendarEvent.meetingLink) {
            await prisma.interviewSchedule.update({
              where: { id: schedule.id },
              data: { meetingLink: calendarEvent.meetingLink }
            });
            schedule.meetingLink = calendarEvent.meetingLink;
          }
        } else {
          console.error('❌ Failed to create calendar event via n8n:', await calendarResponse.text());
          // Continue with local calendar event
          calendarEvent = createCalendarEvent(schedule);
        }
      } catch (error) {
        console.error('❌ Error creating calendar event via n8n:', error);
        // Fallback to local calendar event
        calendarEvent = createCalendarEvent(schedule);
      }

      return NextResponse.json({
        success: true,
        mode: 'single',
        interview: {
          id: schedule.id,
          candidateName: schedule.candidateName,
          interviewerName: schedule.interviewerName,
          scheduledTime: schedule.scheduledTime,
          duration: schedule.duration,
          type: schedule.type,
          meetingLink: schedule.meetingLink,
          status: schedule.status
        },
        calendarEvent
      });

    } else {
      return NextResponse.json({ 
        error: 'Either candidateId or candidateIds array is required' 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Interview scheduling error:', error);
    return NextResponse.json({ 
      error: 'Failed to schedule interview',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET - Get available time slots or interview history
export async function GET(request: NextRequest) {
  const user = verifyToken(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'availability';
    const interviewType = searchParams.get('type') as 'technical' | 'behavioral' | 'final' | 'screening' || 'technical';
    const daysAhead = parseInt(searchParams.get('days') || '14');

    if (action === 'availability') {
      // Get available time slots
      const timeSlots = getAvailableTimeSlots(interviewType, daysAhead);
      const interviewerAvailability = getInterviewerAvailability();

      return NextResponse.json({
        timeSlots: timeSlots.slice(0, 50), // Limit to 50 slots
        interviewerAvailability,
        summary: {
          totalSlots: timeSlots.length,
          nextAvailable: timeSlots.length > 0 ? timeSlots[0].start : null,
          interviewersAvailable: interviewerAvailability.filter(i => i.availableSlots > 0).length
        }
      });

    } else if (action === 'interviews') {
      // Get interview history
      const candidateId = searchParams.get('candidateId');
      const roleId = searchParams.get('roleId');
      const status = searchParams.get('status');
      const limit = parseInt(searchParams.get('limit') || '50');

      const where: any = { userId: user.userId };
      if (candidateId) where.candidateId = candidateId;
      if (roleId) where.roleId = roleId;
      if (status) where.status = status;

      const interviews = await prisma.interviewSchedule.findMany({
        where,
        orderBy: { scheduledTime: 'desc' },
        take: limit,
        include: {
          candidate: {
            select: {
              profile: true
            }
          },
          role: {
            select: {
              title: true,
              department: true
            }
          }
        }
      });

      return NextResponse.json({
        interviews: interviews.map(interview => ({
          id: interview.id,
          candidateId: interview.candidateId,
          candidateName: (interview.candidate?.profile as any)?.name || 'Unknown',
          roleTitle: interview.role?.title || 'Unknown',
          interviewerName: interview.interviewerName,
          scheduledTime: interview.scheduledTime,
          duration: interview.duration,
          type: interview.type,
          status: interview.status,
          meetingLink: interview.meetingLink,
          notes: interview.notes
        }))
      });

    } else {
      return NextResponse.json({ 
        error: 'Invalid action. Use "availability" or "interviews"' 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json({ 
      error: 'Failed to process calendar request' 
    }, { status: 500 });
  }
}