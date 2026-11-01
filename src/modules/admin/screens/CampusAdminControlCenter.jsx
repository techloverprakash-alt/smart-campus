import React, { useState, useMemo, useEffect } from 'react';
import { getComplaints, updateComplaintStatus } from '../../../services/api/complaints';
import { useRouter } from '../../../router';
import { useAuth } from '../../auth/context/AuthContext';
import {
  Activity, AlertTriangle, ArrowLeft, ArrowUpRight, Award, Bell,
  Box, Check, CheckCircle2, ChevronDown, Clock, Download, ExternalLink,
  Eye, FileText, Filter, HelpCircle, Layers, LayoutDashboard, MapPin,
  Megaphone, RefreshCw, Search, Send, Shield, ShieldAlert, ShieldCheck,
  SlidersHorizontal, Sparkles, TrendingUp, UserCheck, Users, Wrench, X,
  Radio, ArrowRight
} from 'lucide-react';

const CATEGORY_ROWS = [
  { name: 'Science Quad (Block B)', incidents: 153, highest: true, values: [32, 30, 26, 12] },
  { name: 'Academic Block A', incidents: 109, values: [44, 25, 20, 11] },
  { name: 'Central Library Quad', incidents: 104, values: [18, 36, 32, 14] },
  { name: 'Main Canteen & Patio', incidents: 101, values: [38, 26, 16, 20] },
  { name: 'North Engineering Hall', incidents: 81, values: [28, 34, 24, 14] },
];

const CATEGORIES = [
  { label: 'Electrical', color: '#4338ca', bg: 'bg-indigo-700' },
  { label: 'Plumbing', color: '#0ea5e9', bg: 'bg-sky-500' },
  { label: 'IT & AV', color: '#a5b4fc', bg: 'bg-indigo-300' },
  { label: 'Furniture', color: '#cbd5e1', bg: 'bg-slate-300' },
];

const STATUSES = [
  { label: 'Resolved', count: 798, percent: 64, color: '#10b981', textColor: 'text-emerald-600' },
  { label: 'In Progress', count: 225, percent: 18, color: '#f59e0b', textColor: 'text-amber-600' },
  { label: 'Assigned', count: 125, percent: 10, color: '#6366f1', textColor: 'text-indigo-600' },
  { label: 'Submitted / Open', count: 62, percent: 5, color: '#ef4444', textColor: 'text-rose-600' },
  { label: 'Duplicate / Rejected', count: 38, percent: 3, color: '#94a3b8', textColor: 'text-slate-400' },
];

const INITIAL_REQUESTS = [
  { id: 'NX-1248', category: 'Electrical fault', detail: 'Ceiling lights not working', location: 'Science Quad • Block B', priority: 'High', status: 'In progress', assignee: 'R. Kumar (Electrician)', time: '12m ago' },
  { id: 'NX-1247', category: 'Network connectivity', detail: 'Wi-Fi unavailable in lab', location: 'Academic Block A', priority: 'Medium', status: 'Assigned', assignee: 'S. Prakash (IT Support)', time: '28m ago' },
  { id: 'NX-1246', category: 'Plumbing issue', detail: 'Water leak reported near cooler', location: 'Central Library Quad', priority: 'High', status: 'Open', assignee: 'Unassigned', time: '41m ago' },
  { id: 'NX-1245', category: 'IT & Classroom AV', detail: 'Projector overheating & sparking', location: 'Block B • Lab 302', priority: 'Critical', status: 'In progress', assignee: 'Gnana Prakash (AV Tech)', time: '1h ago' },
  { id: 'NX-1244', category: 'Power Safety', detail: 'Outdoor socket weather flap loose', location: 'Main Canteen Patio', priority: 'Medium', status: 'Assigned', assignee: 'Facility Team Shift B', time: '2h ago' },
];

export default function CampusAdminControlCenter() {
  const { navigation } = useRouter();
  const { user, profile } = useAuth();

  const [range, setRange] = useState('This month');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [complaintsList, setComplaintsList] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'STUDENT' | 'STAFF'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolutionStatus, setResolutionStatus] = useState('IN_PROGRESS');
  const [resolutionRemarks, setResolutionRemarks] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  const fetchLiveComplaints = () => {
    setLoadingComplaints(true);
    getComplaints()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setComplaintsList(data);
        }
      })
      .catch((err) => console.warn('Could not load live complaints:', err))
      .finally(() => setLoadingComplaints(false));
  };

  useEffect(() => {
    fetchLiveComplaints();
  }, []);

  const handleOpenInspect = (item) => {
    setSelectedComplaint(item);
    setResolutionStatus(item.status || 'IN_PROGRESS');
    setResolutionRemarks(item.admin_remarks || '');
  };

  const handleSaveResolution = async () => {
    if (!selectedComplaint) return;
    setSavingStatus(true);
    try {
      await updateComplaintStatus(selectedComplaint.id, {
        status: resolutionStatus,
        admin_remarks: resolutionRemarks.trim() || undefined,
      });
      showToast(`Complaint #${selectedComplaint.ticket_number} marked as ${resolutionStatus}.`);
      setSelectedComplaint(null);
      fetchLiveComplaints();
    } catch (err) {
      console.error('Failed to update complaint status:', err);
      showToast(`Error updating status: ${err.message || 'Check connection.'}`);
    } finally {
      setSavingStatus(false);
    }
  };
  const [activeModal, setActiveModal] = useState(null); // 'broadcast' | 'assign'
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState('All Campus Devices');
  const [toastMessage, setToastMessage] = useState('');
  const [assigningTicket, setAssigningTicket] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const exportCsv = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Complaints', '1248'],
      ['Pending Staff Assignment', '7'],
      ['Resolution Rate', '93.6%'],
      ['Lost & Found Recovery', '88.2%'],
      ['Target SLA Adherence', '98.0%'],
      ['Current SLA Adherence', '98.4%'],
      [],
      ['Building', 'Incidents Count'],
      ...CATEGORY_ROWS.map((r) => [r.name, r.incidents]),
      [],
      ['Request ID', 'Category', 'Detail', 'Location', 'Priority', 'Status', 'Assignee'],
      ...requests.map((r) => [r.id, r.category, r.detail, r.location, r.priority, r.status, r.assignee]),
    ];

    const csvContent = rows
      .map((row) => row.map((v) => `"${String(v ?? '').replaceAll('"', '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexus-campus-report-${range.toLowerCase().replace(' ', '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Report CSV successfully generated and downloaded.');
  };

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setActiveModal(null);
    showToast(`Emergency alert pushed to ${broadcastTarget}: "${broadcastMessage.slice(0, 40)}..."`);
    setBroadcastMessage('');
  };

  const handleAutoAssign = (ticket) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === ticket.id ? { ...r, status: 'Assigned', assignee: 'Esakki Muthu (Rapid Dispatch)' } : r))
    );
    setActiveModal(null);
    showToast(`Ticket #${ticket.id} auto-dispatched to nearest available field staff.`);
  };

  const displayedComplaints = useMemo(() => {
    let list = complaintsList;
    if (roleFilter !== 'ALL') {
      list = list.filter((c) => (c.reporter?.role || '').toUpperCase() === roleFilter);
    }
    if (statusFilter !== 'ALL') {
      list = list.filter((c) => (c.status || '').toUpperCase() === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((c) => {
        const ticketMatch = (c.ticket_number || '').toLowerCase().includes(q);
        const titleMatch = (c.title || '').toLowerCase().includes(q);
        const descMatch = (c.description || '').toLowerCase().includes(q);
        const catMatch = (c.category_name || '').toLowerCase().includes(q);
        const roomMatch = (c.room_identifier || '').toLowerCase().includes(q);
        const nameMatch = (c.reporter?.name || '').toLowerCase().includes(q);
        const idMatch = (c.reporter?.identifier || '').toLowerCase().includes(q);
        const regMatch = (c.reporter?.student_details?.register_number || '').toLowerCase().includes(q);
        const facMatch = (c.reporter?.staff_details?.faculty_id || '').toLowerCase().includes(q);
        const deptMatch = (
          (c.reporter?.student_details?.department || '') +
          (c.reporter?.staff_details?.department || '')
        ).toLowerCase().includes(q);
        return ticketMatch || titleMatch || descMatch || catMatch || roomMatch || nameMatch || idMatch || regMatch || facMatch || deptMatch;
      });
    }
    return list;
  }, [complaintsList, roleFilter, statusFilter, searchQuery]);

  const filteredRequests = useMemo(() => {
    if (!searchQuery.trim()) return requests;
    const q = searchQuery.toLowerCase();
    return requests.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.assignee.toLowerCase().includes(q) ||
        r.detail.toLowerCase().includes(q)
    );
  }, [requests, searchQuery]);

  // SVG Donut calculation
  const circumference = 2 * Math.PI * 38;
  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-y-auto overflow-x-hidden bg-slate-50/90 font-sans text-slate-800 antialiased pb-20" style={{ WebkitOverflowScrolling: 'touch' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl border border-blue-200 bg-slate-900 px-5 py-3 text-xs font-semibold text-white shadow-2xl animate-fade-in">
          <Sparkles size={16} className="text-blue-400 animate-pulse" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="ml-2 text-slate-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-lg shadow-sm">
            N
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-slate-900 text-sm sm:text-base">NEXUS</span>
              <span className="rounded bg-blue-50 px-1.5 py-0.2 font-mono text-[10px] font-bold text-blue-700 border border-blue-200">
                CAMPUS ADMIN
              </span>
            </div>
            <p className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">
              Info Institute of Engineering
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            All systems operational
          </span>

          {/* Notifications Popover Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white border-2 border-white">
                6
              </span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl text-xs space-y-2.5 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-slate-900">Campus Alerts & Updates</h4>
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                    2 Critical SLA
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="rounded-xl bg-amber-50 p-2.5 text-amber-900 border border-amber-200/60">
                    <p className="font-bold">Projector Sparking (Lab 302)</p>
                    <p className="text-[11px] text-amber-800">&lt; 30 mins to scheduled CSE-304 lecture.</p>
                  </div>
                  <div className="rounded-xl bg-blue-50 p-2.5 text-blue-900 border border-blue-200/60">
                    <p className="font-bold">4 Match Suggestions Ready</p>
                    <p className="text-[11px] text-blue-800">Lost & Found reconciliation desk awaiting handover pass.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  className="w-full rounded-xl bg-slate-100 py-2 text-center text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                >
                  Close
                </button>
              </div>
            )}
          </div>

          {/* Profile Button */}
          <div className="relative border-l border-slate-200 pl-3">
            <button
              type="button"
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2.5 text-left"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-700 to-indigo-700 text-xs font-bold text-white shadow-xs">
                AT
              </div>
              <div className="hidden md:block">
                <strong className="block text-xs font-bold text-slate-900 leading-tight">
                  Dr. Aris Thorne
                </strong>
                <small className="text-[10px] text-slate-500 font-medium">Campus Administrator</small>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {showProfile && (
              <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl text-xs space-y-2 animate-fade-in">
                <div className="border-b border-slate-100 pb-2">
                  <p className="font-bold text-slate-900">Dr. Aris Thorne</p>
                  <p className="text-slate-500 text-[11px]">aris.thorne@infotech.edu.in</p>
                  <p className="text-[10px] font-mono text-blue-700 mt-0.5">Role: INSTITUTION_ADMIN</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigation?.navigate('StudentFacultyPortal', { role: 'ADMIN', from: 'admin' })}
                  className="w-full text-left rounded-lg p-2 font-semibold text-slate-700 hover:bg-slate-100 flex items-center justify-between"
                >
                  <span>Services Portal</span>
                  <ExternalLink size={13} className="text-slate-400" />
                </button>
                <button
                  type="button"
                  onClick={() => navigation?.navigate('AdminDashboard')}
                  className="w-full text-left rounded-lg p-2 font-semibold text-slate-700 hover:bg-slate-100 flex items-center justify-between"
                >
                  <span>Academic Admin</span>
                  <ArrowRight size={13} className="text-slate-400" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Title Row & Actions */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-[10px] font-extrabold tracking-wider text-blue-700 uppercase mb-1.5 border border-blue-200">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
              CENTRAL COMMAND LIVE
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Campus Administrator Control Center
            </h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Cross-campus service requests, SLA compliance, facility telemetry, and emergency governance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Range selector */}
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-bold text-slate-700 shadow-xs outline-none hover:bg-slate-50 focus:border-blue-500"
            >
              <option>This month</option>
              <option>This week</option>
              <option>Today</option>
              <option>This academic year</option>
            </select>

            {/* Export CSV button */}
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition"
            >
              <Download size={14} className="text-slate-500" />
              Export CSV
            </button>

            {/* Emergency Broadcast button */}
            <button
              type="button"
              onClick={() => setActiveModal('broadcast')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition"
            >
              <Megaphone size={14} />
              Emergency Broadcast
            </button>
          </div>
        </section>

        {/* METRICS KPI GRID */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-slate-300">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Total Complaints
                </span>
                <div className="mt-1 text-3xl font-black text-slate-900 tracking-tight">
                  1,248
                </div>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <FileText size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px]">
              <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 font-bold text-emerald-700">
                <TrendingUp size={12} />
                +12.4% vs last mo
              </span>
              <span className="font-semibold text-slate-500">94 active in queue</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-white to-amber-50/50 p-5 shadow-xs transition hover:border-amber-300">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  Pending Staff Assignment
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">7</span>
                  <span className="text-xs font-bold text-amber-700">Unassigned</span>
                </div>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <AlertTriangle size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-amber-200/60 pt-3 text-[11px]">
              <span className="rounded bg-amber-100 px-2 py-0.5 font-bold text-amber-900">
                2 Critical SLA (&lt;30m)
              </span>
              <button
                type="button"
                onClick={() => {
                  const unassigned = requests.find((r) => r.status === 'Open');
                  if (unassigned) {
                    setAssigningTicket(unassigned);
                    setActiveModal('assign');
                  } else {
                    showToast('All current requests are assigned.');
                  }
                }}
                className="font-extrabold text-blue-600 hover:text-blue-800 transition"
              >
                Auto-dispatch →
              </button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-slate-300">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Resolution Rate
                </span>
                <div className="mt-1 text-3xl font-black text-slate-900 tracking-tight">
                  93.6%
                </div>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px]">
              <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 font-bold text-emerald-700">
                <TrendingUp size={12} />
                ↑ 4.2% improvement
              </span>
              <span className="font-semibold text-slate-500">Avg 18.4 hrs</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-slate-300">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Lost & Found Recovery
                </span>
                <div className="mt-1 text-3xl font-black text-slate-900 tracking-tight">
                  88.2%
                </div>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Box size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px]">
              <span className="rounded bg-blue-50 px-2 py-0.5 font-bold text-blue-700">
                ✦ +6.1% AI image lift
              </span>
              <span className="font-semibold text-slate-500">142/161 claimed</span>
            </div>
          </div>
        </section>

        {/* CHARTS GRID (STACKED BAR & DONUT CHART) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Stacked Bar Chart by Building */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">Complaints by Category & Building</h3>
                <p className="text-xs text-slate-400">Distribution of reported campus issues</p>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                {CATEGORIES.map((c) => (
                  <span key={c.label} className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: c.color }} />
                    {c.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Rows */}
            <div className="space-y-4 pt-1">
              {CATEGORY_ROWS.map((row) => (
                <div key={row.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{row.name}</span>
                      {row.highest && (
                        <span className="rounded border border-rose-200 bg-rose-50 px-1.5 py-0.2 text-[9px] font-extrabold uppercase text-rose-700">
                          Highest vol
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-slate-500">{row.incidents} incidents</span>
                  </div>

                  {/* Stacked Progress Bar */}
                  <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
                    {row.values.map((val, idx) => (
                      <div
                        key={CATEGORIES[idx].label}
                        title={`${CATEGORIES[idx].label}: ${val}%`}
                        style={{ width: `${val}%`, backgroundColor: CATEGORIES[idx].color }}
                        className="h-full transition-all duration-300 hover:opacity-90"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 border-t border-slate-100 pt-3">
              Electrical and plumbing reports account for over 58% of all campus maintenance dispatches.
            </p>
          </div>

          {/* RIGHT: Donut Chart Status & SLA Risk */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">Complaint Status & SLA Risk</h3>
              <p className="text-xs text-slate-400">Current resolution overview & SLA compliance</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
              {/* SVG Donut */}
              <div className="relative h-40 w-40 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90 transform">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="14" />
                  {(() => {
                    let donutOffset = 0;
                    return STATUSES.map((s) => {
                      const len = (circumference * s.percent) / 100;
                      const offset = donutOffset;
                      donutOffset += len;
                      return (
                        <circle
                          key={s.label}
                          cx="50"
                          cy="50"
                          r="38"
                          fill="none"
                          stroke={s.color}
                          strokeWidth="14"
                          strokeDasharray={`${len} ${circumference - len}`}
                          strokeDashoffset={-offset}
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute flex flex-col items-center text-center pointer-events-none">
                  <strong className="text-2xl font-black text-slate-900 leading-none">1,248</strong>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mt-1">
                    Total Records
                  </span>
                </div>
              </div>

              {/* Status Legend Breakdown */}
              <div className="w-full space-y-2 text-xs">
                {STATUSES.map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-medium text-slate-600">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                      {s.label}
                    </span>
                    <strong className="text-slate-800 font-bold">
                      {s.count.toLocaleString()} <small className="text-slate-400 font-normal">({s.percent}%)</small>
                    </strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Adherence Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
              <span>Target Adherence: <strong className="text-slate-800 font-bold">98.0%</strong></span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Current: 98.4%
              </span>
            </div>
          </div>
        </section>

        {/* MASTER COMPLAINT DISPATCH CONSOLE (TABLE) */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="flex flex-col gap-3 p-5 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900">Master Complaint & Grievance Console</h3>
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-extrabold text-blue-700">
                    Live Database
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time grievance tickets submitted by Students and Faculty/Staff with verified user credentials
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchLiveComplaints}
                  className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition"
                  title="Refresh complaints"
                >
                  <RefreshCw size={14} className={loadingComplaints ? "animate-spin" : ""} />
                </button>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, roll, dept, issue..."
                    className="rounded-xl border border-slate-200 bg-slate-50/70 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-blue-500 focus:bg-white w-56 sm:w-64"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => navigation?.navigate('StudentFacultyPortal', { role: 'ADMIN', from: 'admin' })}
                  className="rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition whitespace-nowrap"
                >
                  Campus Services →
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold mr-1">Role:</span>
                {[
                  { key: 'ALL', label: `All (${complaintsList.length})` },
                  { key: 'STUDENT', label: `Students (${complaintsList.filter(c => (c.reporter?.role || '').toUpperCase() === 'STUDENT').length})` },
                  { key: 'STAFF', label: `Faculty & Staff (${complaintsList.filter(c => (c.reporter?.role || '').toUpperCase() === 'STAFF').length})` },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setRoleFilter(tab.key)}
                    className={`rounded-lg px-2.5 py-1 text-xs transition ${
                      roleFilter === tab.key
                        ? 'bg-blue-600 text-white font-bold shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold mr-1">Status:</span>
                {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`rounded-lg px-2.5 py-1 text-xs transition ${
                      statusFilter === st
                        ? 'bg-slate-900 text-white font-bold shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'ALL' ? 'All Status' : st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Complaints Table with Submitter Relative Data */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="border-b border-slate-100 bg-slate-50/60 font-bold uppercase tracking-wider text-[10px] text-slate-400">
                <tr>
                  <th className="px-5 py-3">Ticket / Priority</th>
                  <th className="px-5 py-3">Complaint Details</th>
                  <th className="px-5 py-3">Location / Room</th>
                  <th className="px-5 py-3">Submitter (User Relative Data)</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400 text-xs">
                      No complaints found matching the selected filter criteria.
                    </td>
                  </tr>
                ) : (
                  displayedComplaints.map((c) => {
                    const isStaff = (c.reporter?.role || '').toUpperCase() === 'STAFF';
                    const isStudent = (c.reporter?.role || '').toUpperCase() === 'STUDENT';
                    const prio = (c.priority || 'MEDIUM').toUpperCase();
                    const st = (c.status || 'OPEN').toUpperCase();

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/60 transition">
                        {/* Ticket & Priority */}
                        <td className="px-5 py-3.5 align-top">
                          <span className="font-mono font-bold text-blue-700 block text-xs">
                            #{c.ticket_number}
                          </span>
                          <span className={`inline-block rounded-md px-1.5 py-0.5 text-[9px] font-extrabold mt-1 border ${
                            prio === 'URGENT'
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : prio === 'HIGH'
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {prio}
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-1">
                            {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'Recent'}
                          </span>
                        </td>

                        {/* Complaint Details */}
                        <td className="px-5 py-3.5 align-top max-w-xs">
                          <span className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 mb-1">
                            {c.category_name}
                          </span>
                          <strong className="block text-slate-900 font-bold leading-snug">
                            {c.title}
                          </strong>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {c.description}
                          </p>
                          {c.admin_remarks && (
                            <div className="mt-1.5 rounded-lg bg-blue-50 border border-blue-200 p-1.5 text-[10px] text-blue-800">
                              <strong>Admin Remark:</strong> {c.admin_remarks}
                            </div>
                          )}
                        </td>

                        {/* Location / Room */}
                        <td className="px-5 py-3.5 align-top font-medium text-slate-600 whitespace-nowrap">
                          <span className="flex items-center gap-1 text-slate-800 font-semibold">
                            📍 {c.room_identifier || c.location_name || 'Campus Premises'}
                          </span>
                        </td>

                        {/* Submitter User Relative Data */}
                        <td className="px-5 py-3.5 align-top">
                          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <strong className="text-slate-900 font-bold text-xs">
                                {c.reporter?.name || 'Campus Member'}
                              </strong>
                              <span className={`rounded-md px-1.5 py-0.2 text-[9px] font-extrabold uppercase tracking-wider ${
                                isStaff
                                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                  : isStudent
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : 'bg-slate-200 text-slate-800'
                              }`}>
                                {c.reporter?.role || 'STUDENT'}
                              </span>
                            </div>

                            {/* Student Relative Credentials */}
                            {isStudent && (
                              <div className="text-[11px] text-slate-600 space-y-0.5 pt-0.5 border-t border-slate-200/60">
                                <div>
                                  <span className="text-slate-400 font-semibold">Reg No: </span>
                                  <strong className="font-mono text-slate-800">{c.reporter?.student_details?.register_number || c.reporter?.identifier}</strong>
                                  {c.reporter?.student_details?.roll_number && (
                                    <span className="text-slate-500 font-mono ml-1.5">({c.reporter?.student_details?.roll_number})</span>
                                  )}
                                </div>
                                <div>
                                  <span className="text-slate-400 font-semibold">Dept: </span>
                                  <span className="text-slate-700">{c.reporter?.student_details?.department || 'Information Technology'}</span>
                                  {c.reporter?.student_details?.section && (
                                    <span className="font-semibold text-slate-600 ml-1">• Sec {c.reporter?.student_details?.section}</span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Staff Relative Credentials */}
                            {isStaff && (
                              <div className="text-[11px] text-slate-600 space-y-0.5 pt-0.5 border-t border-slate-200/60">
                                <div>
                                  <span className="text-slate-400 font-semibold">Faculty ID: </span>
                                  <strong className="font-mono text-slate-800">{c.reporter?.staff_details?.faculty_id || c.reporter?.identifier}</strong>
                                </div>
                                <div>
                                  <span className="text-slate-400 font-semibold">Desig: </span>
                                  <span className="text-slate-700">{c.reporter?.staff_details?.designation || 'Faculty Member'}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 font-semibold">Dept: </span>
                                  <span className="text-slate-700">{c.reporter?.staff_details?.department || 'Computer Science'}</span>
                                  {c.reporter?.staff_details?.cabin_number && (
                                    <span className="text-slate-600 ml-1">• Cabin {c.reporter?.staff_details?.cabin_number}</span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Contact Details */}
                            <div className="text-[10px] text-slate-400 pt-0.5 flex flex-wrap gap-2">
                              {c.reporter?.email && (
                                <span>✉️ {c.reporter.email}</span>
                              )}
                              {c.reporter?.phone && (
                                <span>📞 {c.reporter.phone}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5 align-top">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border ${
                            st === 'RESOLVED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : st === 'IN_PROGRESS'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : st === 'REJECTED'
                              ? 'bg-slate-100 text-slate-600 border-slate-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              st === 'RESOLVED' ? 'bg-emerald-500' : st === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-amber-500'
                            }`} />
                            {st === 'IN_PROGRESS' ? 'In Progress' : st.replace('_', ' ')}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 align-top text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenInspect(c)}
                            className="rounded-lg bg-blue-600 px-3 py-1.5 font-bold text-white hover:bg-blue-700 shadow-2xs text-[11px] whitespace-nowrap transition"
                          >
                            Inspect & Resolve
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
            <span>Showing {displayedComplaints.length} of {complaintsList.length} verified submissions</span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500">
                Live Postgres & SQLite synchronized
              </span>
            </div>
          </div>
        </section>

        {/* OPERATIONS HEALTH TRIAD */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 font-extrabold text-lg">
              ⌕
            </div>
            <div className="space-y-1.5 flex-1">
              <h4 className="text-xs font-bold text-slate-900">Lost & Found Recovery</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                142 items returned to their owners out of 161 reported across campus.
              </p>
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: '88.2%' }} />
              </div>
              <strong className="text-purple-700 text-[11px] font-extrabold block">88.2% recovery rate</strong>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-extrabold text-lg">
              ✓
            </div>
            <div className="space-y-1.5 flex-1">
              <h4 className="text-xs font-bold text-slate-900">Secure Custody Vault</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                All physical lockers tracked with zero-trust verified handover codes.
              </p>
              <strong className="text-emerald-700 text-[11px] font-extrabold block">Custody log active • Zero fraud</strong>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-extrabold text-lg">
              ⌁
            </div>
            <div className="space-y-1.5 flex-1">
              <h4 className="text-xs font-bold text-slate-900">Campus Dispatch Mesh</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Field technicians routed via LoRa beacon grid across 5 campus blocks.
              </p>
              <strong className="text-blue-700 text-[11px] font-extrabold block">Network connected • 12ms latency</strong>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 text-xs text-slate-400">
          <div>© 2026 NEXUS • Info Institute of Engineering</div>
          <div>Campus operations dashboard • {range}</div>
        </footer>
      </main>

      {/* ================= MODAL: EMERGENCY BROADCAST ================= */}
      {activeModal === 'broadcast' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-rose-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                  <Megaphone size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-rose-950">Campus Emergency Broadcast</h3>
                  <p className="text-xs text-rose-700">Broadcast immediate high-priority alert across campus portals</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Audience</label>
                <select
                  value={broadcastTarget}
                  onChange={(e) => setBroadcastTarget(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none font-semibold"
                >
                  <option>All Campus Devices (Students, Faculty & Staff)</option>
                  <option>Science Quad & Academic Block B Only</option>
                  <option>On-Duty Facilities & Dispatch Crews</option>
                  <option>Campus Security & Proctor Squads</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Broadcast Message Content *</label>
                <textarea
                  required
                  rows={4}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="e.g. Precautionary power isolation in Quad B due to feeder maintenance. Avoid corridor B2 until 03:00 PM."
                  className="w-full rounded-xl border border-slate-300 p-3 leading-relaxed outline-none focus:border-rose-500"
                />
              </div>

              <div className="rounded-xl bg-rose-50 p-3 text-rose-900 border border-rose-200 flex items-start gap-2">
                <ShieldAlert size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Emergency broadcasts trigger high-priority push notifications and top banner takeovers on student and faculty interfaces.
                </p>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="rounded-xl px-4 py-2 font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 px-5 py-2 font-bold text-white hover:bg-rose-700 shadow-sm"
                >
                  Send Emergency Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADMIN COMPLAINT INSPECT & RESOLVE ================= */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-up my-auto max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Complaint Ticket #{selectedComplaint.ticket_number}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Lodged {selectedComplaint.created_at ? new Date(selectedComplaint.created_at).toLocaleString() : 'Recently'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Submitter Full Relative Profile Card */}
            <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">
                  Verified Submitter Credentials
                </span>
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                  (selectedComplaint.reporter?.role || '').toUpperCase() === 'STAFF'
                    ? 'bg-purple-600 text-white'
                    : 'bg-blue-600 text-white'
                }`}>
                  {selectedComplaint.reporter?.role || 'STUDENT'}
                </span>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white border border-blue-200 text-blue-700 font-extrabold text-sm shadow-xs">
                  {selectedComplaint.reporter?.name?.slice(0, 2).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-900">
                    {selectedComplaint.reporter?.name || 'Campus Member'}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                    <span>Identifier: <strong className="font-mono text-slate-800">{selectedComplaint.reporter?.identifier}</strong></span>
                    {selectedComplaint.reporter?.email && (
                      <span className="text-slate-500">✉️ {selectedComplaint.reporter.email}</span>
                    )}
                    {selectedComplaint.reporter?.phone && (
                      <span className="text-slate-500">📞 {selectedComplaint.reporter.phone}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Student Details Grid */}
              {selectedComplaint.reporter?.student_details && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-blue-200/60 text-xs">
                  <div className="rounded-xl bg-white/80 p-2 border border-blue-100">
                    <span className="text-[10px] text-slate-400 block font-bold">Register No</span>
                    <strong className="font-mono text-slate-900">{selectedComplaint.reporter.student_details.register_number || 'N/A'}</strong>
                  </div>
                  <div className="rounded-xl bg-white/80 p-2 border border-blue-100">
                    <span className="text-[10px] text-slate-400 block font-bold">Roll No</span>
                    <strong className="font-mono text-slate-900">{selectedComplaint.reporter.student_details.roll_number || 'N/A'}</strong>
                  </div>
                  <div className="rounded-xl bg-white/80 p-2 border border-blue-100">
                    <span className="text-[10px] text-slate-400 block font-bold">Department</span>
                    <span className="font-medium text-slate-900 truncate block">{selectedComplaint.reporter.student_details.department || 'N/A'}</span>
                  </div>
                  <div className="rounded-xl bg-white/80 p-2 border border-blue-100">
                    <span className="text-[10px] text-slate-400 block font-bold">Section</span>
                    <span className="font-bold text-slate-900">{selectedComplaint.reporter.student_details.section || 'A'}</span>
                  </div>
                </div>
              )}

              {/* Staff Details Grid */}
              {selectedComplaint.reporter?.staff_details && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-purple-200/60 text-xs">
                  <div className="rounded-xl bg-white/80 p-2 border border-purple-100">
                    <span className="text-[10px] text-slate-400 block font-bold">Faculty ID</span>
                    <strong className="font-mono text-slate-900">{selectedComplaint.reporter.staff_details.faculty_id || 'N/A'}</strong>
                  </div>
                  <div className="rounded-xl bg-white/80 p-2 border border-purple-100">
                    <span className="text-[10px] text-slate-400 block font-bold">Designation</span>
                    <span className="font-semibold text-slate-900 truncate block">{selectedComplaint.reporter.staff_details.designation || 'Faculty'}</span>
                  </div>
                  <div className="rounded-xl bg-white/80 p-2 border border-purple-100">
                    <span className="text-[10px] text-slate-400 block font-bold">Department</span>
                    <span className="font-medium text-slate-900 truncate block">{selectedComplaint.reporter.staff_details.department || 'N/A'}</span>
                  </div>
                  <div className="rounded-xl bg-white/80 p-2 border border-purple-100">
                    <span className="text-[10px] text-slate-400 block font-bold">Cabin</span>
                    <span className="font-bold text-slate-900">{selectedComplaint.reporter.staff_details.cabin_number || 'N/A'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Complaint Info */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                  {selectedComplaint.category_name}
                </span>
                <span className="font-semibold text-slate-600">
                  📍 {selectedComplaint.room_identifier || selectedComplaint.location_name || 'Campus Premises'}
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900 pt-1">
                {selectedComplaint.title}
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {selectedComplaint.description}
              </p>
            </div>

            {/* Status Update & Resolution Remarks */}
            <div className="space-y-3 pt-1 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Update Resolution Status
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'OPEN', label: 'Open', color: 'bg-amber-500 text-white' },
                    { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-600 text-white' },
                    { id: 'RESOLVED', label: 'Resolved', color: 'bg-emerald-600 text-white' },
                    { id: 'REJECTED', label: 'Dismissed', color: 'bg-slate-600 text-white' },
                  ].map((s) => {
                    const isCur = resolutionStatus === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setResolutionStatus(s.id)}
                        className={`rounded-xl py-2 text-xs font-bold transition border ${
                          isCur
                            ? `${s.color} border-transparent shadow-xs`
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Admin Resolution Remarks / Custody Notes
                </label>
                <textarea
                  rows={3}
                  value={resolutionRemarks}
                  onChange={(e) => setResolutionRemarks(e.target.value)}
                  placeholder="e.g. Field technician assigned; component replaced and verified; notification sent to user."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white resize-none"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Close
              </button>
              <button
                type="button"
                disabled={savingStatus}
                onClick={handleSaveResolution}
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition disabled:opacity-50 shadow-xs"
              >
                {savingStatus ? 'Saving Updates...' : 'Save Status & Remarks'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: AUTO-DISPATCH ASSIGNMENT ================= */}
      {activeModal === 'assign' && assigningTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck size={20} className="text-blue-600" />
                <h3 className="text-sm font-black text-slate-900">Auto-Dispatch Technician</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X size={16} />
              </button>
            </div>

            <div className="rounded-2xl bg-blue-50/70 p-4 border border-blue-100 text-xs space-y-1">
              <span className="font-bold text-blue-900 block">Ticket #{assigningTicket.id}</span>
              <p className="text-blue-800">{assigningTicket.category}: {assigningTicket.detail}</p>
              <p className="text-slate-500 font-medium">{assigningTicket.location} • Priority: {assigningTicket.priority}</p>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-700 block">Recommended Dispatch Technician:</span>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 block font-bold">Esakki Muthu</strong>
                  <span className="text-[11px] text-slate-500">Plumbing & Facilities Shift B • Proximity: 45m</span>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                  Available
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-xl px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleAutoAssign(assigningTicket)}
                className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 shadow-sm text-xs"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
