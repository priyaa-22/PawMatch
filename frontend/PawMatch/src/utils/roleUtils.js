/**
 * Centralized Role Resolution Utilities for PawMatch
 */

import { ROLES, ROLE_DEFAULT_ROUTES, ROLE_DISPLAY_NAMES, ROLE_BADGE_CLASSES } from '../config/rolesConfig';

const MOCK_ROLE_STORAGE_KEY = 'pawmatch_dev_role';

/**
 * Normalizes raw role strings or backend role arrays into standard PawMatch ROLES constant.
 * Handles backend role aliases (e.g. ADMINISTRATOR -> SUPER_ADMIN, SHELTER_STAFF -> SHELTER_ADMIN).
 */
export const normalizeRole = (roleInput) => {
  if (!roleInput) return null;

  const raw = String(roleInput).trim().toUpperCase();

  if (raw === 'ADMINISTRATOR' || raw === 'SUPER_ADMIN' || raw === 'ADMIN') {
    return ROLES.SUPER_ADMIN;
  }
  if (raw === 'SHELTER_ADMIN' || raw === 'SHELTER_MANAGER' || raw === 'SHELTER_STAFF' || raw === 'SHELTER') {
    return ROLES.SHELTER_ADMIN;
  }
  if (raw === 'NGO_ADMIN' || raw === 'NGO' || raw === 'VOLUNTEER') {
    return ROLES.NGO_ADMIN;
  }
  if (raw === 'RESCUE_ORG' || raw === 'RESCUE') {
    return ROLES.RESCUE_ORG;
  }
  if (raw === 'VETERINARIAN' || raw === 'VET') {
    return ROLES.VETERINARIAN;
  }
  if (raw === 'MODERATOR' || raw === 'MOD') {
    return ROLES.MODERATOR;
  }
  if (raw === 'PET_OWNER' || raw === 'PET_ADOPTER' || raw === 'ADOPTER' || raw === 'USER') {
    return ROLES.PET_OWNER;
  }

  return null;
};

/**
 * Centralized role determination helper (SSOT for frontend).
 * Inspects:
 * 1) Backend returned roles array (e.g. from RBAC API or user object)
 * 2) Backend user object properties (role, account_type, user_type)
 * 3) Temporary development mock fallback (isolated per Requirement #9)
 */
export const determineUserRole = (user, userRoles = []) => {
  if (!user) return null;

  // 1. Check array of roles returned by backend RBAC or API
  if (Array.isArray(userRoles) && userRoles.length > 0) {
    for (const r of userRoles) {
      const normalized = normalizeRole(r);
      if (normalized) return normalized;
    }
  }

  // 2. Check direct role properties on backend User object if available
  const directRole = user.role || user.account_type || user.user_type;
  if (directRole) {
    const normalized = normalizeRole(directRole);
    if (normalized) return normalized;
  }

  // 3. Temporary Development Mock (Requirement #9)
  // Check if a dev role has been explicitly selected in local storage for testing
  const devMockRole = localStorage.getItem(MOCK_ROLE_STORAGE_KEY);
  if (devMockRole && Object.values(ROLES).includes(devMockRole)) {
    return devMockRole;
  }

  // Default fallback for authenticated user without explicit role from backend
  return ROLES.PET_OWNER;
};

/**
 * Gets default redirect route after login or access for a given role.
 */
export const getRoleDefaultRoute = (role) => {
  const normalized = normalizeRole(role) || ROLES.PET_OWNER;
  return ROLE_DEFAULT_ROUTES[normalized] || '/dashboard';
};

/**
 * Gets display name for a role.
 */
export const getRoleDisplayName = (role) => {
  const normalized = normalizeRole(role) || ROLES.PET_OWNER;
  return ROLE_DISPLAY_NAMES[normalized] || 'Pet Owner';
};

/**
 * Gets CSS badge class for a role.
 */
export const getRoleBadgeClass = (role) => {
  const normalized = normalizeRole(role) || ROLES.PET_OWNER;
  return ROLE_BADGE_CLASSES[normalized] || 'badge-adopter';
};

/**
 * Sets development mock role override (isolated strictly for dev testing).
 */
export const setDevRoleOverride = (role) => {
  if (role && Object.values(ROLES).includes(role)) {
    localStorage.setItem(MOCK_ROLE_STORAGE_KEY, role);
  } else {
    localStorage.removeItem(MOCK_ROLE_STORAGE_KEY);
  }
};
