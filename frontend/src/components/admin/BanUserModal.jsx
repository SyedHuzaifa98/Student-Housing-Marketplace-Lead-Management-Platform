import React, { useState } from 'react';
import { X, Ban, AlertTriangle, CheckCircle2, ShieldAlert, AlertCircle } from 'lucide-react';
import apiClient from '../../api/client';

export default function BanUserModal({ isOpen, onClose, user, onStatusUpdated }) {
  const [targetStatus, setTargetStatus] = useState('banned');
  const [banReason, setBanReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !user) return null;

  const currentStatus = user.status || 'active';

  const handleUpdateStatus = async (statusToSet) => {
    setError('');
    setLoading(true);
    try {
      const res = await apiClient(`/admin/users/${user.id}/status`, {
        method: 'PATCH',
        body: {
          status: statusToSet,
          ban_reason: statusToSet !== 'active' ? banReason.trim() : null,
        },
      });

      onStatusUpdated(res.user);
      onClose();
    } catch (err) {
      console.error('Failed to update status:', err);
      setError(err.message || 'Failed to update user status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Manage Account Access</h2>
              <p className="text-xs text-slate-500">Deactivate or ban member account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card Summary */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <img
              src={
                user.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=7c3aed&color=fff`
              }
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    user.role === 'admin'
                      ? 'bg-purple-100 text-purple-800'
                      : user.role === 'landlord'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
              <div className="mt-1 flex items-center gap-2 text-[11px]">
                <span className="text-slate-400">Current status:</span>
                <span
                  className={`font-semibold ${
                    currentStatus === 'active'
                      ? 'text-emerald-600'
                      : currentStatus === 'banned'
                      ? 'text-rose-600'
                      : 'text-amber-600'
                  }`}
                >
                  ● {currentStatus.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action description & Reason */}
          {currentStatus === 'active' ? (
            <div className="space-y-3">
              <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setTargetStatus('banned')}
                  className={`flex-1 py-1.5 rounded-lg transition text-center ${
                    targetStatus === 'banned'
                      ? 'bg-white text-rose-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Ban / Suspend Account
                </button>
                <button
                  type="button"
                  onClick={() => setTargetStatus('deactivated')}
                  className={`flex-1 py-1.5 rounded-lg transition text-center ${
                    targetStatus === 'deactivated'
                      ? 'bg-white text-amber-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Deactivate Account
                </button>
              </div>

              {targetStatus === 'banned' ? (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Ban className="w-3.5 h-3.5" /> Banning Terminate Sessions
                  </p>
                  <p className="text-[11px] text-rose-700">
                    Banning revokes all active auth tokens and prevents login until reactivated by an administrator.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Deactivate Account
                  </p>
                  <p className="text-[11px] text-amber-700">
                    Deactivating suspends account access temporarily without permanently marking as banned.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for {targetStatus === 'banned' ? 'Ban' : 'Deactivation'} (Optional)
                </label>
                <input
                  type="text"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="e.g. Terms of Service violation, suspicious listing behavior"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100"
                />
              </div>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs space-y-2">
              <p className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Account is currently {currentStatus}
              </p>
              {user.ban_reason && (
                <p className="text-[11px] text-emerald-800">
                  <span className="font-semibold">Recorded reason:</span> {user.ban_reason}
                </p>
              )}
              <p className="text-[11px] text-emerald-700">
                You can reactivate this account to immediately restore user login privileges and permissions.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>

            {currentStatus === 'active' ? (
              <button
                type="button"
                onClick={() => handleUpdateStatus(targetStatus)}
                disabled={loading}
                className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md transition flex items-center gap-1.5 ${
                  targetStatus === 'banned'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                    : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                }`}
              >
                {loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Ban className="w-3.5 h-3.5" />
                )}
                {targetStatus === 'banned' ? 'Confirm Ban' : 'Confirm Deactivate'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleUpdateStatus('active')}
                disabled={loading}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
              >
                {loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                Reactivate Account
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
