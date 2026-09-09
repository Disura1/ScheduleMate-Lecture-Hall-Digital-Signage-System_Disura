import { useState } from 'react';
import { updateAdminAccount } from '../api/adminAccounts';
import { useAuth } from '../context/AuthContext';
import { Modal } from './Modal';
import { ApiError } from '../lib/apiClient';

export function EditProfileModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { admin, updateAdmin } = useAuth();
  const [fullName, setFullName] = useState(admin?.fullName ?? '');
  const [email, setEmail] = useState(admin?.email ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!admin) return;
    setError(null);
    setSaving(true);
    try {
      await updateAdminAccount(admin.id, { fullName, email });
      updateAdmin({ fullName, email });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Edit Profile" subtitle="Super Admins can update their own name and email directly." onClose={onClose}>
      <label className="text-sm font-semibold text-navy block mb-1">Full Name</label>
      <input className="w-full h-10 border border-gray-200 rounded-lg px-3 mb-3 text-sm" value={fullName} onChange={(e) => setFullName(e.target.value)} />

      <label className="text-sm font-semibold text-navy block mb-1">Email</label>
      <input className="w-full h-10 border border-gray-200 rounded-lg px-3 mb-4 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} />

      <div className="bg-status-gray-bg text-status-gray text-xs rounded-lg p-3 mb-4">
        Role is not changed here. To prevent accidental self-demotion, role changes must be made by another Super Admin from Admin Accounts.
      </div>

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