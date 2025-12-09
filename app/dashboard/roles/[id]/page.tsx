'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Candidate {
  id: string;
  status: string;
  profile: {
    name: string;
    email: string;
    phone: string;
    skills: string[];
  };
  evaluation: {
    score: number;
  };
  createdAt: string;
}

interface Role {
  id: string;
  title: string;
  department: string;
  description: string;
  status: string;
  evaluationCriteria?: {
    requiredSkills?: string[];
    experienceLevel?: string;
    educationLevel?: string;
  };
  totalCandidates: number;
  screened: number;
  shortlisted: number;
  candidates: Candidate[];
}

export default function RoleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchRole();
  }, [params.id]);

  const fetchRole = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/roles/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch role');
      const data = await response.json();
      setRole(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load role');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    console.log('Files selected:', files.length);
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('roleId', params.id as string);
      
      Array.from(files).forEach(file => {
        console.log('Adding file:', file.name, file.size, file.type);
        formData.append('files', file);
      });

      const token = localStorage.getItem('token');
      console.log('Uploading to /api/resumes/upload...');
      
      const response = await fetch('/api/resumes/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Upload failed');
      }

      alert(`Successfully processed ${result.processed} resume(s)`);
      fetchRole();
      e.target.value = '';
    } catch (err) {
      console.error('Upload error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to upload resumes';
      setError(errorMsg);
      alert('Error: ' + errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const updateRoleStatus = async (newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/roles/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update role');
      
      fetchRole();
      alert(`Role status updated to ${newStatus}`);
    } catch (err) {
      console.error(err);
      alert('Failed to update role status');
    }
  };

  const deleteRole = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/roles/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete role');
      
      alert('Role deleted successfully');
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to delete role');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Role not found</div>
      </div>
    );
  }

  const filteredCandidates = filter === 'All' 
    ? role.candidates 
    : role.candidates.filter(c => c.status === filter);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-primary hover:text-primary-dark mb-4 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-text-primary">{role.title}</h1>
                <span className={role.status === 'active' ? 'badge-success' : 'badge-warning'}>
                  {role.status === 'active' ? 'Active' : 'Paused'}
                </span>
              </div>
              <p className="text-text-secondary">{role.department}</p>
            </div>
            
            <div className="flex gap-3">
              <label className="btn-primary cursor-pointer flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {uploading ? 'Uploading...' : 'Upload Resumes'}
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              
              <button
                className="btn-secondary flex items-center gap-2"
                onClick={() => {
                  const newStatus = role.status === 'active' ? 'paused' : 'active';
                  updateRoleStatus(newStatus);
                }}
              >
                {role.status === 'active' ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Pause
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Activate
                  </>
                )}
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn-error flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wide">Total Candidates</h3>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-text-primary">{role.totalCandidates}</p>
          </div>
          
          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wide">Screened</h3>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-text-primary">{role.screened}</p>
          </div>
          
          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wide">Shortlisted</h3>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-success">{role.shortlisted}</p>
          </div>
          
          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wide">Required Skills</h3>
              <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {role.evaluationCriteria?.requiredSkills?.slice(0, 3).map((skill, idx) => (
                <span key={idx} className="badge-purple text-xs">{skill}</span>
              ))}
              {(role.evaluationCriteria?.requiredSkills?.length || 0) > 3 && (
                <span className="text-xs text-text-secondary">+{(role.evaluationCriteria?.requiredSkills?.length || 0) - 3} more</span>
              )}
            </div>
          </div>
        </div>

        {/* Candidates Section */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-text-primary">Candidates</h2>
              <p className="text-sm text-text-secondary mt-1">Review and manage applicants</p>
            </div>
            {role.shortlisted > 0 && (
              <button className="btn-success flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Review Shortlist ({role.shortlisted})
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="border-b border-border mb-6">
            <div className="flex gap-1">
              {['All', 'Shortlisted', 'Review', 'Rejected'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                    filter === tab
                      ? 'text-primary'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {tab}
                  {filter === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Candidates List */}
          {filteredCandidates.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">No candidates yet</h3>
              <p className="text-text-secondary">Upload resumes to start screening candidates</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCandidates.map(candidate => (
                <div
                  key={candidate.id}
                  onClick={() => router.push(`/dashboard/candidates/${candidate.id}`)}
                  className="flex items-center justify-between p-5 border border-border rounded-xl hover:border-primary hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-primary font-semibold text-lg group-hover:bg-primary group-hover:text-white transition-colors">
                      {candidate.profile.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-text-primary group-hover:text-primary transition-colors">{candidate.profile.name}</div>
                      <div className="text-sm text-text-secondary">{candidate.profile.email}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-sm text-text-secondary mb-1">AI Score</div>
                      <div className={`text-2xl font-bold ${
                        candidate.evaluation.score >= 70 ? 'text-success' :
                        candidate.evaluation.score >= 50 ? 'text-warning' :
                        'text-error'
                      }`}>
                        {candidate.evaluation.score}
                      </div>
                    </div>
                    
                    <div>
                      <span className={
                        candidate.status === 'Shortlisted' ? 'badge-success' :
                        candidate.status === 'Review' ? 'badge-warning' :
                        'badge-error'
                      }>
                        {candidate.status}
                      </span>
                    </div>
                    
                    <svg className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Role?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{role?.title}"? This will also delete all {role?.totalCandidates} candidate(s). This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  deleteRole();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
