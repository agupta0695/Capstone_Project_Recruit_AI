'use client';

import { useEffect, useState } from 'react';

interface ReasoningLog {
  id: string;
  action: string;
  candidateName: string;
  roleName: string;
  reasoning: string;
  confidence: number;
  timestamp: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<ReasoningLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/logs', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch logs');
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'All' || log.action === filter;
    const matchesSearch = searchQuery === '' ||
      log.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.roleName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'Shortlisted':
        return 'badge-success';
      case 'Review':
        return 'badge-warning';
      case 'Rejected':
        return 'badge-error';
      default:
        return 'badge-info';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'Shortlisted':
        return (
          <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Review':
        return (
          <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Rejected':
        return (
          <svg className="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-text-secondary">Loading logs...</div>
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
          <h1 className="text-3xl font-bold text-text-primary mb-2">AI Reasoning Logs</h1>
          <p className="text-text-secondary">Complete audit trail of all AI decisions with transparent reasoning</p>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by candidate or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
              {['All', 'Shortlisted', 'Review', 'Rejected'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    filter === tab
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Logs List */}
        {filteredLogs.length === 0 ? (
          <div className="card text-center py-16">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">No logs found</h3>
            <p className="text-text-secondary">
              {searchQuery ? 'Try adjusting your search' : 'AI decisions will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div key={log.id} className="card hover:border-primary transition-all">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {getActionIcon(log.action)}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-text-primary mb-1">{log.candidateName}</h3>
                        <p className="text-sm text-text-secondary">Role: {log.roleName}</p>
                      </div>
                      <div className="text-right">
                        <span className={getActionBadge(log.action)}>{log.action}</span>
                        <div className="text-xs text-text-secondary mt-1">
                          {new Date(log.timestamp).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Reasoning */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-3">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-text-primary mb-1">AI Reasoning</div>
                          <p className="text-sm text-text-secondary leading-relaxed">{log.reasoning}</p>
                        </div>
                      </div>
                    </div>

                    {/* Confidence */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-text-secondary">Confidence:</span>
                      <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            log.confidence >= 80 ? 'bg-success' :
                            log.confidence >= 60 ? 'bg-warning' :
                            'bg-error'
                          }`}
                          style={{ width: `${log.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-text-primary">{log.confidence}%</span>
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
