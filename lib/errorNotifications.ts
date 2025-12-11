/**
 * Error Notification System for HireAI
 * 
 * This module provides standardized error handling and notifications
 * for the AI hiring system, including n8n workflow errors.
 */

export interface ErrorDetails {
  code: string;
  message: string;
  context?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  action?: string;
}

export interface NotificationConfig {
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Error codes and their user-friendly messages
export const ERROR_MESSAGES = {
  // n8n Workflow Errors
  N8N_RESUME_PARSER_FAILED: {
    title: 'Resume Parsing Failed',
    message: 'AI resume parser is unavailable. Using basic parsing instead.',
    type: 'warning' as const,
    duration: 8000,
  },
  N8N_JD_PARSER_FAILED: {
    title: 'Job Description Parsing Failed', 
    message: 'AI job description parser is unavailable. Please enter requirements manually.',
    type: 'warning' as const,
    duration: 8000,
  },
  N8N_EVALUATOR_FAILED: {
    title: 'Candidate Evaluation Failed',
    message: 'AI candidate evaluator is unavailable. Using basic scoring instead.',
    type: 'warning' as const,
    duration: 8000,
  },
  N8N_TIMEOUT: {
    title: 'AI Processing Timeout',
    message: 'AI processing is taking longer than expected. Please try again.',
    type: 'error' as const,
    duration: 10000,
  },
  N8N_CONNECTION_FAILED: {
    title: 'AI Service Unavailable',
    message: 'Cannot connect to AI processing service. Check your connection.',
    type: 'error' as const,
    duration: 10000,
  },

  // File Processing Errors
  FILE_TOO_LARGE: {
    title: 'File Too Large',
    message: 'Resume file exceeds 10MB limit. Please use a smaller file.',
    type: 'error' as const,
    duration: 8000,
  },
  FILE_TYPE_UNSUPPORTED: {
    title: 'Unsupported File Type',
    message: 'Please upload PDF, DOC, or TXT files only.',
    type: 'error' as const,
    duration: 8000,
  },
  PDF_EXTRACTION_FAILED: {
    title: 'PDF Processing Failed',
    message: 'Could not extract text from PDF. Try converting to a different format.',
    type: 'error' as const,
    duration: 8000,
  },
  FILE_CORRUPTED: {
    title: 'File Corrupted',
    message: 'The uploaded file appears to be corrupted. Please try again.',
    type: 'error' as const,
    duration: 8000,
  },

  // Authentication & Authorization
  UNAUTHORIZED: {
    title: 'Authentication Required',
    message: 'Please log in to continue.',
    type: 'error' as const,
    duration: 6000,
  },
  FORBIDDEN: {
    title: 'Access Denied',
    message: 'You do not have permission to perform this action.',
    type: 'error' as const,
    duration: 6000,
  },
  SESSION_EXPIRED: {
    title: 'Session Expired',
    message: 'Your session has expired. Please log in again.',
    type: 'warning' as const,
    duration: 8000,
  },

  // Database Errors
  DATABASE_CONNECTION_FAILED: {
    title: 'Database Error',
    message: 'Unable to connect to database. Please try again later.',
    type: 'error' as const,
    duration: 10000,
  },
  ROLE_NOT_FOUND: {
    title: 'Role Not Found',
    message: 'The requested job role could not be found.',
    type: 'error' as const,
    duration: 6000,
  },
  CANDIDATE_NOT_FOUND: {
    title: 'Candidate Not Found',
    message: 'The requested candidate could not be found.',
    type: 'error' as const,
    duration: 6000,
  },

  // Validation Errors
  INVALID_INPUT: {
    title: 'Invalid Input',
    message: 'Please check your input and try again.',
    type: 'error' as const,
    duration: 6000,
  },
  MISSING_REQUIRED_FIELDS: {
    title: 'Missing Information',
    message: 'Please fill in all required fields.',
    type: 'error' as const,
    duration: 6000,
  },
  ROLE_ID_REQUIRED: {
    title: 'Role Selection Required',
    message: 'Please select a job role before uploading resumes.',
    type: 'error' as const,
    duration: 6000,
  },

  // Network Errors
  NETWORK_ERROR: {
    title: 'Network Error',
    message: 'Check your internet connection and try again.',
    type: 'error' as const,
    duration: 8000,
  },
  SERVER_ERROR: {
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again later.',
    type: 'error' as const,
    duration: 10000,
  },

  // Success Messages
  RESUME_UPLOADED_SUCCESS: {
    title: 'Resume Uploaded Successfully',
    message: 'Resume has been processed and candidate added to the pipeline.',
    type: 'info' as const,
    duration: 5000,
  },
  ROLE_CREATED_SUCCESS: {
    title: 'Role Created Successfully',
    message: 'Job role has been created and is ready for candidates.',
    type: 'info' as const,
    duration: 5000,
  },
  BATCH_UPLOAD_SUCCESS: {
    title: 'Batch Upload Complete',
    message: 'All resumes have been processed successfully.',
    type: 'info' as const,
    duration: 6000,
  },
} as const;

/**
 * Create error details object
 */
export function createErrorDetails(
  code: keyof typeof ERROR_MESSAGES,
  context?: Record<string, any>,
  userId?: string,
  action?: string
): ErrorDetails {
  return {
    code,
    message: ERROR_MESSAGES[code].message,
    context,
    timestamp: new Date(),
    userId,
    action,
  };
}

/**
 * Get notification config for error code
 */
export function getNotificationConfig(
  code: keyof typeof ERROR_MESSAGES,
  customAction?: { label: string; onClick: () => void }
): NotificationConfig {
  const config = ERROR_MESSAGES[code];
  return {
    ...config,
    action: customAction,
  };
}

/**
 * Log error to console with structured format
 */
export function logError(error: ErrorDetails): void {
  console.error('🚨 HireAI Error:', {
    code: error.code,
    message: error.message,
    timestamp: error.timestamp.toISOString(),
    userId: error.userId,
    action: error.action,
    context: error.context,
  });
}

/**
 * Enhanced error handler for n8n workflows
 */
export function handleN8nError(
  error: any,
  workflow: 'resume-parser' | 'jd-parser' | 'candidate-evaluator',
  context?: Record<string, any>
): { errorCode: keyof typeof ERROR_MESSAGES; shouldFallback: boolean } {
  let errorCode: keyof typeof ERROR_MESSAGES;
  let shouldFallback = true;

  if (error?.name === 'AbortError') {
    errorCode = 'N8N_TIMEOUT';
  } else if (error?.message?.includes('fetch')) {
    errorCode = 'N8N_CONNECTION_FAILED';
  } else {
    switch (workflow) {
      case 'resume-parser':
        errorCode = 'N8N_RESUME_PARSER_FAILED';
        break;
      case 'jd-parser':
        errorCode = 'N8N_JD_PARSER_FAILED';
        break;
      case 'candidate-evaluator':
        errorCode = 'N8N_EVALUATOR_FAILED';
        shouldFallback = false; // No fallback for evaluator
        break;
      default:
        errorCode = 'SERVER_ERROR';
    }
  }

  // Log the error
  const errorDetails = createErrorDetails(errorCode, {
    workflow,
    originalError: error?.message,
    ...context,
  });
  logError(errorDetails);

  return { errorCode, shouldFallback };
}

/**
 * Enhanced error handler for file processing
 */
export function handleFileError(
  error: any,
  fileName: string,
  fileSize?: number
): keyof typeof ERROR_MESSAGES {
  let errorCode: keyof typeof ERROR_MESSAGES;

  if (fileSize && fileSize > 10 * 1024 * 1024) { // 10MB
    errorCode = 'FILE_TOO_LARGE';
  } else if (error?.message?.includes('pdf-parse')) {
    errorCode = 'PDF_EXTRACTION_FAILED';
  } else if (error?.message?.includes('corrupted') || error?.message?.includes('invalid')) {
    errorCode = 'FILE_CORRUPTED';
  } else {
    errorCode = 'FILE_TYPE_UNSUPPORTED';
  }

  // Log the error
  const errorDetails = createErrorDetails(errorCode, {
    fileName,
    fileSize,
    originalError: error?.message,
  });
  logError(errorDetails);

  return errorCode;
}

/**
 * Create retry action for notifications
 */
export function createRetryAction(retryFn: () => void): { label: string; onClick: () => void } {
  return {
    label: 'Retry',
    onClick: retryFn,
  };
}

/**
 * Create help action for notifications
 */
export function createHelpAction(helpUrl?: string): { label: string; onClick: () => void } {
  return {
    label: 'Get Help',
    onClick: () => {
      if (helpUrl) {
        window.open(helpUrl, '_blank');
      } else {
        // Default help action - could open a help modal or navigate to docs
        console.log('Help requested for error');
      }
    },
  };
}