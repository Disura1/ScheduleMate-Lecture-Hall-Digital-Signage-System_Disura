import { useState } from 'react';
import { createAdminAccount } from '../api/adminAccounts';
import { Modal } from './Modal';
import { ApiError } from '../lib/apiClient';

export function NewAdminModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'SUPER_ADMIN'>('ADMIN');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      await createAdminAccount({ fullName, username, email, role });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  if (success) {
    return (
      <Modal title="Admin Account Created" onClose={onCreated}>
        <p className="text-sm text-status-gray mb-4">
          An activation email has been sent to <b>{email}</b>. {fullName} needs to click the link in that email to set their password and activate their account.
        </p>
        <button onClick={onCreated} className="w-full h-10 bg-brand-blue text-white rounded-lg text-sm font-semibold">Done</button>
      </Modal>
    );
  }

  return (
    <Modal title="New Admin Account" subtitle="The new admin will be asked to set their own password on first login." onClose={onClose}>
      <label className="text-sm font-semibold text-navy block mb-1">Full Name</label>
      <input className="w-full h-10 border border-gray-200 rounded-lg px-3 mb-3 text-sm" placeholder="e.g. Kavindu Perera" value={fullName} onChange={(e) => setFullName(e.target.value)} />

      <label className="text-sm font-semibold text-navy block mb-1">Username</label>
      <input className="w-full h-10 border border-gray-200 rounded-lg px-3 mb-3 text-sm" placeholder="e.g. kavindu.p" value={username} onChange={(e) => setUsername(e.target.value)} />

      <label className="text-sm font-semibold text-navy block mb-1">Email</label>
      <input className="w-full h-10 border border-gray-200 rounded-lg px-3 mb-3 text-sm" placeholder="kavindu@sparkline.edu" value={email} onChange={(e) => setEmail(e.target.value)} />

      <label className="text-sm font-semibold text-navy block mb-1">Role</label>
      <select className="w-full h-10 border border-gray-200 rounded-lg px-2 mb-4 text-sm bg-white" value={role} onChange={(e) => setRole(e.target.value as 'ADMIN' | 'SUPER_ADMIN')}>
        <option value="ADMIN">Admin</option>
        <option value="SUPER_ADMIN">Super Admin</option>
      </select>

      {error && <div className="bg-status-red-bg text-status-red text-sm rounded-lg p-3 mb-4">{error}</div>}

      <div className="flex gap-2.5">
        <button onClick={onClose} className="flex-1 h-10 border border-gray-200 rounded-lg text-sm font-semibold">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="flex-1 h-10 bg-brand-blue text-white rounded-lg text-sm font-semibold disabled:opacity-60">
          {saving ? 'Creating…' : 'Create Account & Send Invite'}
        </button>
      </div>
    </Modal>
  );
}