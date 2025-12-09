import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };

    // Get interviews for user's candidates
    const interviews = await prisma.interview.findMany({
      where: {
        candidate: {
          role: {
            userId: decoded.userId,
          },
        },
      },
      include: {
        candidate: {
          select: {
            profile: true,
            role: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });

    const formattedInterviews = interviews.map(interview => ({
      id: interview.id,
      candidateName: (interview.candidate.profile as any).name || 'Unknown',
      roleName: interview.candidate.role.title,
      scheduledAt: interview.scheduledAt.toISOString(),
      status: interview.status,
      type: interview.type,
    }));

    return NextResponse.json({ interviews: formattedInterviews });
  } catch (error) {
    console.error('Calendar fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch interviews' }, { status: 500 });
  }
}
