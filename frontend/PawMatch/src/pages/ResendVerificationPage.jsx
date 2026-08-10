import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/auth.service';

export const ResendVerificationPage = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setErrorMsg('');
    setFieldErrors({});
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const res = await authService.resendVerification(email);
      if (res.success) {
        setSuccessMsg(res.message || 'Verification email has been resent successfully. Please check your inbox.');
      } else {
        setErrorMsg(res.message || 'Failed to resend verification email.');
        if (res.errors) {
          setFieldErrors(res.errors);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'A network error occurred while sending verification email.');
      if (err.errors) {
        setFieldErrors(err.errors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 className="heading-md" style={{ marginBottom: '0.5rem' }}>Resend Verification Email</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Enter your email address to receive a new verification link
          </p>
        </div>

        {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="resend-email">Email Address</label>
            <input
              id="resend-email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null });
              }}
              placeholder="user@example.com"
              required
              disabled={submitting}
              autoComplete="email"
            />
            {fieldErrors.email && (
              <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                {fieldErrors.email[0]}
              </span>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={submitting} style={{ marginTop: '1rem' }}>
            {submitting ? <span className="loading-spinner"></span> : 'Send Verification Email'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <Link to="/login" style={{ color: 'var(--color-accent-brown)', fontWeight: '600' }}>
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResendVerificationPage;
