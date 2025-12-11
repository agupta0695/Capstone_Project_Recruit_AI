'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useErrorHandler } from '@/app/hooks/useErrorHandler';

interface Role {
  id: string;
  title: string;
  department: string;
  description: string;
  status: string;
  evaluationCriteria: {
    requiredSkills: string[];
    niceToHaveSkills?: string[];
    experienceLevel: string;
    educationLevel: string;
    responsibilities?: string[];
    qualifications?: string[];
    summary?: string;
    processingNotes?: string[];
  };
  stats?: {
    total: number;
    shortlisted: number;
    reviewed: number;
    rejected: number;
    avgScore: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function EditRolePage() {
  const params = useParams();
  const router = useRouter();
  const roleId = params.id as string;
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reprocessing, setReprocessing] = useState(false);
  const { handleError, handleSuccess } = useErrorHandler();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    description: '',
    status: 'active',
    requiredSkills: [] as string[],
    experienceLevel: 'Mid-Level',
    educationLevel: "Bachelor's"
  });

  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    fetchRoleDetails();
  }, [roleId]);

  const fetchRoleDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/roles/${roleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          handleError('ROLE_NOT_FOUND');
          router.push('/dashboard/roles');
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setRole(data);
      
      // Populate form
      setFormData({
        title: data.title,
        department: data.department,
        description: data.description,
        status: data.status,
        requiredSkills: data.evaluationCriteria.requiredSkills || [],
        experienceLevel: data.evaluationCriteria.experienceLevel || 'Mid-Level',
        educationLevel: data.evaluationCriteria.educationLevel || "Bachelor's"
      });
    } catch (error) {
      console.error('Error fetching role details:', error);
      handleError('SERVER_ERROR');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.requiredSkills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSave = async (reprocessDescription = false) => {
    if (reprocessDescription) {
      setReprocessing(true);
    } else {
      setSaving(true);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          reprocessDescription
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update role');
      }

      const updatedRole = await response.json();
      
      if (reprocessDescription && updatedRole.aiParsingUsed) {
        handleSuccess('Role updated with AI-powered job description analysis');
        // Update form with AI-parsed data
        setFormData(prev => ({
          ...prev,
          requiredSkills: updatedRole.evaluationCriteria.requiredSkills || prev.requiredSkills,
          experienceLevel: updatedRole.evaluationCriteria.experienceLevel || prev.experienceLevel,
          educationLevel: updatedRole.evaluationCriteria.educationLevel || prev.educationLevel
        }));
      } else {
        handleSuccess('Role updated successfully');
      }
      
      setRole(updatedRole);
    } catch (error) {
      console.error('Error updating role:', error);
      handleError('SERVER_ERROR');
    } finally {
      setSaving(false);
      setReprocessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">❌</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Role not found</h3>
          <p className="text-gray-600 mb-4">The role you're trying to edit doesn't exist or has been deleted.</p>
          <button
            onClick={() => router.push('/dashboard/roles')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Back to Roles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <button
            onClick={() => router.push(`/dashboard/roles/${roleId}`)}
            className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1"
          >
            ← Back to Role Details
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Role</h1>
          <p className="text-gray-600 mt-1">Update job role details and requirements</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleSave(false)}
            disabled={saving || reprocessing}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving || reprocessing || formData.description.length < 100}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            title={formData.description.length < 100 ? 'Job description must be at least 100 characters for AI processing' : 'Re-analyze job description with AI'}
          >
            {reprocessing ? 'Processing...' : '🤖 AI Re-analyze'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Senior Full Stack Developer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department *
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Engineering"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience Level
                </label>
                <select
                  value={formData.experienceLevel}
                  onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Entry">Entry Level</option>
                  <option value="Mid-Level">Mid-Level</option>
                  <option value="Senior">Senior</option>
                  <option value="Lead">Lead</option>
                  <option value="Principal">Principal</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Education Level
                </label>
                <select
                  value={formData.educationLevel}
                  onChange={(e) => handleInputChange('educationLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="High School">High School</option>
                  <option value="Associate">Associate Degree</option>
                  <option value="Bachelor's">Bachelor's Degree</option>
                  <option value="Master's">Master's Degree</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Job Description</h2>
              <div className="text-sm text-gray-500">
                {formData.description.length} characters
                {formData.description.length >= 100 && (
                  <span className="text-green-600 ml-2">✓ AI-ready</span>
                )}
              </div>
            </div>
            
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter detailed job description including responsibilities, requirements, and qualifications..."
            />
            
            {formData.description.length < 100 && (
              <p className="text-sm text-amber-600 mt-2">
                💡 Add at least 100 characters to enable AI-powered requirement extraction
              </p>
            )}
          </div>

          {/* Required Skills */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Required Skills</h2>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a required skill..."
              />
              <button
                onClick={addSkill}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Add
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.requiredSkills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            
            {formData.requiredSkills.length === 0 && (
              <p className="text-gray-500 text-sm">No required skills added yet</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Processing Status */}
          {role.evaluationCriteria.processingNotes && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">AI Processing Status</h3>
              <div className="space-y-2">
                {role.evaluationCriteria.processingNotes.map((note, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-600">{note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current AI-Extracted Data */}
          {role.evaluationCriteria.summary && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">AI Summary</h3>
              <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-md">
                {role.evaluationCriteria.summary}
              </p>
            </div>
          )}

          {/* AI-Extracted Requirements */}
          {(role.evaluationCriteria.responsibilities?.length || role.evaluationCriteria.qualifications?.length) && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">AI-Extracted Data</h3>
              
              {role.evaluationCriteria.responsibilities && role.evaluationCriteria.responsibilities.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Responsibilities</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {role.evaluationCriteria.responsibilities.slice(0, 3).map((resp, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                    {role.evaluationCriteria.responsibilities.length > 3 && (
                      <li className="text-gray-500">+{role.evaluationCriteria.responsibilities.length - 3} more</li>
                    )}
                  </ul>
                </div>
              )}

              {role.evaluationCriteria.qualifications && role.evaluationCriteria.qualifications.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Qualifications</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {role.evaluationCriteria.qualifications.slice(0, 3).map((qual, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-600">•</span>
                        <span>{qual}</span>
                      </li>
                    ))}
                    {role.evaluationCriteria.qualifications.length > 3 && (
                      <li className="text-gray-500">+{role.evaluationCriteria.qualifications.length - 3} more</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Role Statistics */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Role Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Created</span>
                <span className="text-sm font-medium">{new Date(role.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="text-sm font-medium">{new Date(role.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Candidates</span>
                <span className="text-sm font-medium">{role.stats?.total || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}