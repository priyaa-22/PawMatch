/**
 * Role-Based Navigation Configuration for PawMatch V1
 */

import { ROLES } from './rolesConfig';

export const PUBLIC_NAV_ITEMS = [
  { name: 'Home', href: '/' },
  { name: 'Adopt Pets', href: '/#adopt' },
  { name: 'How It Works', href: '/#how-it-works' },
  { name: 'Shelters', href: '/#shelters' },
  { name: 'About', href: '/#about' },
];

export const ROLE_NAVIGATION_CONFIG = {
  [ROLES.PET_OWNER]: [
    { name: 'Adopt Pets', href: '/#adopt' },
    { name: 'Favorites', href: '/favorites' },
    { name: 'Applications', href: '/applications' },
    { name: 'Profile', href: '/profile' },
  ],
  [ROLES.SHELTER_ADMIN]: [
    { name: 'Dashboard', href: '/dashboard/shelter' },
    { name: 'Pet Listings', href: '/pet-listings' },
    { name: 'Adoption Applications', href: '/applications' },
    { name: 'Analytics', href: '/analytics' },
    { name: 'Profile', href: '/profile' },
  ],
  [ROLES.NGO_ADMIN]: [
    { name: 'Dashboard', href: '/dashboard/ngo' },
    { name: 'Campaigns', href: '/campaigns' },
    { name: 'Sponsorships', href: '/sponsorships' },
    { name: 'Reports', href: '/reports' },
    { name: 'Profile', href: '/profile' },
  ],
  [ROLES.RESCUE_ORG]: [
    { name: 'Dashboard', href: '/dashboard/rescue' },
    { name: 'Rescue Requests', href: '/rescue-requests' },
    { name: 'Animals', href: '/animals' },
    { name: 'Reports', href: '/reports' },
    { name: 'Profile', href: '/profile' },
  ],
  [ROLES.VETERINARIAN]: [
    { name: 'Dashboard', href: '/dashboard/veterinarian' },
    { name: 'Appointments', href: '/appointments' },
    { name: 'Patients', href: '/patients' },
    { name: 'Profile', href: '/profile' },
  ],
  [ROLES.SUPER_ADMIN]: [
    { name: 'Admin Dashboard', href: '/dashboard/admin' },
    { name: 'User Management', href: '/admin/users' },
    { name: 'Verification Queue', href: '/admin/verification' },
    { name: 'Audit Logs', href: '/admin/audit-logs' },
    { name: 'Platform Settings', href: '/admin/settings' },
    { name: 'RBAC Management', href: '/admin/rbac' },
  ],
  [ROLES.MODERATOR]: [
    { name: 'Moderation Queue', href: '/moderation/queue' },
    { name: 'Community Reports', href: '/moderation/reports' },
    { name: 'Profile', href: '/profile' },
  ],
};

export const getNavigationForRole = (role) => {
  if (!role) return PUBLIC_NAV_ITEMS;
  return ROLE_NAVIGATION_CONFIG[role] || PUBLIC_NAV_ITEMS;
};
