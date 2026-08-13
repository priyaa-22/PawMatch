import apiClient from './apiClient';

/**
 * Helper to construct FormData for document uploads
 */
const buildDocumentFormData = (fileOrPayload, documentType) => {
  if (fileOrPayload instanceof FormData) {
    return fileOrPayload;
  }
  const formData = new FormData();
  if (fileOrPayload && typeof fileOrPayload === 'object' && 'file' in fileOrPayload) {
    formData.append('file', fileOrPayload.file);
    const docType = fileOrPayload.document_type || fileOrPayload.documentType || documentType;
    if (docType) {
      formData.append('document_type', docType);
    }
  } else {
    formData.append('file', fileOrPayload);
    if (documentType) {
      formData.append('document_type', documentType);
    }
  }
  return formData;
};

export const shelterApi = {
  /**
   * 1. Register Shelter
   * POST /api/v1/shelters/register/
   */
  registerShelter: (payload) => {
    return apiClient.post('/api/v1/shelters/register/', payload);
  },

  /**
   * 2. Current User's Shelter Profile
   * GET /api/v1/shelters/me/
   */
  getMyShelter: () => {
    return apiClient.get('/api/v1/shelters/me/');
  },

  /**
   * 2. Update Current User's Shelter Profile
   * PATCH /api/v1/shelters/me/
   */
  updateMyShelter: (payload) => {
    return apiClient.patch('/api/v1/shelters/me/', payload);
  },

  /**
   * 3. Current Shelter Documents - Upload Document
   * POST /api/v1/shelters/upload-document/
   */
  uploadShelterDocument: (fileOrPayload, documentType) => {
    const formData = buildDocumentFormData(fileOrPayload, documentType);
    return apiClient.post('/api/v1/shelters/upload-document/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * 3. Current Shelter Documents - List Documents
   * GET /api/v1/shelters/documents/
   */
  getShelterDocuments: () => {
    return apiClient.get('/api/v1/shelters/documents/');
  },

  /**
   * 4. Shelter Dashboard Overview
   * GET /api/v1/shelters/dashboard/
   */
  getShelterDashboard: () => {
    return apiClient.get('/api/v1/shelters/dashboard/');
  },

  /**
   * 5. Shelter Catalog - List Shelters
   * GET /api/v1/shelters/
   * Supports filtering (search, status, city, state, is_active, page, ordering)
   */
  getShelters: (params = {}) => {
    return apiClient.get('/api/v1/shelters/', { params });
  },

  /**
   * Get single Shelter by ID
   * GET /api/v1/shelters/{id}/
   */
  getShelterById: (id) => {
    return apiClient.get(`/api/v1/shelters/${id}/`);
  },

  /**
   * Create Shelter (Standard ViewSet action)
   * POST /api/v1/shelters/
   */
  createShelter: (payload) => {
    return apiClient.post('/api/v1/shelters/', payload);
  },

  /**
   * Update Shelter by ID
   * PATCH /api/v1/shelters/{id}/
   */
  updateShelter: (id, payload) => {
    return apiClient.patch(`/api/v1/shelters/${id}/`, payload);
  },

  /**
   * 6. Shelter Verification - Submit Workflow
   * POST /api/v1/shelters/{id}/verification/submit/
   */
  submitShelterVerification: (id) => {
    return apiClient.post(`/api/v1/shelters/${id}/verification/submit/`);
  },

  /**
   * 6. Shelter Verification - Start Review
   * POST /api/v1/shelters/{id}/verification/start-review/
   */
  startVerificationReview: (id) => {
    return apiClient.post(`/api/v1/shelters/${id}/verification/start-review/`);
  },

  /**
   * 6. Shelter Verification - Request Information
   * POST /api/v1/shelters/{id}/verification/request-information/
   */
  requestVerificationInfo: (id, payload) => {
    const data = typeof payload === 'string' ? { notes: payload } : payload;
    return apiClient.post(`/api/v1/shelters/${id}/verification/request-information/`, data);
  },

  /**
   * 6. Shelter Verification - Approve
   * POST /api/v1/shelters/{id}/verification/approve/
   */
  approveShelterVerification: (id, payload = {}) => {
    const data = typeof payload === 'string' ? { notes: payload } : payload;
    return apiClient.post(`/api/v1/shelters/${id}/verification/approve/`, data);
  },

  /**
   * 6. Shelter Verification - Reject
   * POST /api/v1/shelters/{id}/verification/reject/
   */
  rejectShelterVerification: (id, payload) => {
    const data = typeof payload === 'string' ? { reason: payload } : payload;
    return apiClient.post(`/api/v1/shelters/${id}/verification/reject/`, data);
  },

  /**
   * 7. Shelter Documents by Shelter - List
   * GET /api/v1/shelters/{id}/documents/
   */
  getShelterDocumentsByShelterId: (shelterId) => {
    return apiClient.get(`/api/v1/shelters/${shelterId}/documents/`);
  },

  /**
   * 7. Shelter Documents by Shelter - Attach Document
   * POST /api/v1/shelters/{id}/documents/
   */
  uploadShelterDocumentByShelterId: (shelterId, fileOrPayload, documentType) => {
    const formData = buildDocumentFormData(fileOrPayload, documentType);
    return apiClient.post(`/api/v1/shelters/${shelterId}/documents/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * 8. Delete Current / Specific Shelter Document
   * DELETE /api/v1/shelters/documents/{id}/
   */
  deleteShelterDocument: (documentId) => {
    return apiClient.delete(`/api/v1/shelters/documents/${documentId}/`);
  },

  /**
   * 9. Shelter Members - List Members
   * GET /api/v1/shelters/{id}/members/
   */
  getShelterMembers: (shelterId, params = {}) => {
    return apiClient.get(`/api/v1/shelters/${shelterId}/members/`, { params });
  },

  /**
   * 9. Shelter Members - Add Member
   * POST /api/v1/shelters/{id}/members/
   */
  addShelterMember: (shelterId, payload) => {
    return apiClient.post(`/api/v1/shelters/${shelterId}/members/`, payload);
  },

  /**
   * 9. Shelter Members - Update Member Role
   * PATCH /api/v1/shelters/members/{id}/
   */
  updateShelterMember: (memberId, payload) => {
    const data = typeof payload === 'string' ? { role: payload } : payload;
    return apiClient.patch(`/api/v1/shelters/members/${memberId}/`, data);
  },

  /**
   * 9. Shelter Members - Remove Member
   * DELETE /api/v1/shelters/members/{id}/
   */
  removeShelterMember: (memberId) => {
    return apiClient.delete(`/api/v1/shelters/members/${memberId}/`);
  },

  /**
   * 10. Shelter Invitations - List Invitations
   * GET /api/v1/shelters/{id}/invitations/
   */
  getShelterInvitations: (shelterId, params = {}) => {
    return apiClient.get(`/api/v1/shelters/${shelterId}/invitations/`, { params });
  },

  /**
   * 10. Shelter Invitations - Create Invitation
   * POST /api/v1/shelters/{id}/invitations/
   */
  createShelterInvitation: (shelterId, payload) => {
    return apiClient.post(`/api/v1/shelters/${shelterId}/invitations/`, payload);
  },

  /**
   * 10. Shelter Invitations - Accept Invitation
   * POST /api/v1/shelters/invitations/accept/
   */
  acceptShelterInvitation: (payload) => {
    const data = typeof payload === 'string' ? { token: payload } : payload;
    return apiClient.post('/api/v1/shelters/invitations/accept/', data);
  },

  /**
   * 10. Shelter Invitations - Revoke Invitation
   * POST /api/v1/shelters/invitations/revoke/
   */
  revokeShelterInvitation: (payload) => {
    const data =
      typeof payload === 'string' ? { invitation_id: payload } : payload;
    return apiClient.post('/api/v1/shelters/invitations/revoke/', data);
  },

  /**
   * 11. Shelter Ownership Transfer
   * POST /api/v1/shelters/{id}/transfer-ownership/
   */
  transferShelterOwnership: (shelterId, payload) => {
    const data =
      typeof payload === 'string'
        ? { new_owner_user_id: payload }
        : payload;
    return apiClient.post(`/api/v1/shelters/${shelterId}/transfer-ownership/`, data);
  },

  /**
   * Admin Verification Queue - List Pending Verifications
   * GET /api/v1/shelters/admin/verifications/pending/
   */
  getPendingVerifications: () => {
    return apiClient.get('/api/v1/shelters/admin/verifications/pending/');
  },

  /**
   * Admin Verification Queue - Get Verification Detail
   * GET /api/v1/shelters/admin/verifications/{id}/
   */
  getVerificationDetail: (verificationId) => {
    return apiClient.get(`/api/v1/shelters/admin/verifications/${verificationId}/`);
  },

  /**
   * Admin Verification Queue - Approve
   * POST /api/v1/shelters/admin/verifications/{id}/approve/
   */
  adminApproveVerification: (verificationId, payload = {}) => {
    const data = typeof payload === 'string' ? { notes: payload } : payload;
    return apiClient.post(`/api/v1/shelters/admin/verifications/${verificationId}/approve/`, data);
  },

  /**
   * Admin Verification Queue - Reject
   * POST /api/v1/shelters/admin/verifications/{id}/reject/
   */
  adminRejectVerification: (verificationId, payload) => {
    const data = typeof payload === 'string' ? { reason: payload } : payload;
    return apiClient.post(`/api/v1/shelters/admin/verifications/${verificationId}/reject/`, data);
  },

  /**
   * Admin Verification Queue - Request Info
   * POST /api/v1/shelters/admin/verifications/{id}/request-information/
   */
  adminRequestVerificationInfo: (verificationId, payload) => {
    const data = typeof payload === 'string' ? { notes: payload } : payload;
    return apiClient.post(
      `/api/v1/shelters/admin/verifications/${verificationId}/request-information/`,
      data
    );
  },
};

export default shelterApi;
