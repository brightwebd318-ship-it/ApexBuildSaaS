import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/db';
import { KeyRound, Lock, Eye, EyeOff, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function ChangePassword() {
  const { currentUser, refreshUser, logout } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      db.changePassword(currentUser.id, password);
      setSuccess(true);
      // Wait 1.5 seconds, then refresh user context so dashboard resolves
      setTimeout(() => {
        refreshUser();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error updating password');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-amber-500/5 blur-[80px]" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-96 w-96 rounded-full bg-sky-500/5 blur-[100px]" />

      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20">
            <KeyRound className="h-8 w-8 animate-pulse-soft" />
          </div>
          <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-white font-sans">
            First Login Password Reset
          </h1>
          <p className="mt-2 text-xs text-slate-400 max-w-sm">
            For security, please replace the temporary password assigned to <span className="text-white font-semibold">{currentUser.email}</span>.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-8 shadow-2xl space-y-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
              <ShieldCheck className="h-12 w-12 text-emerald-400" />
              <h3 className="font-bold text-white text-lg">Password Changed!</h3>
              <p className="text-xs text-slate-400">Loading your project workspace...</p>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="flex items-center gap-2.5 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs font-medium text-rose-400">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-350 uppercase tracking-wider mb-1.5">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter at least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950/70 pl-11 pr-11 py-2.5 text-sm text-white placeholder-slate-550 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-355 uppercase tracking-wider mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950/70 pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-550 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={logout}
                  className="flex-1 rounded-lg border border-slate-800 bg-slate-900/50 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-all"
                >
                  Cancel & Out
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-sky-500 hover:bg-sky-600 py-2.5 text-xs font-bold text-white transition-all hover:scale-[1.01]"
                >
                  Update & Proceed
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
