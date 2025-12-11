'use client';

import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // keys kept for backward compatibility with your UI
    autoApprove: false,
    confidenceThreshold: 75,
    emailNotifications: true,
    inAppNotifications: true,
    gmailConnected: false,
    calendarConnected: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      // Try cookie-based session first, fall back to Authorization header if present
      const token = localStorage.getItem('token');
      const resp = await fetch('/api/settings', {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!resp.ok) {
        console.warn('Settings fetch failed', resp.status);
        return;
      }

      const data = await resp.json();
      // map returned field names coming from server -> UI shape
      const returned = data.settings || {};
      setSettings(prev => ({
        ...prev,
        autoApprove: returned.requireShortlistApproval ?? prev.autoApprove,
        confidenceThreshold: returned.confidenceThreshold ?? prev.confidenceThreshold,
        emailNotifications: returned.emailNotifications ?? prev.emailNotifications,
        inAppNotifications: returned.inAppNotifications ?? prev.inAppNotifications,
        gmailConnected: returned.gmailConnected ?? prev.gmailConnected,
        calendarConnected: returned.calendarConnected ?? prev.calendarConnected,
      }));
    } catch (err) {
      console.error('fetchSettings error', err);
    }
  }

  async function saveSettings() {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      // send the UI field names; server should map to DB names
      await fetch('/api/settings', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          requireShortlistApproval: settings.autoApprove,
          confidenceThreshold: settings.confidenceThreshold,
          emailNotifications: settings.emailNotifications,
          inAppNotifications: settings.inAppNotifications,
        }),
      });

      // use UI notification or simple alert
      alert('Settings saved successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  // --- NEW: Connect handlers ---
  async function handleGmailConnect() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/integrations/google/connect', {
        method: 'GET',
        credentials: 'include', // allow cookie auth if used
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!res.ok) {
        console.error('connect endpoint failed', res.status);
        alert('Failed to initiate Gmail connection. Check console.');
        return;
      }

      const { url } = await res.json();
      if (!url) {
        console.error('No OAuth URL returned');
        alert('Failed to get Google OAuth URL');
        return;
      }
      // Redirect user to Google's consent screen
      window.location.href = url;
    } catch (err) {
      console.error('handleGmailConnect error', err);
      alert('Error starting Gmail connect');
    }
  }

  async function handleCalendarConnect() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/integrations/google/calendar/connect', {
        method: 'GET',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!res.ok) {
        console.error('calendar connect endpoint failed', res.status);
        alert('Failed to initiate Calendar connection. Check console.');
        return;
      }

      const { url } = await res.json();
      if (!url) {
        console.error('No OAuth URL returned for calendar');
        alert('Failed to get Calendar OAuth URL');
        return;
      }

      window.location.href = url;
    } catch (err) {
      console.error('handleCalendarConnect error', err);
      alert('Error starting Calendar connect');
    }
  }
  // --- END NEW handlers ---

  const tabs = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'automation', name: 'Automation', icon: '🤖' },
    { id: 'integrations', name: 'Integrations', icon: '🔗' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
  ];

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Settings</h1>
          <p className="text-text-secondary">Manage your HireAI preferences and integrations</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Tabs */}
          <div className="w-64 flex-shrink-0">
            <div className="card p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-50 text-primary font-medium'
                      : 'text-text-secondary hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="card">
              {activeTab === 'integrations' && (
                <div>
                  <h2 className="text-xl font-bold text-text-primary mb-6">Integrations</h2>
                  
                  <div className="space-y-4">
                    {/* Gmail */}
                    <div className="flex items-center justify-between p-6 border border-border rounded-xl hover:border-primary transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-text-primary">Gmail</h3>
                          <p className="text-sm text-text-secondary">
                            {settings.gmailConnected ? 'Connected' : 'Connect your Gmail to receive resumes automatically'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className={settings.gmailConnected ? 'btn-error' : 'btn-primary'}
                        onClick={settings.gmailConnected ? undefined : handleGmailConnect}
                      >
                        {settings.gmailConnected ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>

                    {/* Google Calendar */}
                    <div className="flex items-center justify-between p-6 border border-border rounded-xl hover:border-primary transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-text-primary">Google Calendar</h3>
                          <p className="text-sm text-text-secondary">
                            {settings.calendarConnected ? 'Connected' : 'Sync your calendar for automatic interview scheduling'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className={settings.calendarConnected ? 'btn-error' : 'btn-primary'}
                        onClick={settings.calendarConnected ? undefined : handleCalendarConnect}
                      >
                        {settings.calendarConnected ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* other tabs unchanged... copy your existing content for general/automation/notifications */}
              
              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-border">
                <button
                  onClick={saveSettings}
                  disabled={saving}
                  className="btn-primary disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
