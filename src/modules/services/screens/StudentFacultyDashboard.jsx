import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useRouter } from '../../../router';
import { useAuth } from '../../auth/context/AuthContext';
import LostAndFoundBoard from '../components/LostAndFoundBoard';
import ReportInfrastructureView from '../components/ReportInfrastructureView';
import MatchSuggestionsView from '../components/MatchSuggestionsView';
import FieldOperationsConsole from '../components/FieldOperationsConsole';
import CampusAdminControlCenter from '../../admin/screens/CampusAdminControlCenter';
import CAMPUS_MAP_IMAGE from '@/assets/campus-map.jpg';
import {
  Activity, Bell, Check, CheckCircle2, ChevronDown, Clock3,
  HelpCircle, LayoutDashboard, MapPin, Plus, Search, ShieldCheck,
  Smartphone, Zap, AlertTriangle, X, PackageSearch, MessageSquare,
  Wrench, Shield, ArrowRight, ArrowLeft, Building2, Flame,
  FileCode, CheckCheck, RefreshCw, Send, CheckCircle, ExternalLink,
  Award, Sparkles, ChevronLeft, ChevronRight, Calendar
} from 'lucide-react';

const initialComplaints = [
  {
    id: 'CMP-104',
    category: 'Projector & AV Tech',
    icon: 'display',
    priority: 'High Priority',
    priorityTone: 'rose',
    date: 'Today, 09:15 AM',
    title: 'Broken Projector in Lab 302',
    location: 'Science Quad - Block B, 3rd Floor, Software Systems Wing',
    assignee: 'Gnana Prakash',
    initials: 'GP',
    role: 'Senior AV Technician • Assigned 09:40 AM',
    status: 'Active',
    progress: 2,
    remarks: 'Inspected optical circuit unit. Replacement bulb arriving at 2:00 PM today. Work order verified with Quad Electrical Warehouse.',
    workOrder: 'WO-9912',
  },
  {
    id: 'CMP-098',
    category: 'HVAC / Climate Control',
    icon: 'fan',
    priority: 'Medium Priority',
    priorityTone: 'amber',
    date: 'Yesterday, 04:30 PM',
    title: 'Central AC Thermostat Malfunction',
    location: 'Library Quad - Study Wing 2 (Quiet Research Zone)',
    assignee: 'Esakki Muthu',
    initials: 'EM',
    role: 'Facilities Dispatch • Closed with resolution',
    status: 'Resolved',
    progress: 3,
  },
  {
    id: 'CMP-112',
    category: 'Electrical / Power Safety',
    icon: 'bolt',
    priority: 'Critical Hazard',
    priorityTone: 'rose',
    date: '10 mins ago',
    title: 'Sparking Power Socket near Bench 4',
    location: 'Main Canteen East Patio • Outdoor Seating Station #4',
    assignee: 'Campus Rapid Electrical Team',
    initials: '!',
    role: 'Breaker #BR-4 locked out remotely',
    status: 'Active',
    progress: 1,
  },
];

const navGroups = [
  {
    title: 'Workspace',
    links: [
      { id: 'Overview / Dashboard', label: 'Overview', icon: LayoutDashboard },
      { id: 'Report Infrastructure Issue', label: 'Report Issue', icon: Wrench },
      { id: 'Lost & Found Claims', label: 'Lost & Found', icon: PackageSearch },
      { id: 'Match Suggestions & Verification', label: 'Match & AI Triage', icon: Sparkles },
      { id: 'Field Operations & Work Orders', label: 'Field Operations', icon: Activity },
      { id: 'My Complaints', label: 'My Complaints', icon: AlertTriangle },
      { id: 'Campus Admin Control Center', label: 'Admin Center', icon: Shield },
      { id: 'Campus Map & Facilities', label: 'Campus Map', icon: MapPin },
    ],
  },
];

function Modal({ title, onClose, maxWidth = 'max-w-lg', children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 overflow-y-auto"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`w-full ${maxWidth} rounded-2xl bg-white p-6 shadow-2xl animate-fade-in my-auto max-h-[92vh] overflow-y-auto`}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Ticket({ ticket, onMessage }) {
  const resolved = ticket.status === 'Resolved';
  const steps = ['Submitted', 'Assigned', 'In Progress', 'Resolved'];

  return (
    <article
      className={`rounded-2xl border bg-white p-5 shadow-sm space-y-4 transition-all hover:shadow-md ${
        ticket.priorityTone === 'rose' && ticket.id === 'CMP-112' ? 'border-rose-200/80 bg-rose-50/10' : 'border-slate-200'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-md px-2.5 py-1 font-mono text-xs font-bold ${
              ticket.id === 'CMP-112'
                ? 'border border-rose-200 bg-rose-50 text-rose-700'
                : ticket.id === 'CMP-104'
                ? 'border border-blue-200 bg-blue-50 text-blue-700'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            #{ticket.id}
          </span>
          <span className="flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            {ticket.category}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
              ticket.priorityTone === 'rose'
                ? 'border border-rose-200 bg-rose-50 text-rose-700'
                : 'border border-amber-200 bg-amber-50 text-amber-700'
            }`}
          >
            {ticket.priority}
          </span>
          <span className="text-xs text-slate-400">{ticket.date}</span>
        </div>
      </div>

      <div>
        <h4 className="text-base font-bold text-slate-900">{ticket.title}</h4>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin size={13} className={ticket.id === 'CMP-112' ? 'text-rose-500' : 'text-slate-400'} />
          {ticket.location}
        </p>
      </div>

      <div
        className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${
          ticket.id === 'CMP-112' ? 'border-rose-200/50 bg-rose-50/50' : 'border-slate-200/70 bg-slate-50'
        }`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ${
              ticket.id === 'CMP-112' ? 'bg-rose-600' : ticket.id === 'CMP-104' ? 'bg-blue-600' : 'bg-teal-600'
            }`}
          >
            {ticket.initials === '!' ? <AlertTriangle size={14} /> : ticket.initials}
          </div>
          <div className="min-w-0">
            <h5 className="text-xs font-bold text-slate-900">{ticket.assignee}</h5>
            <p className="truncate text-[11px] text-slate-500">{ticket.role}</p>
          </div>
        </div>

        {resolved ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-emerald-100/70 px-2.5 py-1 text-xs font-bold text-emerald-700">
            <CheckCircle2 size={13} />
            Completed
          </span>
        ) : ticket.id === 'CMP-112' ? (
          <span className="shrink-0 rounded border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
            Assigned
          </span>
        ) : (
          <button
            title="Message technician"
            onClick={() => onMessage(ticket)}
            className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            <MessageSquare size={14} />
            <span>Message</span>
          </button>
        )}
      </div>

      {ticket.id === 'CMP-104' && (
        <>
          <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs">
            {steps.map((step, i) => (
              <div key={step} className={`flex flex-col items-center ${i > ticket.progress ? 'opacity-50' : ''}`}>
                <div
                  className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    i < ticket.progress
                      ? 'bg-blue-100 text-blue-600'
                      : i === ticket.progress
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {i < ticket.progress ? (
                    <Check size={11} />
                  ) : i === ticket.progress ? (
                    <RefreshCw size={11} className="animate-spin" />
                  ) : (
                    <Check size={11} />
                  )}
                </div>
                <span className={i === ticket.progress ? 'font-bold text-blue-700' : 'font-medium text-slate-700'}>
                  {step}
                </span>
                <span className="text-[10px] text-slate-400">
                  {i === 0 ? '09:15 AM' : i === 1 ? '09:40 AM' : i === 2 ? 'Active Dispatch' : 'Pending'}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 text-xs">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-blue-900">
              <span className="flex items-center gap-1">
                <ShieldCheck size={13} className="text-blue-600" />
                Staff Remarks & Inspection Proof
              </span>
              <span className="font-mono text-blue-700">{ticket.workOrder}</span>
            </div>
            <p className="italic leading-relaxed text-slate-700">“{ticket.remarks}”</p>
            <div className="flex items-center justify-between border-t border-blue-200/50 pt-1 text-[11px]">
              <span className="font-semibold text-blue-700 flex items-center gap-1">
                <FileCode size={12} />
                lamp_diagnostics.log
              </span>
              <span className="text-slate-500">Status verified by AV Dispatch</span>
            </div>
          </div>
        </>
      )}

      {resolved && (
        <div className="grid grid-cols-4 gap-2 pt-1 text-center text-xs">
          {steps.map((step, i) => (
            <div key={step} className="flex flex-col items-center">
              <div
                className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  i === 3 ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {i === 3 ? <CheckCheck size={12} /> : <Check size={12} />}
              </div>
              <span className={i === 3 ? 'font-bold text-emerald-700' : 'font-medium text-slate-700'}>{step}</span>
              {i === 3 && <span className="text-[10px] text-slate-400">Oct 24, 05:10 PM</span>}
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

export default function StudentFacultyDashboard(props) {
  const { initialTab = 'Overview / Dashboard', route } = props;
  const { navigation, loc } = useRouter();
  const { user, profile, role: authRole } = useAuth();

  // Resolve role from navigation params, props, or authenticated session
  const rawFrom = props.from || route?.params?.from || loc?.params?.from;
  const rawRole = props.role || route?.params?.role || loc?.params?.role || authRole || user?.role || profile?.role || 'STUDENT';
  const currentRole = String(rawRole).toUpperCase();

  const isFromAdmin = rawFrom === 'admin' || currentRole === 'ADMIN';
  const isFromStudentOrStaff = rawFrom === 'student' || rawFrom === 'staff';

  // Admin access is granted ONLY if explicitly coming from admin or having ADMIN role, and not explicitly navigating as student/staff
  const isAdmin = isFromAdmin && !isFromStudentOrStaff;
  const roleDisplay = isAdmin ? 'Admin' : (currentRole === 'STAFF' || rawFrom === 'staff') ? 'Faculty' : 'Student';
  const role = roleDisplay;

  const [activeNav, setActiveNav] = useState(
    initialTab === 'Campus Admin Control Center' && !isAdmin ? 'Overview / Dashboard' : initialTab
  );

  // Automatically switch away from Admin Center if not authorized
  useEffect(() => {
    if (!isAdmin && activeNav === 'Campus Admin Control Center') {
      setActiveNav('Overview / Dashboard');
    }
  }, [isAdmin, activeNav]);

  // Filter out Admin Center navigation link for students and staff
  const filteredNavLinks = useMemo(() => {
    return navGroups[0].links.filter((link) => {
      if (link.id === 'Campus Admin Control Center' && !isAdmin) {
        return false;
      }
      return true;
    });
  }, [isAdmin]);

  const [ticketTab, setTicketTab] = useState('All');
  const [modal, setModal] = useState(null);
  const [notifications, setNotifications] = useState(false);
  const [complaints, setComplaints] = useState(initialComplaints);
  const [claimStatus, setClaimStatus] = useState('Active Search');
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const [openLostReport, setOpenLostReport] = useState(false);
  const [selectedMatchItem, setSelectedMatchItem] = useState(null);
  const [quickLostModal, setQuickLostModal] = useState(null);
  const [dashboardNotice, setDashboardNotice] = useState('');
  const [quickImagePreview, setQuickImagePreview] = useState(null);
  const [historyItems, setHistoryItems] = useState([
    'CMP-104 • Projector complaint moved to In Progress (Today, 09:40 AM)',
    'LNF-204 • 94% AI match detected for Casio calculator (Today, 09:15 AM)',
    'CMP-098 • AC thermostat complaint resolved (Yesterday, 04:30 PM)',
  ]);
  const [quickForm, setQuickForm] = useState({
    title: '',
    category: 'Electronics',
    zone: 'Central Library',
    exactLocation: '',
    brandModel: '',
    description: '',
    type: 'Lost',
    reportDate: getTodayDate(),
  });
  const navRef = useRef(null);



  const handleNavWheel = (e) => {
    if (navRef.current && (e.deltaY !== 0 || e.deltaX !== 0)) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        navRef.current.scrollLeft += e.deltaY;
      }
    }
  };

  const [form, setForm] = useState({
    title: '',
    category: 'Classroom / Lab',
    location: '',
    description: '',
    priority: 'Medium',
  });

  const shownComplaints = useMemo(
    () =>
      complaints.filter(
        (c) => ticketTab === 'All' || (ticketTab === 'Active' ? c.status === 'Active' : c.status === 'Resolved')
      ),
    [complaints, ticketTab]
  );

  const openReport = () => {
    setActiveNav('Report Infrastructure Issue');
  };

  const handleTicketSubmitted = (ticketData) => {
    const newId = ticketData.id || `CMP-${113 + complaints.length}`;
    const newTicket = {
      id: newId,
      category: ticketData.category,
      icon: ticketData.category?.includes('Electric') ? 'bolt' : ticketData.category?.includes('Plumb') ? 'droplet' : 'wrench',
      priority: ticketData.priority === 'Critical' ? 'Critical Hazard' : ticketData.priority === 'Medium' ? 'Medium Priority' : 'Low Priority',
      priorityTone: ticketData.priorityTone,
      date: 'Just now',
      title: ticketData.title,
      location: ticketData.location,
      assignee: 'Campus Rapid Dispatch Team',
      initials: 'RD',
      role: 'Ticket routed • Awaiting technician arrival',
      status: 'Active',
      progress: 0,
      workOrder: `WO-${9915 + complaints.length}`,
      remarks: 'Telemetry dispatch notified technician via live campus beacon.',
    };

    setComplaints((prev) => [newTicket, ...prev]);
    setTicketTab('All');
  };

  const navClick = (label) => {
    if (label === 'Campus Admin Control Center' && !isAdmin) {
      setActiveNav('Overview / Dashboard');
      return;
    }
    if (label === 'Campus Map & Facilities') {
      setModal('map');
      return;
    }
    if (label === 'Help Desk') {
      setModal('help');
      return;
    }
    if (label === 'Activity History') {
      setModal('history');
      return;
    }
    setActiveNav(label);
    if (label === 'My Complaints') setTicketTab('All');
  };

  const handleReturnHome = () => {
    if (isAdmin) navigation.navigate('AdminDashboard');
    else if (currentRole === 'STAFF' || rawFrom === 'staff') navigation.navigate('StaffDashboard');
    else navigation.navigate('StudentDashboard');
  };

  const displayName = profile?.name || profile?.full_name || user?.name || 'Kamesh S.';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'KS';

  return (
    <div
      className="flex h-full min-h-0 w-full flex-1 flex-col overflow-y-auto overflow-x-hidden bg-slate-50 font-sans text-slate-800 antialiased scroll-smooth"
      id="services-scroll-container"
    >
      {/* Top Header with Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur shadow-xs">
        {/* Row 1: Brand & Actions Bar */}
        <div className="border-b border-slate-100">
          <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-10">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReturnHome}
                title="Back to Dashboard"
                aria-label="Back to Dashboard"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200/90 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 hover:text-blue-700 hover:border-slate-300 transition-all active:scale-95"
              >
                <ChevronLeft size={20} />
              </button>

              <a
                href="#top"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveNav('Overview / Dashboard');
                }}
                className="group flex items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white shadow-sm transition-transform group-hover:scale-105">
                  <Building2 size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-black tracking-tight text-blue-900">NEXUS</span>
                    <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-800">
                      Services & Lost Found
                    </span>
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Info Institute of Technology
                  </div>
                </div>
              </a>
            </div>

            <div className="flex items-center gap-3">
              {/* Operations Live Status indicator */}
              <div className="hidden lg:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/90 px-3 py-1 text-xs font-semibold text-emerald-800">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span>Campus Desks Online</span>
              </div>

              {/* User Avatar */}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white ring-2 ring-blue-100 shadow-sm">
                  {initials}
                </div>
                <div className="hidden leading-tight lg:block">
                  <p className="text-sm font-bold text-slate-800">{displayName}</p>
                  <p className="text-[11px] font-medium text-slate-500">{role} Portal</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Service & Lost Found Header Navigation Bar */}
        <div className="border-t border-slate-100 bg-slate-50/90">
          <div className="mx-auto flex w-full max-w-[1600px] items-center px-4 sm:px-6 lg:px-10">
            <div className="relative flex w-full items-center gap-1.5 py-2">
              <nav
                ref={navRef}
                onWheel={handleNavWheel}
                aria-label="Services and Lost & Found Navigation"
                className="flex w-full items-center gap-2 overflow-x-auto py-1 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                {/* Workspace Navigation Links */}
                {filteredNavLinks.map((link) => {
                  const IconComp = link.icon;
                  const isActive = activeNav === link.id || (link.id === 'Campus Map & Facilities' && modal === 'map');
                  const isComplaints = link.id === 'My Complaints';
                  const isMatch = link.id === 'Match Suggestions & Verification';
                  return (
                    <button
                      key={link.id}
                      onClick={() => navClick(link.id)}
                      className={`group inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25 ring-1 ring-blue-600'
                          : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-xs'
                      }`}
                    >
                      <IconComp
                        size={15}
                        className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}
                      />
                      <span>{link.label}</span>
                      {isComplaints && (
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                            isActive
                              ? 'bg-blue-700 text-white'
                              : 'bg-slate-200 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-700'
                          }`}
                        >
                          {complaints.filter((c) => c.status === 'Active').length}
                        </span>
                      )}
                      {isMatch && (
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                            isActive
                              ? 'bg-amber-400 text-slate-900'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          94% Match
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Dynamic Content Main Area (Side Navigation Removed, Full-Width Layout) */}
      <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-10 pb-16" id="top">
          {/* TAB 0: DETAILED REPORT INFRASTRUCTURE ISSUE (FULL PAGE FROM IMAGE 1) */}
          {activeNav === 'Report Infrastructure Issue' && (
            <ReportInfrastructureView
              onBack={() => setActiveNav('Overview / Dashboard')}
              onSubmitTicket={handleTicketSubmitted}
              onViewComplaints={() => {
                setTicketTab('All');
                setActiveNav('My Complaints');
              }}
            />
          )}

          {/* TAB 1: EMBEDDED LOST & FOUND BOARD */}
          {activeNav === 'Lost & Found Claims' && (
            <div className="space-y-6 animate-fade-in">
              <LostAndFoundBoard
                openReportModal={openLostReport}
                onReportModalClosed={() => setOpenLostReport(false)}
                onOpenMatchSuggestions={(item) => {
                  setSelectedMatchItem(item || null);
                  setActiveNav('Match Suggestions & Verification');
                }}
              />
            </div>
          )}

          {/* TAB 1.5: AUTOMATED MATCH SUGGESTIONS & CLAIM VERIFICATION */}
          {activeNav === 'Match Suggestions & Verification' && (
            <MatchSuggestionsView
              onBack={() => setActiveNav('Lost & Found Claims')}
              onViewBoard={() => setActiveNav('Lost & Found Claims')}
              selectedMatchItem={selectedMatchItem}
              onClearSelectedItem={() => setSelectedMatchItem(null)}
            />
          )}

          {/* TAB 1.7: FIELD OPERATIONS & WORK ORDERS CONSOLE */}
          {activeNav === 'Field Operations & Work Orders' && (
            <FieldOperationsConsole
              onBack={() => setActiveNav('Overview / Dashboard')}
              onOpenReportIssue={() => setActiveNav('Report Infrastructure Issue')}
            />
          )}

          {/* TAB 1.8: CAMPUS ADMIN CONTROL CENTER */}
          {activeNav === 'Campus Admin Control Center' && isAdmin && (
            <CampusAdminControlCenter />
          )}

          {/* TAB 2: MY COMPLAINTS FULL LIST */}
          {activeNav === 'My Complaints' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">My Infrastructure Complaints</h2>
                  <p className="text-xs text-slate-500 sm:text-sm">
                    Manage and inspect the resolution progress of your campus repair tickets.
                  </p>
                </div>
                <button
                  onClick={openReport}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 sm:text-sm"
                >
                  <Plus size={16} />
                  New Complaint Ticket
                </button>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-1 text-xs font-semibold w-fit">
                {['All', 'Active', 'Resolved'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setTicketTab(tab)}
                    className={`rounded-lg px-4 py-1.5 transition-all ${
                      ticketTab === tab
                        ? 'border border-slate-200 bg-white font-bold text-blue-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab} ({tab === 'All' ? complaints.length : complaints.filter((c) => c.status === tab).length})
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {shownComplaints.length ? (
                  shownComplaints.map((ticket) => (
                    <Ticket key={ticket.id} ticket={ticket} onMessage={(t) => setModal({ type: 'message', ticket: t })} />
                  ))
                ) : (
                  <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
                    No complaints found in this category.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: OVERVIEW / DASHBOARD (DEFAULT) */}
          {activeNav === 'Overview / Dashboard' && (
            <>
              {/* Hero Banner */}
              <section className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:flex-row md:items-center">
                <div>
                  <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                    Welcome to Campus Services, {displayName}! <span>👋</span>
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-blue-200/60 bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">
                      CS-2023-8841
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Building2 size={13} className="text-slate-400" />
                      Computer Science Block A
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-blue-500" />
                      Science Quad District
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    {complaints.filter((c) => c.status === 'Active').length} Active Complaints
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-600" />
                    {complaints.filter((c) => c.status === 'Resolved').length} Resolved
                  </span>
                  <button
                    onClick={() => setActiveNav('Lost & Found Claims')}
                    className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
                  >
                    <Zap size={14} className="text-indigo-600" />1 High AI Match
                  </button>
                </div>
              </section>

              {/* Status Notice Banner if report submitted from Overview */}
              {dashboardNotice && (
                <div role="status" className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 shadow-xs animate-fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>{dashboardNotice}</span>
                  </div>
                  <button onClick={() => setDashboardNotice('')} className="text-emerald-600 hover:text-emerald-800">
                    <X size={15} />
                  </button>
                </div>
              )}
              {/* 3 Quick Action Wizard Cards */}
              <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {[
                  {
                    icon: Wrench,
                    color: 'text-blue-600 bg-blue-50',
                    title: 'Report Infrastructure Issue',
                    desc: 'Submit classroom, lab, electrical, or hostel repair requests instantly with photo intake and priority triage.',
                    button: 'Open ticket wizard',
                    action: openReport,
                  },
                  {
                    icon: Search,
                    color: 'text-cyan-600 bg-cyan-50',
                    title: 'I Lost an Item',
                    desc: 'Search AI intake registry & broadcast lost asset visual signatures across campus in seconds.',
                    button: 'File lost item report',
                    action: () => {
                      setQuickForm({
                        title: '',
                        category: 'Electronics',
                        zone: 'Central Library',
                        exactLocation: '',
                        brandModel: '',
                        description: '',
                        type: 'Lost',
                        reportDate: getTodayDate(),
                      });
                      setQuickImagePreview(null);
                      setQuickLostModal('Lost');
                    },
                  },
                  {
                    icon: PackageSearch,
                    color: 'text-indigo-600 bg-indigo-50',
                    title: 'I Found an Item',
                    desc: 'Log unattended property for quick custodial desk check-in & automated AI-assisted owner retrieval.',
                    button: 'Log discovered property',
                    action: () => {
                      setQuickForm({
                        title: '',
                        category: 'Electronics',
                        zone: 'Central Library',
                        exactLocation: '',
                        brandModel: '',
                        description: '',
                        type: 'Found',
                        reportDate: getTodayDate(),
                      });
                      setQuickImagePreview(null);
                      setQuickLostModal('Found');
                    },
                  },
                ].map((card) => {
                  const IconComp = card.icon;
                  return (
                    <div
                      key={card.title}
                      onClick={card.action}
                      className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md cursor-pointer"
                    >
                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.color}`}>
                            <IconComp size={20} />
                          </div>
                          <span className="text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-blue-600">
                            <ArrowRight size={16} />
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                          {card.title}
                        </h3>
                        <p className="mt-2 text-xs leading-relaxed text-slate-500">{card.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          card.action();
                        }}
                        className="mt-5 flex items-center gap-1 text-left text-xs font-bold text-blue-600 hover:text-blue-700"
                      >
                        {card.button}
                        <Plus size={13} className="ml-1" />
                      </button>
                    </div>
                  );
                })}
              </section>

              {/* Complaints Section */}
              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Wrench size={16} />
                    </div>
                    <h2 className="text-base font-bold text-slate-900">My Infrastructure Complaints</h2>
                  </div>

                  <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 text-xs font-semibold">
                    {['All', 'Active', 'Resolved'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setTicketTab(tab)}
                        className={`rounded-md px-3 py-1 ${
                          ticketTab === tab
                            ? 'border border-slate-200/60 bg-white font-bold text-blue-700 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {tab} ({tab === 'All' ? complaints.length : complaints.filter((c) => c.status === tab).length})
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {shownComplaints.length ? (
                    shownComplaints.map((ticket) => (
                      <Ticket key={ticket.id} ticket={ticket} onMessage={(t) => setModal({ type: 'message', ticket: t })} />
                    ))
                  ) : (
                    <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                      No complaints in this category.
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {/* Footer */}
          <footer className="border-t border-slate-200 pt-6 pb-4 text-center text-xs text-slate-500">
            NEXUS Campus Services & Lost Property Custody Portal • Info Institute of Technology
          </footer>
        </main>

      {/* ===================== MODALS ===================== */}

      {/* Report Infrastructure Issue Modal */}
      {modal === 'report' && (
        <Modal title="Report Infrastructure Issue" onClose={() => setModal(null)}>
          <form onSubmit={submitReport} className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              Issue Title *
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Broken lab projector or sparking socket"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-sm"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-semibold text-slate-700">
                Category
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-sm"
                >
                  <option>Classroom / Lab</option>
                  <option>Electrical / Power Safety</option>
                  <option>HVAC / Climate Control</option>
                  <option>Network / Wi-Fi</option>
                  <option>Hostel Facilities</option>
                  <option>Water / Plumbing</option>
                  <option>Projector & AV Tech</option>
                </select>
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Priority
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-sm"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </label>
            </div>
            <label className="block text-sm font-semibold text-slate-700">
              Campus Location *
              <input
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Block, floor, room number or outdoor bench"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-sm"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Description
              <textarea
                required
                rows="3"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the issue, any safety concerns or observed hazards"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-sm"
              />
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 shadow-sm">
                Submit Complaint
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Claim Match Modal */}
      {modal === 'claim' && (
        <Modal title="AI Match Details — LNF-204" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                  <Zap size={16} className="text-indigo-600" />
                  Potential Item Match
                </span>
                <span className="rounded-full bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white">
                  90% Confidence
                </span>
              </div>
              <p className="text-sm leading-relaxed text-slate-700">
                A black Casio FX-991EX calculator is listed at <strong className="text-slate-900">Quad Security Desk #02</strong>. Verify identifying marks before physical collection.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs text-slate-400">Pickup Location</p>
                <p className="mt-1 font-bold text-slate-900">Quad Security Desk #02</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs text-slate-400">Deposited By</p>
                <p className="mt-1 font-bold text-slate-900">Custodial staff (Abishek)</p>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Please present your college smartcard ID and be prepared to describe any unique scuffs or slide cover details.
            </p>

            <button
              onClick={() => setModal('claim-confirm')}
              className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 shadow-sm"
            >
              Request Claim Verification
            </button>
          </div>
        </Modal>
      )}

      {/* Claim Confirmation Modal */}
      {modal === 'claim-confirm' && (
        <Modal title="Claim Request Submitted" onClose={() => setModal(null)}>
          <div className="py-3 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle size={24} />
            </div>
            <p className="font-bold text-slate-900">Your claim request has been recorded.</p>
            <p className="mt-2 text-sm text-slate-500">
              Visit Quad Security Desk #02 with your student ID for custody handover.
            </p>
            <button
              onClick={() => setModal(null)}
              className="mt-5 rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-sm"
            >
              Done
            </button>
          </div>
        </Modal>
      )}

      {/* Update Lost Item Modal */}
      {modal === 'update' && (
        <Modal title="Update Lost Item Details" onClose={() => setModal(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setModal('update-confirm');
            }}
            className="space-y-4"
          >
            <label className="block text-sm font-semibold">
              Item Description
              <input
                defaultValue="Blue Hydro Flask Water Bottle"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2 text-sm"
              />
            </label>
            <label className="block text-sm font-semibold">
              Last Seen Location
              <input
                defaultValue="Library 2nd Floor Reading Room • Desk 42"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2 text-sm"
              />
            </label>
            <label className="block text-sm font-semibold">
              Unique Identifier
              <input
                defaultValue="GitHub Octocat sticker on lid"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2 text-sm"
              />
            </label>
            <button className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm">
              Save Changes
            </button>
          </form>
        </Modal>
      )}

      {/* Details Saved Confirmation Modal */}
      {modal === 'update-confirm' && (
        <Modal title="Details Saved" onClose={() => setModal(null)}>
          <p className="text-sm text-slate-600">The item details have been saved for this session.</p>
          <button
            onClick={() => setModal(null)}
            className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white"
          >
            Close
          </button>
        </Modal>
      )}

      {/* Found Item Confirmation Modal */}
      {modal === 'found-confirm' && (
        <Modal title="Item Status Updated" onClose={() => setModal(null)}>
          <div className="py-3 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle size={24} />
            </div>
            <p className="font-bold text-slate-900">Item marked as recovered.</p>
            <p className="mt-2 text-sm text-slate-500">
              The status has been updated in the campus registry.
            </p>
            <button
              onClick={() => setModal(null)}
              className="mt-5 rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white"
            >
              Done
            </button>
          </div>
        </Modal>
      )}

      {/* Message Technician Modal */}
      {modal?.type === 'message' && (
        <Modal title={`Message ${modal.ticket.assignee}`} onClose={() => setModal(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setModal('message-confirm');
            }}
            className="space-y-4"
          >
            <p className="text-sm text-slate-500">
              Regarding ticket <strong className="text-slate-800">#{modal.ticket.id}</strong>: {modal.ticket.title}
            </p>
            <textarea
              required
              rows="4"
              placeholder="Write a message to the assigned technician regarding access or timing..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm"
            />
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 shadow-sm">
              <Send size={15} />
              Send Message
            </button>
          </form>
        </Modal>
      )}

      {/* Message Prepared Modal */}
      {modal === 'message-confirm' && (
        <Modal title="Message Sent" onClose={() => setModal(null)}>
          <p className="text-sm text-slate-600">Your message has been dispatched to the assigned facilities coordinator.</p>
          <button
            onClick={() => setModal(null)}
            className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white"
          >
            Close
          </button>
        </Modal>
      )}

      {/* Campus Map & Facilities Modal */}
      {modal === 'map' && (
        <Modal
          title="Campus Map & Facilities"
          maxWidth="max-w-4xl"
          onClose={() => setModal(null)}
        >
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-inner">
              <img
                src={CAMPUS_MAP_IMAGE}
                alt="Info College Campus Map & Facilities"
                className="w-full h-auto max-h-[60vh] object-contain mx-auto rounded-lg"
              />
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-blue-950">Campus Layout & Facilities Directory</p>
                <p className="text-blue-700 mt-0.5">
                  1: Academic Block • 2: Library • 3: Hostel • 4: Cafeteria • 5: Sports Complex • 6: Science & Lab Block • 7: Auditorium • 8: Parking Area • 9: Green Area / Garden
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-500">
              <p>
                Nearest custodial intake desk: Science & Lab Block (6), central concourse.
              </p>
              <a
                href={CAMPUS_MAP_IMAGE}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-semibold text-blue-600 hover:text-blue-800"
              >
                <ExternalLink size={14} /> Open full size map
              </a>
            </div>
          </div>
          <button
            onClick={() => setModal(null)}
            className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm"
          >
            Close
          </button>
        </Modal>
      )}

      {/* Activity History Modal */}
      {modal === 'history' && (
        <Modal
          title="Activity History"
          maxWidth="max-w-lg"
          onClose={() => setModal(null)}
        >
          <div className="space-y-2 text-sm">
            {historyItems.map((x) => (
              <div key={x} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-slate-700 text-xs font-medium">
                {x}
              </div>
            ))}
          </div>
          <button
            onClick={() => setModal(null)}
            className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm"
          >
            Close
          </button>
        </Modal>
      )}

      {/* Help Desk Modal */}
      {modal === 'help' && (
        <Modal
          title="Help Desk"
          maxWidth="max-w-lg"
          onClose={() => setModal(null)}
        >
          <div className="space-y-3 text-sm text-slate-600">
            <p>
              <strong className="text-slate-900">Campus Services Help Desk</strong>
            </p>
            <p>
              For critical electrical or hazardous safety concerns, immediately clear the area and notify the security desk at extension 4001.
            </p>
            <p>For all standard classroom, lab, or hostel repairs, use "Report Infrastructure Issue".</p>
          </div>
          <button
            onClick={() => setModal(null)}
            className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm"
          >
            Close
          </button>
        </Modal>
      )}

      {/* Quick Lost / Found In-Place Modal (Keeps user on Overview / Dashboard) */}
      {quickLostModal && (
        <Modal
          title={quickLostModal === 'Lost' ? 'Report a Lost Item' : 'Log a Found Item (Property Discovery)'}
          maxWidth="max-w-2xl"
          onClose={() => setQuickLostModal(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!quickForm.title.trim()) return;
              const isLost = quickForm.type === 'Lost';
              const formattedDate = new Date(quickForm.reportDate || new Date()).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              setDashboardNotice(
                isLost
                  ? `Success! Lost report for "${quickForm.title}" (Date: ${formattedDate}) broadcast to Info IT campus registry.`
                  : `Success! Discovery of "${quickForm.title}" on ${formattedDate} recorded. Please deposit the item at Quad Security Desk #02.`
              );
              setHistoryItems((prev) => [
                `${isLost ? 'LOST REPORT' : 'FOUND REPORT'}: "${quickForm.title}" • Date: ${formattedDate} (Reported at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
                ...prev,
              ]);
              setTimeout(() => setDashboardNotice(''), 6500);
              setQuickLostModal(null);
            }}
            className="space-y-4"
          >
            {/* Header metadata pill with reporting timestamp */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-semibold text-slate-500">
                Campus Security & Custodial Registry
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
                <Calendar size={12} className="text-blue-600" />
                Reported: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            {/* 1. Report Type Pill Toggle */}
            <div>
              <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                1. REPORT TYPE
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setQuickForm({ ...quickForm, type: 'Lost' })}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all ${
                    quickForm.type === 'Lost'
                      ? 'border-2 border-cyan-600 bg-cyan-50/70 text-cyan-800 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Search size={16} />
                  Lost Item (I lost something)
                </button>
                <button
                  type="button"
                  onClick={() => setQuickForm({ ...quickForm, type: 'Found' })}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all ${
                    quickForm.type === 'Found'
                      ? 'border-2 border-indigo-600 bg-indigo-50/70 text-indigo-800 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <PackageSearch size={16} />
                  Found Item (I discovered property)
                </button>
              </div>
            </div>

            {/* 2. Item Identification */}
            <div className="space-y-3">
              <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                2. ITEM DETAILS *
              </span>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Item Title *</label>
                <input
                  required
                  value={quickForm.title}
                  onChange={(e) => setQuickForm({ ...quickForm, title: e.target.value })}
                  placeholder={
                    quickForm.type === 'Lost'
                      ? 'e.g. Casio FX-991EX Calculator, Black Backpack'
                      : 'e.g. Silver Water Bottle, Apple Earbuds in Blue Case'
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 text-xs text-slate-800 focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                  <select
                    value={quickForm.category}
                    onChange={(e) => setQuickForm({ ...quickForm, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 text-xs font-semibold text-slate-700 focus:bg-white focus:border-blue-500"
                  >
                    <option>Electronics</option>
                    <option>Study Materials</option>
                    <option>Wallets & Cards</option>
                    <option>Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Brand / Model / Color</label>
                  <input
                    value={quickForm.brandModel || ''}
                    onChange={(e) => setQuickForm({ ...quickForm, brandModel: e.target.value })}
                    placeholder="e.g. Matte Black, Navy Blue, Sony"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 text-xs text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 3. Incident Date & Campus Location */}
            <div className="space-y-3">
              <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                3. INCIDENT DATE & CAMPUS LOCATION *
              </span>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <Calendar size={13} className="text-blue-600" />
                    {quickForm.type === 'Lost' ? 'Date Lost *' : 'Date Found *'}
                  </label>
                  <input
                    type="date"
                    required
                    value={quickForm.reportDate}
                    onChange={(e) => setQuickForm({ ...quickForm, reportDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Campus Zone *</label>
                  <select
                    value={quickForm.zone}
                    onChange={(e) => setQuickForm({ ...quickForm, zone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 text-xs font-semibold text-slate-700 focus:bg-white focus:border-blue-500"
                  >
                    <option>Central Library</option>
                    <option>Main Canteen / Food Court</option>
                    <option>Sports Complex</option>
                    <option>Academic Block B</option>
                    <option>Hostel Block</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Exact Area / Spot</label>
                  <input
                    value={quickForm.exactLocation || ''}
                    onChange={(e) => setQuickForm({ ...quickForm, exactLocation: e.target.value })}
                    placeholder="e.g. Table 14, 2nd floor cubicle, bench"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 text-xs text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 4. Description & Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Additional Notes / Distinctive Marks</label>
              <textarea
                rows={2}
                value={quickForm.description}
                onChange={(e) => setQuickForm({ ...quickForm, description: e.target.value })}
                placeholder="Mention distinctive marks, scratches, stickers, engravings, or circumstances..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 text-xs text-slate-800 focus:bg-white focus:border-blue-500"
              />
            </div>

            {/* Visual Signature Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Attach Photo (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => setQuickImagePreview(ev.target.result);
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {quickImagePreview && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={quickImagePreview} alt="Preview" className="h-12 w-12 rounded-lg object-cover border border-slate-200" />
                  <span className="text-[11px] text-emerald-600 font-semibold">Image attached</span>
                </div>
              )}
            </div>

            {quickForm.type === 'Found' && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3 text-xs text-indigo-900">
                <span className="font-bold">Custodial Handover Notice:</span> Please bring the physical item to <strong>Quad Security Desk #02</strong> or Library Custodial Desk #01 for official intake verification.
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setQuickLostModal(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`rounded-xl px-5 py-2 text-xs font-bold text-white shadow-xs ${
                  quickForm.type === 'Lost'
                    ? 'bg-cyan-600 hover:bg-cyan-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {quickForm.type === 'Lost' ? 'Broadcast Lost Report' : 'Confirm & Log Found Item'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
