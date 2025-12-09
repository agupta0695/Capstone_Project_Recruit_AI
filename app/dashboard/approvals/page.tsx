'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CircularScore from '@/app/components/CircularScore';

interface PendingCandidate {
  id: string;
  profile: {
    name: string;
    email: string;
    skills: string[];
  };
  evaluation: {
    score: number;
    reasoning: string;
  };
  role: {
    id: string;
    title: string;
  };
  status: string;
}

export default function ApprovalsPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<PendingCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());

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

  const handleBulkApprove = async () => {
    if (selectedCandidates.size === 0) return;

    try {
      const token = localStorage.getItem('token');
      await fetch('/api/approvals/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          candidateIds: Array.from(selectedCandidates),
          action: 'approve',
        }),
      });

      alert(`Approved ${selectedCandidates.size} candidate(s)`);
      setSelectedCandidates(new Set());
      fetchPendingApprovals();
    } catch (err) {
      console.error(err);
      alert('Failed to approve candidates');
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-text-secondary">Loading approvals...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Pending Approvals</h1>
          <p className="text-text-secondary">Review and approve AI-shortlisted candidates</p>
        </div>

        {/* Actions Bar */}
        {selectedCandidates.size > 0 && (
          <div className="card mb-6 bg-purple-50 border-primary">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">{selectedCandidates.size}</span>
                </div>
                <div>
                  <div className="font-semibold text-text-primary">
                    {selectedCandidates.size} candidate{selectedCandidates.size > 1 ? 's' : ''} selected
                  </div>
                  <div className="text-sm text-text-secondary">Ready for bulk action</div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedCandidates(new Set())}
                  className="btn-secondary"
                >
                  Clear Selection
                </button>
                <button
                  onClick={handleBulkApprove}
                  className="btn-success flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Approve Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Candidates List */}
        {candidates.length === 0 ? (
          <div className="card text-center py-16">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">All caught up!</h3>
            <p className="text-text-secondary">No pending approvals at the moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="card hover:border-primary transition-all">
                <div className="flex items-start gap-6">
                  {/* Checkbox */}
                  <div className="pt-1">
                    <input
                      type="checkbox"
                      checked={selectedCandidates.has(candidate.id)}
                      onChange={() => toggleSelection(candidate.id)}
                      className="w-5 h-5 text-primary border-border rounded focus:ring-2 focus:ring-primary cursor-pointer"
                    />
                  </div>

                  {/* Candidate Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-text-primary mb-1">{candidate.profile.name}</h3>
                        <p className="text-text-secondary">Applying for: {candidate.role.title}</p>
                        <p className="text-sm text-text-secondary mt-1">{candidate.profile.email}</p>
                      </div>
                      <CircularScore score={candidate.evaluation.score} size="sm" showLabel={false} />
                    </div>

                    {/* Skills */}
                    <div className="mb-4">
                      <div className="text-sm font-medium text-text-secondary mb-2">Skills</div>
                      <div className="flex flex-wrap gap-2">
                        {candidate.profile.skills.slice(0, 6).map((skill, idx) => (
                          <span key={idx} className="badge-purple">{skill}</span>
                        ))}
                        {candidate.profile.skills.length > 6 && (
                          <span className="text-sm text-text-secondary">+{candidate.profile.skills.length - 6} more</span>
                        )}
                      </div>
                    </div>

                    {/* AI Reasoning */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <div>
                          <div className="text-sm font-medium text-text-primary mb-1">AI Recommendation</div>
                          <p className="text-sm text-text-secondary">{candidate.evaluation.reasoning}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => router.push(`/dashboard/candidates/${candidate.id}`)}
                        className="btn-secondary flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Details
                      </button>
                      <button className="btn-success flex-1">
                        Approve & Schedule Interview
                      </button>
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
