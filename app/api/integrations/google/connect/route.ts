import { NextResponse } from 'next/server';
import { getOAuthUrl } from '@/lib/gmail';

export async function GET() {
  const url = await getOAuthUrl();
  return NextResponse.json({ url });
}
