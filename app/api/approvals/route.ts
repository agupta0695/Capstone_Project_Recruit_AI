import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

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

export async function GET(request: NextRequest) {
  const user = verifyToken(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get candidates that need action:
    // 1. Status = 'Review' (explicitly marked for review)
    // 2. Status = 'Shortlisted' (need interview scheduling)
    // 3. Score < 50 (low AI confidence requiring human review)
    // 4. Status = 'new' with score < 70 (borderline cases)
    const candidates = await prisma.candidate.findMany({
      where: {
        role: {
          userId: user.userId,
        },
        OR: [
          { status: 'Review' },
          { status: 'Shortlisted' },
          { 
            AND: [
              { status: { in: ['new', 'Review'] } },
              // We'll filter by score in JavaScript since Prisma doesn't support JSON queries easily
            ]
          }
        ],
      },
      include: {
        role: {
          select: {
            id: true,
            title: true,
            department: true,
          },
        },
      },
      orderBy: {
        appliedAt: 'desc',
      },
    });

    // Filter candidates that need action and add action reasons
    const candidatesNeedingAction = candidates
      .map(candidate => {
        const evaluation = candidate.evaluation as any;
        const score = evaluation?.score || 0;
        
        let needsAction = false;
        let actionReason = '';
        let actionType = '';
        
        if (candidate.status === 'Shortlisted') {
          needsAction = true;
          actionReason = 'Interview scheduling required';
          actionType = 'schedule_interview';
        } else if (candidate.status === 'Review') {
          needsAction = true;
          actionReason = 'Marked for manual review';
          actionType = 'review_required';
        } else if (score < 50) {
          needsAction = true;
          actionReason = 'Low AI confidence score';
          actionType = 'review_required';
        } else if (score < 70 && candidate.status === 'new') {
          needsAction = true;
          actionReason = 'Borderline score requiring review';
          actionType = 'review_required';
        }
        
        return {
          ...candidate,
          needsAction,
          actionReason,
          actionType,
          evaluation: {
            ...evaluation,
            score
          }
        };
      })
      .filter(candidate => candidate.needsAction);

    return NextResponse.json({ 
      candidates: candidatesNeedingAction,
      total: candidatesNeedingAction.length,
      breakdown: {
        shortlisted: candidatesNeedingAction.filter(c => c.status === 'Shortlisted').length,
        underReview: candidatesNeedingAction.filter(c => c.status === 'Review').length,
        lowScore: candidatesNeedingAction.filter(c => c.evaluation.score < 50).length,
        borderline: candidatesNeedingAction.filter(c => c.evaluation.score >= 50 && c.evaluation.score < 70).length
      }
    });
  } catch (error) {
    console.error('Approvals fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch approvals' }, { status: 500 });
  }
}
