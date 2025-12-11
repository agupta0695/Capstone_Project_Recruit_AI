// lib/auth.ts
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || '';

export function verifyTokenFromHeaderOrCookie(req: NextRequest) {
  try {
    // 1) Try Authorization header
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith
