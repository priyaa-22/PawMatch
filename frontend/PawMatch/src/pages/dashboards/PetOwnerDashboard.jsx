import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const PetOwnerDashboard = () => {
  const { user, roleDisplayName, roleBadgeClass } = useAuth();

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '1080px' }}>
      {/* Header Banner */}
      <div
        className="auth-card"
        style={{
          maxWidth: '100%',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #F7F0E8 0%, #FEF3C7 100%)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className={`badge ${roleBadgeClass}`} style={{ marginBottom: '0.5rem' }}>
              {roleDisplayName}
            </span>
            <h1 className="heading-md">Welcome, {user?.first_name || 'Pet Parent'}! 🐾</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
              Find your perfect furry companion and manage your adoption journey.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/#adopt" className="btn-primary" style={{ width: 'auto' }}>
              Adopt a Pet
            </Link>
            <Link to="/profile" className="btn-secondary">
              My Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation & Action Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div className="auth-card" style={{ maxWidth: '100%' }}>
          <h3 className="heading-sm" style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🐶 Adopt Pets
          </h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Browse verified dogs, cats, and small animals looking for a loving home.
          </p>
          <a href="/#adopt" className="btn-secondary" style={{ display: 'block', textAlign: 'center' }}>
            Browse Catalog
          </a>
        </div>

        <div className="auth-card" style={{ maxWidth: '100%' }}>
          <h3 className="heading-sm" style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ❤️ Saved Favorites
          </h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Keep track of pets you've bookmarked to check back on their availability.
          </p>
          <Link to="/favorites" className="btn-secondary" style={{ display: 'block', textAlign: 'center' }}>
            View Saved Favorites
          </Link>
        </div>

        <div className="auth-card" style={{ maxWidth: '100%' }}>
          <h3 className="heading-sm" style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📋 Adoption Applications
          </h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Check real-time status updates on your submitted adoption questionnaires.
          </p>
          <Link to="/applications" className="btn-secondary" style={{ display: 'block', textAlign: 'center' }}>
            View My Applications
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PetOwnerDashboard;
