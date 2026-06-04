import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import ContractorDashboard from './pages/ContractorDashboard';
import ClientDashboard from './pages/ClientDashboard';
import ChangePassword from './pages/ChangePassword';
import ForgotPassword from './pages/ForgotPassword';
import ThemeToggle from './components/ThemeToggle';
import EmailInboxSimulator from './components/EmailInboxSimulator';

function AppContent() {
  const { currentUser, loading } = useAuth();
  const [currentView, setCurrentView] = useState('login'); // 'login' or 'forgot'

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent mx-auto" />
          <p className="text-sm font-semibold tracking-wide text-slate-400">Initializing ApexBuild...</p>
        </div>
      </div>
    );
  }

  // Choose component based on authentication and user role
  const renderDashboard = () => {
    if (!currentUser) {
      if (currentView === 'forgot') {
        return <ForgotPassword onNavigate={setCurrentView} />;
      }
      return <Login onNavigate={setCurrentView} />;
    }

    // Intercept client accounts that require a password change
    if (currentUser.changePasswordRequired) {
      return <ChangePassword />;
    }

    switch (currentUser.role) {
      case 'contractor':
        return <ContractorDashboard />;
      case 'client':
        return <ClientDashboard />;
      default:
        return <Login onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen text-slate-150 relative overflow-hidden">
      {/* Building Structure Sketch Background (visible only in light mode on the right side) */}
      <svg 
        viewBox="0 0 800 1000" 
        className="fixed right-0 bottom-0 h-[85vh] w-auto opacity-10 pointer-events-none z-0 dark:hidden select-none" 
        fill="none" 
        stroke="currentColor"
      >
        {/* Grid Lines */}
        <path d="M 0,100 L 800,100 M 0,200 L 800,200 M 0,300 L 800,300 M 0,400 L 800,400 M 0,500 L 800,500 M 0,600 L 800,600 M 0,700 L 800,700 M 0,800 L 800,800 M 0,900 L 800,900" strokeWidth="0.5" strokeDasharray="5,5" stroke="rgba(14, 165, 233, 0.12)"/>
        <path d="M 100,0 L 100,1000 M 200,0 L 200,1000 M 300,0 L 300,1000 M 400,0 L 400,1000 M 500,0 L 500,1000 M 600,0 L 600,1000 M 700,0 L 700,1000" strokeWidth="0.5" strokeDasharray="5,5" stroke="rgba(14, 165, 233, 0.12)"/>
        
        {/* Skyscraper Building Sketch */}
        {/* Main columns */}
        <path d="M 300,1000 L 300,200 L 550,200 L 550,1000" strokeWidth="1.5" stroke="rgba(14, 165, 233, 0.25)"/>
        <path d="M 350,1000 L 350,200 M 400,1000 L 400,200 M 450,1000 L 450,200 M 500,1000 L 500,200" strokeWidth="0.75" stroke="rgba(14, 165, 233, 0.18)"/>
        
        {/* Horizontal Floor Beams */}
        <path d="M 300,250 L 550,250 M 300,300 L 550,300 M 300,350 L 550,350 M 300,400 L 550,400 M 300,450 L 550,450 M 300,500 L 550,500 M 300,550 L 550,550 M 300,600 L 550,600 M 300,650 L 550,650 M 300,700 L 550,700 M 300,750 L 550,750 M 300,800 L 550,800 M 300,850 L 550,850 M 300,900 L 550,900 M 300,950 L 550,950" strokeWidth="1" stroke="rgba(14, 165, 233, 0.2)"/>
        
        {/* Diagonal Bracing / Structural trusses */}
        <path d="M 300,200 L 350,250 L 300,300 L 350,350 L 300,400 L 350,450 L 300,500 L 350,550 L 300,600 L 350,650 L 300,700 L 350,750 L 300,800 L 350,850 L 300,900 L 350,950 L 300,1000" strokeWidth="0.75" stroke="rgba(14, 165, 233, 0.12)"/>
        <path d="M 550,200 L 500,250 L 550,300 L 500,350 L 550,400 L 500,450 L 550,500 L 500,550 L 550,600 L 500,650 L 550,700 L 500,750 L 550,800 L 500,850 L 550,900 L 500,950 L 550,1000" strokeWidth="0.75" stroke="rgba(14, 165, 233, 0.12)"/>
        
        <path d="M 350,200 L 400,250 L 350,300 L 400,350 L 350,400 L 400,450 L 350,500 L 400,550 L 350,600 L 400,650 L 350,700 L 400,750 L 350,800 L 400,850 L 350,900 L 400,950 L 350,1000" strokeWidth="0.5" stroke="rgba(14, 165, 233, 0.08)"/>
        <path d="M 500,200 L 450,250 L 500,300 L 450,350 L 500,400 L 450,450 L 500,500 L 450,550 L 500,600 L 450,650 L 500,700 L 450,750 L 500,800 L 450,850 L 500,900 L 450,950 L 500,1000" strokeWidth="0.5" stroke="rgba(14, 165, 233, 0.08)"/>
        
        {/* Under Construction Scaffold / Crane on top */}
        <path d="M 400,200 L 400,50 L 300,50 L 400,200" strokeWidth="1" stroke="rgba(14, 165, 233, 0.25)"/>
        <path d="M 400,80 L 580,80 L 400,50" strokeWidth="1" stroke="rgba(14, 165, 233, 0.25)"/>
        <path d="M 580,80 L 580,120" strokeWidth="0.75" stroke="rgba(14, 165, 233, 0.2)"/>
        {/* Pulley/load */}
        <rect x="572" y="120" width="16" height="20" rx="2" strokeWidth="0.75" stroke="rgba(14, 165, 233, 0.18)"/>
        <path d="M 572,120 L 588,140 M 588,120 L 572,140" strokeWidth="0.5" stroke="rgba(14, 165, 233, 0.12)"/>
        
        {/* Side Structure (Shorter building/wing) */}
        <path d="M 550,1000 L 550,500 L 700,500 L 700,1000" strokeWidth="1.25" stroke="rgba(14, 165, 233, 0.25)"/>
        <path d="M 550,550 L 700,550 M 550,600 L 700,600 M 550,650 L 700,650 M 550,700 L 700,700 M 550,750 L 700,750 M 550,800 L 700,800 M 550,850 L 700,850 M 550,900 L 700,900 M 550,950 L 700,950" strokeWidth="0.75" stroke="rgba(14, 165, 233, 0.15)"/>
        <path d="M 600,1000 L 600,500 M 650,1000 L 650,500" strokeWidth="0.75" stroke="rgba(14, 165, 233, 0.15)"/>
        
        {/* Architectural annotations */}
        <text x="270" y="210" fill="rgba(14, 165, 233, 0.35)" fontSize="9" fontFamily="monospace">LVL +24.0m</text>
        <text x="270" y="510" fill="rgba(14, 165, 233, 0.35)" fontSize="9" fontFamily="monospace">LVL +12.0m</text>
        <text x="270" y="990" fill="rgba(14, 165, 233, 0.35)" fontSize="9" fontFamily="monospace">LVL 0.0m</text>
        <line x1="290" y1="200" x2="290" y2="1000" stroke="rgba(14, 165, 233, 0.2)" strokeWidth="0.5"/>
        <line x1="285" y1="200" x2="295" y2="200" stroke="rgba(14, 165, 233, 0.2)" strokeWidth="0.5"/>
        <line x1="285" y1="500" x2="295" y2="500" stroke="rgba(14, 165, 233, 0.2)" strokeWidth="0.5"/>
        <line x1="285" y1="1000" x2="295" y2="1000" stroke="rgba(14, 165, 233, 0.2)" strokeWidth="0.5"/>
      </svg>

      {renderDashboard()}
      
      {/* Sleek Dark/Light Mode floating toggle */}
      <ThemeToggle />
      
      {/* Interactive Email Inbox Drawer Simulator (Available globally for demonstration) */}
      <EmailInboxSimulator />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
