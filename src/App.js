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
    <div className="min-h-screen text-slate-150">
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
