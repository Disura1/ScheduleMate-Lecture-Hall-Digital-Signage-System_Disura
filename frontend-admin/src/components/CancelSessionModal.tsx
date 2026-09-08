import { useState } from 'react';
import { cancelSession, formatDate, formatTime, type SessionItem } from '../api/sessions';
import { Modal } from './Modal';
import { ApiError } from '../lib/apiClient';

export function CancelSessionModal({ session, onClose, onCancelled }: { session: SessionItem; onClose: () => void; onCancelled: () => void }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleConfirm() {
    setError(null);
    setSaving(true);
    try {
      await cancelSession(session.id, reason || undefined);
      onCancelled();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Cancel this session?"
      subtitle={`${session.room.code} · ${session.module.code} · ${formatDate(session.sessionDate)}, ${formatTime(session.startTime)}–${formatTime(session.endTime)}`}
      onClose={onClose}
    >
      <label className="text-sm font-semibold text-navy block mb-1">Reason (optional, shown to viewers)</label>
      <input className="w-full h-10 border border-gray-200 rounded-lg px-3 mb-3 text-sm" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Lecturer on leave" />

      <p className="text-xs text-status-gray mb-4">This session will be marked Cancelled and shown on the Cancelled slide for its floor/side. It will not be deleted.</p>

      {error && <div className="bg-status-red-bg text-status-red text-sm rounded-lg p-3 mb-4">{error}</div>}

      <div className="flex gap-2.5">
        <button onClick={onClose} className="flex-1 h-10 border border-gray-200 rounded-lg text-sm font-semibold">Go Back</button>
        <button onClick={handleConfirm} disabled={saving} className="flex-1 h-10 bg-status-red text-white rounded-lg text-sm font-semibold disabled:opacity-60">
          {saving ? 'Cancelling…' : 'Cancel Session'}
        </button>
      </div>
    </Modal>
  );
}