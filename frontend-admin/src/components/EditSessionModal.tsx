import { useEffect, useState } from 'react';
import { getModules, getLecturers, type ModuleItem, type LecturerItem } from '../api/academic';
import { updateSession, type SessionItem } from '../api/sessions';
import { Modal } from './Modal';
import { ApiError } from '../lib/apiClient';

export function EditSessionModal({ session, onClose, onSaved }: { session: SessionItem; onClose: () => void; onSaved: () => void }) {
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [lecturers, setLecturers] = useState<LecturerItem[]>([]);
  const [moduleId, setModuleId] = useState(session.moduleId);
  const [lecturerId, setLecturerId] = useState(session.lecturerId);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getModules().then(setModules);
    getLecturers().then(setLecturers);
  }, []);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      await updateSession(session.id, { moduleId, lecturerId });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Edit Session" subtitle={`Room and time stay fixed here — use Reschedule to change those. Editing session #${session.id}.`} onClose={onClose}>
      <label className="text-sm font-semibold text-navy block mb-1">Module</label>
      <select className="w-full h-10 border border-gray-200 rounded-lg px-2 mb-3 text-sm bg-white" value={moduleId} onChange={(e) => setModuleId(Number(e.target.value))}>
        {modules.map((m) => <option key={m.id} value={m.id}>{m.code} — {m.name}</option>)}
      </select>

      <label className="text-sm font-semibold text-navy block mb-1">Lecturer</label>
      <select className="w-full h-10 border border-gray-200 rounded-lg px-2 mb-4 text-sm bg-white" value={lecturerId} onChange={(e) => setLecturerId(Number(e.target.value))}>
        {lecturers.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
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