import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Building2,
  CheckCircle2,
  Star,
  Eye,
  AlertCircle,
  UserPlus,
  Ban,
  RefreshCw,
  Search,
  Filter,
  Trash2,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  Server,
  Lock,
} from 'lucide-react';
import apiClient from '../api/client';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminTopNav from '../components/admin/AdminTopNav';
import AddUserModal from '../components/admin/AddUserModal';
import BanUserModal from '../components/admin/BanUserModal';

export default function AdminDashboard() {
  const { user: currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Navigation & Layout states
  const initialTab = searchParams.get('tab') || 'users';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Data states
  const [stats, setStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // User filters
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [userSearchText, setUserSearchText] = useState('');

  // Modals state
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [banModalUser, setBanModalUser] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchAdminData = async () => {
    try {
      setRefreshing(true);
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
      showToast('Failed to load administrative data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Sync tab change with URL query params
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // Property Handlers
  const handleToggleFeature = async (propId) => {
    try {
      const res = await apiClient(`/admin/properties/${propId}/feature`, { method: 'PATCH' });
      setProperties((prev) =>
        prev.map((p) => (p.id === propId ? { ...p, is_featured: res.is_featured } : p))
      );
      showToast(res.message || 'Feature status updated');
    } catch (err) {
      console.error('Toggle feature error:', err);
      showToast('Failed to toggle feature status', 'error');
    }
  };

  const handleUpdateVisibility = async (propId, visibility) => {
    try {
      const res = await apiClient(`/admin/properties/${propId}/visibility`, {
        method: 'PATCH',
        body: { visibility },
      });
      setProperties((prev) =>
        prev.map((p) => (p.id === propId ? { ...p, visibility } : p))
      );
      showToast(`Listing marked as ${visibility}`);
    } catch (err) {
      console.error('Visibility update error:', err);
      showToast('Failed to update listing visibility', 'error');
    }
  };

  // User Handlers
  const handleUserCreated = (newUser) => {
    setUsers((prev) => [newUser, ...prev]);
    showToast(`User ${newUser.name} created successfully!`, 'success');
    fetchAdminData();
  };

  const handleUserStatusUpdated = (updatedUser) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
    );
    const statusLabel =
      updatedUser.status === 'banned'
        ? 'banned'
        : updatedUser.status === 'deactivated'
        ? 'deactivated'
        : 'reactivated';
    showToast(`User ${updatedUser.name} has been ${statusLabel}.`, 'success');
    fetchAdminData();
  };

  const handleDeleteUser = async (userToDelete) => {
    if (!userToDelete) return;
    setDeletingUserId(userToDelete.id);
    try {
      await apiClient(`/admin/users/${userToDelete.id}`, { method: 'DELETE' });
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      showToast(`User ${userToDelete.name} was permanently removed.`, 'success');
      setDeleteConfirmUser(null);
      fetchAdminData();
    } catch (err) {
      console.error('Delete user error:', err);
      showToast(err.message || 'Failed to delete user.', 'error');
    } finally {
      setDeletingUserId(null);
    }
  };

  // Filtering users
  const filteredUsers = users.filter((u) => {
    // Role filter
    if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
    // Status filter
    const status = u.status || 'active';
    if (userStatusFilter !== 'all' && status !== userStatusFilter) return false;
    // Search filter
    const query = (userSearchText || globalSearch).toLowerCase().trim();
    if (query) {
      const matchName = u.name?.toLowerCase().includes(query);
      const matchEmail = u.email?.toLowerCase().includes(query);
      const matchCompany = u.company_name?.toLowerCase().includes(query);
      const matchPhone = u.phone?.toLowerCase().includes(query);
      return matchName || matchEmail || matchCompany || matchPhone;
    }
    return true;
  });

  // Filter properties for search
  const filteredProperties = properties.filter((p) => {
    if (!globalSearch.trim()) return true;
    const q = globalSearch.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.landlord?.name?.toLowerCase().includes(q) ||
      p.university?.name?.toLowerCase().includes(q)
    );
  });

  const activeUsersCount = users.filter((u) => (u.status || 'active') === 'active').length;
  const deactivatedUsersCount = users.filter((u) => u.status === 'deactivated').length;
  const bannedUsersCount = users.filter((u) => u.status === 'banned').length;

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 flex">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-semibold animate-bounce transition-all ${
            toastMessage.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : 'bg-slate-900 text-white border-slate-700'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* Modern SaaS Admin Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        stats={stats}
        onOpenAddUser={() => setAddUserModalOpen(true)}
      />

      {/* Main Content Layout Shell */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Sticky SaaS Top Navigation Bar */}
        <AdminTopNav
          activeTab={activeTab}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenAddUser={() => setAddUserModalOpen(true)}
          searchQuery={globalSearch}
          setSearchQuery={setGlobalSearch}
          stats={stats}
        />

        {/* Scrollable Work Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-500 font-semibold">Synchronizing Admin Panel Data...</p>
            </div>
          ) : (
            <>
              {/* ======================================================== */}
              {/* VIEW 1: DASHBOARD OVERVIEW */}
              {/* ======================================================== */}
              {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/30">
                    <Shield className="w-3.5 h-3.5" /> Operations Headquarters
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
                    Welcome, {currentUser?.name?.split(' ')[0] || 'Administrator'}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                    Overview of user registrations, housing catalog compliance, and lead transactions across CampusNest.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setAddUserModalOpen(true)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add New User
                    </button>
                    <button
                      onClick={() => handleTabChange('users')}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Manage Registered Users
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">Total Accounts</span>
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats?.total_users || users.length}</div>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" /> {activeUsersCount} active now
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">Landlords</span>
                    <Building2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-emerald-600">{stats?.total_landlords || 0}</div>
                  <span className="text-[11px] text-slate-500 font-medium block mt-1">Property listers</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">Students</span>
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-black text-blue-600">{stats?.total_students || 0}</div>
                  <span className="text-[11px] text-slate-500 font-medium block mt-1">Housing seekers</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">Live Listings</span>
                    <Building2 className="w-4 h-4 text-slate-700" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats?.total_properties || properties.length}</div>
                  <span className="text-[11px] text-amber-600 font-semibold block mt-1">
                    {stats?.pending_review || 0} draft / pending
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">CRM Inquiries</span>
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-2xl font-black text-purple-600">{stats?.total_inquiries || 0}</div>
                  <span className="text-[11px] text-slate-500 font-medium block mt-1">Dispatched leads</span>
                </div>
              </div>

              {/* Two Column Quick Previews */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Users preview */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Recent User Registrations</h2>
                      <p className="text-xs text-slate-500">Latest accounts registered on platform</p>
                    </div>
                    <button
                      onClick={() => handleTabChange('users')}
                      className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                    >
                      View all ({users.length}) <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {users.slice(0, 5).map((u) => (
                      <div key={u.id} className="py-2.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={
                              u.avatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=7c3aed&color=fff`
                            }
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{u.name}</p>
                            <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : u.role === 'landlord'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {u.role}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              (u.status || 'active') === 'active'
                                ? 'bg-emerald-50 text-emerald-700'
                                : u.status === 'banned'
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            ● {(u.status || 'active').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Listing Moderation preview */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Listings Compliance</h2>
                      <p className="text-xs text-slate-500">Recent property submissions</p>
                    </div>
                    <button
                      onClick={() => handleTabChange('properties')}
                      className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                    >
                      Moderate all <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {properties.slice(0, 5).map((p) => (
                      <div key={p.id} className="py-2.5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{p.title}</p>
                          <p className="text-[11px] text-slate-500 truncate">
                            Owner: {p.landlord?.name || 'Unknown'} • Rs. {Math.round(p.price_per_month).toLocaleString('en-PK')}/mo
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              p.visibility === 'published'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.visibility === 'draft'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {p.visibility}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 2: REGISTERED USERS DIRECTORY */}
          {/* ======================================================== */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Header Card & Quick Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Registered Users
                    </h1>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      {filteredUsers.length} total
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Search directory, provision staff accounts, and deactivate or ban accounts.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={fetchAdminData}
                    disabled={refreshing}
                    className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm transition"
                    title="Refresh Directory"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-purple-600' : ''}`} />
                  </button>

                  <button
                    onClick={() => setAddUserModalOpen(true)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/20 transition flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add User</span>
                  </button>
                </div>
              </div>

              {/* Status Metric Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[11px] font-semibold text-slate-400 block">Total Registered</span>
                  <span className="text-lg font-black text-slate-900">{users.length}</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-emerald-200/80 shadow-sm bg-emerald-50/20">
                  <span className="text-[11px] font-semibold text-emerald-700 block">● Active Accounts</span>
                  <span className="text-lg font-black text-emerald-700">{activeUsersCount}</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-sm bg-amber-50/20">
                  <span className="text-[11px] font-semibold text-amber-700 block">● Deactivated</span>
                  <span className="text-lg font-black text-amber-700">{deactivatedUsersCount}</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-rose-200/80 shadow-sm bg-rose-50/20">
                  <span className="text-[11px] font-semibold text-rose-700 block">● Banned / Suspended</span>
                  <span className="text-lg font-black text-rose-700">{bannedUsersCount}</span>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Search Box */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={userSearchText}
                    onChange={(e) => setUserSearchText(e.target.value)}
                    placeholder="Search by name, email, company, or phone..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition"
                  />
                  {userSearchText && (
                    <button
                      onClick={() => setUserSearchText('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Role and Status Selectors */}
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <span className="hidden sm:inline font-semibold">Role:</span>
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-100"
                    >
                      <option value="all">All Roles</option>
                      <option value="student">Students</option>
                      <option value="landlord">Landlords</option>
                      <option value="admin">Administrators</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span className="hidden sm:inline font-semibold">Status:</span>
                    <select
                      value={userStatusFilter}
                      onChange={(e) => setUserStatusFilter(e.target.value)}
                      className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-100"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active Only</option>
                      <option value="deactivated">Deactivated</option>
                      <option value="banned">Banned</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Users Directory Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4">User</th>
                        <th className="py-3.5 px-4">Role</th>
                        <th className="py-3.5 px-4">Account Status</th>
                        <th className="py-3.5 px-4">Contact Details</th>
                        <th className="py-3.5 px-4 text-center">Listings</th>
                        <th className="py-3.5 px-4">Registered</th>
                        <th className="py-3.5 px-4 text-right">Moderation Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                            <p className="font-semibold text-slate-600 text-xs">No registered users found</p>
                            <p className="text-[11px] text-slate-400 mt-1">
                              Try adjusting your search criteria or add a new user.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => {
                          const status = u.status || 'active';
                          const isSelf = currentUser?.id === u.id;

                          return (
                            <tr
                              key={u.id}
                              className={`hover:bg-slate-50/80 transition ${
                                status === 'banned'
                                  ? 'bg-rose-50/30'
                                  : status === 'deactivated'
                                  ? 'bg-amber-50/20'
                                  : ''
                              }`}
                            >
                              {/* User Info */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={
                                      u.avatar ||
                                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                        u.name
                                      )}&background=7c3aed&color=fff`
                                    }
                                    alt={u.name}
                                    className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                      <span className="truncate">{u.name}</span>
                                      {isSelf && (
                                        <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.2 rounded">
                                          You
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-slate-400 text-[11px] truncate">
                                      {u.company_name || 'Individual Member'}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Role */}
                              <td className="py-3.5 px-4">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    u.role === 'admin'
                                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                      : u.role === 'landlord'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                                  }`}
                                >
                                  {u.role}
                                </span>
                              </td>

                              {/* Status Column */}
                              <td className="py-3.5 px-4">
                                <div>
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                      status === 'active'
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                        : status === 'banned'
                                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                                    }`}
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        status === 'active'
                                          ? 'bg-emerald-600'
                                          : status === 'banned'
                                          ? 'bg-rose-600'
                                          : 'bg-amber-600'
                                      }`}
                                    />
                                    {status.toUpperCase()}
                                  </span>

                                  {status === 'banned' && u.ban_reason && (
                                    <p
                                      className="text-[10px] text-rose-600 font-medium truncate max-w-[150px] mt-0.5"
                                      title={u.ban_reason}
                                    >
                                      Reason: {u.ban_reason}
                                    </p>
                                  )}
                                </div>
                              </td>

                              {/* Contact */}
                              <td className="py-3.5 px-4 text-slate-600">
                                <div className="font-medium text-slate-900 truncate max-w-[180px]">
                                  {u.email}
                                </div>
                                <div className="text-[11px] text-slate-400">
                                  {u.phone || 'No phone recorded'}
                                </div>
                              </td>

                              {/* Metrics */}
                              <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                                {u.properties_count || 0}
                              </td>

                              {/* Registered */}
                              <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                                {new Date(u.created_at).toLocaleDateString()}
                              </td>

                              {/* Actions Column: Deactivate / Ban / Reactivate */}
                              <td className="py-3.5 px-4 text-right">
                                {isSelf ? (
                                  <span className="text-[11px] font-semibold text-slate-400 italic">
                                    Self (Protected)
                                  </span>
                                ) : (
                                  <div className="flex items-center justify-end gap-1.5">
                                    {status === 'active' ? (
                                      <>
                                        {/* Deactivate Quick Action */}
                                        <button
                                          onClick={() => setBanModalUser(u)}
                                          className="px-2.5 py-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition"
                                          title="Deactivate Account"
                                        >
                                          Deactivate
                                        </button>

                                        {/* Ban Quick Action */}
                                        <button
                                          onClick={() => setBanModalUser(u)}
                                          className="px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition flex items-center gap-1"
                                          title="Ban / Suspend Account"
                                        >
                                          <Ban className="w-3 h-3" />
                                          Ban
                                        </button>
                                      </>
                                    ) : (
                                      <button
                                        onClick={() => setBanModalUser(u)}
                                        className="px-3 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition flex items-center gap-1"
                                        title="Reactivate Account"
                                      >
                                        <CheckCircle2 className="w-3 h-3" />
                                        Reactivate
                                      </button>
                                    )}

                                    {/* Delete User Option */}
                                    <button
                                      onClick={() => setDeleteConfirmUser(u)}
                                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                      title="Delete User"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 3: LISTINGS MODERATION */}
          {/* ======================================================== */}
          {activeTab === 'properties' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Listings Moderation & Governance
                    </h1>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      {filteredProperties.length} listings
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review landlord properties, feature spotlight listings, and control catalog visibility.
                  </p>
                </div>

                <button
                  onClick={fetchAdminData}
                  disabled={refreshing}
                  className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm transition self-start sm:self-auto"
                  title="Refresh Listings"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-purple-600' : ''}`} />
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4">Listing Title</th>
                        <th className="py-3.5 px-4">Landlord</th>
                        <th className="py-3.5 px-4">University Campus</th>
                        <th className="py-3.5 px-4">Price / Mo</th>
                        <th className="py-3.5 px-4 text-center">Featured</th>
                        <th className="py-3.5 px-4">Visibility Status</th>
                        <th className="py-3.5 px-4 text-right">Preview</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProperties.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            <Building2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                            <p className="font-semibold text-slate-600 text-xs">No properties found</p>
                          </td>
                        </tr>
                      ) : (
                        filteredProperties.map((prop) => (
                          <tr key={prop.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs truncate">
                              <Link
                                to={`/properties/${prop.slug || prop.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-purple-600 transition"
                              >
                                {prop.title}
                              </Link>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600">
                              <div className="font-semibold text-slate-800">{prop.landlord?.name || 'Unknown'}</div>
                              <div className="text-[11px] text-slate-400">{prop.landlord?.email}</div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 font-medium">
                              {prop.university?.name || 'N/A'}
                            </td>
                            <td className="py-3.5 px-4 font-black text-slate-900">
                              Rs. {Math.round(prop.price_per_month).toLocaleString('en-PK')}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={() => handleToggleFeature(prop.id)}
                                className={`p-1.5 rounded-xl border transition ${
                                  prop.is_featured
                                    ? 'bg-amber-100 border-amber-300 text-amber-800 shadow-sm'
                                    : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-amber-600'
                                }`}
                                title="Toggle Featured Status"
                              >
                                <Star className="w-4 h-4 fill-current" />
                              </button>
                            </td>
                            <td className="py-3.5 px-4">
                              <select
                                value={prop.visibility}
                                onChange={(e) => handleUpdateVisibility(prop.id, e.target.value)}
                                className={`text-xs rounded-xl border px-2.5 py-1 font-bold ${
                                  prop.visibility === 'published'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : prop.visibility === 'draft'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                <option value="published">● Published</option>
                                <option value="draft">● Draft (Review)</option>
                                <option value="archived">● Archived</option>
                              </select>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <Link
                                to={`/properties/${prop.slug || prop.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200 transition"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Inspect
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 4: INQUIRIES & LEADS */}
          {/* ======================================================== */}
          {activeTab === 'inquiries' && (
            <div className="space-y-6">
              <div className="pb-2 border-b border-slate-200">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Marketplace Leads & Student Inquiries
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Monitor inbound student requests routed to landlords.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-400 block mb-1">Total Inquiries</span>
                  <span className="text-3xl font-black text-purple-700">{stats?.total_inquiries || 0}</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-400 block mb-1">Active Students</span>
                  <span className="text-3xl font-black text-blue-600">{stats?.total_students || 0}</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-400 block mb-1">Receiving Landlords</span>
                  <span className="text-3xl font-black text-emerald-600">{stats?.total_landlords || 0}</span>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3">
                <MessageSquare className="w-12 h-12 text-purple-400 mx-auto" />
                <h2 className="text-base font-bold text-slate-900">Lead Pipeline Healthy</h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Students connect with verified landlords directly via instant message dispatch and email alerts. Landlords manage their inquiry leads through the Landlord CRM portal.
                </p>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 5: PLATFORM SETTINGS */}
          {/* ======================================================== */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="pb-2 border-b border-slate-200">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Platform Architecture & Configuration
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Core environment details, authorization parameters, and compliance status.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Server className="w-4 h-4 text-purple-600" /> Environment Health
                  </h2>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">API Framework</span>
                      <span className="font-semibold text-slate-800">Laravel 10.x (PHP 8.1)</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Frontend Suite</span>
                      <span className="font-semibold text-slate-800">React 19 + Tailwind CSS + Vite</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Authentication</span>
                      <span className="font-semibold text-emerald-600">Laravel Sanctum Bearer Tokens</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">Access Governance</span>
                      <span className="font-semibold text-purple-600">Multi-Role RBAC (Admin/Landlord/Student)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-purple-600" /> Security Safeguards
                  </h2>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Immediate session termination on user ban</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Self-ban and self-deactivation prevention enforced</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Protected admin route authentication checks</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
            </>
          )}
        </main>
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={addUserModalOpen}
        onClose={() => setAddUserModalOpen(false)}
        onUserCreated={handleUserCreated}
      />

      {/* Ban / Deactivate Modal */}
      <BanUserModal
        isOpen={!!banModalUser}
        user={banModalUser}
        onClose={() => setBanModalUser(null)}
        onStatusUpdated={handleUserStatusUpdated}
      />

      {/* Delete User Confirmation Modal */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Delete User Account?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete <strong className="text-slate-800">{deleteConfirmUser.name}</strong> ({deleteConfirmUser.email})? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmUser(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirmUser)}
                disabled={deletingUserId !== null}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 transition flex items-center gap-1.5"
              >
                {deletingUserId !== null ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
