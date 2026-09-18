import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight block leading-none">
                Campus<span className="text-teal-600">Nest</span>
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Student Marketplace & CRM
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/properties"
              className="text-sm font-medium text-slate-700 hover:text-teal-600 transition flex items-center gap-1.5"
            >
              <Search className="w-4 h-4 text-slate-400" />
              Find Housing
            </Link>

            {/* Role Links */}
            {isLandlord && (
              <Link
                to="/landlord/dashboard"
                className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5 hover:bg-emerald-100 transition"
              >
                <Building2 className="w-4 h-4" />
                Landlord CRM & Listings
              </Link>
            )}

            {isStudent && (
              <Link
                to="/student/inquiries"
                className="text-sm font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 flex items-center gap-1.5 hover:bg-blue-100 transition"
              >
                <GraduationCap className="w-4 h-4" />
                My Inquiries
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="text-sm font-semibold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200 flex items-center gap-1.5 hover:bg-purple-100 transition"
              >
                <Shield className="w-4 h-4" />
                Admin Dashboard
              </Link>
            )}
          </nav>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-3">
            {/* Student Favorites Link */}
            <Link
              to="/student/saved"
              className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition relative"
              title="Saved Properties"
            >
              <Heart className="w-5 h-5" />
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-slate-100 transition border border-slate-200"
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
                  <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate pr-1">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 text-sm">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-semibold text-slate-800 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[11px] font-bold uppercase tracking-wide bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {user.role}
                      </span>
                    </div>

                    {isLandlord && (
                      <Link
                        to="/landlord/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50"
                      >
                        <Building2 className="w-4 h-4 text-emerald-600" />
                        Landlord Portal
                      </Link>
                    )}

                    {isStudent && (
                      <Link
                        to="/student/inquiries"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50"
                      >
                        <GraduationCap className="w-4 h-4 text-blue-600" />
                        My Inquiries
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50"
                      >
                        <Shield className="w-4 h-4 text-purple-600" />
                        Admin Panel
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 border-t border-slate-100"
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
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-teal-600 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
          <Link
            to="/properties"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-700 font-medium"
          >
            Find Housing
          </Link>
          {isLandlord && (
            <Link
              to="/landlord/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-emerald-700 font-medium"
            >
              Landlord CRM
            </Link>
          )}
          {isStudent && (
            <Link
              to="/student/inquiries"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-blue-700 font-medium"
            >
              My Inquiries
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-purple-700 font-medium"
            >
              Admin Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

