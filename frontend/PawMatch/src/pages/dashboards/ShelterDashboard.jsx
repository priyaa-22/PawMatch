import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const ShelterDashboard = () => {
  const { user, roleDisplayName, roleBadgeClass } = useAuth();

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '1080px' }}>
      {/* Header Banner */}
      <div
        className="auth-card"
        style={{
          maxWidth: '100%',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #FEF3C7 0%, #F5F0E8 100%)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className={`badge ${roleBadgeClass}`} style={{ marginBottom: '0.5rem' }}>
              {roleDisplayName}
            </span>
            <h1 className="heading-md">Shelter Command Center 🏠</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
              Manage shelter listings, process adoption applications, and monitor intake analytics.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/pet-listings" className="btn-primary" style={{ width: 'auto' }}>
              Add Pet Listing
            </Link>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div className="auth-card" style={{ maxWidth: '100%' }}>
          <h3 className="heading-sm" style={{ marginBottom: '0.75rem' }}>🐾 Active Pet Listings</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Publish, edit, and update medical history for shelter animals.
          </p>
          <Link to="/pet-listings" className="btn-secondary" style={{ display: 'block', textAlign: 'center' }}>
            Manage Pet Listings
          </Link>
        </div>

        <div className="auth-card" style={{ maxWidth: '100%' }}>
          <h3 className="heading-sm" style={{ marginBottom: '0.75rem' }}>📑 Adoption Applications</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Review incoming adopter questionnaires and schedule home check visits.
          </p>
          <Link to="/applications" className="btn-secondary" style={{ display: 'block', textAlign: 'center' }}>
            Review Applications
          </Link>
        </div>

        <div className="auth-card" style={{ maxWidth: '100%' }}>
          <h3 className="heading-sm" style={{ marginBottom: '0.75rem' }}>📊 Shelter Analytics</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Track monthly adoption rates, average length-of-stay, and capacity.
          </p>
          <Link to="/analytics" className="btn-secondary" style={{ display: 'block', textAlign: 'center' }}>
            View Analytics
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShelterDashboard;
