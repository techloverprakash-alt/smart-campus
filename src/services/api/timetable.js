/**
 * Timetable API
 */
import { api } from './client';

/**
 * Get today's schedule for the logged-in user (student or staff).
 * The backend returns slots with live status (DONE / NOW / UPCOMING / BREAK).
 */
export const getTodaySchedule = () => api.get('/timetable/today');

/**
 * Get the full weekly timetable for the logged-in user.
 */
export const getWeeklyTimetable = () => api.get('/timetable/weekly');

/**
 * Admin: get the department timetable grid.
 * @param {object} params - { department_id, semester_id, section_id }
 */
export const getDepartmentTimetable = (params) =>
  api.get('/timetable/department', params);

/**
 * Admin: create a timetable entry.
 */
export const createTimetableEntry = (body) => api.post('/timetable/entry', body);

/**
 * Admin: delete a timetable entry.
 */
export const deleteTimetableEntry = (entryId) =>
  api.delete(`/timetable/entry/${entryId}`);
