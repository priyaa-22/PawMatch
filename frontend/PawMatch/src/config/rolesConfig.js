/**
 * Role Constants and Configuration for PawMatch V1
 */

export const ROLES = {
  PET_OWNER: 'PET_OWNER',
  SHELTER_ADMIN: 'SHELTER_ADMIN',
  NGO_ADMIN: 'NGO_ADMIN',
  RESCUE_ORG: 'RESCUE_ORG',
  VETERINARIAN: 'VETERINARIAN',
  SUPER_ADMIN: 'SUPER_ADMIN',
  MODERATOR: 'MODERATOR',
};

export const ROLE_DISPLAY_NAMES = {
  [ROLES.PET_OWNER]: 'Pet Owner',
  [ROLES.SHELTER_ADMIN]: 'Shelter Administrator',
  [ROLES.NGO_ADMIN]: 'NGO Administrator',
  [ROLES.RESCUE_ORG]: 'Rescue Organization',
  [ROLES.VETERINARIAN]: 'Veterinarian',
  [ROLES.SUPER_ADMIN]: 'Super Administrator',
  [ROLES.MODERATOR]: 'Moderator',
};

export const ROLE_DEFAULT_ROUTES = {
  [ROLES.PET_OWNER]: '/dashboard/pet-owner',
  [ROLES.SHELTER_ADMIN]: '/dashboard/shelter',
  [ROLES.NGO_ADMIN]: '/dashboard/ngo',
  [ROLES.RESCUE_ORG]: '/dashboard/rescue',
  [ROLES.VETERINARIAN]: '/dashboard/veterinarian',
  [ROLES.SUPER_ADMIN]: '/dashboard/admin',
  [ROLES.MODERATOR]: '/dashboard/moderator',
};

export const ROLE_BADGE_CLASSES = {
  [ROLES.PET_OWNER]: 'badge-adopter',
  [ROLES.SHELTER_ADMIN]: 'badge-shelter',
  [ROLES.NGO_ADMIN]: 'badge-shelter',
  [ROLES.RESCUE_ORG]: 'badge-shelter',
  [ROLES.VETERINARIAN]: 'badge-adopter',
  [ROLES.SUPER_ADMIN]: 'badge-admin',
  [ROLES.MODERATOR]: 'badge-admin',
};
