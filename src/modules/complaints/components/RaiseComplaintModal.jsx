import React, { useState, useEffect } from 'react';
import { MaterialIcons } from '@/ui';
import { useAuth } from '../../auth/context/AuthContext';
import { getComplaintCategories, getComplaints, createComplaint } from '../../../services/api/complaints';

export default function RaiseComplaintModal({ isOpen, onClose, initialTab = 'new' }) {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab); // 'new' | 'my_complaints'
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form fields
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [roomIdentifier, setRoomIdentifier] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successTicket, setSuccessTicket] = useState(null);

  // My complaints list
  const [myComplaints, setMyComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);

  const role = (user?.primary_role || user?.role || profile?.role || 'STUDENT').toUpperCase();
  const isStaff = role === 'STAFF';

  // Load categories and personal complaints when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setLoadingCategories(true);
    getComplaintCategories()
      .then((cats) => {
        setCategories(cats || []);
        if (cats && cats.length > 0) {
          setCategoryId(String(cats[0].id));
        }
      })
      .catch((err) => console.warn('Could not fetch complaint categories:', err))
      .finally(() => setLoadingCategories(false));

    loadMyComplaints();
  }, [isOpen]);

  const loadMyComplaints = () => {
    setLoadingComplaints(true);
    getComplaints()
      .then((data) => {
        setMyComplaints(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.warn('Could not fetch user complaints:', err))
      .finally(() => setLoadingComplaints(false));
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Please enter a brief subject/title for your complaint.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Please provide a detailed description of the issue.');
      return;
    }

    setSubmitting(true);
    try {
      const selectedCat = categories.find((c) => String(c.id) === String(categoryId));
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category_id: categoryId ? parseInt(categoryId, 10) : undefined,
        category_name: selectedCat?.name || undefined,
        priority: priority.toUpperCase(),
        room_identifier: roomIdentifier.trim() || undefined,
      };

      const result = await createComplaint(payload);
      setSuccessTicket(result?.ticket_number || 'CMP-SUCCESS');
      setTitle('');
      setDescription('');
      setRoomIdentifier('');
      loadMyComplaints();
    } catch (err) {
      console.error('Failed to submit complaint:', err);
      setErrorMsg(err.message || 'Failed to submit complaint. Please check connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || 'OPEN').toUpperCase();
    if (s === 'RESOLVED') {
      return { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0', label: 'Resolved' };
    }
    if (s === 'IN_PROGRESS') {
      return { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe', label: 'In Progress' };
    }
    if (s === 'REJECTED' || s === 'DISMISSED') {
      return { bg: '#f1f5f9', text: '#64748b', border: '#cbd5e1', label: 'Closed' };
    }
    return { bg: '#fffbeb', text: '#d97706', border: '#fde68a', label: 'Pending Review' };
  };

  const getPriorityBadge = (prio) => {
    const p = (prio || 'MEDIUM').toUpperCase();
    if (p === 'URGENT') return { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' };
    if (p === 'HIGH') return { bg: '#fff1f2', text: '#e11d48', border: '#fecdd3' };
    if (p === 'LOW') return { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' };
    return { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isStaff ? 'bg-indigo-600 text-white' : 'bg-blue-600 text-white'} shadow-xs`}>
              <MaterialIcons name="report-problem" size={22} color="#ffffff" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isStaff ? 'Faculty & Staff Complaint Portal' : 'Student Complaint & Grievance Desk'}
              </h2>
              <p className="text-xs text-slate-500">
                {isStaff
                  ? 'Submit workplace, cabin, equipment, or administrative grievances directly to Campus Admin'
                  : 'Report academic, hostel room, campus facility, or personal grievances directly to Campus Admin'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
            aria-label="Close"
          >
            <MaterialIcons name="close" size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-100/60 px-6 pt-2 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setActiveTab('new'); setSuccessTicket(null); }}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'new'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MaterialIcons name="add-circle-outline" size={16} />
            <span>Raise New Complaint</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('my_complaints'); setSuccessTicket(null); loadMyComplaints(); }}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'my_complaints'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MaterialIcons name="format-list-bulleted" size={16} />
            <span>My Submitted Complaints ({myComplaints.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === 'new' && (
            <div>
              {successTicket ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center space-y-4 animate-fade-in">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <MaterialIcons name="check-circle" size={36} color="#059669" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">Complaint Lodged Successfully!</h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Your ticket has been securely dispatched to the Campus Administrator & Custody Desk with your profile credentials.
                    </p>
                    <div className="mt-3 inline-block rounded-lg bg-white border border-emerald-200 px-4 py-2 text-sm font-mono font-bold text-emerald-700 shadow-2xs">
                      Ticket #{successTicket}
                    </div>
                  </div>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSuccessTicket(null)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                      File Another Complaint
                    </button>
                    <button
                      type="button"
                      onClick={() => { setActiveTab('my_complaints'); setSuccessTicket(null); }}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
                    >
                      Track My Complaints →
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMsg && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 flex items-center gap-2">
                      <MaterialIcons name="error-outline" size={16} color="#e11d48" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Category & Priority Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Category <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                        disabled={loadingCategories}
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Priority Level
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((p) => {
                          const isSelected = priority === p;
                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setPriority(p)}
                              className={`rounded-lg py-1.5 text-[10px] font-bold transition border ${
                                isSelected
                                  ? p === 'URGENT'
                                    ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                                    : p === 'HIGH'
                                    ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                                    : 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {p}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Room / Location */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Location / Room Identifier
                    </label>
                    <input
                      type="text"
                      value={roomIdentifier}
                      onChange={(e) => setRoomIdentifier(e.target.value)}
                      placeholder={isStaff ? 'e.g. Faculty Cabin CS-B204, LH-101' : 'e.g. Hostel Block B - Room 204, CS Lab 2'}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                  {/* Subject Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Subject / Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Brief summary of the issue..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                      maxLength={150}
                    />
                  </div>

                  {/* Detailed Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Detailed Description <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Explain the issue clearly with relevant details (symptoms, when it started, affected individuals)..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white resize-none"
                    />
                  </div>

                  {/* Submitter User Context Card */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MaterialIcons name="account-circle" size={18} color="#64748b" />
                      <span>
                        Filing as: <strong className="text-slate-800">{user?.name || user?.username || 'You'}</strong> ({role})
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-500">
                      ID: {user?.identifier || 'Active Session'}
                    </span>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2 shadow-xs"
                    >
                      {submitting ? (
                        <>
                          <MaterialIcons name="refresh" size={16} className="animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <MaterialIcons name="send" size={16} />
                          <span>Submit Complaint Ticket</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === 'my_complaints' && (
            <div className="space-y-3">
              {loadingComplaints ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  <MaterialIcons name="refresh" size={24} className="animate-spin mx-auto mb-2 text-blue-500" />
                  Loading your complaints...
                </div>
              ) : myComplaints.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-8 text-center space-y-2">
                  <MaterialIcons name="inbox" size={36} color="#94a3b8" className="mx-auto" />
                  <p className="text-sm font-bold text-slate-700">No complaints filed yet</p>
                  <p className="text-xs text-slate-500">
                    You have not registered any grievances or maintenance complaints.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('new')}
                    className="mt-2 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition"
                  >
                    Raise a Complaint Now
                  </button>
                </div>
              ) : (
                myComplaints.map((item) => {
                  const statusBadge = getStatusBadge(item.status);
                  const prioBadge = getPriorityBadge(item.priority);
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-slate-300 transition space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-600">
                            #{item.ticket_number}
                          </span>
                          <span
                            className="rounded-md px-2 py-0.5 text-[10px] font-bold border"
                            style={{
                              backgroundColor: prioBadge.bg,
                              color: prioBadge.text,
                              borderColor: prioBadge.border,
                            }}
                          >
                            {item.priority}
                          </span>
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            {item.category_name}
                          </span>
                        </div>
                        <span
                          className="rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border"
                          style={{
                            backgroundColor: statusBadge.bg,
                            color: statusBadge.text,
                            borderColor: statusBadge.border,
                          }}
                        >
                          {statusBadge.label}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.description}</p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 gap-2">
                        <span>
                          {item.room_identifier ? `📍 ${item.room_identifier}` : 'Campus Premises'}
                        </span>
                        <span>
                          Submitted {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recently'}
                        </span>
                      </div>

                      {/* Admin Remarks (if reviewed/resolved) */}
                      {item.admin_remarks && (
                        <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-2.5 text-xs text-blue-900 flex items-start gap-2">
                          <MaterialIcons name="info" size={16} color="#2563eb" className="shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block text-[11px] text-blue-800">
                              Admin / Custody Resolution Notes:
                            </span>
                            <span className="text-[11px] leading-relaxed">{item.admin_remarks}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
