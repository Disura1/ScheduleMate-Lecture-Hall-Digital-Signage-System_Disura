import { useState } from 'react';
import { Modal } from './Modal';
import { ApiError } from '../lib/apiClient';

export function ConfirmModal({
  title,
  subtitle,
  bodyText,
  confirmLabel,
  danger = true,
  onClose,
  onConfirm,
}: {
  title: string;
  subtitle?: string;
  bodyText?: string;
  confirmLabel: string;
  danger?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<unknown>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleConfirm() {
    setError(null);
    setSaving(true);
    try {
      await onConfirm();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
      setSaving(false);
    }
  }

  return (
    <Modal title={title} subtitle={subtitle} onClose={onClose}>
      {bodyText && <p className="text-sm text-status-gray mb-4">{bodyText}</p>}
      {error && <div className="bg-status-red-bg text-status-red text-sm rounded-lg p-3 mb-4">{error}</div>}
      <div className="flex gap-2.5">
        <button onClick={onClose} className="flex-1 h-10 border border-gray-200 rounded-lg text-sm font-semibold">
          Go Back
        </button>
        <button
          onClick={handleConfirm}
          disabled={saving}
          className={`flex-1 h-10 text-white rounded-lg text-sm font-semibold disabled:opacity-60 ${danger ? 'bg-status-red' : 'bg-brand-blue'}`}
        >
          {saving ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}