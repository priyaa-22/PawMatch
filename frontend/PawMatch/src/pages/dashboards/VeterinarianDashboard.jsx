import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const VeterinarianDashboard = () => {
  const { user, roleDisplayName, roleBadgeClass } = useAuth();

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '1080px' }}>
      <div
        className="auth-card"
        style={{
          maxWidth: '100%',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #ECFDF5 0%, #F5F0E8 100%)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className={`badge ${roleBadgeClass}`} style={{ marginBottom: '0.5rem' }}>
              {roleDisplayName}
            </span>
            <h1 className="heading-md">Veterinary Clinic Portal 🩺</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
              Schedule health checkups, issue medical certificates, and manage patient treatment plans.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/appointments" className="btn-primary" style={{ width: 'auto' }}>
              Schedule Exam
            </Link>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div className="auth-card" style={{ maxWidth: '100%' }}>
          <h3 className="heading-sm" style={{ marginBottom: '0.75rem' }}>📅 Appointments</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Review daily clinic schedules, pre-adoption health clearances, and vaccinations.
          </p>
          <Link to="/appointments" className="btn-secondary" style={{ display: 'block', textAlign: 'center' }}>
            View Appointments
          </Link>
        </div>

        <div className="auth-card" style={{ maxWidth: '100%' }}>
          <h3 className="heading-sm" style={{ marginBottom: '0.75rem' }}>📋 Patient Health Records</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Access medical histories, microchip IDs, and spay/neuter verification.
          </p>
          <Link to="/patients" className="btn-secondary" style={{ display: 'block', textAlign: 'center' }}>
            Browse Patient Records
          </Link>
        </div>

        <div className="auth-card" style={{ maxWidth: '100%' }}>
          <h3 className="heading-sm" style={{ marginBottom: '0.75rem' }}>👤 Vet Profile</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Update licensing credentials, clinic location, and consultation hours.
          </p>
          <Link to="/profile" className="btn-secondary" style={{ display: 'block', textAlign: 'center' }}>
            Update Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VeterinarianDashboard;
