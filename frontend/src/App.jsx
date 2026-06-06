import React, { useState, useEffect } from 'react';
import ContactForm from './components/ContactForm';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { apiService } from './services/api';
import './App.css';

export default function App() {
  const [view, setView] = useState('contact'); // 'contact' | 'login' | 'dashboard'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Sync state with local storage authentication
  const checkAuth = async () => {
    const isLocalAuth = apiService.isAuthenticated();
    if (isLocalAuth) {
      // Validate session token with the backend API
      const isValid = await apiService.verifySession();
      if (isValid) {
        setIsAuthenticated(true);
        setView('dashboard');
      } else {
        setIsAuthenticated(false);
        setView('contact');
      }
    } else {
      setIsAuthenticated(false);
      // If they were on dashboard but aren't authenticated, go back to contact
      if (view === 'dashboard') {
        setView('contact');
      }
    }
    setCheckingSession(false);
  };

  useEffect(() => {
    // Initial verification
    checkAuth();

    // Listen to custom 'auth-change' events triggered by apiService logins/logouts
    const handleAuthChange = () => {
      const auth = apiService.isAuthenticated();
      setIsAuthenticated(auth);
      if (auth) {
        setView('dashboard');
      } else {
        setView('contact');
      }
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, [view]);

  if (checkingSession) {
    return (
      <div className="app-loading-screen">
        <span className="app-loader"></span>
        <p>Loading She Can Foundation Portal...</p>
      </div>
    );
  }

  return (
    <>
      {view === 'contact' && (
        <ContactForm onNavigateToLogin={() => setView(isAuthenticated ? 'dashboard' : 'login')} />
      )}
      {view === 'login' && (
        <Login 
          onLoginSuccess={() => setView('dashboard')} 
          onNavigateToContact={() => setView('contact')} 
        />
      )}
      {view === 'dashboard' && (
        <Dashboard />
      )}
    </>
  );
}
