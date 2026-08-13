import shelterApi from '../api/shelter.api';

export const shelterService = {
  /**
   * Register a new shelter organization
   */
  registerShelter: async (payload) => {
    return shelterApi.registerShelter(payload);
  },

  /**
   * Fetch current authenticated user's shelter organization profile
   */
  getMyShelter: async () => {
    return shelterApi.getMyShelter();
  },

  /**
   * Update current authenticated user's shelter organization profile
   */
  updateMyShelter: async (payload) => {
    return shelterApi.updateMyShelter(payload);
  },

  /**
   * Upload a verification document to current user's shelter
   */
  uploadShelterDocument: async (fileOrPayload, documentType) => {
    return shelterApi.uploadShelterDocument(fileOrPayload, documentType);
  },

  /**
   * List uploaded verification documents for current user's shelter
   */
  getShelterDocuments: async () => {
    return shelterApi.getShelterDocuments();
  },

  /**
   * Delete an unapproved verification document by ID
   */
  deleteShelterDocument: async (documentId) => {
    return shelterApi.deleteShelterDocument(documentId);
  },

  /**
   * Retrieve shelter dashboard overview metrics for current shelter
   */
  getShelterDashboard: async () => {
    return shelterApi.getShelterDashboard();
  },

  /**
   * List shelters with optional filtering & pagination
   */
  getShelters: async (params = {}) => {
    return shelterApi.getShelters(params);
  },

  /**
   * Get single shelter profile by UUID
   */
  getShelterById: async (shelterId) => {
    return shelterApi.getShelterById(shelterId);
  },

  /**
   * Onboard/Create a shelter via standard catalog viewset endpoint
   */
  createShelter: async (payload) => {
    return shelterApi.createShelter(payload);
  },

  /**
   * Update shelter profile details by UUID
   */
  updateShelter: async (shelterId, payload) => {
    return shelterApi.updateShelter(shelterId, payload);
  },

  /**
   * Submit active shelter verification workflow for review
   */
  submitShelterVerification: async (shelterId) => {
    return shelterApi.submitShelterVerification(shelterId);
  },

  /**
   * Start review process on a submitted shelter verification
   */
  startVerificationReview: async (shelterId) => {
    return shelterApi.startVerificationReview(shelterId);
  },

  /**
   * Request additional information or documents for shelter verification
   */
  requestVerificationInfo: async (shelterId, payload) => {
    return shelterApi.requestVerificationInfo(shelterId, payload);
  },

  /**
   * Approve shelter verification and mark shelter status VERIFIED
   */
  approveShelterVerification: async (shelterId, payload) => {
    return shelterApi.approveShelterVerification(shelterId, payload);
  },

  /**
   * Reject shelter verification workflow with reason
   */
  rejectShelterVerification: async (shelterId, payload) => {
    return shelterApi.rejectShelterVerification(shelterId, payload);
  },

  /**
   * List uploaded verification documents for a specific shelter ID
   */
  getShelterDocumentsByShelterId: async (shelterId) => {
    return shelterApi.getShelterDocumentsByShelterId(shelterId);
  },

  /**
   * Upload and attach document to a specific shelter ID
   */
  uploadShelterDocumentByShelterId: async (shelterId, fileOrPayload, documentType) => {
    return shelterApi.uploadShelterDocumentByShelterId(shelterId, fileOrPayload, documentType);
  },

  /**
   * List member associations for a shelter ID
   */
  getShelterMembers: async (shelterId, params = {}) => {
    return shelterApi.getShelterMembers(shelterId, params);
  },

  /**
   * Add a user as a member of a shelter
   */
  addShelterMember: async (shelterId, payload) => {
    return shelterApi.addShelterMember(shelterId, payload);
  },

  /**
   * Update membership role of a shelter staff member
   */
  updateShelterMember: async (memberId, payload) => {
    return shelterApi.updateShelterMember(memberId, payload);
  },

  /**
   * Remove a member from a shelter
   */
  removeShelterMember: async (memberId) => {
    return shelterApi.removeShelterMember(memberId);
  },

  /**
   * List staff/volunteer invitations for a shelter
   */
  getShelterInvitations: async (shelterId, params = {}) => {
    return shelterApi.getShelterInvitations(shelterId, params);
  },

  /**
   * Dispatch a tokenized staff or volunteer invitation
   */
  createShelterInvitation: async (shelterId, payload) => {
    return shelterApi.createShelterInvitation(shelterId, payload);
  },

  /**
   * Accept shelter member invitation using token
   */
  acceptShelterInvitation: async (payload) => {
    return shelterApi.acceptShelterInvitation(payload);
  },

  /**
   * Revoke active shelter member invitation
   */
  revokeShelterInvitation: async (payload) => {
    return shelterApi.revokeShelterInvitation(payload);
  },

  /**
   * Transfer primary shelter ownership to another target user
   */
  transferShelterOwnership: async (shelterId, payload) => {
    return shelterApi.transferShelterOwnership(shelterId, payload);
  },

  /**
   * Admin Verification Queue: List pending verifications
   */
  getPendingVerifications: async () => {
    return shelterApi.getPendingVerifications();
  },

  /**
   * Admin Verification Queue: Get detailed verification record
   */
  getVerificationDetail: async (verificationId) => {
    return shelterApi.getVerificationDetail(verificationId);
  },

  /**
   * Admin Verification Queue: Approve verification
   */
  adminApproveVerification: async (verificationId, payload) => {
    return shelterApi.adminApproveVerification(verificationId, payload);
  },

  /**
   * Admin Verification Queue: Reject verification
   */
  adminRejectVerification: async (verificationId, payload) => {
    return shelterApi.adminRejectVerification(verificationId, payload);
  },

  /**
   * Admin Verification Queue: Request additional information
   */
  adminRequestVerificationInfo: async (verificationId, payload) => {
    return shelterApi.adminRequestVerificationInfo(verificationId, payload);
  },
};

export default shelterService;
