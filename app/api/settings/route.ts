import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyTokenFromHeaderOrCookie } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userPayload = verifyTokenFromHeaderOrCookie(request);
    if (!userPayload?.sub && !userPayload?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (userPayload.sub || userPayload.userId) as string;

    const userSettings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!userSettings) {
      return NextResponse.json({ settings: {} });
    }

    // Map fields to names your frontend expects — use the real schema names
    return NextResponse.json({
      settings: {
        requireShortlistApproval: userSettings.requireShortlistApproval,
        requireSchedulingApproval: userSettings.requireSchedulingApproval,
        requireBulkRejectionApproval: userSettings.requireBulkRejectionApproval,
        confidenceThreshold: userSettings.confidenceThreshold,
        workingHoursStart: userSettings.workingHoursStart,
        workingHoursEnd: userSettings.workingHoursEnd,
        timezone: userSettings.timezone,
        interviewDuration: userSettings.interviewDuration,
        bufferTime: userSettings.bufferTime,
        emailNotifications: userSettings.emailNotifications,
        inAppNotifications: userSettings.inAppNotifications
      },
    });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userPayload = verifyTokenFromHeaderOrCookie(request);
    if (!userPayload?.sub && !userPayload?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (userPayload.sub || userPayload.userId) as string;

    const settings = await request.json();

    await prisma.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        requireShortlistApproval: settings.requireShortlistApproval ?? true,
        requireSchedulingApproval: settings.requireSchedulingApproval ?? true,
        requireBulkRejectionApproval: settings.requireBulkRejectionApproval ?? true,
        confidenceThreshold: settings.confidenceThreshold ?? 80,
        workingHoursStart: settings.workingHoursStart ?? '09:00',
        workingHoursEnd: settings.workingHoursEnd ?? '18:00',
        timezone: settings.timezone ?? 'Asia/Kolkata',
        interviewDuration: settings.interviewDuration ?? 60,
        bufferTime: settings.bufferTime ?? 15,
        emailNotifications: settings.emailNotifications ?? true,
        inAppNotifications: settings.inAppNotifications ?? true,
      },
      update: {
        requireShortlistApproval: settings.requireShortlistApproval,
        requireSchedulingApproval: settings.requireSchedulingApproval,
        requireBulkRejectionApproval: settings.requireBulkRejectionApproval,
        confidenceThreshold: settings.confidenceThreshold,
        workingHoursStart: settings.workingHoursStart,
        workingHoursEnd: settings.workingHoursEnd,
        timezone: settings.timezone,
        interviewDuration: settings.interviewDuration,
        bufferTime: settings.bufferTime,
        emailNotifications: settings.emailNotifications,
        inAppNotifications: settings.inAppNotifications,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
