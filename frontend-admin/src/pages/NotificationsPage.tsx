import { useEffect, useState } from 'react';
import { getNotifications, createNotification, updateNotification, deleteNotification, type NotificationItem } from '../api/notifications';
import { TableCard } from '../components/TableCard';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';
import { ApiError } from '../lib/apiClient';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState<NotificationItem | null>(null);
  const [deletingNotification, setDeletingNotification] = useState<NotificationItem | null>(null);
  const [togglingNotification, setTogglingNotification] = useState<NotificationItem | null>(null);
  const { showSuccess } = useToast();

  function reload() {
    setLoading(true);
    getNotifications().then(setNotifications).finally(() => setLoading(false));
  }
  useEffect(reload, []);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-xl font-bold text-navy">Notifications</h1>
          <p className="text-sm text-status-gray mt-1">Active notifications scroll across the bottom of every Digital Signage display.</p>
        </div>
        <button onClick={() => setShowNewModal(true)} className="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-semibold">
          + New Notification
        </button>
      </div>

      <TableCard>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr className="text-left text-xs font-semibold text-status-gray uppercase">
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-status-gray">Loading…</td></tr>
            ) : notifications.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-status-gray">No notifications yet</td></tr>
            ) : (
              notifications.map((n) => (
                <tr key={n.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 max-w-md">{n.message}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${n.isActive ? 'bg-status-green-bg text-status-green' : 'bg-status-gray-bg text-status-gray'}`}>
                      {n.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{new Date(n.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 space-x-3">
                    <button onClick={() => setEditingNotification(n)} className="text-brand-blue font-semibold">Edit</button>
                    <button onClick={() => setTogglingNotification(n)} className={n.isActive ? 'text-status-gray font-semibold' : 'text-status-green font-semibold'}>
                      {n.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => setDeletingNotification(n)} className="text-status-red font-semibold">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableCard>

      {showNewModal && (
        <NotificationFormModal onClose={() => setShowNewModal(false)} onSaved={() => { setShowNewModal(false); reload(); showSuccess('Notification created.'); }} />
      )}
      {editingNotification && (
        <NotificationFormModal existing={editingNotification} onClose={() => setEditingNotification(null)} onSaved={() => { setEditingNotification(null); reload(); showSuccess('Notification updated.'); }} />
      )}
      {togglingNotification && (
        <ConfirmModal
          title={togglingNotification.isActive ? 'Deactivate this notification?' : 'Activate this notification?'}
          subtitle={togglingNotification.message}
          bodyText={
            togglingNotification.isActive
              ? 'It will stop showing on Digital Signage displays immediately.'
              : 'It will immediately start showing on every Digital Signage display.'
          }
          confirmLabel={togglingNotification.isActive ? 'Deactivate' : 'Activate'}
          danger={togglingNotification.isActive}
          onClose={() => setTogglingNotification(null)}
          onConfirm={async () => {
            await updateNotification(togglingNotification.id, { isActive: !togglingNotification.isActive });
            setTogglingNotification(null);
            reload();
            showSuccess(togglingNotification.isActive ? 'Notification deactivated.' : 'Notification activated.');
          }}
        />
      )}
      {deletingNotification && (
        <ConfirmModal
          title="Delete this notification?"
          subtitle={deletingNotification.message}
          confirmLabel="Delete Notification"
          onClose={() => setDeletingNotification(null)}
          onConfirm={async () => { await deleteNotification(deletingNotification.id); setDeletingNotification(null); reload(); showSuccess('Notification deleted.'); }}
        />
      )}
    </div>
  );
}

function NotificationFormModal({ existing, onClose, onSaved }: { existing?: NotificationItem; onClose: () => void; onSaved: () => void }) {
  const [message, setMessage] = useState(existing?.message ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      if (existing) await updateNotification(existing.id, { message });
      else await createNotification(message);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={existing ? 'Edit Notification' : 'New Notification'} subtitle="Shown to viewers on every active Digital Signage display until deactivated or deleted." onClose={onClose}>
      <label className="text-sm font-semibold text-navy block mb-1">Message</label>
      <textarea
        className="w-full h-24 border border-gray-200 rounded-lg px-3 py-2 mb-4 text-sm resize-none"
        placeholder="e.g. Reminder: Mid-semester exams begin next Monday."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      {error && <div className="bg-status-red-bg text-status-red text-sm rounded-lg p-3 mb-4">{error}</div>}

      <div className="flex gap-2.5">
        <button onClick={onClose} className="flex-1 h-10 border border-gray-200 rounded-lg text-sm font-semibold">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="flex-1 h-10 bg-brand-blue text-white rounded-lg text-sm font-semibold disabled:opacity-60">
          {saving ? 'Saving…' : 'Save Notification'}
        </button>
      </div>
    </Modal>
  );
}