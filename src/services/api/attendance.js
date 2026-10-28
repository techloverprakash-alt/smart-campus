/**
 * Attendance API Service
 * Endpoints for student attendance summary, timetable periods, marking, and history.
 */

import { api } from './client';

/**
 * Get cumulative student attendance summary.
 * @param {number} [studentId] - Optional student ID (for staff/admin viewing a student)
 */
export const getStudentAttendanceSummary = (studentId) =>
  api.get('/attendance/student/summary', studentId ? { student_id: studentId } : {});

/**
 * Staff: get roster for marking attendance in a session period.
 * @param {number} timetableEntryId
 * @param {string} [date] - YYYY-MM-DD
 */
export const getSessionRoster = (timetableEntryId, date) =>
  api.get('/attendance/session/students', {
    ...(timetableEntryId ? { timetable_entry_id: timetableEntryId } : {}),
    ...(date ? { date } : {}),
  });

/**
 * Submit attendance for a session.
 * @param {object} body - { timetable_entry_id, marking_date, records: [{student_id, status}] }
 */
export const submitAttendance = (body) => api.post('/attendance/submit', body);

/**
 * Admin / Staff: get attendance history log.
 * @param {object} params - { date, limit }
 */
export const getAttendanceHistory = (params = {}) =>
  api.get('/attendance/history', params);

/**
 * Review (approve / reject) an attendance session.
 * @param {number} sessionId
 * @param {string} action - 'approved' | 'rejected' | 'pending'
 */
export const reviewAttendanceSession = (sessionId, action = 'approved') =>
  api.post(`/attendance/session/${sessionId}/review?action=${action}`);
