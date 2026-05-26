import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HardHat, Lock, Mail, AlertTriangle, UserCheck } from 'lucide-react';

export default function Login({ onNavigate }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Strong password validation helper
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setError('');
    setLoading(true);
    try {
      await login(demoEmail, demoPassword);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 relative overflow-hidden bg-slate-950 dark:bg-slate-950 light:bg-slate-50 transition-colors duration-300">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-sky-500/5 blur-[80px]" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-96 w-96 rounded-full bg-indigo-500/5 blur-[100px]" />

      <div className="w-full max-w-md space-y-8">
        {/* Branding header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
            <HardHat className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white dark:text-white light:text-slate-900 sm:text-4xl font-sans">
            ApexBuild <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">SaaS</span>
          </h1>
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
            Commercial Construction Management Engine
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel rounded-2xl p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900/60 light:bg-white light:border-slate-205">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center gap-2.5 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs font-medium text-rose-450 dark:text-rose-450 light:text-rose-600">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-350 dark:text-slate-350 light:text-slate-600 uppercase tracking-wider mb-1.5">Account Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                    <Mail className="h-4.5 w-4.5" />
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

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-slate-350 dark:text-slate-350 light:text-slate-600 uppercase tracking-wider">Password</label>
                  <button
                    type="button"
                    onClick={() => onNavigate('forgot')}
                    className="text-[11px] font-bold text-sky-400 hover:text-sky-300 hover:underline focus:outline-none"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950/70 pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-950 light:border-slate-300 light:bg-slate-100 light:text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-lg bg-sky-500 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </div>
          </form>
        </div>

        {/* Quick Demo Access Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="h-[1px] w-full bg-slate-800" />
            <span className="px-3 text-xs font-semibold text-slate-550 uppercase shrink-0 dark:text-slate-500 light:text-slate-400">Quick Demo Logins</span>
            <span className="h-[1px] w-full bg-slate-800" />
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {/* Contractor Quick Login */}
            <button
              onClick={() => handleQuickLogin('contractor@gmail.com', 'contractor123')}
              className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900/50 p-2.5 hover:bg-slate-900 transition-all hover:border-sky-500/40 text-center dark:border-slate-800 light:border-slate-200"
            >
              <HardHat className="h-4.5 w-4.5 text-sky-400 animate-pulse-soft" />
              <span className="mt-1 text-[11px] font-bold text-white dark:text-white light:text-slate-800">Contractor</span>
              <span className="text-[9px] text-slate-500 mt-0.5">Manage All</span>
            </button>

            {/* Arun Quick Login */}
            <button
              onClick={() => handleQuickLogin('arun@gmail.com', 'Arun@2026')}
              className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900/50 p-2.5 hover:bg-slate-900 transition-all hover:border-emerald-500/40 text-center dark:border-slate-800 light:border-slate-200"
            >
              <UserCheck className="h-4.5 w-4.5 text-emerald-400" />
              <span className="mt-1 text-[11px] font-bold text-white dark:text-white light:text-slate-800">Arun</span>
              <span className="text-[9px] text-slate-500 mt-0.5">Arun Villa</span>
            </button>

            {/* Manu Quick Login */}
            <button
              onClick={() => handleQuickLogin('manu@gmail.com', 'Manu@2026')}
              className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900/50 p-2.5 hover:bg-slate-900 transition-all hover:border-emerald-500/40 text-center dark:border-slate-800 light:border-slate-200"
            >
              <UserCheck className="h-4.5 w-4.5 text-emerald-400" />
              <span className="mt-1 text-[11px] font-bold text-white dark:text-white light:text-slate-800">Manu</span>
              <span className="text-[9px] text-slate-500 mt-0.5">Manu Res.</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
