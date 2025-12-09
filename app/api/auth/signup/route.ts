import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { name, email, company, password } = await request.json();

    // Validate input
    if (!name || !email || !company || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with default settings
    const user = await prisma.user.create({
      data: {
        name,
        email,
        company,
        password: hashedPassword,
        role: 'hr_user',
        settings: {
          create: {
            requireShortlistApproval: true,
            requireSchedulingApproval: true,
            requireBulkRejectionApproval: true,
            confidenceThreshold: 80,
            workingHoursStart: '09:00',
            workingHoursEnd: '18:00',
            timezone: 'Asia/Kolkata',
            interviewDuration: 60,
            bufferTime: 15,
            emailNotifications: true,
            inAppNotifications: true,
          },
        },
      },
      include: {
        settings: true,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.NEXTAUTH_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company,
      },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
