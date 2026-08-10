import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import authService from '../services/auth.service';
import PasswordInput from '../components/PasswordInput/PasswordInput';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setMessage('');
    setErrorMsg('');
    setFieldErrors({});

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      setFieldErrors({ confirm_password: ['Passwords do not match.'] });
      return;
    }

    setSubmitting(true);

    try {
      const res = await authService.resetPassword({
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      if (res.success) {
        setSuccess(true);
        setMessage(res.message || 'Password reset successful.');
      } else {
        setErrorMsg(res.message || 'Your reset token is invalid or has expired.');
        if (res.errors) {
          setFieldErrors(res.errors);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Your reset token is invalid or has expired.');
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
          <h2 className="heading-md" style={{ marginBottom: '0.5rem' }}>Reset Password</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Set a new secure password for your PawMatch account
          </p>
        </div>

        {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

        {success ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
              {message || 'Password reset successful.'}
            </div>
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate('/login')}
              style={{ width: '100%' }}
            >
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {!tokenFromUrl && (
              <div className="form-group">
                <label className="form-label" htmlFor="reset-token">Reset Token</label>
                <input
                  id="reset-token"
                  type="text"
                  className="form-input"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste your reset token here"
                  required
                  disabled={submitting}
                />
                {fieldErrors.token && (
                  <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                    {fieldErrors.token[0]}
                  </span>
                )}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="reset-new-password">New Password</label>
              <PasswordInput
                id="reset-new-password"
                name="new_password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (fieldErrors.new_password) setFieldErrors({ ...fieldErrors, new_password: null });
                }}
                placeholder="••••••••"
                required
                disabled={submitting}
                autoComplete="new-password"
              />
              {fieldErrors.new_password && (
                <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                  {fieldErrors.new_password[0]}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reset-confirm-password">Confirm Password</label>
              <PasswordInput
                id="reset-confirm-password"
                name="confirm_password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirm_password) setFieldErrors({ ...fieldErrors, confirm_password: null });
                }}
                placeholder="••••••••"
                required
                disabled={submitting}
                autoComplete="new-password"
              />
              {fieldErrors.confirm_password && (
                <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                  {fieldErrors.confirm_password[0]}
                </span>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={submitting} style={{ marginTop: '1rem' }}>
              {submitting ? <span className="loading-spinner"></span> : 'Reset Password'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <Link to="/login" style={{ color: 'var(--color-accent-brown)', fontWeight: '600' }}>
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
