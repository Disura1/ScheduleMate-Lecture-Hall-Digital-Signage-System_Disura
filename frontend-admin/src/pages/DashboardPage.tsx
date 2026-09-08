import { useAuth } from '../context/AuthContext';

export function DashboardPage() {
  const { admin, logout } = useAuth();
  return (
    <div className="p-8">
      <h1 className="text-xl font-bold text-navy mb-2">Welcome, {admin?.fullName}</h1>
      <p className="text-status-gray mb-4">Role: {admin?.role}</p>
      <button onClick={logout} className="bg-status-red text-white px-4 py-2 rounded-lg">
        Log Out
      </button>
    </div>
  );
}