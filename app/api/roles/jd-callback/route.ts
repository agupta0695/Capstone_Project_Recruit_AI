import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Callback endpoint for n8n JD parser
 * Receives parsed job description data and updates the role
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📥 JD parsing callback received:', body);

    const { roleId, data } = body;

    if (roleId && data) {
      // Update role with parsed JD data
      const role = await prisma.role.update({
        where: { id: roleId },
        data: {
          evaluationCriteria: {
            requiredSkills: data.requiredSkills || [],
            niceToHaveSkills: data.niceToHaveSkills || [],
            experienceLevel: data.experienceLevel || 'Mid-Level',
            educationLevel: data.educationLevel || "Bachelor's",
            responsibilities: data.responsibilities || [],
            qualifications: data.qualifications || [],
            keyRequirements: data.keyRequirements || [],
            benefits: data.benefits || [],
            workMode: data.workMode || 'On-site',
            salaryRange: data.salaryRange || '',
          },
        },
      });

      console.log('✅ Role updated with parsed JD:', role.id);

      return NextResponse.json({
        success: true,
        message: 'JD parsed and role updated successfully',
        roleId: role.id,
      });
    }

    // If no roleId, just return the parsed data
    return NextResponse.json({
      success: true,
      message: 'JD parsed successfully',
      data,
    });
  } catch (error) {
    console.error('❌ JD callback error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process JD',
      },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'JD callback endpoint is ready',
  });
}
