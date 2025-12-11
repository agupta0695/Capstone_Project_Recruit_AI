import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { parseJobDescription } from '@/lib/n8n';
import { createErrorDetails, logError } from '@/lib/errorNotifications';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key';

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

// GET - Get specific role details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = verifyToken(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const role = await prisma.role.findFirst({
      where: {
        id: params.id,
        userId: user.userId
      },
      include: {
        candidates: {
          select: {
            id: true,
            status: true,
            appliedAt: true,
            profile: true,
            evaluation: true
          },
          orderBy: {
            appliedAt: 'desc'
          }
        },
        _count: {
          select: {
            candidates: true
          }
        }
      }
    });

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Calculate additional statistics
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

    return NextResponse.json({
      ...role,
      stats,
      candidates: candidates.map(c => ({
        ...c,
        profile: {
          name: (c.profile as any)?.name || 'Unknown',
          email: (c.profile as any)?.email || '',
          skills: (c.profile as any)?.skills || []
        }
      }))
    });

  } catch (error) {
    console.error('Error fetching role:', error);
    return NextResponse.json({ error: 'Failed to fetch role' }, { status: 500 });
  }
}

// PUT - Update role
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = verifyToken(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { 
      title, 
      department, 
      description, 
      requiredSkills, 
      experienceLevel, 
      educationLevel,
      status,
      reprocessDescription = false
    } = body;

    // Check if role exists and belongs to user
    const existingRole = await prisma.role.findFirst({
      where: {
        id: params.id,
        userId: user.userId
      }
    });

    if (!existingRole) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    let evaluationCriteria = existingRole.evaluationCriteria as any;
    let processingNotes: string[] = [];

    // If description changed and reprocessDescription is true, re-parse with AI
    if (reprocessDescription && description && description !== existingRole.description && description.length > 100) {
      console.log('🤖 Re-parsing updated JD with n8n AI...');
      const parseResult = await parseJobDescription(description);
      
      if (parseResult.data) {
        console.log('✅ JD re-parsed successfully by AI');
        processingNotes.push('AI job description parsing successful');
        evaluationCriteria = {
          requiredSkills: parseResult.data.requiredSkills,
          niceToHaveSkills: parseResult.data.niceToHaveSkills,
          experienceLevel: parseResult.data.experienceLevel,
          educationLevel: parseResult.data.educationLevel,
          responsibilities: parseResult.data.responsibilities,
          qualifications: parseResult.data.qualifications,
          summary: parseResult.data.summary,
          processingNotes
        };
      } else {
        console.log('⚠️ AI re-parsing failed, keeping manual updates');
        processingNotes.push('AI parsing failed - using manual input');
        
        // Update with manual input
        evaluationCriteria = {
          ...evaluationCriteria,
          requiredSkills: requiredSkills || evaluationCriteria.requiredSkills || [],
          experienceLevel: experienceLevel || evaluationCriteria.experienceLevel || 'Mid-Level',
          educationLevel: educationLevel || evaluationCriteria.educationLevel || "Bachelor's",
          processingNotes
        };
      }
    } else {
      // Manual update without AI processing
      processingNotes.push('Manual update without AI processing');
      evaluationCriteria = {
        ...evaluationCriteria,
        requiredSkills: requiredSkills || evaluationCriteria.requiredSkills || [],
        experienceLevel: experienceLevel || evaluationCriteria.experienceLevel || 'Mid-Level',
        educationLevel: educationLevel || evaluationCriteria.educationLevel || "Bachelor's",
        processingNotes
      };
    }

    // Update the role
    const updatedRole = await prisma.role.update({
      where: {
        id: params.id
      },
      data: {
        title: title || existingRole.title,
        department: department || existingRole.department,
        description: description || existingRole.description,
        status: status || existingRole.status,
        evaluationCriteria,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      ...updatedRole,
      processingNotes,
      aiParsingUsed: reprocessDescription && processingNotes.includes('AI job description parsing successful')
    });

  } catch (error) {
    console.error('Error updating role:', error);
    
    const errorDetails = createErrorDetails(
      'SERVER_ERROR',
      { roleId: params.id, error: error },
      user.userId,
      'role_update'
    );
    logError(errorDetails);
    
    return NextResponse.json({ 
      error: 'Failed to update role',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Delete role
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = verifyToken(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if role exists and belongs to user
    const existingRole = await prisma.role.findFirst({
      where: {
        id: params.id,
        userId: user.userId
      },
      include: {
        _count: {
          select: {
            candidates: true
          }
        }
      }
    });

    if (!existingRole) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Check if role has candidates
    if (existingRole._count.candidates > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete role with candidates. Please remove all candidates first.',
        candidateCount: existingRole._count.candidates
      }, { status: 400 });
    }

    // Delete the role
    await prisma.role.delete({
      where: {
        id: params.id
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Role deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json({ 
      error: 'Failed to delete role',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}