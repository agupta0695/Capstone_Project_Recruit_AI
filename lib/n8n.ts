/**
 * n8n Integration Module for HireAI
 * 
 * This module provides functions to interact with n8n workflows
 * for AI-powered resume parsing, JD parsing, and candidate evaluation.
 */

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/parse-resume';
const N8N_JD_WEBHOOK_URL = process.env.N8N_JD_WEBHOOK_URL || 'http://localhost:5678/webhook-test/parser-jd';
const N8N_EVALUATOR_WEBHOOK_URL = process.env.N8N_EVALUATOR_WEBHOOK_URL || 'http://localhost:5678/webhook-test/evaluate-candidate';
const N8N_TIMEOUT = 30000; // 30 seconds

interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experience: string;
  education: string;
  summary?: string;
  strengths?: string[];
  concerns?: string[];
  matchScore?: number;
  workHistory?: any[];
}

interface ParsedJD {
  requiredSkills: string[];
  niceToHaveSkills: string[];
  experienceLevel: string;
  educationLevel: string;
  responsibilities: string[];
  qualifications: string[];
  summary: string;
}

interface CandidateEvaluation {
  score: number;
  confidence: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  gaps: string[];
  reasoning: string;
  recommendation: 'Shortlisted' | 'Review' | 'Rejected';
}

/**
 * Parse resume text using n8n workflow
 */
export async function parseResume(
  text: string,
  fileName: string
): Promise<ParsedResume | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), N8N_TIMEOUT);

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        fileName,
        fileType: fileName.endsWith('.pdf') ? 'pdf' : 
                  fileName.endsWith('.docx') ? 'docx' : 'txt',
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('n8n resume parsing failed:', response.statusText);
      return null;
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      return {
        name: result.data.name || 'Unknown',
        email: result.data.email || '',
        phone: result.data.phone || '',
        skills: Array.isArray(result.data.skills) ? result.data.skills : [],
        experience: result.data.experience || '',
        education: result.data.education || '',
        summary: result.data.summary,
        strengths: Array.isArray(result.data.strengths) ? result.data.strengths : [],
        concerns: Array.isArray(result.data.concerns) ? result.data.concerns : [],
        matchScore: result.data.matchScore || 0,
        workHistory: Array.isArray(result.data.workHistory) ? result.data.workHistory : [],
      };
    }

    return null;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('n8n resume parsing timeout');
      } else {
        console.error('n8n resume parsing error:', error.message);
      }
    }
    return null;
  }
}

/**
 * Parse job description using n8n workflow
 */
export async function parseJobDescription(
  description: string
): Promise<ParsedJD | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), N8N_TIMEOUT);

    const response = await fetch(N8N_JD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('n8n JD parsing failed:', response.statusText);
      return null;
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      return {
        requiredSkills: Array.isArray(result.data.requiredSkills) ? result.data.requiredSkills : [],
        niceToHaveSkills: Array.isArray(result.data.niceToHaveSkills) ? result.data.niceToHaveSkills : [],
        experienceLevel: result.data.experienceLevel || 'Mid-Level',
        educationLevel: result.data.educationLevel || "Bachelor's",
        responsibilities: Array.isArray(result.data.responsibilities) ? result.data.responsibilities : [],
        qualifications: Array.isArray(result.data.qualifications) ? result.data.qualifications : [],
        summary: result.data.summary || '',
      };
    }

    return null;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('n8n JD parsing timeout');
      } else {
        console.error('n8n JD parsing error:', error.message);
      }
    }
    return null;
  }
}

/**
 * Evaluate candidate against job requirements using n8n workflow
 */
export async function evaluateCandidate(
  candidateProfile: any,
  jobRequirements: any
): Promise<CandidateEvaluation | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), N8N_TIMEOUT);

    const response = await fetch(N8N_EVALUATOR_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        candidateProfile,
        jobRequirements,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('n8n candidate evaluation failed:', response.statusText);
      return null;
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      return {
        score: result.data.score || 0,
        confidence: result.data.confidence || 0,
        matchedSkills: Array.isArray(result.data.matchedSkills) ? result.data.matchedSkills : [],
        missingSkills: Array.isArray(result.data.missingSkills) ? result.data.missingSkills : [],
        strengths: Array.isArray(result.data.strengths) ? result.data.strengths : [],
        gaps: Array.isArray(result.data.gaps) ? result.data.gaps : [],
        reasoning: result.data.reasoning || 'No reasoning provided',
        recommendation: result.data.recommendation || 'Review',
      };
    }

    return null;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('n8n candidate evaluation timeout');
      } else {
        console.error('n8n candidate evaluation error:', error.message);
      }
    }
    return null;
  }
}

/**
 * Check if n8n is available
 */
export async function checkN8nHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${N8N_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Batch process multiple resumes
 */
export async function batchParseResumes(
  resumes: Array<{ text: string; fileName: string }>
): Promise<Array<ParsedResume | null>> {
  const results = await Promise.all(
    resumes.map(resume => parseResume(resume.text, resume.fileName))
  );
  return results;
}
