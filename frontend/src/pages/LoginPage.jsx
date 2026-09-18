import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await login(email, password);
      if (res.user.role === 'landlord') navigate('/landlord/dashboard');
      else if (res.user.role === 'admin') navigate('/admin/dashboard');
      else if (res.user.role === 'student') navigate('/student/inquiries');
      else navigate('/properties');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = (role) => {
    setError('');
    setSelectedRole(role);
    if (role === 'student') {
      setEmail('ali.student@studenthousing.test');
      setPassword('password123');
    } else if (role === 'landlord') {
      setEmail('john.landlord@studenthousing.test');
      setPassword('password123');
    } else if (role === 'admin') {
      setEmail('admin@studenthousing.test');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-teal-500/20">
            <Home className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Sign in to CampusNest</h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your student inquiries or landlord CRM dashboard.
          </p>
        </div>

        {/* Demo Credentials Box */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Demo Accounts:
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Click role to fill</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleSelectDemo('student')}
              className={`py-1.5 px-2 rounded-lg font-semibold border transition text-center ${
                selectedRole === 'student'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
              }`}
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => handleSelectDemo('landlord')}
              className={`py-1.5 px-2 rounded-lg font-semibold border transition text-center ${
                selectedRole === 'landlord'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              🏢 Landlord
            </button>
            <button
              type="button"
              onClick={() => handleSelectDemo('admin')}
              className={`py-1.5 px-2 rounded-lg font-semibold border transition text-center ${
                selectedRole === 'admin'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
              }`}
            >
              🛡️ Admin
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Click any role above to populate credentials, then click <strong>Sign In</strong> below.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="student@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSelectedRole(null);
                }}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setSelectedRole(null);
                }}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-600/20 transition"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-teal-600 hover:underline">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
}

