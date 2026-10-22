import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import ProfileModal from './ProfileModal';
import {
  Home,
  Search,
  Heart,
  User,
  LogOut,
  Building2,
  GraduationCap,
  Shield,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isLandlord, isStudent, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight block leading-none">
                Campus<span className="text-teal-600 dark:text-teal-400">Nest</span>
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider">
                Student Marketplace & CRM
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/properties"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition flex items-center gap-1.5"
            >
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              Find Housing
            </Link>

            {/* Role Links */}
            {isLandlord && (
              <Link
                to="/landlord/dashboard"
                className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition"
              >
                <Building2 className="w-4 h-4" />
                Landlord CRM & Listings
              </Link>
            )}

            {isStudent && (
              <Link
                to="/student/inquiries"
                className="text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 flex items-center gap-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition"
              >
                <GraduationCap className="w-4 h-4" />
                My Inquiries
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="text-sm font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800 flex items-center gap-1.5 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition"
              >
                <Shield className="w-4 h-4" />
                Admin Dashboard
              </Link>
            )}
          </nav>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-3">
            {/* Dark / Light Mode Toggle */}
            <ThemeToggle />

            {/* Student Favorites Link */}
            <Link
              to="/student/saved"
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition relative"
              title="Saved Properties"
            >
              <Heart className="w-5 h-5" />
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-700"
                >
                  <img
                    src={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user.name
                      )}&background=0d9488&color=fff`
                    }
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[120px] truncate pr-1">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1.5 z-50 text-sm animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                      <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[11px] font-bold uppercase tracking-wide bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                        {user.role}
                      </span>
                    </div>

                    {isLandlord && (
                      <Link
                        to="/landlord/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                      >
                        <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Landlord Portal
                      </Link>
                    )}

                    {isStudent && (
                      <Link
                        to="/student/inquiries"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                      >
                        <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        My Inquiries
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                      >
                        <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        Admin Panel
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        setProfileModalOpen(true);
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 border-t border-slate-100 dark:border-slate-700 transition"
                    >
                      <User className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      Edit Profile
                    </button>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-700/60 border-t border-slate-100 dark:border-slate-700 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 rounded-lg shadow-sm transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu and toggle */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle size="sm" />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-2">
          <Link
            to="/properties"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-700 dark:text-slate-200 font-medium"
          >
            Find Housing
          </Link>
          <Link
            to="/student/saved"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-700 dark:text-slate-200 font-medium"
          >
            Saved Listings
          </Link>
          {isLandlord && (
            <Link
              to="/landlord/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-emerald-700 dark:text-emerald-400 font-medium"
            >
              Landlord CRM
            </Link>
          )}
          {isStudent && (
            <Link
              to="/student/inquiries"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-blue-700 dark:text-blue-400 font-medium"
            >
              My Inquiries
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-purple-700 dark:text-purple-400 font-medium"
            >
              Admin Dashboard
            </Link>
          )}

          {!user ? (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-teal-600"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 text-sm font-semibold text-white bg-teal-600 rounded-lg"
              >
                Get Started
              </Link>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setProfileModalOpen(true);
                }}
                className="w-full text-left py-2 text-sm font-medium text-teal-600 dark:text-teal-400"
              >
                Edit Profile ({user.name})
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left py-2 text-sm font-medium text-rose-600 dark:text-rose-400"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}

      {/* Profile Update Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </header>
  );
}
