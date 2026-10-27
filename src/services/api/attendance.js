/**
 * Attendance API
 */
import { api } from './client';

/**
 * Get student attendance summary (overall % + per-subject breakdown).
 * Caller: Student (own summary) or Staff/Admin (pass student_id).
 * @param {string|null} studentId - optional, for staff/admin viewing a specific student
 */
export const getStudentAttendanceSummary = (studentId = null) =>
  api.get('/attendance/student/summary', studentId ? { student_id: studentId } : {});

/**
 * Get the student roster for a timetable session (for attendance marking).
 * @param {string} timetableEntryId
 * @param {string|null} date - 'YYYY-MM-DD', defaults to today
 */
export const getSessionRoster = (timetableEntryId, date = null) =>
  api.get('/attendance/session/students', {
    timetable_entry_id: timetableEntryId,
    ...(date ? { date } : {}),
  });

/**
 * Submit attendance for a session.
 * @param {object} body - { timetable_entry_id, marking_date, records: [{student_id, status}] }
 */
export const submitAttendance = (body) => api.post('/attendance/submit', body);

/**
 * Admin: get attendance history log.
 * @param {object} params - { date, limit }
 */
export const getAttendanceHistory = (params = {}) =>
  api.get('/attendance/history', params);
