import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import Toast from './Toast';
import './Dashboard.css';

export default function Dashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ message: '', type: '' });
  const [adminUser, setAdminUser] = useState(null);
  const [deletingId, setDeletingId] = useState(null); // Tracks the ID currently being deleted

  // Fetch all submissions from api
  const fetchSubmissions = async (searchTerm = '') => {
    setLoading(true);
    try {
      const response = await apiService.getSubmissions(searchTerm);
      setSubmissions(response.data || []);
    } catch (err) {
      setToast({
        message: err.message || 'Failed to fetch form submissions.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load user info and submissions on mount
  useEffect(() => {
    const user = apiService.getCurrentUser();
    setAdminUser(user);
    fetchSubmissions();
  }, []);

  // Handle Search Input Change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
  };

  // Trigger search on submit or debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchSubmissions(search);
    }, 400); // 400ms debounce to prevent spamming server while typing

    return () => clearTimeout(delayDebounce);
  }, [search]);

  // Handle Delete Submission
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this submission?')) {
      return;
    }

    setDeletingId(id);

    try {
      await apiService.deleteSubmission(id);
      setToast({
        message: 'Submission deleted successfully',
        type: 'success'
      });
      // Remove from state immediately
      setSubmissions(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setToast({
        message: err.message || 'Failed to delete submission.',
        type: 'error'
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    apiService.logout();
  };

  // Formats UTC date into beautiful local date and time representation
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="dashboard-wrapper">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: '' })} 
      />

      {/* Admin Dashboard Navbar */}
      <header className="dash-navbar">
        <div className="dash-logo">
          <span className="logo-icon">🎔</span>
          <span className="logo-text">She Can <span className="logo-accent">Admin Portal</span></span>
        </div>
        <div className="dash-nav-actions">
          {adminUser && (
            <span className="user-greeting">
              Welcome, <strong>{adminUser.username}</strong>
            </span>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="dashboard-content">
        <div className="dashboard-header-panel">
          <h1>Submission Dashboard</h1>
          <p>Monitor, search, and manage all contact requests sent to the She Can Foundation.</p>
        </div>

        {/* Statistics Banner */}
        <section className="stats-row">
          <div className="stat-card">
            <div className="stat-card-content">
              <span className="stat-card-title">Total Submissions</span>
              <span className="stat-card-value">{loading ? '...' : submissions.length}</span>
            </div>
            <div className="stat-card-icon">✉</div>
          </div>
        </section>

        {/* Controls: Search bar */}
        <section className="controls-row">
          <div className="search-bar-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name, email, or message contents..."
              value={search}
              onChange={handleSearchChange}
              aria-label="Search submissions"
            />
            {search && (
              <button 
                className="clear-search-btn" 
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </section>

        {/* Submissions List / Table */}
        <section className="submissions-section">
          {loading && submissions.length === 0 ? (
            <div className="dashboard-state-box">
              <span className="dash-loader"></span>
              <p>Fetching latest submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="dashboard-state-box empty-state">
              <span className="empty-icon">📂</span>
              <h3>No Submissions Found</h3>
              <p>{search ? 'Try adjusting your search filters.' : 'There are currently no contact form submissions.'}</p>
            </div>
          ) : (
            <div className="table-responsive-container">
              <table className="submissions-table">
                <thead>
                  <tr>
                    <th scope="col">Sender Details</th>
                    <th scope="col">Message Description</th>
                    <th scope="col">Submitted At</th>
                    <th scope="col" className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((item) => (
                    <tr key={item.id} className={deletingId === item.id ? 'row-deleting' : ''}>
                      <td className="cell-sender">
                        <div className="sender-avatar">
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="sender-info">
                          <strong className="sender-name">{item.name}</strong>
                          <a href={`mailto:${item.email}`} className="sender-email">{item.email}</a>
                        </div>
                      </td>
                      <td className="cell-message">
                        <div className="message-text-bubble">
                          {item.message}
                        </div>
                      </td>
                      <td className="cell-timestamp">
                        <span className="time-badge">
                          📅 {formatDate(item.createdAt)}
                        </span>
                      </td>
                      <td className="cell-action text-center">
                        <button
                          className="delete-action-btn"
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          aria-label={`Delete submission from ${item.name}`}
                        >
                          {deletingId === item.id ? 'Deleting...' : '🗑 Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
