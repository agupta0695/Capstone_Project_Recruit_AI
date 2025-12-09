'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Role {
  id: string;
  title: string;
  department: string;
  status: string;
  totalCandidates: number;
  shortlisted: number;
  createdAt: string;
}

interface DashboardStats {
  activeRoles: number;
  pendingApprovals: number;
  timeSaved: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    activeRoles: 0,
    pendingApprovals: 0,
    timeSaved: 0,
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchDashboardData(token);
  }, []);

  const fetchDashboardData = async (token: string) => {
    try {
      const res = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await res.json();
      setStats(data.stats);
      setRoles(data.roles);
      setUser(data.user);
    } catch (error) {
      console.error('Dashboard error:', error);
      localStorage.removeItem('token');
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Dashboard</h1>
          <p className="text-text-secondary">Welcome back, {user?.name || 'there'}! Here's your hiring overview.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide">Active Roles</h3>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-4xl font-bold text-text-primary">{stats.activeRoles}</p>
            <p className="text-sm text-text-secondary mt-2">Currently hiring</p>
          </div>
          
          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide">Pending Approvals</h3>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-4xl font-bold text-text-primary">{stats.pendingApprovals}</p>
            <p className="text-sm text-text-secondary mt-2">Awaiting your review</p>
          </div>
          
          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide">Time Saved</h3>
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <p className="text-4xl font-bold text-text-primary">{stats.timeSaved} <span className="text-xl">hrs</span></p>
            <p className="text-sm text-text-secondary mt-2">This week</p>
          </div>
        </div>

        {/* Roles Section */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-text-primary">Open Roles</h2>
              <p className="text-sm text-text-secondary mt-1">Manage your active job postings</p>
            </div>
            <Link href="/dashboard/roles/new" className="btn-primary flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Role
            </Link>
          </div>

          {roles.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">No roles yet</h3>
              <p className="text-text-secondary mb-6">Create your first role to start screening candidates with AI</p>
              <Link href="/dashboard/roles/new" className="btn-primary inline-flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create First Role
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="table-header">Role Title</th>
                    <th className="table-header">Department</th>
                    <th className="table-header">Candidates</th>
                    <th className="table-header">Shortlisted</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Created</th>
                    <th className="table-header"></th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => (
                    <tr
                      key={role.id}
                      className="border-b border-border hover:bg-purple-50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/dashboard/roles/${role.id}`)}
                    >
                      <td className="table-cell">
                        <div className="font-semibold text-text-primary">{role.title}</div>
                      </td>
                      <td className="table-cell text-text-secondary">{role.department}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{role.totalCandidates}</span>
                          <span className="text-text-secondary text-xs">total</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-success">{role.shortlisted}</span>
                          <span className="text-text-secondary text-xs">qualified</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className={role.status === 'active' ? 'badge-success' : 'badge-warning'}>
                          {role.status === 'active' ? 'Active' : 'Paused'}
                        </span>
                      </td>
                      <td className="table-cell text-text-secondary">
                        {new Date(role.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="table-cell">
                        <button className="text-primary hover:text-primary-dark">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
