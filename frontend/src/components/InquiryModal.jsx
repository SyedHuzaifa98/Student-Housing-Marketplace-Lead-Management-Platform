import React, { useState, useEffect } from 'react';
import { X, Send, Calendar, Video, Eye, HelpCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';

export default function InquiryModal({ property, isOpen, onClose, onSuccess }) {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    student_name: '',
    email: '',
    phone: '',
    inquiry_type: 'physical_tour',
    preferred_move_in: '',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        student_name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [user, isOpen]);

  if (!isOpen || !property) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      await apiClient(`/properties/${property.id}/inquiries`, {
        body: formData,
      });

      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Inquiry submission error:', err);
      setErrorMessage(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">
            Lead Engine &bull; Instant Delivery
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
            Contact Landlord
          </h2>
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            Regarding: <span className="font-semibold text-slate-700">{property.title}</span>
          </p>
        </div>

        {success ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Inquiry Sent Successfully!</h3>
            <p className="text-sm text-slate-600 mt-2 max-w-xs mx-auto">
              Your message has been directly dispatched to the landlord's dashboard CRM.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMessage}
              </div>
            )}

            {/* Inquiry Intent Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                What would you like to do?
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, inquiry_type: 'physical_tour' })}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition ${
                    formData.inquiry_type === 'physical_tour'
                      ? 'border-teal-600 bg-teal-50 text-teal-800 ring-2 ring-teal-500/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Eye className="w-4 h-4 text-teal-600" />
                  In-Person Tour
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, inquiry_type: 'virtual_tour' })}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition ${
                    formData.inquiry_type === 'virtual_tour'
                      ? 'border-teal-600 bg-teal-50 text-teal-800 ring-2 ring-teal-500/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Video className="w-4 h-4 text-teal-600" />
                  Virtual Tour
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, inquiry_type: 'general' })}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition ${
                    formData.inquiry_type === 'general'
                      ? 'border-teal-600 bg-teal-50 text-teal-800 ring-2 ring-teal-500/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <HelpCircle className="w-4 h-4 text-teal-600" />
                  Ask Question
                </button>
              </div>
            </div>

            {/* Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ali Ahmed"
                  value={formData.student_name}
                  onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                  className="w-full text-sm rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+44 7700 123456"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-sm rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>
            </div>

            {/* Email & Move-in Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="student@oxford.ac.uk"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-sm rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Move-in Date
                </label>
                <input
                  type="date"
                  value={formData.preferred_move_in}
                  onChange={(e) => setFormData({ ...formData, preferred_move_in: e.target.value })}
                  className="w-full text-sm rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Message *
              </label>
              <textarea
                required
                rows="3"
                placeholder="Hi! I am interested in this room for the upcoming term. Is it still available to view this week?"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full text-sm rounded-xl border-slate-200 bg-slate-50 p-3 text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 transition"
              ></textarea>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 transition"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Forwarding Inquiry...' : 'Send Inquiry to Landlord'}
              </button>
            </div>

            <p className="text-[11px] text-center text-slate-400">
              No booking fees &bull; Directly connects you to verified landlords
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

