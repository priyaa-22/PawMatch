/**
 * Centralized Shelter Constants and Configuration for PawMatch
 * Aligned with backend django models in apps/shelters/constants.py
 */

export const SHELTER_STATUS = {
  UNVERIFIED: 'unverified',
  VERIFIED: 'verified',
  SUSPENDED: 'suspended',
  ARCHIVED: 'archived',
};

export const ORGANIZATION_TYPES = {
  NON_PROFIT: 'non_profit',
  MUNICIPAL: 'municipal',
  PRIVATE: 'private',
  FOSTER_NETWORK: 'foster_network',
  OTHER: 'other',
};

export const VERIFICATION_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  NEEDS_INFORMATION: 'needs_information',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const SHELTER_MEMBER_ROLES = {
  OWNER: 'owner',
  MANAGER: 'manager',
  STAFF: 'staff',
  VOLUNTEER: 'volunteer',
  VETERINARIAN: 'veterinarian',
  VIEWER: 'viewer',
};

export const DOCUMENT_TYPES = {
  REGISTRATION_CERTIFICATE: 'registration_certificate',
  NGO_CERTIFICATE: 'ngo_certificate',
  GOVERNMENT_LICENSE: 'government_license',
  ADDRESS_PROOF: 'address_proof',
  IDENTITY_PROOF: 'identity_proof',
  TAX_CERTIFICATE: 'tax_certificate',
  OTHER: 'other',
};

export const DOCUMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const INVITATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  EXPIRED: 'expired',
  REVOKED: 'revoked',
};

export const SHELTER_STATUS_DISPLAY_NAMES = {
  [SHELTER_STATUS.UNVERIFIED]: 'Unverified',
  [SHELTER_STATUS.VERIFIED]: 'Verified',
  [SHELTER_STATUS.SUSPENDED]: 'Suspended',
  [SHELTER_STATUS.ARCHIVED]: 'Archived',
};

export const ORGANIZATION_TYPE_DISPLAY_NAMES = {
  [ORGANIZATION_TYPES.NON_PROFIT]: 'Non-Profit / NGO',
  [ORGANIZATION_TYPES.MUNICIPAL]: 'Municipal / Government Shelter',
  [ORGANIZATION_TYPES.PRIVATE]: 'Private Rescue / Sanctuary',
  [ORGANIZATION_TYPES.FOSTER_NETWORK]: 'Foster Network',
  [ORGANIZATION_TYPES.OTHER]: 'Other',
};

export const VERIFICATION_STATUS_DISPLAY_NAMES = {
  [VERIFICATION_STATUS.DRAFT]: 'Draft',
  [VERIFICATION_STATUS.SUBMITTED]: 'Submitted',
  [VERIFICATION_STATUS.UNDER_REVIEW]: 'Under Review',
  [VERIFICATION_STATUS.NEEDS_INFORMATION]: 'Needs Information',
  [VERIFICATION_STATUS.APPROVED]: 'Approved',
  [VERIFICATION_STATUS.REJECTED]: 'Rejected',
};

export const DOCUMENT_TYPE_DISPLAY_NAMES = {
  [DOCUMENT_TYPES.REGISTRATION_CERTIFICATE]: 'Registration Certificate',
  [DOCUMENT_TYPES.NGO_CERTIFICATE]: 'NGO Certificate',
  [DOCUMENT_TYPES.GOVERNMENT_LICENSE]: 'Government License',
  [DOCUMENT_TYPES.ADDRESS_PROOF]: 'Address Proof',
  [DOCUMENT_TYPES.IDENTITY_PROOF]: 'Identity Proof',
  [DOCUMENT_TYPES.TAX_CERTIFICATE]: 'Tax Certificate',
  [DOCUMENT_TYPES.OTHER]: 'Other Document',
};

export const MEMBER_ROLE_DISPLAY_NAMES = {
  [SHELTER_MEMBER_ROLES.OWNER]: 'Owner',
  [SHELTER_MEMBER_ROLES.MANAGER]: 'Manager',
  [SHELTER_MEMBER_ROLES.STAFF]: 'Staff',
  [SHELTER_MEMBER_ROLES.VOLUNTEER]: 'Volunteer',
  [SHELTER_MEMBER_ROLES.VETERINARIAN]: 'Veterinarian',
  [SHELTER_MEMBER_ROLES.VIEWER]: 'Viewer',
};
