/**
 * Announcements / Circulars API
 */
import { api } from './client';

/**
 * Get paginated announcements list.
 * @param {object} params - { page, limit, category, is_pinned }
 */
export const getAnnouncements = (params = {}) =>
  api.get('/announcements', params);

/**
 * Get a single announcement by ID.
 */
export const getAnnouncementById = (id) => api.get(`/announcements/${id}`);

/**
 * Admin: create a new announcement.
 */
export const createAnnouncement = (body) => api.post('/announcements', body);

/**
 * Admin: update an announcement.
 */
export const updateAnnouncement = (id, body) =>
  api.patch(`/announcements/${id}`, body);

/**
 * Admin: delete an announcement.
 */
export const deleteAnnouncement = (id) => api.delete(`/announcements/${id}`);

/**
 * Public: get announcements without auth (for Campus Hub).
 */
export const getPublicAnnouncements = (params = {}) =>
  api.get('/public/announcements', params);
