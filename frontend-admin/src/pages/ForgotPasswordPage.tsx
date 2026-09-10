import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/auth';
import { ApiError } from '../lib/apiClient';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      await forgotPassword(email);
      setSubmitted(true); // always show the same success state, regardless of whether the email exists
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
          {submitted ? (
            <>
              <h1 className="text-xl font-bold text-navy text-center mb-2">Check Your Email</h1>
              <p className="text-status-gray text-sm text-center mb-6">
                If <b>{email}</b> is registered, a password reset link has been sent — it expires in 60 minutes.
              </p>
              <Link to="/login" className="block text-center text-sm text-brand-blue font-semibold">
                ← Back to Log In
              </Link>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <h1 className="text-xl font-bold text-navy text-center mb-1">Forgot your password?</h1>
              <p className="text-status-gray text-sm text-center mb-6">
                Enter the email linked to your admin account. If it exists, we'll send a password reset link that expires in 60 minutes.
              </p>

              <label className="text-sm font-semibold text-navy block mb-1">Email</label>
              <input
                type="email"
                className="w-full h-10 border border-gray-200 rounded-lg px-3 mb-6 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {error && <p className="text-status-red text-sm text-center mb-4">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-brand-blue text-white rounded-lg font-semibold disabled:opacity-60 mb-4"
              >
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>

              <Link to="/login" className="block text-center text-sm text-brand-blue font-semibold">
                ← Back to Log In
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}