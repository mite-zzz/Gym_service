import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from 'host/stores';
import { useAuth } from 'host/AuthContext';
import { SubscriptionType, Subscription } from 'host/api/gym';
import { useLocation } from 'react-router-dom';

const ClientApp = observer(() => {
  const location = useLocation();
  const path = location.pathname;

  if (path === '/profile') return <ProfileView />;
  if (path === '/subscriptions') return <SubscriptionsView />;
  return <DashboardView />;
});

// ---- Dashboard ----
const DashboardView = observer(() => {
  const { user } = useAuth();
  const { client } = useStore();

  useEffect(() => {
    client.loadProfile();
    client.loadSubscriptions();
  }, []);

  const loading = client.profileLoading || client.subscriptionsLoading;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Hey, {user?.name}!</h1>
        <p className="text-gray-400 text-sm mt-1">Here's your fitness overview</p>
      </div>
      {loading ? <p className="text-pink-400 animate-pulse">Loading...</p> : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-pink-50">
              <p className="text-xs text-gray-400 font-medium uppercase">Status</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{client.hasProfile ? 'Active Member' : 'Not Registered'}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-pink-50">
              <p className="text-xs text-gray-400 font-medium uppercase">Total Subscriptions</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{client.subscriptions.length}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-pink-50">
              <p className="text-xs text-gray-400 font-medium uppercase">Active Plans</p>
              <p className="text-xl font-bold text-green-600 mt-1">{client.activeSubscriptions.length}</p>
            </div>
          </div>
          {client.activeSubscriptions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Active Subscriptions</h2>
              <div className="space-y-3">
                {client.activeSubscriptions.map(s => (
                  <div key={s.id} className="bg-white rounded-2xl p-4 border border-pink-50 flex items-center justify-between">
                    <div>
                      <span className="inline-block bg-pink-100 text-pink-600 text-xs font-semibold px-3 py-1 rounded-full capitalize">{s.type}</span>
                      <p className="text-sm text-gray-500 mt-1">{new Date(s.startDate).toLocaleDateString()} — {new Date(s.endDate).toLocaleDateString()}</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {client.profile && (
            <div className="mt-8 bg-white rounded-2xl p-6 border border-pink-50">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">My Profile</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs text-gray-400 uppercase">Name</p><p className="font-medium text-gray-700 mt-0.5">{client.profile.name}</p></div>
                <div><p className="text-xs text-gray-400 uppercase">Email</p><p className="font-medium text-gray-700 mt-0.5">{client.profile.email}</p></div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
});

// ---- Profile ----
const ProfileView = observer(() => {
  const { client } = useStore();
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { client.loadProfile(); }, []);
  useEffect(() => {
    if (client.profile) setForm({ name: client.profile.name, email: client.profile.email, phone: client.profile.phone ?? '' });
  }, [client.profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMessage('');
    try {
      await client.saveProfile({ name: form.name, email: form.email, phone: form.phone || undefined });
      setMessage('Profile saved successfully!');
    } catch (e: any) { setMessage(e.response?.data?.message ?? 'Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-400 text-sm mt-1">{client.hasProfile ? 'Update your information' : 'Create your gym profile'}</p>
      </div>
      {client.profileLoading ? <p className="text-pink-400 animate-pulse">Loading...</p> : (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-pink-50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
              <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full border border-pink-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="w-full border border-pink-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                className="w-full border border-pink-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm" placeholder="+7 (999) 000-00-00" />
            </div>
            {message && <p className={`text-sm text-center ${message.includes('success') ? 'text-green-500' : 'text-red-400'}`}>{message}</p>}
            <button type="submit" disabled={saving}
              className="w-full bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold py-2.5 rounded-xl hover:opacity-90 transition disabled:opacity-60">
              {saving ? 'Saving...' : client.hasProfile ? 'Save Changes' : 'Create Profile'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
});

// ---- Subscriptions ----
const BADGE: Record<SubscriptionType, string> = { monthly: 'bg-pink-100 text-pink-600', yearly: 'bg-purple-100 text-purple-600' };

const SubscriptionsView = observer(() => {
  const { client } = useStore();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'monthly' as SubscriptionType, startDate: '' });
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => { client.loadSubscriptions(); }, []);

  const resetForm = () => { setForm({ type: 'monthly', startDate: '' }); setEditId(null); setShowForm(false); setError(''); };

  const handleEdit = (s: Subscription) => {
    setForm({ type: s.type, startDate: s.startDate.slice(0, 10) });
    setEditId(s.id); setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const payload = { type: form.type, startDate: new Date(form.startDate).toISOString() };
      if (editId) { await client.editSubscription(editId, payload); }
      else { await client.addSubscription(payload); }
      resetForm();
    } catch (e: any) { setError(e.response?.data?.message ?? 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this subscription?')) return;
    await client.removeSubscription(id);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Subscriptions</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your gym plans</p>
        </div>
        {!showForm && !isAdmin && (
          <button onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-pink-400 to-pink-500 text-white text-sm font-semibold px-5 py-2 rounded-xl hover:opacity-90 transition">
            + New
          </button>
        )}
      </div>
      {showForm && !isAdmin && (
        <div className="bg-white rounded-2xl p-6 border border-pink-50 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">{editId ? 'Edit Subscription' : 'New Subscription'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value as SubscriptionType})}
                className="w-full border border-pink-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300">
                <option value="monthly">Monthly (1 month)</option>
                <option value="yearly">Yearly (1 year)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
              <input type="date" required value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})}
                className="w-full border border-pink-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300" />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="flex-1 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold py-2.5 rounded-xl hover:opacity-90 transition disabled:opacity-60">
                {saving ? 'Saving...' : editId ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={resetForm}
                className="px-5 py-2.5 rounded-xl border border-pink-200 text-sm text-gray-500 hover:bg-pink-50 transition">Cancel</button>
            </div>
          </form>
        </div>
      )}
      {client.subscriptionsLoading ? <p className="text-pink-400 animate-pulse">Loading...</p> :
        client.subscriptions.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-pink-50">
            <p className="text-gray-400">No subscriptions yet. Create your first one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {client.subscriptions.map(s => {
              const active = new Date() <= new Date(s.endDate);
              return (
                <div key={s.id} className="bg-white rounded-2xl p-4 border border-pink-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${BADGE[s.type]}`}>{s.type}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>{active ? 'Active' : 'Expired'}</span>
                      </div>
                      <p className="text-sm text-gray-500">{new Date(s.startDate).toLocaleDateString()} — {new Date(s.endDate).toLocaleDateString()}</p>
                    </div>
                    {!isAdmin && (
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(s)} className="text-xs text-pink-500 border border-pink-200 px-3 py-1.5 rounded-lg hover:bg-pink-50 transition">Edit</button>
                        <button onClick={() => handleDelete(s.id)} className="text-xs text-red-400 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">Delete</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      }
    </div>
  );
});

export default ClientApp;
