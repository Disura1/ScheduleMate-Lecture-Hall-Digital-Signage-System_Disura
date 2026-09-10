import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { activateAccount } from '../api/auth';
import { ApiError } from '../lib/apiClient';

export function ActivateAccountPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);

    if (!token) {
      setError('This activation link is invalid or incomplete.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await activateAccount(token, password);
      setDone(true);
      setTimeout(() => navigate('/login'), 2500);
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
        <div className="bg-white rounded-xl shadow-lg p-9 w-96">
          {done ? (
            <>
              <h1 className="text-xl font-bold text-navy text-center mb-2">Account Activated</h1>
              <p className="text-status-gray text-sm text-center">Redirecting you to log in…</p>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="text-center mb-1">
                <span className="inline-block bg-status-green-bg text-status-green text-xs font-bold px-3 py-1 rounded-full mb-3">
                  ACCOUNT INVITE
                </span>
              </div>
              <h1 className="text-xl font-bold text-navy text-center mb-1">Welcome to ScheduleMate</h1>
              <p className="text-status-gray text-sm text-center mb-6">
                Set a password to activate your account. This link expires 24 hours after it was sent.
              </p>

              <label className="text-sm font-semibold text-navy block mb-1">Set Password</label>
              <input
                type="password"
                className="w-full h-10 border border-gray-200 rounded-lg px-3 mb-1 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-gray-400 mb-3">Minimum 8 characters</p>

              <label className="text-sm font-semibold text-navy block mb-1">Confirm Password</label>
              <input
                type="password"
                className="w-full h-10 border border-gray-200 rounded-lg px-3 mb-6 text-sm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              {error && <p className="text-status-red text-sm text-center mb-4">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-brand-blue text-white rounded-lg font-semibold disabled:opacity-60"
              >
                {loading ? 'Activating…' : 'Activate Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}