import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from 'host/stores';
import { useAuth } from 'host/AuthContext';
import { ClientWithSubscriptions, SubscriptionType } from 'host/api/gym';

// ---- Stat Card ----
interface StatCardProps { label: string; value: number | string; color?: string; }
const StatCard = ({ label, value, color = 'text-gray-800' }: StatCardProps) => (
  <div className="bg-white rounded-2xl shadow-sm p-6 border border-pink-50">
    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
    <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
  </div>
);

// ---- Create User Modal ----
interface CreateUserModalProps {
  onClose: () => void;
  onSubmit: (data: { name: string; email: string; password: string; role: 'client' | 'admin' }) => Promise<void>;
}
const CreateUserModal = ({ onClose, onSubmit }: CreateUserModalProps) => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client' as 'client' | 'admin' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (e: any) {
      const d = e.response?.data;
      setError(d?.error?.message ?? d?.message ?? 'Failed to create user');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Create New User</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
            <input
              type="text" required value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full border border-pink-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email" required value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full border border-pink-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
            <input
              type="password" required value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full border border-pink-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
              placeholder="Min 8 chars, uppercase + digit"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value as 'client' | 'admin' })}
              className="w-full border border-pink-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
            >
              <option value="client">Client</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button
              type="submit" disabled={loading}
              className="flex-1 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold py-2.5 rounded-xl hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
            <button
              type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-pink-200 text-sm text-gray-500 hover:bg-pink-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---- Client Detail Panel ----
interface ClientDetailPanelProps {
  client: ClientWithSubscriptions;
  onClose: () => void;
  onAddSubscription: (clientId: string, data: { type: SubscriptionType; startDate: string }) => Promise<void>;
}
const ClientDetailPanel = ({ client, onClose, onAddSubscription }: ClientDetailPanelProps) => {
  const [showSubForm, setShowSubForm] = useState(false);
  const [subForm, setSubForm] = useState({ type: 'monthly' as SubscriptionType, startDate: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleAddSub = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await onAddSubscription(client.id, {
        type: subForm.type,
        startDate: new Date(subForm.startDate).toISOString(),
      });
      setSubForm({ type: 'monthly', startDate: '' });
      setShowSubForm(false);
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Failed to create subscription');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{client.name}</h2>
            <p className="text-sm text-gray-400">{client.email}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition text-2xl leading-none">&times;</button>
        </div>

        {/* Client info */}
        <div className="bg-pink-50 rounded-2xl p-4 mb-6">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-400 uppercase font-medium">Phone</p>
              <p className="text-gray-700 font-medium mt-0.5">{client.phone ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-medium">Member since</p>
              <p className="text-gray-700 font-medium mt-0.5">{new Date(client.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Subscriptions */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-700">Subscriptions ({client.subscriptions.length})</h3>
            {!showSubForm && (
              <button
                onClick={() => setShowSubForm(true)}
                className="text-xs bg-pink-100 text-pink-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-pink-200 transition"
              >
                + Add
              </button>
            )}
          </div>

          {showSubForm && (
            <form onSubmit={handleAddSub} className="bg-gray-50 rounded-2xl p-4 mb-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                <select
                  value={subForm.type}
                  onChange={e => setSubForm({ ...subForm, type: e.target.value as SubscriptionType })}
                  className="w-full border border-pink-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                >
                  <option value="monthly">Monthly (1 month)</option>
                  <option value="yearly">Yearly (1 year)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                <input
                  type="date" required value={subForm.startDate}
                  onChange={e => setSubForm({ ...subForm, startDate: e.target.value })}
                  className="w-full border border-pink-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="submit" disabled={saving}
                  className="flex-1 bg-gradient-to-r from-pink-400 to-pink-500 text-white text-sm font-semibold py-2 rounded-xl hover:opacity-90 transition disabled:opacity-60"
                >
                  {saving ? 'Adding...' : 'Add Subscription'}
                </button>
                <button
                  type="button" onClick={() => { setShowSubForm(false); setError(''); }}
                  className="px-4 py-2 rounded-xl border border-pink-200 text-xs text-gray-500 hover:bg-pink-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {client.subscriptions.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">No subscriptions yet</div>
          ) : (
            <div className="space-y-2">
              {client.subscriptions.map(s => {
                const active = new Date() <= new Date(s.endDate);
                return (
                  <div key={s.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                          s.type === 'monthly' ? 'bg-pink-100 text-pink-600' : 'bg-purple-100 text-purple-600'
                        }`}>{s.type}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          active ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'
                        }`}>{active ? 'Active' : 'Expired'}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(s.startDate).toLocaleDateString()} — {new Date(s.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// ---- Main Admin App ----
const AdminApp = observer(() => {
  const { admin } = useStore();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientWithSubscriptions | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    admin.loadClients();
  }, []);

  const filteredClients = admin.clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    setDeleteLoading(true);
    try {
      await admin.deleteClient(id);
      setDeleteConfirm(null);
      if (selectedClient?.id === id) setSelectedClient(null);
    } catch {}
    finally { setDeleteLoading(false); }
  };

  const handleCreateUser = async (data: { name: string; email: string; password: string; role: 'client' | 'admin' }) => {
    await admin.createUser(data);
  };

  const handleAddSubscription = async (clientId: string, data: { type: SubscriptionType; startDate: string }) => {
    await admin.createSubscriptionForClient(clientId, data);
    // refresh selected client from updated store
    const updated = admin.getClientById(clientId);
    if (updated) setSelectedClient(updated);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-gray-400 text-sm mt-1">Manage gym clients and subscriptions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-pink-400 to-pink-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition shadow-sm shadow-pink-200"
        >
          + Create User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Clients" value={admin.totalClients} />
        <StatCard label="Active Subscriptions" value={admin.totalActiveSubscriptions} color="text-green-600" />
        <StatCard label="No Subscription" value={admin.clientsWithoutSubscriptions} color="text-orange-500" />
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-pink-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm bg-white"
        />
      </div>

      {/* Error */}
      {admin.error && (
        <div className="bg-red-50 border border-red-200 text-red-500 rounded-xl px-4 py-3 mb-4 text-sm">
          {admin.error}
          <button onClick={() => admin.loadClients(true)} className="ml-3 underline">Retry</button>
        </div>
      )}

      {/* Client Table */}
      {admin.loading ? (
        <div className="bg-white rounded-2xl border border-pink-50 p-12 text-center">
          <p className="text-pink-400 animate-pulse text-lg">Loading clients...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-pink-50 p-12 text-center">
          <p className="text-gray-400">
            {search ? 'No clients match your search.' : 'No clients yet. Create the first one!'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-pink-50 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase px-6 py-3">Client</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase px-6 py-3 hidden md:table-cell">Phone</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase px-6 py-3">Subscriptions</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase px-6 py-3 hidden sm:table-cell">Member Since</th>
                <th className="text-right text-xs font-semibold text-gray-400 uppercase px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredClients.map(client => {
                const activeCount = client.subscriptions.filter(s => new Date() <= new Date(s.endDate)).length;
                return (
                  <tr key={client.id} className="hover:bg-pink-50/30 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{client.name}</p>
                        <p className="text-xs text-gray-400">{client.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <p className="text-sm text-gray-500">{client.phone ?? '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">{client.subscriptions.length}</span>
                        {activeCount > 0 && (
                          <span className="text-xs bg-green-100 text-green-600 font-semibold px-2 py-0.5 rounded-full">
                            {activeCount} active
                          </span>
                        )}
                        {client.subscriptions.length === 0 && (
                          <span className="text-xs bg-orange-100 text-orange-500 font-semibold px-2 py-0.5 rounded-full">none</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <p className="text-sm text-gray-500">{new Date(client.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedClient(client)}
                          className="text-xs text-pink-500 border border-pink-200 px-3 py-1.5 rounded-lg hover:bg-pink-50 transition font-medium"
                        >
                          Manage
                        </button>
                        {deleteConfirm === client.id ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleDelete(client.id)}
                              disabled={deleteLoading}
                              className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition disabled:opacity-60"
                            >
                              {deleteLoading ? '...' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="text-xs border border-gray-200 text-gray-500 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(client.id)}
                            className="text-xs text-red-400 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-50 transition font-medium"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateUser}
        />
      )}

      {selectedClient && (
        <ClientDetailPanel
          client={admin.getClientById(selectedClient.id) ?? selectedClient}
          onClose={() => setSelectedClient(null)}
          onAddSubscription={handleAddSubscription}
        />
      )}
    </div>
  );
});

export default AdminApp;
