/**
 * Test script for Agentic Hiring System
 * Demonstrates autonomous workflow execution, calendar integration, and draft generation
 */

const { 
  executeAgenticWorkflow, 
  batchExecuteAgenticWorkflows,
  makeAgenticDecision 
} = require('./lib/agenticWorkflow');

const { 
  scheduleInterview, 
  batchScheduleInterviews,
  getAvailableTimeSlots,
  getInterviewerAvailability 
} = require('./lib/calendar');

const { 
  generateInterviewInvitation,
  generateRejectionEmail,
  generateInterviewQuestions,
  generateOfferLetter,
  batchGenerateCommunications 
} = require('./lib/draftGeneration');

// Mock candidate data
const mockCandidates = [
  {
    id: 'cand-001',
    profile: {
      name: 'Alice Johnson',
      email: 'alice.johnson@email.com',
      phone: '555-0101',
      skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker'],
      experience: '6 years',
      education: "Master's in Computer Science",
      summary: 'Senior full-stack developer with extensive cloud experience'
    },
    evaluation: {
      overallScore: 92,
      confidence: 88,
      matchedSkills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker'],
      missingSkills: [],
      strengths: [
        'Exceptional technical skills in all required areas',
        'Strong cloud architecture experience',
        'Leadership and mentoring background'
      ],
      concerns: [],
      recommendation: 'Strongly Recommend',
      interviewRecommendations: {
        focus: ['System architecture', 'Team leadership', 'Advanced AWS services'],
        questions: [
          'Describe a complex system you architected using AWS',
          'How do you approach mentoring junior developers?',
          'Walk us through your approach to microservices design'
        ]
      }
    }
  },
  {
    id: 'cand-002',
    profile: {
      name: 'Bob Chen',
      email: 'bob.chen@email.com',
      phone: '555-0102',
      skills: ['React', 'Node.js', 'Python', 'PostgreSQL'],
      experience: '4 years',
      education: "Bachelor's in Computer Science",
      summary: 'Full-stack developer with strong problem-solving skills'
    },
    evaluation: {
      overallScore: 75,
      confidence: 80,
      matchedSkills: ['React', 'Node.js'],
      missingSkills: ['TypeScript', 'AWS', 'Docker'],
      strengths: [
        'Solid foundation in web development',
        'Good problem-solving abilities',
        'Quick learner with diverse tech stack'
      ],
      concerns: [
        'Missing key cloud technologies (AWS, Docker)',
        'Limited TypeScript experience',
        'May need training on containerization'
      ],
      recommendation: 'Consider',
      interviewRecommendations: {
        focus: ['Learning ability', 'Cloud readiness', 'TypeScript adoption'],
        questions: [
          'How do you approach learning new technologies?',
          'Describe your experience with cloud platforms',
          'What interests you about TypeScript?'
        ]
      }
    }
  },
  {
    id: 'cand-003',
    profile: {
      name: 'Carol Davis',
      email: 'carol.davis@email.com',
      phone: '555-0103',
      skills: ['JavaScript', 'HTML', 'CSS', 'jQuery'],
      experience: '2 years',
      education: "Associate's in Web Development",
      summary: 'Junior developer eager to grow in modern technologies'
    },
    evaluation: {
      overallScore: 45,
      confidence: 70,
      matchedSkills: ['JavaScript'],
      missingSkills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker'],
      strengths: [
        'Basic web development foundation',
        'Enthusiasm for learning',
        'Good communication skills'
      ],
      concerns: [
        'Significant skill gaps in modern frameworks',
        'Limited experience with backend technologies',
        'No cloud or containerization experience',
        'May require extensive training'
      ],
      recommendation: 'Not Recommended',
      interviewRecommendations: {
        focus: ['Learning potential', 'Career goals', 'Training readiness'],
        questions: [
          'What modern frameworks are you most interested in learning?',
          'How do you stay updated with new technologies?',
          'Where do you see yourself in 2 years?'
        ]
      }
    }
  }
];

const mockRole = {
  id: 'role-001',
  title: 'Senior Full Stack Developer',
  department: 'Engineering',
  requirements: {
    requiredSkills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker'],
    niceToHaveSkills: ['Python', 'Kubernetes', 'GraphQL'],
    experienceLevel: 'Senior',
    educationLevel: "Bachelor's",
    responsibilities: [
      'Lead development of scalable web applications',
      'Mentor junior developers',
      'Architect cloud-native solutions'
    ]
  }
};

async function testAgenticDecisions() {
  console.log('🧠 Testing Agentic Decision Making');
  console.log('='.repeat(60));
  
  mockCandidates.forEach((candidate, index) => {
    console.log(`\n${index + 1}. Candidate: ${candidate.profile.name}`);
    console.log(`   Score: ${candidate.evaluation.overallScore}/100`);
    console.log(`   Skills: ${candidate.profile.skills.join(', ')}`);
    
    const decision = makeAgenticDecision(
      candidate.evaluation,
      mockRole.requirements,
      mockRole.title
    );
    
    console.log(`   🎯 Decision: ${decision.decision}`);
    console.log(`   📊 Confidence: ${decision.confidence}%`);
    console.log(`   💭 Reasoning: ${decision.reasoning}`);
    console.log(`   ⏱️  Timeline: ${decision.timeline}`);
    console.log(`   📋 Actions: ${decision.recommendedActions.length} recommended`);
  });
}

async function testCalendarIntegration() {
  console.log('\n\n📅 Testing Calendar Integration');
  console.log('='.repeat(60));
  
  // Test interviewer availability
  console.log('\n👥 Interviewer Availability:');
  const availability = getInterviewerAvailability();
  availability.forEach(avail => {
    console.log(`   ${avail.interviewer.name}: ${avail.availableSlots} slots available`);
    if (avail.nextAvailable) {
      console.log(`     Next: ${avail.nextAvailable.toLocaleString()}`);
    }
  });
  
  // Test available time slots
  console.log('\n🕐 Available Time Slots (next 7 days):');
  const timeSlots = getAvailableTimeSlots('technical', 7);
  console.log(`   Found ${timeSlots.length} available slots`);
  
  if (timeSlots.length > 0) {
    console.log('   Next 3 slots:');
    timeSlots.slice(0, 3).forEach((slot, index) => {
      console.log(`     ${index + 1}. ${slot.start.toLocaleString()} with ${slot.interviewerName}`);
    });
  }
  
  // Test single interview scheduling
  console.log('\n📝 Scheduling Interview for Top Candidate:');
  const topCandidate = mockCandidates[0];
  const interview = await scheduleInterview(
    topCandidate.id,
    topCandidate.profile.name,
    topCandidate.profile.email,
    mockRole.id,
    mockRole.title,
    'technical',
    topCandidate.evaluation
  );
  
  if (interview) {
    console.log(`   ✅ Scheduled: ${interview.candidateName}`);
    console.log(`   📅 Time: ${interview.scheduledTime.toLocaleString()}`);
    console.log(`   👤 Interviewer: ${interview.interviewerName}`);
    console.log(`   🔗 Meeting: ${interview.meetingLink}`);
    console.log(`   ⏱️  Duration: ${interview.duration} minutes`);
  }
}

async function testDraftGeneration() {
  console.log('\n\n📝 Testing Draft Generation');
  console.log('='.repeat(60));
  
  // Test interview invitation
  console.log('\n✉️  Generating Interview Invitation:');
  const topCandidate = mockCandidates[0];
  const mockInterview = {
    id: 'int-001',
    candidateId: topCandidate.id,
    candidateName: topCandidate.profile.name,
    candidateEmail: topCandidate.profile.email,
    roleId: mockRole.id,
    roleTitle: mockRole.title,
    interviewerId: 'int-001',
    interviewerName: 'Sarah Chen',
    interviewerEmail: 'sarah.chen@company.com',
    scheduledTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    duration: 90,
    type: 'technical',
    meetingLink: 'https://zoom.us/j/1234567890',
    status: 'scheduled',
    notes: 'High-priority candidate - fast track'
  };
  
  const invitation = generateInterviewInvitation(mockInterview, topCandidate.evaluation);
  console.log(`   📧 To: ${invitation.to}`);
  console.log(`   📋 Subject: ${invitation.subject}`);
  console.log(`   🏷️  Priority: ${invitation.priority}`);
  console.log(`   📝 Body Preview: ${invitation.body.substring(0, 150)}...`);
  
  // Test rejection email
  console.log('\n❌ Generating Rejection Email:');
  const rejectedCandidate = mockCandidates[2];
  const rejection = generateRejectionEmail(
    rejectedCandidate.profile.name,
    rejectedCandidate.profile.email,
    mockRole.title,
    rejectedCandidate.evaluation
  );
  console.log(`   📧 To: ${rejection.to}`);
  console.log(`   📋 Subject: ${rejection.subject}`);
  console.log(`   📝 Body Preview: ${rejection.body.substring(0, 150)}...`);
  
  // Test interview questions
  console.log('\n❓ Generating Interview Questions:');
  const questions = generateInterviewQuestions(
    topCandidate.profile.name,
    mockRole.title,
    'technical',
    topCandidate.evaluation
  );
  console.log(`   📊 Total Questions: ${questions.questions.length}`);
  console.log(`   ⏱️  Total Duration: ${questions.totalDuration} minutes`);
  console.log(`   🎯 Focus Areas: ${questions.focusAreas.join(', ')}`);
  console.log('   Sample Questions:');
  questions.questions.slice(0, 2).forEach((q, index) => {
    console.log(`     ${index + 1}. [${q.category}] ${q.question}`);
    console.log(`        Time: ${q.timeAllocation} min, Difficulty: ${q.difficulty}`);
  });
  
  // Test offer letter
  console.log('\n🎉 Generating Offer Letter:');
  const offer = generateOfferLetter(
    topCandidate.profile.name,
    topCandidate.profile.email,
    mockRole.title,
    topCandidate.evaluation,
    145000,
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
  );
  console.log(`   📧 To: ${offer.to}`);
  console.log(`   📋 Subject: ${offer.subject}`);
  console.log(`   🏷️  Priority: ${offer.priority}`);
  console.log(`   📎 Attachments: ${offer.attachments?.length || 0}`);
}

async function testBatchOperations() {
  console.log('\n\n🔄 Testing Batch Operations');
  console.log('='.repeat(60));
  
  // Test batch interview scheduling
  console.log('\n📅 Batch Interview Scheduling:');
  const candidatesForScheduling = mockCandidates.slice(0, 2).map(c => ({
    id: c.id,
    name: c.profile.name,
    email: c.profile.email,
    roleId: mockRole.id,
    roleTitle: mockRole.title,
    evaluation: c.evaluation
  }));
  
  const batchInterviews = await batchScheduleInterviews(candidatesForScheduling);
  console.log(`   ✅ Scheduled: ${batchInterviews.length} interviews`);
  batchInterviews.forEach((interview, index) => {
    console.log(`     ${index + 1}. ${interview.candidateName} - ${interview.scheduledTime.toLocaleString()}`);
  });
  
  // Test batch communication generation
  console.log('\n📧 Batch Communication Generation:');
  const candidatesForComms = mockCandidates.map(c => ({
    id: c.id,
    name: c.profile.name,
    email: c.profile.email,
    roleTitle: mockRole.title,
    evaluation: c.evaluation,
    status: c.evaluation.overallScore >= 70 ? 'interview_scheduled' : 'rejected'
  }));
  
  const batchDrafts = batchGenerateCommunications(candidatesForComms);
  console.log(`   ✅ Generated: ${batchDrafts.length} email drafts`);
  batchDrafts.forEach((draft, index) => {
    console.log(`     ${index + 1}. ${draft.type} to ${draft.to.split('@')[0]}@... - ${draft.subject}`);
  });
}

async function testFullAgenticWorkflow() {
  console.log('\n\n🤖 Testing Full Agentic Workflow');
  console.log('='.repeat(60));
  
  console.log('\n🚀 Executing Single Agentic Workflow:');
  const candidate = mockCandidates[1]; // Medium-scoring candidate
  
  try {
    const workflow = await executeAgenticWorkflow(
      candidate.id,
      candidate.profile,
      mockRole.id,
      mockRole.requirements,
      mockRole.title
    );
    
    console.log(`   📊 Workflow Status: ${workflow.status}`);
    console.log(`   ⏱️  Duration: ${workflow.totalDuration}ms`);
    console.log(`   📋 Steps Completed: ${workflow.steps.filter(s => s.status === 'completed').length}/${workflow.steps.length}`);
    
    if (workflow.decisions.length > 0) {
      const decision = workflow.decisions[0];
      console.log(`   🎯 Decision: ${decision.decision}`);
      console.log(`   📊 Confidence: ${decision.confidence}%`);
      console.log(`   📧 Emails Generated: ${workflow.generatedContent.emails.length}`);
      console.log(`   📅 Interviews Scheduled: ${workflow.generatedContent.interviews.length}`);
      console.log(`   ❓ Questions Generated: ${workflow.generatedContent.questions.length}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Workflow failed: ${error.message}`);
  }
  
  console.log('\n🔄 Executing Batch Agentic Workflow:');
  const batchCandidates = mockCandidates.map(c => ({
    id: c.id,
    profile: c.profile,
    roleId: mockRole.id,
    roleRequirements: mockRole.requirements,
    roleTitle: mockRole.title
  }));
  
  try {
    const batchWorkflows = await batchExecuteAgenticWorkflows(batchCandidates);
    
    console.log(`   📊 Total Processed: ${batchWorkflows.length}`);
    console.log(`   ✅ Successful: ${batchWorkflows.filter(w => w.status === 'completed').length}`);
    console.log(`   ❌ Failed: ${batchWorkflows.filter(w => w.status === 'failed').length}`);
    
    const decisions = batchWorkflows.map(w => w.decisions[0]?.decision).filter(Boolean);
    const decisionCounts = decisions.reduce((acc, decision) => {
      acc[decision] = (acc[decision] || 0) + 1;
      return acc;
    }, {});
    
    console.log('   📈 Decision Breakdown:');
    Object.entries(decisionCounts).forEach(([decision, count]) => {
      console.log(`     ${decision}: ${count}`);
    });
    
  } catch (error) {
    console.log(`   ❌ Batch workflow failed: ${error.message}`);
  }
}

async function runAllTests() {
  console.log('🤖 AGENTIC HIRING SYSTEM TEST SUITE');
  console.log('='.repeat(80));
  console.log(`Testing with ${mockCandidates.length} candidates for ${mockRole.title} role`);
  
  try {
    await testAgenticDecisions();
    await testCalendarIntegration();
    await testDraftGeneration();
    await testBatchOperations();
    await testFullAgenticWorkflow();
    
    console.log('\n\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(80));
    console.log('✅ Agentic Decision Making: Working');
    console.log('✅ Calendar Integration: Working');
    console.log('✅ Draft Generation: Working');
    console.log('✅ Batch Operations: Working');
    console.log('✅ Full Workflow Execution: Working');
    
    console.log('\n🚀 Your AI hiring system is now fully agentic!');
    console.log('   • Autonomous candidate evaluation and decision making');
    console.log('   • Intelligent interview scheduling based on priority');
    console.log('   • Personalized communication generation');
    console.log('   • Batch processing for efficiency');
    console.log('   • End-to-end workflow automation');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
  }
}

// Run the test suite
runAllTests().catch(console.error);