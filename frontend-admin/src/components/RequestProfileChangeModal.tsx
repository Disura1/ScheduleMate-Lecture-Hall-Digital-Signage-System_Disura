import { useState } from 'react';
import { submitProfileChangeRequest } from '../api/adminAccounts';
import { useAuth } from '../context/AuthContext';
import { Modal } from './Modal';
import { ApiError } from '../lib/apiClient';

export function RequestProfileChangeModal({ onClose, onSubmitted }: { onClose: () => void; onSubmitted: () => void }) {
  const { admin } = useAuth();
  const [fullName, setFullName] = useState(admin?.fullName ?? '');
  const [email, setEmail] = useState(admin?.email ?? '');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      await submitProfileChangeRequest({ requestedFullName: fullName, requestedEmail: email, reason: reason || undefined });
      onSubmitted();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Request Profile Change" subtitle="Sent to a Super Admin for approval — your current details stay active until then." onClose={onClose}>
      <label className="text-sm font-semibold text-navy block mb-1">Requested Full Name</label>
      <input className="w-full h-10 border border-gray-200 rounded-lg px-3 mb-3 text-sm" value={fullName} onChange={(e) => setFullName(e.target.value)} />

      <label className="text-sm font-semibold text-navy block mb-1">Requested Email</label>
      <input className="w-full h-10 border border-gray-200 rounded-lg px-3 mb-3 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} />

      <label className="text-sm font-semibold text-navy block mb-1">Reason for change</label>
      <input className="w-full h-10 border border-gray-200 rounded-lg px-3 mb-4 text-sm" placeholder="e.g. Name change, new email domain" value={reason} onChange={(e) => setReason(e.target.value)} />

      <div className="bg-status-gray-bg text-status-gray text-xs rounded-lg p-3 mb-4">
        Role cannot be requested here. Role is only ever changed by a Super Admin directly.
      </div>

      {error && <div className="bg-status-red-bg text-status-red text-sm rounded-lg p-3 mb-4">{error}</div>}

      <div className="flex gap-2.5">
        <button onClick={onClose} className="flex-1 h-10 border border-gray-200 rounded-lg text-sm font-semibold">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="flex-1 h-10 bg-brand-blue text-white rounded-lg text-sm font-semibold disabled:opacity-60">
          {saving ? 'Sending…' : 'Send Request'}
        </button>
      </div>
    </Modal>
  );
}