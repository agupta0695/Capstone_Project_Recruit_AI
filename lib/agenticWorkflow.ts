/**
 * Agentic Workflow Module for HireAI
 * 
 * Orchestrates autonomous hiring workflows including:
 * - Candidate evaluation and scoring
 * - Automatic interview scheduling
 * - Personalized communication generation
 * - Decision making based on AI evaluation
 */

import { scheduleInterview, batchScheduleInterviews, type InterviewSchedule } from './calendar';
import { 
  generateInterviewInvitation, 
  generateRejectionEmail, 
  generateInterviewQuestions,
  generateOfferLetter,
  batchGenerateCommunications,
  type EmailDraft,
  type InterviewQuestions
} from './draftGeneration';
import { evaluateCandidate } from './n8n';

export interface AgenticDecision {
  candidateId: string;
  decision: 'auto_reject' | 'schedule_screening' | 'schedule_technical' | 'schedule_behavioral' | 'fast_track' | 'manual_review';
  confidence: number;
  reasoning: string;
  recommendedActions: string[];
  timeline: string;
}

export interface WorkflowExecution {
  id: string;
  candidateId: string;
  roleId: string;
  status: 'in_progress' | 'completed' | 'failed' | 'paused';
  steps: WorkflowStep[];
  startTime: Date;
  endTime?: Date;
  totalDuration?: number;
  decisions: AgenticDecision[];
  generatedContent: {
    emails: EmailDraft[];
    interviews: InterviewSchedule[];
    questions: InterviewQuestions[];
  };
}

export interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  output?: any;
  error?: string;
}

/**
 * Make autonomous hiring decision based on candidate evaluation
 */
export function makeAgenticDecision(
  candidateEvaluation: any,
  roleRequirements: any,
  roleTitle: string
): AgenticDecision {
  const score = candidateEvaluation.overallScore || 0;
  const confidence = candidateEvaluation.confidence || 0;
  const matchedSkills = candidateEvaluation.matchedSkills || [];
  const missingSkills = candidateEvaluation.missingSkills || [];
  const requiredSkills = roleRequirements.requiredSkills || [];
  
  // Calculate skill match percentage
  const skillMatchPercentage = requiredSkills.length > 0 
    ? (matchedSkills.length / requiredSkills.length) * 100 
    : 0;

  let decision: AgenticDecision['decision'];
  let reasoning: string;
  let recommendedActions: string[];
  let timeline: string;

  // Decision logic based on multiple factors
  if (score >= 90 && confidence >= 85 && skillMatchPercentage >= 80) {
    decision = 'fast_track';
    reasoning = `Exceptional candidate with ${score}/100 score, ${confidence}% confidence, and ${skillMatchPercentage.toFixed(0)}% skill match. Strong alignment with role requirements.`;
    recommendedActions = [
      'Schedule technical interview within 2 days',
      'Prepare senior-level interview questions',
      'Consider expedited hiring process',
      'Draft competitive offer letter'
    ];
    timeline = '2-3 days to final decision';
    
  } else if (score >= 80 && confidence >= 75 && skillMatchPercentage >= 70) {
    decision = 'schedule_technical';
    reasoning = `Strong candidate with ${score}/100 score and good skill alignment. Technical interview recommended to validate capabilities.`;
    recommendedActions = [
      'Schedule technical interview within 5 days',
      'Focus on missing skills assessment',
      'Prepare role-specific technical questions',
      'Include system design discussion'
    ];
    timeline = '5-7 days to decision';
    
  } else if (score >= 65 && confidence >= 60 && skillMatchPercentage >= 50) {
    decision = 'schedule_behavioral';
    reasoning = `Moderate candidate with ${score}/100 score. Behavioral interview recommended to assess cultural fit and growth potential.`;
    recommendedActions = [
      'Schedule behavioral interview within 7 days',
      'Assess learning ability and adaptability',
      'Evaluate cultural fit and communication skills',
      'Consider for junior or growth roles'
    ];
    timeline = '7-10 days to decision';
    
  } else if (score >= 50 && confidence >= 50) {
    decision = 'schedule_screening';
    reasoning = `Basic qualification threshold met with ${score}/100 score. Initial screening recommended to gather more information.`;
    recommendedActions = [
      'Schedule phone/video screening within 10 days',
      'Verify basic qualifications and interest',
      'Assess communication skills',
      'Determine if worth further investment'
    ];
    timeline = '10-14 days to decision';
    
  } else if (score < 50 || confidence < 40) {
    decision = 'auto_reject';
    reasoning = `Insufficient qualification with ${score}/100 score and ${confidence}% confidence. Does not meet minimum requirements for the role.`;
    recommendedActions = [
      'Send personalized rejection email',
      'Provide constructive feedback',
      'Keep profile for future opportunities',
      'Suggest skill development areas'
    ];
    timeline = 'Immediate';
    
  } else {
    decision = 'manual_review';
    reasoning = `Borderline candidate requiring human judgment. Score: ${score}/100, Confidence: ${confidence}%, Mixed signals in evaluation.`;
    recommendedActions = [
      'Flag for hiring manager review',
      'Schedule brief discussion with team',
      'Consider portfolio/work samples',
      'Make decision within 3 days'
    ];
    timeline = '3-5 days for manual review';
  }

  return {
    candidateId: candidateEvaluation.candidateId || 'unknown',
    decision,
    confidence: Math.min(confidence, 95), // Cap confidence at 95%
    reasoning,
    recommendedActions,
    timeline
  };
}

/**
 * Execute autonomous hiring workflow for a candidate
 */
export async function executeAgenticWorkflow(
  candidateId: string,
  candidateProfile: any,
  roleId: string,
  roleRequirements: any,
  roleTitle: string
): Promise<WorkflowExecution> {
  const workflowId = `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const startTime = new Date();
  
  const workflow: WorkflowExecution = {
    id: workflowId,
    candidateId,
    roleId,
    status: 'in_progress',
    steps: [],
    startTime,
    decisions: [],
    generatedContent: {
      emails: [],
      interviews: [],
      questions: []
    }
  };

  try {
    // Step 1: AI Evaluation
    const evaluationStep = createWorkflowStep('ai_evaluation', 'AI Candidate Evaluation');
    workflow.steps.push(evaluationStep);
    
    evaluationStep.status = 'in_progress';
    evaluationStep.startTime = new Date();
    
    const evaluationResult = await evaluateCandidate(candidateProfile, roleRequirements);
    
    if (!evaluationResult.data) {
      evaluationStep.status = 'failed';
      evaluationStep.error = 'AI evaluation failed';
      workflow.status = 'failed';
      return workflow;
    }
    
    evaluationStep.status = 'completed';
    evaluationStep.endTime = new Date();
    evaluationStep.duration = evaluationStep.endTime.getTime() - evaluationStep.startTime.getTime();
    evaluationStep.output = evaluationResult.data;

    // Step 2: Agentic Decision Making
    const decisionStep = createWorkflowStep('agentic_decision', 'Autonomous Decision Making');
    workflow.steps.push(decisionStep);
    
    decisionStep.status = 'in_progress';
    decisionStep.startTime = new Date();
    
    const decision = makeAgenticDecision(evaluationResult.data, roleRequirements, roleTitle);
    workflow.decisions.push(decision);
    
    decisionStep.status = 'completed';
    decisionStep.endTime = new Date();
    decisionStep.duration = decisionStep.endTime.getTime() - decisionStep.startTime.getTime();
    decisionStep.output = decision;

    // Step 3: Execute Decision Actions
    const actionStep = createWorkflowStep('execute_actions', 'Execute Recommended Actions');
    workflow.steps.push(actionStep);
    
    actionStep.status = 'in_progress';
    actionStep.startTime = new Date();

    // Execute actions based on decision
    switch (decision.decision) {
      case 'fast_track':
      case 'schedule_technical':
      case 'schedule_behavioral':
      case 'schedule_screening':
        // Schedule interview
        const interviewType = decision.decision === 'fast_track' ? 'technical' :
                             decision.decision === 'schedule_technical' ? 'technical' :
                             decision.decision === 'schedule_behavioral' ? 'behavioral' : 'screening';
        
        const interview = await scheduleInterview(
          candidateId,
          candidateProfile.name,
          candidateProfile.email,
          roleId,
          roleTitle,
          interviewType,
          evaluationResult.data
        );
        
        if (interview) {
          workflow.generatedContent.interviews.push(interview);
          
          // Generate interview invitation email
          const invitationEmail = generateInterviewInvitation(interview, evaluationResult.data);
          workflow.generatedContent.emails.push(invitationEmail);
          
          // Generate interview questions
          const questions = generateInterviewQuestions(
            candidateProfile.name,
            roleTitle,
            interviewType,
            evaluationResult.data
          );
          workflow.generatedContent.questions.push(questions);
        }
        break;
        
      case 'auto_reject':
        // Generate rejection email
        const rejectionEmail = generateRejectionEmail(
          candidateProfile.name,
          candidateProfile.email,
          roleTitle,
          evaluationResult.data
        );
        workflow.generatedContent.emails.push(rejectionEmail);
        break;
        
      case 'manual_review':
        // Generate summary for manual review
        // This would typically create a task for hiring managers
        break;
    }
    
    actionStep.status = 'completed';
    actionStep.endTime = new Date();
    actionStep.duration = actionStep.endTime.getTime() - actionStep.startTime.getTime();
    actionStep.output = {
      emailsGenerated: workflow.generatedContent.emails.length,
      interviewsScheduled: workflow.generatedContent.interviews.length,
      questionsGenerated: workflow.generatedContent.questions.length
    };

    // Complete workflow
    workflow.status = 'completed';
    workflow.endTime = new Date();
    workflow.totalDuration = workflow.endTime.getTime() - workflow.startTime.getTime();

    console.log(`✅ Agentic workflow completed for candidate ${candidateProfile.name}`);
    console.log(`   Decision: ${decision.decision}`);
    console.log(`   Confidence: ${decision.confidence}%`);
    console.log(`   Actions: ${decision.recommendedActions.length} recommended`);
    console.log(`   Generated: ${workflow.generatedContent.emails.length} emails, ${workflow.generatedContent.interviews.length} interviews`);

  } catch (error) {
    workflow.status = 'failed';
    workflow.endTime = new Date();
    console.error('❌ Agentic workflow failed:', error);
  }

  return workflow;
}

/**
 * Batch execute agentic workflows for multiple candidates
 */
export async function batchExecuteAgenticWorkflows(
  candidates: Array<{
    id: string;
    profile: any;
    roleId: string;
    roleRequirements: any;
    roleTitle: string;
  }>
): Promise<WorkflowExecution[]> {
  const workflows: WorkflowExecution[] = [];
  
  console.log(`🚀 Starting batch agentic workflow for ${candidates.length} candidates`);
  
  // Process candidates in parallel (with concurrency limit)
  const concurrencyLimit = 3;
  const batches = [];
  
  for (let i = 0; i < candidates.length; i += concurrencyLimit) {
    batches.push(candidates.slice(i, i + concurrencyLimit));
  }
  
  for (const batch of batches) {
    const batchPromises = batch.map(candidate =>
      executeAgenticWorkflow(
        candidate.id,
        candidate.profile,
        candidate.roleId,
        candidate.roleRequirements,
        candidate.roleTitle
      )
    );
    
    const batchResults = await Promise.all(batchPromises);
    workflows.push(...batchResults);
    
    // Small delay between batches to avoid overwhelming systems
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Generate summary
  const successful = workflows.filter(w => w.status === 'completed');
  const failed = workflows.filter(w => w.status === 'failed');
  const decisions = successful.map(w => w.decisions[0]?.decision).filter(Boolean);
  
  console.log(`\n📊 Batch Workflow Summary:`);
  console.log(`   Total Processed: ${workflows.length}`);
  console.log(`   Successful: ${successful.length}`);
  console.log(`   Failed: ${failed.length}`);
  console.log(`   Decisions:`);
  
  const decisionCounts = decisions.reduce((acc, decision) => {
    acc[decision] = (acc[decision] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  Object.entries(decisionCounts).forEach(([decision, count]) => {
    console.log(`     ${decision}: ${count}`);
  });
  
  return workflows;
}

/**
 * Get workflow analytics and insights
 */
export function getWorkflowAnalytics(workflows: WorkflowExecution[]): {
  totalProcessed: number;
  successRate: number;
  averageDuration: number;
  decisionBreakdown: Record<string, number>;
  topReasons: string[];
  recommendedOptimizations: string[];
} {
  const successful = workflows.filter(w => w.status === 'completed');
  const decisions = successful.map(w => w.decisions[0]).filter(Boolean);
  
  const decisionBreakdown = decisions.reduce((acc, decision) => {
    acc[decision.decision] = (acc[decision.decision] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const averageDuration = successful.length > 0
    ? successful.reduce((sum, w) => sum + (w.totalDuration || 0), 0) / successful.length
    : 0;
  
  const topReasons = decisions
    .map(d => d.reasoning)
    .slice(0, 5);
  
  const recommendedOptimizations = [
    successful.length < workflows.length * 0.9 ? 'Improve AI evaluation reliability' : null,
    averageDuration > 30000 ? 'Optimize workflow performance' : null,
    decisionBreakdown.manual_review > workflows.length * 0.2 ? 'Refine decision criteria' : null,
    decisionBreakdown.auto_reject > workflows.length * 0.6 ? 'Review rejection thresholds' : null
  ].filter(Boolean) as string[];
  
  return {
    totalProcessed: workflows.length,
    successRate: workflows.length > 0 ? (successful.length / workflows.length) * 100 : 0,
    averageDuration,
    decisionBreakdown,
    topReasons,
    recommendedOptimizations
  };
}

/**
 * Helper function to create workflow step
 */
function createWorkflowStep(id: string, name: string): WorkflowStep {
  return {
    id,
    name,
    status: 'pending'
  };
}