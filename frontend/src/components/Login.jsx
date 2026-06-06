import React, { useState } from 'react';
import { apiService } from '../services/api';
import Toast from './Toast';
import './Login.css';

export default function Login({ onLoginSuccess, onNavigateToContact }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setToast({
        message: 'Username and Password are required',
        type: 'error'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await apiService.login(username, password);
      setToast({
        message: 'Login successful! Welcome back.',
        type: 'success'
      });
      
      // Delay transition slightly to allow success Toast to be seen
      setTimeout(() => {
        onLoginSuccess();
      }, 800);
    } catch (err) {
      setToast({
        message: err.message || 'Authentication failed. Please check credentials.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: '' })} 
      />

      <div className="login-card-container">
        <button 
          className="login-back-btn" 
          onClick={onNavigateToContact}
          aria-label="Back to contact form"
        >
          ← Back to Website
        </button>

        <div className="login-card">
          <div className="login-header">
            <span className="login-logo-icon">🎔</span>
            <h2>Admin Portal</h2>
            <p>Sign in to manage form submissions</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="login-form-group">
              <label htmlFor="username">Username</label>
              <div className="login-input-wrapper">
                <span className="login-input-icon">👤</span>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  disabled={isSubmitting}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="login-form-group">
              <label htmlFor="password">Password</label>
              <div className="login-input-wrapper">
                <span className="login-input-icon">🔒</span>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className={`login-submit-btn ${isSubmitting ? 'login-btn-loading' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="login-spinner"></span>
                  Authenticating...
                </>
              ) : (
                'Secure Login'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
