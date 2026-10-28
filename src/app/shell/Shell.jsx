import React, { createContext, useContext, useEffect } from 'react';
import { useRouter } from '../../router';
import { useAuth } from '../../modules/auth/context/AuthContext';
import { useBreakpoint } from '@/ui';
import { Sidebar } from './Sidebar';
import { StudentHeader } from './StudentHeader';
import { StaffHeader } from './StaffHeader';
import { AdminHeader } from './AdminHeader';

const ShellContext = createContext({ sidebar: false });
export const useShell = () => useContext(ShellContext);

const HOME = { STUDENT: 'StudentDashboard', STAFF: 'StaffDashboard', ADMIN: 'AdminDashboard' };

/**
 * Responsive application frame.
 *  - guards role-protected routes (redirects to login / the user's own home)
 *  - ≥1100px : persistent sidebar replaces the per-screen bottom navigation
 *  - <1100px : mobile layout (screens render their own bottom navigation)
 */
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

  const isCustomLayout = loc.path === '/' || loc.path.startsWith('/login') || loc.path === '/portal' || loc.path === '/services' || loc.path === '/lost-found';
  const isStudentSection = (route?.role === 'STUDENT' || loc.path.startsWith('/student')) && !isCustomLayout;
  const isStaffSection = (route?.role === 'STAFF' || loc.path.startsWith('/staff')) && !isCustomLayout;
  const isAdminSection = (route?.role === 'ADMIN' || loc.path.startsWith('/admin')) && !isCustomLayout;
  const isHeaderNav = isStudentSection || isStaffSection || isAdminSection;
  const sidebar = !isHeaderNav && !!(required || role) && isDesktop && !isCustomLayout;
  return (
    <ShellContext.Provider value={{ sidebar, isStudentSection, isStaffSection, isAdminSection }}>
      <div className={`app-shell${sidebar ? ' with-sidebar' : ''}${isHeaderNav ? ' student-layout staff-layout admin-layout' : ''}`}>
        {sidebar ? <Sidebar role={required || role || 'ADMIN'} active={route?.name} /> : null}
        <div className="app-shell-body">
          {isStudentSection ? <StudentHeader active={route?.name} /> : null}
          {isStaffSection ? <StaffHeader active={route?.name} /> : null}
          {isAdminSection ? <AdminHeader active={route?.name} /> : null}
          <main className="app-main">{children}</main>
        </div>
      </div>
    </ShellContext.Provider>
  );
}
