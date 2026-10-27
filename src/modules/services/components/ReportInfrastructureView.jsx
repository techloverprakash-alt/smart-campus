import React, { useState } from 'react';
import {
  Zap, Droplet, Tv, Armchair, Fan, Sparkles, MapPin, AlertTriangle,
  Camera, Check, Clock, Trash2, RefreshCw, Send, ArrowLeft,
  ThumbsUp, ShieldAlert, CheckCircle2, X, Plus, Info, Phone
} from 'lucide-react';

const CATEGORIES = [
  {
    id: 'Electrical',
    label: 'Electrical',
    sublabel: 'Sockets, wiring, fuses',
    icon: Zap,
    color: 'text-amber-600',
  },
  {
    id: 'Plumbing',
    label: 'Plumbing',
    sublabel: 'Leaks, filters, valves',
    icon: Droplet,
    color: 'text-blue-600',
  },
  {
    id: 'IT & Classroom AV',
    label: 'IT & Classroom AV',
    sublabel: 'Projector, audio, LAN',
    icon: Tv,
    color: 'text-indigo-600',
  },
  {
    id: 'Furniture',
    label: 'Furniture',
    sublabel: 'Desks, doors, windows',
    icon: Armchair,
    color: 'text-slate-600',
  },
  {
    id: 'HVAC & Fans',
    label: 'HVAC & Fans',
    sublabel: 'AC cooling, ducting, vents',
    icon: Fan,
    color: 'text-cyan-600',
  },
  {
    id: 'Sanitation',
    label: 'Sanitation',
    sublabel: 'Hygiene, waste, drainage',
    icon: Sparkles,
    color: 'text-emerald-600',
  },
];

const PRIORITIES = [
  {
    id: 'Low Priority',
    sla: '48h SLA',
    title: 'Routine Fix',
    desc: 'Cosmetic blemishes, non-critical furniture wobbles.',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    borderColor: 'border-blue-400',
  },
  {
    id: 'Medium Priority',
    sla: '24h SLA',
    title: 'Standard Disruption',
    desc: 'Cooler dripping, classroom bulb flicker, projector latency.',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    borderColor: 'border-amber-400',
  },
  {
    id: 'Urgent / Hazard',
    sla: '< 2h SLA',
    title: 'Immediate Dispatch',
    desc: 'Active water line burst, elevator stuck, power tripping.',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    borderColor: 'border-rose-400',
  },
];

const QUICK_INSERTS = [
  '+ Leaking Valve',
  '+ Slippery Floor',
  '+ Low Water Pressure',
  '+ Sparking / Buzzing',
  '+ Loud Vibration',
  '+ Audio Lag / HDMI No Signal',
];

export default function ReportInfrastructureView({ onBack, onSubmitTicket }) {
  const [category, setCategory] = useState('Plumbing');
  const [campusZone, setCampusZone] = useState('Science Quad - Academic Block B');
  const [locationIdentifier, setLocationIdentifier] = useState('Floor 2, Corridor near Staircase B / Water Hub');
  const [priority, setPriority] = useState('Medium Priority');
  const [description, setDescription] = useState(
    'The drinking water cooler unit on the 2nd floor landing is continuously leaking water across the corridor floor tile, creating a slip hazard near the central staircase. Flow valve appears loose.'
  );
  const [attachedFile, setAttachedFile] = useState({
    name: 'leak_corridor_b2.jpg',
    size: '1.4 MB',
    ready: true,
  });
  const [smsBroadcast, setSmsBroadcast] = useState(true);
  const [duplicateDismissed, setDuplicateDismissed] = useState(false);
  const [upvoted, setUpvoted] = useState(false);
  const [upvotesCount, setUpvotesCount] = useState(3);
  const [submitting, setSubmitting] = useState(false);

  const handleQuickInsert = (text) => {
    const clean = text.replace(/^\+\s*/, '');
    setDescription((prev) => {
      if (!prev.trim()) return clean;
      if (prev.includes(clean)) return prev;
      return `${prev.trim()}. ${clean}`;
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
    setSubmitting(true);

    const ticketTitle = description.length > 50 ? `${description.slice(0, 48)}...` : description;

    setTimeout(() => {
      onSubmitTicket({
        title: ticketTitle || `${category} Repair`,
        category,
        location: `${campusZone} • ${locationIdentifier}`,
        description,
        priority: priority === 'Urgent / Hazard' ? 'Critical' : priority === 'Medium Priority' ? 'Medium' : 'Low',
        priorityTone: priority === 'Urgent / Hazard' ? 'rose' : priority === 'Medium Priority' ? 'amber' : 'blue',
      });
      setSubmitting(false);
    }, 400);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12 animate-fade-in">
      {/* Top Breadcrumb & Session Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Dashboard
        </button>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
          <span className="font-mono">ID: CS-2023-8841</span>
          <span>•</span>
          <span className="flex items-center gap-1 text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active Session
          </span>
        </div>
      </div>

      {/* Header Title & Subtitle */}
      <div>
        <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Report Infrastructure Issue
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
            Campus Facility Telemetry Live
          </span>
        </div>
        <p className="max-w-2xl text-xs leading-relaxed text-slate-500 sm:text-sm">
          Submit electrical, plumbing, sanitation, or classroom AV repair tickets. Campus dispatch assigns nearby technicians based on location coordinate matching and SLA severity.
        </p>
      </div>

      {/* Immediate Hazard Alert Callout */}
      <div className="flex items-start gap-3.5 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 shadow-sm">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-sm">
          <ShieldAlert size={20} />
        </div>
        <div className="text-xs leading-relaxed text-rose-950">
          <p className="font-extrabold text-rose-900 text-sm mb-0.5">Immediate Hazard Alert</p>
          <p>
            For life-critical hazards (e.g., active gas leak, exposed live wiring, structural collapses), do not wait for ticket routing. Contact Campus Emergency Central immediately:{' '}
            <strong className="font-extrabold text-rose-900">ext. 4444</strong> or{' '}
            <strong className="font-extrabold text-rose-900">+91 (044) 2257-4444</strong>.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-7">
        {/* SECTION 1: SELECT ISSUE CATEGORY */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              1. SELECT ISSUE CATEGORY <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] font-medium text-slate-400">Helps route to dedicated trade crew</span>
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
                      ? 'border-2 border-indigo-600 bg-indigo-50/40 shadow-sm ring-2 ring-indigo-100'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 shadow-sm'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white shadow">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                  <div
                    className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <IconComponent size={20} />
                  </div>
                  <h4 className={`text-sm font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
                    {cat.label}
                  </h4>
                  <p className="mt-0.5 text-[11px] text-slate-500">{cat.sublabel}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: INCIDENT LOCATION */}
        <div className="space-y-3">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800">
            2. INCIDENT LOCATION <span className="text-rose-500">*</span>
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <span className="mb-1 block text-[11px] font-semibold text-slate-500">Campus Zone / Building</span>
              <select
                value={campusZone}
                onChange={(e) => setCampusZone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 text-xs font-semibold text-slate-800 shadow-sm transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              >
                <option>Science Quad - Academic Block B</option>
                <option>Library Quad - Central Library</option>
                <option>Main Canteen / Food Court</option>
                <option>Sports Complex & Gym</option>
                <option>Administrative Block</option>
                <option>Hostel Block 1 & 2</option>
              </select>
            </div>

            <div>
              <span className="mb-1 block text-[11px] font-semibold text-slate-500">Floor / Hallway / Room Identifier</span>
              <div className="relative">
                <input
                  required
                  value={locationIdentifier}
                  onChange={(e) => setLocationIdentifier(e.target.value)}
                  placeholder="e.g. Floor 2, Corridor near Staircase B"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-3 pr-9 text-xs text-slate-800 shadow-sm transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
                <MapPin size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>

          <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Info size={13} className="text-blue-600" />
            Technicians use floor beacons. Specifying nearby landmarks (e.g., Staircase B, Elevator 1) cuts response time by 40%.
          </p>

          {/* Duplicate Detection Alert Card */}
          {!duplicateDismissed && (
            <div className="relative rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-sm animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/60 pb-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500 text-white text-xs">
                    <AlertTriangle size={14} />
                  </span>
                  <span className="text-xs font-bold text-amber-900">
                    Similar Open Issue Detected in Block B, Floor 2
                  </span>
                  <span className="rounded-full bg-amber-200/80 px-2 py-0.5 text-[10px] font-extrabold text-amber-900">
                    96% Spatial Match
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                  <ThumbsUp size={12} /> {upvotesCount} upvotes
                </span>
              </div>

              <div className="py-2.5">
                <p className="text-xs font-bold text-slate-900">
                  “Water cooler leaking near staircase B causing puddle hazard”
                </p>
                <p className="mt-0.5 text-[11px] text-slate-600">
                  Ticket <strong className="font-mono text-slate-800">#CMP-108</strong> • Reported 2h ago by Priya M. • Assigned to{' '}
                  <strong className="text-slate-800">Esakki Muthu (Facility Team)</strong>
                </p>
                <p className="mt-2 text-[11px] text-amber-900/90 leading-relaxed">
                  ⚡ Upvoting notifies the technician and subscribes you to SMS resolution updates without cluttering queue.
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
                    upvoted ? 'bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  <ThumbsUp size={12} />
                  {upvoted ? 'Subscribed & Upvoted (#CMP-108)' : '+1 Upvote & Subscribe (#CMP-108)'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: PRIORITY & SLA COMMITMENT */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              3. PRIORITY & SLA COMMITMENT <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] font-medium text-slate-400">Service level agreement based on campus standards</span>
          </div>

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
                      ? `border-2 ${p.borderColor} bg-amber-50/30 shadow-sm ring-2 ring-amber-100`
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-extrabold ${p.badgeBg}`}>
                        • {p.id}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">{p.sla}</span>
                    </div>
                    <h5 className="text-xs font-extrabold text-slate-900">{p.title}</h5>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{p.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 4: DETAILED ISSUE DESCRIPTION */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              4. DETAILED ISSUE DESCRIPTION <span className="text-rose-500">*</span>
            </label>
            <span className="font-mono text-xs text-slate-400">
              {description.length} / 500 characters
            </span>
          </div>

          <textarea
            required
            rows={4}
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue, any safety concerns or observed hazards in detail"
            className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 text-xs leading-relaxed text-slate-800 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-bold text-slate-400 mr-1">Quick Inserts:</span>
            {QUICK_INSERTS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleQuickInsert(chip)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 5: INSPECTION PHOTO OR VISUAL PROOF */}
        <div className="space-y-3">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800">
            5. INSPECTION PHOTO OR VISUAL PROOF (RECOMMENDED)
          </label>

          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center transition hover:border-blue-300 hover:bg-blue-50/20">
            <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Camera size={22} />
            </div>
            <p className="text-xs font-bold text-slate-700">
              Drop photo here or <span className="text-blue-600 underline cursor-pointer">browse local drive</span>
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              PNG, JPG, or WEBP up to 5MB. Clear visuals help staff bring accurate replacement parts.
            </p>
          </div>

          {/* Uploaded File Chip Card */}
          {attachedFile && (
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 font-mono text-[10px] font-bold uppercase text-slate-500">
                  img
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{attachedFile.name}</p>
                  <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <span>{attachedFile.size}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Ready to upload
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  title="Replace photo"
                  onClick={() => alert('Browse new photo dialog opened.')}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <RefreshCw size={15} />
                </button>
                <button
                  type="button"
                  title="Remove photo"
                  onClick={() => setAttachedFile(null)}
                  className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 6: NOTIFICATION PREFERENCES */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
          <label className="flex items-start gap-3 cursor-pointer">
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
                  Send immediate notifications when a technician is dispatched, arrives on scene, and marks the task resolved.
                </span>
              </p>
              <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                <Phone size={11} className="text-blue-600" />
                Primary Contact: <strong className="text-slate-700">+91 98765-43210</strong> (Linked to Student ID CS-2023-8841)
              </p>
            </div>
          </label>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-5">
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            Cancel / Discard Draft
          </button>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock size={14} className="text-slate-400" />
            <span>Estimated response:</span>
            <strong className="text-slate-800">Today by 3:30 PM</strong>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            <Send size={14} />
            {submitting ? 'Routing Ticket...' : 'Submit Complaint Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
}
