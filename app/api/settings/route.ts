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

    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: decoded.userId },
    });

    if (!userSettings) {
      return NextResponse.json({ settings: {} });
    }

    return NextResponse.json({
      settings: {
        autoApprove: userSettings.autoApprove,
        confidenceThreshold: userSettings.confidenceThreshold,
        emailNotifications: userSettings.emailNotifications,
        inAppNotifications: userSettings.inAppNotifications,
      },
    });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
    const settings = await request.json();

    await prisma.userSettings.update({
      where: { userId: decoded.userId },
      data: {
        autoApprove: settings.autoApprove,
        confidenceThreshold: settings.confidenceThreshold,
        emailNotifications: settings.emailNotifications,
        inAppNotifications: settings.inAppNotifications,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
