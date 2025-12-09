// Type definitions for AI services

export interface CandidateProfile {
  id?: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  summary: string;
  rawText: string;
  parseConfidence: number;
  parseErrors: string[];
}

export interface WorkExperience {
  company: string;
  title: string;
  startDate: Date;
  endDate: Date | null;
  description: string;
  technologies: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationYear: number;
}

export interface EvaluationCriteria {
  roleId: string;
  requiredSkills: Skill[];
  niceToHaveSkills: Skill[];
  experienceLevel: {
    min: number;
    max: number;
    unit: 'years';
  };
  educationRequirements: string[];
  responsibilities: string[];
  ambiguousRequirements: string[];
  scoringWeights: {
    skills: number;
    experience: number;
    education: number;
  };
  customInstructions?: string;
}

export interface Skill {
  name: string;
  importance: 'required' | 'nice-to-have';
  weight: number;
}

export interface CandidateEvaluation {
  candidateId: string;
  roleId: string;
  score: number; // 0-100
  confidenceScore: number; // 0-100
  reasoning: string;
  breakdown: {
    skillsMatch: number;
    experienceMatch: number;
    educationMatch: number;
  };
  strengths: string[];
  gaps: string[];
  recommendation: 'shortlist' | 'review' | 'reject';
  timestamp: Date;
}

export interface ReasoningLog {
  id?: string;
  timestamp: Date;
  actionType: 'parse' | 'evaluate' | 'schedule';
  entityId: string;
  entityName: string;
  inputData: any;
  outputData: any;
  reasoning: string;
  confidenceScore: number;
  status: 'success' | 'failed';
  errorMessage?: string;
}
