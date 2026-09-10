import { useEffect, useState } from 'react';
import {
  getModules, createModule, deleteModule,
  getLecturers, createLecturer, deleteLecturer,
  type ModuleItem, type LecturerItem,
} from '../api/academic';
import { Modal } from '../components/Modal';
import { ApiError } from '../lib/apiClient';
import { TableCard } from '../components/TableCard';

export function AcademicPage() {
  const [tab, setTab] = useState<'modules' | 'lecturers'>('modules');
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [lecturers, setLecturers] = useState<LecturerItem[]>([]);
  const [showNewModal, setShowNewModal] = useState(false);

  function reload() {
    getModules().then(setModules);
    getLecturers().then(setLecturers);
  }
  useEffect(reload, []);

  async function handleDeleteModule(id: number) {
    try {
      await deleteModule(id);
      reload();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Something went wrong');
    }
  }

  async function handleDeleteLecturer(id: number) {
    try {
      await deleteLecturer(id);
      reload();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Something went wrong');
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-bold text-navy">Modules & Lecturers</h1>
        <button
          onClick={() => setShowNewModal(true)}
          className="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-semibold"
        >
          + New {tab === 'modules' ? 'Module' : 'Lecturer'}
        </button>
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-4">
        <TabButton active={tab === 'modules'} onClick={() => setTab('modules')}>Modules</TabButton>
        <TabButton active={tab === 'lecturers'} onClick={() => setTab('lecturers')}>Lecturers</TabButton>
      </div>

      <TableCard>
        <table className="w-full text-sm">
          {tab === 'modules' ? (
            <>
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr className="text-left text-xs font-semibold text-status-gray uppercase">
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Sessions Scheduled</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((m) => (
                  <tr key={m.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">{m.code}</td>
                    <td className="px-4 py-3">{m.name}</td>
                    <td className="px-4 py-3">{m._count.sessions}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDeleteModule(m.id)} className="text-status-red font-semibold">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </>
          ) : (
            <>
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr className="text-left text-xs font-semibold text-status-gray uppercase">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Sessions Assigned</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lecturers.map((l) => (
                  <tr key={l.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">{l.name}</td>
                    <td className="px-4 py-3">{l.email}</td>
                    <td className="px-4 py-3">{l._count.sessions}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDeleteLecturer(l.id)} className="text-status-red font-semibold">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </>
          )}
        </table>
      </TableCard>

      {showNewModal && (
        <NewItemModal
          kind={tab}
          onClose={() => setShowNewModal(false)}
          onCreated={() => { setShowNewModal(false); reload(); }}
        />
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-semibold border-b-2 ${
        active ? 'text-brand-blue border-brand-blue' : 'text-status-gray border-transparent'
      }`}
    >
      {children}
    </button>
  );
}

function NewItemModal({ kind, onClose, onCreated }: { kind: 'modules' | 'lecturers'; onClose: () => void; onCreated: () => void }) {
  const [field1, setField1] = useState('');
  const [field2, setField2] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      if (kind === 'modules') {
        await createModule({ code: field1, name: field2 });
      } else {
        await createLecturer({ name: field1, email: field2 });
      }
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={kind === 'modules' ? 'New Module' : 'New Lecturer'} onClose={onClose}>
      <label className="text-sm font-semibold text-navy block mb-1">{kind === 'modules' ? 'Module Code' : 'Full Name'}</label>
      <input className="w-full h-10 border border-gray-200 rounded-lg px-3 mb-3 text-sm" value={field1} onChange={(e) => setField1(e.target.value)} />

      <label className="text-sm font-semibold text-navy block mb-1">{kind === 'modules' ? 'Module Name' : 'Email'}</label>
      <input className="w-full h-10 border border-gray-200 rounded-lg px-3 mb-4 text-sm" value={field2} onChange={(e) => setField2(e.target.value)} />

      {error && <p className="text-status-red text-sm mb-3">{error}</p>}

      <div className="flex gap-2.5">
        <button onClick={onClose} className="flex-1 h-10 border border-gray-200 rounded-lg text-sm font-semibold">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="flex-1 h-10 bg-brand-blue text-white rounded-lg text-sm font-semibold disabled:opacity-60">
          {saving ? 'Saving…' : `Save ${kind === 'modules' ? 'Module' : 'Lecturer'}`}
        </button>
      </div>
    </Modal>
  );
}