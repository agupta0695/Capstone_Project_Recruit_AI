'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CircularScore from '@/app/components/CircularScore';

interface Candidate {
  id: string;
  status: string;
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
    title: string;
    evaluationCriteria: {
      requiredSkills: string[];
    };
  };
}

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidate();
  }, [params.id]);

  const fetchCandidate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/candidates/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch candidate');
      const data = await response.json();
      setCandidate(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/candidates/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      fetchCandidate();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Candidate not found</div>
      </div>
    );
  }

  const matchedSkills = candidate.profile.skills.filter(skill =>
    candidate.role.evaluationCriteria.requiredSkills.some(req => req.toLowerCase() === skill.toLowerCase())
  );
  const unmatchedSkills = candidate.profile.skills.filter(skill =>
    !candidate.role.evaluationCriteria.requiredSkills.some(req => req.toLowerCase() === skill.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-primary hover:text-primary-dark mb-6 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Role
        </button>

        {/* Main Card */}
        <div className="card mb-6">
          <div className="flex items-start gap-8 mb-8">
            {/* Profile Section */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold">
                  {candidate.profile.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-text-primary">{candidate.profile.name}</h1>
                  <p className="text-text-secondary mt-1">Applying for: {candidate.role.title}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-text-secondary">Email</div>
                    <div className="text-sm font-medium text-text-primary">{candidate.profile.email || 'Not provided'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-text-secondary">Phone</div>
                    <div className="text-sm font-medium text-text-primary">{candidate.profile.phone || 'Not provided'}</div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="text-sm font-medium text-text-secondary mb-2">Current Status</div>
                <span className={
                  candidate.status === 'Shortlisted' ? 'badge-success' :
                  candidate.status === 'Review' ? 'badge-warning' :
                  'badge-error'
                }>
                  {candidate.status}
                </span>
              </div>
            </div>

            {/* Score Section */}
            <div className="flex flex-col items-center">
              <CircularScore score={candidate.evaluation.score} size="lg" />
              <div className="mt-4 text-center">
                <div className="text-sm text-text-secondary mb-1">Match Quality</div>
                <div className="text-lg font-bold text-text-primary">
                  {candidate.evaluation.score >= 70 ? 'Strong Match' :
                   candidate.evaluation.score >= 50 ? 'Moderate Match' :
                   'Weak Match'}
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-text-primary mb-4">Skills Assessment</h3>
            
            {matchedSkills.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-text-primary">Matched Skills ({matchedSkills.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {matchedSkills.map((skill, idx) => (
                    <span key={idx} className="badge-success">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {unmatchedSkills.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-text-primary">Additional Skills ({unmatchedSkills.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {unmatchedSkills.map((skill, idx) => (
                    <span key={idx} className="badge-info">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Evaluation */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-text-primary mb-4">AI Evaluation</h3>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary mb-2">Reasoning</h4>
                  <p className="text-text-primary leading-relaxed">{candidate.evaluation.reasoning}</p>
                </div>
              </div>
              
              {candidate.evaluation.matchedSkills.length > 0 && (
                <div className="pt-4 border-t border-purple-200">
                  <div className="text-sm text-text-secondary">
                    <span className="font-medium">Key Matches:</span> {candidate.evaluation.matchedSkills.join(', ')}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => updateStatus('Shortlisted')}
              className="flex-1 btn-success flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Shortlist Candidate
            </button>
            <button
              onClick={() => updateStatus('Review')}
              className="flex-1 bg-warning hover:bg-yellow-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Mark for Review
            </button>
            <button
              onClick={() => updateStatus('Rejected')}
              className="flex-1 btn-error flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
