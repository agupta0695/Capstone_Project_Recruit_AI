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

    // Get reasoning logs for user's candidates
    const reasoningLogs = await prisma.reasoningLog.findMany({
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
        timestamp: 'desc',
      },
      take: 100,
    });

    const logs = reasoningLogs.map(log => ({
      id: log.id,
      action: log.action,
      candidateName: (log.candidate.profile as any).name || 'Unknown',
      roleName: log.candidate.role.title,
      reasoning: log.reasoning,
      confidence: log.confidence,
      timestamp: log.timestamp.toISOString(),
    }));

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Logs fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
