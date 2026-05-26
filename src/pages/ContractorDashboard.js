import React, { useState, useEffect } from 'react';
import { firebaseService } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { 
  Users, HardHat, Calendar, DollarSign, Plus, CheckCircle2, 
  Trash2, ClipboardList, Package, BarChart3, MapPin, 
  FileText, Download, Bell, BellOff, Info, AlertTriangle, Paperclip, Camera
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';

export default function ContractorDashboard() {
  const { logout, currentUser } = useAuth();
  
  // Tab navigation state
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data lists state
  const [projects, setProjects] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [allUpdates, setAllUpdates] = useState([]);
  const [allTimeline, setAllTimeline] = useState([]);
  const [allCosts, setAllCosts] = useState([]);
  const [allMaterials, setAllMaterials] = useState([]);
  const [allDocuments, setAllDocuments] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Active Project Selection (for sub-tab contexts)
  const [selectedProjId, setSelectedProjId] = useState('');

  // Modals visibility toggles
  const [showClientModal, setShowClientModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showDailyUpdateModal, setShowDailyUpdateModal] = useState(false);
  const [showCostModal, setShowCostModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);

  // Form State - Add Client
  const [cliName, setCliName] = useState('');
  const [cliEmail, setCliEmail] = useState('');
  const [cliPhone, setCliPhone] = useState('');
  const [invType, setInvType] = useState('auto_gen'); // Default auto-password Option B
  const [generatedPwd, setGeneratedPwd] = useState('');
  const [newClientProj, setNewClientProj] = useState({
    projectName: '',
    siteLocation: '',
    constructionType: 'Residential',
    startDate: new Date().toISOString().split('T')[0],
    estimatedFinish: '',
    budget: '',
    status: 'Active'
  });
  const [clientModalStep, setClientModalStep] = useState(1); 

  // Form State - Add Project (Only)
  const [projName, setProjName] = useState('');
  const [projLocation, setProjLocation] = useState('');
  const [projType, setProjType] = useState('Residential');
  const [projBudget, setProjBudget] = useState('');
  const [projStart, setProjStart] = useState(new Date().toISOString().split('T')[0]);
  const [projFinish, setProjFinish] = useState('');
  const [projStatus, setProjStatus] = useState('Active');
  const [projClientId, setProjClientId] = useState('');

  // Form State - Daily Site Update
  const [updDate, setUpdDate] = useState(new Date().toISOString().split('T')[0]);
  const [updLabor, setUpdLabor] = useState(1);
  const [updWorkCompleted, setUpdWorkCompleted] = useState('');
  const [updDelays, setUpdDelays] = useState('None');
  const [updRemarks, setUpdRemarks] = useState('');
  const [updPhotoUrl, setUpdPhotoUrl] = useState('');

  // Form State - Material Entry
  const [matName, setMatName] = useState('');
  const [matQty, setMatQty] = useState('');
  const [matVendor, setMatVendor] = useState('');
  const [matRate, setMatRate] = useState('');
  const [matInvoiceUrl, setMatInvoiceUrl] = useState('');

  // Form State - Timeline Milestone
  const [timeTask, setTimeTask] = useState('');
  const [timeDeadline, setTimeDeadline] = useState('');
  const [timePriority, setTimePriority] = useState('Medium');
  const [timeStatus, setTimeStatus] = useState('Pending');
  const [timeProgress, setTimeProgress] = useState(0);

  // Form State - Cost Management
  const [costItem, setCostItem] = useState('');
  const [costAmount, setCostAmount] = useState('');
  const [costCategory, setCostCategory] = useState('Materials');
  const [costStatus, setCostStatus] = useState('Pending');
  const [costInvoiceUrl, setCostInvoiceUrl] = useState('');

  // Form State - Document upload
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('Blueprint');
  const [docSize, setDocSize] = useState('2.4 MB');
  const [docUrl, setDocUrl] = useState('');

  const syncAllData = async () => {
    try {
      // 1. Load Projects
      const projs = await firebaseService.getProjects(currentUser.uid, currentUser.role);
      setProjects(projs);
      
      // Auto select project if selector blank
      if (projs.length > 0 && !selectedProjId) {
        setSelectedProjId(projs[0].id);
      }

      // 2. Load Clients list
      const clientsList = await firebaseService.getClientsForContractor(currentUser.uid);
      setAllClients(clientsList);

      // 3. Load notifications
      const notifs = await firebaseService.getNotifications(currentUser.uid, currentUser.role);
      setNotifications(notifs);

      // 4. Fetch sub-items from select project ID
      const targetProjId = selectedProjId || (projs.length > 0 ? projs[0].id : null);
      if (targetProjId) {
        const fetchUpdates = await firebaseService.getDailyUpdates(targetProjId);
        setAllUpdates(fetchUpdates);

        const fetchTimeline = await firebaseService.getTimeline(targetProjId);
        setAllTimeline(fetchTimeline);

        const fetchCosts = await firebaseService.getCosts(targetProjId);
        setAllCosts(fetchCosts);

        const fetchMaterials = await firebaseService.getMaterials(targetProjId);
        setAllMaterials(fetchMaterials);

        const fetchDocs = await firebaseService.getDocuments(targetProjId);
        setAllDocuments(fetchDocs);
      }
    } catch (e) {
      console.error("Data syncing failed", e);
    }
  };

  useEffect(() => {
    syncAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, selectedProjId]);

  // Handle invitation type temporary password creation
  useEffect(() => {
    if (invType === 'auto_gen') {
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
      let pwd = '';
      for (let i = 0; i < 9; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setGeneratedPwd(pwd);
    } else {
      setGeneratedPwd('');
    }
  }, [invType, showClientModal]);

  // --- Actions & Forms Submit handlers ---

  const handleCreateClient = async (e) => {
    e.preventDefault();
    if (!cliName || !cliEmail || !cliPhone || !newClientProj.projectName || !newClientProj.siteLocation) {
      alert('Please fill out all mandatory fields.');
      return;
    }

    const clientData = {
      name: cliName,
      email: cliEmail,
      phone: cliPhone,
      invitationType: invType,
      password: invType === 'auto_gen' ? generatedPwd : ''
    };

    try {
      await firebaseService.addClientAndProject(currentUser.uid, clientData, newClientProj);
      
      // Dispatch notification
      await firebaseService.addNotification(
        'new_proj',
        currentUser.uid,
        'all',
        'Client Account Setup',
        `Contractor registered client profile ${cliName}. Linked project: ${newClientProj.projectName}.`,
        'contractor'
      );

      setClientModalStep(2);
      syncAllData();
    } catch (err) {
      alert(err.message || 'Error configuring Client profile.');
    }
  };

  const handleCloseClientModal = () => {
    setShowClientModal(false);
    setClientModalStep(1);
    setCliName('');
    setCliEmail('');
    setCliPhone('');
    setInvType('auto_gen');
    setNewClientProj({
      projectName: '',
      siteLocation: '',
      constructionType: 'Residential',
      startDate: new Date().toISOString().split('T')[0],
      estimatedFinish: '',
      budget: '',
      status: 'Active'
    });
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!projClientId) {
      alert('Please choose a client.');
      return;
    }
    try {
      await firebaseService.addProjectOnly(currentUser.uid, projClientId, {
        projectName: projName,
        siteLocation: projLocation,
        constructionType: projType,
        budget: parseFloat(projBudget) || 0,
        startDate: projStart,
        estimatedFinish: projFinish,
        status: projStatus
      });

      await firebaseService.addNotification(
        'new_proj_add',
        currentUser.uid,
        projClientId,
        'Project Configured',
        `Project "${projName}" has been successfully added to your console scope.`,
        'client'
      );

      setShowProjectModal(false);
      setProjName('');
      setProjLocation('');
      setProjBudget('');
      setProjFinish('');
      setProjClientId('');
      syncAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddDailyUpdate = async (e) => {
    e.preventDefault();
    const photos = updPhotoUrl ? [updPhotoUrl] : [
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80'
    ];
    try {
      await firebaseService.addDailyUpdate(selectedProjId, currentUser.uid, {
        date: updDate,
        labourCount: parseInt(updLabor),
        workCompleted: updWorkCompleted,
        delays: updDelays,
        remarks: updRemarks,
        photos
      });

      const selectedProjName = projects.find(p => p.id === selectedProjId)?.projectName || 'Site Workspace';
      await firebaseService.addNotification(
        selectedProjId,
        currentUser.uid,
        projects.find(p => p.id === selectedProjId)?.clientId,
        'Daily Site Report Published',
        `Contractor logged update for ${updDate}. Work Completed: ${updWorkCompleted}.`,
        'client'
      );

      setShowDailyUpdateModal(false);
      setUpdLabor(1);
      setUpdWorkCompleted('');
      setUpdDelays('None');
      setUpdRemarks('');
      setUpdPhotoUrl('');
      syncAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    try {
      await firebaseService.addMaterial(selectedProjId, currentUser.uid, {
        name: matName,
        quantity: parseFloat(matQty) || 1,
        vendor: matVendor,
        rate: parseFloat(matRate) || 0,
        invoiceUrl: matInvoiceUrl
      });

      setShowMaterialModal(false);
      setMatName('');
      setMatQty('');
      setMatVendor('');
      setMatRate('');
      setMatInvoiceUrl('');
      syncAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddTimeline = async (e) => {
    e.preventDefault();
    try {
      await firebaseService.addTimelineTask(selectedProjId, currentUser.uid, {
        task: timeTask,
        deadline: timeDeadline,
        priority: timePriority,
        status: timeStatus,
        progress: timeProgress
      });

      setShowTimelineModal(false);
      setTimeTask('');
      setTimeDeadline('');
      setTimeProgress(0);
      syncAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateTimelineProgress = async (taskId, val) => {
    try {
      await firebaseService.updateTimelineProgress(taskId, val);
      syncAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddCost = async (e) => {
    e.preventDefault();
    try {
      await firebaseService.addCostItem(selectedProjId, currentUser.uid, {
        item: costItem,
        amount: parseFloat(costAmount),
        category: costCategory,
        status: costStatus,
        invoiceUrl: costInvoiceUrl
      });

      setShowCostModal(false);
      setCostItem('');
      setCostAmount('');
      setCostInvoiceUrl('');
      syncAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleCostStatus = async (costId, currentStatus) => {
    const nextStatus = currentStatus === 'Paid' ? 'Pending' : 'Paid';
    try {
      await firebaseService.updateCostStatus(costId, nextStatus);
      syncAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();
    try {
      await firebaseService.addDocument(selectedProjId, currentUser.uid, {
        name: docName,
        size: docSize,
        type: docType,
        fileUrl: docUrl
      });

      setShowDocModal(false);
      setDocName('');
      setDocUrl('');
      syncAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      await firebaseService.markNotificationRead(id);
      syncAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteTimeline = async (id) => {
    if (window.confirm('Remove this timeline milestone?')) {
      try {
        await firebaseService.deleteTimelineTask(id);
        syncAllData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleDeleteCost = async (id) => {
    if (window.confirm('Delete cost line item?')) {
      try {
        await firebaseService.deleteCostItem(id);
        syncAllData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // --- Overall Calculations ---
  const totalClientsCount = allClients.length;
  const activeProjectsCount = projects.filter(p => p.status === 'Active').length;
  const pendingTasksCount = allTimeline.filter(t => t.status !== 'Completed').length;
  const projectLaborCount = allUpdates.length > 0 ? allUpdates[0].labourCount || allUpdates[0].labour_count : 0;
  const materialsCostTotal = allCosts.filter(c => c.category === 'Materials').reduce((sum, item) => sum + item.amount, 0);

  const avgProgress = allTimeline.length > 0
    ? Math.round(allTimeline.reduce((sum, t) => sum + t.progress, 0) / allTimeline.length)
    : 0;

  // Chart Category expenses report
  const categorySummaryObj = allCosts.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + c.amount;
    return acc;
  }, {});
  const chartCostsData = Object.keys(categorySummaryObj).map(cat => ({
    category: cat,
    Amount: categorySummaryObj[cat]
  }));

  // Chart Labor count report
  const chartLaborTrend = [...allUpdates]
    .sort((a,b) => a.date.localeCompare(b.date))
    .slice(-8)
    .map(upd => ({
      date: upd.date,
      Laborers: upd.labourCount || upd.labour_count
    }));

  return (
    <div className="min-h-screen pb-20 bg-slate-950 dark:bg-slate-950 light:bg-slate-50 transition-colors duration-300">
      
      {/* Navbar Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80 light:bg-white/80 light:border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <HardHat className="h-5 w-5 animate-pulse-soft" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white dark:text-white light:text-slate-900 leading-none">ApexBuild SaaS</h1>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-sky-400">Contractor Hub</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-white dark:text-white light:text-slate-800">{currentUser.name}</p>
                <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">Enterprise Tenant</p>
              </div>
              <button
                onClick={logout}
                className="rounded-lg bg-slate-900 border border-slate-805 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-all dark:bg-slate-900 dark:border-slate-800 light:bg-slate-100 light:border-slate-300 light:text-slate-700 light:hover:text-slate-900"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Controls header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white dark:text-white light:text-slate-900 font-sans tracking-tight">Contractor Workspace</h2>
            <p className="text-xs text-slate-450 dark:text-slate-400 light:text-slate-500">Manage client relationships, sites, timelines, costs, and blueprints</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setClientModalStep(1);
                setShowClientModal(true);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 px-3.5 py-2 text-xs font-bold text-white transition-all shadow-lg shadow-sky-500/10"
            >
              <Plus className="h-4 w-4" /> Add Client Account
            </button>
            <button
              onClick={() => setShowProjectModal(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white px-3.5 py-2 text-xs font-bold transition-all dark:border-slate-800 dark:bg-slate-900 light:bg-white light:border-slate-300 light:text-slate-700 light:hover:text-slate-900"
            >
              <Plus className="h-4 w-4" /> Add New Project
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-850 dark:border-slate-800 light:border-slate-200 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Overview Metrics', icon: BarChart3 },
            { id: 'clients', label: 'Client Directory', icon: Users },
            { id: 'projects', label: 'Active Projects', icon: ClipboardList },
            { id: 'updates', label: 'Daily Site Logs', icon: Camera },
            { id: 'materials', label: 'Materials Ledger', icon: Package },
            { id: 'timeline', label: 'Timeline milestones', icon: Calendar },
            { id: 'costs', label: 'Cost invoices', icon: DollarSign },
            { id: 'documents', label: 'Blueprints Specs', icon: FileText },
            { id: 'notifications', label: `Notifications (${notifications.filter(n=>!n.read).length})`, icon: Bell }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
                  isActive 
                    ? 'border-sky-500 text-sky-400 font-bold bg-sky-500/5' 
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800 light:hover:text-slate-800'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Project Selector for Sub-tabs */}
        {activeTab !== 'overview' && activeTab !== 'clients' && activeTab !== 'notifications' && projects.length > 0 && (
          <div className="flex items-center gap-3 bg-slate-900/40 p-4 rounded-xl border border-slate-800/80 dark:bg-slate-900/40 dark:border-slate-800 light:bg-white light:border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 light:text-slate-600">Select Project:</span>
            <select
              value={selectedProjId}
              onChange={(e) => setSelectedProjId(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:bg-slate-100 light:border-slate-300 light:text-slate-900"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.projectName}</option>
              ))}
            </select>
          </div>
        )}

        {/* Tab Contents Renders */}
        <div className="min-h-[400px]">
          
          {/* TAB 1: OVERVIEW METRICS */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              
              {/* Core metrics cards */}
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
                
                <div className="glass-panel rounded-xl p-4 shadow-sm relative overflow-hidden dark:bg-slate-900/60 light:bg-white light:border-slate-200">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-450 light:text-slate-500">Total Clients</p>
                  <h3 className="mt-2 text-2xl font-extrabold text-white dark:text-white light:text-slate-900">{totalClientsCount}</h3>
                  <p className="text-[9px] text-slate-500 mt-2">Active business accounts</p>
                </div>

                <div className="glass-panel rounded-xl p-4 shadow-sm relative overflow-hidden dark:bg-slate-900/60 light:bg-white light:border-slate-200">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-450 light:text-slate-500">Active Projects</p>
                  <h3 className="mt-2 text-2xl font-extrabold text-sky-400">{activeProjectsCount}</h3>
                  <p className="text-[9px] text-slate-500 mt-2">Ongoing site operations</p>
                </div>

                <div className="glass-panel rounded-xl p-4 shadow-sm relative overflow-hidden dark:bg-slate-900/60 light:bg-white light:border-slate-200">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-450 light:text-slate-500">Pending Tasks</p>
                  <h3 className="mt-2 text-2xl font-extrabold text-amber-500">{pendingTasksCount}</h3>
                  <p className="text-[9px] text-slate-500 mt-2">Milestones in progress</p>
                </div>

                <div className="glass-panel rounded-xl p-4 shadow-sm relative overflow-hidden dark:bg-slate-900/60 light:bg-white light:border-slate-200">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-450 light:text-slate-500">Labour Count</p>
                  <h3 className="mt-2 text-2xl font-extrabold text-emerald-400">{projectLaborCount}</h3>
                  <p className="text-[9px] text-slate-500 mt-2">Workers on site today</p>
                </div>

                <div className="glass-panel rounded-xl p-4 shadow-sm relative overflow-hidden dark:bg-slate-900/60 light:bg-white light:border-slate-200">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-450 light:text-slate-500">Materials Spent</p>
                  <h3 className="mt-2 text-xl font-extrabold text-indigo-400">${materialsCostTotal.toLocaleString()}</h3>
                  <p className="text-[9px] text-slate-500 mt-2">Aggregated supplies</p>
                </div>

                <div className="glass-panel rounded-xl p-4 shadow-sm relative overflow-hidden dark:bg-slate-900/60 light:bg-white light:border-slate-200">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-450 light:text-slate-500">Project Progress</p>
                  <h3 className="mt-2 text-2xl font-extrabold text-white dark:text-white light:text-slate-900">{avgProgress}%</h3>
                  <p className="text-[9px] text-slate-500 mt-2">Average schedules check</p>
                </div>

              </section>

              {/* Overview visual reports charts */}
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Cost allocation bar chart */}
                <div className="glass-panel rounded-2xl p-6 shadow-sm dark:bg-slate-900/60 light:bg-white light:border-slate-200 flex flex-col justify-between min-h-[300px]">
                  <div>
                    <h4 className="text-sm font-bold text-white dark:text-white light:text-slate-900">Expenses Allocation by Category</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Aggregated costs across your client projects</p>
                  </div>
                  <div className="h-60 w-full mt-4">
                    {chartCostsData.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-12">No expense lines registered yet.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartCostsData}>
                          <XAxis dataKey="category" stroke="#64748b" fontSize={10} />
                          <YAxis stroke="#64748b" fontSize={10} />
                          <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, 'Spent']} />
                          <Bar dataKey="Amount" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Labor trend line chart */}
                <div className="glass-panel rounded-2xl p-6 shadow-sm dark:bg-slate-900/60 light:bg-white light:border-slate-200 flex flex-col justify-between min-h-[300px]">
                  <div>
                    <h4 className="text-sm font-bold text-white dark:text-white light:text-slate-900">Daily Labour Staffing Curve</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Workforce presence timeline from reports</p>
                  </div>
                  <div className="h-60 w-full mt-4">
                    {chartLaborTrend.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-12">Log site updates to generate graphs.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartLaborTrend}>
                          <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                          <YAxis stroke="#64748b" fontSize={10} />
                          <Tooltip formatter={(v) => [`${v} Workers`, 'Laborers']} />
                          <Line type="monotone" dataKey="Laborers" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

              </section>
            </div>
          )}

          {/* TAB 2: CLIENT DIRECTORY */}
          {activeTab === 'clients' && (
            <div className="glass-panel rounded-2xl p-6 shadow-sm dark:bg-slate-900/60 light:bg-white light:border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div>
                  <h3 className="text-md font-bold text-white dark:text-white light:text-slate-900">Clients Registry</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-500">Directory of user profiles representing private project tenants</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 uppercase font-bold tracking-wider">
                      <th className="py-3 px-2">Client Profile</th>
                      <th className="py-3 px-2">Login Email</th>
                      <th className="py-3 px-2">Phone</th>
                      <th className="py-3 px-2">Linked Site Project</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 dark:divide-slate-850 light:divide-slate-200">
                    {allClients.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-500 font-semibold">
                          No client profiles registered. Click "Add Client Account" above.
                        </td>
                      </tr>
                    ) : (
                      allClients.map((client) => {
                        const linkedProj = projects.find(p => p.clientId === client.id || p.clientId === client.uid);
                        return (
                          <tr key={client.id || client.uid} className="hover:bg-slate-900/30">
                            <td className="py-3.5 px-2 font-semibold text-white dark:text-white light:text-slate-800 flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-emerald-400" />
                              {client.name}
                            </td>
                            <td className="py-3.5 px-2 text-slate-300 dark:text-slate-300 light:text-slate-700 font-mono">{client.email}</td>
                            <td className="py-3.5 px-2 text-slate-400">{client.phone}</td>
                            <td className="py-3.5 px-2 font-semibold text-sky-400">
                              {linkedProj ? (
                                <span className="hover:underline cursor-pointer" onClick={() => {
                                  setSelectedProjId(linkedProj.id);
                                  setActiveTab('projects');
                                }}>
                                  {linkedProj.projectName}
                                </span>
                              ) : (
                                <span className="text-slate-500">Unlinked</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PROJECTS LIST */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="border-b border-slate-900 pb-3">
                <h3 className="text-md font-bold text-white dark:text-white light:text-slate-900">Assigned Projects Workspaces</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-500">Checklists and progress records by construction location</p>
              </div>

              {projects.length === 0 ? (
                <div className="glass-panel rounded-xl p-12 text-center text-slate-500 dark:bg-slate-900/60 light:bg-white light:border-slate-200">
                  <ClipboardList className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                  <p className="font-semibold text-slate-300 dark:text-slate-350 light:text-slate-800">No projects configured.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {projects.map((proj) => {
                    const client = allClients.find(c => c.id === proj.clientId || c.uid === proj.clientId);
                    return (
                      <div key={proj.id} className="glass-panel rounded-xl p-5 hover:border-slate-750 transition-all flex flex-col justify-between space-y-4 dark:bg-slate-900/60 light:bg-white light:border-slate-200">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-extrabold text-white dark:text-white light:text-slate-900 text-sm sm:text-md leading-tight">{proj.projectName}</h4>
                            <span className="text-[9px] font-extrabold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded uppercase">{proj.status}</span>
                          </div>
                          <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" /> {proj.siteLocation}</p>
                          <div className="text-[11px] text-slate-500">Construction Type: {proj.constructionType || 'Residential'}</div>
                          
                          {client && (
                            <div className="mt-3 bg-slate-950/45 p-2 rounded border border-slate-900 text-xs">
                              <span className="text-[10px] font-bold text-slate-500 block uppercase">Client Profile</span>
                              <span className="font-semibold text-slate-300 dark:text-slate-300 light:text-slate-800 block mt-0.5">{client.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono">{client.email}</span>
                            </div>
                          )}
                        </div>

                        <div className="pt-3 border-t border-slate-900/60 space-y-2.5 text-xs text-slate-500">
                          <div className="flex justify-between font-semibold">
                            <span>Budget Sheet:</span>
                            <span className="text-white dark:text-white light:text-slate-900 font-mono">${proj.budget?.toLocaleString() || '0'}</span>
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span>Duration: {proj.startDate} to {proj.deadline}</span>
                            <button
                              onClick={() => {
                                setSelectedProjId(proj.id);
                                setActiveTab('updates');
                              }}
                              className="text-sky-400 font-bold hover:underline"
                            >
                              Manage Site
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DAILY SITE UPDATES */}
          {activeTab === 'updates' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <div>
                  <h3 className="text-md font-bold text-white dark:text-white light:text-slate-900">Daily Site Progress Reports</h3>
                  <p className="text-xs text-slate-400">Chronological logs of labor force presence and construction notes</p>
                </div>
                <button
                  onClick={() => setShowDailyUpdateModal(true)}
                  className="flex items-center gap-1 rounded bg-sky-500 hover:bg-sky-600 px-3 py-1.5 text-xs font-bold text-white transition-colors"
                >
                  <Plus className="h-4 w-4" /> Log Daily Update
                </button>
              </div>

              {allUpdates.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">No daily updates reported for this project. Log one above.</p>
              ) : (
                <div className="space-y-4">
                  {allUpdates.map((upd) => (
                    <div key={upd.id} className="glass-panel rounded-2xl p-6 shadow-sm space-y-4 dark:bg-slate-900/60 light:bg-white light:border-slate-205">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-900/80 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white dark:text-white light:text-slate-900 text-sm">Site Progress Update</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-xs text-slate-400">{upd.date}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs font-bold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded">Laborers: {upd.labourCount || upd.labour_count}</span>
                          {upd.delays && upd.delays !== 'None' && (
                            <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> Delay: {upd.delays}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-xs sm:text-sm text-slate-300 dark:text-slate-300 light:text-slate-700 leading-relaxed whitespace-pre-line space-y-2">
                        {upd.notes ? (
                          <p>{upd.notes}</p>
                        ) : (
                          <div className="space-y-2.5">
                            <div><span className="font-bold text-slate-400">Work Completed:</span> {upd.workCompleted}</div>
                            {upd.remarks && <div><span className="font-bold text-slate-400">Remarks:</span> {upd.remarks}</div>}
                          </div>
                        )}
                      </div>

                      {upd.photos && upd.photos.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-900">
                          {upd.photos.map((ph, idx) => (
                            <img
                              key={idx}
                              src={ph}
                              alt="Site progress"
                              className="aspect-video w-full object-cover rounded-lg border border-slate-800 hover:border-slate-750 transition-colors cursor-zoom-in"
                              onClick={() => window.open(ph, '_blank')}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: MATERIALS LEDGER */}
          {activeTab === 'materials' && (
            <div className="glass-panel rounded-2xl p-6 shadow-sm dark:bg-slate-900/60 light:bg-white light:border-slate-200 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <div>
                  <h3 className="text-md font-bold text-white dark:text-white light:text-slate-900">Materials Ledger</h3>
                  <p className="text-xs text-slate-400">Detailed accounting of material orders, quantities, rates, and suppliers</p>
                </div>
                <button
                  onClick={() => setShowMaterialModal(true)}
                  className="flex items-center gap-1 rounded bg-sky-500 hover:bg-sky-600 px-3 py-1.5 text-xs font-bold text-white transition-colors"
                >
                  <Plus className="h-4 w-4" /> Add Material Entry
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 uppercase font-bold tracking-wider">
                      <th className="py-2.5 px-2">Material Name</th>
                      <th className="py-2.5 px-2">Quantity</th>
                      <th className="py-2.5 px-2">Vendor / Supplier</th>
                      <th className="py-2.5 px-2">Unit Rate</th>
                      <th className="py-2.5 px-2">Total Amount</th>
                      <th className="py-2.5 px-2 text-right">Receipt File</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 dark:divide-slate-850 light:divide-slate-200">
                    {allMaterials.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-550">No material invoices logged. Click Add Material.</td>
                      </tr>
                    ) : (
                      allMaterials.map((mat) => (
                        <tr key={mat.id} className="hover:bg-slate-900/30">
                          <td className="py-3 px-2 font-semibold text-white dark:text-white light:text-slate-850">{mat.name}</td>
                          <td className="py-3 px-2 text-slate-300 dark:text-slate-300 light:text-slate-700">{mat.quantity}</td>
                          <td className="py-3 px-2 text-slate-400">{mat.vendor}</td>
                          <td className="py-3 px-2 font-mono text-slate-350">${mat.rate?.toLocaleString() || '0'}</td>
                          <td className="py-3 px-2 font-bold font-mono text-sky-400">${mat.total?.toLocaleString() || '0'}</td>
                          <td className="py-3 px-2 text-right">
                            {mat.invoiceUrl ? (
                              <a
                                href={mat.invoiceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded hover:bg-sky-500/20 transition-all font-bold"
                              >
                                <Paperclip className="h-3 w-3" /> View Invoice
                              </a>
                            ) : (
                              <span className="text-slate-600">None attached</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: TIMELINE MILESTONES */}
          {activeTab === 'timeline' && (
            <div className="glass-panel rounded-2xl p-6 shadow-sm dark:bg-slate-900/60 light:bg-white light:border-slate-200 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <div>
                  <h3 className="text-md font-bold text-white dark:text-white light:text-slate-900">Timeline Milestone Board</h3>
                  <p className="text-xs text-slate-400">Map and prioritize deliverables, dates, and schedules</p>
                </div>
                <button
                  onClick={() => setShowTimelineModal(true)}
                  className="flex items-center gap-1 rounded bg-sky-500 hover:bg-sky-600 px-3 py-1.5 text-xs font-bold text-white transition-colors"
                >
                  <Plus className="h-4 w-4" /> Add Task
                </button>
              </div>

              <div className="space-y-4">
                {allTimeline.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No milestones scheduled. Click Add Task above.</p>
                ) : (
                  allTimeline.map((task) => (
                    <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/40 border border-slate-900 rounded-xl p-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-white dark:text-white light:text-slate-900">{task.task}</span>
                          {task.progress === 100 && <CheckCircle2 className="h-4 w-4 text-emerald-450" />}
                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                            task.priority === 'High' 
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                              : task.priority === 'Medium'
                                ? 'bg-amber-500/10 text-amber-450 border-amber-500/20'
                                : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                          }`}>
                            {task.priority} Priority
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-4">
                          <span>Deadline: {task.deadline}</span>
                          <span>•</span>
                          <span className="capitalize">Status: {task.status}</span>
                        </div>
                      </div>

                      {/* Controls right */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={task.progress}
                            onChange={(e) => handleUpdateTimelineProgress(task.id, e.target.value)}
                            className="w-24 sm:w-32 accent-sky-500 bg-slate-900 h-1.5 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-xs font-bold text-slate-300 font-mono w-8">{task.progress}%</span>
                        </div>

                        <button
                          onClick={() => handleDeleteTimeline(task.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 border border-transparent hover:border-slate-800 rounded transition-colors"
                          title="Remove milestone"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 7: COST MANAGEMENT */}
          {activeTab === 'costs' && (
            <div className="glass-panel rounded-2xl p-6 shadow-sm dark:bg-slate-900/60 light:bg-white light:border-slate-200 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <div>
                  <h3 className="text-md font-bold text-white dark:text-white light:text-slate-900">Cost Accounts</h3>
                  <p className="text-xs text-slate-400">Track structural permits, equipment logs, and subcontracting expenses</p>
                </div>
                <button
                  onClick={() => setShowCostModal(true)}
                  className="flex items-center gap-1 rounded bg-sky-500 hover:bg-sky-600 px-3 py-1.5 text-xs font-bold text-white transition-colors"
                >
                  <Plus className="h-4 w-4" /> Add Expense
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/40 border-b border-slate-900 text-slate-500 uppercase font-bold tracking-wider">
                      <th className="py-2.5 px-3">Expense item</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Price</th>
                      <th className="py-2.5 px-3">Payment</th>
                      <th className="py-2.5 px-3">Invoice</th>
                      <th className="py-2.5 px-3 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 dark:divide-slate-850 light:divide-slate-200 bg-slate-950/10">
                    {allCosts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-550">No expenses recorded. Add one above.</td>
                      </tr>
                    ) : (
                      allCosts.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-900/30">
                          <td className="py-3 px-3 font-semibold text-white dark:text-white light:text-slate-800">{c.item_name || c.item}</td>
                          <td className="py-3 px-3 text-slate-400">{c.category}</td>
                          <td className="py-3 px-3 font-bold font-mono text-white dark:text-white light:text-slate-900">${c.amount?.toLocaleString() || '0'}</td>
                          <td className="py-3 px-3">
                            <button
                              onClick={() => handleToggleCostStatus(c.id, c.status)}
                              className={`px-2 py-0.5 rounded-[4px] text-[10px] font-extrabold uppercase border cursor-pointer ${
                                c.status === 'Paid'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                                  : 'bg-amber-500/10 text-amber-450 border-amber-500/25'
                              }`}
                            >
                              {c.status}
                            </button>
                          </td>
                          <td className="py-3 px-3">
                            {c.invoiceUrl ? (
                              <a
                                href={c.invoiceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-sky-400 hover:underline"
                              >
                                <Paperclip className="h-3 w-3" /> Invoice
                              </a>
                            ) : (
                              <span className="text-slate-650">No file</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleDeleteCost(c.id)}
                              className="text-slate-500 hover:text-rose-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: DOCUMENT CENTER */}
          {activeTab === 'documents' && (
            <div className="glass-panel rounded-2xl p-6 shadow-sm dark:bg-slate-900/60 light:bg-white light:border-slate-200 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <div>
                  <h3 className="text-md font-bold text-white dark:text-white light:text-slate-900">Document Center</h3>
                  <p className="text-xs text-slate-400">Share contracts, plans, drawings, and specs with the client</p>
                </div>
                <button
                  onClick={() => setShowDocModal(true)}
                  className="flex items-center gap-1 rounded bg-sky-500 hover:bg-sky-600 px-3 py-1.5 text-xs font-bold text-white transition-colors"
                >
                  <Plus className="h-4 w-4" /> Upload Document
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {allDocuments.length === 0 ? (
                  <p className="col-span-2 text-xs text-slate-550 text-center py-6">No files hosted. Click upload document.</p>
                ) : (
                  allDocuments.map((doc) => (
                    <div key={doc.id} className="bg-slate-950/40 border border-slate-900/80 rounded-xl p-4 flex items-center justify-between hover:border-slate-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-xs text-white dark:text-white light:text-slate-900 truncate max-w-[180px] sm:max-w-[240px]" title={doc.name}>
                            {doc.name}
                          </h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">{doc.size || '1.5 MB'} • {doc.type}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => alert(`Simulated downloading "${doc.name}"`)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors"
                        title="Download file"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 9: NOTIFICATIONS PANEL */}
          {activeTab === 'notifications' && (
            <div className="glass-panel rounded-2xl p-6 shadow-sm dark:bg-slate-900/60 light:bg-white light:border-slate-200 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                <Bell className="h-5 w-5 text-sky-400" />
                <div>
                  <h3 className="text-md font-bold text-white dark:text-white light:text-slate-900">Recent Notifications</h3>
                  <p className="text-[10px] text-slate-550">Audit logs of client logins and project milestones</p>
                </div>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-550 py-6 text-center">No alerts in your inbox.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`rounded-xl border p-4 flex items-start justify-between gap-4 transition-all ${
                        n.read
                          ? 'border-slate-900 bg-slate-950/20'
                          : 'border-sky-500/20 bg-sky-500/5 shadow-md shadow-sky-500/2'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-white dark:text-white light:text-slate-900">{n.title}</h4>
                          {!n.read && <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />}
                        </div>
                        <p className="text-xs text-slate-400 leading-normal">{n.message}</p>
                        <span className="text-[10px] text-slate-500 block pt-1">{n.date}</span>
                      </div>
                      
                      {!n.read && (
                        <button
                          onClick={() => handleMarkNotificationRead(n.id)}
                          className="text-[10px] font-bold text-sky-450 hover:underline shrink-0"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

      </main>

      {/* MODAL 1: Add Client Form (Includes project settings) */}
      {showClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl overflow-y-auto max-h-[90vh] dark:border-slate-800 dark:bg-slate-900 light:bg-white light:border-slate-300">
            <div className="flex items-center justify-between border-b border-slate-800 dark:border-slate-800 light:border-slate-200 pb-3">
              <h3 className="font-bold text-white dark:text-slate-900 text-lg">Add New Client Account</h3>
              <button
                onClick={handleCloseClientModal}
                className="rounded p-1 text-slate-400 hover:text-white font-bold"
              >
                &times;
              </button>
            </div>

            {clientModalStep === 1 ? (
              <form onSubmit={handleCreateClient} className="mt-4 space-y-6">
                
                {/* User Info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-sky-400 uppercase tracking-wider">Client Profile Details</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 dark:text-slate-400 light:text-slate-650 mb-1">Client Full Name</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Alice Smith"
                        value={cliName}
                        onChange={(e) => setCliName(e.target.value)}
                        className="w-full rounded border border-slate-705 bg-slate-950 px-3 py-1.5 text-sm text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:border-slate-300 light:bg-slate-100 light:text-slate-905"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 dark:text-slate-400 light:text-slate-650 mb-1">Email Address</label>
                      <input 
                        type="email" 
                        required 
                        placeholder="alice@gmail.com"
                        value={cliEmail}
                        onChange={(e) => setCliEmail(e.target.value)}
                        className="w-full rounded border border-slate-705 bg-slate-950 px-3 py-1.5 text-sm text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:border-slate-300 light:bg-slate-100 light:text-slate-905"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 dark:text-slate-400 light:text-slate-650 mb-1">Phone Number</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="+1 (555) 231-9088"
                      value={cliPhone}
                      onChange={(e) => setCliPhone(e.target.value)}
                      className="w-full rounded border border-slate-705 bg-slate-950 px-3 py-1.5 text-sm text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:border-slate-300 light:bg-slate-100 light:text-slate-905"
                    />
                  </div>
                </div>

                {/* Password invitation */}
                <div className="space-y-4 border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 pt-4">
                  <h4 className="text-xs font-semibold text-sky-400 uppercase tracking-wider">Credentials Setup Method</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className={`flex flex-col p-4 rounded-lg border cursor-pointer transition-all ${
                      invType === 'email_invite' ? 'border-sky-500 bg-sky-500/5' : 'border-slate-800 bg-slate-950/40 dark:border-slate-800 dark:bg-slate-950/40 light:border-slate-300'
                    }`}>
                      <input 
                        type="radio" 
                        name="invType" 
                        value="email_invite" 
                        checked={invType === 'email_invite'} 
                        onChange={() => setInvType('email_invite')}
                        className="sr-only"
                      />
                      <span className="font-bold text-xs text-white dark:text-slate-800">Option A: Email Invitation (Invite link)</span>
                      <span className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                        Dispatches invitation email. Client configures password on click.
                      </span>
                    </label>

                    <label className={`flex flex-col p-4 rounded-lg border cursor-pointer transition-all ${
                      invType === 'auto_gen' ? 'border-sky-500 bg-sky-500/5' : 'border-slate-800 bg-slate-950/40 dark:border-slate-800 dark:bg-slate-950/40 light:border-slate-300'
                    }`}>
                      <input 
                        type="radio" 
                        name="invType" 
                        value="auto_gen" 
                        checked={invType === 'auto_gen'} 
                        onChange={() => setInvType('auto_gen')}
                        className="sr-only"
                      />
                      <span className="font-bold text-xs text-white dark:text-slate-800">Option B: Auto-Password (Quick credential)</span>
                      <span className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                        Auto-generates temporary password. forces password change on first login.
                      </span>
                    </label>
                  </div>
                </div>

                {/* Project details */}
                <div className="space-y-4 border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 pt-4">
                  <h4 className="text-xs font-semibold text-sky-400 uppercase tracking-wider">Project Configuration</h4>
                  
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 dark:text-slate-400 light:text-slate-650 mb-1">Project Name</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Modern Residential Villa"
                      value={newClientProj.projectName}
                      onChange={(e) => setNewClientProj({...newClientProj, projectName: e.target.value})}
                      className="w-full rounded border border-slate-705 bg-slate-950 px-3 py-1.5 text-sm text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:border-slate-300 light:bg-slate-100 light:text-slate-905"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 dark:text-slate-400 light:text-slate-650 mb-1">Site Address Location</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. 128 Ocean Dr, Miami, FL"
                        value={newClientProj.siteLocation}
                        onChange={(e) => setNewClientProj({...newClientProj, siteLocation: e.target.value})}
                        className="w-full rounded border border-slate-705 bg-slate-950 px-3 py-1.5 text-sm text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:border-slate-300 light:bg-slate-100 light:text-slate-905"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 dark:text-slate-400 light:text-slate-650 mb-1">Expected Completion</label>
                      <input 
                        type="date" 
                        required
                        value={newClientProj.estimatedFinish}
                        onChange={(e) => setNewClientProj({...newClientProj, estimatedFinish: e.target.value})}
                        className="w-full rounded border border-slate-705 bg-slate-950 px-3 py-1.5 text-sm text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:border-slate-300 light:bg-slate-100 light:text-slate-905"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 dark:text-slate-400 light:text-slate-650 mb-1">Project Budget ($)</label>
                      <input 
                        type="number" 
                        required 
                        placeholder="180000"
                        value={newClientProj.budget}
                        onChange={(e) => setNewClientProj({...newClientProj, budget: e.target.value})}
                        className="w-full rounded border border-slate-705 bg-slate-950 px-3 py-1.5 text-sm text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:border-slate-300 light:bg-slate-100 light:text-slate-905"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 dark:text-slate-400 light:text-slate-650 mb-1">Construction Type</label>
                      <select
                        value={newClientProj.constructionType}
                        onChange={(e) => setNewClientProj({...newClientProj, constructionType: e.target.value})}
                        className="w-full rounded border border-slate-705 bg-slate-950 px-3 py-1.5 text-sm text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:border-slate-305 light:bg-slate-100 light:text-slate-900"
                      >
                        <option value="Residential">Residential Villa</option>
                        <option value="Commercial">Commercial Office</option>
                        <option value="Industrial">Industrial Plant</option>
                        <option value="Renovation">Renovation / Addition</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseClientModal}
                    className="flex-1 rounded border border-slate-800 dark:border-slate-800 bg-slate-900 py-2.5 text-xs font-bold text-slate-300 light:bg-slate-100 light:border-slate-300 light:text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded bg-sky-500 py-2.5 text-xs font-bold text-white hover:bg-sky-600 transition-colors"
                  >
                    Create Client Account
                  </button>
                </div>

              </form>
            ) : (
              <div className="mt-6 text-center space-y-6 py-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-450">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                
                <div>
                  <h4 className="text-md font-bold text-white dark:text-slate-900">Client Account Provisioned!</h4>
                  <p className="text-xs text-slate-400 mt-1">Project Linked to {cliName}</p>
                </div>

                {invType === 'email_invite' ? (
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-900 dark:border-slate-800 text-left light:bg-slate-100 light:border-slate-300">
                    <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block mb-2">Option A - Invitation Sent</span>
                    <p className="text-xs text-slate-300 light:text-slate-750 leading-relaxed">
                      An invitation setup email has been triggered. Client will configure password via welcome link captured in the bottom-right Simulated Email drawer.
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-900 dark:border-slate-800 text-left space-y-3 light:bg-slate-100 light:border-slate-300">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Option B - Credentials Created</span>
                    <p className="text-xs text-slate-305 light:text-slate-750">
                      Provide details to client. First login password update is strictly required:
                    </p>
                    <div className="space-y-1.5 font-mono text-xs text-slate-300 light:text-slate-700">
                      <div><span className="text-slate-500">Email:</span> <span className="font-semibold text-white dark:text-slate-900">{cliEmail}</span></div>
                      <div><span className="text-slate-500">Temp Password:</span> <span className="text-amber-450 font-bold">{generatedPwd}</span></div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleCloseClientModal}
                  className="w-full rounded bg-sky-500 py-2.5 text-xs font-bold text-white hover:bg-sky-600"
                >
                  Done & Close
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL 2: Add Project Form (Only) */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 light:bg-white light:border-slate-300">
            <div className="flex items-center justify-between border-b border-slate-800 dark:border-slate-850 light:border-slate-200 pb-3">
              <h3 className="font-bold text-white dark:text-slate-900 text-md">Add Project Form</h3>
              <button onClick={() => setShowProjectModal(false)} className="text-slate-400 hover:text-white font-bold">&times;</button>
            </div>

            <form onSubmit={handleAddProject} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-305 dark:text-slate-400 light:text-slate-600 mb-1">Select Client Account</label>
                <select
                  required
                  value={projClientId}
                  onChange={(e) => setProjClientId(e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:bg-slate-100 light:border-slate-300 light:text-slate-900"
                >
                  <option value="">-- Choose client profile --</option>
                  {allClients.map(c => (
                    <option key={c.id || c.uid} value={c.id || c.uid}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-305 dark:text-slate-400 light:text-slate-600 mb-1">Project Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Stark Tower Retrofit"
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:border-slate-300 light:bg-slate-100 light:text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-305 dark:text-slate-400 light:text-slate-600 mb-1">Site Location Address</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. 505 Palm Ave, Austin, TX"
                  value={projLocation}
                  onChange={(e) => setProjLocation(e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:border-slate-300 light:bg-slate-100 light:text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-305 dark:text-slate-400 light:text-slate-600 mb-1">Budget ($)</label>
                  <input 
                    type="number" 
                    required 
                    placeholder="90000"
                    value={projBudget}
                    onChange={(e) => setProjBudget(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:border-slate-300 light:bg-slate-100 light:text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-305 dark:text-slate-400 light:text-slate-600 mb-1">Construction Type</label>
                  <select
                    value={projType}
                    onChange={(e) => setProjType(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:border-slate-300 light:bg-slate-100 light:text-slate-900"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Renovation">Renovation</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-355 dark:text-slate-400 light:text-slate-600 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    required 
                    value={projStart}
                    onChange={(e) => setProjStart(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:border-slate-300 light:bg-slate-100 light:text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-355 dark:text-slate-400 light:text-slate-600 mb-1">Deadline Date</label>
                  <input 
                    type="date" 
                    required 
                    value={projFinish}
                    onChange={(e) => setProjFinish(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:border-slate-300 light:bg-slate-100 light:text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="flex-1 rounded border border-slate-800 bg-slate-900 py-2 text-xs font-bold text-slate-300 light:bg-slate-105 light:border-slate-300 light:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded bg-sky-500 py-2 text-xs font-bold text-white hover:bg-sky-600"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DAILY SITE UPDATE FORM */}
      {showDailyUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl dark:border-slate-850 dark:bg-slate-900 light:bg-white light:border-slate-300">
            <div className="flex items-center justify-between border-b border-slate-800 dark:border-slate-850 pb-3">
              <h3 className="font-bold text-white dark:text-slate-900 text-md">Daily Site Update Form</h3>
              <button onClick={() => setShowDailyUpdateModal(false)} className="text-slate-400 hover:text-white font-bold">&times;</button>
            </div>

            <form onSubmit={handleAddDailyUpdate} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 dark:text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={updDate}
                    onChange={(e) => setUpdDate(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:bg-slate-100 light:border-slate-300 light:text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 dark:text-slate-400 mb-1">Labour Count</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={updLabor}
                    onChange={(e) => setUpdLabor(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:bg-slate-100 light:border-slate-300 light:text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 dark:text-slate-400 mb-1">Work Completed</label>
                <textarea
                  required
                  rows="2"
                  placeholder="e.g. Masonry tiling layout slab completed."
                  value={updWorkCompleted}
                  onChange={(e) => setUpdWorkCompleted(e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:bg-slate-100 light:border-slate-300 light:text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 dark:text-slate-400 mb-1">Issues / Delays</label>
                  <select
                    value={updDelays}
                    onChange={(e) => setUpdDelays(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:bg-slate-100 light:border-slate-300 light:text-slate-900"
                  >
                    <option value="None">No Issues (On Track)</option>
                    <option value="Weather">Weather Delay</option>
                    <option value="Materials">Materials Shortage</option>
                    <option value="Subcontractor">Subcontractor Absence</option>
                    <option value="Permit">Inspection Wait</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 dark:text-slate-400 mb-1">Remarks</label>
                  <input
                    type="text"
                    placeholder="General comments..."
                    value={updRemarks}
                    onChange={(e) => setUpdRemarks(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:bg-slate-100 light:border-slate-300 light:text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 dark:text-slate-400 mb-1">Upload Work Photos URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/site.jpg"
                  value={updPhotoUrl}
                  onChange={(e) => setUpdPhotoUrl(e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:bg-slate-100 light:border-slate-300 light:text-slate-900"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDailyUpdateModal(false)}
                  className="flex-1 rounded border border-slate-800 bg-slate-900 py-2 text-xs font-bold text-slate-300 light:bg-slate-100 light:border-slate-300 light:text-slate-755"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded bg-sky-500 py-2 text-xs font-bold text-white hover:bg-sky-600"
                >
                  Log Site Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: MATERIAL ENTRY FORM */}
      {showMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-905 p-6 shadow-2xl dark:border-slate-850 dark:bg-slate-900 light:bg-white light:border-slate-300">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white dark:text-slate-900 text-md">Material Entry Form</h3>
              <button onClick={() => setShowMaterialModal(false)} className="text-slate-400 hover:text-white font-bold">&times;</button>
            </div>

            <form onSubmit={handleAddMaterial} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 dark:text-slate-400 mb-1">Material Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Copper wiring reels"
                  value={matName}
                  onChange={(e) => setMatName(e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:bg-slate-100 light:border-slate-300 light:text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 dark:text-slate-400 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 5"
                    value={matQty}
                    onChange={(e) => setMatQty(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:bg-slate-100 light:border-slate-300 light:text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-305 dark:text-slate-400 mb-1">Unit Rate ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="300"
                    value={matRate}
                    onChange={(e) => setMatRate(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:bg-slate-100 light:border-slate-300 light:text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-305 dark:text-slate-400 mb-1">Vendor / Supplier</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Electrical Supplies"
                  value={matVendor}
                  onChange={(e) => setMatVendor(e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:bg-slate-100 light:border-slate-300 light:text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-305 dark:text-slate-400 mb-1">Invoice Receipt URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/invoice.pdf"
                  value={matInvoiceUrl}
                  onChange={(e) => setMatInvoiceUrl(e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:bg-slate-100 light:border-slate-300 light:text-slate-900"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowMaterialModal(false)}
                  className="flex-1 rounded border border-slate-800 bg-slate-900 py-2 text-xs font-bold text-slate-300 light:bg-slate-100 light:border-slate-300 light:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded bg-sky-500 py-2 text-xs font-bold text-white hover:bg-sky-600"
                >
                  Log Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: TIMELINE MANAGEMENT (Milestone task form) */}
      {showTimelineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl dark:border-slate-850 dark:bg-slate-900 light:bg-white light:border-slate-300">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white dark:text-slate-900 text-md">Add Milestone Task</h3>
              <button onClick={() => setShowTimelineModal(false)} className="text-slate-400 hover:text-white font-bold">&times;</button>
            </div>

            <form onSubmit={handleAddTimeline} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 dark:text-slate-400 mb-1">Task Description Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electrical panel board hook-up"
                  value={timeTask}
                  onChange={(e) => setTimeTask(e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:bg-slate-100 light:border-slate-300 light:text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 dark:text-slate-400 mb-1">Deadline Date</label>
                  <input
                    type="date"
                    required
                    value={timeDeadline}
                    onChange={(e) => setTimeDeadline(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:bg-slate-100 light:border-slate-300 light:text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 dark:text-slate-400 mb-1">Priority</label>
                  <select
                    value={timePriority}
                    onChange={(e) => setTimePriority(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:bg-slate-100 light:border-slate-300 light:text-slate-900"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 dark:text-slate-400 mb-1">Timeline Status</label>
                  <select
                    value={timeStatus}
                    onChange={(e) => setTimeStatus(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:bg-slate-100 light:border-slate-300 light:text-slate-900"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 dark:text-slate-400 mb-1">Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={timeProgress}
                    onChange={(e) => setTimeProgress(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:bg-slate-100 light:border-slate-300 light:text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowTimelineModal(false)}
                  className="flex-1 rounded border border-slate-800 bg-slate-900 py-2 text-xs font-bold text-slate-300 light:bg-slate-100 light:border-slate-300 light:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded bg-sky-500 py-2 text-xs font-bold text-white hover:bg-sky-600"
                >
                  Schedule Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: COST MANAGEMENT FORM */}
      {showCostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl dark:border-slate-850 dark:bg-slate-900 light:bg-white light:border-slate-300">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white dark:text-slate-900 text-md">Add Expense Account</h3>
              <button onClick={() => setShowCostModal(false)} className="text-slate-400 hover:text-white font-bold">&times;</button>
            </div>

            <form onSubmit={handleAddCost} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 dark:text-slate-400 mb-1">Expense Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Copper piping installation"
                  value={costItem}
                  onChange={(e) => setCostItem(e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:bg-slate-100 light:border-slate-300 light:text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 dark:text-slate-400 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="4200"
                    value={costAmount}
                    onChange={(e) => setCostAmount(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:bg-slate-100 light:border-slate-300 light:text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 dark:text-slate-400 mb-1">Category</label>
                  <select
                    value={costCategory}
                    onChange={(e) => setCostCategory(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:bg-slate-100 light:border-slate-300 light:text-slate-900"
                  >
                    <option value="Materials">Materials</option>
                    <option value="Labour">Labour</option>
                    <option value="Subcontractor">Subcontractor</option>
                    <option value="Permit">Permit</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Deposit">Deposit</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 dark:text-slate-400 mb-1">Payment Status</label>
                  <select
                    value={costStatus}
                    onChange={(e) => setCostStatus(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:bg-slate-100 light:border-slate-300 light:text-slate-900"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 dark:text-slate-400 mb-1">Invoice Attachment URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/invoice.pdf"
                    value={costInvoiceUrl}
                    onChange={(e) => setCostInvoiceUrl(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:bg-slate-100 light:border-slate-300 light:text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCostModal(false)}
                  className="flex-1 rounded border border-slate-800 bg-slate-900 py-2 text-xs font-bold text-slate-300 light:bg-slate-100 light:border-slate-300 light:text-slate-705"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded bg-sky-500 py-2 text-xs font-bold text-white hover:bg-sky-600"
                >
                  Log Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: DOCUMENT CENTER UPLOAD */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl dark:border-slate-850 dark:bg-slate-900 light:bg-white light:border-slate-300">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white dark:text-slate-900 text-md">Host Blueprint / Spec file</h3>
              <button onClick={() => setShowDocModal(false)} className="text-slate-400 hover:text-white font-bold">&times;</button>
            </div>

            <form onSubmit={handleAddDocument} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 dark:text-slate-400 mb-1">Document Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master_Plan_Draft_Final.pdf"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:bg-slate-100 light:border-slate-300 light:text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 dark:text-slate-400 mb-1">File Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:bg-slate-100 light:border-slate-300 light:text-slate-900"
                  >
                    <option value="Blueprint">Blueprint Plan</option>
                    <option value="3D Design">3D Design File</option>
                    <option value="Contract">Signing Contract</option>
                    <option value="Measurement Sheet">Measurement Sheet</option>
                    <option value="PDF File">PDF Spec sheet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 dark:text-slate-400 mb-1">File Size</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 4.2 MB"
                    value={docSize}
                    onChange={(e) => setDocSize(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:bg-slate-100 light:border-slate-300 light:text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 dark:text-slate-400 mb-1">Simulated File URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/drawing.dwg"
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 light:bg-slate-100 light:border-slate-300 light:text-slate-900"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="flex-1 rounded border border-slate-800 bg-slate-900 py-2 text-xs font-bold text-slate-300 light:bg-slate-105 light:border-slate-300 light:text-slate-705"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded bg-sky-500 py-2 text-xs font-bold text-white hover:bg-sky-600"
                >
                  Host Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
