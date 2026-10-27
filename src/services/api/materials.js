/**
 * Study Materials API
 */
import { api } from './client';

/**
 * Get study materials list (filtered by subject/section).
 * @param {object} params - { subject_id, section_id, type, page, limit }
 */
export const getMaterials = (params = {}) => api.get('/materials', params);

/**
 * Get a single material by ID.
 */
export const getMaterialById = (id) => api.get(`/materials/${id}`);

/**
 * Staff: upload study material metadata (file upload handled separately).
 */
export const uploadMaterial = (body) => api.post('/materials', body);

/**
 * Staff/Admin: update material metadata.
 */
export const updateMaterial = (id, body) => api.patch(`/materials/${id}`, body);

/**
 * Staff/Admin: delete a material.
 */
export const deleteMaterial = (id) => api.delete(`/materials/${id}`);
