import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { parseResume } from '@/lib/n8n';
import pdf from 'pdf-parse';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key';
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/parse-resume';

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
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      // Handle PDF files
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const data = await pdf(buffer);
      return data.text;
    } else {
      // Handle text files
      const text = await file.text();
      return text;
    }
  } catch (error) {
    console.error('Error extracting text:', error);
    throw new Error('Failed to extract text from file');
  }
}

// Local fallback parser
function parseResumeLocal(text: string) {
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

  return { name, email, phone, skills, experience: '', education: '' };
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
        
        // Try n8n parsing first, fallback to local parsing
        let parsed = await parseResume(text, file.name);
        let score = 0;
        let matchedSkills: string[] = [];
        let strengths: string[] = [];
        let concerns: string[] = [];
        
        if (!parsed) {
          console.log('n8n parsing failed, using fallback parser');
          parsed = parseResumeLocal(text);
          score = evaluateCandidate(parsed.skills, requiredSkills);
          matchedSkills = parsed.skills.filter(skill => 
            requiredSkills.some(req => req.toLowerCase() === skill.toLowerCase())
          );
        } else {
          // Use n8n's comprehensive evaluation
          console.log(`Parsed by n8n: ${parsed.name}, skills: ${parsed.skills?.join(', ')}`);
          
          // Calculate score based on skill match
          matchedSkills = (parsed.skills || []).filter(skill => 
            requiredSkills.some(req => req.toLowerCase() === skill.toLowerCase())
          );
          score = requiredSkills.length > 0 
            ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
            : 50;
          
          // Get strengths and concerns from parsed data if available
          strengths = (parsed as any).strengths || [];
          concerns = (parsed as any).concerns || [];
        }
        
        console.log(`Score: ${score}, Matched: ${matchedSkills.length}/${requiredSkills.length}`);
        
        let status = 'Rejected';
        if (score >= 70) status = 'Shortlisted';
        else if (score >= 50) status = 'Review';

        const candidate = await prisma.candidate.create({
          data: {
            profile: {
              name: parsed.name || 'Unknown',
              email: parsed.email || '',
              phone: parsed.phone || '',
              resumeUrl: file.name,
              skills: parsed.skills || [],
              experience: parsed.experience || '',
              education: parsed.education || '',
            },
            evaluation: {
              score,
              matchedSkills,
              reasoning: strengths.length > 0 
                ? `Strengths: ${strengths.join(', ')}. Concerns: ${concerns.join(', ')}`
                : `Matched ${matchedSkills.length} of ${requiredSkills.length} required skills`,
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
