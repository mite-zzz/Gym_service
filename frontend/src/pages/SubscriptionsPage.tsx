import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import {
  getMySubscriptions, createSubscription, updateSubscription,
  deleteSubscription, Subscription, SubscriptionType,
} from '../api/gym';

const BADGE: Record<SubscriptionType, string> = {
  monthly: 'bg-pink-100 text-pink-600',
  yearly: 'bg-purple-100 text-purple-600',
};

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'monthly' as SubscriptionType, startDate: '', endDate: '', isActive: true });
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = () =>
    getMySubscriptions()
      .then((r) => setSubs(r.data))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ type: 'monthly', startDate: '', endDate: '', isActive: true });
    setEditId(null);
    setShowForm(false);
    setError('');
  };

  const handleEdit = (s: Subscription) => {
    setForm({
      type: s.type,
      startDate: s.startDate.slice(0, 10),
      endDate: s.endDate.slice(0, 10),
      isActive: s.isActive,
    });
    setEditId(s.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        type: form.type,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        isActive: form.isActive,
      };
      if (editId) {
        await updateSubscription(editId, payload);
      } else {
        await createSubscription(payload);
      }
      await load();
      resetForm();
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this subscription?')) return;
    await deleteSubscription(id);
    setSubs((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-pink-50">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Subscriptions</h1>
            <p className="text-gray-400 text-sm mt-1">Manage your gym plans</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-pink-400 to-pink-500 text-white text-sm font-semibold px-5 py-2 rounded-xl hover:opacity-90 transition"
            >
              + New
            </button>
          )}
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm shadow-pink-100 p-6 border border-pink-50 mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              {editId ? 'Edit Subscription' : 'New Subscription'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as SubscriptionType })}
                  className="w-full border border-pink-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date" required
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full border border-pink-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">End Date</label>
                  <input
                    type="date" required
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full border border-pink-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="accent-pink-500 w-4 h-4"
                />
                Active
              </label>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-3">
                <button
                  type="submit" disabled={saving}
                  className="flex-1 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold py-2.5 rounded-xl hover:opacity-90 transition disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editId ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-xl border border-pink-200 text-sm text-gray-500 hover:bg-pink-50 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-pink-400 animate-pulse">Loading...</p>
        ) : subs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm shadow-pink-100 p-10 text-center border border-pink-50">
            <div className="text-4xl mb-3">🌸</div>
            <p className="text-gray-400">No subscriptions yet. Create your first one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {subs.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl shadow-sm shadow-pink-100 p-4 border border-pink-50">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${BADGE[s.type]}`}>
                        {s.type}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(s.startDate).toLocaleDateString()} → {new Date(s.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(s)}
                      className="text-xs text-pink-500 border border-pink-200 px-3 py-1.5 rounded-lg hover:bg-pink-50 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-xs text-red-400 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
