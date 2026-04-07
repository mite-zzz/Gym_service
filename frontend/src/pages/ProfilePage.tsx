import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getMyProfile, createProfile, updateProfile, Client } from '../api/gym';

export default function ProfilePage() {
  const [client, setClient] = useState<Client | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    getMyProfile()
      .then((res) => {
        setClient(res.data);
        setForm({ name: res.data.name, email: res.data.email, phone: res.data.phone ?? '' });
      })
      .catch((e) => {
        if (e.response?.status === 404) setIsNew(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const data = { name: form.name, email: form.email, phone: form.phone || undefined };
      const res = isNew ? await createProfile(data) : await updateProfile(data);
      setClient(res.data);
      setIsNew(false);
      setMessage('Profile saved successfully!');
    } catch (e: any) {
      setMessage(e.response?.data?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-400 text-sm mt-1">
            {isNew ? 'Create your gym profile' : 'Update your information'}
          </p>
        </div>

        {loading ? (
          <p className="text-pink-400 animate-pulse">Loading...</p>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm shadow-pink-100 p-6 border border-pink-50">
            {client && (
              <div className="mb-6 p-4 bg-pink-50 rounded-xl">
                <p className="text-xs text-gray-400 font-medium">Member since</p>
                <p className="text-sm font-semibold text-gray-700">{new Date(client.createdAt).toLocaleDateString()}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                <input
                  type="text" required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-pink-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <input
                  type="email" required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-pink-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-pink-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                  placeholder="+7 (999) 000-00-00"
                />
              </div>
              {message && (
                <p className={`text-sm text-center ${message.includes('success') ? 'text-green-500' : 'text-red-400'}`}>
                  {message}
                </p>
              )}
              <button
                type="submit" disabled={saving}
                className="w-full bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold py-2.5 rounded-xl hover:opacity-90 transition disabled:opacity-60"
              >
                {saving ? 'Saving...' : isNew ? 'Create Profile' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
