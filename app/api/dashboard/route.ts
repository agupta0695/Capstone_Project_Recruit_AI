import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || 'your-secret-key'
    ) as { userId: string; email: string };

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch roles
    const roles = await prisma.role.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        department: true,
        status: true,
        totalCandidates: true,
        shortlisted: true,
        createdAt: true,
      },
    });

    // Calculate stats
    const activeRoles = roles.filter(r => r.status === 'active').length;
    const pendingApprovals = roles.reduce((sum, r) => sum + r.shortlisted, 0);
    
    // Simple time saved calculation (2 hours per 100 candidates processed)
    const totalCandidates = roles.reduce((sum, r) => sum + r.totalCandidates, 0);
    const timeSaved = Math.round((totalCandidates / 100) * 2 * 10) / 10;

    return NextResponse.json({
      user,
      stats: {
        activeRoles,
        pendingApprovals,
        timeSaved,
      },
      roles,
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
