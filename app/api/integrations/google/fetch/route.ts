// app/api/integrations/google/fetch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { fetchAndProcessUnreadEmails } from '@/lib/gmail';
import { verifyTokenFromCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const userPayload = verifyTokenFromCookie(req);
    if (!userPayload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Find integration for this user
    const integration = await prisma.integration.findUnique({ where: { userId_provider: { userId: (userPayload as any).sub, provider: 'google_gmail' } as any } });
    if (!integration) return NextResponse.json({ error: 'No integration found' }, { status: 404 });

    // Process unread emails (markRead default true)
    const processed = await fetchAndProcessUnreadEmails(integration.id);
    return NextResponse.json({ processedCount: processed.length, processed });
  } catch (err: any) {
    console.error('Error fetching Gmail emails', err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
