import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const UnauthorizedPage = () => {
  const { currentRole, roleDisplayName, defaultRoute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const attemptedPath = location.state?.from || location.pathname;

  return (
    <div className="auth-page-container">
      <div className="auth-card" style={{ maxWidth: '540px', textAlign: 'center', padding: '3rem 2rem' }}>
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: '#FEF2F2',
            color: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            margin: '0 auto 1.5rem auto',
            border: '2px solid #FECACA',
          }}
        >
          🛡️
        </div>

        <span className="badge badge-admin" style={{ marginBottom: '0.75rem' }}>
          403 Access Denied
        </span>

        <h1 className="heading-md" style={{ marginBottom: '0.75rem' }}>
          Unauthorized Access
        </h1>

        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          You do not have the required role or permissions to view the requested page{' '}
          <code style={{ background: 'var(--color-bg-beige)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.85rem' }}>
            {attemptedPath}
          </code>
          .
        </p>

        {currentRole && (
          <div
            style={{
              padding: '0.85rem 1rem',
              background: 'var(--color-bg-beige-light)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              marginBottom: '2rem',
              fontSize: '0.875rem',
              color: 'var(--color-text-main)',
            }}
          >
            Current Signed-In Role: <strong>{roleDisplayName}</strong>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
          <button
            type="button"
            className="btn-primary"
            style={{ width: 'auto' }}
            onClick={() => navigate(defaultRoute || '/dashboard')}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
