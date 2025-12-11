import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { createErrorDetails, logError } from '@/lib/errorNotifications';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key';

function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

// GET - Get specific candidate details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = verifyToken(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const candidate = await prisma.candidate.findFirst({
      where: {
        id: params.id,
        role: {
          userId: user.userId
        }
      },
      include: {
        role: {
          select: {
            id: true,
            title: true,
            department: true,
            evaluationCriteria: true
          }
        }
      }
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    return NextResponse.json(candidate);

  } catch (error) {
    console.error('Error fetching candidate:', error);
    return NextResponse.json({ error: 'Failed to fetch candidate' }, { status: 500 });
  }
}

// PATCH - Update candidate status and add notes
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = verifyToken(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { status, notes, overrideReason } = body;

    // Validate status
    const validStatuses = ['new', 'Review', 'Shortlisted', 'Rejected', 'Interviewed', 'Hired', 'Withdrawn'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status',
        validStatuses 
      }, { status: 400 });
    }

    // Check if candidate exists and belongs to user
    const existingCandidate = await prisma.candidate.findFirst({
      where: {
        id: params.id,
        role: {
          userId: user.userId
        }
      },
      include: {
        role: true
      }
    });

    if (!existingCandidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    // Prepare status history entry
    const currentStatusHistory = (existingCandidate.statusHistory as any[]) || [];
    const newStatusEntry = {
      status: status || existingCandidate.status,
      timestamp: new Date().toISOString(),
      changedBy: 'user',
      reason: overrideReason || 'Manual status update',
      notes: notes || null
    };

    // Update candidate
    const updatedCandidate = await prisma.candidate.update({
      where: {
        id: params.id
      },
      data: {
        status: status || existingCandidate.status,
        notes: notes !== undefined ? notes : existingCandidate.notes,
        overridden: status ? true : existingCandidate.overridden,
        overrideReason: overrideReason || existingCandidate.overrideReason,
        statusHistory: [...currentStatusHistory, newStatusEntry],
        updatedAt: new Date()
      },
      include: {
        role: {
          select: {
            id: true,
            title: true,
            department: true,
            evaluationCriteria: true
          }
        }
      }
    });

    // Update role statistics if status changed
    if (status && status !== existingCandidate.status) {
      const roleStats = await prisma.candidate.groupBy({
        by: ['status'],
        where: {
          roleId: existingCandidate.roleId
        },
        _count: {
          status: true
        }
      });

      const statsMap = roleStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.status;
        return acc;
      }, {} as Record<string, number>);

      await prisma.role.update({
        where: {
          id: existingCandidate.roleId
        },
        data: {
          totalCandidates: Object.values(statsMap).reduce((sum, count) => sum + count, 0),
          screened: (statsMap['Review'] || 0) + (statsMap['Shortlisted'] || 0) + (statsMap['Rejected'] || 0),
          shortlisted: statsMap['Shortlisted'] || 0,
          interviewed: statsMap['Interviewed'] || 0,
          rejected: statsMap['Rejected'] || 0,
          updatedAt: new Date()
        }
      });

      // Trigger email automation based on status change
      if (status === 'Shortlisted') {
        try {
          console.log('🎯 Candidate shortlisted - triggering interview scheduling and emails...');
          
          // Schedule interview using agentic workflow
          const interviewResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/agentic/calendar`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwt.sign({ userId: user.userId }, JWT_SECRET, { expiresIn: '1h' })}`
            },
            body: JSON.stringify({
              candidateId: params.id,
              roleId: existingCandidate.roleId,
              candidateName: (existingCandidate.profile as any)?.name || 'Candidate',
              candidateEmail: (existingCandidate.profile as any)?.email || '',
              roleTitle: existingCandidate.role.title,
              action: 'schedule_interview'
            })
          });

          if (interviewResponse.ok) {
            const interviewResult = await interviewResponse.json();
            console.log('✅ Interview scheduled successfully:', interviewResult);
            
            // Send interview invitation emails
            const emailResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/agentic/send-email`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt.sign({ userId: user.userId }, JWT_SECRET, { expiresIn: '1h' })}`
              },
              body: JSON.stringify({
                type: 'interview_invitation',
                candidateId: params.id,
                candidateName: (existingCandidate.profile as any)?.name || 'Candidate',
                candidateEmail: (existingCandidate.profile as any)?.email || '',
                roleTitle: existingCandidate.role.title,
                interviewDetails: interviewResult.interview
              })
            });

            if (emailResponse.ok) {
              const emailResult = await emailResponse.json();
              console.log('✅ Interview emails sent:', emailResult);
            }
          }
        } catch (error) {
          console.error('⚠️ Interview scheduling failed:', error);
          // Don't fail the status update if interview scheduling fails
        }
      } else if (status === 'Rejected') {
        try {
          console.log('📧 Candidate rejected - sending rejection email...');
          
          // Send rejection email
          const emailResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/agentic/send-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwt.sign({ userId: user.userId }, JWT_SECRET, { expiresIn: '1h' })}`
            },
            body: JSON.stringify({
              type: 'rejection',
              candidateId: params.id,
              candidateName: (existingCandidate.profile as any)?.name || 'Candidate',
              candidateEmail: (existingCandidate.profile as any)?.email || '',
              roleTitle: existingCandidate.role.title
            })
          });

          if (emailResponse.ok) {
            const emailResult = await emailResponse.json();
            console.log('✅ Rejection email sent:', emailResult);
          }
        } catch (error) {
          console.error('⚠️ Rejection email failed:', error);
          // Don't fail the status update if email sending fails
        }
      }
    }

    return NextResponse.json({
      ...updatedCandidate,
      statusChanged: status && status !== existingCandidate.status,
      previousStatus: existingCandidate.status
    });

  } catch (error) {
    console.error('Error updating candidate:', error);
    
    const errorDetails = createErrorDetails(
      'SERVER_ERROR',
      { candidateId: params.id, error: error },
      user.userId,
      'candidate_update'
    );
    logError(errorDetails);
    
    return NextResponse.json({ 
      error: 'Failed to update candidate',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Delete candidate (soft delete by marking as withdrawn)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = verifyToken(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if candidate exists and belongs to user
    const existingCandidate = await prisma.candidate.findFirst({
      where: {
        id: params.id,
        role: {
          userId: user.userId
        }
      }
    });

    if (!existingCandidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    // Soft delete by marking as withdrawn
    const updatedCandidate = await prisma.candidate.update({
      where: {
        id: params.id
      },
      data: {
        status: 'Withdrawn',
        notes: (existingCandidate.notes || '') + '\n[DELETED BY USER]',
        overridden: true,
        overrideReason: 'Candidate removed by user',
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Candidate marked as withdrawn',
      candidate: updatedCandidate
    });

  } catch (error) {
    console.error('Error deleting candidate:', error);
    return NextResponse.json({ 
      error: 'Failed to delete candidate',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}