import React, { createContext, useContext, useEffect } from 'react';
import { useRouter } from '../../router';
import { useAuth } from '../../modules/auth/context/AuthContext';
import { useBreakpoint, MaterialIcons, ActivityIndicator } from '@/ui';
import { Sidebar } from './Sidebar';

const ShellContext = createContext({ sidebar: false });
export const useShell = () => useContext(ShellContext);

const HOME = { STUDENT: 'StudentDashboard', STAFF: 'StaffDashboard', ADMIN: 'AdminDashboard' };

/**
 * Responsive application frame.
 *  - guards role-protected routes (redirects to login / the user's own home)
 *  - ≥1100px : persistent sidebar replaces the per-screen bottom navigation
 *  - <1100px : mobile layout (screens render their own bottom navigation)
 */
function InspectorBar({ activeRole, onSelectRole, onCampusServices, onCampusHub, onLogin }) {
  return (
    <div className="nexus-inspector-bar">
      <div className="nexus-inspector-pill">
        <span className="nexus-inspector-tag">Inspect Mode</span>
        <button
          type="button"
          className={`nexus-inspector-btn ${activeRole === 'STUDENT' ? 'active' : ''}`}
          onClick={() => onSelectRole('STUDENT', 'StudentDashboard')}
        >
          🎓 Student
        </button>
        <button
          type="button"
          className={`nexus-inspector-btn ${activeRole === 'STAFF' ? 'active' : ''}`}
          onClick={() => onSelectRole('STAFF', 'StaffDashboard')}
        >
          👨‍🏫 Staff
        </button>
        <button
          type="button"
          className={`nexus-inspector-btn ${activeRole === 'ADMIN' ? 'active' : ''}`}
          onClick={() => onSelectRole('ADMIN', 'AdminDashboard')}
        >
          🏛️ Admin
        </button>
        <button
          type="button"
          className="nexus-inspector-btn hub-btn"
          onClick={onCampusServices}
        >
          🏢 Services & Lost-Found
        </button>
        <button
          type="button"
          className="nexus-inspector-btn hub-btn"
          onClick={onCampusHub}
        >
          🌐 Campus Hub
        </button>
        <button
          type="button"
          className="nexus-inspector-btn login-btn"
          onClick={onLogin}
        >
          🔑 Roles
        </button>
      </div>
    </div>
  );
}

export function Shell({ children }) {
  const { loc, routes, navigation } = useRouter();
  const { role, user, isLoading, loginAs } = useAuth();
  const { isDesktop } = useBreakpoint();
  const route = routes.find((r) => r.path === loc.path);
  const required = route?.role;

  // Auto-activate demo role if navigating directly to a role-protected page
  useEffect(() => {
    if (required && !isLoading && (!user || role !== required)) {
      loginAs(required);
    }
  }, [required, isLoading, user, role, loginAs]);

  const handleSelectRole = (targetRole, screenName) => {
    loginAs(targetRole);
    navigation.navigate(screenName);
  };

  const isCustomLayout = loc.path === '/' || loc.path.startsWith('/login') || loc.path === '/portal' || loc.path === '/services' || loc.path === '/lost-found';
  const sidebar = !!(required || role) && isDesktop && !isCustomLayout;
  return (
    <ShellContext.Provider value={{ sidebar }}>
      <div className={`app-shell${sidebar ? ' with-sidebar' : ''}`}>
        <InspectorBar
          activeRole={role}
          onSelectRole={handleSelectRole}
          onCampusServices={() => navigation.navigate('StudentFacultyPortal')}
          onCampusHub={() => navigation.navigate('CommonPortal')}
          onLogin={() => navigation.navigate('Login')}
        />
        {sidebar ? <Sidebar role={required || role || 'STUDENT'} active={route?.name} /> : null}
        <main className="app-main">{children}</main>
      </div>
    </ShellContext.Provider>
  );
}
