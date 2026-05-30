// LocalStorage Database Fallback for SaaS Construction Management Platform
// File: src/services/db.js

const KEYS = {
  USERS: 'cms_users',
  PROJECTS: 'cms_projects',
  UPDATES: 'cms_updates',
  TIMELINE: 'cms_timeline',
  COSTS: 'cms_costs',
  DOCUMENTS: 'cms_documents',
  SESSION: 'cms_session',
  EMAILS: 'cms_simulated_emails',
  NOTIFICATIONS: 'cms_notifications',
  PHOTOS: 'cms_photos',
  LABOURS: 'cms_labours',
  ATTENDANCE: 'cms_attendance',
  PAYMENT_STAGES: 'cms_payment_stages'
};

let emailSentCallback = () => {};

export const db = {
  setEmailSentCallback(cb) {
    emailSentCallback = cb;
  },

  triggerEmailSentCallback() {
    if (typeof emailSentCallback === 'function') {
      emailSentCallback();
    }
  },

  init() {
    if (!localStorage.getItem(KEYS.USERS)) {
      this.seed();
      return;
    }

    // Ensure all default users exist and have the correct credentials and projects in localStorage
    try {
      const users = JSON.parse(localStorage.getItem(KEYS.USERS)) || [];
      const defaultUsers = [
        {
          id: 'user_contractor_1',
          name: 'BuildSmart Solutions LLC',
          email: 'contractor@gmail.com',
          password: 'contractor123',
          role: 'contractor',
          phone: '+1 (555) 019-9000',
          joinedDate: '2026-01-10'
        },
        {
          id: 'user_client_arun',
          name: 'Arun',
          email: 'arun@gmail.com',
          password: 'Arun@2026',
          role: 'client',
          phone: '+91 (555) 888-0001',
          contractorId: 'user_contractor_1'
        },
        {
          id: 'user_client_manu',
          name: 'Manu',
          email: 'manu@gmail.com',
          password: 'Manu@2026',
          role: 'client',
          phone: '+91 (555) 888-0002',
          contractorId: 'user_contractor_1'
        }
      ];

      let usersModified = false;
      defaultUsers.forEach(defUser => {
        const idx = users.findIndex(u => u.email.toLowerCase() === defUser.email.toLowerCase());
        if (idx === -1) {
          users.push(defUser);
          usersModified = true;
        } else {
          // If the password of the default user doesn't match the expected password, update it
          if (users[idx].password !== defUser.password) {
            users[idx].password = defUser.password;
            usersModified = true;
          }
          // Ensure role matches
          if (users[idx].role !== defUser.role) {
            users[idx].role = defUser.role;
            usersModified = true;
          }
        }
      });

      if (usersModified) {
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));
      }

      // Also verify that projects exist for the default users
      const projects = JSON.parse(localStorage.getItem(KEYS.PROJECTS)) || [];
      const defaultProjects = [
        {
          id: 'proj_arun',
          contractorId: 'user_contractor_1',
          clientId: 'user_client_arun',
          projectName: 'Arun Villa Project',
          siteLocation: 'Plot 45, Sector 4, Bangalore, India',
          constructionType: 'Residential Villa',
          budget: 1500000,
          startDate: '2026-05-01',
          estimatedFinish: '2026-12-15',
          status: 'Active'
        },
        {
          id: 'proj_manu',
          contractorId: 'user_contractor_1',
          clientId: 'user_client_manu',
          projectName: 'Manu Residence',
          siteLocation: 'Villa 12, Palm Meadows, Austin, TX',
          constructionType: 'Modern Townhouse',
          budget: 950000,
          startDate: '2026-04-10',
          estimatedFinish: '2026-10-30',
          status: 'Active'
        }
      ];

      let projectsModified = false;
      defaultProjects.forEach(defProj => {
        const idx = projects.findIndex(p => p.id === defProj.id);
        if (idx === -1) {
          projects.push(defProj);
          projectsModified = true;
        }
      });

      if (projectsModified) {
        localStorage.setItem(KEYS.PROJECTS, JSON.stringify(projects));
      }
      
      // Also ensure that standard stages and timeline tasks for these projects are seeded
      // if those tables are completely missing
      if (!localStorage.getItem(KEYS.PAYMENT_STAGES)) {
        this.seed();
      }
    } catch (e) {
      console.error("Error repairing/verifying users in init, re-seeding:", e);
      this.seed();
    }
  },

  seed() {
    // 1. Seed Users (Contractor and Clients only, no system admin)
    const users = [
      {
        id: 'user_contractor_1',
        name: 'BuildSmart Solutions LLC',
        email: 'contractor@gmail.com',
        password: 'contractor123',
        role: 'contractor',
        phone: '+1 (555) 019-9000',
        joinedDate: '2026-01-10'
      },
      {
        id: 'user_client_arun',
        name: 'Arun',
        email: 'arun@gmail.com',
        password: 'Arun@2026',
        role: 'client',
        phone: '+91 (555) 888-0001',
        contractorId: 'user_contractor_1'
      },
      {
        id: 'user_client_manu',
        name: 'Manu',
        email: 'manu@gmail.com',
        password: 'Manu@2026',
        role: 'client',
        phone: '+91 (555) 888-0002',
        contractorId: 'user_contractor_1'
      }
    ];

    // 2. Seed Projects (One Client -> One Project)
    const projects = [
      {
        id: 'proj_arun',
        contractorId: 'user_contractor_1',
        clientId: 'user_client_arun',
        projectName: 'Arun Villa Project',
        siteLocation: 'Plot 45, Sector 4, Bangalore, India',
        constructionType: 'Residential Villa',
        budget: 1500000,
        startDate: '2026-05-01',
        estimatedFinish: '2026-12-15',
        status: 'Active'
      },
      {
        id: 'proj_manu',
        contractorId: 'user_contractor_1',
        clientId: 'user_client_manu',
        projectName: 'Manu Residence',
        siteLocation: 'Villa 12, Palm Meadows, Austin, TX',
        constructionType: 'Modern Townhouse',
        budget: 950000,
        startDate: '2026-04-10',
        estimatedFinish: '2026-10-30',
        status: 'Active'
      }
    ];

    // 3. Seed Daily Updates
    const updates = [
      {
        id: 'upd_arun_1',
        project_id: 'proj_arun', // maps to projectId in firebaseService
        date: '2026-05-24',
        labour_count: 12,
        materials: 'Ready-mix concrete M25 grade, Steel reinforcing mesh',
        notes: 'Work Completed: Excavation completed for pool foundation slab. Structural steel frame assembled. Concrete pouring successfully completed by evening.\nDelays: None\nRemarks: Foundation concrete is currently curing.',
        photos: [
          'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        id: 'upd_manu_1',
        project_id: 'proj_manu',
        date: '2026-05-25',
        labour_count: 8,
        materials: 'Cedar privacy panels (120 units)',
        notes: 'Work Completed: Installed cedar privacy fencing panels along backyard boundaries.\nDelays: None\nRemarks: Began weather proofing stains.',
        photos: [
          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'
        ]
      }
    ];

    // 4. Seed Timelines
    const timeline = [
      { id: 'time_arun_1', project_id: 'proj_arun', task: 'Excavation & Ground Leveling', deadline: '2026-05-12', progress: 100, priority: 'High', status: 'Completed' },
      { id: 'time_arun_2', project_id: 'proj_arun', task: 'Concrete Foundation Casting', deadline: '2026-05-26', progress: 100, priority: 'High', status: 'Completed' },
      { id: 'time_arun_3', project_id: 'proj_arun', task: 'Main Pool Tiling & Plumbing Layout', deadline: '2026-07-15', progress: 15, priority: 'Medium', status: 'In Progress' },
      { id: 'time_arun_4', project_id: 'proj_arun', task: 'Stone Deck Paving & Coping', deadline: '2026-09-10', progress: 0, priority: 'Low', status: 'Pending' },

      { id: 'time_manu_1', project_id: 'proj_manu', task: 'Grading & Driveway Gravel Layout', deadline: '2026-04-25', progress: 100, priority: 'High', status: 'Completed' },
      { id: 'time_manu_2', project_id: 'proj_manu', task: 'Cedar Privacy Fence Build', deadline: '2026-05-28', progress: 95, priority: 'Medium', status: 'In Progress' },
      { id: 'time_manu_3', project_id: 'proj_manu', task: 'Patio Paving & Lighting installation', deadline: '2026-07-20', progress: 10, priority: 'Low', status: 'Pending' }
    ];

    // 5. Seed Costs
    const costs = [
      { id: 'cost_arun_1', project_id: 'proj_arun', item_name: 'Excavator & Earthmover Rental Fee', amount: 54000, category: 'Equipment', status: 'Paid', invoiceUrl: 'https://example.com/invoice.pdf' },
      { id: 'cost_arun_2', project_id: 'proj_arun', item_name: 'Ready-mix Concrete Cast Slab', amount: 112000, category: 'Materials', status: 'Paid', invoiceUrl: '' },
      { id: 'cost_arun_3', project_id: 'proj_arun', item_name: 'Blue Mosaic Ceramic Tiling supply', amount: 67000, category: 'Materials', status: 'Pending', invoiceUrl: '' },

      { id: 'cost_manu_1', project_id: 'proj_manu', item_name: 'Cedar fence planks & posts supply', amount: 48000, category: 'Materials', status: 'Paid', invoiceUrl: '' },
      { id: 'cost_manu_2', project_id: 'proj_manu', item_name: 'Compact gravel & grading machinery', amount: 31000, category: 'Subcontractor', status: 'Paid', invoiceUrl: '' },
      { id: 'cost_manu_3', project_id: 'proj_manu', item_name: 'Patio Paving Blocks delivery', amount: 59000, category: 'Materials', status: 'Pending', invoiceUrl: '' }
    ];

    // 6. Seed Documents
    const documents = [
      { id: 'doc_arun_1', project_id: 'proj_arun', name: 'Pool_Structural_Calculations.pdf', size: '3.6 MB', type: 'Specs', date: '2026-04-28' },
      { id: 'doc_arun_2', project_id: 'proj_arun', name: 'Bangalore_WaterPermit_NoObjection.pdf', size: '1.5 MB', type: 'Permit', date: '2026-05-02' },
      { id: 'doc_manu_1', project_id: 'proj_manu', name: 'Zoning_Variance_Clearance.pdf', size: '1.8 MB', type: 'Permit', date: '2026-04-02' }
    ];

    // 7. Seed Notifications
    const notifications = [
      {
        id: 'notif_1',
        projectId: 'proj_arun',
        contractorId: 'user_contractor_1',
        clientId: 'user_client_arun',
        title: 'Project Timeline Updated',
        message: 'Your contractor BuildSmart updated concrete curing milestones.',
        date: new Date().toLocaleString(),
        read: false,
        target: 'client',
        priority: 'normal'
      },
      {
        id: 'notif_2',
        projectId: 'proj_arun',
        contractorId: 'user_contractor_1',
        clientId: 'user_client_arun',
        title: 'Subcontractor Cost Logged',
        message: 'Contractor added grading machinery fee of ₹31,000 to budget sheet.',
        date: new Date(Date.now() - 7200000).toLocaleString(),
        read: false,
        target: 'contractor',
        priority: 'normal'
      },
      {
        id: 'notif_alarm_1',
        projectId: 'proj_manu',
        contractorId: 'user_contractor_1',
        clientId: 'user_client_manu',
        title: 'PAYMENT OVERDUE ALARM',
        message: 'Townhouse Stage 3 Payment (Structure Pillar Erection) of ₹1,50,000 is Overdue! Please clear outstanding dues immediately to avoid site layout suspension.',
        date: new Date().toLocaleString(),
        read: false,
        target: 'client',
        priority: 'important'
      },
      {
        id: 'notif_alarm_2',
        projectId: 'proj_manu',
        contractorId: 'user_contractor_1',
        clientId: 'user_client_manu',
        title: 'CLIENT PAYMENT OVERDUE',
        message: 'Townhouse Stage 3 Payment from Client Manu is Overdue since 2026-05-20. Suggested action: Send a payment reminder.',
        date: new Date().toLocaleString(),
        read: false,
        target: 'contractor',
        priority: 'important'
      }
    ];

    // 8. Seed Photos (Timeline Photos)
    const photos = [
      {
        id: 'photo_seed_1',
        projectId: 'proj_arun',
        uploadedBy: 'contractor',
        uploadedByName: 'BuildSmart Solutions LLC',
        photoUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80',
        caption: 'Excavation completed for pool foundation slab.',
        date: '2026-05-24',
        time: '14:30',
        timestamp: '2026-05-24T14:30:00.000Z'
      },
      {
        id: 'photo_seed_2',
        projectId: 'proj_manu',
        uploadedBy: 'contractor',
        uploadedByName: 'BuildSmart Solutions LLC',
        photoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
        caption: 'Installed cedar privacy fencing panels.',
        date: '2026-05-25',
        time: '11:15',
        timestamp: '2026-05-25T11:15:00.000Z'
      }
    ];

    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    localStorage.setItem(KEYS.EMAILS, JSON.stringify([]));
    localStorage.setItem(KEYS.PHOTOS, JSON.stringify(photos));

    // 9. Seed Labours
    const labours = [
      {
        id: 'labour_1',
        contractorId: 'user_contractor_1',
        name: 'Rajesh Kumar',
        phone: '+91 98765 43210',
        role: 'Mason',
        status: 'Active',
        address: '12, Gandhi Nagar, Bangalore, India',
        joiningDate: '2026-01-10',
        emergencyContact: 'Sita Devi (Wife) - +91 98765 43215',
        idProof: 'Aadhaar Card: XXXX-XXXX-1234'
      },
      {
        id: 'labour_2',
        contractorId: 'user_contractor_1',
        name: 'Amit Singh',
        phone: '+91 98765 43211',
        role: 'Carpenter',
        status: 'Active',
        address: '45, Shastri Nagar, Bangalore, India',
        joiningDate: '2026-02-15',
        emergencyContact: 'Vijay Singh (Father) - +91 98765 43216',
        idProof: 'PAN Card: ABCDE1234F'
      },
      {
        id: 'labour_3',
        contractorId: 'user_contractor_1',
        name: 'Ramesh Patel',
        phone: '+91 98765 43212',
        role: 'Electrician',
        status: 'Active',
        address: 'Villa 5, Patel Chawl, Bangalore, India',
        joiningDate: '2026-03-20',
        emergencyContact: 'Dinesh Patel (Brother) - +91 98765 43217',
        idProof: 'Driving License: KA-03-2026-001'
      },
      {
        id: 'labour_4',
        contractorId: 'user_contractor_1',
        name: 'Suresh Das',
        phone: '+91 98765 43213',
        role: 'Helper',
        status: 'Inactive',
        address: '7, Rajaji Nagar, Bangalore, India',
        joiningDate: '2026-04-05',
        emergencyContact: 'Karan Das (Son) - +91 98765 43218',
        idProof: 'Voter ID: WXY1234567'
      }
    ];

    // 10. Seed Attendance Logs
    const attendance = [
      {
        id: 'att_1',
        labourId: 'labour_1',
        projectId: 'proj_arun',
        projectName: 'Arun Villa Project',
        date: '2026-05-24',
        status: 'Present',
        remarks: 'Excavation team leader',
        timeEntry: '08:45 AM',
        contractorId: 'user_contractor_1'
      },
      {
        id: 'att_2',
        labourId: 'labour_2',
        projectId: 'proj_arun',
        projectName: 'Arun Villa Project',
        date: '2026-05-24',
        status: 'Present',
        remarks: 'Framing support',
        timeEntry: '08:50 AM',
        contractorId: 'user_contractor_1'
      },
      {
        id: 'att_3',
        labourId: 'labour_3',
        projectId: 'proj_manu',
        projectName: 'Manu Residence',
        date: '2026-05-25',
        status: 'Half Day',
        remarks: 'Left early for medical checkup',
        timeEntry: '09:00 AM',
        contractorId: 'user_contractor_1'
      },
      {
        id: 'att_4',
        labourId: 'labour_4',
        projectId: 'proj_arun',
        projectName: 'Arun Villa Project',
        date: '2026-05-25',
        status: 'Absent',
        remarks: 'Prior approved sick leave',
        timeEntry: '--',
        contractorId: 'user_contractor_1'
      }
    ];

    // 11. Seed Payment Stages
    const paymentStages = [
      // stages for proj_arun (Total budget is 15,00,000 INR)
      { id: 'stage_arun_1', projectId: 'proj_arun', contractorId: 'user_contractor_1', clientId: 'user_client_arun', stageName: 'Advance Payment', stageDescription: 'Mobilization advance to initiate site marking and structural procurement.', stageAmount: 150000, dueDate: '2026-05-02', status: 'Paid', paidAmount: 150000 },
      { id: 'stage_arun_2', projectId: 'proj_arun', contractorId: 'user_contractor_1', clientId: 'user_client_arun', stageName: 'Foundation Work Completion', stageDescription: 'Excavation, steel tying, and M25 slab concrete casting completed.', stageAmount: 150000, dueDate: '2026-05-24', status: 'Paid', paidAmount: 150000 },
      { id: 'stage_arun_3', projectId: 'proj_arun', contractorId: 'user_contractor_1', clientId: 'user_client_arun', stageName: 'Structure & Pillar Framing', stageDescription: 'Erection of main vertical pillars and roof slab reinforcement.', stageAmount: 200000, dueDate: '2026-06-15', status: 'Partially Paid', paidAmount: 100000 },
      { id: 'stage_arun_4', projectId: 'proj_arun', contractorId: 'user_contractor_1', clientId: 'user_client_arun', stageName: 'Brick & Wall Work', stageDescription: 'Masonry work for external and partition walls.', stageAmount: 150000, dueDate: '2026-07-10', status: 'Pending', paidAmount: 0 },
      { id: 'stage_arun_5', projectId: 'proj_arun', contractorId: 'user_contractor_1', clientId: 'user_client_arun', stageName: 'Roofing & Truss Layout', stageDescription: 'Waterproofing slab treatment and roofing tile fittings.', stageAmount: 150000, dueDate: '2026-08-05', status: 'Pending', paidAmount: 0 },
      { id: 'stage_arun_6', projectId: 'proj_arun', contractorId: 'user_contractor_1', clientId: 'user_client_arun', stageName: 'Plastering Work', stageDescription: 'Internal and external plastering with sand face finish.', stageAmount: 150000, dueDate: '2026-09-01', status: 'Pending', paidAmount: 0 },
      { id: 'stage_arun_7', projectId: 'proj_arun', contractorId: 'user_contractor_1', clientId: 'user_client_arun', stageName: 'Electrical + Plumbing piping', stageDescription: 'Concealed pipeline laying and electrical wire pulling.', stageAmount: 150000, dueDate: '2026-09-25', status: 'Pending', paidAmount: 0 },
      { id: 'stage_arun_8', projectId: 'proj_arun', contractorId: 'user_contractor_1', clientId: 'user_client_arun', stageName: 'Flooring Work', stageDescription: 'Italian marble installation and toilet tiling.', stageAmount: 100000, dueDate: '2026-10-15', status: 'Pending', paidAmount: 0 },
      { id: 'stage_arun_9', projectId: 'proj_arun', contractorId: 'user_contractor_1', clientId: 'user_client_arun', stageName: 'Painting & Finishing', stageDescription: 'Wall putty preparation, primer coats, and premium emulsion paint.', stageAmount: 100000, dueDate: '2026-11-10', status: 'Pending', paidAmount: 0 },
      { id: 'stage_arun_10', projectId: 'proj_arun', contractorId: 'user_contractor_1', clientId: 'user_client_arun', stageName: 'Final Handover Payment', stageDescription: 'De-shuttering clearance, fittings checks, and key handover.', stageAmount: 200000, dueDate: '2026-12-15', status: 'Pending', paidAmount: 0 },

      // stages for proj_manu (Total budget is 9,50,000 INR)
      { id: 'stage_manu_1', projectId: 'proj_manu', contractorId: 'user_contractor_1', clientId: 'user_client_manu', stageName: 'Advance Payment', stageDescription: 'Initial mobilization and design approval.', stageAmount: 100000, dueDate: '2026-04-15', status: 'Paid', paidAmount: 100000 },
      { id: 'stage_manu_2', projectId: 'proj_manu', contractorId: 'user_contractor_1', clientId: 'user_client_manu', stageName: 'Foundation & Framing', stageDescription: 'Excavation and initial sub-structure.', stageAmount: 100000, dueDate: '2026-05-10', status: 'Paid', paidAmount: 100000 },
      { id: 'stage_manu_3', projectId: 'proj_manu', contractorId: 'user_contractor_1', clientId: 'user_client_manu', stageName: 'Structure Pillar Erection', stageDescription: 'Framing of main townhouse levels.', stageAmount: 150000, dueDate: '2026-05-20', status: 'Overdue', paidAmount: 0 },
      { id: 'stage_manu_4', projectId: 'proj_manu', contractorId: 'user_contractor_1', clientId: 'user_client_manu', stageName: 'Masonry work', stageDescription: 'External wall panels assembly.', stageAmount: 100000, dueDate: '2026-06-20', status: 'Pending', paidAmount: 0 },
      { id: 'stage_manu_5', projectId: 'proj_manu', contractorId: 'user_contractor_1', clientId: 'user_client_manu', stageName: 'Roofing completion', stageDescription: 'Water protection shield installation.', stageAmount: 100000, dueDate: '2026-07-15', status: 'Pending', paidAmount: 0 },
      { id: 'stage_manu_6', projectId: 'proj_manu', contractorId: 'user_contractor_1', clientId: 'user_client_manu', stageName: 'Internal Plastering', stageDescription: 'Plaster walls and smooth finishes.', stageAmount: 100000, dueDate: '2026-08-10', status: 'Pending', paidAmount: 0 },
      { id: 'stage_manu_7', projectId: 'proj_manu', contractorId: 'user_contractor_1', clientId: 'user_client_manu', stageName: 'Plumbing & Concealed wiring', stageDescription: 'Laying distribution lines.', stageAmount: 100000, dueDate: '2026-09-05', status: 'Pending', paidAmount: 0 },
      { id: 'stage_manu_8', projectId: 'proj_manu', contractorId: 'user_contractor_1', clientId: 'user_client_manu', stageName: 'Flooring work', stageDescription: 'Wood paneling and stone tiles installation.', stageAmount: 70000, dueDate: '2026-09-28', status: 'Pending', paidAmount: 0 },
      { id: 'stage_manu_9', projectId: 'proj_manu', contractorId: 'user_contractor_1', clientId: 'user_client_manu', stageName: 'Finishing & Painting', stageDescription: 'Final coats and details.', stageAmount: 50000, dueDate: '2026-10-15', status: 'Pending', paidAmount: 0 },
      { id: 'stage_manu_10', projectId: 'proj_manu', contractorId: 'user_contractor_1', clientId: 'user_client_manu', stageName: 'Final Handover', stageDescription: 'Site clearance and keys handoff.', stageAmount: 80000, dueDate: '2026-10-30', status: 'Pending', paidAmount: 0 }
    ];

    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(KEYS.PROJECTS, JSON.stringify(projects));
    localStorage.setItem(KEYS.UPDATES, JSON.stringify(updates));
    localStorage.setItem(KEYS.TIMELINE, JSON.stringify(timeline));
    localStorage.setItem(KEYS.COSTS, JSON.stringify(costs));
    localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(documents));
    localStorage.setItem(KEYS.LABOURS, JSON.stringify(labours));
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(attendance));
    localStorage.setItem(KEYS.PAYMENT_STAGES, JSON.stringify(paymentStages));
  },

  getData(key) {
    this.init();
    return JSON.parse(localStorage.getItem(key)) || [];
  },

  setData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },

  // --- Core Methods ---
  login(email, password) {
    const users = this.getData(KEYS.USERS);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    const safeUser = { uid: user.id, ...user };
    delete safeUser.password;
    localStorage.setItem(KEYS.SESSION, JSON.stringify(safeUser));
    return safeUser;
  },

  logout() {
    localStorage.removeItem(KEYS.SESSION);
  },

  getCurrentUser() {
    return JSON.parse(localStorage.getItem(KEYS.SESSION)) || null;
  },

  changePassword(userId, newPassword) {
    const users = this.getData(KEYS.USERS);
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].password = newPassword;
      users[idx].changePasswordRequired = false;
      this.setData(KEYS.USERS, users);
      
      const currentSession = this.getCurrentUser();
      if (currentSession && currentSession.uid === userId) {
        const safeUser = { uid: users[idx].id, ...users[idx] };
        delete safeUser.password;
        localStorage.setItem(KEYS.SESSION, JSON.stringify(safeUser));
      }
    }
  },

  getProjects(userId, role) {
    const projects = this.getData(KEYS.PROJECTS);
    if (role === 'contractor') {
      return projects.filter(p => p.contractorId === userId);
    } else if (role === 'client') {
      return projects.filter(p => p.clientId === userId);
    }
    return [];
  },

  getProjectById(projectId, user) {
    const projects = this.getData(KEYS.PROJECTS);
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return null;
    
    if (user.role === 'contractor' && proj.contractorId !== user.uid) return null;
    if (user.role === 'client' && proj.clientId !== user.uid) return null;
    return proj;
  },

  updateProjectBudget(projectId, newBudget) {
    const projects = this.getData(KEYS.PROJECTS);
    const idx = projects.findIndex(p => p.id === projectId);
    if (idx !== -1) {
      projects[idx].budget = parseFloat(newBudget) || 0;
      this.setData(KEYS.PROJECTS, projects);
      return projects[idx];
    }
    return null;
  },

  getClientsForContractor(contractorId) {
    const projects = this.getData(KEYS.PROJECTS);
    const clientIds = projects
      .filter(p => p.contractorId === contractorId)
      .map(p => p.clientId);
    
    const users = this.getData(KEYS.USERS);
    return users.filter(u => u.role === 'client' && clientIds.includes(u.id));
  },

  addClientAndProject(contractorId, clientData, projectData) {
    const users = this.getData(KEYS.USERS);
    const projects = this.getData(KEYS.PROJECTS);

    let client = users.find(u => u.email.toLowerCase() === clientData.email.toLowerCase());
    
    if (!client) {
      client = {
        id: `user_cli_${Date.now()}`,
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        password: clientData.password || '',
        role: 'client',
        contractorId,
        changePasswordRequired: clientData.invitationType === 'auto_gen'
      };
      users.push(client);
      this.setData(KEYS.USERS, users);
    }

    const newProject = {
      id: `proj_${Date.now()}`,
      contractorId,
      clientId: client.id,
      projectName: projectData.projectName,
      siteLocation: projectData.siteLocation,
      constructionType: projectData.constructionType || 'Residential',
      budget: parseFloat(projectData.budget) || 120000,
      startDate: projectData.startDate || new Date().toISOString().split('T')[0],
      estimatedFinish: projectData.estimatedFinish || new Date(Date.now() + 120*24*60*60*1000).toISOString().split('T')[0],
      status: 'Active'
    };

    projects.push(newProject);
    this.setData(KEYS.PROJECTS, projects);

    // Initial timeline & cost seeds
    const timeline = this.getData(KEYS.TIMELINE);
    timeline.push({ id: `time_${Date.now()}_1`, project_id: newProject.id, task: 'Site Inspection & Permits Signoff', deadline: newProject.startDate, progress: 100, priority: 'High', status: 'Completed' });
    timeline.push({ id: `time_${Date.now()}_2`, project_id: newProject.id, task: 'Structural Framing & Foundation', deadline: newProject.estimatedFinish, progress: 0, priority: 'High', status: 'Pending' });
    this.setData(KEYS.TIMELINE, timeline);

    const costs = this.getData(KEYS.COSTS);
    costs.push({ id: `cost_${Date.now()}_1`, project_id: newProject.id, item_name: 'Initial Framing Deposit', amount: parseFloat(newProject.budget) * 0.1 || 5000, category: 'Materials', status: 'Paid' });
    this.setData(KEYS.COSTS, costs);

    // Simulated email trigger
    const emails = this.getData(KEYS.EMAILS);
    if (clientData.invitationType === 'email_invite') {
      const inviteToken = `token_${Math.random().toString(36).substring(2, 9)}`;
      const userIdx = users.findIndex(u => u.id === client.id);
      users[userIdx].inviteToken = inviteToken;
      this.setData(KEYS.USERS, users);

      const emailObj = {
        id: `email_${Date.now()}`,
        to: client.email,
        subject: `Welcome to ApexBuild SaaS Portal - Define Password`,
        body: `Hello ${client.name},\n\nYour builder has invited you to access your project dashboard.\nProject: ${projectData.projectName}\n\nPlease click the button below to set up your account password:\n(Option A Flow)`,
        type: 'invitation',
        token: inviteToken,
        clientId: client.id,
        projectName: projectData.projectName,
        date: new Date().toLocaleString()
      };
      emails.unshift(emailObj);
      this.setData(KEYS.EMAILS, emails);
      emailSentCallback();
    } else {
      const emailObj = {
        id: `email_${Date.now()}`,
        to: client.email,
        subject: `Your ApexBuild SaaS Access Credentials`,
        body: `Hello ${client.name},\n\nYour builder created your portal login.\nLogin Email: ${client.email}\nTemporary Password: ${clientData.password}\n\nPlease log in and update this temporary password immediately.`,
        type: 'credentials',
        clientId: client.id,
        projectName: projectData.projectName,
        password: clientData.password,
        date: new Date().toLocaleString()
      };
      emails.unshift(emailObj);
      this.setData(KEYS.EMAILS, emails);
      emailSentCallback();
    }

    return { client, project: newProject };
  },

  setPasswordViaToken(token, newPassword) {
    const users = this.getData(KEYS.USERS);
    const userIdx = users.findIndex(u => u.inviteToken === token);
    if (userIdx === -1) {
      throw new Error('Invalid setup token.');
    }
    
    users[userIdx].password = newPassword;
    users[userIdx].changePasswordRequired = false;
    delete users[userIdx].inviteToken;
    this.setData(KEYS.USERS, users);
    return users[userIdx];
  },

  // Daily Updates
  getDailyUpdates(projectId) {
    const updates = this.getData(KEYS.UPDATES);
    return updates.filter(u => u.project_id === projectId).sort((a, b) => b.date.localeCompare(a.date));
  },

  addDailyUpdate(projectId, updateData) {
    const updates = this.getData(KEYS.UPDATES);
    const newUpdate = {
      id: `upd_${Date.now()}`,
      project_id: projectId,
      date: updateData.date || new Date().toISOString().split('T')[0],
      labour_count: parseInt(updateData.labour_count) || 0,
      materials: updateData.materials || '',
      notes: updateData.notes || '',
      photos: updateData.photos || []
    };
    updates.push(newUpdate);
    this.setData(KEYS.UPDATES, updates);
    return newUpdate;
  },

  // Timeline
  getTimeline(projectId) {
    const timeline = this.getData(KEYS.TIMELINE);
    return timeline.filter(t => t.project_id === projectId);
  },

  addTimelineTask(projectId, taskData) {
    const timeline = this.getData(KEYS.TIMELINE);
    const newTask = {
      id: `time_${Date.now()}`,
      project_id: projectId,
      task: taskData.task,
      deadline: taskData.deadline,
      progress: parseInt(taskData.progress) || 0,
      priority: taskData.priority || 'Medium',
      status: taskData.status || 'Pending'
    };
    timeline.push(newTask);
    this.setData(KEYS.TIMELINE, timeline);
    return newTask;
  },

  updateTimelineProgress(taskId, progress) {
    const timeline = this.getData(KEYS.TIMELINE);
    const idx = timeline.findIndex(t => t.id === taskId);
    if (idx !== -1) {
      timeline[idx].progress = Math.max(0, Math.min(100, parseInt(progress)));
      if (timeline[idx].progress === 100) {
        timeline[idx].status = 'Completed';
      } else if (timeline[idx].progress > 0) {
        timeline[idx].status = 'In Progress';
      } else {
        timeline[idx].status = 'Pending';
      }
      this.setData(KEYS.TIMELINE, timeline);
    }
    return timeline[idx];
  },

  deleteTimelineTask(taskId) {
    const timeline = this.getData(KEYS.TIMELINE);
    const updated = timeline.filter(t => t.id !== taskId);
    this.setData(KEYS.TIMELINE, updated);
  },

  // Costs
  getCosts(projectId) {
    const costs = this.getData(KEYS.COSTS);
    return costs.filter(c => c.project_id === projectId);
  },

  addCostItem(projectId, costData) {
    const costs = this.getData(KEYS.COSTS);
    const newCost = {
      id: `cost_${Date.now()}`,
      project_id: projectId,
      item_name: costData.item_name,
      amount: parseFloat(costData.amount) || 0,
      category: costData.category || 'Materials',
      status: costData.status || 'Pending',
      invoiceUrl: costData.invoiceUrl || ''
    };
    costs.push(newCost);
    this.setData(KEYS.COSTS, costs);
    return newCost;
  },

  updateCostStatus(costId, status) {
    const costs = this.getData(KEYS.COSTS);
    const idx = costs.findIndex(c => c.id === costId);
    if (idx !== -1) {
      costs[idx].status = status;
      this.setData(KEYS.COSTS, costs);
    }
    return costs[idx];
  },

  deleteCostItem(costId) {
    const costs = this.getData(KEYS.COSTS);
    const updated = costs.filter(c => c.id !== costId);
    this.setData(KEYS.COSTS, updated);
  },

  // Documents
  getDocuments(projectId) {
    const docs = this.getData(KEYS.DOCUMENTS);
    return docs.filter(d => d.project_id === projectId);
  },

  addDocument(projectId, docData) {
    const docs = this.getData(KEYS.DOCUMENTS);
    const newDoc = {
      id: `doc_${Date.now()}`,
      project_id: projectId,
      name: docData.name,
      size: docData.size || '1.0 MB',
      type: docData.type || '2D Drawings',
      date: new Date().toISOString().split('T')[0],
      fileUrl: docData.fileUrl || '',
      uploadedBy: docData.uploadedBy || 'contractor',
      uploadedByName: docData.uploadedByName || '',
      visibleTo: docData.visibleTo || 'both'
    };
    docs.push(newDoc);
    this.setData(KEYS.DOCUMENTS, docs);
    return newDoc;
  },

  deleteDocument(docId) {
    const docs = this.getData(KEYS.DOCUMENTS);
    const updated = docs.filter(d => d.id !== docId);
    this.setData(KEYS.DOCUMENTS, updated);
  },

  // Progress Photos (Timeline Photos)
  getProgressPhotos(projectId) {
    const photos = this.getData(KEYS.PHOTOS);
    return photos.filter(p => p.projectId === projectId).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  },

  addProgressPhoto(projectId, photoData) {
    const photos = this.getData(KEYS.PHOTOS);
    const newPhoto = {
      id: `photo_${Date.now()}`,
      projectId,
      uploadedBy: photoData.uploadedBy || 'contractor',
      uploadedByName: photoData.uploadedByName || '',
      photoUrl: photoData.photoUrl,
      caption: photoData.caption || '',
      date: photoData.date || new Date().toISOString().split('T')[0],
      time: photoData.time || new Date().toTimeString().split(' ')[0].substring(0, 5),
      timestamp: photoData.timestamp || new Date().toISOString()
    };
    photos.push(newPhoto);
    this.setData(KEYS.PHOTOS, photos);
    return newPhoto;
  },

  deleteProgressPhoto(photoId) {
    const photos = this.getData(KEYS.PHOTOS);
    const updated = photos.filter(p => p.id !== photoId);
    this.setData(KEYS.PHOTOS, updated);
  },

  getSimulatedEmails() {
    return this.getData(KEYS.EMAILS);
  },

  clearSimulatedEmails() {
    this.setData(KEYS.EMAILS, []);
    emailSentCallback();
  },

  getLabours(contractorId) {
    const list = this.getData(KEYS.LABOURS);
    return list.filter(l => l.contractorId === contractorId);
  },

  addLabour(contractorId, labourData) {
    const list = this.getData(KEYS.LABOURS);
    const newLabour = {
      id: `labour_${Date.now()}`,
      contractorId,
      name: labourData.name,
      phone: labourData.phone,
      role: labourData.role || 'Helper',
      status: labourData.status || 'Active',
      address: labourData.address || '',
      joiningDate: labourData.joiningDate || new Date().toISOString().split('T')[0],
      emergencyContact: labourData.emergencyContact || '',
      idProof: labourData.idProof || ''
    };
    list.push(newLabour);
    this.setData(KEYS.LABOURS, list);
    return newLabour;
  },

  updateLabour(labourId, updateData) {
    const list = this.getData(KEYS.LABOURS);
    const idx = list.findIndex(l => l.id === labourId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updateData };
      this.setData(KEYS.LABOURS, list);
      return list[idx];
    }
    return null;
  },

  getAttendanceLogs(contractorId) {
    const logs = this.getData(KEYS.ATTENDANCE);
    return logs.filter(a => a.contractorId === contractorId);
  },

  addAttendanceLog(contractorId, logData) {
    const logs = this.getData(KEYS.ATTENDANCE);
    const newLog = {
      id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      labourId: logData.labourId,
      projectId: logData.projectId,
      projectName: logData.projectName,
      date: logData.date || new Date().toISOString().split('T')[0],
      status: logData.status || 'Present',
      remarks: logData.remarks || '',
      timeEntry: logData.timeEntry || new Date().toTimeString().split(' ')[0].substring(0, 5),
      contractorId
    };
    logs.push(newLog);
    this.setData(KEYS.ATTENDANCE, logs);
    return newLog;
  },

  getLabourAttendance(labourId) {
    const logs = this.getData(KEYS.ATTENDANCE);
    return logs.filter(a => a.labourId === labourId).sort((a,b) => b.date.localeCompare(a.date));
  },

  getPaymentStages(projectId) {
    const list = this.getData(KEYS.PAYMENT_STAGES);
    return list.filter(s => s.projectId === projectId);
  },

  addPaymentStage(projectId, stageData) {
    const list = this.getData(KEYS.PAYMENT_STAGES);
    const newStage = {
      id: `stage_${Date.now()}`,
      projectId,
      contractorId: stageData.contractorId,
      clientId: stageData.clientId,
      stageName: stageData.stageName,
      stageDescription: stageData.stageDescription || '',
      stageAmount: parseFloat(stageData.stageAmount) || 0,
      dueDate: stageData.dueDate || new Date().toISOString().split('T')[0],
      status: stageData.status || 'Pending',
      paidAmount: parseFloat(stageData.paidAmount) || 0
    };
    list.push(newStage);
    this.setData(KEYS.PAYMENT_STAGES, list);
    return newStage;
  },

  updatePaymentStage(stageId, updateData) {
    const list = this.getData(KEYS.PAYMENT_STAGES);
    const idx = list.findIndex(s => s.id === stageId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updateData };
      if (updateData.stageAmount !== undefined) list[idx].stageAmount = parseFloat(updateData.stageAmount);
      if (updateData.paidAmount !== undefined) list[idx].paidAmount = parseFloat(updateData.paidAmount);
      this.setData(KEYS.PAYMENT_STAGES, list);
      return list[idx];
    }
    return null;
  },

  deletePaymentStage(stageId) {
    const list = this.getData(KEYS.PAYMENT_STAGES);
    const updated = list.filter(s => s.id !== stageId);
    this.setData(KEYS.PAYMENT_STAGES, updated);
  }
};
