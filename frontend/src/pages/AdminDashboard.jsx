import React, { useState, useEffect } from 'react';
import { Shield, Users, Building2, CheckCircle2, Star, Eye, AlertCircle } from 'lucide-react';
import apiClient from '../api/client';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('properties');
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const [statsRes, propsRes, usersRes] = await Promise.all([
        apiClient('/admin/stats'),
        apiClient('/admin/properties'),
        apiClient('/admin/users'),
      ]);
      setStats(statsRes);
      setProperties(propsRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      console.error('Admin data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleFeature = async (propId) => {
    try {
      await apiClient(`/admin/properties/${propId}/feature`, { method: 'PATCH' });
      fetchAdminData();
    } catch (err) {
      console.error('Toggle feature error:', err);
    }
  };

  const handleUpdateVisibility = async (propId, visibility) => {
    try {
      await apiClient(`/admin/properties/${propId}/visibility`, {
        method: 'PATCH',
        body: { visibility },
      });
      fetchAdminData();
    } catch (err) {
      console.error('Visibility update error:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
          Super Admin Console
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
          Platform Governance & Moderation
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor marketplace metrics, moderate student listings, and oversee user activity.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Total Users</span>
          <span className="text-2xl font-black text-slate-900">{stats?.total_users || 0}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Landlords</span>
          <span className="text-2xl font-black text-emerald-600">{stats?.total_landlords || 0}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Students</span>
          <span className="text-2xl font-black text-blue-600">{stats?.total_students || 0}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Listings</span>
          <span className="text-2xl font-black text-slate-900">{stats?.total_properties || 0}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Inquiries Dispatched</span>
          <span className="text-2xl font-black text-purple-600">{stats?.total_inquiries || 0}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('properties')}
          className={`pb-3 text-sm font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'properties'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Listings Moderation ({properties.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          Registered Users ({users.length})
        </button>
      </div>

      {/* TAB 1: PROPERTIES MODERATION */}
      {activeTab === 'properties' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Listing Title</th>
                  <th className="py-3 px-4">Landlord</th>
                  <th className="py-3 px-4">University</th>
                  <th className="py-3 px-4">Price / Mo</th>
                  <th className="py-3 px-4">Featured</th>
                  <th className="py-3 px-4">Visibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {properties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-bold text-slate-900 max-w-xs truncate">
                      <Link
                        to={`/properties/${prop.slug || prop.id}`}
                        className="hover:text-teal-600"
                      >
                        {prop.title}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {prop.landlord?.name || 'Unknown'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {prop.university?.name || 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      ${Math.round(prop.price_per_month)}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleFeature(prop.id)}
                        className={`p-1.5 rounded-lg border transition ${
                          prop.is_featured
                            ? 'bg-amber-100 border-amber-300 text-amber-800'
                            : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-amber-600'
                        }`}
                        title="Toggle Featured"
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={prop.visibility}
                        onChange={(e) => handleUpdateVisibility(prop.id, e.target.value)}
                        className="text-xs rounded-lg border-slate-200 bg-slate-50 px-2 py-1 font-semibold"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Listings Owned</th>
                  <th className="py-3 px-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-slate-400 text-[11px]">{u.company_name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'landlord'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{u.email}</div>
                      <div className="text-[11px] text-slate-400">{u.phone || 'No phone'}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-700">
                      {u.properties_count || 0}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

