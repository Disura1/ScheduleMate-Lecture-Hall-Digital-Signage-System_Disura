import { useState } from 'react';
import { changePassword } from '../api/auth';
import { Modal } from './Modal';
import { ApiError } from '../lib/apiClient';

export function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  if (success) {
    return (
      <Modal title="Password Updated" onClose={onClose}>
        <p className="text-sm text-status-gray mb-4">Your password has been changed successfully.</p>
        <button onClick={onClose} className="w-full h-10 bg-brand-blue text-white rounded-lg text-sm font-semibold">Close</button>
      </Modal>
    );
  }

  return (
    <Modal title="Change Password" onClose={onClose}>
      <label className="text-sm font-semibold text-navy block mb-1">Current Password</label>
      <input type="password" className="w-full h-10 border border-gray-200 rounded-lg px-3 mb-3 text-sm" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />

      <label className="text-sm font-semibold text-navy block mb-1">New Password</label>
      <input type="password" className="w-full h-10 border border-gray-200 rounded-lg px-3 mb-4 text-sm" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />

      {error && <div className="bg-status-red-bg text-status-red text-sm rounded-lg p-3 mb-4">{error}</div>}

      <div className="flex gap-2.5">
        <button onClick={onClose} className="flex-1 h-10 border border-gray-200 rounded-lg text-sm font-semibold">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="flex-1 h-10 bg-brand-blue text-white rounded-lg text-sm font-semibold disabled:opacity-60">
          {saving ? 'Updating…' : 'Update Password'}
        </button>
      </div>
    </Modal>
  );
}