import { useState } from 'react';
import { updateAdminAccount, updateAdminRole, type AdminAccount } from '../api/adminAccounts';
import { Modal } from './Modal';
import { ApiError } from '../lib/apiClient';

export function EditAdminModal({ target, onClose, onSaved }: { target: AdminAccount; onClose: () => void; onSaved: () => void }) {
  const [fullName, setFullName] = useState(target.fullName);
  const [email, setEmail] = useState(target.email);
  const [role, setRole] = useState(target.role);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      await updateAdminAccount(target.id, { fullName, email });
      if (role !== target.role) {
        await updateAdminRole(target.id, role);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Edit Admin Account" subtitle={`Editing ${target.fullName}. Username (${target.username}) is permanent and cannot be changed.`} onClose={onClose}>
      <label className="text-sm font-semibold text-navy block mb-1">Full Name</label>
      <input className="w-full h-10 border border-gray-200 rounded-lg px-3 mb-3 text-sm" value={fullName} onChange={(e) => setFullName(e.target.value)} />

      <label className="text-sm font-semibold text-navy block mb-1">Email</label>
      <input className="w-full h-10 border border-gray-200 rounded-lg px-3 mb-3 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} />

      <label className="text-sm font-semibold text-navy block mb-1">Role</label>
      <select className="w-full h-10 border border-gray-200 rounded-lg px-2 mb-4 text-sm bg-white" value={role} onChange={(e) => setRole(e.target.value as 'ADMIN' | 'SUPER_ADMIN')}>
        <option value="ADMIN">Admin</option>
        <option value="SUPER_ADMIN">Super Admin</option>
      </select>

      {error && <div className="bg-status-red-bg text-status-red text-sm rounded-lg p-3 mb-4">{error}</div>}

      <div className="flex gap-2.5">
        <button onClick={onClose} className="flex-1 h-10 border border-gray-200 rounded-lg text-sm font-semibold">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="flex-1 h-10 bg-brand-blue text-white rounded-lg text-sm font-semibold disabled:opacity-60">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </Modal>
  );
}