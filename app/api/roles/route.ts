import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { parseJobDescription } from '@/lib/n8n';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key';

// Verify JWT token
function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

// POST - Create new role
export async function POST(request: NextRequest) {
  const user = verifyToken(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, department, description, requiredSkills, experienceLevel, educationLevel } = body;

    // Try to parse JD with n8n AI, fallback to manual input
    let evaluationCriteria: any = {
      requiredSkills: requiredSkills || [],
      experienceLevel: experienceLevel || 'Mid-Level',
      educationLevel: educationLevel || "Bachelor's",
    };

    if (description && description.length > 100) {
      console.log('🤖 Parsing JD with n8n AI...');
      const parsedJD = await parseJobDescription(description);
      
      if (parsedJD) {
        console.log('✅ JD parsed successfully by AI');
        evaluationCriteria = {
          requiredSkills: parsedJD.requiredSkills,
          niceToHaveSkills: parsedJD.niceToHaveSkills,
          experienceLevel: parsedJD.experienceLevel,
          educationLevel: parsedJD.educationLevel,
          responsibilities: parsedJD.responsibilities,
          qualifications: parsedJD.qualifications,
        };
      } else {
        console.log('⚠️ AI parsing failed, using manual input');
      }
    }

    const role = await prisma.role.create({
      data: {
        title,
        department,
        description,
        evaluationCriteria,
        status: 'active',
        userId: user.userId,
        totalCandidates: 0,
        screened: 0,
        shortlisted: 0,
        interviewed: 0,
        rejected: 0,
      },
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    console.error('Error creating role:', error);
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 });
  }
}

// GET - List all roles
export async function GET(request: NextRequest) {
  const user = verifyToken(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const roles = await prisma.role.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
  }
}
