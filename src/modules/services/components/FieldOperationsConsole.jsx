import React, { useState, useMemo, useRef } from 'react';
import {
  Activity, AlertTriangle, Camera, Check, CheckCircle2, Clock, Clock3,
  MapPin, Phone, PlayCircle, Plus, Search, UserRound, Wrench, Zap,
  ArrowLeft, Shield, Eye, RefreshCw, X, Box, CheckCheck, FileText,
  SlidersHorizontal, ChevronDown, Radio, ExternalLink, HelpCircle
} from 'lucide-react';

const INITIAL_ORDERS = [
  {
    id: 'CMP-108',
    status: 'In Progress',
    trade: 'Plumbing & Water Systems',
    tradeColor: 'blue',
    priority: '3 Student Upvotes • High Cluster Alert',
    priorityTone: 'rose',
    reported: 'Reported 2h 15m ago by Priya M. (Upvoted by Kamesh & 2 others)',
    location: 'Academic Block B',
    detail: 'Floor 2, Corridor near Staircase B / Central Water Hub',
    beacon: 'Beacon #AC-B2-04 (Signal: 98%)',
    issue: 'The drinking water cooler unit on the 2nd floor landing is continuously leaking water across the corridor floor tile, creating a slip hazard near the central staircase. Flow valve appears loose and does not fully shut off after release.',
    model: 'Aquasure Ind. B-20',
    serviced: '42 days ago (Passed)',
    pressure: '2.4 Bar (Normal)',
    remarks: 'Inspected solenoid valve. Tightened brass connector joint and replaced worn O-ring seal. Flushing pressure test underway.',
    parts: ['1x Brass Coupling 15mm (Part #BC-15)', '1x Rubber O-Ring Seal 18mm'],
    photos: [
      {
        label: 'Before Fix',
        url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=700&q=80',
        verified: false,
      },
      {
        label: 'Fixed & Dry',
        url: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=700&q=80',
        verified: true,
      },
    ],
    primary: 'Mark as Resolved & Notify Students',
    active: true,
  },
  {
    id: 'CMP-104',
    status: 'Assigned',
    trade: 'IT & Classroom AV',
    tradeColor: 'indigo',
    priority: 'Urgent SLA (< 45 mins remaining)',
    priorityTone: 'rose',
    reported: 'Reported Today 09:15 AM by Prof. Sundaram (CSE Dept)',
    location: 'Science Quad - Block B',
    detail: '3rd Floor, Software Systems Lab 302 (Ceiling Mount Station 1)',
    beacon: 'Class Lecture at 1:30 PM (Urgent)',
    issue: 'Projector ceiling unit sparking visibly on HDMI auto-switch and rapidly overheating within 90 seconds. Circuit fan emits a loud buzzing sound. Urgent resolution needed prior to scheduled CSE-304 lab lecture.',
    note: 'lamp_diagnostics.log • Error Code E-04: Optical lamp power rail fluctuations; thermal safety cutoff activated.',
    target: '< 45m',
    backup: 'AV Store Room 102',
    photo: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80',
    primary: 'Start Work (Mark In Progress & Lock Route)',
    active: false,
  },
  {
    id: 'CMP-112',
    status: 'Assigned',
    trade: 'Electrical & Power Safety',
    tradeColor: 'amber',
    priority: 'Medium Priority • 24h SLA',
    priorityTone: 'amber',
    reported: 'Reported 35 mins ago by Student Kamesh S.',
    location: 'Main Canteen East Patio',
    detail: 'Outdoor Seating Station #4 (Near Canopy column 3)',
    beacon: 'Breaker BR-4 Tripped Remotely (Safe to Inspect)',
    issue: 'Outdoor weather-proof power socket protective flap cover is cracked and hung loose. Minor sparking witnessed during a light drizzle earlier this morning. Security facility admin remotely tripped panel breaker BR-4 to avert risk. New IP66 weather-resistant double box required.',
    lockout: 'LOTO-SCE-9912 (Active Breaker Lock)',
    hardware: '1x IP66 Dual Gang Outdoor Outlet Cover (Bin C-12)',
    photo: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=900&q=80',
    primary: 'Start Work (Mark In Progress)',
    active: false,
  },
];

const WAREHOUSE_PARTS = [
  { id: 'PART-101', name: 'Brass Coupling 15mm (Part #BC-15)', trade: 'Plumbing', stock: 14, location: 'Bin P-04' },
  { id: 'PART-102', name: 'Rubber O-Ring Seal 18mm (Part #OR-18)', trade: 'Plumbing', stock: 45, location: 'Bin P-09' },
  { id: 'PART-103', name: 'High-Lumen Optical Lamp Unit 240W', trade: 'Classroom AV', stock: 3, location: 'Vault AV-02' },
  { id: 'PART-104', name: 'IP66 Dual Gang Weatherproof Box', trade: 'Electrical', stock: 8, location: 'Bin C-12' },
  { id: 'PART-105', name: 'Single Pole MCB 16A C-Curve Breaker', trade: 'Electrical', stock: 19, location: 'Bin E-01' },
];

export default function FieldOperationsConsole({ onBack, onOpenReportIssue }) {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [query, setQuery] = useState('');
  const [zone, setZone] = useState('all');
  const [status, setStatus] = useState('active');
  const [trade, setTrade] = useState('all');
  const [sort, setSort] = useState('Urgency / SLA Priority');
  const [remarks, setRemarks] = useState(INITIAL_ORDERS[0].remarks);
  const [notice, setNotice] = useState('');
  const [activeModal, setActiveModal] = useState(null);
  const [spareRequisitionSuccess, setSpareRequisitionSuccess] = useState('');
  const fileInputRef = useRef(null);

  const showNotification = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 4500);
  };

  const handleUpdateStatus = (id, newStatus, message) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          return {
            ...o,
            status: newStatus,
            active: newStatus === 'In Progress',
          };
        }
        // If another item was set to In Progress, update active flag
        if (newStatus === 'In Progress') {
          return { ...o, active: false };
        }
        return o;
      })
    );
    showNotification(message);
  };

  const handleAction = (label, id) => {
    if (label.includes('Resolved') || label === 'Quick Resolve') {
      handleUpdateStatus(id || 'CMP-108', 'Resolved', `Work order ${id || 'CMP-108'} marked Resolved. Student notification broadcast sent.`);
    } else if (label.includes('Start Work')) {
      handleUpdateStatus(id, 'In Progress', `Work order ${id} moved to In Progress. GPS route locked.`);
    } else if (label.includes('Pause') || label.includes('Spares')) {
      setActiveModal('spares');
    } else if (label.includes('Photo') || label === 'Quick Snap') {
      fileInputRef.current?.click();
    } else if (label.includes('Site Map')) {
      setActiveModal('map');
    } else if (label.includes('AV Backup')) {
      showNotification('AV backup unit reserved at Store Room 102 for ticket CMP-104.');
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    showNotification(`Field inspection photo "${file.name}" uploaded and hashed to work order audit log.`);
  };

  const handleRequisitionPart = (part) => {
    setSpareRequisitionSuccess(`Requisition code #${part.id}-REQ issued for "${part.name}". Vault staff notified.`);
    setTimeout(() => {
      setSpareRequisitionSuccess('');
      setActiveModal(null);
      showNotification(`Requisition confirmed for ${part.name}. Dispatched to Quad Locker.`);
    }, 1800);
  };

  const activeJob = useMemo(() => orders.find((o) => o.status === 'In Progress'), [orders]);

  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        const text = `${o.id} ${o.location} ${o.detail} ${o.trade} ${o.issue}`.toLowerCase();
        const matchesQuery = text.includes(query.toLowerCase());
        const matchesZone = zone === 'all' || o.location.toLowerCase().includes(zone.toLowerCase());
        const matchesTrade = trade === 'all' || o.trade.toLowerCase().includes(trade.toLowerCase());
        const matchesStatus =
          status === 'all' ||
          (status === 'active' && o.status !== 'Resolved') ||
          (status === 'progress' && o.status === 'In Progress') ||
          (status === 'assigned' && o.status.startsWith('Assigned')) ||
          (status === 'resolved' && o.status === 'Resolved');
        return matchesQuery && matchesZone && matchesTrade && matchesStatus;
      })
      .sort((a, b) => {
        if (sort === 'Urgency / SLA Priority') {
          return a.priority.includes('Urgent') ? -1 : 1;
        }
        if (sort === 'Most Upvoted by Students (3+)') {
          return a.priority.includes('Upvotes') ? -1 : 1;
        }
        return 0;
      });
  }, [orders, query, zone, status, trade, sort]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10 font-sans text-slate-800 animate-fade-in">
      {/* Hidden file input for quick photos */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoUpload}
      />


      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Field Dispatch & Work Orders
            </h1>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-extrabold text-blue-800">
              Console v2.4
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">
            Manage physical campus maintenance dispatches, service-level targets, telemetry diagnostic logs, and verified repair completion.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveModal('spares')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Plus size={15} />
            Request Spares
          </button>
        </div>
      </div>

      {/* Real-time Notification Banner */}
      {notice && (
        <div className="flex items-center justify-between rounded-2xl border border-blue-200 bg-blue-50/90 p-4 text-xs font-bold text-blue-900 shadow-xs animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice('')} className="text-slate-400 hover:text-slate-700">
            <X size={15} />
          </button>
        </div>
      )}

      {/* OPERATIONS KPI SUMMARY CARDS */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition hover:border-slate-300">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Assigned to Me</span>
            <span className="rounded-lg bg-blue-50 p-1.5 text-blue-600"><UserRound size={16} /></span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {orders.filter((o) => o.status !== 'Resolved').length}
            </span>
            <span className="text-xs font-medium text-slate-500">1 Critical • 2 Routine</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition hover:border-slate-300">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">In Progress</span>
            <span className="rounded-lg bg-amber-50 p-1.5 text-amber-600"><Clock3 size={16} /></span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">
              {orders.filter((o) => o.status === 'In Progress').length}
            </span>
            <span className="text-xs font-medium text-slate-500">Block B Level 2</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition hover:border-slate-300">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Resolved Today</span>
            <span className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600"><CheckCircle2 size={16} /></span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">
              {5 + orders.filter((o) => o.status === 'Resolved').length}
            </span>
            <span className="text-xs font-bold text-emerald-600">98.2% SLA</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition hover:border-slate-300">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Turnaround</span>
            <span className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600"><Activity size={16} /></span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">34m</span>
            <span className="text-xs font-semibold text-emerald-600">−6m vs Target</span>
          </div>
        </div>
      </section>

      {/* FILTER & DISPATCH SEARCH TOOLBAR */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center justify-between">
          <div className="relative flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ticket #, location, equipment model, or keywords..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-3 pr-8 font-semibold text-slate-700 outline-none hover:bg-slate-100"
            >
              <option value="all">All Campus Zones</option>
              <option value="Academic Block B">Academic Block B</option>
              <option value="Science Quad">Science Quad</option>
              <option value="Main Canteen">Main Canteen</option>
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-3 pr-8 font-semibold text-slate-700 outline-none hover:bg-slate-100"
            >
              <option value="active">Status: Active & Assigned</option>
              <option value="progress">Status: In Progress</option>
              <option value="assigned">Status: Assigned</option>
              <option value="resolved">Status: Resolved</option>
              <option value="all">All Statuses</option>
            </select>

            <select
              value={trade}
              onChange={(e) => setTrade(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-3 pr-8 font-semibold text-slate-700 outline-none hover:bg-slate-100"
            >
              <option value="all">All Trades</option>
              <option value="Plumbing">Plumbing & Water</option>
              <option value="IT">Classroom AV / IT</option>
              <option value="Electrical">Electrical Safety</option>
            </select>
          </div>
        </div>

        {/* Quick Sorting Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-400">Sort By:</span>
            {['Urgency / SLA Priority', 'Most Upvoted by Students (3+)', 'Nearest Beacon (GPS)'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSort(s)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                  sort === s
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            Displaying {filteredOrders.length} active dispatches of {orders.length}
          </span>
        </div>
      </section>

      {/* DISPATCH WORK ORDERS FEED */}
      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
            <Search size={28} className="mx-auto mb-3 text-slate-400" />
            <h3 className="text-base font-bold text-slate-800">No Work Orders Found</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              No field orders match your search filters. Try clearing your query or switching trades.
            </p>
            <button
              onClick={() => { setQuery(''); setZone('all'); setStatus('active'); setTrade('all'); }}
              className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isResolved = order.status === 'Resolved';
            const isInProgress = order.status === 'In Progress';

            return (
              <article
                key={order.id}
                className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md animate-fade-in ${
                  order.active
                    ? 'border-2 border-blue-500 ring-2 ring-blue-100 shadow-md'
                    : 'border-slate-200'
                } ${isResolved ? 'opacity-70 bg-slate-50/50' : ''}`}
              >
                {/* Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50/80 px-5 py-3.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-base font-black tracking-tight text-slate-900">
                      #{order.id}
                    </span>

                    {/* Status Pill */}
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-extrabold ${
                      isInProgress
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : isResolved
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {isInProgress && <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-ping" />}
                      {isResolved && <Check size={11} strokeWidth={3} />}
                      {order.status}
                    </span>

                    {/* Trade Pill */}
                    <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                      {order.trade}
                    </span>

                    {/* Priority Alert Badge */}
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                      order.priorityTone === 'rose'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {order.priority}
                    </span>
                  </div>

                  <span className="text-[11px] font-medium text-slate-400">
                    {order.reported}
                  </span>
                </div>

                {/* Sub-header Location & Telemetry Beacon */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100 bg-blue-50/50 px-5 py-2.5 text-xs font-medium text-blue-950">
                  <div className="flex items-center gap-2">
                    <MapPin size={15} className="shrink-0 text-blue-600" />
                    <span><strong>{order.location}</strong> • {order.detail}</span>
                  </div>
                  <span className="font-mono text-[11px] text-blue-700 font-bold">
                    {order.beacon}
                  </span>
                </div>

                {/* Main Card Body */}
                <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-12">
                  <div className="space-y-4 lg:col-span-8">
                    {/* Reported Issue Summary */}
                    <div>
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Incident Report & Observation
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-800 font-medium">
                        {order.issue}
                      </p>
                    </div>

                    {/* Trade-Specific Specs */}
                    {order.id === 'CMP-108' ? (
                      <>
                        <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs sm:grid-cols-3">
                          <div>
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Unit Model</span>
                            <b className="text-slate-800">{order.model}</b>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Last Serviced</span>
                            <b className="text-slate-800">{order.serviced}</b>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Line Pressure</span>
                            <b className="text-blue-700 font-bold">{order.pressure}</b>
                          </div>
                        </div>

                        {/* Editable Remarks with simulated autosave */}
                        <div>
                          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                            <label htmlFor="remarks" className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                              Technician Remarks & Action Record
                            </label>
                            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                              <Check size={11} strokeWidth={3} />
                              Live telemetry autosaved
                            </span>
                          </div>
                          <textarea
                            id="remarks"
                            rows={3}
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Record steps taken, seals replaced, and testing observation..."
                            className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800 leading-relaxed outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>

                        {/* Logged Spares Chips */}
                        <div>
                          <span className="mb-2 block text-xs font-bold text-slate-700">Logged Spares Requisition:</span>
                          <div className="flex flex-wrap gap-2">
                            {order.parts.map((p) => (
                              <span
                                key={p}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-700"
                              >
                                <Wrench size={12} className="text-slate-500" />
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : order.id === 'CMP-104' ? (
                      <>
                        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-950">
                          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
                          <span><b>Diagnostic Log:</b> {order.note}</span>
                        </div>
                        <div className="text-xs text-slate-600 space-y-1">
                          <p><strong className="text-slate-800">Resolution Target:</strong> {order.target}</p>
                          <p><strong className="text-slate-800">Backup Unit Staged:</strong> {order.backup}</p>
                        </div>
                      </>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Safety Lockout Tag</span>
                          <b className="font-mono text-slate-800">{order.lockout}</b>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Required Hardware</span>
                          <b className="text-slate-800">{order.hardware}</b>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Photo Documentation Column */}
                  <div className="border-t border-slate-200 pt-4 lg:col-span-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0 space-y-3">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Photo Documentation & Verification
                    </h3>

                    {order.photos ? (
                      <div className="grid grid-cols-2 gap-2">
                        {order.photos.map((p) => (
                          <div key={p.label} className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100 group">
                            <img src={p.url} alt={p.label} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                            <span className={`absolute left-2 top-2 rounded px-1.5 py-0.5 text-[9px] font-extrabold text-white ${
                              p.verified ? 'bg-emerald-600' : 'bg-rose-600'
                            }`}>
                              {p.label}
                            </span>
                            {p.verified && (
                              <span className="absolute bottom-2 right-2 rounded bg-slate-900/80 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-300">
                                Verified
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="relative aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-100 group">
                        <img src={order.photo} alt={order.id} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                        <span className="absolute left-2 top-2 rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-extrabold text-white">
                          Incident Photo
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                      <Camera size={14} />
                      Attach Additional Field Photo
                    </button>
                  </div>
                </div>

                {/* Footer Pipeline & Actions Bar */}
                {order.id === 'CMP-108' ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/90 px-5 py-3 text-xs">
                    {/* Stepper Pipeline */}
                    <div className="flex flex-wrap items-center gap-2 text-slate-500 font-semibold text-[11px]">
                      <b className="uppercase tracking-wider text-slate-700">Pipeline:</b>
                      <span className="text-emerald-600">✓ Submitted (10:15 AM)</span>
                      <span>→</span>
                      <span className="text-emerald-600">✓ Assigned (10:40 AM)</span>
                      <span>→</span>
                      <span className={`rounded-full px-2 py-0.5 font-bold ${
                        isResolved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isResolved ? '✓ Resolved' : 'In Progress (Active)'}
                      </span>
                      <span>→</span>
                      <span>Sign-off</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleAction('Pause', order.id)}
                        className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-bold text-slate-700 hover:bg-slate-50 transition"
                      >
                        Pause / Need Spares
                      </button>
                      <button
                        type="button"
                        disabled={isResolved}
                        onClick={() => handleAction('Mark as Resolved & Notify Students', order.id)}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check size={14} strokeWidth={3} />
                        {isResolved ? 'Resolved & Closed' : 'Mark as Resolved & Notify Students'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/90 px-5 py-3 text-xs">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {order.id === 'CMP-104'
                        ? 'Recommended Route: Walk 2 mins from Block B Level 2 via skybridge'
                        : 'Electrical safety protocol: keep breaker isolated until inspected.'}
                    </span>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleAction(order.id === 'CMP-104' ? 'AV Backup' : 'Site Map', order.id)}
                        className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-bold text-slate-700 hover:bg-slate-50 transition"
                      >
                        {order.id === 'CMP-104' ? 'Request AV Backup' : 'View Outdoor Site Map'}
                      </button>
                      <button
                        type="button"
                        disabled={isResolved}
                        onClick={() => handleAction(order.primary, order.id)}
                        className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 font-bold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        <PlayCircle size={14} />
                        {isInProgress ? 'Work In Progress' : isResolved ? 'Resolved' : order.primary}
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>


      {/* ================= MODAL: CENTRAL WAREHOUSE SPARES REQUISITION ================= */}
      {activeModal === 'spares' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Box size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Central Quad Warehouse Spares</h3>
                  <p className="text-xs text-slate-500">Instant hardware parts requisition for active work orders</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {spareRequisitionSuccess ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center space-y-2 animate-fade-in">
                <CheckCircle2 size={32} className="mx-auto text-emerald-600" />
                <h4 className="text-sm font-bold text-emerald-950">Spares Dispatched</h4>
                <p className="text-xs text-emerald-800">{spareRequisitionSuccess}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Select matching hardware items from Central Quad Warehouse inventory for immediate technician collection:
                </p>

                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto rounded-xl border border-slate-200">
                  {WAREHOUSE_PARTS.map((part) => (
                    <div key={part.id} className="flex items-center justify-between p-3 text-xs hover:bg-slate-50 transition">
                      <div>
                        <span className="font-bold text-slate-900 block">{part.name}</span>
                        <span className="text-[11px] text-slate-500">
                          {part.trade} • {part.location} • <strong className="text-emerald-600">{part.stock} in stock</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRequisitionPart(part)}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition"
                      >
                        Requisition
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: SITE MAP & BEACON ================= */}
      {activeModal === 'map' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MapPin size={20} className="text-blue-600" />
                <h3 className="text-sm font-black text-slate-900">Campus Facility Beacon Map</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                <X size={16} />
              </button>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-xs space-y-2">
              <p className="font-bold text-blue-900">GPS & Sub-GHz LoRa Beacon Grid</p>
              <p className="text-blue-800 leading-relaxed">
                Site: Main Canteen East Patio • Seating Station #4.<br />
                Nearest telemetry beacon: <strong>#BEACON-MC-04</strong> (Latency: 12ms, Signal: 94%).
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
