import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/structure', label: 'Campus Structure' },
  { to: '/academic', label: 'Modules & Lecturers' },
  { to: '/sessions', label: 'Sessions' },
  { to: '/displays', label: 'Displays' },
  { to: '/settings', label: 'Settings' },
];

export function AppShell() {
  const { admin, logout } = useAuth();

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-bg">
      <div className="h-14 bg-navy flex items-center justify-between px-7 text-white shrink-0">
        <span className="font-semibold">ScheduleMate — Admin</span>
        <div
          className="w-8 h-8 rounded-full bg-sidebar-navy border border-white/20 flex items-center justify-center text-xs font-semibold text-white"
          title={admin?.fullName}
        >
          {getInitials(admin?.fullName)}
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <nav className="w-48 bg-sidebar-navy py-5 px-3 flex flex-col shrink-0">
          <div className="flex-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-lg text-sm mb-1 ${
                    isActive ? 'bg-brand-blue text-white font-semibold' : 'text-gray-300 hover:bg-white/5'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="border-t border-white/10 mt-2 pt-2 shrink-0">
            <button
              onClick={logout}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-status-red/10 hover:text-status-red transition-colors"
            >
              Logout
            </button>
          </div>
        </nav>

        <main className="flex-1 min-h-0 p-7 flex flex-col overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function getInitials(fullName?: string): string {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}