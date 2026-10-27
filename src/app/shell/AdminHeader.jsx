import React, { useState } from 'react';
import { useRouter } from '../../router';
import { useAuth } from '../../modules/auth/context/AuthContext';
import { MaterialIcons } from '@/ui';

const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard', icon: 'dashboard', screen: 'AdminDashboard' },
  { label: 'Control Center', icon: 'admin-panel-settings', screen: 'CampusAdminControlCenter' },
  { label: 'Reports', icon: 'assessment', screen: 'ReportManagement' },
  { label: 'Timetable', icon: 'schedule', screen: 'AdminTimetable' },
  { label: 'Enroll student', icon: 'person-add', screen: 'EnrollStudent', also: ['EnrollmentSuccess'] },
  { label: 'Staff onboarding', icon: 'badge', screen: 'AdminStaffOnboarding', also: ['AddStaff'] },
  { label: 'Mentor / Proctor', icon: 'supervisor-account', screen: 'MentorProctorAllocation', also: ['AssignStudent'] },
  { label: 'Profile', icon: 'person', screen: 'AdminProfile', also: ['AdminEditProfile'] },
  { label: 'Campus Services', icon: 'support-agent', screen: 'StudentFacultyPortal' },
  { label: 'Campus hub', icon: 'public', screen: 'CommonPortal' },
];

export function AdminHeader({ active }) {
  const { navigation } = useRouter();
  const { user, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayName = profile?.full_name || profile?.name || user?.name || user?.username || 'Dr. K. Arulmozhi';
  const avatarUri = profile?.avatar_url || user?.profile?.avatar_url;
  const isProfileActive = active === 'AdminProfile' || active === 'AdminEditProfile';

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
      navigation.navigate(screen, { role: 'ADMIN', from: 'admin' });
    } else {
      navigation.navigate(screen);
    }
  };

  return (
    <header className="admin-header student-header" aria-label="Admin console header navigation">
      <div className="admin-header-inner student-header-inner">
        {/* Left: Brand */}
        <div
          className="admin-header-brand student-header-brand"
          onClick={() => handleNav('AdminDashboard')}
          title="Go to Admin Dashboard"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleNav('AdminDashboard');
            }
          }}
        >
          <span className="admin-header-logo student-header-logo">NEXUS</span>
          <span className="admin-header-badge student-header-badge">Info IT</span>
          <span className="admin-header-role student-header-role">ADMIN CONSOLE</span>
        </div>

        {/* Center: Navigation Links */}
        <nav className="admin-header-nav student-header-nav" aria-label="Admin primary navigation">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive = active === item.screen || item.also?.includes(active);
            return (
              <button
                key={item.screen}
                type="button"
                className={`admin-nav-btn student-nav-btn${isActive ? ' active' : ''}`}
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
        <div className="admin-header-right student-header-right">
          <button
            type="button"
            className={`admin-header-user-btn student-header-user-btn${isProfileActive ? ' active' : ''}`}
            onClick={() => handleNav('AdminProfile')}
            aria-current={isProfileActive ? 'page' : undefined}
            title={`Logged in as ${displayName} • View Profile`}
          >
            {avatarUri ? (
              <img src={avatarUri} alt="" className="admin-header-avatar student-header-avatar" />
            ) : (
              <MaterialIcons name="account-circle" size={28} color="#003fb1" />
            )}
            <div className="admin-header-user-text student-header-user-text">
              <span className="admin-header-user-name student-header-user-name">{displayName}</span>
              <span className="admin-header-user-role student-header-user-role">Administrator</span>
            </div>
          </button>

          <button
            type="button"
            className="admin-header-logout-btn student-header-logout-btn"
            onClick={logout}
            title="Sign out of admin console"
          >
            <MaterialIcons name="logout" size={18} />
            <span className="admin-logout-text student-logout-text">Sign out</span>
          </button>

          {/* Mobile hamburger toggle */}
          <button
            type="button"
            className="admin-mobile-menu-toggle student-mobile-menu-toggle"
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
        <div className="admin-mobile-nav-dropdown student-mobile-nav-dropdown">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive = active === item.screen || item.also?.includes(active);
            return (
              <button
                key={item.screen}
                type="button"
                className={`admin-mobile-nav-item student-mobile-nav-item${isActive ? ' active' : ''}`}
                onClick={() => handleNav(item.screen)}
              >
                <MaterialIcons name={item.icon} size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="admin-mobile-nav-divider student-mobile-nav-divider" />
          <button
            type="button"
            className="admin-mobile-nav-item student-mobile-nav-item admin-mobile-logout student-mobile-logout"
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
