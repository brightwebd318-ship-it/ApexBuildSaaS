import React, { useState, useEffect, useRef } from 'react';
import { firebaseService } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { 
  Users, HardHat, Calendar, IndianRupee, Plus, CheckCircle2, 
  Trash2, ClipboardList, Package, BarChart3, MapPin, 
  FileText, Download, Bell, AlertTriangle, Paperclip, Camera,
  X, Maximize2, ExternalLink, Pencil, Folder, File, FileUp, ChevronDown, ChevronRight,
  Search, Eye, Clock, UserCheck, CreditCard
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
  const [progressPhotos, setProgressPhotos] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Labours and Attendance States
  const [labours, setLabours] = useState([]);
  const [selectedLabourForProfile, setSelectedLabourForProfile] = useState(null);
  const [selectedLabourAttendance, setSelectedLabourAttendance] = useState([]);

  // Active Project Selection (for sub-tab contexts)
  const [selectedProjId, setSelectedProjId] = useState('');

  // Modals visibility toggles
  const [showClientModal, setShowClientModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showDailyUpdateModal, setShowDailyUpdateModal] = useState(false);
  const [showCostModal, setShowCostModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showAddLabourModal, setShowAddLabourModal] = useState(false);
  
  // Progress Photos modal states
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoCaption, setPhotoCaption] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState(null);

  // Live Camera states
  const [photoUploadMethod, setPhotoUploadMethod] = useState('file'); // 'file' or 'camera'
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraFacingMode, setCameraFacingMode] = useState('environment');
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);

  // Document Modal States
  const [showDocModal, setShowDocModal] = useState(false);
  const [docFile, setDocFile] = useState(null);
  const [docType, setDocType] = useState('2D Drawings');
  const [docVisibleToClient, setDocVisibleToClient] = useState(true);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Edit Estimate States
  const [showEditBudgetModal, setShowEditBudgetModal] = useState(false);
  const [editBudgetAmount, setEditBudgetAmount] = useState('');

  // Notifications Dropdown
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [viewAllNotifications, setViewAllNotifications] = useState(false);
  
  // Payment Stage Management States
  const [paymentStages, setPaymentStages] = useState([]);
  const [showStageModal, setShowStageModal] = useState(false);
  const [editingStage, setEditingStage] = useState(null);
  const [stageName, setStageName] = useState('');
  const [stageDescription, setStageDescription] = useState('');
  const [stageAmount, setStageAmount] = useState('');
  const [stageDueDate, setStageDueDate] = useState('');
  const [stageStatus, setStageStatus] = useState('Pending');
  const [stagePaidAmount, setStagePaidAmount] = useState('0');
  const [showAlarmBanner, setShowAlarmBanner] = useState(true);

  // Document folder expansion state
  const [expandedFolders, setExpandedFolders] = useState({
    '2D Drawings': true,
    '3D Designs': true,
    'Contracts': true,
    'Bills / Invoices': true,
    'PDFs': true,
    'Images': true,
    'Other project files': true
  });

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
  const [projStatus] = useState('Active');
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

  // Form State - Add Labour
  const [labourName, setLabourName] = useState('');
  const [labourPhone, setLabourPhone] = useState('');
  const [labourRole, setLabourRole] = useState('Helper');
  const [labourStatus, setLabourStatus] = useState('Active');
  const [labourAddress, setLabourAddress] = useState('');
  const [labourEmergency, setLabourEmergency] = useState('');
  const [labourIdProof, setLabourIdProof] = useState('');
  const [labourJoinDate, setLabourJoinDate] = useState(new Date().toISOString().split('T')[0]);

  // Labour List Filters
  const [labourSearch, setLabourSearch] = useState('');
  const [labourSkillFilter, setLabourSkillFilter] = useState('All');
  const [labourStatusFilter, setLabourStatusFilter] = useState('All');

  // Attendance Tracker States
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceProjectId, setAttendanceProjectId] = useState('');
  const [attendanceStatuses, setAttendanceStatuses] = useState({});
  const [attendanceRemarks, setAttendanceRemarks] = useState({});
  const [attendanceTimes, setAttendanceTimes] = useState({});

  const toggleFolder = (folderName) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const startCamera = async (facing = cameraFacingMode) => {
    setCameraError('');
    setCapturedImage(null);
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing }
      });
      setCameraStream(stream);
      setCameraActive(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError("Could not access camera. Please check permissions.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  const switchCamera = () => {
    const nextFacing = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(nextFacing);
    if (cameraActive) {
      startCamera(nextFacing);
    }
  };

  const capturePhoto = (vRef) => {
    if (!vRef || !vRef.current) return;
    const video = vRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (cameraFacingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  // Close camera on modal close
  useEffect(() => {
    if (!showPhotoModal) {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      setCameraActive(false);
      setCameraStream(null);
      setPhotoUploadMethod('file');
      setCapturedImage(null);
      setCameraError('');
    }
  }, [showPhotoModal]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const syncAllData = async () => {
    try {
      // 1. Load Projects
      const projs = await firebaseService.getProjects(currentUser.uid, currentUser.role);
      setProjects(projs);
      
      // Auto select project if selector blank
      if (projs.length > 0 && !selectedProjId) {
        setSelectedProjId(projs[0].id);
      }
      if (projs.length > 0 && !attendanceProjectId) {
        setAttendanceProjectId(projs[0].id);
      }

      // 2. Load Clients list
      const clientsList = await firebaseService.getClientsForContractor(currentUser.uid);
      setAllClients(clientsList);

      // 3. Load notifications
      const notifs = await firebaseService.getNotifications(currentUser.uid, currentUser.role);
      setNotifications(notifs);

      // 4. Load Labours
      const laboursList = await firebaseService.getLabours(currentUser.uid);
      setLabours(laboursList);

      // Initialize attendance fields for active labours
      const initialStatuses = {};
      const initialRemarks = {};
      const initialTimes = {};
      laboursList.forEach(l => {
        initialStatuses[l.id] = 'Present';
        initialRemarks[l.id] = '';
        initialTimes[l.id] = '09:00 AM';
      });
      setAttendanceStatuses(initialStatuses);
      setAttendanceRemarks(initialRemarks);
      setAttendanceTimes(initialTimes);

      // 5. Load sub-items from select project ID
      const targetProjId = selectedProjId || (projs.length > 0 ? projs[0].id : null);
      if (targetProjId) {
        const [fetchUpdates, fetchTimeline, fetchCosts, fetchMaterials, fetchDocs, fetchPhotos, fetchStages] = await Promise.all([
          firebaseService.getDailyUpdates(targetProjId),
          firebaseService.getTimeline(targetProjId),
          firebaseService.getCosts(targetProjId),
          firebaseService.getMaterials(targetProjId),
          firebaseService.getDocuments(targetProjId),
          firebaseService.getProgressPhotos(targetProjId),
          firebaseService.getPaymentStages(targetProjId)
        ]);

        setAllUpdates(fetchUpdates);
        setAllTimeline(fetchTimeline);
        setAllCosts(fetchCosts);
        setAllMaterials(fetchMaterials);
        setAllDocuments(fetchDocs);
        setProgressPhotos(fetchPhotos);
        setPaymentStages(fetchStages);
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
      const projId = await firebaseService.addProjectOnly(currentUser.uid, projClientId, {
        projectName: projName,
        siteLocation: projLocation,
        constructionType: projType,
        budget: parseFloat(projBudget) || 0,
        startDate: projStart,
        estimatedFinish: projFinish,
        status: projStatus
      });

      await firebaseService.addNotification(
        projId,
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

      const selectedProj = projects.find(p => p.id === selectedProjId);
      if (selectedProj) {
        await firebaseService.addNotification(
          selectedProjId,
          currentUser.uid,
          selectedProj.clientId,
          'Daily Site Log Submitted',
          `Contractor logged daily progress update for ${updDate}. Labour Force count: ${updLabor}.`,
          'client'
        );
      }

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

      // Notify Client
      const selectedProj = projects.find(p => p.id === selectedProjId);
      if (selectedProj) {
        await firebaseService.addNotification(
          selectedProjId,
          currentUser.uid,
          selectedProj.clientId,
          'New Material Entry Logged',
          `Contractor logged supply materials: "${matName}" (Qty: ${matQty}) to construction sheets.`,
          'client'
        );
      }

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

      // Notify Client
      const selectedProj = projects.find(p => p.id === selectedProjId);
      if (selectedProj) {
        await firebaseService.addNotification(
          selectedProjId,
          currentUser.uid,
          selectedProj.clientId,
          'New Milestone Added',
          `New project milestone milestone logged: "${timeTask}" (Est: ${timeDeadline}).`,
          'client'
        );
      }

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
      const task = allTimeline.find(t => t.id === taskId);
      await firebaseService.updateTimelineProgress(taskId, val);
      
      // Notify Client
      const selectedProj = projects.find(p => p.id === selectedProjId);
      if (selectedProj && task) {
        await firebaseService.addNotification(
          selectedProjId,
          currentUser.uid,
          selectedProj.clientId,
          'Milestone Progress Updated',
          `Milestone "${task.task}" checklist progress shifted to ${val}%.`,
          'client'
        );
      }
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

      // Notify Client
      const selectedProj = projects.find(p => p.id === selectedProjId);
      if (selectedProj) {
        await firebaseService.addNotification(
          selectedProjId,
          currentUser.uid,
          selectedProj.clientId,
          'New Invoice Expense Recorded',
          `Contractor logged cost item: "${costItem}" valued at ₹${parseFloat(costAmount).toLocaleString('en-IN')}.`,
          'client'
        );
      }

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
        uploadedBy: 'contractor',
        uploadedByName: currentUser.name,
        visibleTo: docVisibleToClient ? 'both' : 'contractor_only'
      };

      await firebaseService.addDocument(selectedProjId, currentUser.uid, docData);

      // Notify client only if shared
      if (docVisibleToClient) {
        const selectedProj = projects.find(p => p.id === selectedProjId);
        if (selectedProj) {
          await firebaseService.addNotification(
            selectedProjId,
            currentUser.uid,
            selectedProj.clientId,
            'New Document Shared',
            `Contractor uploaded shared document: "${docFile.name}" in category "${docType}".`,
            'client'
          );
        }
      }

      setShowDocModal(false);
      setDocFile(null);
      syncAllData();
    } catch (err) {
      console.error(err);
      alert("Failed to upload document. File may be too large.");
    } finally {
      setUploadingDoc(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    if (!photoFile && !capturedImage) return;

    setUploadingPhoto(true);
    try {
      const base64Url = capturedImage ? capturedImage : await convertToBase64(photoFile);
      const photoData = {
        uploadedBy: 'contractor',
        uploadedByName: currentUser.name,
        photoUrl: base64Url,
        caption: photoCaption || 'Contractor progress upload',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        timestamp: new Date().toISOString()
      };

      await firebaseService.addProgressPhoto(selectedProjId, photoData);

      // Notify Client
      const selectedProj = projects.find(p => p.id === selectedProjId);
      if (selectedProj) {
        await firebaseService.addNotification(
          selectedProjId,
          currentUser.uid,
          selectedProj.clientId,
          'New Progress Photo Uploaded',
          `Contractor uploaded a new progress photo: "${photoData.caption}".`,
          'client'
        );
      }

      const freshPhotos = await firebaseService.getProgressPhotos(selectedProjId);
      setProgressPhotos(freshPhotos);
      setShowPhotoModal(false);
      setPhotoFile(null);
      setPhotoCaption('');
    } catch (err) {
      console.error("Photo upload failed:", err);
      alert("Failed to upload progress photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleUpdateEstimate = async (e) => {
    e.preventDefault();
    if (!editBudgetAmount || isNaN(editBudgetAmount)) return;

    try {
      const parsedAmount = parseFloat(editBudgetAmount);
      await firebaseService.updateProjectBudget(selectedProjId, parsedAmount);

      // Notify client
      const selectedProj = projects.find(p => p.id === selectedProjId);
      if (selectedProj) {
        await firebaseService.addNotification(
          selectedProjId,
          currentUser.uid,
          selectedProj.clientId,
          'Total Estimate Modified',
          `Contractor modified project total estimate to ₹${parsedAmount.toLocaleString('en-IN')}.`,
          'client'
        );
      }

      setShowEditBudgetModal(false);
      setEditBudgetAmount('');
      syncAllData();
      alert("Project estimate updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error updating project estimate budget.");
    }
  };

  // Add Labour Submit
  const handleAddLabour = async (e) => {
    e.preventDefault();
    if (!labourName || !labourPhone) {
      alert("Labour name and phone number are required.");
      return;
    }

    try {
      const data = {
        name: labourName,
        phone: labourPhone,
        role: labourRole,
        status: labourStatus,
        address: labourAddress,
        joiningDate: labourJoinDate,
        emergencyContact: labourEmergency,
        idProof: labourIdProof
      };
      await firebaseService.addLabour(currentUser.uid, data);
      
      // Reset form fields
      setLabourName('');
      setLabourPhone('');
      setLabourRole('Helper');
      setLabourStatus('Active');
      setLabourAddress('');
      setLabourEmergency('');
      setLabourIdProof('');
      setShowAddLabourModal(false);
      
      syncAllData();
      alert("Labour profile created successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to create labour profile.");
    }
  };

  // Save Attendance Submit
  const handleSaveAttendance = async (e) => {
    e.preventDefault();
    if (!attendanceProjectId) {
      alert("Please select a project site for attendance logging.");
      return;
    }

    const proj = projects.find(p => p.id === attendanceProjectId);
    if (!proj) return;

    try {
      const activeLaboursList = labours.filter(l => l.status === 'Active');
      if (activeLaboursList.length === 0) {
        alert("No active labours found to mark attendance.");
        return;
      }

      await Promise.all(activeLaboursList.map(async (l) => {
        const logData = {
          labourId: l.id,
          projectId: attendanceProjectId,
          projectName: proj.projectName,
          date: attendanceDate,
          status: attendanceStatuses[l.id] || 'Present',
          remarks: attendanceRemarks[l.id] || '',
          timeEntry: attendanceStatuses[l.id] === 'Absent' ? '--' : (attendanceTimes[l.id] || '09:00 AM')
        };
        await firebaseService.addAttendanceLog(currentUser.uid, logData);
      }));

      // Notify Client of linked site
      await firebaseService.addNotification(
        attendanceProjectId,
        currentUser.uid,
        proj.clientId,
        'Daily Site Attendance Logged',
        `Contractor logged attendance logs for ${activeLaboursList.length} workers on site for date ${attendanceDate}.`,
        'client'
      );

      // Reset fields
      const freshRemarks = {};
      labours.forEach(l => {
        freshRemarks[l.id] = '';
      });
      setAttendanceRemarks(freshRemarks);
      syncAllData();
      alert("Daily attendance recorded successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save attendance logs.");
    }
  };

  // Open Labour Profile Modal
  const handleOpenLabourProfile = async (labour) => {
    setSelectedLabourForProfile(labour);
    try {
      const history = await firebaseService.getLabourAttendance(labour.id);
      setSelectedLabourAttendance(history);
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle labour status Active/Inactive
  const handleToggleLabourStatus = async (labour) => {
    const nextStatus = labour.status === 'Active' ? 'Inactive' : 'Active';
    if (window.confirm(`Mark ${labour.name} as ${nextStatus}?`)) {
      try {
        await firebaseService.updateLabour(labour.id, { status: nextStatus });
        syncAllData();
        if (selectedLabourForProfile && selectedLabourForProfile.id === labour.id) {
          setSelectedLabourForProfile({ ...selectedLabourForProfile, status: nextStatus });
        }
      } catch (err) {
        console.error(err);
      }
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

  const handleMarkAllNotificationsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => firebaseService.markNotificationRead(n.id)));
      syncAllData();
    } catch (err) {
      console.error(err);
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

  const handleDeleteDoc = async (id) => {
    if (window.confirm('Are you sure you want to delete this document from the vault?')) {
      try {
        await firebaseService.deleteDocument(id);
        syncAllData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleDeletePhoto = async (id) => {
    if (window.confirm('Are you sure you want to delete this progress photo log?')) {
      try {
        await firebaseService.deleteProgressPhoto(id);
        const freshPhotos = await firebaseService.getProgressPhotos(selectedProjId);
        setProgressPhotos(freshPhotos);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Payment Stage Handlers
  const handleOpenAddStageModal = () => {
    setEditingStage(null);
    setStageName('');
    setStageDescription('');
    setStageAmount('');
    setStageDueDate('');
    setStageStatus('Pending');
    setStagePaidAmount('0');
    setShowStageModal(true);
  };

  const handleOpenEditStageModal = (stage) => {
    setEditingStage(stage);
    setStageName(stage.stageName);
    setStageDescription(stage.stageDescription);
    setStageAmount(stage.stageAmount.toString());
    setStageDueDate(stage.dueDate);
    setStageStatus(stage.status);
    setStagePaidAmount(stage.paidAmount.toString());
    setShowStageModal(true);
  };

  const handleDeleteStage = async (id) => {
    if (window.confirm('Are you sure you want to delete this payment stage?')) {
      try {
        await firebaseService.deletePaymentStage(id);
        syncAllData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleSaveStage = async (e) => {
    e.preventDefault();
    if (!selectedProjId || !activeProj) {
      alert("No active project selected.");
      return;
    }
    if (!stageName || !stageAmount || !stageDueDate) {
      alert("Please fill in stage name, amount, and due date.");
      return;
    }

    try {
      const parsedAmount = parseFloat(stageAmount) || 0;
      const parsedPaid = parseFloat(stagePaidAmount) || 0;

      const stageData = {
        contractorId: currentUser.uid,
        clientId: activeProj.clientId,
        stageName,
        stageDescription,
        stageAmount: parsedAmount,
        dueDate: stageDueDate,
        status: stageStatus,
        paidAmount: parsedPaid
      };

      if (editingStage) {
        await firebaseService.updatePaymentStage(editingStage.id, stageData);
        
        // Notification logic based on status changes
        if (stageStatus === 'Overdue') {
          await firebaseService.addNotification(
            selectedProjId,
            currentUser.uid,
            activeProj.clientId,
            'PAYMENT OVERDUE ALARM',
            `Critical Alert: Stage payment for ${stageName} (₹${parsedAmount.toLocaleString('en-IN')}) is OVERDUE. Please clear outstanding balance immediately to avoid project suspension.`,
            'client',
            'important'
          );
        } else if (stageStatus === 'Paid' || stageStatus === 'Partially Paid') {
          await firebaseService.addNotification(
            selectedProjId,
            currentUser.uid,
            activeProj.clientId,
            'Payment Received Confirmation',
            `Payment Confirmed: Contractor recorded payment of ₹${parsedPaid.toLocaleString('en-IN')} for stage ${stageName}. Outstanding balance: ₹${(parsedAmount - parsedPaid).toLocaleString('en-IN')}.`,
            'client',
            'normal'
          );
        } else {
          await firebaseService.addNotification(
            selectedProjId,
            currentUser.uid,
            activeProj.clientId,
            'Payment Stage Updated',
            `Contractor updated payment stage: ${stageName}. Status: ${stageStatus}.`,
            'client',
            'normal'
          );
        }
        alert("Payment stage updated successfully!");
      } else {
        await firebaseService.addPaymentStage(selectedProjId, stageData);
        
        // Notify Client
        await firebaseService.addNotification(
          selectedProjId,
          currentUser.uid,
          activeProj.clientId,
          'New Payment Stage Created',
          `Contractor created new payment stage: ${stageName} of ₹${parsedAmount.toLocaleString('en-IN')}, due on ${stageDueDate}.`,
          'client',
          'normal'
        );
        alert("Payment stage created successfully!");
      }

      setShowStageModal(false);
      setEditingStage(null);
      syncAllData();
    } catch (err) {
      console.error(err);
      alert("Failed to save payment stage.");
    }
  };

  // --- Overall Calculations ---
  const activeProj = projects.find(p => p.id === selectedProjId) || null;
  const totalClientsCount = allClients.length;
  const activeProjectsCount = projects.filter(p => p.status === 'Active').length;
  const pendingTasksCount = allTimeline.filter(t => t.status !== 'Completed').length;
  const projectLaborCount = labours.filter(l => l.status === 'Active').length;
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

  const documentTree = {
    '2D Drawings': allDocuments.filter(d => d.type === '2D Drawings'),
    '3D Designs': allDocuments.filter(d => d.type === '3D Designs'),
    'Contracts': allDocuments.filter(d => d.type === 'Contracts'),
    'Bills / Invoices': allDocuments.filter(d => d.type === 'Bills / Invoices'),
    'PDFs': allDocuments.filter(d => d.type === 'PDFs'),
    'Images': allDocuments.filter(d => d.type === 'Images'),
    'Other project files': allDocuments.filter(d => 
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

  // Filter Labours
  const filteredLabours = labours.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(labourSearch.toLowerCase()) || 
                          l.phone.includes(labourSearch) || 
                          l.id.toLowerCase().includes(labourSearch.toLowerCase());
    const matchesSkill = labourSkillFilter === 'All' || l.role === labourSkillFilter;
    const matchesStatus = labourStatusFilter === 'All' || l.status === labourStatusFilter;
    return matchesSearch && matchesSkill && matchesStatus;
  });

  return (
    <div className="min-h-screen pb-20 bg-slate-950 text-slate-100 transition-colors duration-300 relative">
      
      {/* Navbar Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <HardHat className="h-5 w-5 animate-pulse-soft" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white leading-none">ApexBuild SaaS</h1>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-sky-400">Contractor Workspace</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-white">{currentUser.name}</p>
                <p className="text-xs text-slate-400">Enterprise Tenant</p>
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
                      ? 'border-sky-500 bg-sky-500/10 text-sky-400' 
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                  title="Notifications"
                >
                  <Bell className="h-4.5 w-4.5" />
                  {notifications.some(n => !n.read) && (
                    <span className={`absolute top-1.5 right-1.5 h-2 w-2 rounded-full ring-2 ring-slate-900 animate-pulse-soft ${
                      notifications.some(n => !n.read && n.priority === 'important') ? 'bg-rose-500' : 'bg-emerald-500'
                    }`} />
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
                          <Bell className="h-4 w-4 text-sky-400" />
                          <h3 className="font-bold text-white text-xs sm:text-sm">Contractor Logs</h3>
                        </div>
                        {notifications.some(n => !n.read) && (
                          <button 
                            onClick={handleMarkAllNotificationsRead}
                            className="text-[10px] text-sky-400 hover:underline font-bold"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                        {notifications.length === 0 ? (
                          <div className="text-center py-8 text-slate-500 text-xs">
                            Your inbox is completely empty.
                          </div>
                        ) : (
                          (() => {
                            const importantNotifs = notifications.filter(n => n.priority === 'important');
                            const normalNotifs = notifications.filter(n => n.priority !== 'important');
                            const sortedNotifs = [...importantNotifs, ...normalNotifs];
                            const visibleNotifs = viewAllNotifications ? sortedNotifs : sortedNotifs.slice(0, 5);
                            
                            return visibleNotifs.map((n) => (
                              <div
                                key={n.id}
                                onClick={() => {
                                  if (!n.read) {
                                    handleMarkNotificationRead(n.id);
                                  }
                                }}
                                className={`rounded-lg border p-3 flex flex-col gap-1 transition-all cursor-pointer relative hover:border-slate-800 ${
                                  n.read
                                    ? 'border-slate-850 bg-slate-950/20 text-slate-450'
                                    : n.priority === 'important'
                                      ? 'border-rose-500/30 bg-rose-500/5 text-slate-200 shadow-sm'
                                      : 'border-sky-500/20 bg-sky-500/5 text-slate-200 shadow-sm'
                                }`}
                              >
                                <div className="flex justify-between items-start gap-2">
                                  <h4 className="font-bold text-xs text-white flex items-center gap-1">
                                    {n.priority === 'important' && (
                                      <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0 animate-pulse" />
                                    )}
                                    {n.title}
                                    {n.priority === 'important' && (
                                      <span className="bg-rose-500/20 text-rose-455 text-[8px] font-extrabold px-1 rounded">IMPORTANT</span>
                                    )}
                                  </h4>
                                  {!n.read && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMarkNotificationRead(n.id);
                                      }}
                                      className={`text-[9px] font-bold hover:underline shrink-0 ${
                                        n.priority === 'important' ? 'text-rose-400' : 'text-sky-455'
                                      }`}
                                    >
                                      Mark read
                                    </button>
                                  )}
                                </div>
                                <p className="text-[11px] leading-normal text-slate-350">{n.message}</p>
                                <span className="text-[9px] text-slate-555 block font-mono mt-0.5">{n.date}</span>
                              </div>
                            ));
                          })()
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
                className="rounded-lg bg-slate-900 border border-slate-805 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-all dark:bg-slate-900 dark:border-slate-800"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Top Critical Alerts Banner */}
      {notifications.some(n => !n.read && n.priority === 'important') && showAlarmBanner && (
        <div className="bg-rose-500/10 border-b border-rose-500/20 text-rose-200 px-4 py-3 shadow-sm">
          <div className="mx-auto max-w-7xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <AlertTriangle className="h-4.5 w-4.5 text-rose-500 shrink-0 animate-pulse" />
              <span>
                <strong>CRITICAL ALERTS DETECTED:</strong> Outstanding payment stages or critical items require review.
              </span>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <button 
                onClick={() => {
                  setShowNotificationsDropdown(true);
                  setViewAllNotifications(true);
                }} 
                className="text-xs font-bold text-rose-450 hover:underline"
              >
                View Alerts
              </button>
              <button 
                onClick={() => setShowAlarmBanner(false)}
                className="text-slate-455 hover:text-white text-xs font-extrabold"
              >
                &times;
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Controls header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white font-sans tracking-tight">Contractor Hub</h2>
            <p className="text-xs text-slate-400">Manage client relationships, sites, timelines, costs, and blueprint documents</p>
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
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white px-3.5 py-2 text-xs font-bold transition-all dark:border-slate-800"
            >
              <Plus className="h-4 w-4" /> Add New Project
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-850 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Overview Metrics', icon: BarChart3 },
            { id: 'clients', label: 'Client Directory', icon: Users },
            { id: 'projects', label: 'Active Projects', icon: ClipboardList },
            { id: 'updates', label: 'Daily Logs', icon: FileText },
            { id: 'photos', label: 'Timeline Photos', icon: Camera },
            { id: 'labours', label: 'Labours Directory', icon: HardHat },
            { id: 'attendance', label: 'Attendance Tracker', icon: UserCheck },
            { id: 'materials', label: 'Materials Ledger', icon: Package },
            { id: 'timeline', label: 'Milestones', icon: Calendar },
            { id: 'costs', label: 'Costs & Bills', icon: IndianRupee },
            { id: 'payments', label: 'Payment Stages', icon: CreditCard },
            { id: 'documents', label: 'Document Vault', icon: FileText }
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
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Project Selector for Sub-tabs */}
        {activeTab !== 'overview' && activeTab !== 'clients' && activeTab !== 'labours' && activeTab !== 'attendance' && projects.length > 0 && (
          <div className="flex items-center gap-3 bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Project:</span>
            <select
              value={selectedProjId}
              onChange={(e) => setSelectedProjId(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-white focus:outline-none"
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
                
                <div className="glass-panel rounded-xl p-4 shadow-sm relative overflow-hidden">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-455">Total Clients</p>
                  <h3 className="mt-2 text-2xl font-extrabold text-white">{totalClientsCount}</h3>
                  <p className="text-[9px] text-slate-500 mt-2">Active business accounts</p>
                </div>

                <div className="glass-panel rounded-xl p-4 shadow-sm relative overflow-hidden">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-455">Active Projects</p>
                  <h3 className="mt-2 text-2xl font-extrabold text-sky-400">{activeProjectsCount}</h3>
                  <p className="text-[9px] text-slate-500 mt-2">Ongoing site operations</p>
                </div>

                <div className="glass-panel rounded-xl p-4 shadow-sm relative overflow-hidden">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-455">Pending Tasks</p>
                  <h3 className="mt-2 text-2xl font-extrabold text-amber-500">{pendingTasksCount}</h3>
                  <p className="text-[9px] text-slate-500 mt-2">Milestones in progress</p>
                </div>

                <div className="glass-panel rounded-xl p-4 shadow-sm relative overflow-hidden">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-455">Active Labours</p>
                  <h3 className="mt-2 text-2xl font-extrabold text-emerald-400">{projectLaborCount}</h3>
                  <p className="text-[9px] text-slate-500 mt-2">Workers active on list</p>
                </div>

                <div className="glass-panel rounded-xl p-4 shadow-sm relative overflow-hidden">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-455">Materials spent</p>
                  <h3 className="mt-2 text-xl font-extrabold text-indigo-400 font-mono">₹{materialsCostTotal.toLocaleString('en-IN')}</h3>
                  <p className="text-[9px] text-slate-500 mt-2">Aggregated supplies</p>
                </div>

                <div className="glass-panel rounded-xl p-4 shadow-sm relative overflow-hidden">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-455">Average Progress</p>
                  <h3 className="mt-2 text-2xl font-extrabold text-white">{avgProgress}%</h3>
                  <p className="text-[9px] text-slate-500 mt-2">Checklists completion</p>
                </div>

              </section>

              {/* Overview visual reports charts */}
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Cost allocation bar chart */}
                <div className="glass-panel rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[300px]">
                  <div>
                    <h4 className="text-sm font-bold text-white">Expenses Allocation (INR)</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Aggregated costs across your client projects</p>
                  </div>
                  <div className="h-60 w-full mt-4 text-slate-900 font-mono text-xs">
                    {chartCostsData.length === 0 ? (
                      <p className="text-xs text-slate-550 text-center py-12">No expense lines registered yet.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartCostsData}>
                          <XAxis dataKey="category" stroke="#64748b" fontSize={10} />
                          <YAxis stroke="#64748b" fontSize={10} />
                          <Tooltip formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Spent']} />
                          <Bar dataKey="Amount" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Labor trend line chart */}
                <div className="glass-panel rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[300px]">
                  <div>
                    <h4 className="text-sm font-bold text-white">Daily Labour Staffing Curve</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Workforce presence timeline from reports</p>
                  </div>
                  <div className="h-60 w-full mt-4 text-slate-900 font-mono text-xs">
                    {chartLaborTrend.length === 0 ? (
                      <p className="text-xs text-slate-555 text-center py-12">Log site updates to generate graphs.</p>
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
            <div className="glass-panel rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div>
                  <h3 className="text-md font-bold text-white">Clients Registry</h3>
                  <p className="text-[10px] text-slate-450">Directory of user profiles representing private project tenants</p>
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
                  <tbody className="divide-y divide-slate-850">
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
                            <td className="py-3.5 px-2 font-semibold text-white flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-emerald-450" />
                              {client.name}
                            </td>
                            <td className="py-3.5 px-2 text-slate-300 font-mono">{client.email}</td>
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
                <h3 className="text-md font-bold text-white">Assigned Projects Workspaces</h3>
                <p className="text-[10px] text-slate-400">Checklists and progress records by construction location</p>
              </div>

              {projects.length === 0 ? (
                <div className="glass-panel rounded-xl p-12 text-center text-slate-550">
                  <ClipboardList className="mx-auto h-12 w-12 text-slate-655 mb-4" />
                  <p className="font-semibold text-slate-350">No projects configured.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {projects.map((proj) => {
                    const client = allClients.find(c => c.id === proj.clientId || c.uid === proj.clientId);
                    return (
                      <div key={proj.id} className="glass-panel rounded-xl p-5 hover:border-slate-750 transition-all flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-extrabold text-white text-sm sm:text-md leading-tight">{proj.projectName}</h4>
                            <span className="text-[9px] font-extrabold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded uppercase">{proj.status}</span>
                          </div>
                          <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" /> {proj.siteLocation}</p>
                          <div className="text-[11px] text-slate-500">Construction Type: {proj.constructionType || 'Residential'}</div>
                          
                          {client && (
                            <div className="mt-3 bg-slate-950/45 p-2 rounded border border-slate-900 text-xs">
                              <span className="text-[10px] font-bold text-slate-500 block uppercase">Client Profile</span>
                              <span className="font-semibold text-slate-300 block mt-0.5">{client.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono">{client.email}</span>
                            </div>
                          )}
                        </div>

                        {/* ESTIMATE MANAGEMENT EDIT CONTROLS */}
                        <div className="pt-3 border-t border-slate-900/60 space-y-2.5 text-xs text-slate-550">
                          <div className="flex justify-between items-center font-semibold">
                            <span>Total Estimate:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-white font-mono">₹{proj.budget?.toLocaleString('en-IN') || '0'}</span>
                              <button
                                onClick={() => {
                                  setSelectedProjId(proj.id);
                                  setEditBudgetAmount(proj.budget);
                                  setShowEditBudgetModal(true);
                                }}
                                className="p-1 hover:bg-slate-800 text-slate-450 hover:text-sky-400 rounded transition-colors"
                                title="Edit Total Estimate"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span>Duration: {proj.startDate} to {proj.deadline || proj.estimatedFinish}</span>
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
                  <h3 className="text-md font-bold text-white">Daily Site Progress Reports</h3>
                  <p className="text-xs text-slate-450">Chronological logs of labor force presence and construction notes</p>
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
                    <div key={upd.id} className="glass-panel rounded-2xl p-6 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-900/80 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">Site Progress Update</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-xs text-slate-400">{upd.date}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs font-bold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded">Laborers: {upd.labourCount || upd.labour_count || 0}</span>
                          {upd.delays && upd.delays !== 'None' && (
                            <span className="text-xs font-bold text-rose-455 bg-rose-500/10 px-2.5 py-0.5 rounded flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> Delay: {upd.delays}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line space-y-2">
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
                              onClick={() => setActiveLightboxPhoto({ url: ph, date: upd.date, caption: 'Daily log attachment', uploadedByName: 'Contractor' })}
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

          {/* TAB 5: TIMELINE PHOTOS - DATED/TIMED FEED */}
          {activeTab === 'photos' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div>
                  <h3 className="text-md font-bold text-white">Project Photo Feed</h3>
                  <p className="text-xs text-slate-455 mt-0.5">Vertical date and time timeline logs of progress photos from site</p>
                </div>
                
                <button 
                  onClick={() => setShowPhotoModal(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:border-sky-500 hover:bg-sky-500/10 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-sky-400 transition-all shadow-sm"
                >
                  <Camera className="h-4 w-4 text-sky-400" /> Upload Progress Photo
                </button>
              </div>

              {progressPhotos.length === 0 ? (
                <div className="glass-panel rounded-xl p-12 text-center text-slate-555 flex flex-col items-center justify-center space-y-3">
                  <Camera className="h-10 w-10 text-slate-655" />
                  <p>No site progress photos logged yet.</p>
                </div>
              ) : (
                <div className="relative border-l border-slate-850 pl-6 ml-3 space-y-8 py-2">
                  {progressPhotos.map((ph) => (
                    <div key={ph.id} className="relative">
                      {/* Timeline indicator node */}
                      <span className={`absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                        ph.uploadedBy === 'client' 
                          ? 'bg-emerald-500 border-emerald-500' 
                          : 'bg-sky-500 border-sky-500'
                      }`} />
                      
                      <div className="glass-panel rounded-xl p-5 shadow-sm space-y-4 max-w-2xl">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-855 pb-2">
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
                          <p className="text-xs text-slate-350 italic">"{ph.caption}"</p>
                          
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => triggerDownload(ph.photoUrl, `progress_${ph.date}_${ph.time}.jpg`)}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                              title="Download Photo"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePhoto(ph.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-455 hover:bg-slate-800 rounded transition-colors"
                              title="Delete Photo"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: LABOURS DIRECTORY - SEARCH, FILTERS, ADD LABOUR */}
          {activeTab === 'labours' && (
            <div className="glass-panel rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-4">
                <div>
                  <h3 className="text-md font-bold text-white">Labours Directory</h3>
                  <p className="text-xs text-slate-450">Maintain profiles, skills categories, emergency contacts, and documentation</p>
                </div>
                <button
                  onClick={() => setShowAddLabourModal(true)}
                  className="flex items-center gap-1 rounded bg-sky-50 hover:bg-sky-100 px-3.5 py-2 text-xs font-bold text-slate-900 transition-colors shadow-sm"
                >
                  <Plus className="h-4 w-4" /> Add Labour Profile
                </button>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-3 bg-slate-900/30 p-4 rounded-xl border border-slate-850">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search by name, ID, or phone..."
                    value={labourSearch}
                    onChange={(e) => setLabourSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={labourSkillFilter}
                    onChange={(e) => setLabourSkillFilter(e.target.value)}
                    className="rounded-lg bg-slate-955 border border-slate-800 px-3 py-2 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="All">All Categories</option>
                    <option value="Mason">Mason</option>
                    <option value="Carpenter">Carpenter</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Plumber">Plumber</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Helper">Helper</option>
                  </select>

                  <select
                    value={labourStatusFilter}
                    onChange={(e) => setLabourStatusFilter(e.target.value)}
                    className="rounded-lg bg-slate-955 border border-slate-800 px-3 py-2 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Labours Grid */}
              {filteredLabours.length === 0 ? (
                <div className="text-center py-12 text-slate-550 text-xs">
                  No labours match your search parameters.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredLabours.map((l) => (
                    <div 
                      key={l.id} 
                      className="bg-slate-950/40 border border-slate-900 hover:border-slate-800 transition-all rounded-xl p-4.5 flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="font-extrabold text-white text-sm hover:underline cursor-pointer" onClick={() => handleOpenLabourProfile(l)}>
                              {l.name}
                            </h4>
                            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mt-0.5 block">ID: {l.id}</span>
                          </div>

                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase ${
                            l.status === 'Active' 
                              ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20' 
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {l.status}
                          </span>
                        </div>

                        <div className="text-xs text-slate-300 space-y-1">
                          <p><span className="text-slate-500">Skill Category:</span> <strong className="text-white">{l.role}</strong></p>
                          <p><span className="text-slate-500">Phone:</span> {l.phone}</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-900/60 flex items-center justify-between gap-2 text-xs">
                        <button
                          onClick={() => handleOpenLabourProfile(l)}
                          className="text-sky-400 font-bold hover:underline flex items-center gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" /> View Profile
                        </button>

                        <button
                          onClick={() => handleToggleLabourStatus(l)}
                          className="text-[10px] text-slate-450 hover:text-white bg-slate-900 border border-slate-800 px-2.5 py-1 rounded"
                        >
                          Toggle Status
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: ATTENDANCE TRACKER - ENTRY FORM */}
          {activeTab === 'attendance' && (
            <div className="glass-panel rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-900 pb-4">
                <h3 className="text-md font-bold text-white">Labour Attendance Tracker</h3>
                <p className="text-xs text-slate-450">Log attendance parameters for active workforce by site project</p>
              </div>

              <form onSubmit={handleSaveAttendance} className="space-y-6">
                
                {/* Site Selection + Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/30 p-4 rounded-xl border border-slate-850">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Select Work Site (Project)</label>
                    <select
                      required
                      value={attendanceProjectId}
                      onChange={(e) => setAttendanceProjectId(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="">-- Choose Project site --</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.projectName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Attendance Date</label>
                    <input
                      type="date"
                      required
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Labours List Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-900">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-850 text-slate-500 uppercase font-bold tracking-wider">
                        <th className="py-3 px-4">Worker Info</th>
                        <th className="py-3 px-4">Attendance Status</th>
                        <th className="py-3 px-4">Time Entry</th>
                        <th className="py-3 px-4">Remarks / Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-905 bg-slate-950/10">
                      {labours.filter(l => l.status === 'Active').length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-500 font-semibold">
                            No active labours to track attendance. Make sure you set their status to Active first in the Labours Directory.
                          </td>
                        </tr>
                      ) : (
                        labours.filter(l => l.status === 'Active').map((l) => (
                          <tr key={l.id} className="hover:bg-slate-900/10">
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-white">{l.name}</div>
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">{l.role} • ID: {l.id}</div>
                            </td>
                            
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                {['Present', 'Absent', 'Half Day'].map((st) => (
                                  <label key={st} className="flex items-center gap-1 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`status_${l.id}`}
                                      value={st}
                                      checked={(attendanceStatuses[l.id] || 'Present') === st}
                                      onChange={(e) => setAttendanceStatuses({
                                        ...attendanceStatuses,
                                        [l.id]: e.target.value
                                      })}
                                      className="accent-sky-500 cursor-pointer"
                                    />
                                    <span className="text-[11px] text-slate-300 font-medium">{st}</span>
                                  </label>
                                ))}
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <input
                                type="text"
                                placeholder="09:00 AM"
                                disabled={attendanceStatuses[l.id] === 'Absent'}
                                value={attendanceStatuses[l.id] === 'Absent' ? '--' : (attendanceTimes[l.id] || '09:00 AM')}
                                onChange={(e) => setAttendanceTimes({
                                  ...attendanceTimes,
                                  [l.id]: e.target.value
                                })}
                                className="w-20 rounded bg-slate-950 border border-slate-800 text-xs px-2 py-1 text-white disabled:opacity-40"
                              />
                            </td>

                            <td className="py-3.5 px-4">
                              <input
                                type="text"
                                placeholder="e.g. Late entry, Moved to masonry"
                                value={attendanceRemarks[l.id] || ''}
                                onChange={(e) => setAttendanceRemarks({
                                  ...attendanceRemarks,
                                  [l.id]: e.target.value
                                })}
                                className="w-full max-w-xs rounded bg-slate-950 border border-slate-800 text-xs px-2 py-1.5 text-white placeholder-slate-600 focus:outline-none"
                              />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {labours.filter(l => l.status === 'Active').length > 0 && (
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 px-5 py-2.5 text-xs font-bold text-white transition-all shadow-md shadow-sky-550/10"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Save Attendance Log
                    </button>
                  </div>
                )}

              </form>
            </div>
          )}

          {/* TAB 8: MATERIALS LEDGER */}
          {activeTab === 'materials' && (
            <div className="glass-panel rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <div>
                  <h3 className="text-md font-bold text-white">Materials Ledger (INR)</h3>
                  <p className="text-xs text-slate-450">Detailed accounting of material orders, quantities, rates, and suppliers</p>
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
                  <tbody className="divide-y divide-slate-850">
                    {allMaterials.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-550">No material invoices logged. Click Add Material.</td>
                      </tr>
                    ) : (
                      allMaterials.map((mat) => (
                        <tr key={mat.id} className="hover:bg-slate-900/30">
                          <td className="py-3 px-2 font-semibold text-white">{mat.name}</td>
                          <td className="py-3 px-2 text-slate-300">{mat.quantity}</td>
                          <td className="py-3 px-2 text-slate-400">{mat.vendor}</td>
                          <td className="py-3 px-2 font-mono text-slate-350">₹{mat.rate?.toLocaleString('en-IN') || '0'}</td>
                          <td className="py-3 px-2 font-bold font-mono text-sky-400">₹{mat.total?.toLocaleString('en-IN') || '0'}</td>
                          <td className="py-3 px-2 text-right">
                            {mat.invoiceUrl ? (
                              <button
                                onClick={() => triggerDownload(mat.invoiceUrl, `${mat.name}_invoice.pdf`)}
                                className="inline-flex items-center gap-1 text-[10px] text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded hover:bg-sky-500/20 transition-all font-bold"
                              >
                                <Paperclip className="h-3 w-3" /> Get Receipt
                              </button>
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

          {/* TAB 9: TIMELINE MILESTONES */}
          {activeTab === 'timeline' && (
            <div className="glass-panel rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <div>
                  <h3 className="text-md font-bold text-white">Timeline Milestone Board</h3>
                  <p className="text-xs text-slate-450">Map and prioritize deliverables, dates, and schedules</p>
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
                  <p className="text-xs text-slate-555 py-6 text-center">No milestones scheduled. Click Add Task above.</p>
                ) : (
                  allTimeline.map((task) => (
                    <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/40 border border-slate-900 rounded-xl p-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-white">{task.task}</span>
                          {task.progress === 100 && <CheckCircle2 className="h-4 w-4 text-emerald-450" />}
                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                            task.priority === 'High' 
                              ? 'bg-rose-500/10 text-rose-455 border-rose-500/20' 
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
                          className="text-slate-500 hover:text-rose-455 p-1 border border-transparent hover:border-slate-800 rounded transition-colors"
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

          {/* TAB 10: COST MANAGEMENT */}
          {activeTab === 'costs' && (
            <div className="glass-panel rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <div>
                  <h3 className="text-md font-bold text-white">Cost Accounts Ledger</h3>
                  <p className="text-xs text-slate-455">Track structural permits, equipment logs, and subcontracting expenses in ₹ INR</p>
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
                    <tr className="bg-slate-950 border-b border-slate-900 text-slate-500 uppercase font-bold tracking-wider">
                      <th className="py-2.5 px-3">Expense item</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Price</th>
                      <th className="py-2.5 px-3">Payment</th>
                      <th className="py-2.5 px-3">Invoice</th>
                      <th className="py-2.5 px-3 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 bg-slate-950/10">
                    {allCosts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-550">No expenses recorded. Add one above.</td>
                      </tr>
                    ) : (
                      allCosts.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-900/30">
                          <td className="py-3 px-3 font-semibold text-white">{c.item_name || c.item}</td>
                          <td className="py-3 px-3 text-slate-400">{c.category}</td>
                          <td className="py-3 px-3 font-bold font-mono text-white">₹{c.amount?.toLocaleString('en-IN') || '0'}</td>
                          <td className="py-3 px-3">
                            <button
                              onClick={() => handleToggleCostStatus(c.id, c.status)}
                              className={`px-2 py-0.5 rounded-[4px] text-[10px] font-extrabold uppercase border cursor-pointer ${
                                c.status === 'Paid'
                                  ? 'bg-emerald-500/10 text-emerald-440 border-emerald-500/25'
                                  : 'bg-amber-500/10 text-amber-450 border-amber-500/25'
                              }`}
                            >
                              {c.status}
                            </button>
                          </td>
                          <td className="py-3 px-3">
                            {c.invoiceUrl ? (
                              <button
                                onClick={() => triggerDownload(c.invoiceUrl, `${c.item_name}_invoice.pdf`)}
                                className="inline-flex items-center gap-1 text-[10px] text-sky-400 hover:underline"
                              >
                                <Paperclip className="h-3 w-3" /> Get File
                              </button>
                            ) : (
                              <span className="text-slate-600">No file</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleDeleteCost(c.id)}
                              className="text-slate-500 hover:text-rose-455"
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

          {/* TAB 11: PAYMENT STAGES */}
          {activeTab === 'payments' && (
            <div className="glass-panel rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-900 pb-4">
                <div>
                  <h3 className="text-md font-bold text-white">Project Payment Stages</h3>
                  <p className="text-xs text-slate-455">Set up milestones, track client payments, and manage pending stage balances</p>
                </div>
                <button
                  onClick={handleOpenAddStageModal}
                  className="flex items-center gap-1 rounded bg-sky-500 hover:bg-sky-600 px-3.5 py-1.5 text-xs font-bold text-white transition-colors"
                >
                  <Plus className="h-4 w-4" /> Create Stage
                </button>
              </div>

              {/* Metrics */}
              {(() => {
                const totalCost = paymentStages.reduce((sum, s) => sum + s.stageAmount, 0);
                const totalPaid = paymentStages.reduce((sum, s) => sum + s.paidAmount, 0);
                const balance = totalCost - totalPaid;
                const paidPercentage = totalCost > 0 ? Math.round((totalPaid / totalCost) * 100) : 0;

                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4">
                        <span className="text-[10px] uppercase font-bold text-slate-505 tracking-wider">Total Project Cost</span>
                        <h4 className="text-xl font-extrabold text-white mt-1.5 font-mono">₹{totalCost.toLocaleString('en-IN')}</h4>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full mt-3 overflow-hidden">
                          <div className="h-full bg-sky-500 rounded-full" style={{ width: '100%' }} />
                        </div>
                      </div>

                      <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4">
                        <span className="text-[10px] uppercase font-bold text-emerald-450 tracking-wider">Total Paid Amount</span>
                        <h4 className="text-xl font-extrabold text-emerald-400 mt-1.5 font-mono">₹{totalPaid.toLocaleString('en-IN')}</h4>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full mt-3 overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${paidPercentage}%` }} />
                        </div>
                      </div>

                      <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4">
                        <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">Remaining Balance</span>
                        <h4 className="text-xl font-extrabold text-amber-400 mt-1.5 font-mono">₹{balance.toLocaleString('en-IN')}</h4>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full mt-3 overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${100 - paidPercentage}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Overall Progress Bar */}
                    <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-medium">Payment Progress</span>
                        <span className="text-white font-extrabold font-mono">{paidPercentage}% Cleared</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-sky-500 to-teal-400 rounded-full transition-all duration-500" 
                          style={{ width: `${paidPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Stages List Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-850">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-850 text-slate-505 uppercase font-bold tracking-wider">
                      <th className="py-3 px-4">Stage Details</th>
                      <th className="py-3 px-4 text-right">Amount (₹)</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Paid (₹)</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 bg-slate-950/15">
                    {paymentStages.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500 font-semibold">
                          No payment stages registered yet. Click "Create Stage" to set one up.
                        </td>
                      </tr>
                    ) : (
                      paymentStages.map((s, idx) => (
                        <tr key={s.id} className="hover:bg-slate-900/10">
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-extrabold text-white flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-550 font-mono">#{idx+1}</span>
                              {s.stageName}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{s.stageDescription}</p>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                            ₹{s.stageAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-350">
                            {s.dueDate}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                              s.status === 'Paid' 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : s.status === 'Overdue'
                                  ? 'bg-rose-500/10 text-rose-455 border-rose-500/20 animate-pulse'
                                  : s.status === 'Partially Paid'
                                    ? 'bg-amber-500/10 text-amber-450 border-amber-500/20'
                                    : 'bg-slate-805 text-slate-400 border-slate-700'
                            }`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-450">
                            ₹{s.paidAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenEditStageModal(s)}
                                className="p-1 hover:bg-slate-800 text-slate-450 hover:text-sky-400 rounded transition-colors"
                                title="Edit Stage"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteStage(s.id)}
                                className="p-1 hover:bg-slate-800 text-slate-450 hover:text-rose-455 rounded transition-colors"
                                title="Delete Stage"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
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
          )}

          {/* TAB 11: DOCUMENT CENTER */}
          {activeTab === 'documents' && (
            <div className="glass-panel rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <div>
                  <h3 className="text-md font-bold text-white">Blueprint & Specifications Center</h3>
                  <p className="text-xs text-slate-455">Share contracts, plans, drawings, and specs with the client</p>
                </div>
                <button
                  onClick={() => setShowDocModal(true)}
                  className="flex items-center gap-1 rounded bg-sky-500 hover:bg-sky-600 px-3 py-1.5 text-xs font-bold text-white transition-colors"
                >
                  <FileUp className="h-4 w-4" /> Upload Document
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {Object.entries(documentTree).map(([folderName, files]) => {
                  const isExpanded = expandedFolders[folderName];
                  return (
                    <div key={folderName} className="glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-sm">
                      {/* Folder header */}
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
                          <span className="text-[10px] text-slate-550 bg-slate-955 px-2 py-0.5 rounded-full">
                            {files.length} {files.length === 1 ? 'file' : 'files'}
                          </span>
                        </div>
                      </button>

                      {/* Files list */}
                      {isExpanded && (
                        <div className="p-2.5 divide-y divide-slate-850 bg-slate-905/10">
                          {files.length === 0 ? (
                            <div className="text-center py-4 text-xs text-slate-655">
                              No files inside this directory.
                            </div>
                          ) : (
                            files.map((doc) => (
                              <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3 hover:bg-slate-900/20 rounded-xl transition-colors">
                                <div className="flex items-center gap-3">
                                  <File className="h-5 w-5 text-sky-400" />
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h5 className="text-xs font-bold text-white max-w-[200px] sm:max-w-md truncate" title={doc.name}>
                                        {doc.name}
                                      </h5>
                                      {doc.visibleTo === 'contractor_only' && (
                                        <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                                          Private (Internal)
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[9px] text-slate-455 mt-0.5">
                                      <span>Size: {doc.size}</span>
                                      <span>•</span>
                                      <span>Uploaded: {doc.date}</span>
                                      <span>•</span>
                                      <span>By: <strong className="text-slate-350">{doc.uploadedByName || (doc.uploadedBy === 'client' ? 'Client' : 'Contractor')}</strong></span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-center">
                                  <button 
                                    onClick={() => triggerDownload(doc.fileUrl, doc.name)}
                                    className="flex items-center gap-1.5 rounded-lg border border-slate-855 hover:border-slate-700 bg-slate-900/45 px-3 py-1.5 text-[10px] font-bold text-slate-300 hover:text-white transition-all"
                                  >
                                    <Download className="h-3.5 w-3.5" /> Download
                                  </button>
                                  <button
                                    onClick={() => handleDeleteDoc(doc.id)}
                                    className="p-2 text-slate-500 hover:text-rose-455 hover:bg-slate-800 rounded transition-colors"
                                    title="Delete document"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
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
            </div>
          )}

        </div>

      </main>

      {/* MODAL 1: Add Client Form (Includes project settings) */}
      {showClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl overflow-y-auto max-h-[90vh] dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-lg">Add New Client Account</h3>
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
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Client Full Name</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Alice Smith"
                        value={cliName}
                        onChange={(e) => setCliName(e.target.value)}
                        className="w-full rounded border border-slate-705 bg-slate-950 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Email Address</label>
                      <input 
                        type="email" 
                        required 
                        placeholder="alice@gmail.com"
                        value={cliEmail}
                        onChange={(e) => setCliEmail(e.target.value)}
                        className="w-full rounded border border-slate-705 bg-slate-950 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Phone Number</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="+91 98765 43210"
                      value={cliPhone}
                      onChange={(e) => setCliPhone(e.target.value)}
                      className="w-full rounded border border-slate-705 bg-slate-950 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* Password invitation */}
                <div className="space-y-4 border-t border-slate-800/80 pt-4">
                  <h4 className="text-xs font-semibold text-sky-400 uppercase tracking-wider">Credentials Setup Method</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className={`flex flex-col p-4 rounded-lg border cursor-pointer transition-all ${
                      invType === 'email_invite' ? 'border-sky-500 bg-sky-500/5' : 'border-slate-800 bg-slate-955'
                    }`}>
                      <input 
                        type="radio" 
                        name="invType" 
                        value="email_invite" 
                        checked={invType === 'email_invite'} 
                        onChange={() => setInvType('email_invite')}
                        className="sr-only"
                      />
                      <span className="font-bold text-xs text-white">Option A: Email Invitation (Invite link)</span>
                      <span className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                        Dispatches invitation email. Client configures password on click.
                      </span>
                    </label>

                    <label className={`flex flex-col p-4 rounded-lg border cursor-pointer transition-all ${
                      invType === 'auto_gen' ? 'border-sky-500 bg-sky-500/5' : 'border-slate-800 bg-slate-955'
                    }`}>
                      <input 
                        type="radio" 
                        name="invType" 
                        value="auto_gen" 
                        checked={invType === 'auto_gen'} 
                        onChange={() => setInvType('auto_gen')}
                        className="sr-only"
                      />
                      <span className="font-bold text-xs text-white">Option B: Auto-Password (Quick credential)</span>
                      <span className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                        Auto-generates temporary password. forces password change on first login.
                      </span>
                    </label>
                  </div>
                </div>

                {/* Project details */}
                <div className="space-y-4 border-t border-slate-800/80 pt-4">
                  <h4 className="text-xs font-semibold text-sky-400 uppercase tracking-wider">Project Configuration</h4>
                  
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Project Name</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Modern Residential Villa"
                      value={newClientProj.projectName}
                      onChange={(e) => setNewClientProj({...newClientProj, projectName: e.target.value})}
                      className="w-full rounded border border-slate-705 bg-slate-950 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Site Address Location</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Plot 45, Bangalore, India"
                        value={newClientProj.siteLocation}
                        onChange={(e) => setNewClientProj({...newClientProj, siteLocation: e.target.value})}
                        className="w-full rounded border border-slate-705 bg-slate-950 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Expected Completion</label>
                      <input 
                        type="date" 
                        required
                        value={newClientProj.estimatedFinish}
                        onChange={(e) => setNewClientProj({...newClientProj, estimatedFinish: e.target.value})}
                        className="w-full rounded border border-slate-705 bg-slate-950 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Project Estimate Budget (₹ INR)</label>
                      <input 
                        type="number" 
                        required 
                        placeholder="1800000"
                        value={newClientProj.budget}
                        onChange={(e) => setNewClientProj({...newClientProj, budget: e.target.value})}
                        className="w-full rounded border border-slate-705 bg-slate-950 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Construction Type</label>
                      <select
                        value={newClientProj.constructionType}
                        onChange={(e) => setNewClientProj({...newClientProj, constructionType: e.target.value})}
                        className="w-full rounded border border-slate-705 bg-slate-955 px-3 py-1.5 text-sm text-white focus:outline-none"
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
                    className="flex-1 rounded border border-slate-800 bg-slate-900 py-2.5 text-xs font-bold text-slate-300"
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
                  <h4 className="text-md font-bold text-white">Client Account Provisioned!</h4>
                  <p className="text-xs text-slate-400 mt-1">Project Linked to {cliName}</p>
                </div>

                {invType === 'email_invite' ? (
                  <div className="bg-slate-955 p-4 rounded-lg border border-slate-900 text-left">
                    <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block mb-2">Option A - Invitation Sent</span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      An invitation setup email has been triggered. Client will configure password via welcome link captured in the bottom-right Simulated Email drawer.
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-955 p-4 rounded-lg border border-slate-900 text-left space-y-3">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Option B - Credentials Created</span>
                    <p className="text-xs text-slate-305">
                      Provide details to client. First login password update is strictly required:
                    </p>
                    <div className="space-y-1.5 font-mono text-xs text-slate-300">
                      <div><span className="text-slate-500">Email:</span> <span className="font-semibold text-white">{cliEmail}</span></div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-md">Add Project Form</h3>
              <button onClick={() => setShowProjectModal(false)} className="text-slate-400 hover:text-white font-bold">&times;</button>
            </div>

            <form onSubmit={handleAddProject} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Select Client Account</label>
                <select
                  required
                  value={projClientId}
                  onChange={(e) => setProjClientId(e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="">-- Choose client profile --</option>
                  {allClients.map(c => (
                    <option key={c.id || c.uid} value={c.id || c.uid}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-305 mb-1">Project Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Stark Tower Retrofit"
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-955 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-305 mb-1">Site Location Address</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. 505 Palm Ave, Austin, TX"
                  value={projLocation}
                  onChange={(e) => setProjLocation(e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-955 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-305 mb-1">Budget (₹ INR)</label>
                  <input 
                    type="number" 
                    required 
                    placeholder="900000"
                    value={projBudget}
                    onChange={(e) => setProjBudget(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-955 px-3 py-1.5 text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-305 mb-1">Construction Type</label>
                  <select
                    value={projType}
                    onChange={(e) => setProjType(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-955 px-3 py-1.5 text-sm text-white focus:outline-none"
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
                  <label className="block text-[11px] font-semibold text-slate-355 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    required 
                    value={projStart}
                    onChange={(e) => setProjStart(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-955 px-3 py-1.5 text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-355 mb-1">Deadline Date</label>
                  <input 
                    type="date" 
                    required 
                    value={projFinish}
                    onChange={(e) => setProjFinish(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-955 px-3 py-1.5 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="flex-1 rounded border border-slate-800 bg-slate-905 py-2 text-xs font-bold text-slate-300"
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
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-md">Daily Site Update Form</h3>
              <button onClick={() => setShowDailyUpdateModal(false)} className="text-slate-450 hover:text-white font-bold">&times;</button>
            </div>

            <form onSubmit={handleAddDailyUpdate} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={updDate}
                    onChange={(e) => setUpdDate(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Labour Count</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={updLabor}
                    onChange={(e) => setUpdLabor(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Work Completed</label>
                <textarea
                  required
                  placeholder="Describe building milestones achieved today..."
                  value={updWorkCompleted}
                  onChange={(e) => setUpdWorkCompleted(e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-955 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-305 mb-1">Delays / Issues</label>
                  <select
                    value={updDelays}
                    onChange={(e) => setUpdDelays(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-955 px-3 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="None">None (On Track)</option>
                    <option value="Weather">Weather Blockage</option>
                    <option value="Supplies">Material Supply Shortage</option>
                    <option value="Labor">Labor Shortage</option>
                    <option value="Permit">Regulatory Inspection Delay</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-305 mb-1">Remarks</label>
                  <input
                    type="text"
                    placeholder="e.g. Concrete slab curing"
                    value={updRemarks}
                    onChange={(e) => setUpdRemarks(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-955 px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Photo Attach Web URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={updPhotoUrl}
                  onChange={(e) => setUpdPhotoUrl(e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-955 px-3 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDailyUpdateModal(false)}
                  className="flex-1 rounded border border-slate-800 bg-slate-905 py-2 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded bg-sky-500 py-2 text-xs font-bold text-white hover:bg-sky-600"
                >
                  Publish Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT TOTAL ESTIMATE BUDGET */}
      {showEditBudgetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-md">Update Project Estimate</h3>
              <button onClick={() => setShowEditBudgetModal(false)} className="text-slate-400 hover:text-white font-bold">&times;</button>
            </div>

            <form onSubmit={handleUpdateEstimate} className="mt-4 space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Update the Total Estimate value for the project: <strong>{activeProj?.projectName}</strong>. The client will be notified of this change immediately.
              </p>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">New Budget Estimate (₹ INR)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 1500000"
                  value={editBudgetAmount}
                  onChange={(e) => setEditBudgetAmount(e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-955 px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  autoFocus
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditBudgetModal(false)}
                  className="flex-1 rounded border border-slate-800 bg-slate-905 py-2 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded bg-sky-500 py-2 text-xs font-bold text-white hover:bg-sky-600 shadow"
                >
                  Commit Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: TIMELINE PROGRESS PHOTO UPLOAD */}
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
                Choose an image file or take a photo using your camera. It will upload as a progress milestone visible in the project photo timeline.
              </p>

              {/* Upload Method Tabs */}
              <div className="flex border-b border-slate-800 pb-2 mb-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPhotoUploadMethod('file');
                    stopCamera();
                  }}
                  className={`flex-1 pb-1.5 text-center text-xs font-bold border-b-2 transition-all ${
                    photoUploadMethod === 'file'
                      ? 'border-sky-500 text-sky-400'
                      : 'border-transparent text-slate-400 hover:text-slate-350'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPhotoUploadMethod('camera');
                    startCamera();
                  }}
                  className={`flex-1 pb-1.5 text-center text-xs font-bold border-b-2 transition-all ${
                    photoUploadMethod === 'camera'
                      ? 'border-sky-500 text-sky-400'
                      : 'border-transparent text-slate-400 hover:text-slate-350'
                  }`}
                >
                  Take Photo
                </button>
              </div>

              {photoUploadMethod === 'file' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">Select Image File</label>
                  <input 
                    type="file"
                    required
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files[0])}
                    className="w-full text-xs text-slate-305 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-sky-500/10 file:text-sky-400 hover:file:bg-sky-500/20 bg-slate-950 border border-slate-705 rounded-md p-1"
                  />
                </div>
              )}

              {photoUploadMethod === 'camera' && (
                <div className="space-y-3">
                  {cameraError && (
                    <div className="text-xs text-rose-455 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                      {cameraError}
                    </div>
                  )}

                  {/* Camera Screen */}
                  {!capturedImage ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-750 bg-slate-950 flex flex-col items-center justify-center">
                      {cameraActive ? (
                        <>
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="h-full w-full object-cover"
                            style={{ transform: cameraFacingMode === 'user' ? 'scaleX(-1)' : 'none' }}
                          />
                          <div className="absolute top-3 left-3 bg-rose-500/80 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1.5 animate-pulse">
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                            LIVE
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-6 space-y-3">
                          <Camera className="h-8 w-8 text-slate-500 mx-auto" />
                          <button
                            type="button"
                            onClick={() => startCamera()}
                            className="px-3.5 py-1.5 rounded bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-xs font-bold transition-all"
                          >
                            Enable Camera
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Captured Image Preview */
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-750 bg-slate-955 flex items-center justify-center">
                      <img src={capturedImage} alt="Captured progress" className="h-full w-full object-contain" />
                      <div className="absolute top-3 left-3 bg-sky-500/85 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1">
                        PREVIEW
                      </div>
                    </div>
                  )}

                  {/* Camera Controls */}
                  <div className="flex justify-center gap-3">
                    {cameraActive && !capturedImage && (
                      <>
                        <button
                          type="button"
                          onClick={() => capturePhoto(videoRef)}
                          className="flex-1 py-1.5 rounded bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                        >
                          <Camera className="h-4 w-4" /> Capture Photo
                        </button>
                        <button
                          type="button"
                          onClick={switchCamera}
                          className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                          title="Switch Camera"
                        >
                          Flip Camera
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-305 text-xs font-bold transition-all"
                        >
                          Stop
                        </button>
                      </>
                    )}
                    {capturedImage && (
                      <button
                        type="button"
                        onClick={retakePhoto}
                        className="flex-1 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-205 text-xs font-bold transition-all"
                      >
                        Retake Photo
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">Caption Description</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Finished pool plumbing connections"
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  className="w-full rounded border border-slate-707 bg-slate-955 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
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
                  className="flex-1 rounded border border-slate-800 bg-slate-905 py-2 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingPhoto || (photoUploadMethod === 'file' ? !photoFile : !capturedImage)}
                  className="flex-1 rounded bg-sky-500 py-2 text-xs font-bold text-white hover:bg-sky-600 disabled:opacity-50"
                >
                  {uploadingPhoto ? 'Uploading...' : 'Save Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: DOCUMENT UPLOAD */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-md">Upload Document Center</h3>
              <button onClick={() => {
                setShowDocModal(false);
                setDocFile(null);
              }} className="text-slate-400 hover:text-white">&times;</button>
            </div>

            <form onSubmit={handleAddDocument} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">Choose File (PDF, Image, Drawings, Invoices)</label>
                <input 
                  type="file"
                  required
                  onChange={(e) => setDocFile(e.target.files[0])}
                  className="w-full text-xs text-slate-305 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-sky-500/10 file:text-sky-400 hover:file:bg-sky-500/20 bg-slate-950 border border-slate-705 rounded-md p-1"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">Folder Category</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none"
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

              <div className="flex items-center gap-2 border border-slate-800 p-3 rounded-lg bg-slate-955/40">
                <input 
                  type="checkbox"
                  id="visibleToClientCheckbox"
                  checked={docVisibleToClient}
                  onChange={(e) => setDocVisibleToClient(e.target.checked)}
                  className="accent-sky-500 rounded"
                />
                <label htmlFor="visibleToClientCheckbox" className="text-xs text-slate-300 cursor-pointer select-none">
                  Share with Client (Visible on Client Dashboard)
                </label>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDocModal(false);
                    setDocFile(null);
                  }}
                  className="flex-1 rounded border border-slate-800 bg-slate-905 py-2 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingDoc}
                  className="flex-1 rounded bg-sky-500 py-2 text-xs font-bold text-white hover:bg-sky-600 disabled:opacity-50"
                >
                  {uploadingDoc ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: ADD MATERIAL ENTRY */}
      {showMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-md">Add Material Entry</h3>
              <button onClick={() => setShowMaterialModal(false)} className="text-slate-400 hover:text-white font-bold">&times;</button>
            </div>

            <form onSubmit={handleAddMaterial} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Material Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Portland Cement"
                    value={matName}
                    onChange={(e) => setMatName(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Quantity</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 50 bags"
                    value={matQty}
                    onChange={(e) => setMatQty(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-305 mb-1">Supplier Vendor</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ultratech Ltd"
                    value={matVendor}
                    onChange={(e) => setMatVendor(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-305 mb-1">Unit Rate Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 450"
                    value={matRate}
                    onChange={(e) => setMatRate(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Invoice Receipt URL Attachment (Optional)</label>
                <input
                  type="url"
                  placeholder="https://example.com/receipt.pdf"
                  value={matInvoiceUrl}
                  onChange={(e) => setMatInvoiceUrl(e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowMaterialModal(false)}
                  className="flex-1 rounded border border-slate-800 bg-slate-905 py-2 text-xs font-bold text-slate-300"
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

      {/* MODAL 8: ADD TIMELINE TASK */}
      {showTimelineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-md">Add Timeline Milestone</h3>
              <button onClick={() => setShowTimelineModal(false)} className="text-slate-400 hover:text-white font-bold">&times;</button>
            </div>

            <form onSubmit={handleAddTimeline} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Milestone / Deliverable Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electrical Layout Conduit Signoff"
                  value={timeTask}
                  onChange={(e) => setTimeTask(e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Milestone Target Date</label>
                  <input
                    type="date"
                    required
                    value={timeDeadline}
                    onChange={(e) => setTimeDeadline(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-955 px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Priority Rank</label>
                  <select
                    value={timePriority}
                    onChange={(e) => setTimePriority(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-955 px-3 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-305 mb-1">Timeline Stage Status</label>
                  <select
                    value={timeStatus}
                    onChange={(e) => setTimeStatus(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-955 px-3 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-305 mb-1">Scope Complete (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={timeProgress}
                    onChange={(e) => setTimeProgress(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-955 px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowTimelineModal(false)}
                  className="flex-1 rounded border border-slate-800 bg-slate-905 py-2 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded bg-sky-500 py-2 text-xs font-bold text-white hover:bg-sky-600"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 9: ADD COST ACCOUNT ITEM */}
      {showCostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-805 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-md">Add Invoice Expense Item</h3>
              <button onClick={() => setShowCostModal(false)} className="text-slate-400 hover:text-white font-bold">&times;</button>
            </div>

            <form onSubmit={handleAddCost} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Expense Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masonry Brick supply invoice"
                  value={costItem}
                  onChange={(e) => setCostItem(e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Price Cost (₹ INR)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 15000"
                    value={costAmount}
                    onChange={(e) => setCostAmount(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Category Type</label>
                  <select
                    value={costCategory}
                    onChange={(e) => setCostCategory(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="Materials">Materials</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Labour">Labour Force</option>
                    <option value="Permits">Permits / Licenses</option>
                    <option value="Subcontractor">Subcontractor Fees</option>
                    <option value="Other">Other Expenses</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-305 mb-1">Payment Status</label>
                  <select
                    value={costStatus}
                    onChange={(e) => setCostStatus(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="Pending">Pending (Unpaid)</option>
                    <option value="Paid">Paid Settlement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-305 mb-1">Invoice Receipt PDF URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://example.com/receipt.pdf"
                    value={costInvoiceUrl}
                    onChange={(e) => setCostInvoiceUrl(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCostModal(false)}
                  className="flex-1 rounded border border-slate-805 bg-slate-905 py-2 text-xs font-bold text-slate-300"
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

      {/* MODAL 10: ADD NEW LABOUR */}
      {showAddLabourModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-md">Add New Labour Profile</h3>
              <button onClick={() => setShowAddLabourModal(false)} className="text-slate-400 hover:text-white font-bold">&times;</button>
            </div>

            <form onSubmit={handleAddLabour} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Labour Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Kumar"
                    value={labourName}
                    onChange={(e) => setLabourName(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={labourPhone}
                    onChange={(e) => setLabourPhone(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Skill Category</label>
                  <select
                    value={labourRole}
                    onChange={(e) => setLabourRole(e.target.value)}
                    className="w-full rounded border border-slate-705 bg-slate-950 px-2 py-1.5 text-white focus:outline-none"
                  >
                    <option value="Mason">Mason</option>
                    <option value="Carpenter">Carpenter</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Plumber">Plumber</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Helper">Helper</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={labourStatus}
                    onChange={(e) => setLabourStatus(e.target.value)}
                    className="w-full rounded border border-slate-705 bg-slate-950 px-2 py-1.5 text-white focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Joining Date</label>
                  <input
                    type="date"
                    required
                    value={labourJoinDate}
                    onChange={(e) => setLabourJoinDate(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Home Address</label>
                <input
                  type="text"
                  placeholder="e.g. 12, Gandhi Nagar, Bangalore"
                  value={labourAddress}
                  onChange={(e) => setLabourAddress(e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Emergency Contact (Relation - Phone)</label>
                  <input
                    type="text"
                    placeholder="e.g. Sita Devi (Wife) - +91 98765 43215"
                    value={labourEmergency}
                    onChange={(e) => setLabourEmergency(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">ID Proof Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. Aadhaar Card: XXXX-XXXX-1234"
                    value={labourIdProof}
                    onChange={(e) => setLabourIdProof(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-1.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddLabourModal(false)}
                  className="flex-1 rounded border border-slate-800 bg-slate-905 py-2.5 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded bg-sky-500 py-2.5 text-xs font-bold text-white hover:bg-sky-600"
                >
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILED LABOUR PROFILE MODAL */}
      {selectedLabourForProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl overflow-y-auto max-h-[90vh] space-y-6">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-850 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <HardHat className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-md sm:text-lg">{selectedLabourForProfile.name}</h3>
                  <span className="text-[10px] text-slate-500 font-mono">Labour ID Reference: {selectedLabourForProfile.id}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded border uppercase ${
                  selectedLabourForProfile.status === 'Active' 
                    ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20' 
                    : 'bg-slate-850 text-slate-400 border-slate-700'
                }`}>
                  {selectedLabourForProfile.status}
                </span>
                
                <button 
                  onClick={() => setSelectedLabourForProfile(null)} 
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Personal Details */}
              <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-850 space-y-3.5">
                <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider border-b border-slate-900 pb-2 flex items-center gap-1">
                  <Users className="h-4 w-4" /> Personal Information
                </h4>
                
                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                  <div>
                    <span className="text-slate-550 block font-medium">Contact Phone</span>
                    <span className="text-white font-semibold mt-0.5 block">{selectedLabourForProfile.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-555 block font-medium">Skill Skill Category</span>
                    <span className="text-white font-semibold mt-0.5 block">{selectedLabourForProfile.role}</span>
                  </div>
                  <div>
                    <span className="text-slate-555 block font-medium">Emergency Contact</span>
                    <span className="text-white font-medium mt-0.5 block">{selectedLabourForProfile.emergencyContact || 'None listed'}</span>
                  </div>
                  <div>
                    <span className="text-slate-555 block font-medium">Date of Joining</span>
                    <span className="text-white font-mono mt-0.5 block">{selectedLabourForProfile.joiningDate || selectedLabourForProfile.joinDate}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-555 block font-medium">ID Proof Info</span>
                    <span className="text-slate-300 mt-0.5 block font-mono">{selectedLabourForProfile.idProof || 'Not provided'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-555 block font-medium">Residential Address</span>
                    <span className="text-slate-300 mt-0.5 block">{selectedLabourForProfile.address || 'No address registered'}</span>
                  </div>
                </div>
              </div>

              {/* Work Details & History */}
              <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-850 space-y-3.5 flex flex-col justify-between">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider border-b border-slate-900 pb-2 flex items-center gap-1">
                    <ClipboardList className="h-4 w-4" /> Work Specifications
                  </h4>
                  
                  <div className="text-xs space-y-2">
                    <p className="flex justify-between">
                      <span className="text-slate-500">Employment Status:</span>
                      <strong className={selectedLabourForProfile.status === 'Active' ? 'text-emerald-450' : 'text-slate-400'}>
                        {selectedLabourForProfile.status === 'Active' ? 'Active Duty' : 'On Leave / Terminated'}
                      </strong>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-500">Current Assigned Site:</span>
                      <strong className="text-white">
                        {selectedLabourAttendance.length > 0 && selectedLabourAttendance[0].status === 'Present'
                          ? selectedLabourAttendance[0].projectName 
                          : 'Unassigned / Absent today'}
                      </strong>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-500">Attendance Ratio (Seeded):</span>
                      <strong className="text-sky-400">
                        {selectedLabourAttendance.length > 0 
                          ? Math.round((selectedLabourAttendance.filter(a => a.status === 'Present' || a.status === 'Half Day').length / selectedLabourAttendance.length) * 100) + '%'
                          : '100%'}
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-900 text-xs">
                  <button
                    onClick={() => handleToggleLabourStatus(selectedLabourForProfile)}
                    className={`w-full text-center py-2 rounded-lg font-bold transition-all border ${
                      selectedLabourForProfile.status === 'Active'
                        ? 'bg-rose-500/10 text-rose-455 border-rose-500/20 hover:bg-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-455 border-emerald-500/20 hover:bg-emerald-500/20'
                    }`}
                  >
                    {selectedLabourForProfile.status === 'Active' ? 'Deactivate Labour Profile' : 'Activate Labour Profile'}
                  </button>
                </div>
              </div>

            </div>

            {/* Attendance Logs History */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider border-b border-slate-850 pb-2 flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> Attendance Registry Logs
              </h4>

              {selectedLabourAttendance.length === 0 ? (
                <div className="text-center py-6 border border-slate-850 rounded-xl text-xs text-slate-550">
                  No attendance history logged for this worker.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-850">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-850 text-slate-500 uppercase font-bold tracking-wider">
                        <th className="py-2.5 px-3">Date Logged</th>
                        <th className="py-2.5 px-3">Assigned Site</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Time Entry</th>
                        <th className="py-2.5 px-3">Remarks / Context</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 bg-slate-950/20">
                      {selectedLabourAttendance.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-900/10">
                          <td className="py-2.5 px-3 font-mono text-slate-350">{log.date}</td>
                          <td className="py-2.5 px-3 text-white font-semibold">{log.projectName}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                              log.status === 'Present' 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : log.status === 'Half Day'
                                  ? 'bg-amber-500/10 text-amber-450 border-amber-500/20'
                                  : 'bg-rose-500/10 text-rose-455 border-rose-500/20'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-400">{log.timeEntry || '--'}</td>
                          <td className="py-2.5 px-3 text-slate-300 italic">"{log.remarks || 'None recorded'}"</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="border-t border-slate-850 pt-4 flex justify-end">
              <button 
                onClick={() => setSelectedLabourForProfile(null)}
                className="rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-900 px-5 py-2.5 text-xs font-bold text-slate-300"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 4: EDIT TOTAL ESTIMATE BUDGET */}
      {showEditBudgetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-md">Update Project Estimate</h3>
              <button onClick={() => setShowEditBudgetModal(false)} className="text-slate-400 hover:text-white font-bold">&times;</button>
            </div>

            <form onSubmit={handleUpdateEstimate} className="mt-4 space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Update the Total Estimate value for the project: <strong>{activeProj?.projectName}</strong>. The client will be notified of this change immediately.
              </p>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">New Budget Estimate (₹ INR)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 1500000"
                  value={editBudgetAmount}
                  onChange={(e) => setEditBudgetAmount(e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-955 px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  autoFocus
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditBudgetModal(false)}
                  className="flex-1 rounded border border-slate-805 bg-slate-905 py-2 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded bg-sky-500 py-2 text-xs font-bold text-white hover:bg-sky-600 shadow"
                >
                  Commit Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 11: CREATE/EDIT PAYMENT STAGE */}
      {showStageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-md">
                {editingStage ? 'Edit Payment Stage' : 'Create Payment Stage'}
              </h3>
              <button 
                onClick={() => setShowStageModal(false)} 
                className="text-slate-400 hover:text-white font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveStage} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Stage Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Foundation Excavation"
                  value={stageName}
                  onChange={(e) => setStageName(e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-955 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Stage Description</label>
                <textarea
                  placeholder="Describe structural completion criteria..."
                  value={stageDescription}
                  onChange={(e) => setStageDescription(e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-955 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Stage Amount (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 150000"
                    value={stageAmount}
                    onChange={(e) => setStageAmount(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-955 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={stageDueDate}
                    onChange={(e) => setStageDueDate(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-955 px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={stageStatus}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      setStageStatus(newStatus);
                      if (newStatus === 'Paid' && stageAmount) {
                        setStagePaidAmount(stageAmount);
                      } else if (newStatus === 'Pending' || newStatus === 'Overdue') {
                        setStagePaidAmount('0');
                      }
                    }}
                    className="w-full rounded border border-slate-700 bg-slate-955 px-3 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Paid Amount (₹)</label>
                  <input
                    type="number"
                    required
                    disabled={stageStatus === 'Pending' || stageStatus === 'Overdue'}
                    placeholder="0"
                    value={stagePaidAmount}
                    onChange={(e) => setStagePaidAmount(e.target.value)}
                    className="w-full rounded border border-slate-700 bg-slate-955 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowStageModal(false)}
                  className="flex-1 rounded border border-slate-805 bg-slate-905 py-2 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded bg-sky-500 py-2 text-xs font-bold text-white hover:bg-sky-600 shadow"
                >
                  {editingStage ? 'Save Changes' : 'Create Stage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX FOR PHOTO PREVIEWS */}
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

          <div className="max-w-4xl max-h-[75vh] relative overflow-hidden rounded-2xl border border-slate-805 shadow-2xl flex items-center justify-center bg-black">
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
                className="flex items-center gap-1 text-xs font-bold bg-slate-900 border border-slate-805 text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-colors"
              >
                <ExternalLink className="h-4 w-4" /> Open Original
              </button>
              <button
                onClick={() => triggerDownload(activeLightboxPhoto.url, 'progress_full.jpg')}
                className="flex items-center gap-1 text-xs font-bold bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg transition-all"
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
