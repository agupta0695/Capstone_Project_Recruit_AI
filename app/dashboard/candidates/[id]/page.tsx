'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CircularScore from '@/app/components/CircularScore';
import { useErrorHandler } from '@/app/hooks/useErrorHandler';

interface Candidate {
  id: string;
  status: string;
  notes?: string;
  overridden: boolean;
  overrideReason?: string;
  statusHistory?: Array<{
    status: string;
    timestamp: string;
    changedBy: string;
    reason: string;
    notes?: string;
  }>;
  profile: {
    name: string;
    email: string;
    phone: string;
    skills: string[];
    experience: string;
    education: string;
  };
  evaluation: {
    score: number;
    matchedSkills: string[];
    reasoning: string;
  };
  role: {
    id: string;
    title: string;
    department: string;
    evaluationCriteria: {
      requiredSkills: string[];
    };
  };
  appliedAt: string;
  updatedAt: string;
}

const statusOptions = [
  { value: 'Review', label: 'Under Review', color: 'bg-yellow-100 text-yellow-800', icon: '🔍' },
  { value: 'Shortlisted', label: 'Shortlisted', color: 'bg-green-100 text-green-800', icon: '✅' },
  { value: 'Interviewed', label: 'Interviewed', color: 'bg-blue-100 text-blue-800', icon: '🎤' },
  { value: 'Hired', label: 'Hired', color: 'bg-purple-100 text-purple-800', icon: '🎉' },
  { value: 'Rejected', label: 'Rejected', color: 'bg-red-100 text-red-800', icon: '❌' },
  { value: 'Withdrawn', label: 'Withdrawn', color: 'bg-gray-100 text-gray-800', icon: '↩️' }
];

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const { handleError, handleSuccess } = useErrorHandler();

  useEffect(() => {
    fetchCandidate();
  }, [params.id]);

  const fetchCandidate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/candidates/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 404) {
          handleError('CANDIDATE_NOT_FOUND');
          router.push('/dashboard');
          return;
        }
        throw new Error('Failed to fetch candidate');
      }
      
      const data = await response.json();
      setCandidate(data);
    } catch (err) {
      console.error(err);
      handleError('SERVER_ERROR');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    setStatusNotes('');
    setOverrideReason('');
    setShowStatusModal(true);
  };

  const updateStatus = async () => {
    if (!selectedStatus) return;

    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/candidates/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          status: selectedStatus,
          notes: statusNotes,
          overrideReason: overrideReason || `Status changed to ${selectedStatus}`
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      const result = await response.json();
      handleSuccess(`Candidate status updated to ${selectedStatus}`);
      
      setShowStatusModal(false);
      fetchCandidate();
    } catch (err) {
      console.error(err);
      handleError('SERVER_ERROR');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading candidate details...</p>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">❌</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Candidate not found</h3>
          <p className="text-gray-600 mb-4">The candidate you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const matchedSkills = candidate.profile.skills.filter(skill =>
    candidate.role.evaluationCriteria.requiredSkills.some(req => req.toLowerCase() === skill.toLowerCase())
  );
  const unmatchedSkills = candidate.profile.skills.filter(skill =>
    !candidate.role.evaluationCriteria.requiredSkills.some(req => req.toLowerCase() === skill.toLowerCase())
  );

  const currentStatusOption = statusOptions.find(opt => opt.value === candidate.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/dashboard/roles/${candidate.role.id}`)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {candidate.role.title}
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Candidate Review</h1>
              <p className="text-gray-600 mt-1">Review and manage candidate application</p>
            </div>
            
            {/* AI Partner Badge */}
            <div className="bg-purple-100 border border-purple-200 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-purple-800">AI Partner Assisted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Candidate Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                  {candidate.profile.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{candidate.profile.name}</h2>
                  <p className="text-gray-600 mb-3">Applying for: {candidate.role.title}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Email</div>
                        <div className="text-sm font-medium text-gray-900">{candidate.profile.email || 'Not provided'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Phone</div>
                        <div className="text-sm font-medium text-gray-900">{candidate.profile.phone || 'Not provided'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Status */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Current Status</div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${currentStatusOption?.color || 'bg-gray-100 text-gray-800'}`}>
                        {currentStatusOption?.icon} {candidate.status}
                      </span>
                      {candidate.overridden && (
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          User Override
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowStatusModal(true)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Change Status
                  </button>
                </div>
              </div>

              {/* Application Timeline */}
              <div className="text-sm text-gray-600 grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Applied:</span> {new Date(candidate.appliedAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span> {new Date(candidate.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Skills Assessment */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Assessment</h3>
              
              {matchedSkills.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">Matched Required Skills ({matchedSkills.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {matchedSkills.map((skill, idx) => (
                      <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {unmatchedSkills.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">Additional Skills ({unmatchedSkills.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {unmatchedSkills.map((skill, idx) => (
                      <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Evaluation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Partner Evaluation</h3>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">AI Analysis</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">{candidate.evaluation.reasoning}</p>
                    
                    {candidate.evaluation.matchedSkills.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-purple-200">
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">Key Skill Matches:</span> {candidate.evaluation.matchedSkills.join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {candidate.notes && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{candidate.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Score & Actions */}
          <div className="space-y-6">
            {/* AI Score Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <CircularScore score={candidate.evaluation.score} size="lg" />
                <div className="mt-4">
                  <div className="text-sm text-gray-600 mb-1">AI Match Score</div>
                  <div className="text-lg font-bold text-gray-900">
                    {candidate.evaluation.score >= 80 ? 'Excellent Match' :
                     candidate.evaluation.score >= 70 ? 'Strong Match' :
                     candidate.evaluation.score >= 50 ? 'Moderate Match' :
                     'Weak Match'}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleStatusChange('Shortlisted')}
                  disabled={candidate.status === 'Shortlisted'}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Shortlist
                </button>
                <button
                  onClick={() => handleStatusChange('Interviewed')}
                  disabled={candidate.status === 'Interviewed'}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Schedule Interview
                </button>
                <button
                  onClick={() => handleStatusChange('Rejected')}
                  disabled={candidate.status === 'Rejected'}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Reject
                </button>
              </div>
            </div>

            {/* Role Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Information</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500">Position</div>
                  <div className="text-sm font-medium text-gray-900">{candidate.role.title}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Department</div>
                  <div className="text-sm font-medium text-gray-900">{candidate.role.department}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Required Skills</div>
                  <div className="text-sm text-gray-700">{candidate.role.evaluationCriteria.requiredSkills.join(', ')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Change Modal */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Change Candidate Status</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedStatus(option.value)}
                      className={`p-3 text-left border rounded-lg transition-colors ${
                        selectedStatus === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{option.icon}</span>
                        <span className="text-sm font-medium">{option.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Change
                </label>
                <input
                  type="text"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Brief reason for status change..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  rows={3}
                  placeholder="Add any additional notes about this candidate..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={updateStatus}
                  disabled={!selectedStatus || updating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
