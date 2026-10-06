import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { Home, Lock, Mail, AlertCircle, Sparkles, Shield } from 'lucide-react';

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .required('Email address is required')
    .email('Please enter a valid email address'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSelectedRole(null);
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    try {
      await loginSchema.validate(formData, { abortEarly: false });
      setErrors({});
    } catch (validationErr) {
      if (validationErr.inner) {
        const fieldErrors = {};
        validationErr.inner.forEach((err) => {
          if (!fieldErrors[err.path]) {
            fieldErrors[err.path] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return;
    }

    setLoading(true);
    try {
      const res = await login(formData.email, formData.password);
      if (res.user.role === 'landlord') {
        navigate('/landlord/dashboard');
      } else if (res.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (res.user.role === 'student') {
        navigate('/student/inquiries');
      } else {
        navigate('/properties');
      }
    } catch (err) {
      console.error('Login error:', err);
      setApiError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = (role) => {
    setApiError('');
    setErrors({});
    setSelectedRole(role);
    if (role === 'student') {
      setFormData({
        email: 'ali.student@studenthousing.test',
        password: 'password123',
      });
    } else if (role === 'landlord') {
      setFormData({
        email: 'john.landlord@studenthousing.test',
        password: 'password123',
      });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-7 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-teal-500/20">
            <Home className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Sign in to CampusNest</h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your student inquiries or landlord CRM dashboard.
          </p>
        </div>

        {/* Demo Credentials Box - Strictly Student & Landlord */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Demo Accounts:
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Click role to auto-fill</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleSelectDemo('student')}
              className={`py-2 px-3 rounded-xl font-semibold border transition text-center ${
                selectedRole === 'student'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
              }`}
            >
              🎓 Student Demo
            </button>
            <button
              type="button"
              onClick={() => handleSelectDemo('landlord')}
              className={`py-2 px-3 rounded-xl font-semibold border transition text-center ${
                selectedRole === 'landlord'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              🏢 Landlord Demo
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Click a role to load test credentials, then click <strong>Sign In</strong> below.
          </p>
        </div>

        {apiError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4 text-left">
          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="student@example.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition ${
                  errors.email
                    ? 'border-rose-400 focus:ring-rose-400/30'
                    : 'border-slate-200 focus:ring-teal-500'
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition ${
                  errors.password
                    ? 'border-rose-400 focus:ring-rose-400/30'
                    : 'border-slate-200 focus:ring-teal-500'
                }`}
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-600/20 transition"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="space-y-3 pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
          <div>
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-teal-600 hover:underline">
              Register now
            </Link>
          </div>

          {/* Dedicated Admin Portal Notice */}
          <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <Shield className="w-3 h-3 text-purple-600" />
            <span>Platform staff or administrator?</span>
            <Link
              to="/admin/login"
              className="font-bold text-purple-700 hover:underline"
            >
              Admin Sign In &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
