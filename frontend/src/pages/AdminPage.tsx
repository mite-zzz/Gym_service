import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { adminGetAllClients, adminDeleteClient, adminCreateSubscription, ClientWithSubscriptions } from '../api/gym';
import { SubscriptionType } from '../api/gym';

export default function AdminPage() {
  const [clients, setClients] = useState<ClientWithSubscriptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientWithSubscriptions | null>(null);
  const [search, setSearch] = useState('');

  const [subForm, setSubForm] = useState({ type: 'monthly' as SubscriptionType, startDate: '' });
  const [subSaving, setSubSaving] = useState(false);
  const [subError, setSubError] = useState('');
  const [subSuccess, setSubSuccess] = useState('');

  const load = () => {
    setLoading(true);
    adminGetAllClients()
      .then((res) => {
        setClients(res.data);
        if (selectedClient) {
          const updated = res.data.find((c) => c.id === selectedClient.id);
          if (updated) setSelectedClient(updated);
        }
      })
      .catch(() => setError('Failed to load clients'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete client "${name}" and all their subscriptions?`)) return;
    setDeletingId(id);
    try {
      await adminDeleteClient(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
      if (selectedClient?.id === id) setSelectedClient(null);
    } catch {
      alert('Failed to delete client');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    setSubSaving(true);
    setSubError('');
    setSubSuccess('');
    try {
      await adminCreateSubscription(selectedClient.id, {
        type: subForm.type,
        startDate: new Date(subForm.startDate).toISOString(),
      });
      setSubSuccess('Subscription created successfully');
      setSubForm({ type: 'monthly', startDate: '' });
      load();
    } catch (e: any) {
      setSubError(e.response?.data?.message ?? 'Failed to create subscription');
    } finally {
      setSubSaving(false);
    }
  };

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  );

  const totalActive = clients.reduce(
    (acc, c) => acc + c.subscriptions.filter((s) => new Date() <= new Date(s.endDate)).length,
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
            <p className="text-gray-400 text-sm mt-1">Manage gym clients and subscriptions</p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition shadow-sm"
          >
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 uppercase font-medium mb-1">Total clients</p>
            <p className="text-3xl font-bold text-gray-800">{clients.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 uppercase font-medium mb-1">Active subscriptions</p>
            <p className="text-3xl font-bold text-green-600">{totalActive}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 uppercase font-medium mb-1">No subscription</p>
            <p className="text-3xl font-bold text-orange-500">
              {clients.filter((c) => c.subscriptions.length === 0).length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>

        {loading && <div className="text-center py-16 text-pink-400 animate-pulse text-lg">Loading...</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 text-sm">{error}</div>}

        {!loading && !error && (
          <div className="flex gap-6">
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  {search ? 'Nothing found' : 'No registered clients'}
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-xs border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left">Client</th>
                      <th className="px-4 py-3 text-left">Phone</th>
                      <th className="px-4 py-3 text-center">Subscriptions</th>
                      <th className="px-4 py-3 text-left">Member since</th>
                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((client) => {
                      const activeSubs = client.subscriptions.filter((s) => new Date() <= new Date(s.endDate)).length;
                      const isSelected = selectedClient?.id === client.id;
                      return (
                        <tr
                          key={client.id}
                          onClick={() => {
                            setSelectedClient(isSelected ? null : client);
                            setSubError('');
                            setSubSuccess('');
                            setSubForm({ type: 'monthly', startDate: '' });
                          }}
                          className={`cursor-pointer transition ${isSelected ? 'bg-pink-50' : 'hover:bg-gray-50'}`}
                        >
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-800">{client.name}</div>
                            <div className="text-xs text-gray-400">{client.email}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-500">{client.phone ?? '—'}</td>
                          <td className="px-4 py-3 text-center">
                            {activeSubs > 0 ? (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                {activeSubs} active
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full text-xs">none</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs">
                            {new Date(client.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(client.id, client.name); }}
                              disabled={deletingId === client.id}
                              className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-medium hover:bg-red-200 transition disabled:opacity-50"
                            >
                              {deletingId === client.id ? '...' : 'Delete'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {selectedClient && (
              <div className="w-80 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-5 self-start">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">{selectedClient.name}</h3>
                  <button onClick={() => setSelectedClient(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-gray-700 break-all">{selectedClient.email}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="text-gray-700">{selectedClient.phone ?? '—'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-400">Member since</p>
                    <p className="text-gray-700">{new Date(selectedClient.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase font-medium mb-2">
                    Subscriptions ({selectedClient.subscriptions.length})
                  </p>
                  {selectedClient.subscriptions.length === 0 ? (
                    <p className="text-sm text-gray-400">No subscriptions</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedClient.subscriptions.map((sub) => {
                        const active = new Date() <= new Date(sub.endDate);
                        return (
                          <div key={sub.id} className="p-3 border border-gray-100 rounded-xl text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className={`px-2 py-0.5 rounded-full font-medium ${sub.type === 'monthly' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                {sub.type === 'monthly' ? 'Monthly' : 'Yearly'}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full ${active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {active ? 'Active' : 'Expired'}
                              </span>
                            </div>
                            <p className="text-gray-500">
                              {new Date(sub.startDate).toLocaleDateString()} — {new Date(sub.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-400 uppercase font-medium mb-3">Add subscription</p>
                  <form onSubmit={handleCreateSub} className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Type</label>
                      <select
                        value={subForm.type}
                        onChange={(e) => setSubForm({ ...subForm, type: e.target.value as SubscriptionType })}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                      >
                        <option value="monthly">Monthly (1 month)</option>
                        <option value="yearly">Yearly (1 year)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Start date</label>
                      <input
                        type="date"
                        required
                        value={subForm.startDate}
                        onChange={(e) => setSubForm({ ...subForm, startDate: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                      />
                    </div>
                    {subError && <p className="text-red-400 text-xs">{subError}</p>}
                    {subSuccess && <p className="text-green-500 text-xs">{subSuccess}</p>}
                    <button
                      type="submit"
                      disabled={subSaving}
                      className="w-full py-2 bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                    >
                      {subSaving ? 'Creating...' : 'Create subscription'}
                    </button>
                  </form>
                </div>

                <button
                  onClick={() => handleDelete(selectedClient.id, selectedClient.name)}
                  disabled={deletingId === selectedClient.id}
                  className="w-full py-2 bg-red-100 text-red-600 rounded-xl text-sm font-medium hover:bg-red-200 transition disabled:opacity-50"
                >
                  {deletingId === selectedClient.id ? 'Deleting...' : 'Delete client'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
