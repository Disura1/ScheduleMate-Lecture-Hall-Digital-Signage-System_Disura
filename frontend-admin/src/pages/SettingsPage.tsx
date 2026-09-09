import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { EditProfileModal } from '../components/EditProfileModal';
import { RequestProfileChangeModal } from '../components/RequestProfileChangeModal';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { getAdminAccounts, deactivateAccount, reactivateAccount, type AdminAccount } from '../api/adminAccounts';
import { NewAdminModal } from '../components/NewAdminModal';
import { EditAdminModal } from '../components/EditAdminModal';
import { ApiError } from '../lib/apiClient';

type Tab = 'profile' | 'accounts' | 'requests';

export function SettingsPage() {
  const { admin } = useAuth();
  const [tab, setTab] = useState<Tab>('profile');
  const isSuperAdmin = admin?.role === 'SUPER_ADMIN';

  return (
    <div>
      <h1 className="text-xl font-bold text-navy mb-5">Settings</h1>

      <div className="flex gap-1 border-b border-gray-200 mb-4">
        <TabButton active={tab === 'profile'} onClick={() => setTab('profile')}>My Profile</TabButton>
        {isSuperAdmin && <TabButton active={tab === 'accounts'} onClick={() => setTab('accounts')}>Admin Accounts</TabButton>}
        {isSuperAdmin && <TabButton active={tab === 'requests'} onClick={() => setTab('requests')}>Pending Requests</TabButton>}
      </div>

      {tab === 'profile' && <MyProfileTab isSuperAdmin={isSuperAdmin} />}
      {tab === 'accounts' && <AdminAccountsTab />}
      {tab === 'requests' && <p className="text-status-gray text-sm">Pending Requests — coming next.</p>}
    </div>
  );
}

function MyProfileTab({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const { admin } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm p-7 max-w-lg">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-sidebar-navy flex items-center justify-center text-lg font-semibold text-white">
          {getInitials(admin?.fullName)}
        </div>
        <div>
          <div className="text-base font-bold text-navy">{admin?.fullName}</div>
          <div className="text-sm text-status-gray">{admin?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'} · {admin?.username}</div>
        </div>
      </div>

      <div className="text-xs font-semibold text-status-gray uppercase mb-1">
        Full Name {!isSuperAdmin && <span className="normal-case font-normal text-gray-400">(read-only)</span>}
      </div>
      <div className="text-sm text-navy mb-4">{admin?.fullName}</div>

      <div className="text-xs font-semibold text-status-gray uppercase mb-1">
        Email {!isSuperAdmin && <span className="normal-case font-normal text-gray-400">(read-only)</span>}
      </div>
      <div className="text-sm text-navy mb-5">{admin?.email}</div>

      {!isSuperAdmin && (
        <p className="text-xs text-status-gray mb-4">To change your name or email, submit a request — a Super Admin must approve it.</p>
      )}
      {isSuperAdmin && (
        <div className="bg-brand-blue/10 text-brand-blue text-xs rounded-lg p-3 mb-5">
          As a Super Admin, you can edit your own name and email directly — no approval needed.
        </div>
      )}

      <div className="flex gap-2.5">
        {isSuperAdmin ? (
          <button onClick={() => setShowEditModal(true)} className="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-semibold">
            Edit Profile
          </button>
        ) : (
          <button onClick={() => setShowRequestModal(true)} className="border border-brand-blue text-brand-blue px-4 py-2 rounded-lg text-sm font-semibold">
            Request Profile Change
          </button>
        )}
        <button onClick={() => setShowPasswordModal(true)} className="border border-gray-200 text-status-gray px-4 py-2 rounded-lg text-sm font-semibold">
          Change Password
        </button>
      </div>

      {showEditModal && <EditProfileModal onClose={() => setShowEditModal(false)} onSaved={() => setShowEditModal(false)} />}
      {showRequestModal && <RequestProfileChangeModal onClose={() => setShowRequestModal(false)} onSubmitted={() => setShowRequestModal(false)} />}
      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-semibold border-b-2 ${active ? 'text-brand-blue border-brand-blue' : 'text-status-gray border-transparent'}`}
    >
      {children}
    </button>
  );
}

function AdminAccountsTab() {
  const { admin: currentAdmin } = useAuth();
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AdminAccount | null>(null);

  function reload() {
    setLoading(true);
    getAdminAccounts().then(setAccounts).finally(() => setLoading(false));
  }
  useEffect(reload, []);

  async function handleDeactivate(id: number) {
    if (!confirm('Deactivate this admin account? This blocks login immediately.')) return;
    try {
      await deactivateAccount(id);
      reload();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Something went wrong');
    }
  }

  async function handleReactivate(id: number) {
    try {
      await reactivateAccount(id);
      reload();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Something went wrong');
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-status-gray">Only Super Admins can create, edit, deactivate, or reactivate admin accounts.</p>
        <button onClick={() => setShowNewModal(true)} className="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-semibold">
          + New Admin Account
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-semibold text-status-gray uppercase">
              <th className="px-4 py-3">Full Name</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-status-gray">Loading…</td></tr>
            ) : (
              accounts.map((a) => {
                const isSelf = a.id === currentAdmin?.id;
                return (
                  <tr key={a.id} className={`border-t border-gray-100 ${isSelf ? 'bg-blue-50/40' : ''} ${a.status === 'DEACTIVATED' ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3">
                      {a.fullName}
                      {isSelf && <span className="ml-2 bg-brand-blue/10 text-brand-blue text-[10px] font-bold px-1.5 py-0.5 rounded">YOU</span>}
                    </td>
                    <td className="px-4 py-3">{a.username}</td>
                    <td className="px-4 py-3">{a.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${a.role === 'SUPER_ADMIN' ? 'bg-brand-blue/10 text-brand-blue' : 'bg-status-gray-bg text-status-gray'}`}>
                        {a.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${a.status === 'ACTIVE' ? 'bg-status-green-bg text-status-green' : 'bg-status-red-bg text-status-red'}`}>
                        {a.status === 'ACTIVE' ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-4 py-3 space-x-3">
                      {isSelf ? (
                        <span className="text-xs text-gray-400">Manage from My Profile</span>
                      ) : (
                        <>
                          <button onClick={() => setEditingAccount(a)} className="text-brand-blue font-semibold">Edit</button>
                          {a.status === 'ACTIVE' ? (
                            <button onClick={() => handleDeactivate(a.id)} className="text-status-red font-semibold">Deactivate</button>
                          ) : (
                            <button onClick={() => handleReactivate(a.id)} className="text-status-green font-semibold">Activate</button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-status-gray mt-3">
        A deactivated account cannot log in. Reactivating restores access immediately without resetting the password. A Super Admin cannot deactivate their own account.
      </p>

      {showNewModal && <NewAdminModal onClose={() => setShowNewModal(false)} onCreated={() => { setShowNewModal(false); reload(); }} />}
      {editingAccount && <EditAdminModal target={editingAccount} onClose={() => setEditingAccount(null)} onSaved={() => { setEditingAccount(null); reload(); }} />}
    </div>
  );
}

function getInitials(fullName?: string): string {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}