import React, { useState } from 'react';
import { apiService } from '../services/api';
import Toast from './Toast';
import './ContactForm.css';

export default function ContactForm({ onNavigateToLogin }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  // Field validation logic
  const validateField = (name, value) => {
    let error = '';
    if (name === 'name') {
      if (!value.trim()) {
        error = 'Full Name is required';
      } else if (value.trim().length < 2) {
        error = 'Name must be at least 2 characters long';
      } else if (value.trim().length > 100) {
        error = 'Name cannot exceed 100 characters';
      }
    }

    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) {
        error = 'Email Address is required';
      } else if (!emailRegex.test(value.trim())) {
        error = 'Please enter a valid email address';
      }
    }

    if (name === 'message') {
      if (!value.trim()) {
        error = 'Message is required';
      } else if (value.trim().length < 10) {
        error = 'Message must be at least 10 characters long';
      } else if (value.trim().length > 2000) {
        error = 'Message cannot exceed 2000 characters';
      }
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Validate live as they type
    const fieldError = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: fieldError
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submitting
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setToast({
        message: 'Please resolve the form errors before submitting.',
        type: 'error'
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await apiService.submitContact(
        formData.name.trim(),
        formData.email.trim(),
        formData.message.trim()
      );

      setToast({
        message: 'Form Submitted Successfully',
        type: 'success'
      });
      
      // Clear form on success
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setToast({
        message: err.message || 'Failed to submit form. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page-wrapper">
      {/* Dynamic Toast Notifications */}
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: '' })} 
      />

      {/* Modern Top Header Navbar */}
      <header className="navbar">
        <div className="navbar-logo">
          <span className="logo-icon">🎔</span>
          <span className="logo-text">She Can <span className="logo-accent">Foundation</span></span>
        </div>
        <nav className="navbar-links">
          <button className="nav-admin-btn" onClick={onNavigateToLogin}>
            Admin Panel
          </button>
        </nav>
      </header>

      {/* Main Content Layout */}
      <main className="contact-container">
        <section className="contact-hero">
          <h1 className="hero-title">Empower. Support. Transform.</h1>
          <p className="hero-subtitle">
            Every voice deserves to be heard. Reach out to us for collaborations, support requests, or general inquiries. Together, we can drive lasting change.
          </p>
        </section>

        <div className="contact-grid">
          {/* Left Column: NGO Impact & Details */}
          <div className="info-column">
            <div className="info-card info-impact">
              <h3>Our Collective Impact</h3>
              <div className="impact-stats">
                <div className="stat-item">
                  <div className="stat-num">15K+</div>
                  <div className="stat-label">Girls Empowered</div>
                </div>
                <div className="stat-item">
                  <div className="stat-num">50+</div>
                  <div className="stat-label">Communities Served</div>
                </div>
              </div>
            </div>

            <div className="info-card">
              <h3>Get in Touch Directly</h3>
              <ul className="direct-contact-list">
                <li>
                  <span className="contact-icon">📧</span>
                  <div>
                    <strong>Email Us</strong>
                    <a href="mailto:info@shecanfoundation.org">info@shecanfoundation.org</a>
                  </div>
                </li>
                <li>
                  <span className="contact-icon">📞</span>
                  <div>
                    <strong>Call Us</strong>
                    <a href="tel:+1234567890">+1 (234) 567-890</a>
                  </div>
                </li>
                <li>
                  <span className="contact-icon">📍</span>
                  <div>
                    <strong>Our Headquarters</strong>
                    <p>100 Empowerment Boulevard, Suite 500, New York, NY</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="form-column">
            <div className="glass-form-card">
              <h2>Send Us a Message</h2>
              <p className="form-intro">Fill out the form below and our team will get back to you within 24 hours.</p>

              <form onSubmit={handleSubmit} noValidate>
                {/* Full Name Field */}
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <div className="input-wrapper">
                    <span className="input-icon">👤</span>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Jane Doe"
                      className={errors.name ? 'input-error' : formData.name && !errors.name ? 'input-success' : ''}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "name-error" : undefined}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  {errors.name && (
                    <span id="name-error" className="error-message" role="alert">
                      {errors.name}
                    </span>
                  )}
                </div>

                {/* Email Field */}
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-wrapper">
                    <span className="input-icon">✉</span>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. jane.doe@example.com"
                      className={errors.email ? 'input-error' : formData.email && !errors.email ? 'input-success' : ''}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  {errors.email && (
                    <span id="email-error" className="error-message" role="alert">
                      {errors.email}
                    </span>
                  )}
                </div>

                {/* Message Field */}
                <div className="form-group">
                  <label htmlFor="message">Your Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help you..."
                    rows="5"
                    className={errors.message ? 'input-error' : formData.message && !errors.message ? 'input-success' : ''}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? "message-error" : undefined}
                    disabled={isSubmitting}
                    required
                  ></textarea>
                  {errors.message && (
                    <span id="message-error" className="error-message" role="alert">
                      {errors.message}
                    </span>
                  )}
                </div>

                {/* Submit Button with Loading Spinner */}
                <button
                  type="submit"
                  className={`submit-btn ${isSubmitting ? 'btn-loading' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span>
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
