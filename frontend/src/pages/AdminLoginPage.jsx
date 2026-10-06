import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, AlertCircle, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';

const adminLoginSchema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .required('Admin email address is required')
    .email('Please enter a valid email address'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, logout } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [demoSelected, setDemoSelected] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setDemoSelected(false);
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleSelectAdminDemo = () => {
    setApiError('');
    setErrors({});
    setFormData({
      email: 'admin@studenthousing.test',
      password: 'password123',
    });
    setDemoSelected(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    try {
      await adminLoginSchema.validate(formData, { abortEarly: false });
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
      if (res.user.role !== 'admin') {
        await logout();
        setApiError('Access denied: Administrator privileges required to access this portal.');
        return;
      }
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Admin login error:', err);
      setApiError(err.message || 'Invalid administrator credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Security Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white flex items-center justify-center mx-auto mb-4 shadow-xl shadow-purple-900/30 border border-purple-500/30">
            <Shield className="w-7 h-7 text-purple-200" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-900/40 border border-purple-700/50 text-purple-300">
            <KeyRound className="w-3 h-3 text-purple-400" />
            Restricted Admin Portal
          </span>
          <h1 className="text-2xl font-black text-white mt-3 tracking-tight">
            CampusNest Operations & Staff
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto">
            Authorized administrators, content moderators, and platform compliance team only.
          </p>
        </div>

        {/* Card */}
        <div className="mt-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl text-left space-y-6">
          {/* Quick Demo Fill */}
          <div className="bg-purple-950/40 border border-purple-800/40 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                🛡️ Super Admin Demo
              </span>
              <button
                type="button"
                onClick={handleSelectAdminDemo}
                className="text-[11px] font-semibold text-purple-300 hover:text-purple-100 bg-purple-800/50 hover:bg-purple-800 px-2.5 py-1 rounded-lg border border-purple-600/40 transition"
              >
                Auto-fill credentials
              </button>
            </div>
            <p className="text-[11px] text-purple-300/80">
              Prefills <code className="text-purple-200 font-mono text-[10px]">admin@studenthousing.test</code> for moderation & metric review.
            </p>
            {demoSelected && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Admin credentials populated. Click Sign In below.
              </div>
            )}
          </div>

          {apiError && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  placeholder="admin@campusnest.internal"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border bg-slate-950 text-white placeholder-slate-500 transition focus:outline-none focus:ring-2 ${
                    errors.email
                      ? 'border-rose-500 focus:ring-rose-500/40'
                      : 'border-slate-800 focus:border-purple-500 focus:ring-purple-500/30'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-[11px] text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Console Security Key / Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border bg-slate-950 text-white placeholder-slate-500 transition focus:outline-none focus:ring-2 ${
                    errors.password
                      ? 'border-rose-500 focus:ring-rose-500/40'
                      : 'border-slate-800 focus:border-purple-500 focus:ring-purple-500/30'
                  }`}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-[11px] text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-900/30 transition flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              {loading ? 'Authenticating Admin...' : 'Authenticate & Enter Console'}
            </button>
          </form>

          {/* Security Notice & Back link */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col items-center gap-3 text-center">
            <p className="text-[10px] text-slate-500">
              🔒 256-bit SSL encrypted. Access attempts are audited and logged for compliance.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Public Marketplace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
