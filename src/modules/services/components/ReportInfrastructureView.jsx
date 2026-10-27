import React, { useState, useRef, useMemo } from 'react';
import {
  Zap, Droplet, Tv, Armchair, Fan, Trash2, MapPin, AlertTriangle,
  Camera, Check, Clock, RefreshCw, Send, ArrowLeft,
  ThumbsUp, ShieldAlert, CheckCircle2, X, Plus, Info, Phone,
  FileImage, Bell, ShieldCheck, ExternalLink
} from 'lucide-react';

const CATEGORIES = [
  {
    id: 'Electrical',
    title: 'Electrical',
    description: 'Sockets, wiring, fuses',
    icon: Zap,
    tone: 'amber',
    iconBg: 'bg-amber-100 text-amber-700',
    selectedBorder: 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-100',
  },
  {
    id: 'Plumbing',
    title: 'Plumbing & Water',
    description: 'Leaks, filters, valves',
    icon: Droplet,
    tone: 'blue',
    iconBg: 'bg-blue-100 text-blue-700',
    selectedBorder: 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-100',
  },
  {
    id: 'IT & Classroom AV',
    title: 'IT & Classroom AV',
    description: 'Projectors, audio, LAN',
    icon: Tv,
    tone: 'indigo',
    iconBg: 'bg-indigo-100 text-indigo-700',
    selectedBorder: 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-100',
  },
  {
    id: 'Furniture',
    title: 'Furniture & Fixtures',
    description: 'Desks, doors, windows',
    icon: Armchair,
    tone: 'slate',
    iconBg: 'bg-slate-100 text-slate-700',
    selectedBorder: 'border-slate-600 bg-slate-50/70 ring-2 ring-slate-100',
  },
  {
    id: 'HVAC & Fans',
    title: 'HVAC & Fans',
    description: 'AC cooling, vents, fans',
    icon: Fan,
    tone: 'teal',
    iconBg: 'bg-teal-100 text-teal-700',
    selectedBorder: 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-100',
  },
  {
    id: 'Sanitation',
    title: 'Sanitation & Hygiene',
    description: 'Hygiene, waste, drainage',
    icon: Trash2,
    tone: 'rose',
    iconBg: 'bg-rose-100 text-rose-700',
    selectedBorder: 'border-rose-600 bg-rose-50/50 ring-2 ring-rose-100',
  },
];

const CAMPUS_ZONES = [
  'Science Quad - Academic Block B',
  'Main Academic Quad - Block A',
  'Mechanical Engineering Labs',
  'Central Digital Library Complex',
  'Hostel Block 1 (Girls)',
  'Hostel Block 2 & 3 (Boys)',
  'Student Dining & Food Court',
  'Sports Complex & Gymnasium',
  'Administrative Complex',
];

const PRIORITIES = [
  {
    id: 'Low',
    title: 'Low',
    sub: 'Non-urgent • Routine',
    sla: '48h SLA',
    color: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    selectedClass: 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-100 text-emerald-900',
  },
  {
    id: 'Medium',
    title: 'Medium',
    sub: 'Needs timely attention',
    sla: '24h SLA',
    color: 'amber',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    selectedClass: 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-100 text-amber-900',
  },
  {
    id: 'High',
    title: 'High',
    sub: 'Immediate safety / disruption',
    sla: '< 2h SLA',
    color: 'rose',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    selectedClass: 'border-rose-500 bg-rose-50/50 ring-2 ring-rose-100 text-rose-900',
  },
];

const QUICK_INSERTS = [
  'Safety hazard',
  'Water leakage',
  'Not working',
  'Needs cleaning',
  'Sparking / Buzzing',
  'Slippery floor',
];

export default function ReportInfrastructureView({ onBack, onSubmitTicket, onViewComplaints }) {
  const [category, setCategory] = useState('Plumbing');
  const [campusZone, setCampusZone] = useState(CAMPUS_ZONES[0]);
  const [roomIdentifier, setRoomIdentifier] = useState('Floor 2, Corridor near Staircase B / Water Hub');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState(
    'The drinking water cooler unit on the 2nd floor landing is continuously leaking water across the corridor floor tile, creating a slip hazard near the central staircase. Flow valve appears loose.'
  );
  const [photo, setPhoto] = useState({
    name: 'leak_corridor_b2.jpg',
    size: '1.42 MB',
  });
  const [smsBroadcast, setSmsBroadcast] = useState(true);
  const [duplicateDismissed, setDuplicateDismissed] = useState(false);
  const [upvoted, setUpvoted] = useState(false);
  const [upvotesCount, setUpvotesCount] = useState(3);
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef(null);

  const selectedCategoryObj = useMemo(
    () => CATEGORIES.find((item) => item.id === category) || CATEGORIES[1],
    [category]
  );

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setErrorMessage('Please upload a valid image file (PNG, JPG, or WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('The image file must be 5MB or smaller.');
      return;
    }

    setErrorMessage('');
    setPhoto({
      file,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
    });
  };

  const handleRemovePhoto = (e) => {
    e?.stopPropagation();
    setPhoto(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleQuickInsert = (tag) => {
    setDescription((prev) => {
      const cleanTag = tag.trim();
      if (!prev.trim()) return cleanTag;
      if (prev.includes(cleanTag)) return prev;
      return `${prev.trim()}. ${cleanTag}.`;
    });
  };

  const handleUpvote = () => {
    if (!upvoted) {
      setUpvotesCount((c) => c + 1);
      setUpvoted(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!category || !campusZone || !roomIdentifier.trim() || !description.trim()) {
      setErrorMessage('Please fill in all mandatory fields before submitting.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    const newTicketId = `NX-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    setTimeout(() => {
      setSubmitting(false);
      setSubmittedTicket(newTicketId);

      // Also register ticket in parent dashboard complaints list if callback exists
      if (onSubmitTicket) {
        onSubmitTicket({
          id: newTicketId,
          title: description.length > 50 ? `${description.slice(0, 48)}...` : description,
          category: selectedCategoryObj.title,
          location: `${campusZone} • ${roomIdentifier}`,
          description,
          priority: priority === 'High' ? 'Critical' : priority === 'Medium' ? 'Medium' : 'Low',
          priorityTone: priority === 'High' ? 'rose' : priority === 'Medium' ? 'amber' : 'blue',
          ticketNumber: newTicketId,
        });
      }
    }, 450);
  };

  const handleResetForm = () => {
    setSubmittedTicket(null);
    setDescription('');
    setRoomIdentifier('');
    setPhoto(null);
    setErrorMessage('');
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16 animate-fade-in">
      {/* Page Title & Subtitle */}
      <div>
        <div className="flex flex-wrap items-center gap-3 mb-1.5">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Report Infrastructure Issue
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
            Live Spatial Telemetry
          </span>
        </div>
        <p className="max-w-2xl text-xs leading-relaxed text-slate-500 sm:text-sm">
          Submit electrical, plumbing, sanitation, or classroom AV repair requests. Facilities crew dispatches nearby technicians based on zone location matching and SLA priority.
        </p>
      </div>

      {/* Emergency Bypass Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 shadow-sm">
        <div className="flex items-start gap-3.5 flex-1 min-w-[280px]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-sm">
            <ShieldAlert size={20} />
          </div>
          <div className="text-xs leading-relaxed text-rose-950">
            <p className="font-extrabold text-rose-900 text-sm mb-0.5">Is this an immediate safety emergency?</p>
            <p className="text-rose-800">
              For active fire, exposed high-voltage wiring, or structural danger, contact campus security immediately before filing a digital ticket.
            </p>
          </div>
        </div>
        <a
          href="tel:04222660000"
          className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition-colors whitespace-nowrap"
        >
          Call Campus Security <ExternalLink size={13} />
        </a>
      </div>

      {/* SUCCESS CARD (When ticket is submitted) */}
      {submittedTicket ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-md animate-fade-in space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
            <Check size={36} strokeWidth={3} />
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900">Complaint Ticket Submitted Successfully</h2>
            <p className="mt-1 text-sm text-slate-500 max-w-lg mx-auto">
              Your infrastructure issue has been recorded in the central facilities dispatch system. Track progress using your ticket reference below.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 max-w-md mx-auto">
            <div className="text-xs font-extrabold uppercase tracking-widest text-blue-600 mb-1">
              Your Dispatch Ticket Number
            </div>
            <div className="text-3xl font-black tracking-wider text-blue-900 font-mono">
              {submittedTicket}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto text-left">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</span>
              <strong className="text-xs font-bold text-slate-800">{selectedCategoryObj.title}</strong>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Campus Zone</span>
              <strong className="text-xs font-bold text-slate-800 truncate block">{campusZone}</strong>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Priority Level</span>
              <strong className={`text-xs font-bold ${priority === 'High' ? 'text-rose-600' : priority === 'Medium' ? 'text-amber-600' : 'text-emerald-600'}`}>
                {priority} Priority
              </strong>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              type="button"
              onClick={handleResetForm}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
            >
              <Plus size={15} />
              Submit Another Issue
            </button>
            <button
              type="button"
              onClick={onViewComplaints || onBack}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              View in My Complaints
              <ArrowLeft size={14} className="rotate-180" />
            </button>
          </div>
        </section>
      ) : (
        /* FORM CONTAINER */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: SELECT ISSUE CATEGORY */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-extrabold text-xs uppercase tracking-wider text-slate-800">
                <span>1. Select Issue Category</span>
                <span className="text-rose-500">*</span>
              </div>
              <span className="text-[11px] font-bold text-slate-400 tracking-wider">
                STEP 01 <span className="text-slate-300">/ 04</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`group relative flex flex-col items-start rounded-2xl border p-4 text-left transition-all ${
                      isSelected
                        ? cat.selectedBorder
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/70 shadow-sm'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white shadow">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                    <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${isSelected ? 'bg-blue-600 text-white' : cat.iconBg}`}>
                      <IconComponent size={20} />
                    </div>
                    <h4 className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                      {cat.title}
                    </h4>
                    <p className="mt-0.5 text-[11px] text-slate-500">{cat.description}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* SECTION 2: INCIDENT LOCATION & SPATIAL MATCHING */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-extrabold text-xs uppercase tracking-wider text-slate-800">
                <span>2. Incident Location & Spatial Matching</span>
                <span className="text-rose-500">*</span>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                <MapPin size={13} className="text-blue-600" />
                Precise location assists crew
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="campus-zone-select" className="mb-1.5 block text-xs font-bold text-slate-700">
                  Campus Zone / Building <span className="text-rose-500">*</span>
                </label>
                <select
                  id="campus-zone-select"
                  value={campusZone}
                  onChange={(e) => setCampusZone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs font-semibold text-slate-800 shadow-sm transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                >
                  {CAMPUS_ZONES.map((zone) => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="room-ident-input" className="mb-1.5 block text-xs font-bold text-slate-700">
                  Room Identifier / Landmark <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="room-ident-input"
                    required
                    value={roomIdentifier}
                    onChange={(e) => setRoomIdentifier(e.target.value)}
                    placeholder="e.g. Floor 2, Corridor near Staircase B"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-3 pr-9 text-xs text-slate-800 shadow-sm transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                  <MapPin size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-500 border border-slate-200/60">
              <Info size={14} className="text-blue-600 shrink-0" />
              <span>Specifying nearby landmarks (e.g. Staircase B, Water Hub) accelerates technician response time.</span>
            </div>

            {/* DUPLICATE DETECTION / OPEN SIMILAR ISSUE ALERT */}
            {!duplicateDismissed && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm animate-fade-in space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500 text-white text-xs">
                      <AlertTriangle size={14} />
                    </span>
                    <span className="text-xs font-bold text-amber-950">
                      Similar Open Issue Detected in Block B, Floor 2
                    </span>
                    <span className="rounded-full bg-amber-200/80 px-2 py-0.5 text-[10px] font-extrabold text-amber-900">
                      96% Spatial Match
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900">
                    <ThumbsUp size={12} /> {upvotesCount} student upvotes
                  </span>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-900">
                    “Water cooler leaking near staircase B causing puddle hazard”
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-600">
                    Ticket <strong className="font-mono text-slate-800">#CMP-108</strong> • Reported 2h ago • Assigned to{' '}
                    <strong className="text-slate-800">Esakki Muthu (Facility Team)</strong>
                  </p>
                  <p className="mt-1.5 text-[11px] text-amber-900/90 leading-relaxed">
                    ⚡ Upvoting alerts the technician of urgency and subscribes you to SMS resolution alerts without cluttering the maintenance queue.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setDuplicateDismissed(true)}
                    className="rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-amber-100/50 transition-colors"
                  >
                    Ignore & Submit Separate
                  </button>
                  <button
                    type="button"
                    onClick={handleUpvote}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-all ${
                      upvoted ? 'bg-emerald-600' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <ThumbsUp size={12} />
                    {upvoted ? 'Subscribed & Upvoted (#CMP-108)' : '+1 Upvote & Subscribe (#CMP-108)'}
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* SECTION 3: PRIORITY & ISSUE DESCRIPTION */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-extrabold text-xs uppercase tracking-wider text-slate-800">
                <span>3. Priority & Issue Description</span>
                <span className="text-rose-500">*</span>
              </div>
              <span className="text-[11px] font-bold text-slate-400 tracking-wider">
                STEP 03 <span className="text-slate-300">/ 04</span>
              </span>
            </div>

            {/* Priority Tiers */}
            <div>
              <span className="block text-xs font-bold text-slate-700 mb-2">How urgent is this issue?</span>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {PRIORITIES.map((p) => {
                  const isSelected = priority === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id)}
                      className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
                        isSelected
                          ? p.selectedClass
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-extrabold ${p.badgeClass}`}>
                          • {p.title}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">{p.sla}</span>
                      </div>
                      <h5 className="text-xs font-extrabold text-slate-900">{p.title}</h5>
                      <p className="mt-0.5 text-[11px] text-slate-500">{p.sub}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="issue-desc" className="text-xs font-bold text-slate-700">
                  Detailed Issue Description <span className="text-rose-500">*</span>
                </label>
                <span className={`font-mono text-xs ${description.length > 500 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                  {description.length} / 500 characters
                </span>
              </div>
              <textarea
                id="issue-desc"
                required
                rows={4}
                maxLength={500}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the physical condition, specific landmark, or observed safety risk..."
                className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 text-xs leading-relaxed text-slate-800 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />

              {/* Quick Add Helper Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                <span className="text-[11px] font-bold text-slate-400 mr-1">Quick Add:</span>
                {QUICK_INSERTS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleQuickInsert(chip)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 4: INSPECTION PHOTO OR VISUAL EVIDENCE */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-extrabold text-xs uppercase tracking-wider text-slate-800">
                <span>4. Inspection Photo or Visual Proof</span>
                <span className="rounded-full bg-blue-100 text-blue-700 text-[10px] font-extrabold px-2 py-0.5 ml-1">
                  RECOMMENDED
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-400 tracking-wider">
                STEP 04 <span className="text-slate-300">/ 04</span>
              </span>
            </div>

            <p className="text-xs text-slate-500">
              A clear photo allows technicians to diagnose the issue and bring matching tools and parts on the first dispatch visit.
            </p>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handlePhotoSelect}
            />

            {/* Interactive Upload Dropzone */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              className={`rounded-2xl border-2 border-dashed p-6 text-center transition cursor-pointer ${
                photo
                  ? 'border-emerald-300 bg-emerald-50/30'
                  : 'border-slate-200 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/20'
              }`}
            >
              <div className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl shadow-sm ${photo ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-600'}`}>
                {photo ? <FileImage size={24} /> : <Camera size={24} />}
              </div>
              <p className="text-xs font-bold text-slate-700">
                {photo ? (
                  <span className="text-emerald-700 font-extrabold">Attach The Photo</span>
                ) : (
                  <>Drop photo here or <span className="text-blue-600 underline">browse local drive</span></>
                )}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                PNG, JPG, or WEBP up to 5MB.
              </p>
            </div>

            {/* Attached Photo Badge */}
            {photo && (
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <FileImage size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 truncate max-w-xs">{photo.name}</p>
                    <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <span>{photo.size}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <Check size={12} strokeWidth={3} /> Ready to attach
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Change photo"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  >
                    <RefreshCw size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    title="Remove photo"
                    className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* SECTION 5: LIVE SMS & STATUS BROADCASTS */}
          <section className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 shadow-sm flex items-start justify-between gap-3">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={smsBroadcast}
                onChange={(e) => setSmsBroadcast(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="text-xs leading-relaxed">
                <p className="font-bold text-slate-900">
                  Live SMS & Portal Status Broadcasts:
                  <span className="font-normal text-slate-600 ml-1">
                    Receive real-time notifications when a technician is dispatched, arrives on scene, and marks the task resolved.
                  </span>
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                  <Phone size={12} className="text-blue-600" />
                  Primary Contact: <strong className="text-slate-800">+91 98765-43210</strong> (Linked to Student ID CS-2023-8841)
                </p>
              </div>
            </label>
            <span className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full whitespace-nowrap ${smsBroadcast ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
              <Bell size={11} /> {smsBroadcast ? 'ENABLED' : 'DISABLED'}
            </span>
          </section>

          {/* ERROR ALERT */}
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-bold text-rose-700 animate-fade-in">
              <ShieldAlert size={16} />
              {errorMessage}
            </div>
          )}

          {/* FORM FOOTER & ACTIONS */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-5">
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck size={16} className="text-slate-400" />
              <span>Your report is shared directly with the authorized campus facilities team.</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onBack}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                Cancel / Discard
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                <Send size={15} />
                {submitting ? 'Routing Ticket...' : 'Submit Complaint Ticket'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
