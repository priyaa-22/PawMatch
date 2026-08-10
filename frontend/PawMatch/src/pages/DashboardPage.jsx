import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../config/rolesConfig';

import PetOwnerDashboard from './dashboards/PetOwnerDashboard';
import ShelterDashboard from './dashboards/ShelterDashboard';
import NGODashboard from './dashboards/NGODashboard';
import RescueDashboard from './dashboards/RescueDashboard';
import VeterinarianDashboard from './dashboards/VeterinarianDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import ModeratorDashboard from './dashboards/ModeratorDashboard';

export const DashboardPage = () => {
  const { currentRole, setDevRole, roleDisplayName } = useAuth();

  const renderDashboardByRole = () => {
    switch (currentRole) {
      case ROLES.SHELTER_ADMIN:
        return <ShelterDashboard />;
      case ROLES.NGO_ADMIN:
        return <NGODashboard />;
      case ROLES.RESCUE_ORG:
        return <RescueDashboard />;
      case ROLES.VETERINARIAN:
        return <VeterinarianDashboard />;
      case ROLES.SUPER_ADMIN:
        return <AdminDashboard />;
      case ROLES.MODERATOR:
        return <ModeratorDashboard />;
      case ROLES.PET_OWNER:
      default:
        return <PetOwnerDashboard />;
    }
  };

  return (
    <div>
      {/* Dev Role Testing Switcher Banner (Requirement #9 Isolated Dev Mock Helper) */}
      <div
        style={{
          background: 'var(--color-bg-beige-light)',
          borderBottom: '1px solid var(--color-border)',
          padding: '0.6rem 1.5rem',
          fontSize: '0.825rem',
          color: 'var(--color-text-muted)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <span>
          🛠️ <strong>Dev Role Switcher:</strong> Active Role is <span style={{ color: 'var(--color-accent-brown)', fontWeight: 600 }}>{roleDisplayName}</span>
        </span>
        <select
          value={currentRole || ROLES.PET_OWNER}
          onChange={(e) => setDevRole(e.target.value)}
          style={{
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            border: '1px solid var(--color-border)',
            fontSize: '0.8rem',
            background: 'var(--color-card)',
            color: 'var(--color-text-main)',
            cursor: 'pointer',
          }}
        >
          <option value={ROLES.PET_OWNER}>Pet Owner</option>
          <option value={ROLES.SHELTER_ADMIN}>Shelter Administrator</option>
          <option value={ROLES.NGO_ADMIN}>NGO Administrator</option>
          <option value={ROLES.RESCUE_ORG}>Rescue Organization</option>
          <option value={ROLES.VETERINARIAN}>Veterinarian</option>
          <option value={ROLES.SUPER_ADMIN}>Super Administrator</option>
          <option value={ROLES.MODERATOR}>Moderator</option>
        </select>
      </div>

      {renderDashboardByRole()}
    </div>
  );
};

export default DashboardPage;
