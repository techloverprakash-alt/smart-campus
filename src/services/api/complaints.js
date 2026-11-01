import { api } from './client';

/**
 * Fetch all available complaint/issue categories.
 */
export async function getComplaintCategories() {
  const res = await api.get('/complaints/categories');
  return res?.data || res || [];
}

/**
 * Fetch complaints list.
 * For students & staff: returns their personal complaints.
 * For admins: returns campus-wide complaints with reporter profiles.
 *
 * @param {Object} [params]
 * @param {string} [params.role] - 'STUDENT' | 'STAFF' | 'ALL'
 * @param {string} [params.status] - 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED' | 'ALL'
 * @param {number} [params.category_id]
 * @param {string} [params.search]
 */
export async function getComplaints(params = {}) {
  const res = await api.get('/complaints', params);
  return res?.data || res || [];
}

/**
 * Submit a new complaint or grievance.
 *
 * @param {Object} data
 * @param {string} data.title
 * @param {string} data.description
 * @param {string} [data.priority] - 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
 * @param {number} [data.category_id]
 * @param {string} [data.category_name]
 * @param {string} [data.room_identifier]
 * @param {number} [data.location_id]
 */
export async function createComplaint(data) {
  const res = await api.post('/complaints', data);
  return res?.data || res;
}

/**
 * Fetch details of a single complaint.
 * @param {number|string} id
 */
export async function getComplaintDetail(id) {
  const res = await api.get(`/complaints/${id}`);
  return res?.data || res;
}

/**
 * Update complaint status & admin resolution remarks (Admin only).
 *
 * @param {number|string} id
 * @param {Object} payload
 * @param {string} payload.status - 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED'
 * @param {string} [payload.admin_remarks]
 */
export async function updateComplaintStatus(id, payload) {
  const res = await api.patch(`/complaints/${id}`, payload);
  return res?.data || res;
}
