import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const NGODashboard = () => {
  const { user, roleDisplayName, roleBadgeClass } = useAuth();

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '1080px' }}>
      <div
        className="auth-card"
        style={{
          maxWidth: '100%',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #E0E7FF 0%, #F5F0E8 100%)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className={`badge ${roleBadgeClass}`} style={{ marginBottom: '0.5rem' }}>
              {roleDisplayName}
            </span>
            <h1 className="heading-md">NGO Mission Center 🤝</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
              Manage community campaigns, foster networks, animal welfare sponsorships, and impact reports.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/campaigns" className="btn-primary" style={{ width: 'auto' }}>
              Create Campaign
            </Link>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div className="auth-card" style={{ maxWidth: '100%' }}>
          <h3 className="heading-sm" style={{ marginBottom: '0.75rem' }}>📢 Active Campaigns</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Launch fundraising drive, vaccination camps, and community awareness events.
          </p>
          <Link to="/campaigns" className="btn-secondary" style={{ display: 'block', textAlign: 'center' }}>
            Manage Campaigns
          </Link>
        </div>

        <div className="auth-card" style={{ maxWidth: '100%' }}>
          <h3 className="heading-sm" style={{ marginBottom: '0.75rem' }}>🎁 Pet Sponsorships</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Connect sponsors with special needs and senior shelter animals.
          </p>
          <Link to="/sponsorships" className="btn-secondary" style={{ display: 'block', textAlign: 'center' }}>
            View Sponsorships
          </Link>
        </div>

        <div className="auth-card" style={{ maxWidth: '100%' }}>
          <h3 className="heading-sm" style={{ marginBottom: '0.75rem' }}>📈 Impact Reports</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Generate welfare metrics, grant compliance reports, and community outreach data.
          </p>
          <Link to="/reports" className="btn-secondary" style={{ display: 'block', textAlign: 'center' }}>
            Generate Reports
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NGODashboard;
