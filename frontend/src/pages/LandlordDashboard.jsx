import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  Search,
  Filter,
  Download,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  AlertCircle,
  X,
  Phone,
  Mail,
  ExternalLink,
} from 'lucide-react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function LandlordDashboard() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('crm'); // 'crm' or 'properties'
  const [stats, setStats] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [properties, setProperties] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  // CRM Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('');
  const [crmSearch, setCrmSearch] = useState('');

  // Internal Notes Modal State
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [currentNotes, setCurrentNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Add / Edit Property Modal State
  const [propertyModalOpen, setPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [propertyForm, setPropertyForm] = useState({
    university_id: '',
    title: '',
    description: '',
    price_per_month: '',
    deposit_amount: '',
    room_type: 'private',
    distance_km: '',
    address: '',
    city: '',
    bills_included: true,
    available_from: new Date().toISOString().split('T')[0],
    status: 'available',
    visibility: 'published',
    amenities: [],
    images: [''],
  });
  const [savingProperty, setSavingProperty] = useState(false);

  // Load Dashboard Data
  const fetchDashboardData = async () => {
    try {
      const [statsRes, propsRes, metaRes] = await Promise.all([
        apiClient('/landlord/stats').catch((e) => {
          console.warn('Stats fetch caught:', e);
          return { stats: {} };
        }),
        apiClient('/landlord/properties').catch((e) => {
          console.warn('Properties fetch caught:', e);
          return { data: [] };
        }),
        apiClient('/meta').catch(() => ({})),
      ]);
      setStats(statsRes?.stats || {});
      setProperties(propsRes?.data || []);
      setMeta(metaRes || {});
    } catch (err) {
      console.error('Landlord data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInquiries = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (propertyFilter) params.append('property_id', propertyFilter);
      if (crmSearch) params.append('search', crmSearch);

      const res = await apiClient(`/landlord/inquiries?${params.toString()}`).catch((e) => {
        console.warn('Inquiries fetch caught:', e);
        return { data: [] };
      });
      setInquiries(res?.data || []);
    } catch (err) {
      console.error('Inquiries fetch error:', err);
      setInquiries([]);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter, propertyFilter, crmSearch]);

  // Status Change Handler
  const handleStatusChange = async (inquiryId, newStatus) => {
    try {
      await apiClient(`/landlord/inquiries/${inquiryId}/status`, {
        method: 'PATCH',
        body: { status: newStatus },
      });
      // Refresh list and stats
      fetchInquiries();
      const statsRes = await apiClient('/landlord/stats');
      setStats(statsRes.stats);
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  // Open Notes Modal
  const openNotesModal = (inq) => {
    setSelectedInquiry(inq);
    setCurrentNotes(inq.landlord_notes || '');
    setNotesModalOpen(true);
  };

  // Save Landlord Notes
  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    setSavingNotes(true);
    try {
      await apiClient(`/landlord/inquiries/${selectedInquiry.id}/notes`, {
        method: 'PATCH',
        body: { landlord_notes: currentNotes },
      });
      setNotesModalOpen(false);
      fetchInquiries();
    } catch (err) {
      console.error('Save notes error:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  // Export CSV
  const handleExportCsv = async () => {
    try {
      const blob = await apiClient('/landlord/inquiries/export');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('CSV download error:', err);
    }
  };

  // Status Badge Colors
  const statusColors = {
    new: 'bg-rose-100 text-rose-800 border-rose-200',
    contacted: 'bg-blue-100 text-blue-800 border-blue-200',
    viewing_scheduled: 'bg-amber-100 text-amber-800 border-amber-200',
    interested: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    closed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rejected: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  // Property Modal Open (Create or Edit)
  const openPropertyModal = (prop = null) => {
    if (prop) {
      setEditingProperty(prop);
      setPropertyForm({
        university_id: prop.university_id || '',
        title: prop.title || '',
        description: prop.description || '',
        price_per_month: prop.price_per_month || '',
        deposit_amount: prop.deposit_amount || '',
        room_type: prop.room_type || 'private',
        distance_km: prop.distance_km || '',
        address: prop.address || '',
        city: prop.city || '',
        bills_included: !!prop.bills_included,
        available_from: prop.available_from || new Date().toISOString().split('T')[0],
        status: prop.status || 'available',
        visibility: prop.visibility || 'published',
        amenities: prop.amenities ? prop.amenities.map((a) => a.id) : [],
        images:
          prop.images && prop.images.length > 0
            ? prop.images.map((img) => img.image_url)
            : [''],
      });
    } else {
      setEditingProperty(null);
      setPropertyForm({
        university_id: meta?.universities?.[0]?.id || '',
        title: '',
        description: '',
        price_per_month: '',
        deposit_amount: '',
        room_type: 'private',
        distance_km: '0.8',
        address: '',
        city: 'Oxford',
        bills_included: true,
        available_from: new Date().toISOString().split('T')[0],
        status: 'available',
        visibility: 'published',
        amenities: [1, 2, 3],
        images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200'],
      });
    }
    setPropertyModalOpen(true);
  };

  const handleSaveProperty = async (e) => {
    e.preventDefault();
    setSavingProperty(true);
    try {
      if (editingProperty) {
        await apiClient(`/landlord/properties/${editingProperty.id}`, {
          method: 'PUT',
          body: propertyForm,
        });
      } else {
        await apiClient('/landlord/properties', {
          body: propertyForm,
        });
      }
      setPropertyModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      console.error('Property save error:', err);
      alert(err.message || 'Failed to save property listing');
    } finally {
      setSavingProperty(false);
    }
  };

  const handleDeleteProperty = async (propId) => {
    if (!window.confirm('Are you sure you want to delete this property listing?')) return;
    try {
      await apiClient(`/landlord/properties/${propId}`, { method: 'DELETE' });
      fetchDashboardData();
    } catch (err) {
      console.error('Delete property error:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Landlord Operations Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            Lead Management & Housing Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as: <strong className="text-slate-800">{user?.name}</strong> (
            {user?.company_name || 'Property Manager'})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openPropertyModal()}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            Add New Accommodation
          </button>
        </div>
      </div>

      {/* KPI Stats Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Properties */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Properties</span>
            <Building2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats?.total_properties || 0}
          </div>
          <span className="text-[11px] text-slate-500">
            {stats?.active_properties || 0} currently active
          </span>
        </div>

        {/* Total Leads */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Leads</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.total_inquiries || 0}</div>
          <span className="text-[11px] text-slate-500">All-time student inquiries</span>
        </div>

        {/* New Leads (High attention) */}
        <div className="bg-rose-50/80 p-5 rounded-2xl border border-rose-200/80 shadow-sm">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">New Leads</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-rose-700">{stats?.new_leads || 0}</div>
          <span className="text-[11px] text-rose-600 font-medium">Awaiting landlord reply</span>
        </div>

        {/* Closed Deals */}
        <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200/80 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Closed Deals</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-emerald-800">{stats?.closed_deals || 0}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Leases finalized</span>
        </div>

        {/* Lead Conversion Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Conversion Rate</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats?.conversion_rate || 0}%
          </div>
          <span className="text-[11px] text-slate-500">Closed / Inquiries</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('crm')}
          className={`pb-3 text-sm font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'crm'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          Inquiry CRM & Lead Pipeline
          {stats?.new_leads > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
              {stats.new_leads} new
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('properties')}
          className={`pb-3 text-sm font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'properties'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          My Accommodation Listings ({properties.length})
        </button>
      </div>

      {/* TAB 1: MINI-CRM & LEAD PIPELINE */}
      {activeTab === 'crm' && (
        <div className="space-y-6">
          {/* CRM Search & Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student or message..."
                  value={crmSearch}
                  onChange={(e) => setCrmSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-semibold rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-slate-700"
              >
                <option value="">All Statuses</option>
                <option value="new">🔴 New Lead</option>
                <option value="contacted">🔵 Contacted</option>
                <option value="viewing_scheduled">🟡 Viewing Scheduled</option>
                <option value="interested">🟣 Interested</option>
                <option value="closed">🟢 Closed / Signed</option>
                <option value="rejected">⚪ Rejected</option>
              </select>

              {/* Property Filter */}
              <select
                value={propertyFilter}
                onChange={(e) => setPropertyFilter(e.target.value)}
                className="text-xs font-semibold rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 max-w-[200px] truncate"
              >
                <option value="">All Properties</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition shadow-sm shrink-0"
              title="Export all inquiries to CSV"
            >
              <Download className="w-3.5 h-3.5 text-teal-600" />
              Download Leads CSV
            </button>
          </div>

          {/* CRM Leads Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {inquiries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Property</th>
                      <th className="py-3 px-4">Type & Move-in</th>
                      <th className="py-3 px-4">Status Funnel</th>
                      <th className="py-3 px-4">Message & Notes</th>
                      <th className="py-3 px-4 text-right">Direct Connect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inquiries.map((inq) => {
                      const cleanPhone = (inq.phone || '').replace(/[^0-9]/g, '');
                      const studentName = inq.student_name || 'Prospective Tenant';
                      const propTitle = inq.property?.title || 'the student room';
                      const whatsappText = encodeURIComponent(
                        `Hi ${studentName}, this is ${user?.name || 'the landlord'} regarding your inquiry for ${propTitle}. Are you still looking for accommodation?`
                      );

                      const formattedCreated = inq.created_at
                        ? new Date(inq.created_at).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '';

                      const formattedMoveIn = inq.preferred_move_in
                        ? new Date(inq.preferred_move_in).toLocaleDateString()
                        : null;

                      return (
                        <tr key={inq.id} className="hover:bg-slate-50/70 transition">
                          {/* Student Info */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 text-sm">{studentName}</div>
                            {inq.email && (
                              <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3" />
                                {inq.email}
                              </div>
                            )}
                            {inq.phone && (
                              <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3" />
                                {inq.phone}
                              </div>
                            )}
                            {formattedCreated && (
                              <div className="text-[10px] text-slate-400 mt-1">
                                {formattedCreated}
                              </div>
                            )}
                          </td>

                          {/* Property Info */}
                          <td className="py-3.5 px-4 max-w-[200px]">
                            {inq.property ? (
                              <Link
                                to={`/properties/${inq.property.slug || inq.property.id}`}
                                className="font-semibold text-slate-800 hover:text-teal-600 line-clamp-2 block"
                              >
                                {inq.property.title}
                              </Link>
                            ) : (
                              <span className="text-slate-400 italic">Property removed</span>
                            )}
                            <div className="text-teal-600 font-bold text-[11px] mt-0.5">
                              ${Math.round(inq.property?.price_per_month || 0)}/mo
                            </div>
                          </td>

                          {/* Type & Move-in */}
                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 capitalize">
                              {(inq.inquiry_type || 'general').replace('_', ' ')}
                            </span>
                            <div className="text-[11px] text-slate-500 mt-1">
                              {formattedMoveIn ? `Target: ${formattedMoveIn}` : 'Flexible date'}
                            </div>
                          </td>

                          {/* 1-Click Status Dropdown */}
                          <td className="py-3.5 px-4">
                            <select
                              value={inq.status || 'new'}
                              onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                              className={`text-xs font-bold rounded-lg px-2.5 py-1 border transition cursor-pointer ${
                                statusColors[inq.status] || 'bg-slate-100'
                              }`}
                            >
                              <option value="new">🔴 New Lead</option>
                              <option value="contacted">🔵 Contacted</option>
                              <option value="viewing_scheduled">🟡 Viewing Scheduled</option>
                              <option value="interested">🟣 Interested</option>
                              <option value="closed">🟢 Closed / Signed</option>
                              <option value="rejected">⚪ Rejected</option>
                            </select>
                          </td>

                          {/* Message & Landlord Notes */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <p className="text-slate-700 text-xs italic line-clamp-2">
                              "{inq.message}"
                            </p>
                            {inq.landlord_notes && (
                              <div className="mt-1.5 p-1.5 bg-amber-50 rounded text-[11px] text-amber-800 border border-amber-200/60 line-clamp-1">
                                <strong>Note:</strong> {inq.landlord_notes}
                              </div>
                            )}
                          </td>

                          {/* Direct Actions: WhatsApp, Notes, Email */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* WhatsApp Button */}
                              <a
                                href={`https://wa.me/${cleanPhone}?text=${whatsappText}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg transition border border-emerald-200"
                                title="Chat on WhatsApp with pre-composed greeting"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </a>

                              {/* Landlord Private Notes */}
                              <button
                                onClick={() => openNotesModal(inq)}
                                className="p-1.5 bg-slate-50 text-slate-600 hover:bg-slate-200 rounded-lg transition border border-slate-200"
                                title="Add internal landlord note"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400">
                <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="font-medium text-sm text-slate-600">No leads match your current filter.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY PROPERTIES LISTING MANAGEMENT */}
      {activeTab === 'properties' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((prop) => (
              <div
                key={prop.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col"
              >
                <div className="relative aspect-[16/9] bg-slate-100">
                  <img
                    src={
                      prop.images?.[0]?.image_url ||
                      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600'
                    }
                    alt={prop.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        prop.status === 'available'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {prop.status}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h4 className="font-bold text-slate-900 text-base line-clamp-1">{prop.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {prop.address}, {prop.city} &bull; {prop.distance_km} km to campus
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-lg font-black text-slate-900">
                        ${Math.round(prop.price_per_month)}
                      </span>
                      <span className="text-slate-400"> / mo</span>
                    </div>

                    <div className="text-right text-slate-500">
                      <strong>{prop.inquiries_count || 0}</strong> leads (
                      <span className="text-rose-600 font-bold">
                        {prop.new_inquiries_count || 0} new
                      </span>
                      )
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => openPropertyModal(prop)}
                      className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition flex items-center justify-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>

                    <Link
                      to={`/properties/${prop.slug || prop.id}`}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition"
                      title="View public page"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => handleDeleteProperty(prop.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                      title="Delete listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INTERNAL NOTES MODAL */}
      {notesModalOpen && selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setNotesModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-slate-900 text-lg">Private Landlord Notes</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Lead: {selectedInquiry.student_name} &bull; {selectedInquiry.property?.title}
            </p>

            <div className="mt-4">
              <textarea
                rows="4"
                placeholder="e.g. Spoke on WhatsApp, agreed on 12 month lease, deposit due Friday..."
                value={currentNotes}
                onChange={(e) => setCurrentNotes(e.target.value)}
                className="w-full text-xs rounded-xl border-slate-200 bg-slate-50 p-3 text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500"
              ></textarea>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setNotesModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="px-4 py-2 text-xs font-bold bg-teal-600 text-white rounded-xl hover:bg-teal-700 shadow-sm"
              >
                {savingNotes ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT PROPERTY MODAL */}
      {propertyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setPropertyModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-900">
              {editingProperty ? 'Edit Accommodation Listing' : 'List New Student Property'}
            </h2>

            <form onSubmit={handleSaveProperty} className="mt-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Listing Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. St Giles Premium Ensuite Room near Oxford"
                  value={propertyForm.title}
                  onChange={(e) => setPropertyForm({ ...propertyForm, title: e.target.value })}
                  className="w-full text-xs rounded-xl border-slate-200 bg-slate-50 p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* University & Room Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">University *</label>
                  <select
                    value={propertyForm.university_id}
                    onChange={(e) =>
                      setPropertyForm({ ...propertyForm, university_id: e.target.value })
                    }
                    className="w-full text-xs rounded-xl border-slate-200 bg-slate-50 p-2.5 text-slate-800"
                  >
                    {meta?.universities?.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Room Type *</label>
                  <select
                    value={propertyForm.room_type}
                    onChange={(e) =>
                      setPropertyForm({ ...propertyForm, room_type: e.target.value })
                    }
                    className="w-full text-xs rounded-xl border-slate-200 bg-slate-50 p-2.5 text-slate-800"
                  >
                    <option value="private">Private Room</option>
                    <option value="studio">Studio Apartment</option>
                    <option value="shared">Shared Room</option>
                    <option value="entire_flat">Entire Flat</option>
                  </select>
                </div>
              </div>

              {/* Price & Deposit */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rent / Mo ($) *</label>
                  <input
                    type="number"
                    required
                    placeholder="450"
                    value={propertyForm.price_per_month}
                    onChange={(e) =>
                      setPropertyForm({ ...propertyForm, price_per_month: e.target.value })
                    }
                    className="w-full text-xs rounded-xl border-slate-200 bg-slate-50 p-2.5 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Deposit ($)</label>
                  <input
                    type="number"
                    placeholder="450"
                    value={propertyForm.deposit_amount}
                    onChange={(e) =>
                      setPropertyForm({ ...propertyForm, deposit_amount: e.target.value })
                    }
                    className="w-full text-xs rounded-xl border-slate-200 bg-slate-50 p-2.5 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Distance (km) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="0.5"
                    value={propertyForm.distance_km}
                    onChange={(e) =>
                      setPropertyForm({ ...propertyForm, distance_km: e.target.value })
                    }
                    className="w-full text-xs rounded-xl border-slate-200 bg-slate-50 p-2.5 text-slate-800"
                  />
                </div>
              </div>

              {/* Address & City */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="34 St Giles"
                    value={propertyForm.address}
                    onChange={(e) => setPropertyForm({ ...propertyForm, address: e.target.value })}
                    className="w-full text-xs rounded-xl border-slate-200 bg-slate-50 p-2.5 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="Oxford"
                    value={propertyForm.city}
                    onChange={(e) => setPropertyForm({ ...propertyForm, city: e.target.value })}
                    className="w-full text-xs rounded-xl border-slate-200 bg-slate-50 p-2.5 text-slate-800"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Detailed description of room, housemates, study facilities..."
                  value={propertyForm.description}
                  onChange={(e) =>
                    setPropertyForm({ ...propertyForm, description: e.target.value })
                  }
                  className="w-full text-xs rounded-xl border-slate-200 bg-slate-50 p-2.5 text-slate-800"
                ></textarea>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Photo URL (Unsplash or direct image link)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={propertyForm.images[0] || ''}
                  onChange={(e) => setPropertyForm({ ...propertyForm, images: [e.target.value] })}
                  className="w-full text-xs rounded-xl border-slate-200 bg-slate-50 p-2.5 text-slate-800"
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={propertyForm.bills_included}
                    onChange={(e) =>
                      setPropertyForm({ ...propertyForm, bills_included: e.target.checked })
                    }
                    className="rounded text-teal-600"
                  />
                  All Bills Included
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Status:</span>
                  <select
                    value={propertyForm.status}
                    onChange={(e) =>
                      setPropertyForm({ ...propertyForm, status: e.target.value })
                    }
                    className="text-xs rounded-lg border-slate-200 bg-slate-50 px-2 py-1"
                  >
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPropertyModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProperty}
                  className="px-5 py-2.5 text-xs font-bold bg-teal-600 text-white rounded-xl hover:bg-teal-700 shadow-sm"
                >
                  {savingProperty ? 'Saving...' : editingProperty ? 'Update Listing' : 'Publish Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

