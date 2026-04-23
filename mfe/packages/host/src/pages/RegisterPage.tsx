import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register, login } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(form);
      const res = await login({ email: form.email, password: form.password });
      await authLogin(res.data.data.accessToken, res.data.data.refreshToken);
      navigate('/dashboard');
    } catch (e: any) {
      const d = e.response?.data;
      setError(d?.error?.message ?? d?.message ?? 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-lg shadow-pink-100 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Create account</h1>
          <p className="text-gray-400 text-sm mt-1">Join GymApp today</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {([['Name','text','name','Your name'],['Email','email','email','you@example.com'],['Password','password','password','min 8 chars, uppercase + digit']] as [string,string,string,string][]).map(([label,type,key,ph]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
              <input type={type} required value={(form as any)[key]} onChange={e => setForm({...form, [key]: e.target.value})}
                className="w-full border border-pink-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm" placeholder={ph} />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
              className="w-full border border-pink-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm">
              <option value="client">Client</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold py-2.5 rounded-xl hover:opacity-90 transition disabled:opacity-60">
            {loading ? 'Creating...' : 'Register'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-400 mt-6">Have account? <Link to="/login" className="text-pink-500 font-medium hover:underline">Sign in</Link></p>
      </div>
    </div>
  );
}
