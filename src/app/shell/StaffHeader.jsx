import React, { useState } from 'react';
import { useRouter } from '../../router';
import { useAuth } from '../../modules/auth/context/AuthContext';
import { MaterialIcons } from '@/ui';

const STAFF_NAV_ITEMS = [
  { label: 'Home', icon: 'dashboard', screen: 'StaffDashboard' },
  { label: 'Mark attendance', icon: 'how-to-reg', screen: 'MarkAttendance' },
  { label: 'Attendance history', icon: 'history', screen: 'StaffAttendanceHistory', also: ['AttendanceReview'] },
  { label: 'Timetable', icon: 'push-pin', screen: 'StaffTimetable' },
  { label: 'Notes & QP', icon: 'menu-book', screen: 'StaffNotes' },
  { label: 'Profile', icon: 'person', screen: 'StaffProfile', also: ['StaffEditProfile'] },
  { label: 'Campus Services', icon: 'support-agent', screen: 'StudentFacultyPortal' },
  { label: 'Campus hub', icon: 'public', screen: 'CommonPortal' },
];

export function StaffHeader({ active }) {
  const { navigation } = useRouter();
  const { user, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayName = profile?.full_name || profile?.name || user?.name || user?.username || 'Prof. M. Selvam';
  const avatarUri = profile?.avatar_url || profile?.avatar || user?.profile?.avatar_url || user?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVXP3laCjvBlZEVugtzpX20kCifG87-9yGGVWnUCmaIhNtCcDdG9HmCKcyaSa4oTc-QPnHNb5RR_pO0Xd8oVLNtxyVdxbttBW5KjbrzMiMJD0HcqApHxFuVbC5_KEUHnW0qOr98kurfIJ2NAVvw464MLzvDAN8LdJTSZXSqkbDkysN8V9Lzled9wZvQVwVorYcKfLMT1do8whwEUyopOcVpVMNt3wTCpl8mQ00dAziqalPOmZQTqcZ';
  const isProfileActive = active === 'StaffProfile' || active === 'StaffEditProfile';

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
      navigation.navigate(screen, { role: 'STAFF', from: 'staff' });
    } else {
      navigation.navigate(screen);
    }
  };

  return (
    <header className="staff-header student-header" aria-label="Faculty portal header navigation">
      <div className="staff-header-inner student-header-inner">
        {/* Left: Brand */}
        <div
          className="staff-header-brand student-header-brand"
          onClick={() => handleNav('StaffDashboard')}
          title="Go to Faculty Dashboard"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleNav('StaffDashboard');
            }
          }}
        >
          <img src="/info_logo.png" alt="NEXUS" style={{ width: 26, height: 26, objectFit: 'contain', flexShrink: 0 }} />
          <span className="staff-header-logo student-header-logo">NEXUS</span>
          <span className="staff-header-badge student-header-badge">Info IT</span>
          <span className="staff-header-role student-header-role">FACULTY PORTAL</span>
        </div>

        {/* Center: Navigation Links */}
        <nav className="staff-header-nav student-header-nav" aria-label="Faculty primary navigation">
          {STAFF_NAV_ITEMS.map((item) => {
            const isActive = active === item.screen || item.also?.includes(active);
            return (
              <button
                key={item.screen}
                type="button"
                className={`staff-nav-btn student-nav-btn${isActive ? ' active' : ''}`}
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
        <div className="staff-header-right student-header-right">
          <button
            type="button"
            className={`staff-header-user-btn student-header-user-btn${isProfileActive ? ' active' : ''}`}
            onClick={() => handleNav('StaffProfile')}
            aria-current={isProfileActive ? 'page' : undefined}
            title={`Logged in as ${displayName} • View Profile`}
          >
            {avatarUri ? (
              <img src={avatarUri} alt="" className="staff-header-avatar student-header-avatar" />
            ) : (
              <MaterialIcons name="account-circle" size={28} color="#003fb1" />
            )}
            <div className="staff-header-user-text student-header-user-text">
              <span className="staff-header-user-name student-header-user-name">{displayName}</span>
              <span className="staff-header-user-role student-header-user-role">Faculty</span>
            </div>
          </button>

          <button
            type="button"
            className="staff-header-logout-btn student-header-logout-btn"
            onClick={logout}
            title="Sign out of faculty portal"
          >
            <MaterialIcons name="logout" size={18} />
            <span className="staff-logout-text student-logout-text">Sign out</span>
          </button>

          {/* Mobile hamburger toggle */}
          <button
            type="button"
            className="staff-mobile-menu-toggle student-mobile-menu-toggle"
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
        <div className="staff-mobile-nav-dropdown student-mobile-nav-dropdown">
          {STAFF_NAV_ITEMS.map((item) => {
            const isActive = active === item.screen || item.also?.includes(active);
            return (
              <button
                key={item.screen}
                type="button"
                className={`staff-mobile-nav-item student-mobile-nav-item${isActive ? ' active' : ''}`}
                onClick={() => handleNav(item.screen)}
              >
                <MaterialIcons name={item.icon} size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="staff-mobile-nav-divider student-mobile-nav-divider" />
          <button
            type="button"
            className="staff-mobile-nav-item student-mobile-nav-item staff-mobile-logout student-mobile-logout"
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
