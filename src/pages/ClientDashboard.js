import React, { useState, useEffect } from 'react';
import { firebaseService } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { Unauthorized } from './Unauthorized';
import { 
  Calendar, Camera, DollarSign, FileText, Activity, 
  MapPin, CheckCircle, Image as ImageIcon, Download,
  User, Lock, Send, ChevronRight, ChevronDown, Folder, 
  File, Plus, X, Maximize2, ExternalLink, ShieldCheck, Mail, Phone, MessageSquare
} from 'lucide-react';
import { ResponsiveContainer, Cell, PieChart, Pie, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function ClientDashboard() {
  const { logout, currentUser } = useAuth();
  
  const [project, setProject] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [costs, setCosts] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState('progress');
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  // Photo gallery and lightbox states
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState(null);

  // Profile forms states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Contact Contractor form states
  const [inquirySubject, setInquirySubject] = useState('');
  const [inquiryCategory, setInquiryCategory] = useState('General Query');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryError, setInquiryError] = useState('');

  // Document tree expand/collapse states
  const [expandedFolders, setExpandedFolders] = useState({
    'Architectural Blueprints': true,
    'Structural Engineering': true,
    'Permits & Regulations': true,
    'Contracts & Specifications': true
  });

  useEffect(() => {
    const loadProjectData = async () => {
      try {
        setLoading(true);
        const userId = currentUser.uid || currentUser.id;
        const clientProjects = await firebaseService.getProjects(userId, 'client');
        
        if (clientProjects.length === 0) {
          setProject(null);
          setLoading(false);
          return;
        }

        const proj = clientProjects[0]; // assume one project for simplicity
        
        // Strict Project Isolation Check
        if (proj.clientId !== userId) {
          setUnauthorized(true);
          setLoading(false);
          return;
        }

        setProject(proj);

        // Fetch related data in parallel
        const [updatesData, timelineData, costsData, documentsData] = await Promise.all([
          firebaseService.getDailyUpdates(proj.id),
          firebaseService.getTimeline(proj.id),
          firebaseService.getCosts(proj.id),
          firebaseService.getDocuments(proj.id)
        ]);

        setUpdates(updatesData);
        setTimeline(timelineData);
        setCosts(costsData);
        setDocuments(documentsData);
      } catch (err) {
        console.error("Error loading client project data: ", err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      loadProjectData();
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent mx-auto" />
          <p className="text-sm text-slate-400">Loading project data...</p>
        </div>
      </div>
    );
  }

  if (unauthorized || !project) {
    return <Unauthorized />;
  }

  // Calculate project completion percent average
  const projProgressAvg = timeline.length > 0
    ? Math.round(timeline.reduce((sum, t) => sum + t.progress, 0) / timeline.length)
    : 0;

  // Process Cost Data
  const totalBudget = project.budget || 0;
  const totalPaid = costs.filter(c => c.status === 'Paid').reduce((sum, c) => sum + c.amount, 0);
  const totalPending = costs.filter(c => c.status === 'Pending').reduce((sum, c) => sum + c.amount, 0);
  const remainingBudget = totalBudget - totalPaid;

  const categories = costs.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {});

  const chartData = Object.keys(categories).map(cat => ({
    name: cat,
    value: categories[cat]
  }));

  const comparisonData = [
    { name: 'Allocated Budget', Amount: totalBudget },
    { name: 'Spent to Date', Amount: totalPaid },
    { name: 'Pending Invoices', Amount: totalPending }
  ];

  const COLORS = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ec4899'];

  const handleSimulatePhotoUpload = async (e) => {
    e.preventDefault();
    if (!newPhotoUrl) return;

    try {
      await firebaseService.addDailyUpdate(project.id, project.contractorId, {
        date: new Date().toISOString().split('T')[0],
        labourCount: 0,
        workCompleted: 'Client Shared Progress Photo',
        delays: 'None',
        remarks: 'Simulated client progress photo upload.',
        photos: [newPhotoUrl]
      });

      const freshUpdates = await firebaseService.getDailyUpdates(project.id);
      setUpdates(freshUpdates);
      setShowPhotoModal(false);
      setNewPhotoUrl('');
    } catch (err) {
      console.error("Failed to upload simulated photo:", err);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    try {
      await firebaseService.changePassword(currentUser.uid || currentUser.id, newPassword);
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Error updating password.');
    }
  };

  const handleContactContractor = async (e) => {
    e.preventDefault();
    setInquiryError('');
    setInquirySuccess(false);

    if (!inquirySubject.trim() || !inquiryMessage.trim()) {
      setInquiryError('Subject and message are required.');
      return;
    }

    try {
      await firebaseService.addNotification(
        project.id,
        project.contractorId,
        currentUser.uid || currentUser.id,
        `Client Inquiry: ${inquirySubject}`,
        `Category: ${inquiryCategory} | Message: ${inquiryMessage}`,
        'contractor'
      );
      
      setInquirySuccess(true);
      setInquirySubject('');
      setInquiryMessage('');
    } catch (err) {
      setInquiryError('Failed to send message. Please try again.');
    }
  };

  const toggleFolder = (folderName) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  // Group documents by mock folder structures
  const documentTree = {
    'Architectural Blueprints': documents.filter(d => d.type === 'Drawing' || d.name.toLowerCase().includes('plan') || d.name.toLowerCase().includes('architectural')),
    'Structural Engineering': documents.filter(d => d.type === 'Specs' || d.name.toLowerCase().includes('structural') || d.name.toLowerCase().includes('engineering')),
    'Permits & Regulations': documents.filter(d => d.type === 'Permit' || d.name.toLowerCase().includes('permit') || d.name.toLowerCase().includes('zoning')),
    'Contracts & Specifications': documents.filter(d => !['Drawing', 'Specs', 'Permit'].includes(d.type) && !d.name.toLowerCase().includes('plan') && !d.name.toLowerCase().includes('structural') && !d.name.toLowerCase().includes('permit'))
  };

  // Safe fallback if files are empty
  const allPhotos = updates.flatMap(u => (u.photos || []).map(p => ({ url: p, date: u.date })));

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-slate-950 light:bg-slate-50 text-slate-100 dark:text-slate-100 light:text-slate-800 pb-16 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800 dark:border-slate-800 light:border-slate-200 bg-slate-950/80 dark:bg-slate-950/80 light:bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white dark:text-white light:text-slate-900 leading-none">ApexBuild</h1>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-400">Client Workspace</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-white dark:text-white light:text-slate-800">{currentUser.name}</p>
                <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">{currentUser.email}</p>
              </div>
              <button
                onClick={logout}
                className="rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 light:bg-slate-100 light:border-slate-200 light:text-slate-700 light:hover:bg-slate-200 transition-all shadow-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Project Hero Section */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-800 dark:border-slate-800 light:border-slate-200 bg-gradient-to-br from-slate-900 to-slate-950 dark:from-slate-900 dark:to-slate-950 light:from-white light:to-slate-50 p-6 sm:p-8 shadow-xl">
          <div className="absolute top-0 right-0 -z-10 h-72 w-72 rounded-full bg-sky-500/5 blur-[50px]" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-400 border border-sky-500/20">
                <MapPin className="h-3.5 w-3.5" /> Site Location Active
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white dark:text-white light:text-slate-900 tracking-tight leading-tight">{project.projectName}</h2>
              <p className="text-sm text-slate-400 dark:text-slate-400 light:text-slate-600 max-w-xl">
                Location: {project.siteLocation}
              </p>
              <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-500 light:text-slate-600 pt-1">
                <span>Start Date: {project.startDate}</span>
                <span>•</span>
                <span>Est. Completion: {project.estimatedFinish || project.deadline}</span>
                <span>•</span>
                <span>Type: {project.constructionType}</span>
              </div>
            </div>

            {/* Progress Gauge */}
            <div className="flex items-center gap-5 bg-slate-950/40 border border-slate-900 rounded-2xl p-5 md:w-80 shrink-0 dark:bg-slate-950/40 dark:border-slate-900 light:bg-slate-100 light:border-slate-200">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-slate-800 dark:border-slate-800 light:border-slate-300">
                {/* Visual completion ring */}
                <svg className="absolute -rotate-90 h-20 w-20">
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-slate-800 dark:text-slate-800 light:text-slate-300"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 34}
                    strokeDashoffset={2 * Math.PI * 34 * (1 - projProgressAvg / 100)}
                    className="text-sky-500 transition-all duration-1000"
                  />
                </svg>
                <span className="text-sm font-extrabold text-white dark:text-white light:text-slate-900 font-mono">{projProgressAvg}%</span>
              </div>
              <div>
                <h4 className="font-bold text-white dark:text-white light:text-slate-800 text-sm">Overall Progress</h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-600 mt-1 leading-normal">Checklist completion score across current project scope.</p>
              </div>
            </div>

          </div>
        </section>

        {/* Tab Navigation Menu */}
        <section className="space-y-6">
          <div className="flex border-b border-slate-850 dark:border-slate-850 light:border-slate-200 overflow-x-auto no-scrollbar">
            {[
              { id: 'progress', label: 'Progress', icon: Activity },
              { id: 'photos', label: 'Photos', icon: Camera },
              { id: 'timeline', label: 'Timeline', icon: Calendar },
              { id: 'costs', label: 'Costs', icon: DollarSign },
              { id: 'documents', label: 'Documents', icon: FileText },
              { id: 'profile', label: 'Profile', icon: User }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
                    isActive 
                      ? 'border-emerald-500 text-emerald-400 dark:text-emerald-450 light:text-emerald-600 font-bold bg-emerald-500/5' 
                      : 'border-transparent text-slate-400 dark:text-slate-400 light:text-slate-500 hover:text-slate-200 dark:hover:text-white light:hover:text-slate-800 hover:border-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Render Tab Contents */}
          <div className="min-h-[300px]">
            
            {/* 1. Progress Tab */}
            {activeTab === 'progress' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-900 dark:border-slate-900 light:border-slate-200 pb-3">
                  <div>
                    <h3 className="text-md font-bold text-white dark:text-white light:text-slate-900">Daily Site Updates</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 mt-0.5">Progress summaries and site details submitted by your contractor</p>
                  </div>
                </div>

                {updates.length === 0 ? (
                  <div className="glass-panel dark:glass-panel light:bg-white light:border-slate-200 rounded-xl p-8 text-center text-slate-500">
                    No daily updates have been posted yet.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {updates.map((upd) => (
                      <div key={upd.id} className="glass-panel dark:glass-panel light:bg-white light:border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 dark:border-slate-900 light:border-slate-100 pb-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white dark:text-white light:text-slate-800 text-md">Daily Log</span>
                            <span className="text-[11px] text-slate-500">•</span>
                            <span className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-slate-650">{upd.date}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded">
                              Labor Count: {upd.labour_count}
                            </span>
                            {upd.materials && (
                              <span className="text-xs font-semibold text-indigo-400 bg-indigo-400/10 px-2.5 py-1 rounded hidden sm:inline-block max-w-[200px] truncate" title={upd.materials}>
                                Materials: {upd.materials}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-sm leading-relaxed text-slate-350 dark:text-slate-350 light:text-slate-700">
                          <p className="whitespace-pre-line">{upd.notes}</p>
                        </div>

                        {upd.photos && upd.photos.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-900 dark:border-slate-900 light:border-slate-100">
                            {upd.photos.map((ph, index) => (
                              <div 
                                key={index} 
                                className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 dark:border-slate-800 light:border-slate-200 hover:border-slate-700 group cursor-pointer"
                                onClick={() => setActiveLightboxPhoto({ url: ph, date: upd.date })}
                              >
                                <img src={ph} alt="Progress detail" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Maximize2 className="h-5 w-5 text-white drop-shadow" />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. Photos Tab */}
            {activeTab === 'photos' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-900 dark:border-slate-900 light:border-slate-200 pb-3">
                  <div>
                    <h3 className="text-md font-bold text-white dark:text-white light:text-slate-900">Project Photo Logs</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 mt-0.5">Interactive index of progress imagery and document uploads</p>
                  </div>
                  
                  <button 
                    onClick={() => setShowPhotoModal(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-800 dark:border-slate-800 light:border-slate-200 bg-slate-900 dark:bg-slate-900 light:bg-white hover:border-slate-750 px-3.5 py-1.5 text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white dark:hover:text-white light:hover:text-slate-950 transition-all shadow-sm"
                  >
                    <ImageIcon className="h-4 w-4 text-emerald-400" /> Share Progress Photo
                  </button>
                </div>

                {allPhotos.length === 0 ? (
                  <div className="glass-panel dark:glass-panel light:bg-white light:border-slate-200 rounded-xl p-8 text-center text-slate-500">
                    No site photos are logged for this project.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {allPhotos.map((ph, idx) => (
                      <div key={idx} className="glass-panel dark:glass-panel light:bg-white light:border-slate-200 rounded-xl overflow-hidden border border-slate-800 group shadow-sm flex flex-col justify-between">
                        <div 
                          className="aspect-video relative overflow-hidden cursor-pointer"
                          onClick={() => setActiveLightboxPhoto(ph)}
                        >
                          <img src={ph.url} alt={`Progress photo ${idx}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent opacity-0 group-hover:opacity-100 transition-all flex items-end p-3">
                            <span className="text-[10px] font-semibold text-white">Log: {ph.date}</span>
                          </div>
                        </div>
                        <div className="p-3 flex items-center justify-between border-t border-slate-900 dark:border-slate-900 light:border-slate-100 bg-slate-950/20">
                          <span className="text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-650 font-medium">Site Record #{allPhotos.length - idx}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => window.open(ph.url, '_blank')}
                              className="p-1.5 text-slate-450 hover:text-white hover:bg-slate-850 light:hover:bg-slate-100 rounded transition-colors"
                              title="Open Full Image"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </button>
                            <a
                              href={ph.url}
                              download={`site_photo_${ph.date}.jpg`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-slate-450 hover:text-white hover:bg-slate-850 light:hover:bg-slate-100 rounded transition-colors"
                              title="Download Photo"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. Timeline Tab */}
            {activeTab === 'timeline' && (
              <div className="space-y-6">
                <div className="border-b border-slate-900 dark:border-slate-900 light:border-slate-200 pb-3">
                  <h3 className="text-md font-bold text-white dark:text-white light:text-slate-900">Project Milestone Timeline</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 mt-0.5">Real-time checklist track of deadlines and task stages</p>
                </div>

                {timeline.length === 0 ? (
                  <div className="glass-panel dark:glass-panel light:bg-white light:border-slate-200 rounded-xl p-8 text-center text-slate-550">
                    Timeline schedule is not initialized.
                  </div>
                ) : (
                  <div className="relative border-l border-slate-800 dark:border-slate-800 light:border-slate-300 pl-6 ml-3 space-y-8 py-2">
                    {timeline.map((item) => (
                      <div key={item.id} className="relative">
                        {/* Milestone dot indicator */}
                        <span className={`absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                          item.progress === 100 
                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                            : 'bg-slate-950 border-slate-700 dark:bg-slate-950 dark:border-slate-700 light:bg-white light:border-slate-350'
                        }`} />
                        
                        <div className="glass-panel dark:glass-panel light:bg-white light:border-slate-200 rounded-xl p-5 shadow-sm space-y-3.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div>
                              <h4 className="font-bold text-white dark:text-white light:text-slate-900 text-sm sm:text-md">{item.task}</h4>
                              <p className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-500 mt-1">Deadline Plan: {item.deadline}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.priority === 'High' 
                                  ? 'bg-rose-500/10 text-rose-400' 
                                  : item.priority === 'Medium' 
                                  ? 'bg-amber-500/10 text-amber-400' 
                                  : 'bg-sky-500/10 text-sky-400'
                              }`}>
                                {item.priority} Priority
                              </span>
                              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.progress === 100 
                                  ? 'bg-emerald-500/10 text-emerald-400' 
                                  : item.progress > 0 
                                  ? 'bg-sky-500/10 text-sky-400' 
                                  : 'bg-slate-800 text-slate-400 dark:bg-slate-800 dark:text-slate-400 light:bg-slate-200 light:text-slate-650'
                              }`}>
                                {item.status}
                              </span>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-500 light:text-slate-650">
                              <span>Checklist Progress</span>
                              <span className="font-semibold text-slate-300 dark:text-slate-300 light:text-slate-800">{item.progress}%</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-slate-900 dark:bg-slate-900 light:bg-slate-200 overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${item.progress === 100 ? 'bg-emerald-500' : 'bg-sky-500'}`} 
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. Costs Tab */}
            {activeTab === 'costs' && (
              <div className="space-y-6">
                <div className="border-b border-slate-900 dark:border-slate-900 light:border-slate-200 pb-3">
                  <h3 className="text-md font-bold text-white dark:text-white light:text-slate-900">Financial Sheets & Ledger</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 mt-0.5">Category breakdowns, invoices, and budget allocation summaries</p>
                </div>

                {costs.length === 0 ? (
                  <div className="glass-panel dark:glass-panel light:bg-white light:border-slate-200 rounded-xl p-8 text-center text-slate-550">
                    No budget ledger entries found.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Premium Cost Cards Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="glass-panel dark:glass-panel light:bg-white light:border-slate-200 rounded-2xl p-4.5 space-y-1">
                        <span className="text-[10px] font-bold text-slate-450 dark:text-slate-450 light:text-slate-550 uppercase tracking-wide">Contract Value</span>
                        <div className="text-lg sm:text-2xl font-extrabold text-white dark:text-white light:text-slate-950 font-mono">
                          ${totalBudget.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="glass-panel dark:glass-panel light:bg-white light:border-slate-200 rounded-2xl p-4.5 space-y-1 border-l-2 border-l-emerald-500">
                        <span className="text-[10px] font-bold text-slate-450 dark:text-slate-450 light:text-slate-550 uppercase tracking-wide">Spent to Date</span>
                        <div className="text-lg sm:text-2xl font-extrabold text-emerald-400 dark:text-emerald-400 light:text-emerald-600 font-mono">
                          ${totalPaid.toLocaleString()}
                        </div>
                      </div>

                      <div className="glass-panel dark:glass-panel light:bg-white light:border-slate-200 rounded-2xl p-4.5 space-y-1 border-l-2 border-l-amber-500">
                        <span className="text-[10px] font-bold text-slate-450 dark:text-slate-450 light:text-slate-550 uppercase tracking-wide">Pending Invoices</span>
                        <div className="text-lg sm:text-2xl font-extrabold text-amber-400 dark:text-amber-400 light:text-amber-600 font-mono">
                          ${totalPending.toLocaleString()}
                        </div>
                      </div>

                      <div className="glass-panel dark:glass-panel light:bg-white light:border-slate-200 rounded-2xl p-4.5 space-y-1 border-l-2 border-l-sky-500">
                        <span className="text-[10px] font-bold text-slate-450 dark:text-slate-450 light:text-slate-550 uppercase tracking-wide">Remaining Budget</span>
                        <div className="text-lg sm:text-2xl font-extrabold text-sky-400 dark:text-sky-400 light:text-sky-650 font-mono">
                          ${remainingBudget.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* Left: Charts Grid */}
                      <div className="lg:col-span-7 space-y-6">
                        {/* Bar comparison Chart */}
                        <div className="glass-panel dark:glass-panel light:bg-white light:border-slate-200 rounded-2xl p-5 flex flex-col">
                          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-400 light:text-slate-500 uppercase tracking-wider mb-4">Budget Overview</h4>
                          <div className="h-56 w-full text-slate-900 font-mono text-xs">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={comparisonData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="name" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                                <Bar dataKey="Amount" fill="#0ea5e9" radius={[4, 4, 0, 0]}>
                                  <Cell fill="#6366f1" />
                                  <Cell fill="#10b981" />
                                  <Cell fill="#f59e0b" />
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Pie Chart */}
                        <div className="glass-panel dark:glass-panel light:bg-white light:border-slate-200 rounded-2xl p-5 flex flex-col items-center">
                          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-400 light:text-slate-500 uppercase tracking-wider mb-2">Category Wise Distribution</h4>
                          
                          <div className="h-48 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={chartData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={50}
                                  outerRadius={70}
                                  paddingAngle={4}
                                  dataKey="value"
                                >
                                  {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Legend list */}
                          <div className="mt-2 flex flex-wrap justify-center gap-3.5">
                            {chartData.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-350 dark:text-slate-350 light:text-slate-700">
                                <span className="h-3 w-3 rounded" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                <span>{item.name}: <strong className="text-white dark:text-white light:text-slate-900 font-mono">${item.value.toLocaleString()}</strong></span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: Cost breakdown table */}
                      <div className="lg:col-span-5">
                        <div className="glass-panel dark:glass-panel light:bg-white light:border-slate-200 rounded-2xl p-5 space-y-4 h-full">
                          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-400 light:text-slate-500 uppercase tracking-wider">Itemized Cost Log</h4>
                          
                          <div className="overflow-auto max-h-[480px] rounded-xl border border-slate-800 dark:border-slate-800 light:border-slate-200">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-950 dark:bg-slate-950 light:bg-slate-100 border-b border-slate-800 dark:border-slate-800 light:border-slate-200 text-slate-450 dark:text-slate-450 light:text-slate-550 font-semibold uppercase tracking-wider">
                                  <th className="py-3 px-4">Expense Details</th>
                                  <th className="py-3 px-4">Category</th>
                                  <th className="py-3 px-4">Amount</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-850 dark:divide-slate-850 light:divide-slate-200 bg-slate-950/20 dark:bg-slate-950/20 light:bg-white">
                                {costs.map((c) => (
                                  <tr key={c.id} className="hover:bg-slate-900/10 dark:hover:bg-slate-900/10 light:hover:bg-slate-50">
                                    <td className="py-3 px-4">
                                      <div className="font-bold text-white dark:text-white light:text-slate-850">{c.item_name}</div>
                                      <span className={`inline-block text-[9px] font-bold mt-1 ${
                                        c.status === 'Paid' ? 'text-emerald-400' : 'text-amber-400'
                                      }`}>
                                        {c.status === 'Paid' ? '✓ Paid Invoice' : '⧗ Invoice Pending'}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-slate-400 dark:text-slate-400 light:text-slate-650">{c.category}</td>
                                    <td className="py-3 px-4 font-bold text-white dark:text-white light:text-slate-950 font-mono">${c.amount.toLocaleString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 5. Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="border-b border-slate-900 dark:border-slate-900 light:border-slate-200 pb-3">
                  <h3 className="text-md font-bold text-white dark:text-white light:text-slate-900">Blueprint & Specification Vault</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 mt-0.5">Access contracts, engineering details, and council permits</p>
                </div>

                {documents.length === 0 ? (
                  <div className="glass-panel dark:glass-panel light:bg-white light:border-slate-200 rounded-xl p-8 text-center text-slate-500">
                    No files are hosted on this portal.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(documentTree).map(([folderName, files]) => {
                      const isExpanded = expandedFolders[folderName];
                      return (
                        <div key={folderName} className="glass-panel dark:glass-panel light:bg-white light:border-slate-200 rounded-2xl overflow-hidden border border-slate-800 shadow-sm">
                          {/* Folder Node */}
                          <button
                            onClick={() => toggleFolder(folderName)}
                            className="w-full flex items-center justify-between p-4 bg-slate-900/30 dark:bg-slate-900/30 light:bg-slate-50 border-b border-slate-850 dark:border-slate-850 light:border-slate-100 hover:bg-slate-900/60 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {isExpanded ? (
                                <ChevronDown className="h-4.5 w-4.5 text-slate-400" />
                              ) : (
                                <ChevronRight className="h-4.5 w-4.5 text-slate-400" />
                              )}
                              <Folder className="h-5 w-5 text-amber-500" />
                              <span className="text-xs sm:text-sm font-bold text-white dark:text-white light:text-slate-850">{folderName}</span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-500 light:text-slate-600 bg-slate-950 dark:bg-slate-950 light:bg-slate-150 px-2 py-0.5 rounded-full">
                                {files.length} {files.length === 1 ? 'file' : 'files'}
                              </span>
                            </div>
                          </button>

                          {/* Files list */}
                          {isExpanded && (
                            <div className="p-2.5 divide-y divide-slate-850 dark:divide-slate-850 light:divide-slate-100">
                              {files.length === 0 ? (
                                <div className="text-center py-4 text-xs text-slate-500">
                                  No files inside this folder directory.
                                </div>
                              ) : (
                                files.map((doc) => (
                                  <div key={doc.id} className="flex items-center justify-between p-3 hover:bg-slate-900/20 dark:hover:bg-slate-900/20 light:hover:bg-slate-50 rounded-xl transition-colors">
                                    <div className="flex items-center gap-3">
                                      <File className="h-4.5 w-4.5 text-sky-400" />
                                      <div>
                                        <h5 className="text-xs font-bold text-white dark:text-white light:text-slate-800 max-w-[200px] sm:max-w-md truncate" title={doc.name}>
                                          {doc.name}
                                        </h5>
                                        <p className="text-[10px] text-slate-450 dark:text-slate-455 light:text-slate-550 mt-0.5">Size: {doc.size} • Uploaded: {doc.date}</p>
                                      </div>
                                    </div>

                                    <button 
                                      onClick={() => alert(`Simulated document download for file "${doc.name}" started successfully.`)}
                                      className="flex items-center gap-1.5 rounded-lg border border-slate-850 hover:border-slate-700 bg-slate-900/40 px-3 py-1.5 text-[10px] font-bold text-slate-350 dark:text-slate-350 light:text-slate-700 hover:text-white dark:hover:text-white light:hover:bg-slate-100 transition-all"
                                      title={`Download ${doc.name}`}
                                    >
                                      <Download className="h-3.5 w-3.5" /> Download
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 6. Profile Tab */}
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Profile detail card */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="glass-panel dark:glass-panel light:bg-white light:border-slate-200 rounded-2xl p-6 space-y-5">
                    <div className="flex flex-col items-center text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 shadow-inner">
                        <User className="h-8 w-8" />
                      </div>
                      <h4 className="mt-4 font-bold text-white dark:text-white light:text-slate-900 text-lg leading-tight">{currentUser.name}</h4>
                      <p className="text-xs text-emerald-400 font-semibold tracking-wide uppercase mt-1">Client Profile</p>
                    </div>

                    <div className="border-t border-slate-850 dark:border-slate-850 light:border-slate-100 pt-4 space-y-3.5 text-xs text-slate-300 dark:text-slate-300 light:text-slate-700">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-slate-500" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Email Address</p>
                          <p className="text-white dark:text-white light:text-slate-900 mt-0.5">{currentUser.email}</p>
                        </div>
                      </div>

                      {currentUser.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-slate-500" />
                          <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase">Contact Number</p>
                            <p className="text-white dark:text-white light:text-slate-900 mt-0.5">{currentUser.phone}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-slate-500" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Linked Project Site</p>
                          <p className="text-white dark:text-white light:text-slate-900 mt-0.5 font-medium">{project.projectName}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Settings Actions: Change Password & Contact Contractor */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Inquiry / Message Contractor Form */}
                  <div className="glass-panel dark:glass-panel light:bg-white light:border-slate-200 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-850 dark:border-slate-850 light:border-slate-100 pb-3">
                      <MessageSquare className="h-5 w-5 text-sky-400" />
                      <div>
                        <h4 className="font-bold text-white dark:text-white light:text-slate-900 text-sm">Send Contractor Inquiry</h4>
                        <p className="text-[11px] text-slate-450 dark:text-slate-450 light:text-slate-550">Submit general queries, order approvals, or design notes</p>
                      </div>
                    </div>

                    <form onSubmit={handleContactContractor} className="space-y-4">
                      {inquirySuccess && (
                        <div className="flex items-center gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs font-semibold text-emerald-450 dark:text-emerald-450 light:text-emerald-600">
                          <CheckCircle className="h-4 w-4 shrink-0" />
                          <span>Inquiry message sent successfully! Your contractor will notify you on read.</span>
                        </div>
                      )}

                      {inquiryError && (
                        <div className="text-rose-450 text-xs font-semibold bg-rose-500/10 border border-rose-500/20 rounded p-3">
                          {inquiryError}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-350 dark:text-slate-350 light:text-slate-650 uppercase mb-1.5">Inquiry Category</label>
                          <select
                            value={inquiryCategory}
                            onChange={(e) => setInquiryCategory(e.target.value)}
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white dark:border-slate-700 dark:bg-slate-950 light:border-slate-300 light:bg-slate-100 light:text-slate-900 focus:outline-none focus:border-sky-500"
                          >
                            <option value="General Query">General Query</option>
                            <option value="Design Change">Design Change Approval</option>
                            <option value="Billing / Payment">Invoice Question</option>
                            <option value="Timeline Milestone">Timeline Enquiry</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-350 dark:text-slate-350 light:text-slate-650 uppercase mb-1.5">Subject Heading</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Cedar planks shade stain"
                            value={inquirySubject}
                            onChange={(e) => setInquirySubject(e.target.value)}
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white dark:border-slate-700 dark:bg-slate-950 light:border-slate-300 light:bg-slate-100 light:text-slate-900 focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-350 dark:text-slate-350 light:text-slate-650 uppercase mb-1.5">Message Content</label>
                        <textarea
                          rows={3}
                          required
                          placeholder="Type inquiry details here for your contractor..."
                          value={inquiryMessage}
                          onChange={(e) => setInquiryMessage(e.target.value)}
                          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white dark:border-slate-700 dark:bg-slate-950 light:border-slate-300 light:bg-slate-100 light:text-slate-900 focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 px-4 py-2.5 text-xs font-bold text-white transition-all hover:scale-[1.01]"
                        >
                          <Send className="h-3.5 w-3.5" /> Submit Inquiry
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Change Password Form */}
                  <div className="glass-panel dark:glass-panel light:bg-white light:border-slate-200 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-850 dark:border-slate-850 light:border-slate-100 pb-3">
                      <Lock className="h-5 w-5 text-amber-500" />
                      <div>
                        <h4 className="font-bold text-white dark:text-white light:text-slate-900 text-sm">Modify Account Password</h4>
                        <p className="text-[11px] text-slate-450 dark:text-slate-455 light:text-slate-550">Update password security credentials periodically</p>
                      </div>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      {passwordSuccess && (
                        <div className="flex items-center gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs font-semibold text-emerald-450 dark:text-emerald-450 light:text-emerald-600">
                          <ShieldCheck className="h-4 w-4 shrink-0" />
                          <span>Credentials changed successfully. Use your new password at next login!</span>
                        </div>
                      )}

                      {passwordError && (
                        <div className="text-rose-450 text-xs font-semibold bg-rose-500/10 border border-rose-500/20 rounded p-3">
                          {passwordError}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-350 dark:text-slate-350 light:text-slate-650 uppercase mb-1.5">New Password</label>
                          <input
                            type="password"
                            required
                            placeholder="Min. 6 characters"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white dark:border-slate-700 dark:bg-slate-950 light:border-slate-300 light:bg-slate-100 light:text-slate-900 focus:outline-none focus:border-sky-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-350 dark:text-slate-350 light:text-slate-650 uppercase mb-1.5">Confirm Password</label>
                          <input
                            type="password"
                            required
                            placeholder="Repeat new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white dark:border-slate-700 dark:bg-slate-950 light:border-slate-300 light:bg-slate-100 light:text-slate-900 focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-xs font-bold text-white transition-all hover:scale-[1.01]"
                        >
                          <Lock className="h-3.5 w-3.5" /> Commit Password
                        </button>
                      </div>
                    </form>
                  </div>

                </div>

              </div>
            )}

          </div>
        </section>

      </main>

      {/* Simulator Photo Upload Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 dark:border-slate-800 dark:bg-slate-900 light:bg-white light:border-slate-200 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 dark:border-slate-800 light:border-slate-100 pb-3">
              <h3 className="font-bold text-white dark:text-white light:text-slate-900 text-md">Share Progress Photo</h3>
              <button onClick={() => setShowPhotoModal(false)} className="text-slate-450 hover:text-white dark:text-slate-450 light:text-slate-500">&times;</button>
            </div>

            <form onSubmit={handleSimulatePhotoUpload} className="mt-4 space-y-4">
              <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed">
                Provide any online image URL below to simulate photo submission. It will append to the project progress logs.
              </p>

              <div>
                <label className="block text-[11px] font-bold text-slate-305 dark:text-slate-300 light:text-slate-700 uppercase mb-1.5">Image Web URL</label>
                <input 
                  type="url"
                  required
                  placeholder="e.g. https://images.unsplash.com/..."
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white dark:border-slate-700 dark:bg-slate-950 light:border-slate-300 light:bg-slate-100 light:text-slate-900 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(false)}
                  className="flex-1 rounded border border-slate-800 bg-slate-900 py-2 text-xs font-bold text-slate-350 dark:text-slate-300 light:border-slate-200 light:bg-slate-100 light:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded bg-emerald-500 py-2 text-xs font-bold text-white hover:bg-emerald-600 shadow"
                >
                  Post Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal Overlay */}
      {activeLightboxPhoto && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 p-4 backdrop-blur-md">
          {/* Close trigger */}
          <button 
            onClick={() => setActiveLightboxPhoto(null)} 
            className="absolute top-4 right-4 z-55 rounded-full bg-slate-900/60 p-2 text-slate-300 hover:text-white transition-colors"
            title="Close Lightbox"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="max-w-4xl max-h-[75vh] relative overflow-hidden rounded-2xl border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-2xl flex items-center justify-center bg-black">
            <img 
              src={activeLightboxPhoto.url} 
              alt="Lightbox display" 
              className="max-w-full max-h-[75vh] object-contain"
            />
          </div>

          <div className="mt-4 flex flex-col items-center text-center gap-2">
            <span className="text-xs text-slate-400 font-semibold tracking-wide">Captured on {activeLightboxPhoto.date}</span>
            <div className="flex gap-3">
              <button
                onClick={() => window.open(activeLightboxPhoto.url, '_blank')}
                className="flex items-center gap-1 text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-colors"
              >
                <ExternalLink className="h-4 w-4" /> Open Original
              </button>
              <a
                href={activeLightboxPhoto.url}
                download={`site_photo_full.jpg`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs font-bold bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg transition-all"
              >
                <Download className="h-4 w-4" /> Download Photo
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
