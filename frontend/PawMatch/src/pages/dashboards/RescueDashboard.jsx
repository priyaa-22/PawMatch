import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const RescueDashboard = () => {
  const { user, roleDisplayName, roleBadgeClass } = useAuth();

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '1080px' }}>
      <div
        className="auth-card"
        style={{
          maxWidth: '100%',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #FEF3C7 0%, #FEE2E2 100%)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className={`badge ${roleBadgeClass}`} style={{ marginBottom: '0.5rem' }}>
              {roleDisplayName}
            </span>
            <h1 className="heading-md">Rescue Emergency Hub 🚨</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
              Dispatch emergency rescue teams, process intake requests, and track field operations.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/rescue-requests" className="btn-primary" style={{ width: 'auto' }}>
              Emergency Intake
            </Link>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div className="auth-card" style={{ maxWidth: '100%' }}>
          <h3 className="heading-sm" style={{ marginBottom: '0.75rem' }}>🆘 Rescue Requests</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Monitor distress calls, injury reports, and stray rescue dispatches.
          </p>
          <Link to="/rescue-requests" className="btn-secondary" style={{ display: 'block', textAlign: 'center' }}>
            View Active Requests
          </Link>
        </div>

        <div className="auth-card" style={{ maxWidth: '100%' }}>
          <h3 className="heading-sm" style={{ marginBottom: '0.75rem' }}>🐕 Rescued Animals</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Manage medical triage, quarantine status, and foster placement.
          </p>
          <Link to="/animals" className="btn-secondary" style={{ display: 'block', textAlign: 'center' }}>
            Rescue Animals Catalog
          </Link>
        </div>

        <div className="auth-card" style={{ maxWidth: '100%' }}>
          <h3 className="heading-sm" style={{ marginBottom: '0.75rem' }}>📑 Operations Reports</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Track response times, rescue success rates, and veterinary referrals.
          </p>
          <Link to="/reports" className="btn-secondary" style={{ display: 'block', textAlign: 'center' }}>
            Operations Summary
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RescueDashboard;
