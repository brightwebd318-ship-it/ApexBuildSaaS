import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Mail, X, CheckCircle, Key, ArrowRight, Trash2 } from 'lucide-react';

export default function EmailInboxSimulator() {
  const [isOpen, setIsOpen] = useState(false);
  const [emails, setEmailList] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeToken, setActiveToken] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [setupSuccess, setSetupSuccess] = useState(false);
  const [error, setError] = useState('');

  const loadEmails = () => {
    const list = db.getSimulatedEmails();
    setEmailList(list);
    // For demo purposes, we count all emails as unread if drawer is closed
    if (!isOpen) {
      setUnreadCount(list.length);
    } else {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    loadEmails();
    // Register database callback so we update instantly when a client is added
    db.setEmailSentCallback(() => {
      loadEmails();
      // Show slide-out to user as a feedback cue when new email arrives
      setIsOpen(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const handleClear = () => {
    db.clearSimulatedEmails();
    loadEmails();
  };

  const handleOpenSetup = (token) => {
    setActiveToken(token);
    setNewPassword('');
    setSetupSuccess(false);
    setError('');
  };

  const handleSetPassword = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    try {
      db.setPasswordViaToken(activeToken, newPassword);
      setSetupSuccess(true);
      setError('');
      loadEmails();
      // Auto close setup modal after 2 seconds
      setTimeout(() => {
        setActiveToken(null);
        setSetupSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err.message || 'Error updating password');
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-sky-500 shadow-xl shadow-sky-500/20 text-white transition-all duration-300 hover:bg-sky-600 hover:scale-105"
        title="Simulated Email Inbox"
      >
        <Mail className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white border border-slate-900 animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Slide-out Panel Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />
      )}

      {/* Slide-out Panel Container */}
      <div
        className={`fixed top-0 right-0 z-50 h-screen w-full max-w-md border-l border-slate-800 bg-slate-900 shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white leading-tight">Simulated Email Server</h3>
                <p className="text-xs text-slate-400">Testing Sandbox Environment</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {emails.length > 0 && (
                <button
                  onClick={handleClear}
                  className="rounded p-2 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-colors"
                  title="Clear Inbox"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="rounded p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Email List Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {emails.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-center">
                <Mail className="mb-4 h-12 w-12 text-slate-600 stroke-[1.5]" />
                <p className="font-medium text-slate-400">No outgoing emails yet</p>
                <p className="mt-1 text-xs text-slate-500 max-w-[240px]">
                  When a contractor adds a client, setup invitations will appear here.
                </p>
              </div>
            ) : (
              emails.map((email) => (
                <div key={email.id} className="relative rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-sky-400">System Notification</p>
                      <h4 className="mt-1 font-bold text-white">{email.subject}</h4>
                    </div>
                    <span className="text-[10px] text-slate-500">{email.date}</span>
                  </div>

                  <div className="mt-3 border-t border-slate-900 pt-3">
                    <p className="text-xs text-slate-400">
                      <span className="font-semibold text-slate-300">To: </span>
                      {email.to}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      <span className="font-semibold text-slate-300">Project: </span>
                      {email.projectName}
                    </p>
                  </div>

                  <p className="mt-4 whitespace-pre-line text-xs leading-relaxed text-slate-300 bg-slate-900/50 p-3 rounded-lg border border-slate-900">
                    {email.body}
                  </p>

                  {/* Dynamic Action Buttons based on password setting choice */}
                  {email.type === 'invitation' && (
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[10px] font-medium text-amber-400 bg-amber-400/10 px-2 py-1 rounded">
                        Option A: Set Password Link
                      </span>
                      <button
                        onClick={() => handleOpenSetup(email.token)}
                        className="flex items-center gap-1 text-xs font-bold text-sky-400 hover:text-sky-300 hover:underline transition-all"
                      >
                        Click Setup Link <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  {email.type === 'credentials' && (
                    <div className="mt-4 flex items-center justify-between border-t border-slate-900 pt-3">
                      <span className="text-[10px] font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                        Option B: Auto-Password
                      </span>
                      <div className="flex items-center gap-1 text-xs text-slate-300 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                        <Key className="h-3 w-3 text-emerald-400" />
                        <span className="font-mono">{email.password}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Option A Modal Popup inside Simulation */}
      {activeToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-lg">Set Client Password</h3>
              <button
                onClick={() => setActiveToken(null)}
                className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {setupSuccess ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <CheckCircle className="h-12 w-12 text-emerald-500 animate-pulse-soft" />
                <h4 className="mt-3 font-bold text-white">Password Configured!</h4>
                <p className="mt-1 text-xs text-slate-400">
                  Password has been securely saved. You can now log in.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSetPassword} className="mt-4 space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  You are completing the setup for Option A. Please set a password for the client.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter at least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    required
                    autoFocus
                  />
                </div>

                {error && <p className="text-xs font-medium text-rose-400">{error}</p>}

                <button
                  type="submit"
                  className="w-full rounded-lg bg-sky-500 py-2.5 text-sm font-bold text-white transition-all hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                >
                  Configure and Save
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
