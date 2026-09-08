import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/apiClient';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login: setAuthState } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await login(username, password);
      setAuthState(result);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="h-14 bg-navy flex items-center px-7 text-white font-semibold">
        ScheduleMate — Admin
      </div>
      <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 3.5rem)' }}>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-9 w-90">
          <h1 className="text-xl font-bold text-navy text-center mb-1">ScheduleMate</h1>
          <p className="text-status-gray text-sm text-center mb-6">
            Sparkline Academy — Lecture Hall Digital Signage
          </p>

          <label className="text-sm font-semibold text-navy block mb-1">Username / Email</label>
          <input
            className="w-full h-10 border border-gray-200 rounded-lg px-3 mb-4 text-sm"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label className="text-sm font-semibold text-navy block mb-1">Password</label>
          <input
            type="password"
            className="w-full h-10 border border-gray-200 rounded-lg px-3 mb-6 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="text-status-red text-sm text-center mb-4">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-brand-blue text-white rounded-lg font-semibold disabled:opacity-60"
          >
            {loading ? 'Logging in…' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}