import { useEffect, useState } from 'react';
import {
  getModules, createModule, deleteModule,
  getLecturers, createLecturer, deleteLecturer,
  type ModuleItem, type LecturerItem,
} from '../api/academic';
import { Modal } from '../components/Modal';
import { ApiError } from '../lib/apiClient';
import { TableCard } from '../components/TableCard';
import { updateModule, updateLecturer } from '../api/academic';
import { ConfirmModal } from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';

export function AcademicPage() {
  const [tab, setTab] = useState<'modules' | 'lecturers'>('modules');
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [lecturers, setLecturers] = useState<LecturerItem[]>([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [search, setSearch] = useState('');
  const [editingModule, setEditingModule] = useState<ModuleItem | null>(null);
  const [editingLecturer, setEditingLecturer] = useState<LecturerItem | null>(null);
  const [deletingModule, setDeletingModule] = useState<ModuleItem | null>(null);
  const [deletingLecturer, setDeletingLecturer] = useState<LecturerItem | null>(null);
  const { showSuccess } = useToast();

  function reload() {
    getModules().then(setModules);
    getLecturers().then(setLecturers);
  }
  useEffect(reload, []);

  const filteredModules = modules.filter((m) => m.code.toLowerCase().includes(search.toLowerCase()) || m.name.toLowerCase().includes(search.toLowerCase()));
  const filteredLecturers = lecturers.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()) || l.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-bold text-navy">Modules & Lecturers</h1>
        <button
          onClick={() => setShowFormModal(true)}
          className="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-semibold"
        >
          + New {tab === 'modules' ? 'Module' : 'Lecturer'}
        </button>
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-4">
        <TabButton active={tab === 'modules'} onClick={() => setTab('modules')}>Modules</TabButton>
        <TabButton active={tab === 'lecturers'} onClick={() => setTab('lecturers')}>Lecturers</TabButton>
      </div>

      <div className="relative mb-4 max-w-70">
        <input
          className="w-full h-9 border border-gray-200 rounded-lg pl-3 pr-9 text-sm"
          placeholder={`Search ${tab === 'modules' ? 'modules' : 'lecturers'}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-status-gray text-sm leading-none"
          >
            ✕
          </button>
        )}
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
                {filteredModules.map((m) => (
                  <tr key={m.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">{m.code}</td>
                    <td className="px-4 py-3">{m.name}</td>
                    <td className="px-4 py-3">{m._count.sessions}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setEditingModule(m)} className="text-brand-blue font-semibold mr-3">Edit</button>
                      <button onClick={() => setDeletingModule(m)} className="text-status-red font-semibold">Delete</button>
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
                {filteredLecturers.map((l) => (
                  <tr key={l.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">{l.name}</td>
                    <td className="px-4 py-3">{l.email}</td>
                    <td className="px-4 py-3">{l._count.sessions}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setEditingLecturer(l)} className="text-brand-blue font-semibold mr-3">Edit</button>
                      <button onClick={() => setDeletingLecturer(l)} className="text-status-red font-semibold">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </>
          )}
        </table>
      </TableCard>

      {showFormModal && (
        <ItemFormModal kind={tab} onClose={() => setShowFormModal(false)} onSaved={() => { setShowFormModal(false); reload(); showSuccess('Item created successfully.'); }} />
      )}
      {editingModule && (
        <ItemFormModal kind="modules" existingModule={editingModule} onClose={() => setEditingModule(null)} onSaved={() => { setEditingModule(null); reload(); showSuccess('Module updated successfully.'); }} />
      )}
      {editingLecturer && (
        <ItemFormModal kind="lecturers" existingLecturer={editingLecturer} onClose={() => setEditingLecturer(null)} onSaved={() => { setEditingLecturer(null); reload(); showSuccess('Lecturer updated successfully.'); }} />
      )}
      {deletingModule && (
        <ConfirmModal
          title="Delete this module?"
          subtitle={`${deletingModule.code} — ${deletingModule.name}`}
          confirmLabel="Delete Module"
          onClose={() => setDeletingModule(null)}
          onConfirm={async () => { await deleteModule(deletingModule.id); setDeletingModule(null); reload(); showSuccess('Module deleted successfully.'); }} />
      )}
      {deletingLecturer && (
        <ConfirmModal
          title="Delete this lecturer?"
          subtitle={deletingLecturer.name}
          confirmLabel="Delete Lecturer"
          onClose={() => setDeletingLecturer(null)}
          onConfirm={async () => { await deleteLecturer(deletingLecturer.id); setDeletingLecturer(null); reload(); showSuccess('Lecturer deleted successfully.'); }} />
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

function ItemFormModal({
  kind, existingModule, existingLecturer, onClose, onSaved,
}: {
  kind: 'modules' | 'lecturers';
  existingModule?: ModuleItem;
  existingLecturer?: LecturerItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!(existingModule || existingLecturer);
  const [field1, setField1] = useState(existingModule?.code ?? existingLecturer?.name ?? '');
  const [field2, setField2] = useState(existingModule?.name ?? existingLecturer?.email ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      if (kind === 'modules') {
        if (isEdit && existingModule) await updateModule(existingModule.id, { code: field1, name: field2 });
        else await createModule({ code: field1, name: field2 });
      } else {
        if (isEdit && existingLecturer) await updateLecturer(existingLecturer.id, { name: field1, email: field2 });
        else await createLecturer({ name: field1, email: field2 });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  const title = isEdit
    ? `Edit ${kind === 'modules' ? 'Module' : 'Lecturer'}`
    : `New ${kind === 'modules' ? 'Module' : 'Lecturer'}`;

  return (
    <Modal title={title} onClose={onClose}>
      <label className="text-sm font-semibold text-navy block mb-1">{kind === 'modules' ? 'Module Code' : 'Full Name'}</label>
      <input className="w-full h-10 border border-gray-200 rounded-lg px-3 mb-3 text-sm" value={field1} onChange={(e) => setField1(e.target.value)} />

      <label className="text-sm font-semibold text-navy block mb-1">{kind === 'modules' ? 'Module Name' : 'Email'}</label>
      <input className="w-full h-10 border border-gray-200 rounded-lg px-3 mb-4 text-sm" value={field2} onChange={(e) => setField2(e.target.value)} />

      {error && <div className="bg-status-red-bg text-status-red text-sm rounded-lg p-3 mb-4">{error}</div>}

      <div className="flex gap-2.5">
        <button onClick={onClose} className="flex-1 h-10 border border-gray-200 rounded-lg text-sm font-semibold">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="flex-1 h-10 bg-brand-blue text-white rounded-lg text-sm font-semibold disabled:opacity-60">
          {saving ? 'Saving…' : `Save ${kind === 'modules' ? 'Module' : 'Lecturer'}`}
        </button>
      </div>
    </Modal>
  );
}