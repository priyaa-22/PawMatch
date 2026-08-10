import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [verifying, setVerifying] = useState(Boolean(token));
  const [status, setStatus] = useState({
    success: null, // null = initial/verifying, true = success, false = failed
    message: '',
  });

  const navigate = useNavigate();
  const hasRequested = useRef(false);

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setStatus({
        success: false,
        message: 'Your verification link is invalid or missing.',
      });
      return;
    }

    // Prevent duplicate verification requests
    if (hasRequested.current) return;
    hasRequested.current = true;

    setVerifying(true);
    authService
      .verifyEmail(token, 'GET')
      .then((res) => {
        if (res.success) {
          setStatus({
            success: true,
            message: res.message || 'Your email has been verified successfully.',
          });
        } else {
          setStatus({
            success: false,
            message: res.message || 'Your verification link is invalid or has expired.',
          });
        }
      })
      .catch((err) => {
        setStatus({
          success: false,
          message: err.message || 'Your verification link is invalid or has expired.',
        });
      })
      .finally(() => {
        setVerifying(false);
      });
  }, [token]);

  return (
    <div className="auth-page-container">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        {verifying && (
          <div style={{ padding: '2rem 0' }}>
            <div
              className="loading-spinner"
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderWidth: '3px',
                borderColor: 'rgba(139, 90, 43, 0.2)',
                borderTopColor: 'var(--color-accent-brown)',
                margin: '0 auto 1rem auto',
              }}
            ></div>
            <h2 className="heading-md" style={{ marginBottom: '0.5rem' }}>Verifying Email</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Please wait while we verify your email address...
            </p>
          </div>
        )}

        {!verifying && status.success === true && (
          <div style={{ padding: '1rem 0' }}>
            <div
              style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '50%',
                backgroundColor: '#ECFDF5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                margin: '0 auto 1.25rem auto',
                fontWeight: 'bold',
              }}
            >
              ✓
            </div>
            <h2 className="heading-md" style={{ marginBottom: '0.75rem', color: '#065F46' }}>
              Email Verified
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
              {status.message || 'Your email has been verified successfully.'}
            </p>

            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate('/login')}
              style={{ width: '100%' }}
            >
              Go to Login
            </button>
          </div>
        )}

        {!verifying && status.success === false && (
          <div style={{ padding: '1rem 0' }}>
            <div
              style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '50%',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                margin: '0 auto 1.25rem auto',
                fontWeight: 'bold',
              }}
            >
              ✕
            </div>
            <h2 className="heading-md" style={{ marginBottom: '0.75rem', color: '#991B1B' }}>
              Verification Failed
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
              {status.message || 'Your verification link is invalid or has expired.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => navigate('/resend-verification')}
                style={{ width: '100%' }}
              >
                Resend Verification Email
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/login')}
                style={{ width: '100%' }}
              >
                Back to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
