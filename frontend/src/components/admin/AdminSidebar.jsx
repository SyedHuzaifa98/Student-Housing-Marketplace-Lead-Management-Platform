import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  MessageSquare,
  Settings,
  Shield,
  ExternalLink,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  stats,
  onOpenAddUser,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    {
      id: 'overview',
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'users',
      label: 'Registered Users',
      icon: Users,
      badge: stats?.total_users || null,
      badgeColor: 'bg-purple-900/60 text-purple-300 border border-purple-700/50',
    },
    {
      id: 'properties',
      label: 'Listings Moderation',
      icon: Building2,
      badge: stats?.pending_review > 0 ? `${stats.pending_review} draft` : null,
      badgeColor: 'bg-amber-900/60 text-amber-300 border border-amber-700/50',
    },
    {
      id: 'inquiries',
      label: 'Inquiries & Leads',
      icon: MessageSquare,
      badge: stats?.total_inquiries || null,
      badgeColor: 'bg-blue-900/60 text-blue-300 border border-blue-700/50',
    },
    {
      id: 'settings',
      label: 'Platform Settings',
      icon: Settings,
      badge: null,
    },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-900 border-r border-slate-800 text-slate-300 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
          <Link
            to="/admin/dashboard"
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-3 overflow-hidden group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30 shrink-0 group-hover:scale-105 transition">
              <Shield className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <span className="text-sm font-black text-white tracking-tight block truncate">
                  Campus<span className="text-purple-400">Nest</span>
                </span>
                <span className="text-[10px] uppercase font-bold text-purple-400/90 tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Admin Suite
                </span>
              </div>
            )}
          </Link>

          {/* Collapse Button (Desktop only) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Action Button */}
        {!collapsed && onOpenAddUser && (
          <div className="p-3">
            <button
              onClick={onOpenAddUser}
              className="w-full py-2.5 px-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/20 transition flex items-center justify-center gap-2 group"
            >
              <UserPlus className="w-4 h-4 group-hover:scale-110 transition" />
              <span>Add New User</span>
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {!collapsed && (
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Governance & Operations
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-400 group-hover:scale-110'
                  }`}
                />
                {!collapsed && (
                  <>
                    <span className="truncate flex-1 text-left">{item.label}</span>
                    {item.badge !== null && item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeColor || 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-slate-800/80">
            {!collapsed && (
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Shortcuts
              </div>
            )}

            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition group"
              title={collapsed ? 'View Marketplace' : undefined}
            >
              <ExternalLink className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-teal-400 group-hover:scale-110 transition" />
              {!collapsed && (
                <>
                  <span className="truncate flex-1 text-left">View Marketplace</span>
                  <span className="text-[10px] font-bold text-teal-400 bg-teal-950/60 border border-teal-800/60 px-1.5 py-0.5 rounded">
                    Live
                  </span>
                </>
              )}
            </Link>
          </div>
        </div>

        {/* Footer Admin User Card */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img
                src={
                  user?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user?.name || 'Admin'
                  )}&background=7c3aed&color=fff`
                }
                alt={user?.name || 'Admin'}
                className="w-9 h-9 rounded-xl object-cover border border-slate-700"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-200 truncate">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@campusnest.internal'}</p>
                <span className="inline-block mt-0.5 text-[9px] font-black uppercase tracking-wider bg-purple-900/60 text-purple-300 border border-purple-700/50 px-1.5 py-0.2 rounded">
                  Super Admin
                </span>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition shrink-0"
              title="Sign Out of Admin Console"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
