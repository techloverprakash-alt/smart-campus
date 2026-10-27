/**
 * Reports API
 */
import { api } from './client';

/**
 * Get institutional department KPI summary (total students, staff, attendance %, weekly trend).
 */
export const getDepartmentSummary = () => api.get('/reports/department/summary');

/**
 * Get attendance defaulters list (< threshold %).
 * @param {object} params - { threshold, section_id }
 */
export const getAttendanceDefaulters = (params = {}) => {
  const query = {};
  if (params.threshold !== undefined) query.threshold = params.threshold;
  if (params.section_id) query.section_id = params.section_id;
  return api.get('/reports/attendance/defaulters', query);
};

/**
 * Get faculty teaching workload and lecture hours report.
 */
export const getFacultyWorkload = () => api.get('/reports/faculty/workload');
