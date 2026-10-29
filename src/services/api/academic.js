/**
 * Academic & Course Offering API Client
 */
import { api } from './client';

/**
 * Get all subjects in the academic catalog, optionally filtered by department.
 */
export const getSubjects = (departmentId) => {
  const query = departmentId ? `?department_id=${departmentId}` : '';
  return api.get(`/academic/subjects${query}`);
};

/**
 * Admin: Create a new subject in the catalog.
 */
export const createSubject = (payload) => {
  return api.post('/academic/subjects', payload);
};

/**
 * Admin: Delete a subject by ID.
 */
export const deleteSubject = (subjectId) => {
  return api.delete(`/academic/subjects/${subjectId}`);
};

/**
 * Get all course offerings (allocated subjects) with enrolled student counts.
 */
export const getCourseOfferings = (params = {}) => {
  const query = new URLSearchParams();
  if (params.department_id) query.append('department_id', params.department_id);
  if (params.section_id) query.append('section_id', params.section_id);
  if (params.staff_id) query.append('staff_id', params.staff_id);
  const qStr = query.toString();
  return api.get(`/academic/offerings${qStr ? `?${qStr}` : ''}`);
};

/**
 * Admin: Assign a subject to a faculty member for a section.
 */
export const createCourseOffering = (payload) => {
  return api.post('/academic/offerings', payload);
};

/**
 * Admin: Unassign / remove a course offering allocation.
 */
export const deleteCourseOffering = (offeringId) => {
  return api.delete(`/academic/offerings/${offeringId}`);
};

/**
 * Get authoritative faculty workload with real assigned subjects and enrolled student counts.
 */
export const getStaffWorkload = () => {
  return api.get('/academic/staff-workload');
};

/**
 * Get dropdown options: departments, sections (with enrolled counts), staff, subjects.
 */
export const getAcademicMetadata = () => {
  return api.get('/academic/metadata');
};

