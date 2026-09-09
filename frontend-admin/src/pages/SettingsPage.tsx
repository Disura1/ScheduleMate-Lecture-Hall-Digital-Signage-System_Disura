import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { EditProfileModal } from '../components/EditProfileModal';
import { RequestProfileChangeModal } from '../components/RequestProfileChangeModal';
import { ChangePasswordModal } from '../components/ChangePasswordModal';

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
      {tab === 'accounts' && <p className="text-status-gray text-sm">Admin Accounts — coming next.</p>}
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

function getInitials(fullName?: string): string {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}