'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CircularScore from '@/app/components/CircularScore';
import { useErrorHandler } from '@/app/hooks/useErrorHandler';

interface PendingCandidate {
  id: string;
  profile: {
    name: string;
    email: string;
    phone?: string;
    skills: string[];
  };
  evaluation: {
    score: number;
    reasoning: string;
    matchedSkills?: string[];
  };
  role: {
    id: string;
    title: string;
    department: string;
  };
  status: string;
  appliedAt: string;
  needsReview: boolean;
  reviewReason: string;
}

export default function ApprovalsPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<PendingCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'shortlisted' | 'low_score' | 'under_review'>('all');
  const [updating, setUpdating] = useState<string | null>(null);
  const { handleError, handleSuccess } = useErrorHandler();

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/approvals', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch approvals');
      const data = await response.json();
      setCandidates(data.candidates || []);
    } catch (err) {
      console.error(err);
      handleError('SERVER_ERROR');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedCandidates);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedCandidates(newSelection);
  };

  const handleCandidateAction = async (candidateId: string, action: 'shortlist' | 'reject', reason?: string) => {
    setUpdating(candidateId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/candidates/${candidateId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: action === 'shortlist' ? 'Shortlisted' : 'Rejected',
          overrideReason: reason || `${action === 'shortlist' ? 'Approved' : 'Rejected'} from approvals page`,
          notes: `Action taken from approvals page: ${action}`
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${action} candidate`);
      }

      handleSuccess(`Candidate ${action === 'shortlist' ? 'shortlisted' : 'rejected'} successfully`);
      fetchPendingApprovals();
    } catch (err) {
      console.error(err);
      handleError('SERVER_ERROR');
    } finally {
      setUpdating(null);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedCandidates.size === 0) return;

    try {
      const token = localStorage.getItem('token');
      const promises = Array.from(selectedCandidates).map(candidateId =>
        fetch(`/api/candidates/${candidateId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: 'Shortlisted',
            overrideReason: 'Bulk approval from approvals page',
            notes: 'Bulk approved from approvals page'
          }),
        })
      );

      await Promise.all(promises);
      handleSuccess(`Approved ${selectedCandidates.size} candidate(s)`);
      setSelectedCandidates(new Set());
      fetchPendingApprovals();
    } catch (err) {
      console.error(err);
      handleError('SERVER_ERROR');
    }
  };

  const handleScheduleInterview = async (candidateId: string, candidateName: string) => {
    setUpdating(candidateId);
    try {
      const token = localStorage.getItem('token');
      
      // First, schedule the interview
      const calendarResponse = await fetch('/api/agentic/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          candidateId,
          action: 'schedule_interview'
        })
      });

      if (!calendarResponse.ok) {
        throw new Error('Failed to schedule interview');
      }

      const calendarResult = await calendarResponse.json();
      
      // Then update candidate status to Interviewed
      const statusResponse = await fetch(`/api/candidates/${candidateId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'Interviewed',
          overrideReason: 'Interview scheduled from approvals page',
          notes: `Interview scheduled for ${calendarResult.interview?.scheduledTime}`
        })
      });

      if (!statusResponse.ok) {
        throw new Error('Failed to update candidate status');
      }

      handleSuccess(`Interview scheduled for ${candidateName}`);
      fetchPendingApprovals();
    } catch (error) {
      console.error('Error scheduling interview:', error);
      handleError('SERVER_ERROR');
    } finally {
      setUpdating(null);
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    switch (filter) {
      case 'shortlisted':
        return candidate.status === 'Shortlisted';
      case 'low_score':
        return candidate.evaluation.score < 50;
      case 'under_review':
        return candidate.status === 'Review';
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading candidates for review...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-3xl font-bold text-gray-900">Candidate Actions</h1>
              <p className="mt-2 text-gray-600">
                Review candidates and schedule interviews for shortlisted applicants
              </p>
            </div>
            <div className="bg-blue-100 border border-blue-200 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-blue-800">User Review Required</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter Candidates</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    filter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All ({candidates.length})
                </button>
                <button
                  onClick={() => setFilter('shortlisted')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    filter === 'shortlisted'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📅 Need Interview ({candidates.filter(c => c.status === 'Shortlisted').length})
                </button>
                <button
                  onClick={() => setFilter('low_score')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    filter === 'low_score'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Low Score ({candidates.filter(c => c.evaluation.score < 50).length})
                </button>
                <button
                  onClick={() => setFilter('under_review')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    filter === 'under_review'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Under Review ({candidates.filter(c => c.status === 'Review').length})
                </button>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              Showing {filteredCandidates.length} candidates needing review
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        {selectedCandidates.size > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">{selectedCandidates.size}</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {selectedCandidates.size} candidate{selectedCandidates.size > 1 ? 's' : ''} selected
                  </div>
                  <div className="text-sm text-gray-600">Ready for bulk action</div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedCandidates(new Set())}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Clear Selection
                </button>
                <button
                  onClick={handleBulkApprove}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Approve Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Candidates List */}
        {filteredCandidates.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {candidates.length === 0 ? 'No candidates need review' : 'No candidates match this filter'}
              </h3>
              <p className="text-gray-600">
                {candidates.length === 0 
                  ? 'All candidates have been processed or are performing well.' 
                  : 'Try selecting a different filter to see candidates.'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCandidates.map((candidate) => (
              <div key={candidate.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex items-start gap-6">
                    {/* Checkbox */}
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.has(candidate.id)}
                        onChange={() => toggleSelection(candidate.id)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>

                    {/* Candidate Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{candidate.profile.name}</h3>
                            
                            {/* Status Badge */}
                            {candidate.status === 'Shortlisted' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                📅 Needs Interview
                              </span>
                            )}
                            {candidate.evaluation.score < 50 && candidate.status !== 'Shortlisted' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Low Score ({candidate.evaluation.score})
                              </span>
                            )}
                            {candidate.status === 'Review' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Under Review
                              </span>
                            )}
                          </div>
                          
                          <div className="text-gray-600 mb-1">
                            Applying for: <span className="font-medium">{candidate.role.title}</span> • {candidate.role.department}
                          </div>
                          <div className="text-sm text-gray-500">{candidate.profile.email}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Applied: {new Date(candidate.appliedAt).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          <CircularScore score={candidate.evaluation.score} size="sm" />
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="mb-4">
                        <div className="text-sm font-medium text-gray-700 mb-2">Skills</div>
                        <div className="flex flex-wrap gap-2">
                          {candidate.profile.skills.slice(0, 6).map((skill, idx) => (
                            <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {skill}
                            </span>
                          ))}
                          {candidate.profile.skills.length > 6 && (
                            <span className="text-sm text-gray-500">+{candidate.profile.skills.length - 6} more</span>
                          )}
                        </div>
                      </div>

                      {/* AI Analysis */}
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 mb-1">AI Analysis</div>
                            <p className="text-sm text-gray-700">{candidate.evaluation.reasoning}</p>
                            {candidate.evaluation.matchedSkills && candidate.evaluation.matchedSkills.length > 0 && (
                              <div className="mt-2 text-xs text-gray-600">
                                <span className="font-medium">Key Matches:</span> {candidate.evaluation.matchedSkills.join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => router.push(`/dashboard/candidates/${candidate.id}`)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Review Details
                        </button>
                        
                        {candidate.status === 'Shortlisted' ? (
                          <button
                            onClick={() => handleScheduleInterview(candidate.id, candidate.profile.name)}
                            disabled={updating === candidate.id}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed gap-2"
                          >
                            {updating === candidate.id ? (
                              <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v1a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2z" />
                              </svg>
                            )}
                            📅 Schedule Interview
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleCandidateAction(candidate.id, 'shortlist', 'Approved after manual review')}
                              disabled={updating === candidate.id}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed gap-2"
                            >
                              {updating === candidate.id ? (
                                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                              Approve & Schedule
                            </button>
                            
                            <button
                              onClick={() => handleCandidateAction(candidate.id, 'reject', 'Rejected after manual review')}
                              disabled={updating === candidate.id}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
