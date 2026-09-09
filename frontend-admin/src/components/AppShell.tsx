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
    <div className="min-h-screen bg-bg">
      <div className="h-14 bg-navy flex items-center justify-between px-7 text-white">
        <span className="font-semibold">ScheduleMate — Admin</span>
        <div
          className="w-8 h-8 rounded-full bg-sidebar-navy border border-white/20 flex items-center justify-center text-xs font-semibold text-white"
          title={admin?.fullName}
        >
          {getInitials(admin?.fullName)}
        </div>
      </div>

      <div className="flex">
        <nav className="w-48 min-h-[calc(100vh-3.5rem)] bg-sidebar-navy py-5 px-3 flex flex-col">
          <div className="flex-1">
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

          <button
            onClick={logout}
            className="text-left px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-white/5 border-t border-white/10 mt-2 pt-4"
          >
            Logout
          </button>
        </nav>

        <main className="flex-1 p-7">
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