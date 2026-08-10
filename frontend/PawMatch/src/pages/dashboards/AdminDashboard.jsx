import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const AdminDashboard = () => {
  const { user, roleDisplayName, roleBadgeClass } = useAuth();

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '1080px' }}>
      <div
        className="auth-card"
        style={{
          maxWidth: '100%',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #FEE2E2 0%, #FEF3C7 100%)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className={`badge ${roleBadgeClass}`} style={{ marginBottom: '0.5rem' }}>
              {roleDisplayName}
            </span>
            <h1 className="heading-md">Platform Administration 👑</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
              Global control center for platform security, user roles, verification queues, and audit telemetry.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/admin/rbac" className="btn-primary" style={{ width: 'auto' }}>
              RBAC Management
            </Link>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div className="auth-card" style={{ maxWidth: '100%' }}>
          <h3 className="heading-sm" style={{ marginBottom: '0.75rem' }}>🛡️ RBAC & Role Management</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Assign, replace, or revoke platform security roles and permissions.
          </p>
          <Link to="/admin/rbac" className="btn-secondary" style={{ display: 'block', textAlign: 'center' }}>
            Manage User Roles
          </Link>
        </div>

        <div className="auth-card" style={{ maxWidth: '100%' }}>
          <h3 className="heading-sm" style={{ marginBottom: '0.75rem' }}>👥 User Management</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Search accounts, review user status, and inspect user activity profiles.
          </p>
          <Link to="/admin/users" className="btn-secondary" style={{ display: 'block', textAlign: 'center' }}>
            User Directory
          </Link>
        </div>

        <div className="auth-card" style={{ maxWidth: '100%' }}>
          <h3 className="heading-sm" style={{ marginBottom: '0.75rem' }}>✅ Verification Queue</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Review shelter license applications, NGO credentials, and vet certifications.
          </p>
          <Link to="/admin/verification" className="btn-secondary" style={{ display: 'block', textAlign: 'center' }}>
            Verification Queue
          </Link>
        </div>

        <div className="auth-card" style={{ maxWidth: '100%' }}>
          <h3 className="heading-sm" style={{ marginBottom: '0.75rem' }}>📜 Audit Logs</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Inspect system action trace logs and security compliance events.
          </p>
          <Link to="/admin/audit-logs" className="btn-secondary" style={{ display: 'block', textAlign: 'center' }}>
            Inspect Audit Logs
          </Link>
        </div>

        <div className="auth-card" style={{ maxWidth: '100%' }}>
          <h3 className="heading-sm" style={{ marginBottom: '0.75rem' }}>⚙️ Platform Settings</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Configure global adoption rules, notification triggers, and API features.
          </p>
          <Link to="/admin/settings" className="btn-secondary" style={{ display: 'block', textAlign: 'center' }}>
            Platform Settings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
