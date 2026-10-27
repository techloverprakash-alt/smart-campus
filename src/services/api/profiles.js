/**
 * Profile API
 */
import { api, BASE_URL } from './client';

/**
 * Get the logged-in user's own profile.
 */
export const getMyProfile = () => api.get('/profiles/me');

/**
 * Update the logged-in user's profile.
 */
export const updateMyProfile = (body) => api.patch('/profiles/me', body);

/**
 * Admin: get any user's profile by ID.
 */
export const getUserProfile = (userId) => api.get(`/profiles/${userId}`);

/**
 * Admin: get cohort options (departments, batches, sections, mentors).
 */
export const getCohortOptions = () => api.get('/profiles/cohort-options');

/**
 * Admin: enroll a single student with predefined credentials.
 */
export const enrollStudent = (body) => api.post('/profiles/students', body);

/**
 * Admin: bulk enroll students with predefined credentials.
 */
export const bulkEnrollStudents = (body) => api.post('/profiles/students/bulk', body);

/**
 * Admin: get template download URL for student bulk enrollment.
 */
export const getStudentTemplateUrl = () => {
  return `${BASE_URL}/profiles/students/template`;
};

/**
 * Admin: parse uploaded Excel (.xlsx, .xls) or CSV student roster.
 */
export const parseStudentFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.upload('/profiles/students/parse-file', formData);
};

/**
 * Admin: direct upload Excel/CSV roster and bulk enroll students.
 */
export const uploadStudentRosterFile = (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  if (options.departmentCode) formData.append('default_department_code', options.departmentCode);
  if (options.batchName) formData.append('default_batch_name', options.batchName);
  if (options.sectionName) formData.append('default_section_name', options.sectionName);
  if (options.conflictStrategy) formData.append('conflict_strategy', options.conflictStrategy);
  return api.upload('/profiles/students/upload', formData);
};

// ─────────────────────────────────────────────────────────────
// Staff Onboarding API
// ─────────────────────────────────────────────────────────────
/**
 * Admin: enroll a single staff member with predefined/custom credentials.
 */
export const enrollStaff = (body) => api.post('/profiles/staff', body);

/**
 * Admin: bulk enroll staff members.
 */
export const bulkEnrollStaff = (body) => api.post('/profiles/staff/bulk', body);

/**
 * Admin: get staff template download URL.
 */
export const getStaffTemplateUrl = () => {
  return `${BASE_URL}/profiles/staff/template`;
};

/**
 * Admin: upload Excel/CSV roster and bulk enroll faculty.
 */
export const uploadStaffRosterFile = (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  if (options.departmentCode) formData.append('default_department_code', options.departmentCode);
  if (options.conflictStrategy) formData.append('conflict_strategy', options.conflictStrategy);
  return api.upload('/profiles/staff/upload', formData);
};

/**
 * Admin: get all staff members.
 */
export const getAllStaff = () => api.get('/profiles/staff');

// ─────────────────────────────────────────────────────────────
// Mentor & Proctor Allocation API
// ─────────────────────────────────────────────────────────────
/**
 * Admin: get active faculty mentors with their assigned student counts and capacity.
 */
export const getFacultyMentors = () => api.get('/profiles/staff/mentors');

/**
 * Admin: get students for mentor allocation with filters.
 */
export const getStudentAllocation = (params = {}) => {
  const query = new URLSearchParams();
  if (params.department) query.append('department', params.department);
  if (params.batch) query.append('batch', params.batch);
  if (params.section) query.append('section', params.section);
  if (params.status) query.append('status', params.status);
  if (params.search) query.append('search', params.search);
  const qStr = query.toString();
  return api.get(`/profiles/students/allocation${qStr ? `?${qStr}` : ''}`);
};

/**
 * Admin: assign selected students to target faculty mentor.
 */
export const assignStudentMentor = (body) => api.patch('/profiles/students/assign-mentor', body);

/**
 * Admin: remove mentor assignment from selected students.
 */
export const unassignStudentMentor = (body) => api.patch('/profiles/students/unassign-mentor', body);

/**
 * Admin: auto distribute unassigned students across faculty mentors.
 */
export const autoDistributeStudentMentors = (body) => api.post('/profiles/students/auto-distribute-mentors', body);



