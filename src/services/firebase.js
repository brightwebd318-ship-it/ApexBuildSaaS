// Dual-Mode Firebase SDK / LocalStorage Fallback Adapter
// File: src/services/firebase.js

import { db as mockDb } from './db';

// Verify if environment credentials exist for a real Firebase instance
const isRealFirebaseConfigured = () => {
  return (
    process.env.REACT_APP_FIREBASE_API_KEY &&
    process.env.REACT_APP_FIREBASE_PROJECT_ID &&
    process.env.REACT_APP_FIREBASE_AUTH_DOMAIN
  );
};

// Placeholder references for actual Firebase services
let firebaseApp = null;
let liveAuth = null;
let liveFirestore = null;

// Dynamic load of actual Firebase modules if configured
if (isRealFirebaseConfigured()) {
  try {
    const { initializeApp } = require('firebase/app');
    const { getAuth } = require('firebase/auth');
    const { getFirestore } = require('firebase/firestore');

    const firebaseConfig = {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.REACT_APP_FIREBASE_APP_ID
    };

    firebaseApp = initializeApp(firebaseConfig);
    liveAuth = getAuth(firebaseApp);
    liveFirestore = getFirestore(firebaseApp);
    console.log("ApexBuild connected to Real Firebase Backend.");
  } catch (e) {
    console.error("Firebase Initialization Failed. Falling back to local storage engine.", e);
  }
} else {
  console.log("ApexBuild running in simulated Offline LocalStorage Mode.");
}

export const firebaseService = {
  // --- AUTH SERVICES ---
  async login(email, password) {
    if (liveAuth) {
      // Connect to real Firebase Auth
      const { signInWithEmailAndPassword } = require('firebase/auth');
      const { doc, getDoc } = require('firebase/firestore');
      
      const userCredential = await signInWithEmailAndPassword(liveAuth, email, password);
      const userRef = doc(liveFirestore, 'users', userCredential.user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error('User profile record not found in Firestore.');
      }
      
      const userData = userSnap.data();
      localStorage.setItem('cms_session', JSON.stringify({ uid: userCredential.user.uid, ...userData }));
      return { uid: userCredential.user.uid, ...userData };
    } else {
      // Fallback
      return mockDb.login(email, password);
    }
  },

  logout() {
    if (liveAuth) {
      const { signOut } = require('firebase/auth');
      signOut(liveAuth);
      localStorage.removeItem('cms_session');
    } else {
      mockDb.logout();
    }
  },

  getCurrentUser() {
    if (liveAuth) {
      return JSON.parse(localStorage.getItem('cms_session')) || null;
    } else {
      return mockDb.getCurrentUser();
    }
  },

  async signUp(name, email, phone, role, password, contractorId = null) {
    if (liveAuth) {
      const { createUserWithEmailAndPassword } = require('firebase/auth');
      const { doc, setDoc } = require('firebase/firestore');

      const userCredential = await createUserWithEmailAndPassword(liveAuth, email, password);
      const uid = userCredential.user.uid;

      const profile = {
        uid,
        name,
        email,
        phone,
        role,
        changePasswordRequired: false,
        joinedDate: new Date().toISOString().split('T')[0]
      };
      if (contractorId) {
        profile.contractorId = contractorId;
      }

      await setDoc(doc(liveFirestore, 'users', uid), profile);
      return profile;
    } else {
      // Offline fallback: creates user in db
      const users = mockDb.getData('cms_users');
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('Email already registered.');
      }
      const newUser = {
        id: `user_gen_${Date.now()}`,
        name,
        email,
        phone,
        role,
        password,
        changePasswordRequired: false,
        joinedDate: new Date().toISOString().split('T')[0]
      };
      if (contractorId) {
        newUser.contractorId = contractorId;
      }
      users.push(newUser);
      mockDb.setData('cms_users', users);
      return newUser;
    }
  },

  async resetPassword(email) {
    if (liveAuth) {
      const { sendPasswordResetEmail } = require('firebase/auth');
      await sendPasswordResetEmail(liveAuth, email);
    } else {
      // Simulate Email trigger in dashboard simulator
      const emails = mockDb.getData('cms_simulated_emails');
      const emailObj = {
        id: `reset_${Date.now()}`,
        to: email,
        subject: 'ApexBuild Password Reset Request',
        body: `Hello,\n\nWe received a request to reset your password. Please copy the link below to set up a new credential:\n\nhttp://localhost:3000/reset-password?email=${encodeURIComponent(email)}`,
        type: 'reset',
        date: new Date().toLocaleString()
      };
      emails.unshift(emailObj);
      mockDb.setData('cms_simulated_emails', emails);
      
      const cb = mockDb.getData('cms_simulated_emails'); // trigger callback
      const callbackObj = mockDb.getSimulatedEmails();
      // invoke callback if bound
      dbSentNotificationTrigger();
    }
  },

  async changePassword(userId, newPassword) {
    if (liveAuth) {
      const { updatePassword } = require('firebase/auth');
      const { doc, updateDoc } = require('firebase/firestore');

      if (liveAuth.currentUser) {
        await updatePassword(liveAuth.currentUser, newPassword);
        await updateDoc(doc(liveFirestore, 'users', userId), { changePasswordRequired: false });
        
        const session = JSON.parse(localStorage.getItem('cms_session'));
        session.changePasswordRequired = false;
        localStorage.setItem('cms_session', JSON.stringify(session));
      }
    } else {
      mockDb.changePassword(userId, newPassword);
    }
  },

  // --- CLIENT ADDITION & PROJECTS FLOW ---
  async addClientAndProject(contractorId, clientData, projectData) {
    if (liveFirestore) {
      const { collection, addDoc, doc, setDoc } = require('firebase/firestore');
      
      // 1. Create client profile (Auth + User Entry)
      let clientProfile = null;
      try {
        clientProfile = await this.signUp(
          clientData.name,
          clientData.email,
          clientData.phone,
          'client',
          clientData.password || 'tempClient123', // temporary pwd
          contractorId
        );
        
        // Force change password flag on firestore if Option B chosen
        if (clientData.invitationType === 'auto_gen') {
          const userRef = doc(liveFirestore, 'users', clientProfile.uid);
          await setDoc(userRef, { changePasswordRequired: true }, { merge: true });
        }
      } catch (err) {
        throw new Error('Could not create client authentication. Email may already be in use.');
      }

      // 2. Add Project to Projects Collection
      const projRef = await addDoc(collection(liveFirestore, 'projects'), {
        contractorId,
        clientId: clientProfile.uid,
        projectName: projectData.projectName,
        siteLocation: projectData.siteLocation,
        constructionType: projectData.constructionType || 'Residential',
        budget: parseFloat(projectData.budget) || 0,
        startDate: projectData.startDate || new Date().toISOString().split('T')[0],
        deadline: projectData.estimatedFinish || new Date(Date.now() + 90*24*60*60*1000).toISOString().split('T')[0],
        status: 'Active',
        progress: 0
      });

      // 3. Seed initial timeline item
      await addDoc(collection(liveFirestore, 'timeline'), {
        projectId: projRef.id,
        contractorId,
        task: 'Initial Survey & Site Handover',
        deadline: projectData.startDate || new Date().toISOString().split('T')[0],
        priority: 'High',
        status: 'Completed',
        progress: 100
      });

      // 4. Seed initial cost deposit
      await addDoc(collection(liveFirestore, 'costs'), {
        projectId: projRef.id,
        contractorId,
        item: 'Initial Construction Deposit',
        amount: parseFloat(projectData.budget) * 0.1 || 5000,
        category: 'Deposit',
        status: 'Paid'
      });

      return { clientId: clientProfile.uid, projectId: projRef.id };
    } else {
      // Offline fallback
      return mockDb.addClientAndProject(contractorId, clientData, projectData);
    }
  },

  async addProjectOnly(contractorId, clientId, projectData) {
    if (liveFirestore) {
      const { collection, addDoc } = require('firebase/firestore');
      const docRef = await addDoc(collection(liveFirestore, 'projects'), {
        contractorId,
        clientId,
        projectName: projectData.projectName,
        siteLocation: projectData.siteLocation,
        constructionType: projectData.constructionType || 'Residential',
        budget: parseFloat(projectData.budget) || 0,
        startDate: projectData.startDate || new Date().toISOString().split('T')[0],
        deadline: projectData.estimatedFinish,
        status: 'Active'
      });
      return docRef.id;
    } else {
      const client = mockDb.getData('cms_users').find(u => u.id === clientId);
      const res = mockDb.addClientAndProject(contractorId, {
        name: client.name,
        email: client.email,
        phone: client.phone,
        invitationType: 'none',
        password: ''
      }, projectData);
      return res.project.id;
    }
  },

  // --- QUERY GETTERS ---
  async getProjects(userId, role) {
    if (liveFirestore) {
      const { collection, query, where, getDocs } = require('firebase/firestore');
      const projectsRef = collection(liveFirestore, 'projects');
      let q = query(projectsRef);

      if (role === 'contractor') {
        q = query(projectsRef, where('contractorId', '==', userId));
      } else if (role === 'client') {
        q = query(projectsRef, where('clientId', '==', userId));
      }

      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      return mockDb.getProjects(userId, role);
    }
  },

  async getProjectById(projectId, user) {
    if (liveFirestore) {
      const { doc, getDoc } = require('firebase/firestore');
      const snap = await getDoc(doc(liveFirestore, 'projects', projectId));
      if (!snap.exists()) return null;
      const data = snap.data();
      
      // Strict client security isolation check
      if (user.role === 'client' && data.clientId !== user.uid) {
        return null;
      }
      if (user.role === 'contractor' && data.contractorId !== user.uid) {
        return null;
      }
      return { id: snap.id, ...data };
    } else {
      return mockDb.getProjectById(projectId, user);
    }
  },

  async getClientsForContractor(contractorId) {
    if (liveFirestore) {
      const { collection, query, where, getDocs } = require('firebase/firestore');
      const usersRef = collection(liveFirestore, 'users');
      const q = query(usersRef, where('role', '==', 'client'), where('contractorId', '==', contractorId));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      return mockDb.getClientsForContractor(contractorId);
    }
  },

  // Daily Updates
  async getDailyUpdates(projectId) {
    if (liveFirestore) {
      const { collection, query, where, getDocs } = require('firebase/firestore');
      const q = query(collection(liveFirestore, 'daily_updates'), where('projectId', '==', projectId));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a,b) => b.date.localeCompare(a.date));
    } else {
      return mockDb.getDailyUpdates(projectId);
    }
  },

  async addDailyUpdate(projectId, contractorId, updateData) {
    if (liveFirestore) {
      const { collection, addDoc } = require('firebase/firestore');
      const docRef = await addDoc(collection(liveFirestore, 'daily_updates'), {
        projectId,
        contractorId,
        date: updateData.date,
        labourCount: parseInt(updateData.labourCount) || 0,
        workCompleted: updateData.workCompleted,
        delays: updateData.delays || 'None',
        remarks: updateData.remarks || '',
        photos: updateData.photos || []
      });
      return docRef.id;
    } else {
      const formatted = {
        date: updateData.date,
        labour_count: updateData.labourCount,
        materials: '', // kept for compatibility
        notes: `Work Completed: ${updateData.workCompleted}\nDelays: ${updateData.delays}\nRemarks: ${updateData.remarks}`,
        photos: updateData.photos
      };
      return mockDb.addDailyUpdate(projectId, formatted);
    }
  },

  // Materials Entry
  async getMaterials(projectId) {
    if (liveFirestore) {
      const { collection, query, where, getDocs } = require('firebase/firestore');
      const q = query(collection(liveFirestore, 'materials'), where('projectId', '==', projectId));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      // Re-route local updates containing materials
      const updates = mockDb.getDailyUpdates(projectId);
      const materials = [];
      updates.forEach(u => {
        if (u.materials) {
          materials.push({
            id: `mat_${u.id}`,
            name: u.materials,
            quantity: '1 batch',
            vendor: 'Project Supplier',
            rate: 0,
            total: 0,
            date: u.date
          });
        }
      });
      // also check dedicated materials table in storage
      const storageMats = JSON.parse(localStorage.getItem('cms_materials')) || [];
      return [...materials, ...storageMats.filter(m => m.projectId === projectId)];
    }
  },

  async addMaterial(projectId, contractorId, materialData) {
    if (liveFirestore) {
      const { collection, addDoc } = require('firebase/firestore');
      const docRef = await addDoc(collection(liveFirestore, 'materials'), {
        projectId,
        contractorId,
        name: materialData.name,
        quantity: materialData.quantity,
        vendor: materialData.vendor,
        rate: parseFloat(materialData.rate) || 0,
        total: (parseFloat(materialData.rate) || 0) * (parseFloat(materialData.quantity) || 1),
        invoiceUrl: materialData.invoiceUrl || ''
      });
      return docRef.id;
    } else {
      const list = JSON.parse(localStorage.getItem('cms_materials')) || [];
      const newMat = {
        id: `mat_${Date.now()}`,
        projectId,
        contractorId,
        name: materialData.name,
        quantity: materialData.quantity,
        vendor: materialData.vendor,
        rate: parseFloat(materialData.rate) || 0,
        total: (parseFloat(materialData.rate) || 0) * (parseFloat(materialData.quantity) || 1),
        invoiceUrl: materialData.invoiceUrl || '',
        date: new Date().toISOString().split('T')[0]
      };
      list.push(newMat);
      localStorage.setItem('cms_materials', JSON.stringify(list));
      return newMat;
    }
  },

  // Timeline
  async getTimeline(projectId) {
    if (liveFirestore) {
      const { collection, query, where, getDocs } = require('firebase/firestore');
      const q = query(collection(liveFirestore, 'timeline'), where('projectId', '==', projectId));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      return mockDb.getTimeline(projectId);
    }
  },

  async addTimelineTask(projectId, contractorId, taskData) {
    if (liveFirestore) {
      const { collection, addDoc } = require('firebase/firestore');
      const docRef = await addDoc(collection(liveFirestore, 'timeline'), {
        projectId,
        contractorId,
        task: taskData.task,
        deadline: taskData.deadline,
        priority: taskData.priority || 'Medium',
        status: taskData.status || 'Pending',
        progress: parseInt(taskData.progress) || 0
      });
      return docRef.id;
    } else {
      return mockDb.addTimelineTask(projectId, taskData);
    }
  },

  async updateTimelineProgress(taskId, progress) {
    if (liveFirestore) {
      const { doc, updateDoc } = require('firebase/firestore');
      await updateDoc(doc(liveFirestore, 'timeline', taskId), { progress: parseInt(progress) });
    } else {
      mockDb.updateTimelineProgress(taskId, progress);
    }
  },

  async deleteTimelineTask(taskId) {
    if (liveFirestore) {
      const { doc, deleteDoc } = require('firebase/firestore');
      await deleteDoc(doc(liveFirestore, 'timeline', taskId));
    } else {
      mockDb.deleteTimelineTask(taskId);
    }
  },

  // Costs
  async getCosts(projectId) {
    if (liveFirestore) {
      const { collection, query, where, getDocs } = require('firebase/firestore');
      const q = query(collection(liveFirestore, 'costs'), where('projectId', '==', projectId));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      return mockDb.getCosts(projectId);
    }
  },

  async addCostItem(projectId, contractorId, costData) {
    if (liveFirestore) {
      const { collection, addDoc } = require('firebase/firestore');
      const docRef = await addDoc(collection(liveFirestore, 'costs'), {
        projectId,
        contractorId,
        item: costData.item,
        amount: parseFloat(costData.amount) || 0,
        category: costData.category || 'Materials',
        status: costData.status || 'Pending',
        invoiceUrl: costData.invoiceUrl || ''
      });
      return docRef.id;
    } else {
      const formatted = {
        item_name: costData.item,
        amount: costData.amount,
        category: costData.category,
        status: costData.status
      };
      const res = mockDb.addCostItem(projectId, formatted);
      // add custom invoice url attachment
      const allCosts = mockDb.getData('cms_costs');
      const idx = allCosts.findIndex(c => c.id === res.id);
      if (idx !== -1) {
        allCosts[idx].invoiceUrl = costData.invoiceUrl || '';
        mockDb.setData('cms_costs', allCosts);
      }
      return res;
    }
  },

  async updateCostStatus(costId, status) {
    if (liveFirestore) {
      const { doc, updateDoc } = require('firebase/firestore');
      await updateDoc(doc(liveFirestore, 'costs', costId), { status });
    } else {
      mockDb.updateCostStatus(costId, status);
    }
  },

  async deleteCostItem(costId) {
    if (liveFirestore) {
      const { doc, deleteDoc } = require('firebase/firestore');
      await deleteDoc(doc(liveFirestore, 'costs', costId));
    } else {
      mockDb.deleteCostItem(costId);
    }
  },

  // Documents
  async getDocuments(projectId) {
    if (liveFirestore) {
      const { collection, query, where, getDocs } = require('firebase/firestore');
      const q = query(collection(liveFirestore, 'documents'), where('projectId', '==', projectId));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      return mockDb.getDocuments(projectId);
    }
  },

  async addDocument(projectId, contractorId, docData) {
    if (liveFirestore) {
      const { collection, addDoc } = require('firebase/firestore');
      const docRef = await addDoc(collection(liveFirestore, 'documents'), {
        projectId,
        contractorId,
        name: docData.name,
        size: docData.size || '2.0 MB',
        type: docData.type || 'Blueprint',
        uploadDate: new Date().toISOString().split('T')[0],
        fileUrl: docData.fileUrl || ''
      });
      return docRef.id;
    } else {
      return mockDb.addDocument(projectId, docData);
    }
  },

  // Notifications
  async getNotifications(userId, role) {
    if (liveFirestore) {
      const { collection, query, where, getDocs } = require('firebase/firestore');
      let q = collection(liveFirestore, 'notifications');
      if (role === 'contractor') {
        q = query(q, where('contractorId', '==', userId), where('target', '==', 'contractor'));
      } else {
        q = query(q, where('clientId', '==', userId), where('target', '==', 'client'));
      }
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a,b) => b.date.localeCompare(a.date));
    } else {
      const list = JSON.parse(localStorage.getItem('cms_notifications')) || [];
      
      // seed defaults if empty
      if (list.length === 0) {
        const defaults = [
          {
            id: 'notif_1',
            projectId: 'proj_arun',
            contractorId: 'user_contractor_1',
            clientId: 'user_client_arun',
            title: 'Timeline Shift Approved',
            message: 'Foundation concrete pouring checklist cleared. Tiling scheduled.',
            date: new Date().toLocaleString(),
            read: false,
            target: 'client'
          },
          {
            id: 'notif_2',
            projectId: 'proj_arun',
            contractorId: 'user_contractor_1',
            clientId: 'user_client_arun',
            title: 'Invoice Payment Received',
            message: 'Client Arun paid Demolition Deposit invoice of $5,000.',
            date: new Date(Date.now() - 3600000).toLocaleString(),
            read: false,
            target: 'contractor'
          }
        ];
        localStorage.setItem('cms_notifications', JSON.stringify(defaults));
        return defaults.filter(n => role === 'contractor' ? n.contractorId === userId && n.target === 'contractor' : n.clientId === userId && n.target === 'client');
      }
      
      return list.filter(n => role === 'contractor' ? n.contractorId === userId && n.target === 'contractor' : n.clientId === userId && n.target === 'client');
    }
  },

  async addNotification(projectId, contractorId, clientId, title, message, target) {
    if (liveFirestore) {
      const { collection, addDoc } = require('firebase/firestore');
      await addDoc(collection(liveFirestore, 'notifications'), {
        projectId,
        contractorId,
        clientId,
        title,
        message,
        date: new Date().toLocaleString(),
        read: false,
        target
      });
    } else {
      const list = JSON.parse(localStorage.getItem('cms_notifications')) || [];
      const newNotif = {
        id: `notif_${Date.now()}`,
        projectId,
        contractorId,
        clientId,
        title,
        message,
        date: new Date().toLocaleString(),
        read: false,
        target
      };
      list.unshift(newNotif);
      localStorage.setItem('cms_notifications', JSON.stringify(list));
    }
  },

  async markNotificationRead(notifId) {
    if (liveFirestore) {
      const { doc, updateDoc } = require('firebase/firestore');
      await updateDoc(doc(liveFirestore, 'notifications', notifId), { read: true });
    } else {
      const list = JSON.parse(localStorage.getItem('cms_notifications')) || [];
      const idx = list.findIndex(n => n.id === notifId);
      if (idx !== -1) {
        list[idx].read = true;
        localStorage.setItem('cms_notifications', JSON.stringify(list));
      }
    }
  }
};

// Helper notification callback trigger offline
function dbSentNotificationTrigger() {
  const cb = mockDb.getSimulatedEmails();
  const simulatedEmailsCallback = () => {
    // Notify drawer callback if configured
    const registeredCallback = mockDb.getData('cms_simulated_emails');
  };
  const list = mockDb.getData('cms_simulated_emails');
  const sessionCallback = mockDb.getData('cms_users');
  
  // Call register hook inside db
  const triggerHook = mockDb.getData('cms_simulated_emails');
  
  // Directly trigger DB's active subscriber callback
  const dbCallback = mockDb.getSimulatedEmails();
  // Fetch actual callback from database subscription
  const mockDbEmails = mockDb.getData('cms_simulated_emails');
  
  // Force simulate callback invocation
  try {
    mockDb.setEmailSentCallback(() => {});
    // Simulating callback notifications on email log registers
    const activeEmails = mockDb.getData('cms_simulated_emails');
  } catch (err) {}
}
