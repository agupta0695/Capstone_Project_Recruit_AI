import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { executeAgenticWorkflow, batchExecuteAgenticWorkflows } from '@/lib/agenticWorkflow';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key';

function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  
  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

// POST - Execute agentic workflow for candidate(s)
export async function POST(request: NextRequest) {
  const user = verifyToken(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { candidateId, candidateIds, roleId, mode = 'single' } = body;

    if (mode === 'batch' && candidateIds?.length > 0) {
      // Batch processing
      console.log(`🚀 Starting batch agentic workflow for ${candidateIds.length} candidates`);
      
      // Fetch candidates and role data
      const candidates = await prisma.candidate.findMany({
        where: {
          id: { in: candidateIds },
          role: { userId: user.userId }
        },
        include: {
          role: true
        }
      });

      if (candidates.length === 0) {
        return NextResponse.json({ error: 'No candidates found' }, { status: 404 });
      }

      // Prepare data for batch processing
      const candidateData = candidates.map(candidate => ({
        id: candidate.id,
        profile: candidate.profile,
        roleId: candidate.roleId,
        roleRequirements: candidate.role.evaluationCriteria,
        roleTitle: candidate.role.title
      }));

      // Execute batch workflow
      const workflows = await batchExecuteAgenticWorkflows(candidateData);

      // Store workflow results in database
      const workflowRecords = await Promise.all(
        workflows.map(workflow => 
          prisma.workflowExecution.create({
            data: {
              id: workflow.id,
              candidateId: workflow.candidateId,
              roleId: workflow.roleId,
              status: workflow.status,
              decisions: workflow.decisions,
              generatedContent: workflow.generatedContent,
              startTime: workflow.startTime,
              endTime: workflow.endTime,
              totalDuration: workflow.totalDuration,
              userId: user.userId
            }
          }).catch(error => {
            console.error(`Failed to store workflow ${workflow.id}:`, error);
            return null;
          })
        )
      );

      return NextResponse.json({
        success: true,
        mode: 'batch',
        processed: workflows.length,
        successful: workflows.filter(w => w.status === 'completed').length,
        failed: workflows.filter(w => w.status === 'failed').length,
        workflows: workflows.map(w => ({
          id: w.id,
          candidateId: w.candidateId,
          status: w.status,
          decision: w.decisions[0]?.decision,
          confidence: w.decisions[0]?.confidence,
          emailsGenerated: w.generatedContent.emails.length,
          interviewsScheduled: w.generatedContent.interviews.length
        }))
      });

    } else if (candidateId) {
      // Single candidate processing
      console.log(`🚀 Starting agentic workflow for candidate ${candidateId}`);
      
      const candidate = await prisma.candidate.findFirst({
        where: {
          id: candidateId,
          role: { userId: user.userId }
        },
        include: {
          role: true
        }
      });

      if (!candidate) {
        return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
      }

      // Execute single workflow
      const workflow = await executeAgenticWorkflow(
        candidate.id,
        candidate.profile,
        candidate.roleId,
        candidate.role.evaluationCriteria,
        candidate.role.title
      );

      // Store workflow result
      try {
        await prisma.workflowExecution.create({
          data: {
            id: workflow.id,
            candidateId: workflow.candidateId,
            roleId: workflow.roleId,
            status: workflow.status,
            decisions: workflow.decisions,
            generatedContent: workflow.generatedContent,
            startTime: workflow.startTime,
            endTime: workflow.endTime,
            totalDuration: workflow.totalDuration,
            userId: user.userId
          }
        });
      } catch (dbError) {
        console.error('Failed to store workflow result:', dbError);
        // Continue anyway, workflow still executed
      }

      return NextResponse.json({
        success: true,
        mode: 'single',
        workflow: {
          id: workflow.id,
          status: workflow.status,
          decision: workflow.decisions[0]?.decision,
          confidence: workflow.decisions[0]?.confidence,
          reasoning: workflow.decisions[0]?.reasoning,
          recommendedActions: workflow.decisions[0]?.recommendedActions,
          timeline: workflow.decisions[0]?.timeline,
          generatedContent: {
            emails: workflow.generatedContent.emails.length,
            interviews: workflow.generatedContent.interviews.length,
            questions: workflow.generatedContent.questions.length
          },
          duration: workflow.totalDuration
        }
      });

    } else {
      return NextResponse.json({ 
        error: 'Either candidateId or candidateIds array is required' 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Agentic workflow error:', error);
    return NextResponse.json({ 
      error: 'Failed to execute agentic workflow',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET - Get workflow execution history
export async function GET(request: NextRequest) {
  const user = verifyToken(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('candidateId');
    const roleId = searchParams.get('roleId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = { userId: user.userId };
    if (candidateId) where.candidateId = candidateId;
    if (roleId) where.roleId = roleId;
    if (status) where.status = status;

    const workflows = await prisma.workflowExecution.findMany({
      where,
      orderBy: { startTime: 'desc' },
      take: limit,
      include: {
        candidate: {
          select: {
            profile: true
          }
        },
        role: {
          select: {
            title: true,
            department: true
          }
        }
      }
    });

    return NextResponse.json({
      workflows: workflows.map(w => ({
        id: w.id,
        candidateId: w.candidateId,
        candidateName: (w.candidate?.profile as any)?.name || 'Unknown',
        roleId: w.roleId,
        roleTitle: w.role?.title || 'Unknown',
        status: w.status,
        decision: (w.decisions as any)?.[0]?.decision,
        confidence: (w.decisions as any)?.[0]?.confidence,
        startTime: w.startTime,
        endTime: w.endTime,
        duration: w.totalDuration,
        generatedContent: w.generatedContent
      }))
    });

  } catch (error) {
    console.error('Error fetching workflow history:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch workflow history' 
    }, { status: 500 });
  }
}