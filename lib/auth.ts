// lib/auth.ts
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || '';

export function verifyTokenFromHeaderOrCookie(req: NextRequest) {
  try {
    // 1) Try Authorization header
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = jwt.verify(token, JWT_SECRET) as any;
      return payload;
    }

    // 2) Try cookie (hf_session)
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.split(';').map(s => s.trim()).find(s => s.startsWith('hf_session='));
    if (match) {
      const token = match.split('=')[1];
      const payload = jwt.verify(token, JWT_SECRET) as any;
      return payload;
    }

    return null;
  } catch (e) {
    return null;
  }
}
