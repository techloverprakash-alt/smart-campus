/**
 * NEXUS Campus Lost & Found System API Client
 * Connects directly to FastAPI backend /api/v1/lost-found
 * Supports Tables 34-41 (Categories, Lost, Found, Media, Matches, Verifications, Claims, Handovers)
 */
import { api } from './client';

// ── Categories & Campus Locations ──────────────────────────────────────────
export const getCategories = () => api.get('/lost-found/categories');
export const createCategory = (data) => api.post('/lost-found/categories', data);
export const getLocations = () => api.get('/lost-found/locations');

// ── Lost Reports (Table 35) ────────────────────────────────────────────────
export const getLostReports = (params = {}) => api.get('/lost-found/lost', params);
export const getLostReport = (id) => api.get(`/lost-found/lost/${id}`);
export const createLostReport = (data) => api.post('/lost-found/lost', data);
export const updateLostReport = (id, data) => api.patch(`/lost-found/lost/${id}`, data);
export const deleteLostReport = (id) => api.delete(`/lost-found/lost/${id}`);
export const sendFoundRequest = (lostReportId, data) =>
  api.post(`/lost-found/lost/${lostReportId}/found-request`, data);

// ── Found Reports (Table 36) ───────────────────────────────────────────────
export const getFoundReports = (params = {}) => api.get('/lost-found/found', params);
export const getFoundReport = (id) => api.get(`/lost-found/found/${id}`);
export const createFoundReport = (data) => api.post('/lost-found/found', data);
export const updateFoundCustody = (id, data) => api.patch(`/lost-found/found/${id}/custody`, data);

// ── AI Similarity Candidate Matches (Table 38) ─────────────────────────────
export const getMatches = (params = {}) => api.get('/lost-found/matches', params);
export const triggerMatching = (data) => api.post('/lost-found/matches/trigger', data);
export const dismissMatch = (id) => api.post(`/lost-found/matches/${id}/dismiss`);
export const requestHumanVerification = (matchId, data = {}) =>
  api.post(`/lost-found/matches/${matchId}/request-human-verification`, data);
export const searchSimilarFoundItems = (params = {}) =>
  api.get('/lost-found/similarity-search', params);

// ── Double-Blind Match Verification (Table 39) ─────────────────────────────
export const verifyMatchChallenge = (matchId, data) =>
  api.post(`/lost-found/matches/${matchId}/verify`, data);

// ── Ownership Claims (Table 40) ────────────────────────────────────────────
export const submitClaim = (data) => api.post('/lost-found/claims', data);
export const getClaims = (params = {}) => api.get('/lost-found/claims', params);
export const reviewClaim = (claimId, data) =>
  api.patch(`/lost-found/claims/${claimId}/review`, data);

// ── Physical Handover Receipts (Table 41) ──────────────────────────────────
export const createHandover = (data) => api.post('/lost-found/handovers', data);

// ── Media Upload (Table 37) ────────────────────────────────────────────────
export const uploadMediaAsset = (file, uploadedBy = 'default_user') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('uploaded_by', uploadedBy);
  return api.upload('/lost-found/upload', formData);
};
