/**
 * n8n Integration Module for HireAI
 * 
 * This module provides functions to interact with n8n workflows
 * for AI-powered resume parsing, JD parsing, and candidate evaluation.
 * Includes comprehensive error handling and notifications.
 */

import { handleN8nError, handleFileError, logError, createErrorDetails } from './errorNotifications';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/parse-resume';
const N8N_JD_WEBHOOK_URL = process.env.N8N_JD_WEBHOOK_URL || 'http://localhost:5678/webhook/parse-jd';
const N8N_EVALUATOR_WEBHOOK_URL = process.env.N8N_EVALUATOR_WEBHOOK_URL || 'http://localhost:5678/webhook/evaluate-candidate';
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
): Promise<{ data: ParsedResume | null; error?: { code: string; shouldFallback: boolean } }> {
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
      const { errorCode, shouldFallback } = handleN8nError(
        new Error(`HTTP ${response.status}: ${response.statusText}`),
        'resume-parser',
        { fileName, responseStatus: response.status }
      );
      return { data: null, error: { code: errorCode, shouldFallback } };
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      // Log successful parsing
      console.log(`✅ Resume parsed successfully: ${result.data.name || 'Unknown'}`);
      
      return {
        data: {
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
        }
      };
    }

    // Invalid response format
    const { errorCode, shouldFallback } = handleN8nError(
      new Error('Invalid response format from n8n'),
      'resume-parser',
      { fileName, responseData: result }
    );
    return { data: null, error: { code: errorCode, shouldFallback } };

  } catch (error) {
    const { errorCode, shouldFallback } = handleN8nError(
      error,
      'resume-parser',
      { fileName, textLength: text.length }
    );
    return { data: null, error: { code: errorCode, shouldFallback } };
  }
}

/**
 * Parse job description using n8n workflow
 */
export async function parseJobDescription(
  description: string
): Promise<{ data: ParsedJD | null; error?: { code: string; shouldFallback: boolean } }> {
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
      const { errorCode, shouldFallback } = handleN8nError(
        new Error(`HTTP ${response.status}: ${response.statusText}`),
        'jd-parser',
        { descriptionLength: description.length, responseStatus: response.status }
      );
      return { data: null, error: { code: errorCode, shouldFallback } };
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      // Log successful parsing
      console.log(`✅ JD parsed successfully: ${result.data.requiredSkills?.length || 0} required skills found`);
      
      return {
        data: {
          requiredSkills: Array.isArray(result.data.requiredSkills) ? result.data.requiredSkills : [],
          niceToHaveSkills: Array.isArray(result.data.niceToHaveSkills) ? result.data.niceToHaveSkills : [],
          experienceLevel: result.data.experienceLevel || 'Mid-Level',
          educationLevel: result.data.educationLevel || "Bachelor's",
          responsibilities: Array.isArray(result.data.responsibilities) ? result.data.responsibilities : [],
          qualifications: Array.isArray(result.data.qualifications) ? result.data.qualifications : [],
          summary: result.data.summary || '',
        }
      };
    }

    // Invalid response format
    const { errorCode, shouldFallback } = handleN8nError(
      new Error('Invalid response format from n8n'),
      'jd-parser',
      { descriptionLength: description.length, responseData: result }
    );
    return { data: null, error: { code: errorCode, shouldFallback } };

  } catch (error) {
    const { errorCode, shouldFallback } = handleN8nError(
      error,
      'jd-parser',
      { descriptionLength: description.length }
    );
    return { data: null, error: { code: errorCode, shouldFallback } };
  }
}

/**
 * Evaluate candidate against job requirements using n8n workflow
 */
export async function evaluateCandidate(
  candidateProfile: any,
  jobRequirements: any
): Promise<{ data: CandidateEvaluation | null; error?: { code: string; shouldFallback: boolean } }> {
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
      const { errorCode, shouldFallback } = handleN8nError(
        new Error(`HTTP ${response.status}: ${response.statusText}`),
        'candidate-evaluator',
        { 
          candidateName: candidateProfile?.name,
          jobTitle: jobRequirements?.title,
          responseStatus: response.status 
        }
      );
      return { data: null, error: { code: errorCode, shouldFallback } };
    }

    const result = await response.json();
    
    if (result.overallScore !== undefined || (result.success && result.evaluation)) {
      // Handle direct evaluation response or wrapped response
      const evaluation = result.evaluation || result;
      
      // Log successful evaluation
      console.log(`✅ Candidate evaluated successfully: ${evaluation.overallScore || evaluation.score}/100`);
      
      return {
        data: {
          score: evaluation.overallScore || evaluation.score || 0,
          confidence: evaluation.confidence || 0,
          matchedSkills: Array.isArray(evaluation.matchedSkills) ? evaluation.matchedSkills : [],
          missingSkills: Array.isArray(evaluation.missingSkills) ? evaluation.missingSkills : [],
          strengths: Array.isArray(evaluation.strengths) ? evaluation.strengths : [],
          gaps: Array.isArray(evaluation.concerns) ? evaluation.concerns : Array.isArray(evaluation.gaps) ? evaluation.gaps : [],
          reasoning: evaluation.detailedAnalysis?.technicalSkills || evaluation.reasoning || 'No reasoning provided',
          recommendation: evaluation.recommendation || 'Review',
        }
      };
    }

    // Invalid response format
    const { errorCode, shouldFallback } = handleN8nError(
      new Error('Invalid response format from n8n'),
      'candidate-evaluator',
      { 
        candidateName: candidateProfile?.name,
        jobTitle: jobRequirements?.title,
        responseData: result 
      }
    );
    return { data: null, error: { code: errorCode, shouldFallback } };

  } catch (error) {
    const { errorCode, shouldFallback } = handleN8nError(
      error,
      'candidate-evaluator',
      { 
        candidateName: candidateProfile?.name,
        jobTitle: jobRequirements?.title
      }
    );
    return { data: null, error: { code: errorCode, shouldFallback } };
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
