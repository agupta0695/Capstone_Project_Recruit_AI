import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { 
  generateInterviewInvitation,
  generateRejectionEmail,
  generateInterviewQuestions,
  generateOfferLetter,
  generateFollowUpEmail,
  batchGenerateCommunications
} from '@/lib/draftGeneration';

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

// POST - Generate drafts (emails, questions, etc.)
export async function POST(request: NextRequest) {
  const user = verifyToken(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { 
      type, 
      candidateId, 
      candidateIds,
      interviewId,
      mode = 'single',
      customData = {}
    } = body;

    if (mode === 'batch' && candidateIds?.length > 0) {
      // Batch draft generation
      console.log(`📝 Batch generating ${type} drafts for ${candidateIds.length} candidates`);
      
      const candidates = await prisma.candidate.findMany({
        where: {
          id: { in: candidateIds },
          role: { userId: user.userId }
        },
        include: {
          role: true,
          evaluation: true,
          interviews: {
            orderBy: { scheduledTime: 'desc' },
            take: 1
          }
        }
      });

      if (candidates.length === 0) {
        return NextResponse.json({ error: 'No candidates found' }, { status: 404 });
      }

      // Prepare candidate data for batch generation
      const candidateData = candidates.map(candidate => {
        const profile = candidate.profile as any;
        let status: 'shortlisted' | 'rejected' | 'interview_scheduled' | 'offer_extended' = 'shortlisted';
        
        if (candidate.interviews.length > 0) {
          status = 'interview_scheduled';
        } else if (candidate.status === 'Rejected') {
          status = 'rejected';
        } else if (type === 'offer') {
          status = 'offer_extended';
        }

        return {
          id: candidate.id,
          name: profile?.name || 'Unknown',
          email: profile?.email || '',
          roleTitle: candidate.role.title,
          evaluation: candidate.evaluation,
          status,
          interviewSchedule: candidate.interviews[0] ? {
            id: candidate.interviews[0].id,
            candidateId: candidate.id,
            candidateName: profile?.name || 'Unknown',
            candidateEmail: profile?.email || '',
            roleId: candidate.roleId,
            roleTitle: candidate.role.title,
            interviewerId: candidate.interviews[0].interviewerId,
            interviewerName: candidate.interviews[0].interviewerName,
            interviewerEmail: candidate.interviews[0].interviewerEmail,
            scheduledTime: candidate.interviews[0].scheduledTime,
            duration: candidate.interviews[0].duration,
            type: candidate.interviews[0].type as 'technical' | 'behavioral' | 'final' | 'screening',
            meetingLink: candidate.interviews[0].meetingLink,
            status: candidate.interviews[0].status as 'scheduled' | 'confirmed' | 'cancelled' | 'completed',
            notes: candidate.interviews[0].notes
          } : undefined
        };
      });

      // Generate batch communications
      const drafts = batchGenerateCommunications(candidateData);

      // Store drafts in database
      const draftRecords = await Promise.all(
        drafts.map(draft => 
          prisma.emailDraft.create({
            data: {
              id: draft.id,
              type: draft.type,
              to: draft.to,
              cc: draft.cc,
              subject: draft.subject,
              body: draft.body,
              attachments: draft.attachments,
              scheduledSend: draft.scheduledSend,
              priority: draft.priority,
              tags: draft.tags,
              status: 'draft',
              userId: user.userId
            }
          }).catch(error => {
            console.error(`Failed to store draft ${draft.id}:`, error);
            return null;
          })
        )
      );

      return NextResponse.json({
        success: true,
        mode: 'batch',
        generated: drafts.length,
        drafts: drafts.map(d => ({
          id: d.id,
          type: d.type,
          to: d.to,
          subject: d.subject,
          priority: d.priority,
          tags: d.tags
        }))
      });

    } else if (candidateId || interviewId) {
      // Single draft generation
      let candidate, interview;

      if (candidateId) {
        candidate = await prisma.candidate.findFirst({
          where: {
            id: candidateId,
            role: { userId: user.userId }
          },
          include: {
            role: true,
            evaluation: true,
            interviews: {
              orderBy: { scheduledTime: 'desc' },
              take: 1
            }
          }
        });

        if (!candidate) {
          return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
        }

        interview = candidate.interviews[0];
      }

      if (interviewId) {
        interview = await prisma.interview.findFirst({
          where: {
            id: interviewId,
            userId: user.userId
          },
          include: {
            candidate: {
              include: {
                role: true,
                evaluation: true
              }
            }
          }
        });

        if (!interview) {
          return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
        }

        candidate = interview.candidate;
      }

      if (!candidate) {
        return NextResponse.json({ error: 'Candidate data not found' }, { status: 404 });
      }

      const profile = candidate.profile as any;
      let draft;

      switch (type) {
        case 'interview_invitation':
          if (!interview) {
            return NextResponse.json({ error: 'Interview data required for invitation' }, { status: 400 });
          }
          
          const interviewSchedule = {
            id: interview.id,
            candidateId: candidate.id,
            candidateName: profile?.name || 'Unknown',
            candidateEmail: profile?.email || '',
            roleId: candidate.roleId,
            roleTitle: candidate.role.title,
            interviewerId: interview.interviewerId,
            interviewerName: interview.interviewerName,
            interviewerEmail: interview.interviewerEmail,
            scheduledTime: interview.scheduledTime,
            duration: interview.duration,
            type: interview.type as 'technical' | 'behavioral' | 'final' | 'screening',
            meetingLink: interview.meetingLink || '',
            status: interview.status as 'scheduled' | 'confirmed' | 'cancelled' | 'completed',
            notes: interview.notes
          };
          
          draft = generateInterviewInvitation(interviewSchedule, candidate.evaluation);
          break;

        case 'rejection':
          draft = generateRejectionEmail(
            profile?.name || 'Unknown',
            profile?.email || '',
            candidate.role.title,
            candidate.evaluation
          );
          break;

        case 'interview_questions':
          if (!interview) {
            return NextResponse.json({ error: 'Interview data required for questions' }, { status: 400 });
          }
          
          const questions = generateInterviewQuestions(
            profile?.name || 'Unknown',
            candidate.role.title,
            interview.type as 'technical' | 'behavioral' | 'final' | 'screening',
            candidate.evaluation
          );
          
          return NextResponse.json({
            success: true,
            mode: 'single',
            questions
          });

        case 'offer':
          const salaryOffer = customData.salaryOffer || 120000;
          const startDate = customData.startDate ? new Date(customData.startDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
          
          draft = generateOfferLetter(
            profile?.name || 'Unknown',
            profile?.email || '',
            candidate.role.title,
            candidate.evaluation,
            salaryOffer,
            startDate
          );
          break;

        case 'follow_up':
          if (!interview) {
            return NextResponse.json({ error: 'Interview data required for follow-up' }, { status: 400 });
          }
          
          draft = generateFollowUpEmail(
            profile?.name || 'Unknown',
            profile?.email || '',
            interview.interviewerName,
            candidate.role.title,
            interview.type,
            customData.nextSteps || 'We will review your interview and get back to you within 3-5 business days.'
          );
          break;

        default:
          return NextResponse.json({ error: 'Invalid draft type' }, { status: 400 });
      }

      if (draft) {
        // Store draft in database
        try {
          await prisma.emailDraft.create({
            data: {
              id: draft.id,
              type: draft.type,
              to: draft.to,
              cc: draft.cc,
              subject: draft.subject,
              body: draft.body,
              attachments: draft.attachments,
              scheduledSend: draft.scheduledSend,
              priority: draft.priority,
              tags: draft.tags,
              status: 'draft',
              userId: user.userId
            }
          });
        } catch (dbError) {
          console.error('Failed to store draft:', dbError);
          // Continue anyway, draft is still generated
        }

        return NextResponse.json({
          success: true,
          mode: 'single',
          draft: {
            id: draft.id,
            type: draft.type,
            to: draft.to,
            cc: draft.cc,
            subject: draft.subject,
            body: draft.body,
            priority: draft.priority,
            tags: draft.tags
          }
        });
      }

    } else {
      return NextResponse.json({ 
        error: 'Either candidateId, candidateIds, or interviewId is required' 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Draft generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate draft',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET - Get draft history
export async function GET(request: NextRequest) {
  const user = verifyToken(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status') || 'draft';
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = { userId: user.userId, status };
    if (type) where.type = type;

    const drafts = await prisma.emailDraft.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return NextResponse.json({
      drafts: drafts.map(draft => ({
        id: draft.id,
        type: draft.type,
        to: draft.to,
        cc: draft.cc,
        subject: draft.subject,
        priority: draft.priority,
        tags: draft.tags,
        status: draft.status,
        createdAt: draft.createdAt,
        scheduledSend: draft.scheduledSend
      }))
    });

  } catch (error) {
    console.error('Error fetching drafts:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch drafts' 
    }, { status: 500 });
  }
}