'use client';

import { useEffect, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { PlatformLogo } from '@/lib/platforms/logos';
import { Upload } from 'lucide-react';
import { ImportModal } from '@/components/import-modal';

const PLATFORMS = [
  { id: 'LEETCODE', label: 'LeetCode' },
  { id: 'CODEFORCES', label: 'Codeforces' },
  { id: 'GFG', label: 'GeeksforGeeks' },
  { id: 'HACKERRANK', label: 'HackerRank' },
  { id: 'CODECHEF', label: 'CodeChef' },
];

function SettingsSkeleton() {
  return (
    <div data-settings-cards style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Skeleton Card 1: Account Profile */}
      <div
        data-settings-card
        style={{
          background: '#111112',
          border: '1px solid #1e1e1e',
          borderRadius: 10,
          padding: 24,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <div style={{ width: 16, height: 16, borderRadius: 4, background: '#1c1c1f' }} className="animate-pulse" />
          <div style={{ width: 120, height: 16, borderRadius: 4, background: '#1c1c1f' }} className="animate-pulse" />
        </div>

        <div data-settings-avatar-row style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div
            data-settings-avatar
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: '#1c1c1f',
              border: '1px solid #28282e',
            }}
            className="animate-pulse"
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ width: 140, height: 16, borderRadius: 4, background: '#1c1c1f' }} className="animate-pulse" />
            <div style={{ width: 200, height: 12, borderRadius: 4, background: '#18181b' }} className="animate-pulse" />
          </div>
        </div>

        <div data-settings-form style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420 }}>
          <div>
            <div style={{ width: 80, height: 12, borderRadius: 4, background: '#18181b', marginBottom: 8 }} className="animate-pulse" />
            <div data-display-name-row style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, height: 36, borderRadius: 6, background: '#161618', border: '1px solid #222226' }} className="animate-pulse" />
              <div style={{ width: 68, height: 36, borderRadius: 6, background: '#1c1c1f', border: '1px solid #222226' }} className="animate-pulse" />
            </div>
          </div>
          <div>
            <div style={{ width: 90, height: 12, borderRadius: 4, background: '#18181b', marginBottom: 8 }} className="animate-pulse" />
            <div style={{ width: '100%', height: 36, borderRadius: 6, background: '#141415', border: '1px solid #1c1c1f' }} className="animate-pulse" />
          </div>
          <div style={{ marginTop: 8 }}>
            <div style={{ width: 140, height: 34, borderRadius: 6, background: '#1c1c1f', border: '1px solid #281c1c' }} className="animate-pulse" />
          </div>
        </div>
      </div>

      {/* Skeleton Card 2: Preferences */}
      <div
        data-settings-card
        style={{
          background: '#111112',
          border: '1px solid #1e1e1e',
          borderRadius: 10,
          padding: 24,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <div style={{ width: 16, height: 16, borderRadius: 4, background: '#1c1c1f' }} className="animate-pulse" />
          <div style={{ width: 100, height: 16, borderRadius: 4, background: '#1c1c1f' }} className="animate-pulse" />
        </div>

        <div data-settings-form style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 420 }}>
          <div>
            <div style={{ width: 140, height: 12, borderRadius: 4, background: '#18181b', marginBottom: 8 }} className="animate-pulse" />
            <div style={{ width: '100%', height: 38, borderRadius: 6, background: '#161618', border: '1px solid #222226' }} className="animate-pulse" />
          </div>
          <div>
            <div style={{ width: 120, height: 12, borderRadius: 4, background: '#18181b', marginBottom: 8 }} className="animate-pulse" />
            <div data-daily-target-grid style={{ display: 'flex', gap: 8 }}>
              {['1', '2', '3', '4'].map((i) => (
                <div key={i} style={{ flex: 1, height: 34, borderRadius: 6, background: '#141416', border: '1px solid #222226' }} className="animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Skeleton Card 3: Data Backup */}
      <div
        data-settings-card
        style={{
          background: '#111112',
          border: '1px solid #1e1e1e',
          borderRadius: 10,
          padding: 24,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 16, height: 16, borderRadius: 4, background: '#1c1c1f' }} className="animate-pulse" />
          <div style={{ width: 150, height: 16, borderRadius: 4, background: '#1c1c1f' }} className="animate-pulse" />
        </div>
        <div style={{ width: '80%', height: 12, borderRadius: 4, background: '#18181b', marginBottom: 18 }} className="animate-pulse" />
        <div style={{ width: 170, height: 38, borderRadius: 6, background: '#19191c', border: '1px solid #2a2a30' }} className="animate-pulse" />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [defaultPlatform, setDefaultPlatform] = useState('LEETCODE');
  const [dailyTarget, setDailyTarget] = useState('5');
  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importToast, setImportToast] = useState<string | null>(null);

  useEffect(() => {
    // Load local storage preferences
    const savedPlat = localStorage.getItem('recall_default_platform');
    if (savedPlat) setDefaultPlatform(savedPlat);

    const savedTarget = localStorage.getItem('recall_daily_target');
    if (savedTarget) setDailyTarget(savedTarget);

    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setName(data.user.name || '');
          setEmail(data.user.email || '');
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveName = async () => {
    setSavingName(true);
    setSavedMessage(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        await updateSession();
        setSavedMessage('Name updated successfully');
        setTimeout(() => setSavedMessage(null), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingName(false);
    }
  };

  const handlePlatformSelect = (id: string) => {
    setDefaultPlatform(id);
    localStorage.setItem('recall_default_platform', id);
    setDropdownOpen(false);
  };

  const handleTargetChange = (val: string) => {
    setDailyTarget(val);
    localStorage.setItem('recall_daily_target', val);
  };

  const handleExportData = () => {
    window.location.href = '/api/export';
  };

  const selectedPlatformObj = PLATFORMS.find((p) => p.id === defaultPlatform) || PLATFORMS[0];
  const initial = name ? name.charAt(0).toUpperCase() : email ? email.charAt(0).toUpperCase() : 'U';

  return (
    <div data-settings-container style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      {/* Header */}
      <div data-settings-header style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: 6 }}>
          Settings
        </h1>
        <p style={{ fontSize: 13, color: '#777' }}>
          Manage your account profile, system preferences, and data backups.
        </p>
      </div>

      {loading ? (
        <SettingsSkeleton />
      ) : (
        <div data-settings-cards style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Card 1: Account Profile */}
          <div
            data-settings-card
            style={{
              background: '#111112',
              border: '1px solid #1e1e1e',
              borderRadius: 10,
              padding: 24,
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: '#888' }}>
                <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.3" />
                <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Account Profile</div>
            </div>

            <div data-settings-avatar-row style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div
                data-settings-avatar
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #222226 0%, #18181b 100%)',
                  border: '1px solid #2e2e34',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#fff',
                  fontFamily: 'var(--font-geist-mono), monospace',
                }}
              >
                {initial}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{name || 'User'}</div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{email}</div>
              </div>
            </div>

            <div data-settings-form style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 6 }}>
                  Display Name
                </label>
                <div data-display-name-row style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your display name"
                    style={{
                      flex: 1,
                      background: '#161618',
                      border: '1px solid #28282c',
                      borderRadius: 6,
                      padding: '8px 12px',
                      fontSize: 13,
                      color: '#fff',
                      outline: 'none',
                      transition: 'border-color 0.15s',
                    }}
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={savingName}
                    style={{
                      background: '#1f1f23',
                      border: '1px solid #2e2e34',
                      borderRadius: 6,
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 500,
                      padding: '0 16px',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                  >
                    {savingName ? 'Saving...' : 'Save'}
                  </button>
                </div>
                {savedMessage && (
                  <div style={{ fontSize: 12, color: '#10b981', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>✓</span> {savedMessage}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 6 }}>
                  Email Address
                </label>
                <input
                  data-email-input
                  type="text"
                  value={email}
                  disabled
                  style={{
                    width: '100%',
                    background: '#141415',
                    border: '1px solid #202024',
                    borderRadius: 6,
                    padding: '8px 12px',
                    fontSize: 13,
                    color: '#555',
                    cursor: 'not-allowed',
                  }}
                />
              </div>

              <div style={{ marginTop: 8 }}>
                <button
                  data-sign-out-btn
                  onClick={() => signOut({ callbackUrl: '/' })}
                  style={{
                    background: '#181414',
                    border: '1px solid #2c1a1a',
                    borderRadius: 6,
                    color: '#f87171',
                    fontSize: 12,
                    fontWeight: 500,
                    padding: '8px 14px',
                    cursor: 'pointer',
                    transition: 'background 0.15s, border-color 0.15s',
                  }}
                >
                  Sign Out of Account
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Preferences */}
          <div
            data-settings-card
            style={{
              background: '#111112',
              border: '1px solid #1e1e1e',
              borderRadius: 10,
              padding: 24,
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: '#888' }}>
                <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
                <path d="M5 6h6M5 10h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Preferences</div>
            </div>

            <div data-settings-form style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 420 }}>
              {/* Custom Platform Dropdown */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 6 }}>
                  Default Coding Platform
                </label>

                {/* Trigger Button */}
                <button
                  data-platform-trigger
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    width: '100%',
                    background: '#161618',
                    border: '1px solid #28282c',
                    borderRadius: 6,
                    padding: '8px 12px',
                    fontSize: 13,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <PlatformLogo platform={selectedPlatformObj.id} size={18} padding={1} />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{selectedPlatformObj.label}</span>
                  </div>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    style={{
                      color: '#888',
                      transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.15s ease',
                    }}
                  >
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {/* Dropdown Options Popup */}
                {dropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: 4,
                      background: '#18181c',
                      border: '1px solid #2a2a30',
                      borderRadius: 8,
                      padding: 4,
                      zIndex: 30,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    }}
                  >
                    {PLATFORMS.map((plat) => {
                      const isSelected = plat.id === defaultPlatform;
                      return (
                        <div
                          key={plat.id}
                          onClick={() => handlePlatformSelect(plat.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            background: isSelected ? '#222228' : 'transparent',
                            transition: 'background 0.1s',
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.background = '#1e1e22';
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <PlatformLogo platform={plat.id} size={18} padding={1} />
                            <span style={{ fontSize: 13, color: isSelected ? '#fff' : '#ccc', fontWeight: isSelected ? 600 : 400 }}>
                              {plat.label}
                            </span>
                          </div>
                          {isSelected && <span style={{ fontSize: 12, color: '#10b981', fontWeight: 700 }}>✓</span>}
                        </div>
                      );
                    })}
                  </div>
                )}

                <span style={{ fontSize: 11, color: '#555', marginTop: 6, display: 'block' }}>
                  Pre-selected platform when adding new problems.
                </span>
              </div>

              {/* Daily Revision Goal */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 6 }}>
                  Daily Revision Goal
                </label>
                <div data-daily-target-grid style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {['3', '5', '10', '15'].map((targetVal) => {
                    const active = dailyTarget === targetVal;
                    return (
                      <button
                        key={targetVal}
                        type="button"
                        onClick={() => handleTargetChange(targetVal)}
                        style={{
                          flex: 1,
                          padding: '7px 0',
                          borderRadius: 6,
                          background: active ? '#1f1f23' : '#141416',
                          border: active ? '1px solid #3b82f6' : '1px solid #222226',
                          color: active ? '#fff' : '#777',
                          fontSize: 13,
                          fontWeight: active ? 600 : 400,
                          cursor: 'pointer',
                          fontFamily: 'var(--font-geist-mono), monospace',
                          transition: 'all 0.12s ease',
                        }}
                      >
                        {targetVal} / day
                      </button>
                    );
                  })}
                </div>
                <span style={{ fontSize: 11, color: '#555', marginTop: 6, display: 'block' }}>
                  Target number of problem revisions per day.
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Data Export */}
          <div
            data-settings-card
            style={{
              background: '#111112',
              border: '1px solid #1e1e1e',
              borderRadius: 10,
              padding: 24,
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: '#888' }}>
                <path d="M3 13h10M8 2v8M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Data Backup & Export</div>
            </div>

            <p style={{ fontSize: 12.5, color: '#666', marginBottom: 18, lineHeight: 1.5 }}>
              Import your existing problem list from CSV or Excel, or download a complete JSON export of all your tracked problems, custom notes, revisions, and daily streak logs.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                data-import-btn
                onClick={() => setShowImportModal(true)}
                style={{
                  background: '#19191c',
                  border: '1px solid #2a2a30',
                  borderRadius: 6,
                  color: '#fff',
                  fontSize: 12.5,
                  fontWeight: 500,
                  padding: '9px 18px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  transition: 'background 0.15s, border-color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#444')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#2a2a30')}
              >
                <Upload size={14} style={{ color: '#60a5fa' }} />
                Import from CSV / Excel
              </button>

              <button
                data-export-btn
                onClick={handleExportData}
                style={{
                  background: '#19191c',
                  border: '1px solid #2a2a30',
                  borderRadius: 6,
                  color: '#fff',
                  fontSize: 12.5,
                  fontWeight: 500,
                  padding: '9px 18px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  transition: 'background 0.15s',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ color: '#38bdf8' }}>
                  <path d="M8 2v8M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Export All Data (.json)
              </button>
            </div>
          </div>

          {/* Card 4: Feedback & Issues */}
          <div
            data-settings-card
            style={{
              background: '#111112',
              border: '1px solid #1e1e1e',
              borderRadius: 10,
              padding: 24,
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#F7981E' }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Feedback & Issues</div>
            </div>

            <p style={{ fontSize: 12.5, color: '#666', marginBottom: 18, lineHeight: 1.5 }}>
              Help us improve recall. by reporting bugs, requesting new features, or sharing your interview prep feedback.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a
                href="https://github.com/Vinit1936/Recall/issues/new"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#19191c',
                  border: '1px solid #2a2a30',
                  borderRadius: 6,
                  color: '#fff',
                  fontSize: 12.5,
                  fontWeight: 500,
                  padding: '9px 18px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  transition: 'background 0.15s, border-color 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#222228';
                  e.currentTarget.style.borderColor = '#383844';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#19191c';
                  e.currentTarget.style.borderColor = '#2a2a30';
                }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ color: '#e5e7eb' }}>
                  <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"/>
                </svg>
                Create GitHub Issue ↗
              </a>

              <a
                href="https://forms.gle/gZHJsswXm4G3rQ9s6"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#19191c',
                  border: '1px solid #2a2a30',
                  borderRadius: 6,
                  color: '#fff',
                  fontSize: 12.5,
                  fontWeight: 500,
                  padding: '9px 18px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  transition: 'background 0.15s, border-color 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#222228';
                  e.currentTarget.style.borderColor = '#383844';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#19191c';
                  e.currentTarget.style.borderColor = '#2a2a30';
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
                Quick Feedback Form ↗
              </a>
            </div>
          </div>
        </div>
      )}

      {/* CSV / Excel Import modal */}
      {showImportModal && (
        <ImportModal
          open={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImportComplete={(res) => {
            setImportToast(
              `Successfully imported ${res.imported} problems${res.skipped > 0 ? ` (${res.skipped} skipped)` : ''}`
            );
            setTimeout(() => setImportToast(null), 4000);
          }}
        />
      )}

      {/* Toast notification */}
      {importToast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
            background: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: 6,
            color: '#fff',
            fontSize: 13,
            padding: '10px 16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          {importToast}
        </div>
      )}
    </div>
  );
}

