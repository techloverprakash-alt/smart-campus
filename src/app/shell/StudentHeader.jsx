import React, { useState } from 'react';
import { useRouter } from '../../router';
import { useAuth } from '../../modules/auth/context/AuthContext';
import { MaterialIcons } from '@/ui';

const STUDENT_NAV_ITEMS = [
  { label: 'Home', icon: 'grid-view', screen: 'StudentDashboard' },
  { label: 'Attendance', icon: 'how-to-reg', screen: 'StudentAttendanceDetail', also: ['AttendanceHistory'] },
  { label: 'Timetable', icon: 'schedule', screen: 'StudentTimetable' },
  { label: 'Materials', icon: 'menu-book', screen: 'StudyMaterials' },
  { label: 'Campus Services', icon: 'support-agent', screen: 'StudentFacultyPortal' },
  { label: 'Campus hub', icon: 'public', screen: 'CommonPortal' },
];

export function StudentHeader({ active }) {
  const { navigation } = useRouter();
  const { user, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayName = profile?.full_name || profile?.name || user?.name || user?.username || 'Student';
  const avatarUri = profile?.avatar_url || profile?.avatar || user?.profile?.avatar_url || user?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVXP3laCjvBlZEVugtzpX20kCifG87-9yGGVWnUCmaIhNtCcDdG9HmCKcyaSa4oTc-QPnHNb5RR_pO0Xd8oVLNtxyVdxbttBW5KjbrzMiMJD0HcqApHxFuVbC5_KEUHnW0qOr98kurfIJ2NAVvw464MLzvDAN8LdJTSZXSqkbDkysN8V9Lzled9wZvQVwVorYcKfLMT1do8whwEUyopOcVpVMNt3wTCpl8mQ00dAziqalPOmZQTqcZ';
  const isProfileActive = active === 'StudentProfile' || active === 'StudentEditProfile';

  const logout = async () => {
    try {
      await signOut?.();
    } finally {
      navigation.replace('Login');
    }
  };

  const handleNav = (screen) => {
    setMobileMenuOpen(false);
    if (screen === 'StudentFacultyPortal') {
      navigation.navigate(screen, { role: 'STUDENT', from: 'student' });
    } else {
      navigation.navigate(screen);
    }
  };

  return (
    <header className="student-header" aria-label="Student portal header navigation">
      <div className="student-header-inner">
        {/* Left: Brand */}
        <div
          className="student-header-brand"
          onClick={() => handleNav('StudentDashboard')}
          title="Go to Student Dashboard"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleNav('StudentDashboard');
            }
          }}
        >
          <img src="/info_logo.png" alt="NEXUS" style={{ width: 26, height: 26, objectFit: 'contain', flexShrink: 0 }} />
          <span className="student-header-logo">NEXUS</span>
          <span className="student-header-badge">Info IT</span>
          <span className="student-header-role">STUDENT PORTAL</span>
        </div>

        {/* Center: Navigation Links */}
        <nav className="student-header-nav" aria-label="Student primary navigation">
          {STUDENT_NAV_ITEMS.map((item) => {
            const isActive = active === item.screen || item.also?.includes(active);
            return (
              <button
                key={item.screen}
                type="button"
                className={`student-nav-btn${isActive ? ' active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => handleNav(item.screen)}
              >
                <MaterialIcons name={item.icon} size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: User Profile & Logout */}
        <div className="student-header-right">
          <button
            type="button"
            className={`student-header-user-btn${isProfileActive ? ' active' : ''}`}
            onClick={() => handleNav('StudentProfile')}
            aria-current={isProfileActive ? 'page' : undefined}
            title={`Logged in as ${displayName} • View Profile`}
          >
            {avatarUri ? (
              <img src={avatarUri} alt="" className="student-header-avatar" />
            ) : (
              <MaterialIcons name="account-circle" size={28} color="#003fb1" />
            )}
            <div className="student-header-user-text">
              <span className="student-header-user-name">{displayName}</span>
              <span className="student-header-user-role">Student</span>
            </div>
          </button>

          <button
            type="button"
            className="student-header-logout-btn"
            onClick={logout}
            title="Sign out of student portal"
          >
            <MaterialIcons name="logout" size={18} />
            <span className="student-logout-text">Sign out</span>
          </button>

          {/* Mobile hamburger toggle */}
          <button
            type="button"
            className="student-mobile-menu-toggle"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            <MaterialIcons name={mobileMenuOpen ? 'close' : 'menu'} size={24} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="student-mobile-nav-dropdown">
          {STUDENT_NAV_ITEMS.map((item) => {
            const isActive = active === item.screen || item.also?.includes(active);
            return (
              <button
                key={item.screen}
                type="button"
                className={`student-mobile-nav-item${isActive ? ' active' : ''}`}
                onClick={() => handleNav(item.screen)}
              >
                <MaterialIcons name={item.icon} size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="student-mobile-nav-divider" />
          <button
            type="button"
            className="student-mobile-nav-item student-mobile-logout"
            onClick={logout}
          >
            <MaterialIcons name="logout" size={20} />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </header>
  );
}

export default StudentHeader;
