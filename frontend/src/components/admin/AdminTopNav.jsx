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
import ThemeToggle from '../ThemeToggle';

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
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 h-16 px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors duration-200">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-400 dark:text-slate-500">Admin</span>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="font-bold text-slate-900 dark:text-slate-100">{getBreadcrumbLabel()}</span>
        </div>
      </div>

      {/* Middle: Global Quick Search */}
      <div className="hidden md:flex items-center max-w-md w-full relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter users, properties, or leads..."
          className="w-full pl-9 pr-12 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition"
        />
        {searchQuery ? (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold bg-slate-200/80 dark:bg-slate-700 px-1.5 py-0.5 rounded"
          >
            ESC
          </button>
        ) : (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 dark:text-slate-500 font-mono border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded bg-white dark:bg-slate-800">
            ⌘K
          </span>
        )}
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-2.5">
        {/* Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>API 100% Online</span>
        </div>

        {/* Dark/Light Mode Toggle */}
        <ThemeToggle size="sm" />

        {/* Quick Add User Button */}
        {onOpenAddUser && (
          <button
            onClick={onOpenAddUser}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 rounded-xl shadow-sm transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add User</span>
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative"
            title="System Notifications"
          >
            <Bell className="w-4 h-4" />
            {stats?.pending_review > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900"></span>
            )}
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-3 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white">Notifications</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Real-time alerts</span>
              </div>
              <div className="py-2 space-y-2">
                {stats?.pending_review > 0 ? (
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">{stats.pending_review} listings in draft review</p>
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                        Landlords submitted properties awaiting compliance approval.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 text-center text-slate-500 dark:text-slate-400 text-[11px]">
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
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <img
              src={
                user?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.name || 'Admin'
                )}&background=7c3aed&color=fff`
              }
              alt={user?.name || 'Admin'}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                <p className="font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wide bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full">
                  Super Admin
                </span>
              </div>

              <Link
                to="/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                <ExternalLink className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                View Marketplace
              </Link>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full text-left flex items-center gap-2 px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-700 border-t border-slate-100 dark:border-slate-700 transition font-semibold"
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
