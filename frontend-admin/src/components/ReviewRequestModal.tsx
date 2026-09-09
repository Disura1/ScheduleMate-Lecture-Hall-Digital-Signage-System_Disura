import { useState } from 'react';
import { approveRequest, rejectRequest, type PendingRequest } from '../api/adminAccounts';
import { Modal } from './Modal';
import { ApiError } from '../lib/apiClient';

export function ReviewRequestModal({ request, onClose, onResolved }: { request: PendingRequest; onClose: () => void; onResolved: () => void }) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleApprove() {
    setError(null);
    setSaving(true);
    try {
      await approveRequest(request.id);
      onResolved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  async function handleReject() {
    setError(null);
    setSaving(true);
    try {
      await rejectRequest(request.id, rejectionReason || undefined);
      onResolved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Review Profile Change Request"
      subtitle={`Requested by ${request.requester.fullName} (${request.requester.username}) on ${new Date(request.createdAt).toLocaleDateString()}`}
      onClose={onClose}
    >
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-[10px] font-bold text-status-gray uppercase mb-2">Current</div>
          <div className="text-xs text-navy mb-1"><b>Name:</b> {request.requester.fullName}</div>
          <div className="text-xs text-navy"><b>Email:</b> {request.requester.email}</div>
        </div>
        <div className="bg-status-green-bg rounded-lg p-3">
          <div className="text-[10px] font-bold text-status-green uppercase mb-2">Requested</div>
          <div className="text-xs text-navy mb-1"><b>Name:</b> {request.requestedFullName}</div>
          <div className="text-xs text-navy"><b>Email:</b> {request.requestedEmail}</div>
        </div>
      </div>

      {request.reason && <p className="text-xs text-status-gray mb-4"><b>Reason given:</b> {request.reason}</p>}

      <label className="text-sm font-semibold text-navy block mb-1">Rejection reason (only needed if rejecting)</label>
      <input className="w-full h-10 border border-gray-200 rounded-lg px-3 mb-4 text-sm" placeholder="e.g. Please use your official university email" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />

      {error && <div className="bg-status-red-bg text-status-red text-sm rounded-lg p-3 mb-4">{error}</div>}

      <div className="flex gap-2.5">
        <button onClick={handleReject} disabled={saving} className="flex-1 h-10 bg-status-red text-white rounded-lg text-sm font-semibold disabled:opacity-60">
          Reject
        </button>
        <button onClick={handleApprove} disabled={saving} className="flex-1 h-10 bg-brand-blue text-white rounded-lg text-sm font-semibold disabled:opacity-60">
          Approve & Apply
        </button>
      </div>
    </Modal>
  );
}