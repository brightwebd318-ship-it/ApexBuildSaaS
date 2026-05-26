import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';

export function Unauthorized() {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-96 w-96 rounded-full bg-rose-500/5 blur-[80px]" />

      <div className="max-w-md space-y-6 glass-panel rounded-2xl p-8 border-rose-500/20 shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-bounce">
          <ShieldAlert className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Project Isolation Blocked</h2>
          <p className="text-xs leading-relaxed text-slate-400">
            Access Denied. For privacy and confidentiality, clients are restricted to viewing only their assigned projects.
          </p>
        </div>

        <div className="bg-slate-950 p-4 rounded-lg border border-slate-900 text-left text-[11px] text-slate-450 leading-relaxed space-y-1">
          <span className="font-bold text-rose-400 block mb-1">Confidentiality Rule</span>
          <p>• project.clientId === loggedInUser.id</p>
          <p>• Access logs have registered this unauthorized route attempt.</p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/50 py-2.5 text-xs font-bold text-slate-300 hover:text-white transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Reload Portal
          </button>
          
          <button
            onClick={logout}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 py-2.5 text-xs font-bold text-white transition-all shadow-lg shadow-rose-500/10"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
