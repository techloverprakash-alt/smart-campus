import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useRouter } from '../../router';
import { useAuth } from '../../modules/auth/context/AuthContext';
import { useBreakpoint, MaterialIcons, ActivityIndicator } from '@/ui';
import { Sidebar } from './Sidebar';
import { StudentHeader } from './StudentHeader';

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
  const [collapsed, setCollapsed] = useState(false);
  const [position, setPosition] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_inspector_pos');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return null;
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    hasMoved: false,
  });
  const barRef = useRef(null);

  const handlePointerDown = (e) => {
    if (e.target.closest('button')) return;
    if (!barRef.current) return;

    const rect = barRef.current.getBoundingClientRect();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: rect.left,
      initialY: rect.top,
      hasMoved: false,
    };

    setIsDragging(true);

    const onPointerMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - dragRef.current.startX;
      const deltaY = moveEvent.clientY - dragRef.current.startY;

      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        dragRef.current.hasMoved = true;
      }

      const rectNow = barRef.current?.getBoundingClientRect() || { width: 280, height: 42 };
      const maxX = Math.max(8, window.innerWidth - rectNow.width - 8);
      const maxY = Math.max(8, window.innerHeight - rectNow.height - 8);

      const nextX = Math.min(Math.max(8, dragRef.current.initialX + deltaX), maxX);
      const nextY = Math.min(Math.max(8, dragRef.current.initialY + deltaY), maxY);

      setPosition({ x: nextX, y: nextY });
    };

    const onPointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      if (barRef.current) {
        const finalRect = barRef.current.getBoundingClientRect();
        try {
          localStorage.setItem(
            'nexus_inspector_pos',
            JSON.stringify({ x: finalRect.left, y: finalRect.top })
          );
        } catch {
          // Ignore
        }
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const roleLabel =
    activeRole === 'STUDENT'
      ? '🎓 Student'
      : activeRole === 'STAFF'
      ? '👨‍🏫 Staff'
      : activeRole === 'ADMIN'
      ? '🏛️ Admin'
      : '👤 Guest';

  const floatingStyle = position
    ? {
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        right: 'auto',
        bottom: 'auto',
      }
    : undefined;

  return (
    <div
      ref={barRef}
      className={`nexus-inspector-bar ${isDragging ? 'is-dragging' : ''}`}
      style={floatingStyle}
      onPointerDown={handlePointerDown}
    >
      {collapsed ? (
        <div
          className="nexus-inspector-pill nexus-inspector-floating-collapsed"
          onClick={() => {
            if (!dragRef.current.hasMoved) {
              setCollapsed(false);
            }
          }}
          title="Click to expand Inspect Mode • Drag to move anywhere"
        >
          <span className="nexus-drag-handle" title="Drag to reposition">⋮⋮</span>
          <span className="nexus-inspector-tag">Inspect</span>
          <span className="nexus-collapsed-active-badge">{roleLabel}</span>
          <button
            type="button"
            className="nexus-expand-btn"
            title="Expand"
            onClick={(e) => {
              e.stopPropagation();
              setCollapsed(false);
            }}
          >
            ＋
          </button>
        </div>
      ) : (
        <div className="nexus-inspector-pill nexus-inspector-floating-expanded">
          <div className="nexus-drag-handle" title="Drag to reposition anywhere">
            <span>⋮⋮</span>
          </div>
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
          <button
            type="button"
            className="nexus-inspector-btn collapse-btn"
            title="Minimize to floating pill"
            onClick={(e) => {
              e.stopPropagation();
              setCollapsed(true);
            }}
          >
            ✕
          </button>
        </div>
      )}
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
  const isStudentSection = (route?.role === 'STUDENT' || loc.path.startsWith('/student')) && !isCustomLayout;
  const sidebar = !isStudentSection && !!(required || role) && isDesktop && !isCustomLayout;
  return (
    <ShellContext.Provider value={{ sidebar, isStudentSection }}>
      <div className={`app-shell${sidebar ? ' with-sidebar' : ''}${isStudentSection ? ' student-layout' : ''}`}>
        <InspectorBar
          activeRole={role}
          onSelectRole={handleSelectRole}
          onCampusServices={() => navigation.navigate('StudentFacultyPortal', {
            role: role || user?.role || 'STUDENT',
            from: (role || user?.role || 'student').toLowerCase(),
          })}
          onCampusHub={() => navigation.navigate('CommonPortal')}
          onLogin={() => navigation.navigate('Login')}
        />
        {sidebar ? <Sidebar role={required || role || 'STAFF'} active={route?.name} /> : null}
        <div className="app-shell-body">
          {isStudentSection ? <StudentHeader active={route?.name} /> : null}
          <main className="app-main">{children}</main>
        </div>
      </div>
    </ShellContext.Provider>
  );
}
