import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, UserCheck, Shield, Building2, GraduationCap, LogOut, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DemoTourBar() {
  const { user, demoLogin, logout } = useAuth();
  const [loadingRole, setLoadingRole] = useState(null);
  const navigate = useNavigate();

  const handleRoleSwitch = async (role, targetPath) => {
    try {
      setLoadingRole(role);
      await demoLogin(role);
      if (targetPath) {
        navigate(targetPath);
      }
    } catch (err) {
      console.error('Demo switch error:', err);
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="bg-slate-900 text-white text-xs border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Project & Upwork Demo Hook */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-semibold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Upwork Portfolio Quick-Tour
          </span>
          <span className="text-slate-400 hidden sm:inline">
            Test full role capabilities without registering:
          </span>
        </div>

        {/* Center: 1-Click Role Switcher Buttons */}
        <div className="flex items-center gap-2">
          {/* Student Button */}
          <button
            onClick={() => handleRoleSwitch('student', '/student/inquiries')}
            disabled={loadingRole !== null}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
              user?.role === 'student'
                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
            Student View
            {user?.role === 'student' && <CheckCircle2 className="w-3 h-3 text-white ml-0.5" />}
          </button>

          {/* Landlord Button */}
          <button
            onClick={() => handleRoleSwitch('landlord', '/landlord/dashboard')}
            disabled={loadingRole !== null}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
              user?.role === 'landlord'
                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            Landlord CRM
            {user?.role === 'landlord' && <CheckCircle2 className="w-3 h-3 text-white ml-0.5" />}
          </button>

          {/* Admin Button */}
          <button
            onClick={() => handleRoleSwitch('admin', '/admin/dashboard')}
            disabled={loadingRole !== null}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
              user?.role === 'admin'
                ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-400/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            Admin View
            {user?.role === 'admin' && <CheckCircle2 className="w-3 h-3 text-white ml-0.5" />}
          </button>
        </div>

        {/* Right: Active user indicator & Logout */}
        <div className="flex items-center gap-2 ml-auto">
          {user ? (
            <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-slate-300 font-medium truncate max-w-[130px]">
                {user.name}
              </span>
              <button
                onClick={() => logout()}
                title="Log out"
                className="text-slate-400 hover:text-rose-400 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <span className="text-slate-400 italic">Guest mode (Browse only)</span>
          )}
        </div>
      </div>
    </div>
  );
}

