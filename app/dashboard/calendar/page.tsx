'use client';

import { useEffect, useState } from 'react';

interface Interview {
  id: string;
  candidateName: string;
  roleName: string;
  scheduledAt: string;
  status: string;
  type: string;
}

export default function CalendarPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/calendar', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch interviews');
      const data = await response.json();
      setInterviews(data.interviews || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const upcomingInterviews = interviews.filter(
    (interview) => new Date(interview.scheduledAt) > new Date()
  ).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const pastInterviews = interviews.filter(
    (interview) => new Date(interview.scheduledAt) <= new Date()
  ).sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'badge-success';
      case 'Pending':
        return 'badge-warning';
      case 'Completed':
        return 'badge-info';
      case 'Cancelled':
        return 'badge-error';
      default:
        return 'badge-info';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-text-secondary">Loading calendar...</div>
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
          <h1 className="text-3xl font-bold text-text-primary mb-2">Interview Calendar</h1>
          <p className="text-text-secondary">Manage your scheduled interviews</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wide">Upcoming</h3>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-text-primary">{upcomingInterviews.length}</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wide">This Week</h3>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-text-primary">
              {upcomingInterviews.filter(i => {
                const date = new Date(i.scheduledAt);
                const weekFromNow = new Date();
                weekFromNow.setDate(weekFromNow.getDate() + 7);
                return date <= weekFromNow;
              }).length}
            </p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wide">Completed</h3>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-text-primary">{pastInterviews.length}</p>
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold text-text-primary mb-6">Upcoming Interviews</h2>
          
          {upcomingInterviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">No upcoming interviews</h3>
              <p className="text-text-secondary">Schedule interviews from your shortlisted candidates</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className="flex items-center justify-between p-5 border border-border rounded-xl hover:border-primary hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-semibold text-lg">
                      {interview.candidateName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary">{interview.candidateName}</h3>
                      <p className="text-sm text-text-secondary">{interview.roleName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm text-text-secondary">
                        {new Date(interview.scheduledAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-lg font-semibold text-text-primary">
                        {new Date(interview.scheduledAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>

                    <span className={getStatusBadge(interview.status)}>
                      {interview.status}
                    </span>

                    <button className="btn-secondary">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Interviews */}
        {pastInterviews.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold text-text-primary mb-6">Past Interviews</h2>
            
            <div className="space-y-3">
              {pastInterviews.slice(0, 5).map((interview) => (
                <div
                  key={interview.id}
                  className="flex items-center justify-between p-5 border border-border rounded-xl opacity-75"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center font-semibold text-lg">
                      {interview.candidateName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary">{interview.candidateName}</h3>
                      <p className="text-sm text-text-secondary">{interview.roleName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm text-text-secondary">
                        {new Date(interview.scheduledAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </div>

                    <span className="badge-info">Completed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
