import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { getMyProfile, getMySubscriptions, Client, Subscription } from '../api/gym';

export default function DashboardPage() {
  const { user } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([getMyProfile(), getMySubscriptions()])
      .then(([clientRes, subsRes]) => {
        if (clientRes.status === 'fulfilled') setClient(clientRes.value.data);
        if (subsRes.status === 'fulfilled') setSubs(subsRes.value.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeSubs = subs.filter((s) => s.isActive);

  return (
    <div className="min-h-screen bg-pink-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Hey, {user?.name}! 👋
            </h1>
            <p className="text-gray-400 text-sm mt-1">Here's your fitness overview</p>
          </div>
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition shadow-md shadow-purple-200"
            >
              🛡️ Admin Panel
            </Link>
          )}
        </div>

        {loading ? (
          <p className="text-pink-400 animate-pulse">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl shadow-sm shadow-pink-100 p-6 border border-pink-50">
              <div className="text-3xl mb-2">🏃</div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Status</p>
              <p className="text-xl font-bold text-gray-800 mt-1">
                {client ? 'Active Member' : 'Not Registered'}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm shadow-pink-100 p-6 border border-pink-50">
              <div className="text-3xl mb-2">📋</div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Subscriptions</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{subs.length} total</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm shadow-pink-100 p-6 border border-pink-50">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Active Plans</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{activeSubs.length}</p>
            </div>
          </div>
        )}

        {!loading && activeSubs.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Active Subscriptions</h2>
            <div className="space-y-3">
              {activeSubs.map((s) => (
                <div key={s.id} className="bg-white rounded-2xl shadow-sm shadow-pink-100 p-4 border border-pink-50 flex items-center justify-between">
                  <div>
                    <span className="inline-block bg-pink-100 text-pink-600 text-xs font-semibold px-3 py-1 rounded-full capitalize">
                      {s.type}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(s.startDate).toLocaleDateString()} → {new Date(s.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
