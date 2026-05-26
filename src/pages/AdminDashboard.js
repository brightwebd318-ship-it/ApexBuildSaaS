import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { Shield, Users, RefreshCw, AlertCircle, Plus, Eye, EyeOff, UserMinus, ToggleLeft, ToggleRight, Settings, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const { logout, currentUser } = useAuth();
  const [contractors, setContractors] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New contractor form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Mock Logs
  const [logs, setLogs] = useState([]);

  const loadContractors = () => {
    setContractors(db.getContractors());
  };

  const generateMockLog = (action, user) => {
    const time = new Date().toLocaleTimeString();
    return { time, action, user };
  };

  useEffect(() => {
    loadContractors();
    // Pre-populate system logs
    setLogs([
      generateMockLog('System Initialized successfully', 'System'),
      generateMockLog('Loaded SQLite simulation layer', 'System'),
      generateMockLog('Session established for Administrator', currentUser.email),
      generateMockLog('Fetched active contractors tables', currentUser.email)
    ]);
  }, [currentUser]);

  const handleAddContractor = (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');
    
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    try {
      const newCont = db.addContractor(name, email, phone, password);
      loadContractors();
      setSuccessMsg(`Contractor "${newCont.name}" created successfully!`);
      setLogs(prev => [generateMockLog(`Created contractor user: ${newCont.email}`, currentUser.email), ...prev]);
      
      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      
      // Close modal after 1.5s
      setTimeout(() => {
        setShowAddModal(false);
        setSuccessMsg('');
      }, 1500);
    } catch (err) {
      setFormError(err.message || 'Email already exists');
    }
  };

  const handleToggleSubscription = (id, email) => {
    const updated = db.toggleContractorSubscription(id);
    loadContractors();
    setLogs(prev => [
      generateMockLog(`Toggled subscription state for ${email} (New status: ${updated.subscription})`, currentUser.email),
      ...prev
    ]);
  };

  const handleDeleteContractor = (id, email) => {
    if (window.confirm(`Are you sure you want to delete contractor ${email}?`)) {
      db.deleteUser(id);
      loadContractors();
      setLogs(prev => [generateMockLog(`Deleted contractor account: ${email}`, currentUser.email), ...prev]);
    }
  };

  const activeCount = contractors.filter(c => c.subscription === 'Active').length;
  const suspendedCount = contractors.filter(c => c.subscription === 'Suspended').length;

  return (
    <div className="min-h-screen pb-12">
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white leading-none">ApexBuild</h1>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-violet-400">System Admin Control</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-white">{currentUser.name}</p>
                <p className="text-xs text-slate-400">{currentUser.email}</p>
              </div>
              <button
                onClick={logout}
                className="rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Overview Stats Grid */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          
          <div className="glass-panel rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Contractors</p>
                <h3 className="mt-2 text-3xl font-extrabold text-white">{contractors.length}</h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
              <Activity className="h-3.5 w-3.5" /> All registered accounts
            </div>
          </div>

          <div className="glass-panel rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Subscriptions</p>
                <h3 className="mt-2 text-3xl font-extrabold text-emerald-400">{activeCount}</h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <ToggleRight className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Active billing cycles
            </div>
          </div>

          <div className="glass-panel rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Suspended Accounts</p>
                <h3 className="mt-2 text-3xl font-extrabold text-amber-500">{suspendedCount}</h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <ToggleLeft className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
              <AlertCircle className="h-3.5 w-3.5" /> Billing issues or deactivated
            </div>
          </div>

          <div className="glass-panel rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">System Monitoring</p>
                <h3 className="mt-2 text-lg font-bold text-white">SQLite Sandbox</h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                <Settings className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Local Database Normal
            </div>
          </div>

        </section>

        {/* Content Section: Contractors List & Logs Monitor */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Contractors Table */}
          <div className="lg:col-span-2 glass-panel rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Registered Contractors</h2>
                <p className="text-xs text-slate-400 mt-1">Add, suspend, or configure contractor profiles</p>
              </div>
              
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 px-3.5 py-2 text-xs font-bold text-white transition-all shadow-lg shadow-sky-500/10"
              >
                <Plus className="h-4 w-4" /> Add Contractor
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5">Contractor details</th>
                    <th className="py-3.5">Joined date</th>
                    <th className="py-3.5">Billing status</th>
                    <th className="py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {contractors.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500 font-medium">
                        No contractor accounts found. Click "Add Contractor" to create one.
                      </td>
                    </tr>
                  ) : (
                    contractors.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="py-4">
                          <div className="font-semibold text-white">{c.name}</div>
                          <div className="text-xs text-slate-400">{c.email}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{c.phone}</div>
                        </td>
                        <td className="py-4 text-xs font-medium text-slate-400">
                          {c.joinedDate}
                        </td>
                        <td className="py-4">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            c.subscription === 'Active' 
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/10' 
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/10'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${c.subscription === 'Active' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                            {c.subscription}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleToggleSubscription(c.id, c.email)}
                              className="rounded p-2 border border-slate-800 hover:border-slate-700 bg-slate-900/50 text-slate-400 hover:text-white transition-colors"
                              title={c.subscription === 'Active' ? 'Suspend Subscription' : 'Activate Subscription'}
                            >
                              {c.subscription === 'Active' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => handleDeleteContractor(c.id, c.email)}
                              className="rounded p-2 border border-slate-800 hover:border-rose-500/20 bg-slate-900/50 text-slate-400 hover:text-rose-400 transition-colors"
                              title="Delete Contractor"
                            >
                              <UserMinus className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>

          {/* Activity Logs Sidebar */}
          <div className="glass-panel rounded-2xl p-6 shadow-sm space-y-6 flex flex-col max-h-[500px]">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-violet-400" />
              <div>
                <h2 className="text-md font-bold text-white">Live System Logs</h2>
                <p className="text-[11px] text-slate-500">Real-time simulation audit logs</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 font-mono text-[10px] leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-900">
              {logs.map((log, i) => (
                <div key={i} className="border-b border-slate-900/50 pb-2 last:border-0 last:pb-0">
                  <span className="text-slate-500">[{log.time}]</span>{' '}
                  <span className="text-sky-400 font-semibold">{log.user}:</span>{' '}
                  <span className="text-slate-300">{log.action}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>

      {/* Add Contractor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <h3 className="font-bold text-white text-lg">Add New Contractor</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddContractor} className="mt-5 space-y-4">
              
              {formError && <p className="text-xs font-semibold text-rose-400 bg-rose-500/10 p-2.5 rounded border border-rose-500/25">{formError}</p>}
              {successMsg && <p className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 p-2.5 rounded border border-emerald-500/25">{successMsg}</p>}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Contractor Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BuildWise Projects"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. contact@buildwise.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +1 (555) 321-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Initial Password</label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/50 py-2.5 text-sm font-semibold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-sky-500 hover:bg-sky-600 py-2.5 text-sm font-bold text-white transition-all"
                >
                  Create Account
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
