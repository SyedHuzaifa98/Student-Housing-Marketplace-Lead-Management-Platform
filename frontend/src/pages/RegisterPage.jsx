import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { Home, User, Mail, Lock, Phone, Building, AlertCircle, CheckCircle2 } from 'lucide-react';

const registerSchema = Yup.object().shape({
  role: Yup.string()
    .oneOf(['student', 'landlord'], 'Please select a valid role')
    .required('Role is required'),
  name: Yup.string()
    .trim()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  email: Yup.string()
    .trim()
    .required('Email address is required')
    .email('Please enter a valid email address'),
  phone: Yup.string()
    .nullable()
    .transform((val) => (val === '' ? null : val))
    .test('is-phone', 'Please enter a valid phone number (min 7 digits)', (val) => {
      if (!val) return true;
      return /^[+]?[\d\s\-().]{7,20}$/.test(val);
    }),
  company_name: Yup.string()
    .nullable()
    .transform((val) => (val === '' ? null : val))
    .max(150, 'Company name cannot exceed 150 characters'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirm_password: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('password')], 'Passwords do not match'),
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'student',
    phone: '',
    company_name: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
      await registerSchema.validate(formData, { abortEarly: false });
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
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone || null,
        company_name: formData.company_name || null,
      };

      const res = await register(payload);
      if (res.user.role === 'landlord') {
        navigate('/landlord/dashboard');
      } else {
        navigate('/properties');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setApiError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl text-left">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-teal-500/20">
            <Home className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Create your account</h2>
          <p className="text-xs text-slate-500 mt-1">
            Join as a student finding accommodation or a landlord listing rooms.
          </p>
        </div>

        {apiError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Role selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              I am registering as a:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleChange('role', 'student')}
                className={`py-2 rounded-xl text-xs font-bold border transition text-center ${
                  formData.role === 'student'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                🎓 Student / Tenant
              </button>

              <button
                type="button"
                onClick={() => handleChange('role', 'landlord')}
                className={`py-2 rounded-xl text-xs font-bold border transition text-center ${
                  formData.role === 'landlord'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                🏢 Landlord / Owner
              </button>
            </div>
            {errors.role && (
              <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.role}
              </p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Ali Ahmed"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition ${
                  errors.name
                    ? 'border-rose-400 focus:ring-rose-400/30'
                    : 'border-slate-200 focus:ring-teal-500'
                }`}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
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

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                placeholder="+44 7700 123456"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition ${
                  errors.phone
                    ? 'border-rose-400 focus:ring-rose-400/30'
                    : 'border-slate-200 focus:ring-teal-500'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.phone}
              </p>
            )}
          </div>

          {/* Landlord Company Name */}
          {formData.role === 'landlord' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Company / Agency Name (Optional)
              </label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Prime Student Living Ltd"
                  value={formData.company_name}
                  onChange={(e) => handleChange('company_name', e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition ${
                    errors.company_name
                      ? 'border-rose-400 focus:ring-rose-400/30'
                      : 'border-slate-200 focus:ring-teal-500'
                  }`}
                />
              </div>
              {errors.company_name && (
                <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {errors.company_name}
                </p>
              )}
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                placeholder="Min. 6 characters"
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

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                placeholder="Re-type your password"
                value={formData.confirm_password}
                onChange={(e) => handleChange('confirm_password', e.target.value)}
                className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition ${
                  errors.confirm_password
                    ? 'border-rose-400 focus:ring-rose-400/30'
                    : 'border-slate-200 focus:ring-teal-500'
                }`}
              />
            </div>
            {errors.confirm_password && (
              <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.confirm_password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-600/20 transition"
          >
            {loading ? 'Creating account...' : 'Complete Registration'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-teal-600 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
