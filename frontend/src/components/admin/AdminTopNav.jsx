import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  UserPlus,
  Shield,
  ExternalLink,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Building2,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function AdminTopNav({
  activeTab,
  onOpenMobileSidebar,
  onOpenAddUser,
  searchQuery,
  setSearchQuery,
  stats,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const getBreadcrumbLabel = () => {
    switch (activeTab) {
      case 'overview':
        return 'Overview & Metrics';
      case 'users':
        return 'Registered Users Directory';
      case 'properties':
        return 'Listings Moderation';
      case 'inquiries':
        return 'Inquiries & Leads';
      case 'settings':
        return 'Platform Settings';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          title="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-400">Admin</span>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-slate-900">{getBreadcrumbLabel()}</span>
        </div>
      </div>

      {/* Middle: Global Quick Search */}
      <div className="hidden md:flex items-center max-w-md w-full relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter users, properties, or leads..."
          className="w-full pl-9 pr-12 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition"
        />
        {searchQuery ? (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-700 font-bold bg-slate-200/80 px-1.5 py-0.5 rounded"
          >
            ESC
          </button>
        ) : (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono border border-slate-200 px-1.5 py-0.5 rounded bg-white">
            ⌘K
          </span>
        )}
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-2.5">
        {/* Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>API 100% Online</span>
        </div>

        {/* Quick Add User Button */}
        {onOpenAddUser && (
          <button
            onClick={onOpenAddUser}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add User</span>
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition relative"
            title="System Notifications"
          >
            <Bell className="w-4 h-4" />
            {stats?.pending_review > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white"></span>
            )}
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50 animate-fadeIn text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900">Notifications</span>
                <span className="text-[10px] text-slate-400 font-semibold">Real-time alerts</span>
              </div>
              <div className="py-2 space-y-2">
                {stats?.pending_review > 0 ? (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">{stats.pending_review} listings in draft review</p>
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        Landlords submitted properties awaiting compliance approval.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 text-center text-slate-500 text-[11px]">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                    All moderation queues are up to date!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
          >
            <img
              src={
                user?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.name || 'Admin'
                )}&background=7c3aed&color=fff`
              }
              alt={user?.name || 'Admin'}
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 text-xs">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-bold text-slate-900 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wide bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                  Super Admin
                </span>
              </div>

              <Link
                to="/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 transition"
              >
                <ExternalLink className="w-4 h-4 text-slate-400" />
                View Marketplace
              </Link>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full text-left flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 border-t border-slate-100 transition font-semibold"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
