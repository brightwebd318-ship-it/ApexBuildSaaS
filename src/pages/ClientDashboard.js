import React, { useState, useEffect } from 'react';
import { firebaseService } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { Unauthorized } from './Unauthorized';
import { 
  Calendar, Camera, IndianRupee, FileText, Activity, 
  MapPin, CheckCircle, Image as ImageIcon, Download,
  User, Lock, Send, ChevronRight, ChevronDown, Folder, 
  File, Plus, X, Maximize2, ExternalLink, ShieldCheck, Mail, Phone, MessageSquare,
  Bell, Trash2, FileUp, Eye
} from 'lucide-react';
import { ResponsiveContainer, Cell, PieChart, Pie, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function ClientDashboard() {
  const { logout, currentUser } = useAuth();
  
  const [project, setProject] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [costs, setCosts] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [progressPhotos, setProgressPhotos] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('progress');
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  // Notifications Dropdown
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [viewAllNotifications, setViewAllNotifications] = useState(false);

  // Photo gallery and lightbox states
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoCaption, setPhotoCaption] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState(null);

  // Document Upload States
  const [showDocModal, setShowDocModal] = useState(false);
  const [docFile, setDocFile] = useState(null);
  const [docType, setDocType] = useState('2D Drawings');
  const [uploadingDoc, setUploadingDoc] = useState(false);

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
    '2D Drawings': true,
    '3D Designs': true,
    'Contracts': true,
    'Bills / Invoices': true,
    'PDFs': true,
    'Images': true,
    'Other project files': true
  });

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

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
      const [updatesData, timelineData, costsData, documentsData, notificationsData, photosData] = await Promise.all([
        firebaseService.getDailyUpdates(proj.id),
        firebaseService.getTimeline(proj.id),
        firebaseService.getCosts(proj.id),
        firebaseService.getDocuments(proj.id),
        firebaseService.getNotifications(userId, 'client'),
        firebaseService.getProgressPhotos(proj.id)
      ]);

      setUpdates(updatesData);
      setTimeline(timelineData);
      setCosts(costsData);
      setDocuments(documentsData);
      setNotifications(notificationsData);
      setProgressPhotos(photosData);

    } catch (err) {
      console.error("Error loading client project data: ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadProjectData();
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" />
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

  const COLORS = ['#10b981', '#6366f1', '#0ea5e9', '#f59e0b', '#ec4899'];

  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    if (!photoFile) return;

    setUploadingPhoto(true);
    try {
      const base64Url = await convertToBase64(photoFile);
      const photoData = {
        uploadedBy: 'client',
        uploadedByName: currentUser.name,
        photoUrl: base64Url,
        caption: photoCaption || 'Progress image shared by client',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        timestamp: new Date().toISOString()
      };

      await firebaseService.addProgressPhoto(project.id, photoData);

      // Notify Contractor
      await firebaseService.addNotification(
        project.id,
        project.contractorId,
        currentUser.uid || currentUser.id,
        'New Progress Photo Uploaded',
        `Client ${currentUser.name} uploaded a progress photo: "${photoData.caption}".`,
        'contractor'
      );

      // reload
      const freshPhotos = await firebaseService.getProgressPhotos(project.id);
      setProgressPhotos(freshPhotos);
      setShowPhotoModal(false);
      setPhotoFile(null);
      setPhotoCaption('');
    } catch (err) {
      console.error("Failed to upload photo:", err);
      alert("Failed to upload image. It may exceed size limitations.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDocUpload = async (e) => {
    e.preventDefault();
    if (!docFile) return;

    setUploadingDoc(true);
    try {
      const base64Url = await convertToBase64(docFile);
      const sizeStr = (docFile.size / (1024 * 1024)).toFixed(2) + ' MB';
      const docData = {
        name: docFile.name,
        size: sizeStr,
        type: docType,
        fileUrl: base64Url,
        uploadedBy: 'client',
        uploadedByName: currentUser.name,
        visibleTo: 'both'
      };

      await firebaseService.addDocument(project.id, currentUser.uid || currentUser.id, docData);

      // Notify Contractor
      await firebaseService.addNotification(
        project.id,
        project.contractorId,
        currentUser.uid || currentUser.id,
        'New Document Uploaded',
        `Client ${currentUser.name} uploaded document: "${docFile.name}" under category "${docType}".`,
        'contractor'
      );

      // reload
      const freshDocs = await firebaseService.getDocuments(project.id);
      setDocuments(freshDocs);
      setShowDocModal(false);
      setDocFile(null);
    } catch (err) {
      console.error("Document upload failed:", err);
      alert("Failed to upload document. File may be too large.");
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDoc = async (docId, uploader) => {
    if (uploader !== 'client') {
      alert("You can only delete documents that you uploaded.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await firebaseService.deleteDocument(docId);
        const freshDocs = await firebaseService.getDocuments(project.id);
        setDocuments(freshDocs);
      } catch (err) {
        console.error("Error deleting document:", err);
      }
    }
  };

  const handleDeletePhoto = async (photoId, uploader) => {
    if (uploader !== 'client') {
      alert("You can only delete progress photos that you uploaded.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this photo log?")) {
      try {
        await firebaseService.deleteProgressPhoto(photoId);
        const freshPhotos = await firebaseService.getProgressPhotos(project.id);
        setProgressPhotos(freshPhotos);
      } catch (err) {
        console.error("Error deleting photo:", err);
      }
    }
  };

  const handleMarkNotificationRead = async (notifId) => {
    try {
      await firebaseService.markNotificationRead(notifId);
      const userId = currentUser.uid || currentUser.id;
      const freshNotifs = await firebaseService.getNotifications(userId, 'client');
      setNotifications(freshNotifs);
    } catch (err) {
      console.error("Error reading notification:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => firebaseService.markNotificationRead(n.id)));
      const userId = currentUser.uid || currentUser.id;
      const freshNotifs = await firebaseService.getNotifications(userId, 'client');
      setNotifications(freshNotifs);
    } catch (err) {
      console.error("Error marking all read:", err);
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

  // Group documents by the 7 requested folders
  const documentTree = {
    '2D Drawings': documents.filter(d => d.type === '2D Drawings'),
    '3D Designs': documents.filter(d => d.type === '3D Designs'),
    'Contracts': documents.filter(d => d.type === 'Contracts'),
    'Bills / Invoices': documents.filter(d => d.type === 'Bills / Invoices'),
    'PDFs': documents.filter(d => d.type === 'PDFs'),
    'Images': documents.filter(d => d.type === 'Images'),
    'Other project files': documents.filter(d => 
      d.type === 'Other project files' || 
      !['2D Drawings', '3D Designs', 'Contracts', 'Bills / Invoices', 'PDFs', 'Images', 'Other project files'].includes(d.type)
    )
  };

  const triggerDownload = (fileUrl, fileName) => {
    if (!fileUrl) {
      alert("No file data attached with this document.");
      return;
    }
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-slate-950 text-slate-100 pb-16 transition-colors duration-300 relative">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-450 border border-emerald-500/20">
                <CheckCircle className="h-5 w-5 animate-pulse-soft" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white leading-none">ApexBuild</h1>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-450">Client Portal</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-white">{currentUser.name}</p>
                <p className="text-xs text-slate-400">{currentUser.email}</p>
              </div>

              {/* Sleek Notification Bell with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotificationsDropdown(!showNotificationsDropdown);
                    if (!showNotificationsDropdown) {
                      setViewAllNotifications(false);
                    }
                  }}
                  className={`p-2 rounded-xl border transition-all relative ${
                    showNotificationsDropdown 
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' 
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                  title="Notifications"
                >
                  <Bell className="h-4.5 w-4.5" />
                  {notifications.some(n => !n.read) && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-slate-900 animate-pulse-soft" />
                  )}
                </button>

                {showNotificationsDropdown && (
                  <>
                    {/* Invisible overlay to close dropdown on click outside */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => {
                        setShowNotificationsDropdown(false);
                        setViewAllNotifications(false);
                      }} 
                    />
                    
                    {/* Dropdown panel */}
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-800 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md z-50 animate-dropdown space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-emerald-400" />
                          <h3 className="font-bold text-white text-xs sm:text-sm">Project Alerts</h3>
                        </div>
                        {notifications.some(n => !n.read) && (
                          <button 
                            onClick={handleMarkAllRead}
                            className="text-[10px] text-emerald-400 hover:underline font-bold"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                        {notifications.length === 0 ? (
                          <div className="text-center py-8 text-slate-500 text-xs">
                            Your inbox is completely clear!
                          </div>
                        ) : (
                          (viewAllNotifications ? notifications : notifications.slice(0, 5)).map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                if (!n.read) {
                                  handleMarkNotificationRead(n.id);
                                }
                              }}
                              className={`rounded-lg border p-3 flex flex-col gap-1 transition-all cursor-pointer relative hover:border-slate-800 ${
                                n.read
                                  ? 'border-slate-850 bg-slate-950/20 text-slate-400'
                                  : 'border-emerald-500/20 bg-emerald-500/5 text-slate-200 shadow-sm'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="font-bold text-xs text-white">{n.title}</h4>
                                {!n.read && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkNotificationRead(n.id);
                                    }}
                                    className="text-[9px] font-bold text-emerald-455 hover:underline shrink-0"
                                  >
                                    Mark read
                                  </button>
                                )}
                              </div>
                              <p className="text-[11px] leading-normal text-slate-350">{n.message}</p>
                              <span className="text-[9px] text-slate-550 block font-mono mt-0.5">{n.date}</span>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="flex justify-between items-center border-t border-slate-850 pt-3 text-[10px]">
                        {notifications.length > 5 && !viewAllNotifications ? (
                          <button
                            onClick={() => setViewAllNotifications(true)}
                            className="font-bold text-sky-400 hover:text-sky-300 hover:underline"
                          >
                            View All Notifications
                          </button>
                        ) : (
                          <span className="text-slate-500 font-semibold uppercase tracking-wider">All caught up</span>
                        )}
                        
                        <button
                          onClick={() => {
                            setShowNotificationsDropdown(false);
                            setViewAllNotifications(false);
                          }}
                          className="font-bold text-slate-455 hover:text-white"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={logout}
                className="rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-all shadow-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Project Hero Section */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 sm:p-8 shadow-xl">
          <div className="absolute top-0 right-0 -z-10 h-72 w-72 rounded-full bg-emerald-500/5 blur-[50px]" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                <MapPin className="h-3.5 w-3.5" /> Site Location Active
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">{project.projectName}</h2>
              <p className="text-sm text-slate-400 max-w-xl">
                Location: {project.siteLocation}
              </p>
              <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
                <span>Start Date: {project.startDate}</span>
                <span>•</span>
                <span>Est. Completion: {project.estimatedFinish || project.deadline}</span>
                <span>•</span>
                <span>Type: {project.constructionType}</span>
              </div>
            </div>

            {/* Progress Gauge */}
            <div className="flex items-center gap-5 bg-slate-950/40 border border-slate-900 rounded-2xl p-5 md:w-80 shrink-0">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-slate-800">
                {/* Visual completion ring */}
                <svg className="absolute -rotate-90 h-20 w-20">
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-slate-800"
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
                    className="text-emerald-500 transition-all duration-1000"
                  />
                </svg>
                <span className="text-sm font-extrabold text-white font-mono">{projProgressAvg}%</span>
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Overall Progress</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-normal">Checklist completion score across current project scope.</p>
              </div>
            </div>

          </div>
        </section>

        {/* Tab Navigation Menu */}
        <section className="space-y-6">
          <div className="flex border-b border-slate-850 overflow-x-auto no-scrollbar">
            {[
              { id: 'progress', label: 'Daily Logs', icon: Activity },
              { id: 'photos', label: 'Timeline Photos', icon: Camera },
              { id: 'timeline', label: 'Timeline Milestones', icon: Calendar },
              { id: 'costs', label: 'Costs & Ledger', icon: IndianRupee },
              { id: 'documents', label: 'Documents Vault', icon: FileText },
              { id: 'profile', label: 'Inquiries & Profile', icon: User }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
                    isActive 
                      ? 'border-emerald-500 text-emerald-450 font-bold bg-emerald-500/5' 
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800'
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
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <div>
                    <h3 className="text-md font-bold text-white">Daily Site Updates</h3>
                    <p className="text-xs text-slate-450 mt-0.5">Progress summaries and site details submitted by your contractor</p>
                  </div>
                </div>

                {updates.length === 0 ? (
                  <div className="glass-panel rounded-xl p-8 text-center text-slate-500">
                    No daily updates have been posted yet.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {updates.map((upd) => (
                      <div key={upd.id} className="glass-panel rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-md">Daily Log</span>
                            <span className="text-slate-555">•</span>
                            <span className="text-xs font-semibold text-slate-400">{upd.date}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded">
                              Labor Count: {upd.labour_count || upd.labourCount || 0}
                            </span>
                            {upd.materials && (
                              <span className="text-xs font-semibold text-indigo-400 bg-indigo-400/10 px-2.5 py-1 rounded hidden sm:inline-block max-w-[200px] truncate" title={upd.materials}>
                                Materials: {upd.materials}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-sm leading-relaxed text-slate-300">
                          <p className="whitespace-pre-line">{upd.notes}</p>
                        </div>

                        {upd.photos && upd.photos.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-900">
                            {upd.photos.map((ph, index) => (
                              <div 
                                key={index} 
                                className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 hover:border-slate-700 group cursor-pointer"
                                onClick={() => setActiveLightboxPhoto({ url: ph, date: upd.date, caption: 'Daily site update attachment', uploadedByName: 'Contractor' })}
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

            {/* 2. Photos Tab - TIMELINE PHOTOS FEATURE */}
            {activeTab === 'photos' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <div>
                    <h3 className="text-md font-bold text-white">Project Photo Timeline</h3>
                    <p className="text-xs text-slate-450 mt-0.5">Chronological feed of progress photos and work update logs from Client and Contractor</p>
                  </div>
                  
                  <button 
                    onClick={() => setShowPhotoModal(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:border-emerald-500 hover:bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-emerald-450 transition-all shadow-sm"
                  >
                    <Camera className="h-4 w-4 text-emerald-400" /> Share Progress Photo
                  </button>
                </div>

                {progressPhotos.length === 0 ? (
                  <div className="glass-panel rounded-xl p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
                    <Camera className="h-10 w-10 text-slate-655" />
                    <p>No site photos have been logged in the timeline yet.</p>
                  </div>
                ) : (
                  <div className="relative border-l border-slate-800 pl-6 ml-3 space-y-8 py-2">
                    {progressPhotos.map((ph) => (
                      <div key={ph.id} className="relative">
                        {/* Timeline dot indicator */}
                        <span className={`absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                          ph.uploadedBy === 'client' 
                            ? 'bg-emerald-500 border-emerald-500' 
                            : 'bg-indigo-500 border-indigo-500'
                        }`} />
                        
                        <div className="glass-panel rounded-xl p-5 shadow-sm space-y-4 max-w-2xl">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Uploaded By</span>
                              <span className="font-semibold text-white text-xs">{ph.uploadedByName} ({ph.uploadedBy})</span>
                            </div>
                            <div className="text-right text-[10px] text-slate-400">
                              <span className="block font-mono">Date: {ph.date}</span>
                              <span className="block font-mono">Time: {ph.time}</span>
                            </div>
                          </div>

                          <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-950 group cursor-pointer"
                               onClick={() => setActiveLightboxPhoto({ url: ph.photoUrl, date: `${ph.date} ${ph.time}`, caption: ph.caption, uploadedByName: ph.uploadedByName })}>
                            <img src={ph.photoUrl} alt={ph.caption} className="h-full w-full object-contain" />
                            <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Maximize2 className="h-6 w-6 text-white drop-shadow" />
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-4">
                            <p className="text-xs text-slate-300 italic">"{ph.caption}"</p>
                            
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => triggerDownload(ph.photoUrl, `progress_${ph.date}_${ph.time}.jpg`)}
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                                title="Download Photo"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </button>
                              {ph.uploadedBy === 'client' && (
                                <button
                                  onClick={() => handleDeletePhoto(ph.id, ph.uploadedBy)}
                                  className="p-1.5 text-slate-400 hover:text-rose-455 hover:bg-slate-800 rounded transition-colors"
                                  title="Delete Photo Log"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
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
                <div className="border-b border-slate-900 pb-3">
                  <h3 className="text-md font-bold text-white">Project Milestone Timeline</h3>
                  <p className="text-xs text-slate-450 mt-0.5">Real-time checklist track of deadlines and task stages</p>
                </div>

                {timeline.length === 0 ? (
                  <div className="glass-panel rounded-xl p-8 text-center text-slate-500">
                    Timeline schedule is not initialized.
                  </div>
                ) : (
                  <div className="relative border-l border-slate-800 pl-6 ml-3 space-y-8 py-2">
                    {timeline.map((item) => (
                      <div key={item.id} className="relative">
                        {/* Milestone dot indicator */}
                        <span className={`absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                          item.progress === 100 
                            ? 'bg-emerald-500 border-emerald-500' 
                            : 'bg-slate-955 border-slate-700'
                        }`} />
                        
                        <div className="glass-panel rounded-xl p-5 shadow-sm space-y-3.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div>
                              <h4 className="font-bold text-white text-sm sm:text-md">{item.task}</h4>
                              <p className="text-[11px] text-slate-400 mt-1">Deadline Plan: {item.deadline}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.priority === 'High' 
                                  ? 'bg-rose-500/10 text-rose-455' 
                                  : item.priority === 'Medium' 
                                  ? 'bg-amber-500/10 text-amber-450' 
                                  : 'bg-sky-500/10 text-sky-400'
                              }`}>
                                {item.priority} Priority
                              </span>
                              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.progress === 100 
                                  ? 'bg-emerald-500/10 text-emerald-450' 
                                  : item.progress > 0 
                                  ? 'bg-sky-500/10 text-sky-400' 
                                  : 'bg-slate-800 text-slate-400'
                              }`}>
                                {item.status}
                              </span>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                              <span>Checklist Progress</span>
                              <span className="font-semibold text-slate-300">{item.progress}%</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-slate-900 overflow-hidden">
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

            {/* 4. Costs Tab - INDIAN RUPEE FORMATTING */}
            {activeTab === 'costs' && (
              <div className="space-y-6">
                <div className="border-b border-slate-900 pb-3">
                  <h3 className="text-md font-bold text-white">Financial Sheets & Ledger (INR)</h3>
                  <p className="text-xs text-slate-455 mt-0.5">Category breakdowns, invoices, and budget allocation summaries in Indian Rupees (₹)</p>
                </div>

                {costs.length === 0 ? (
                  <div className="glass-panel rounded-xl p-8 text-center text-slate-500">
                    No budget ledger entries found.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Premium Cost Cards Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="glass-panel rounded-2xl p-4.5 space-y-1">
                        <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Total Estimate</span>
                        <div className="text-lg sm:text-2xl font-extrabold text-white font-mono">
                          ₹{totalBudget.toLocaleString('en-IN')}
                        </div>
                      </div>
                      
                      <div className="glass-panel rounded-2xl p-4.5 space-y-1 border-l-2 border-l-emerald-500">
                        <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Spent to Date</span>
                        <div className="text-lg sm:text-2xl font-extrabold text-emerald-400 font-mono">
                          ₹{totalPaid.toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div className="glass-panel rounded-2xl p-4.5 space-y-1 border-l-2 border-l-amber-500">
                        <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Pending Invoices</span>
                        <div className="text-lg sm:text-2xl font-extrabold text-amber-400 font-mono">
                          ₹{totalPending.toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div className="glass-panel rounded-2xl p-4.5 space-y-1 border-l-2 border-l-sky-500">
                        <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Remaining Estimate</span>
                        <div className="text-lg sm:text-2xl font-extrabold text-sky-400 font-mono">
                          ₹{remainingBudget.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* Left: Charts Grid */}
                      <div className="lg:col-span-7 space-y-6">
                        {/* Bar comparison Chart */}
                        <div className="glass-panel rounded-2xl p-5 flex flex-col">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Budget Overview (INR)</h4>
                          <div className="h-56 w-full text-slate-900 font-mono text-xs">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={comparisonData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="name" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']} />
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
                        <div className="glass-panel rounded-2xl p-5 flex flex-col items-center">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category Wise Distribution</h4>
                          
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
                                <Tooltip formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Legend list */}
                          <div className="mt-2 flex flex-wrap justify-center gap-3.5">
                            {chartData.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-300">
                                <span className="h-3 w-3 rounded" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                <span>{item.name}: <strong className="text-white font-mono">₹{item.value.toLocaleString('en-IN')}</strong></span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: Cost breakdown table */}
                      <div className="lg:col-span-5">
                        <div className="glass-panel rounded-2xl p-5 space-y-4 h-full">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Itemized Cost Log</h4>
                          
                          <div className="overflow-auto max-h-[480px] rounded-xl border border-slate-800">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-950 border-b border-slate-800 text-slate-450 font-semibold uppercase tracking-wider">
                                  <th className="py-3 px-4">Expense Details</th>
                                  <th className="py-3 px-4">Category</th>
                                  <th className="py-3 px-4">Amount</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-850 bg-slate-950/20">
                                {costs.map((c) => (
                                  <tr key={c.id} className="hover:bg-slate-900/10">
                                    <td className="py-3 px-4">
                                      <div className="font-bold text-white">{c.item_name || c.item}</div>
                                      <span className={`inline-block text-[9px] font-bold mt-1 ${
                                        c.status === 'Paid' ? 'text-emerald-450' : 'text-amber-450'
                                      }`}>
                                        {c.status === 'Paid' ? '✓ Paid Invoice' : '⧗ Invoice Pending'}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-slate-450">{c.category}</td>
                                    <td className="py-3 px-4 font-bold text-white font-mono">₹{c.amount.toLocaleString('en-IN')}</td>
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

            {/* 5. Documents Tab - FULL MANAGEMENT */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <div>
                    <h3 className="text-md font-bold text-white">Blueprint & Document Vault</h3>
                    <p className="text-xs text-slate-450 mt-0.5">Secure folders containing project drawings, permits, designs, and contracts</p>
                  </div>
                  
                  <button
                    onClick={() => setShowDocModal(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:border-emerald-500 hover:bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-emerald-450 transition-all shadow-sm"
                  >
                    <FileUp className="h-4 w-4 text-emerald-400" /> Upload Document
                  </button>
                </div>

                {documents.length === 0 ? (
                  <div className="glass-panel rounded-xl p-12 text-center text-slate-550 flex flex-col items-center justify-center space-y-3">
                    <FileText className="h-10 w-10 text-slate-655" />
                    <p>No documents are hosted on this project vault.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {Object.entries(documentTree).map(([folderName, files]) => {
                      const isExpanded = expandedFolders[folderName];
                      return (
                        <div key={folderName} className="glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-sm">
                          {/* Folder Node */}
                          <button
                            onClick={() => toggleFolder(folderName)}
                            className="w-full flex items-center justify-between p-4 bg-slate-900/30 border-b border-slate-850 hover:bg-slate-900/60 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {isExpanded ? (
                                <ChevronDown className="h-4.5 w-4.5 text-slate-400" />
                              ) : (
                                <ChevronRight className="h-4.5 w-4.5 text-slate-400" />
                              )}
                              <Folder className="h-5 w-5 text-amber-500" />
                              <span className="text-xs sm:text-sm font-bold text-white">{folderName}</span>
                              <span className="text-[10px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded-full">
                                {files.length} {files.length === 1 ? 'file' : 'files'}
                              </span>
                            </div>
                          </button>

                          {/* Files list */}
                          {isExpanded && (
                            <div className="p-2.5 divide-y divide-slate-850 bg-slate-900/10">
                              {files.length === 0 ? (
                                <div className="text-center py-4 text-xs text-slate-550">
                                  No files inside this folder directory.
                                </div>
                              ) : (
                                files.map((doc) => (
                                  <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3 hover:bg-slate-900/20 rounded-xl transition-colors">
                                    <div className="flex items-center gap-3">
                                      <File className="h-5 w-5 text-sky-400" />
                                      <div>
                                        <h5 className="text-xs font-bold text-white max-w-[200px] sm:max-w-md truncate" title={doc.name}>
                                          {doc.name}
                                        </h5>
                                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[9px] text-slate-455 mt-0.5">
                                          <span>Size: {doc.size}</span>
                                          <span>•</span>
                                          <span>Uploaded: {doc.date}</span>
                                          <span>•</span>
                                          <span>By: <strong className="text-slate-300">{doc.uploadedByName || (doc.uploadedBy === 'client' ? 'Client' : 'Contractor')}</strong></span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-end sm:self-center">
                                      <button 
                                        onClick={() => triggerDownload(doc.fileUrl, doc.name)}
                                        className="flex items-center gap-1.5 rounded-lg border border-slate-850 hover:border-slate-700 bg-slate-900/40 px-3 py-1.5 text-[10px] font-bold text-slate-300 hover:text-white transition-all"
                                        title={`Download ${doc.name}`}
                                      >
                                        <Download className="h-3.5 w-3.5" /> Download
                                      </button>
                                      {doc.uploadedBy === 'client' && (
                                        <button
                                          onClick={() => handleDeleteDoc(doc.id, doc.uploadedBy)}
                                          className="p-2 text-slate-500 hover:text-rose-455 hover:bg-slate-850 rounded transition-colors"
                                          title="Delete Document"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      )}
                                    </div>
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

            {/* 6. Profile & Inquiry Tab */}
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Profile detail card */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="glass-panel rounded-2xl p-6 space-y-5">
                    <div className="flex flex-col items-center text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 shadow-inner">
                        <User className="h-7 w-7" />
                      </div>
                      <h4 className="font-extrabold text-white text-md mt-3.5">{currentUser.name}</h4>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-450 mt-1 bg-emerald-500/10 border border-emerald-500/20 px-3 py-0.5 rounded-full">
                        Client Account
                      </span>
                    </div>

                    <div className="border-t border-slate-850 pt-4 space-y-3.5 text-xs text-slate-300">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-slate-500" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Email Address</p>
                          <p className="text-white mt-0.5">{currentUser.email}</p>
                        </div>
                      </div>

                      {currentUser.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-slate-500" />
                          <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase">Contact Number</p>
                            <p className="text-white mt-0.5">{currentUser.phone}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-slate-500" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Linked Project Site</p>
                          <p className="text-white mt-0.5 font-medium">{project.projectName}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Settings Actions: Change Password & Contact Contractor */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Inquiry / Message Contractor Form */}
                  <div className="glass-panel rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                      <MessageSquare className="h-5 w-5 text-emerald-450" />
                      <div>
                        <h4 className="font-bold text-white text-sm">Send Contractor Inquiry</h4>
                        <p className="text-[11px] text-slate-450">Submit general queries, order approvals, or design notes</p>
                      </div>
                    </div>

                    <form onSubmit={handleContactContractor} className="space-y-4">
                      {inquirySuccess && (
                        <div className="flex items-center gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs font-semibold text-emerald-400">
                          <CheckCircle className="h-4 w-4 shrink-0" />
                          <span>Inquiry message sent successfully! Your contractor will receive a notification.</span>
                        </div>
                      )}

                      {inquiryError && (
                        <div className="text-rose-455 text-xs font-semibold bg-rose-500/10 border border-rose-500/20 rounded p-3">
                          {inquiryError}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-350 uppercase mb-1.5">Inquiry Category</label>
                          <select
                            value={inquiryCategory}
                            onChange={(e) => setInquiryCategory(e.target.value)}
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                          >
                            <option value="General Query">General Query</option>
                            <option value="Design Change">Design Change Approval</option>
                            <option value="Billing / Payment">Invoice Question</option>
                            <option value="Timeline Milestone">Timeline Enquiry</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-350 uppercase mb-1.5">Subject Heading</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Cedar planks shade stain"
                            value={inquirySubject}
                            onChange={(e) => setInquirySubject(e.target.value)}
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-350 uppercase mb-1.5">Message Content</label>
                        <textarea
                          rows={3}
                          required
                          placeholder="Type inquiry details here for your contractor..."
                          value={inquiryMessage}
                          onChange={(e) => setInquiryMessage(e.target.value)}
                          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition-all hover:scale-[1.01]"
                        >
                          <Send className="h-3.5 w-3.5" /> Submit Inquiry
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Change Password Form */}
                  <div className="glass-panel rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                      <Lock className="h-5 w-5 text-amber-500" />
                      <div>
                        <h4 className="font-bold text-white text-sm">Modify Account Password</h4>
                        <p className="text-[11px] text-slate-455">Update password security credentials periodically</p>
                      </div>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      {passwordSuccess && (
                        <div className="flex items-center gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs font-semibold text-emerald-450">
                          <ShieldCheck className="h-4 w-4 shrink-0" />
                          <span>Credentials changed successfully. Use your new password at next login!</span>
                        </div>
                      )}

                      {passwordError && (
                        <div className="text-rose-455 text-xs font-semibold bg-rose-500/10 border border-rose-500/20 rounded p-3">
                          {passwordError}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-350 uppercase mb-1.5">New Password</label>
                          <input
                            type="password"
                            required
                            placeholder="Min. 6 characters"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-350 uppercase mb-1.5">Confirm Password</label>
                          <input
                            type="password"
                            required
                            placeholder="Repeat new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
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

      {/* Progress Photo Share Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-md">Upload Progress Photo</h3>
              <button onClick={() => {
                setShowPhotoModal(false);
                setPhotoFile(null);
                setPhotoCaption('');
              }} className="text-slate-400 hover:text-white">&times;</button>
            </div>

            <form onSubmit={handlePhotoUpload} className="mt-4 space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Choose an image file from your device. It will upload as a progress milestone visible in the project photo timeline.
              </p>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">Select Image File</label>
                <input 
                  type="file"
                  required
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files[0])}
                  className="w-full text-xs text-slate-300 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/10 file:text-emerald-450 hover:file:bg-emerald-500/20 bg-slate-950 border border-slate-700 rounded-md p-1"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">Photo Caption / Description</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Wall bricklaying progress"
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPhotoModal(false);
                    setPhotoFile(null);
                    setPhotoCaption('');
                  }}
                  className="flex-1 rounded border border-slate-800 bg-slate-900 py-2 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingPhoto}
                  className="flex-1 rounded bg-emerald-500 py-2 text-xs font-bold text-white hover:bg-emerald-600 shadow disabled:opacity-50"
                >
                  {uploadingPhoto ? 'Uploading...' : 'Post Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Upload Modal */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-md">Upload Document</h3>
              <button onClick={() => {
                setShowDocModal(false);
                setDocFile(null);
              }} className="text-slate-400 hover:text-white">&times;</button>
            </div>

            <form onSubmit={handleDocUpload} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">Select File (PDF, Image, etc.)</label>
                <input 
                  type="file"
                  required
                  onChange={(e) => setDocFile(e.target.files[0])}
                  className="w-full text-xs text-slate-300 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/10 file:text-emerald-450 hover:file:bg-emerald-500/20 bg-slate-950 border border-slate-700 rounded-md p-1"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">Category Folder</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="2D Drawings">2D Drawings</option>
                  <option value="3D Designs">3D Designs</option>
                  <option value="Contracts">Contracts</option>
                  <option value="Bills / Invoices">Bills / Invoices</option>
                  <option value="PDFs">PDFs</option>
                  <option value="Images">Images</option>
                  <option value="Other project files">Other project files</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDocModal(false);
                    setDocFile(null);
                  }}
                  className="flex-1 rounded border border-slate-800 bg-slate-900 py-2 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingDoc}
                  className="flex-1 rounded bg-emerald-500 py-2 text-xs font-bold text-white hover:bg-emerald-600 shadow disabled:opacity-50"
                >
                  {uploadingDoc ? 'Uploading...' : 'Upload File'}
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

          <div className="max-w-4xl max-h-[75vh] relative overflow-hidden rounded-2xl border border-slate-800 shadow-2xl flex items-center justify-center bg-black">
            <img 
              src={activeLightboxPhoto.url} 
              alt="Lightbox display" 
              className="max-w-full max-h-[75vh] object-contain"
            />
          </div>

          <div className="mt-4 flex flex-col items-center text-center gap-2">
            <h4 className="text-sm font-bold text-white">"{activeLightboxPhoto.caption}"</h4>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wide">
              Logged by {activeLightboxPhoto.uploadedByName} on {activeLightboxPhoto.date}
            </span>
            <div className="flex gap-3 mt-1">
              <button
                onClick={() => window.open(activeLightboxPhoto.url, '_blank')}
                className="flex items-center gap-1 text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-colors"
              >
                <ExternalLink className="h-4 w-4" /> Open Original
              </button>
              <button
                onClick={() => triggerDownload(activeLightboxPhoto.url, 'progress_full.jpg')}
                className="flex items-center gap-1 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-all"
              >
                <Download className="h-4 w-4" /> Download Photo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
