import React from 'react';
import { useRouter } from '../../router';
import { useAuth } from '../../modules/auth/context/AuthContext';
import { MaterialIcons } from '@/ui';

const NAV = {
  STUDENT: [
    { label: 'Home', icon: 'grid-view', screen: 'StudentDashboard' },
    { label: 'Attendance', icon: 'how-to-reg', screen: 'StudentAttendanceDetail', also: ['AttendanceHistory'] },
    { label: 'Timetable', icon: 'schedule', screen: 'StudentTimetable' },
    { label: 'Materials', icon: 'menu-book', screen: 'StudyMaterials' },
    { label: 'Profile', icon: 'person', screen: 'StudentProfile', also: ['StudentEditProfile'] },
  ],
  STAFF: [
    { label: 'Home', icon: 'dashboard', screen: 'StaffDashboard' },
    { label: 'Mark attendance', icon: 'how-to-reg', screen: 'MarkAttendance' },
    { label: 'Attendance review', icon: 'fact-check', screen: 'AttendanceReview' },
    { label: 'Timetable', icon: 'push-pin', screen: 'StaffTimetable' },
    { label: 'Notes & QP', icon: 'menu-book', screen: 'StaffNotes' },
    { label: 'Profile', icon: 'person', screen: 'StaffProfile', also: ['StaffEditProfile'] },
  ],
  ADMIN: [
    { label: 'Dashboard', icon: 'dashboard', screen: 'AdminDashboard' },
    { label: 'Reports', icon: 'assessment', screen: 'ReportManagement' },
    { label: 'Timetable', icon: 'schedule', screen: 'AdminTimetable' },
    { label: 'Enroll student', icon: 'person-add', screen: 'EnrollStudent', also: ['EnrollmentSuccess'] },
    { label: 'Staff onboarding', icon: 'badge', screen: 'AdminStaffOnboarding', also: ['AddStaff'] },
    { label: 'Mentor / Proctor', icon: 'supervisor-account', screen: 'MentorProctorAllocation', also: ['AssignStudent'] },
    { label: 'Profile', icon: 'person', screen: 'AdminProfile', also: ['AdminEditProfile'] },
  ],
};
const ROLE_LABEL = { STUDENT: 'Student portal', STAFF: 'Faculty portal', ADMIN: 'Admin console' };

export function Sidebar({ role, active }) {
  const { navigation } = useRouter();
  const { user, profile, signOut } = useAuth();
  const name = profile?.name || profile?.full_name || user?.name || user?.username || ROLE_LABEL[role];

  const logout = async () => {
    try {
      await signOut?.();
    } finally {
      navigation.replace('Login');
    }
  };

  return (
    <aside className="sidebar" aria-label="Main navigation">
      <div className="sidebar-brand">
        <span className="sidebar-logo">NEXUS</span>
        <span className="sidebar-badge">Info IT</span>
      </div>
      <div className="sidebar-role">{ROLE_LABEL[role]}</div>

      <nav className="sidebar-nav">
        {NAV[role].map((item) => {
          const isActive = active === item.screen || item.also?.includes(active);
          return (
            <button
              key={item.screen}
              className={`sidebar-link${isActive ? ' active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => navigation.navigate(item.screen)}
            >
              <MaterialIcons name={item.icon} size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
        <button className="sidebar-link" onClick={() => navigation.navigate('CommonPortal')}>
          <MaterialIcons name="public" size={20} />
          <span>Campus hub</span>
        </button>
      </nav>

      <div className="sidebar-foot">
        <div className="sidebar-user" title={name}>
          <MaterialIcons name="account-circle" size={28} />
          <span>{name}</span>
        </div>
        <button className="sidebar-link" onClick={logout}>
          <MaterialIcons name="logout" size={20} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
