import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Callback endpoint for n8n to send parsed resume data
 * This receives the AI-parsed resume data and updates the database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📥 Received callback from n8n:', body);

    // Extract the parsed data from n8n response
    // The structure depends on your n8n workflow output
    const parsedData = body.output || body.data || body;

    // If you have candidateId in the request, update the candidate
    if (body.candidateId) {
      const candidate = await prisma.candidate.update({
        where: { id: body.candidateId },
        data: {
          name: parsedData.name || undefined,
          email: parsedData.email || undefined,
          phone: parsedData.phone || undefined,
          skills: parsedData.skills || undefined,
          experience: parsedData.experience || undefined,
          education: parsedData.education || undefined,
          summary: parsedData.summary || undefined,
          status: 'Screening',
        },
      });

      console.log('✅ Updated candidate:', candidate.id);

      return NextResponse.json({
        success: true,
        message: 'Candidate updated successfully',
        candidateId: candidate.id,
      });
    }

    // If no candidateId, just return the parsed data
    return NextResponse.json({
      success: true,
      message: 'Data received',
      data: parsedData,
    });

  } catch (error) {
    console.error('❌ Callback error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'n8n callback endpoint is ready',
  });
}
