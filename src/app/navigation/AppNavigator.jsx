import React from 'react';
import { Routes, RouterProvider } from '../../router';
import { Shell } from '../shell/Shell';

import { LoginPage, StudentLogin, StaffLogin, AdminLogin, ServicesLogin, CommonPortal } from '../../modules/auth';
import {
  StudentDashboard, AttendanceHistory, StudentAttendanceDetail,
  StudentTimetable, StudyMaterials, StudentProfile, StudentEditProfile,
  StudentLostFound,
} from '../../modules/student';
import {
  StaffDashboard, MarkAttendance, AttendanceReview, StaffAttendanceHistory, StaffTimetable,
  StaffNotes, StaffProfile, StaffEditProfile,
  StaffLostFound,
} from '../../modules/staff';
import {
  AdminDashboard, CampusAdminControlCenter, ReportManagement, AdminTimetable, AdminStaffOnboardingScreen,
  MentorProctorAllocationScreen, EnrollStudent, EnrollmentSuccess, AdminProfile, AdminEditProfile,
  AdminLostFoundManagement, AdminAttendanceReview,
} from '../../modules/admin';
import { StudentFacultyDashboard, CampusServiceDashboard } from '../../modules/services';

/**
 * One entry per screen. `role` drives the access guard + sidebar in <Shell>;
 * routes without a role are public.
 */
export const ROUTES = [
  // Public / auth
  { name: 'CommonPortal', path: '/', component: CommonPortal },
  { name: 'CommonPortalAlias', path: '/portal', component: CommonPortal },
  { name: 'Login', path: '/login', component: LoginPage },
  { name: 'StudentLogin', path: '/login/student', component: StudentLogin },
  { name: 'StaffLogin', path: '/login/staff', component: StaffLogin },
  { name: 'AdminLogin', path: '/login/admin', component: AdminLogin },
  { name: 'ServicesLogin', path: '/login/services', component: ServicesLogin },
  { name: 'CampusServiceDashboard', path: '/services/dashboard', component: CampusServiceDashboard },
  { name: 'StudentFacultyPortal', path: '/services', component: StudentFacultyDashboard },
  {
    name: 'LostAndFound',
    path: '/lost-found',
    component: (props) => <StudentFacultyDashboard {...props} initialTab="Lost & Found Claims" />,
  },

  // Student
  { name: 'StudentDashboard', path: '/student', component: StudentDashboard, role: 'STUDENT' },
  { name: 'StudentLostFound', path: '/student/lost-found', component: StudentLostFound, role: 'STUDENT' },
  { name: 'StudentAttendanceDetail', path: '/student/attendance', component: StudentAttendanceDetail, role: 'STUDENT' },
  { name: 'AttendanceHistory', path: '/student/attendance/history', component: AttendanceHistory, role: 'STUDENT' },
  { name: 'StudentTimetable', path: '/student/timetable', component: StudentTimetable, role: 'STUDENT' },
  { name: 'StudyMaterials', path: '/student/materials', component: StudyMaterials, role: 'STUDENT' },
  { name: 'StudentProfile', path: '/student/profile', component: StudentProfile, role: 'STUDENT' },
  { name: 'StudentEditProfile', path: '/student/profile/edit', component: StudentEditProfile, role: 'STUDENT' },

  // Staff
  { name: 'StaffDashboard', path: '/staff', component: StaffDashboard, role: 'STAFF' },
  { name: 'StaffLostFound', path: '/staff/lost-found', component: StaffLostFound, role: 'STAFF' },
  { name: 'MarkAttendance', path: '/staff/attendance', component: MarkAttendance, role: 'STAFF' },
  { name: 'StaffAttendanceHistory', path: '/staff/attendance/history', component: StaffAttendanceHistory, role: 'STAFF' },
  { name: 'AttendanceReview', path: '/staff/attendance/review', component: StaffAttendanceHistory, role: 'STAFF' },
  { name: 'StaffTimetable', path: '/staff/timetable', component: StaffTimetable, role: 'STAFF' },
  { name: 'StaffNotes', path: '/staff/notes', component: StaffNotes, role: 'STAFF' },
  { name: 'StaffProfile', path: '/staff/profile', component: StaffProfile, role: 'STAFF' },
  { name: 'StaffEditProfile', path: '/staff/profile/edit', component: StaffEditProfile, role: 'STAFF' },

  // Admin
  { name: 'AdminDashboard', path: '/admin', component: AdminDashboard, role: 'ADMIN' },
  { name: 'AdminAttendanceReview', path: '/admin/attendance/review', component: AdminAttendanceReview, role: 'ADMIN' },
  { name: 'AttendanceReviewAdmin', path: '/admin/attendance', component: AdminAttendanceReview, role: 'ADMIN' },
  { name: 'AdminLostFoundManagement', path: '/admin/lost-found', component: AdminLostFoundManagement, role: 'ADMIN' },
  { name: 'CampusAdminControlCenter', path: '/admin/control-center', component: CampusAdminControlCenter, role: 'ADMIN' },
  { name: 'ReportManagement', path: '/admin/reports', component: ReportManagement, role: 'ADMIN' },
  { name: 'AdminTimetable', path: '/admin/timetable', component: AdminTimetable, role: 'ADMIN' },
  { name: 'EnrollStudent', path: '/admin/students/enroll', component: EnrollStudent, role: 'ADMIN' },
  { name: 'EnrollmentSuccess', path: '/admin/students/enrolled', component: EnrollmentSuccess, role: 'ADMIN' },
  { name: 'AdminStaffOnboarding', path: '/admin/faculty/onboarding', component: AdminStaffOnboardingScreen, role: 'ADMIN' },
  { name: 'AddStaff', path: '/admin/faculty/add', component: AdminStaffOnboardingScreen, role: 'ADMIN' },
  { name: 'MentorProctorAllocation', path: '/admin/faculty/mentor-proctor', component: MentorProctorAllocationScreen, role: 'ADMIN' },
  { name: 'AssignStudent', path: '/admin/faculty/assign', component: MentorProctorAllocationScreen, role: 'ADMIN' },
  { name: 'AdminProfile', path: '/admin/profile', component: AdminProfile, role: 'ADMIN' },
  { name: 'AdminEditProfile', path: '/admin/profile/edit', component: AdminEditProfile, role: 'ADMIN' },
];

export function AppNavigator() {
  return (
    <RouterProvider routes={ROUTES}>
      <Shell>
        <Routes fallback={NotFound} />
      </Shell>
    </RouterProvider>
  );
}

function NotFound({ navigation }) {
  return (
    <div className="notfound">
      <h1>Page not found</h1>
      <button onClick={() => navigation.replace('CommonPortal')}>Back to home</button>
    </div>
  );
}

export default AppNavigator;
