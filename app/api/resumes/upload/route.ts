import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

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

// Extract text from file
async function extractTextFromFile(file: File): Promise<string> {
  try {
    const text = await file.text();
    return text;
  } catch (error) {
    console.error('Error extracting text:', error);
    throw new Error('Failed to extract text from file');
  }
}

// Parse resume text
function parseResume(text: string) {
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
  const phoneRegex = /[\d\s()+-]{10,}/;
  
  const email = text.match(emailRegex)?.[0] || '';
  const phone = text.match(phoneRegex)?.[0]?.trim() || '';
  
  const lines = text.split('\n');
  const name = lines[0]?.trim() || 'Unknown';
  
  const skillKeywords = ['javascript', 'python', 'java', 'react', 'node', 'sql', 'aws', 'docker', 'kubernetes', 'typescript', 'angular', 'vue'];
  const skills: string[] = [];
  const lowerText = text.toLowerCase();
  
  skillKeywords.forEach(skill => {
    if (lowerText.includes(skill)) {
      skills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  });

  return { name, email, phone, skills };
}

// Evaluate candidate
function evaluateCandidate(candidateSkills: string[], requiredSkills: string[]) {
  if (requiredSkills.length === 0) return 50;
  
  const matchedSkills = candidateSkills.filter(skill => 
    requiredSkills.some(req => req.toLowerCase() === skill.toLowerCase())
  );
  
  const score = Math.round((matchedSkills.length / requiredSkills.length) * 100);
  return Math.min(score, 100);
}

export async function POST(request: NextRequest) {
  console.log('=== Resume Upload Started ===');
  
  const user = verifyToken(request);
  if (!user) {
    console.log('Unauthorized: No valid token');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    console.log('FormData received');
    
    const files = formData.getAll('files') as File[];
    const roleId = formData.get('roleId') as string;
    
    console.log(`Files count: ${files.length}, RoleId: ${roleId}`);

    if (!files || files.length === 0) {
      console.log('No files provided');
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (!roleId) {
      console.log('No roleId provided');
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 });
    }

    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role || role.userId !== user.userId) {
      console.log('Role not found or unauthorized');
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    console.log(`Processing ${files.length} files for role: ${role.title}`);
    
    // Extract required skills from evaluationCriteria
    const evaluationCriteria = role.evaluationCriteria as any;
    const requiredSkills = evaluationCriteria?.requiredSkills || [];
    console.log(`Required skills: ${requiredSkills.join(', ')}`);
    
    const results = [];

    for (const file of files) {
      console.log(`Processing file: ${file.name}, size: ${file.size}, type: ${file.type}`);
      
      try {
        const text = await extractTextFromFile(file);
        console.log(`Extracted text length: ${text.length}`);
        
        const parsed = parseResume(text);
        console.log(`Parsed: ${parsed.name}, skills: ${parsed.skills.join(', ')}`);
        
        const score = evaluateCandidate(parsed.skills, requiredSkills);
        console.log(`Score: ${score}`);
        
        let status = 'Rejected';
        if (score >= 70) status = 'Shortlisted';
        else if (score >= 50) status = 'Review';

        const candidate = await prisma.candidate.create({
          data: {
            profile: {
              name: parsed.name,
              email: parsed.email,
              phone: parsed.phone,
              resumeUrl: file.name,
              skills: parsed.skills,
              experience: '',
              education: '',
            },
            evaluation: {
              score,
              matchedSkills: parsed.skills,
              reasoning: `Matched ${parsed.skills.length} skills from required: ${requiredSkills.join(', ')}`,
            },
            status,
            roleId,
          },
        });

        results.push(candidate);
        console.log(`Created candidate: ${candidate.id}`);
      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError);
        results.push({ error: `Failed to process ${file.name}` });
      }
    }

    await prisma.role.update({
      where: { id: roleId },
      data: {
        totalCandidates: { increment: results.length },
        screened: { increment: results.length },
        shortlisted: { increment: results.filter(r => 'status' in r && r.status === 'Shortlisted').length },
      },
    });

    console.log('=== Upload Complete ===');
    return NextResponse.json({ 
      success: true, 
      processed: results.length,
      candidates: results 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to process resumes',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
