import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
    const { candidateIds, action } = await request.json();

    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      return NextResponse.json({ error: 'Invalid candidate IDs' }, { status: 400 });
    }

    // Update candidates
    const newStatus = action === 'approve' ? 'Shortlisted' : 'Rejected';
    
    await prisma.candidate.updateMany({
      where: {
        id: { in: candidateIds },
        role: {
          userId: decoded.userId,
        },
      },
      data: {
        status: newStatus,
      },
    });

    return NextResponse.json({ success: true, updated: candidateIds.length });
  } catch (error) {
    console.error('Bulk approval error:', error);
    return NextResponse.json({ error: 'Failed to process bulk action' }, { status: 500 });
  }
}
