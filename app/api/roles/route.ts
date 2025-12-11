import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { parseJobDescription } from '@/lib/n8n';
import { createErrorDetails, logError } from '@/lib/errorNotifications';

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

    let processingNotes: string[] = [];
    
    if (description && description.length > 100) {
      console.log('🤖 Parsing JD with n8n AI...');
      const parseResult = await parseJobDescription(description);
      
      if (parseResult.data) {
        console.log('✅ JD parsed successfully by AI');
        processingNotes.push('AI job description parsing successful');
        evaluationCriteria = {
          requiredSkills: parseResult.data.requiredSkills,
          niceToHaveSkills: parseResult.data.niceToHaveSkills,
          experienceLevel: parseResult.data.experienceLevel,
          educationLevel: parseResult.data.educationLevel,
          responsibilities: parseResult.data.responsibilities,
          qualifications: parseResult.data.qualifications,
          summary: parseResult.data.summary,
        };
      } else {
        console.log('⚠️ AI parsing failed, using manual input');
        processingNotes.push('AI parsing unavailable - using manual input');
        
        // Log the error for monitoring
        if (parseResult.error) {
          const errorDetails = createErrorDetails(
            parseResult.error.code as any,
            { 
              descriptionLength: description.length,
              title,
              department 
            },
            user.userId,
            'jd_parsing'
          );
          logError(errorDetails);
        }
      }
    } else {
      processingNotes.push('Job description too short for AI parsing');
    }

    const role = await prisma.role.create({
      data: {
        title,
        department,
        description,
        evaluationCriteria: {
          ...evaluationCriteria,
          processingNotes,
        },
        status: 'active',
        userId: user.userId,
        totalCandidates: 0,
        screened: 0,
        shortlisted: 0,
        interviewed: 0,
        rejected: 0,
      },
    });

    return NextResponse.json({
      ...role,
      processingNotes,
      aiParsingUsed: processingNotes.includes('AI job description parsing successful')
    }, { status: 201 });
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
      include: {
        candidates: {
          select: {
            id: true,
            status: true,
            evaluation: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate statistics for each role
    const rolesWithStats = roles.map(role => {
      const candidates = role.candidates;
      const stats = {
        total: candidates.length,
        shortlisted: candidates.filter(c => c.status === 'Shortlisted').length,
        reviewed: candidates.filter(c => c.status === 'Review').length,
        rejected: candidates.filter(c => c.status === 'Rejected').length,
        avgScore: candidates.length > 0 
          ? Math.round(candidates.reduce((sum, c) => {
              const evaluation = c.evaluation as any;
              return sum + (evaluation?.score || 0);
            }, 0) / candidates.length)
          : 0
      };

      // Remove candidates from response for list view
      const { candidates: _, ...roleWithoutCandidates } = role;
      
      return {
        ...roleWithoutCandidates,
        stats
      };
    });

    return NextResponse.json(rolesWithStats);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
  }
}
