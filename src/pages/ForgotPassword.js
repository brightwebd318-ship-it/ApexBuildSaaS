import React, { useState } from 'react';
import { firebaseService } from '../services/firebase';
import { Mail, ArrowLeft, KeyRound, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await firebaseService.resetPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Error executing password reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 relative overflow-hidden bg-slate-950 dark:bg-slate-950 light:bg-slate-50 transition-colors duration-300">
      {/* Decorative gradients */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-sky-500/5 blur-[80px]" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-96 w-96 rounded-full bg-indigo-500/5 blur-[100px]" />

      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
            <KeyRound className="h-7 w-7" />
          </div>
          <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-white dark:text-white light:text-slate-900 font-sans">
            Reset Password
          </h1>
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 max-w-xs">
            Provide your account email. We will dispatch a secure link to configure a new credential.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-8 shadow-2xl space-y-5 dark:border-slate-800 dark:bg-slate-900/60 light:bg-white light:border-slate-200">
          {success ? (
            <div className="space-y-4 py-3 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-white dark:text-white light:text-slate-900 text-md">Reset Link Dispatched</h3>
                <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 mt-1 leading-relaxed">
                  If this email is registered, a password recovery link has been sent. Check the simulated inbox widget on the bottom-right.
                </p>
              </div>
              <button
                onClick={() => onNavigate('login')}
                className="mt-2 w-full rounded-lg bg-sky-500 hover:bg-sky-600 py-2.5 text-xs font-bold text-white transition-all"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2.5 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs font-medium text-rose-450 dark:text-rose-450 light:text-rose-600">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-350 dark:text-slate-350 light:text-slate-600 uppercase tracking-wider mb-1.5">Registered Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950/70 pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-950 light:border-slate-300 light:bg-slate-100 light:text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-sky-500 hover:bg-sky-600 py-3 text-sm font-bold text-white transition-all disabled:opacity-50"
              >
                {loading ? 'Processing request...' : 'Send Recovery Link'}
              </button>

              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="flex items-center justify-center gap-1.5 w-full text-xs font-bold text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-700 transition-colors pt-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
