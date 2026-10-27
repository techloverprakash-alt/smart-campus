import React, { useState, useMemo } from 'react';
import {
  Sparkles, ShieldCheck, Check, CheckCircle2, AlertTriangle, ArrowLeft,
  Search, SlidersHorizontal, MapPin, Clock, Eye, Trash2, Send,
  FileCheck, Shield, ChevronDown, User, QrCode, X, Phone, Lock,
  Camera, Zap, RefreshCw, ExternalLink, ThumbsUp, Bell, AlertCircle
} from 'lucide-react';

const INITIAL_CANDIDATES = [
  {
    id: 'CAND-01',
    confidence: 92,
    confidenceTier: 'high',
    confidenceColor: 'emerald',
    strokeDash: '92, 100',
    criteria: [
      { label: 'Category Match', passed: true },
      { label: 'Radius < 15m', passed: true },
      { label: 'Delta: 45 Mins', passed: true },
      { label: 'OCR FX-991EX', passed: true },
    ],
    lost: {
      reportId: 'L-42',
      date: 'Oct 23 • 01:15 PM',
      reporter: 'Kamesh S.',
      studentId: 'CS-2023-8841',
      dept: 'Computer Science',
      category: 'Electronics',
      title: 'Casio Scientific Calculator FX-991EX',
      description: 'Black solar dual-power calculator left behind after discrete math lunch discussion. Has clear protective hard slide cover with slight scuff on corner.',
      location: 'Main Canteen Quad 2 • Seating Table 14',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-zDJleIRsPUmBdEuotmkBJH_tCxf9ZRsvzcPdLo9H-oPuS4zfYLehLuXtC-zuTHGf5fxtBMmR3X4FbFKwvLW71zf4aQyBJH9impUalfAhQhcMeuhm1YRi10A3hZkic-_6b2UtxTX-QOj6k8O-4Y7NnsaoadYIjWNDvmP89B56HlDgZCqH4J_eugD6TnpOYe7OCTJ23LJQiA-Uw29dpb-4i0365_icpfY4g0F4hRrmd616aXyGkEDi',
      imageLabel: 'Owner Reference Photo',
    },
    found: {
      reportId: 'F-19',
      date: 'Oct 23 • 02:00 PM',
      finder: 'Esakki Muthu',
      finderRole: 'Custodial Team • Facility Shift B',
      intakeType: 'Intake Scan',
      title: 'Black Scientific Calculator',
      description: 'Retrieved during canteen table sanitation routine. Turned in promptly to Security Desk 02 with protective cover intact.',
      storage: 'Desk 02 (Vault A-14)',
      storageStatus: 'SECURED',
      tag: '#SEC-990',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFm40maZZN6bUH6xUzuC7r46JfPZFhPfwJRqrTnT9fKmcx7gGg2tsFgs0aq7u3SeSi5RN7xH7s_nB1samyARLSBNd5Npvx_KujzBU0gGT2ITVK7vz8VaXWVzuvf3JkUzcibSl_R-YcKrOJbLF_NqPcQc9FViQEPu2xJXcALrjzOsEqbGgj2KsR23dEDFrcxVD5gVV7bZwmICEhJi5gn_LttpgXqg5QYvwqMVZh1Ce5Xj2tYp2wEd0D',
      imageLabel: 'Campus Security Intake Scan',
      scansCount: 2,
    },
    doubleBlind: {
      question: 'Protective Cover Marking / Scuff Check',
      ownerClaim: 'Clear protective hard slide cover with slight scuff on corner.',
      officerVerification: 'Inspection of Vault A-14 item confirms scuff on lower-right edge of slide cover.',
      concordanceScore: 100,
      status: 'Verified Concordance',
    },
    status: 'Ready for Handover',
  },
  {
    id: 'CAND-02',
    confidence: 88,
    confidenceTier: 'medium',
    confidenceColor: 'amber',
    strokeDash: '88, 100',
    criteria: [
      { label: 'Earbuds / Apple', passed: true },
      { label: 'Central Library', passed: true },
      { label: 'Time delta 2.5 hrs', passed: true },
    ],
    lost: {
      reportId: 'L-39',
      date: 'Oct 23 • 09:30 AM',
      reporter: 'Priya M.',
      studentId: 'ME-2022-4102',
      dept: 'Mechanical Engg',
      category: 'Audio & Accessories',
      title: 'Apple AirPods Pro Gen 2',
      description: 'Left on study cubicle desk near window. Navy blue silicone protective case. Case may have slight dust.',
      location: 'Central Library 2nd Floor Quiet Zone',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxlZUuXLyQ6NL4vgeTmiZ6HOzM5z3qKOHxpyhhRdZRd52ayl2A9cl9a0cIwmvzycFlJ-tlXShMr_rDf58BEm7woD-eLQG9OiikUzdkEczXDwWo1-yCysxyK2_dqT3VSjTOWlNWQ1H6TjZIym4uZjW6fECIPrHB93UqfyBRiVDLVvhG5hBAx-pnDThuKQ_-ESG8BqpVOfuTv_jn7xaqwdnYGsWIhasKJGYJBmdJwTJbezAhFQYwDomy',
      imageLabel: 'Owner Reference Photo',
    },
    found: {
      reportId: 'F-14',
      date: 'Oct 23 • 12:00 PM',
      finder: 'Library Proctor',
      finderRole: 'Circulation Desk Lead',
      intakeType: 'Logged Deposit',
      title: 'Wireless Earbuds in Blue Case',
      description: 'Handed in from 2nd floor library stacks. Fully operational battery indicator, case clean.',
      storage: 'Library Custodial Desk #1 (Locker B-03)',
      storageStatus: 'LOCKED',
      tag: '#LIB-412',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuChRoGIW0TkgxXblMVAUCijuAlDjGmuPR9nW0gknztS8A6qRslieMLna7WNkLm2Rem7MTRhI6Lm6gt8kJ0wJtJokcJ3zoG73CXo5IHnBY3RfFmpCwPka4GTnzNvFXZwe74lzhIkQfzF5ArnojzortG9Gc1YZ666CwYBrMFDLgwN5IeSUUyg_Pd6S7IqI22MTX6Wm33Pa00Ef42ylrGTtkhZIzhr5YWXGHq8KPRBtCylxP_3EYi4vYb4',
      imageLabel: 'Intake Verification Photo',
      scansCount: 1,
    },
    doubleBlind: {
      question: 'Key Loop / Silicone Texture Verification',
      ownerClaim: 'Notification dispatched to student asking to describe lanyard loop.',
      officerVerification: 'Awaiting student response in portal inbox.',
      concordanceScore: 85,
      status: 'Awaiting Student Confirmation',
    },
    status: 'Pending Verification Question',
  },
  {
    id: 'CAND-03',
    confidence: 95,
    confidenceTier: 'high',
    confidenceColor: 'emerald',
    strokeDash: '95, 100',
    criteria: [
      { label: 'Flask / Hydro', passed: true },
      { label: 'Octocat Decal Match', passed: true },
      { label: 'Delta: 1.2 Hours', passed: true },
      { label: 'Color Cobalt Blue', passed: true },
    ],
    lost: {
      reportId: 'L-51',
      date: 'Oct 24 • 08:30 AM',
      reporter: 'Ananya R.',
      studentId: 'EC-2024-3019',
      dept: 'ECE Dept',
      category: 'Accessories',
      title: 'Blue Hydro Flask 32oz (Octocat Sticker)',
      description: 'Cobalt blue with a wide flex cap. Distinct GitHub Octocat and React sticker on front.',
      location: 'Central Library 2nd Fl',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjMLDFmDJ_pEgknJSLl_nX1TW7ctugA08YLnyth0KyNq-QnqjyW5RZY2qkz40PHUaVc82v5z2HONxqaxkticlCKEr7h0UBhJQ7jkPAr9IYv1f-tYURwGVmk-l-7cl_FrleiW6cXu5yGE2JxI95b_X4NvtCFUSeaTa0j_HKzzydg21xlm2bWCZkUPBQMZdHF3yFFN-BlsEh2LV1wvyrMd9mMmiY7uFOyDGcUR0a3QqcqosEOuAXG_-z',
      imageLabel: 'Owner Description Photo',
    },
    found: {
      reportId: 'F-22',
      date: 'Oct 24 • 09:45 AM',
      finder: 'Mani K.',
      finderRole: 'Facilities Staff Shift A',
      intakeType: 'Intake Scan',
      title: 'Cobalt Blue Insulated Water Flask',
      description: 'Turned in from reading table near stacks. White Octocat graphic prominently visible on flask exterior.',
      storage: 'Desk 01 (Locker C-09)',
      storageStatus: 'SECURED',
      tag: '#SEC-998',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjMLDFmDJ_pEgknJSLl_nX1TW7ctugA08YLnyth0KyNq-QnqjyW5RZY2qkz40PHUaVc82v5z2HONxqaxkticlCKEr7h0UBhJQ7jkPAr9IYv1f-tYURwGVmk-l-7cl_FrleiW6cXu5yGE2JxI95b_X4NvtCFUSeaTa0j_HKzzydg21xlm2bWCZkUPBQMZdHF3yFFN-BlsEh2LV1wvyrMd9mMmiY7uFOyDGcUR0a3QqcqosEOuAXG_-z',
      imageLabel: 'Custodial Intake Scan',
      scansCount: 1,
    },
    doubleBlind: {
      question: 'Decal Inspection & Dent Check',
      ownerClaim: 'GitHub Octocat and React sticker on front body.',
      officerVerification: 'Physical scan verifies authentic Octocat + React stickers intact without tampering.',
      concordanceScore: 100,
      status: 'Verified Concordance',
    },
    status: 'Ready for Handover',
  },
  {
    id: 'CAND-04',
    confidence: 76,
    confidenceTier: 'medium',
    confidenceColor: 'indigo',
    strokeDash: '76, 100',
    criteria: [
      { label: 'Wallet / Leather', passed: true },
      { label: 'Sports Complex', passed: true },
      { label: 'Campus Smartcard inside', passed: true },
    ],
    lost: {
      reportId: 'L-47',
      date: 'Oct 22 • 05:00 PM',
      reporter: 'Vikram M.',
      studentId: 'EE-2023-1120',
      dept: 'Electrical & Electronics',
      category: 'Wallets & IDs',
      title: 'Brown Leather RFID Wallet with Student ID',
      description: 'Contains campus smartcard, driving license, and hostel mess pass card. Highly urgent.',
      location: 'Sports Complex Gym Locker Area',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBR8wiotPeLc5bm7jLTFhUx0EvywmccNYJADk9Dtt7H82Z_UvLJttkDfnvSisBVHMvKeIIHyXxOlbn1OeRvXFkrc3qTKe-jkPS7eOC9AcRdYoHlNSZ7tfNBGHEqIRze5QwggG51DB-gZKjL6H6fpO2_Rw8fn87lqhl2FNpOp-sgygwH-kAJnZpIyNVCOUM6yJ9-etUVAW_xOG8pOqm9SeUDwmZZn9VyFOJ_T3OkR9xaXnTO7tHFJ40q',
      imageLabel: 'Reference Photo',
    },
    found: {
      reportId: 'F-08',
      date: 'Oct 22 • 07:15 PM',
      finder: 'Gym Supervisor',
      finderRole: 'Sports Centre Staff',
      intakeType: 'Custodial Handover',
      title: 'Brown Trifold Leather Wallet',
      description: 'Found inside cubicle bench locker 12. Smartcard verified with campus roll prefix EE-2023.',
      storage: 'Desk 03 (Vault Safe B-02)',
      storageStatus: 'SECURED',
      tag: '#SEC-972',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBR8wiotPeLc5bm7jLTFhUx0EvywmccNYJADk9Dtt7H82Z_UvLJttkDfnvSisBVHMvKeIIHyXxOlbn1OeRvXFkrc3qTKe-jkPS7eOC9AcRdYoHlNSZ7tfNBGHEqIRze5QwggG51DB-gZKjL6H6fpO2_Rw8fn87lqhl2FNpOp-sgygwH-kAJnZpIyNVCOUM6yJ9-etUVAW_xOG8pOqm9SeUDwmZZn9VyFOJ_T3OkR9xaXnTO7tHFJ40q',
      imageLabel: 'Security Intake Scan',
      scansCount: 2,
    },
    doubleBlind: {
      question: 'Sensitive ID & Card Concordance',
      ownerClaim: 'Driving license and hostel mess pass card present inside.',
      officerVerification: 'Physical safe inspection verified matching driving license bearing claimant name.',
      concordanceScore: 98,
      status: 'Verified Concordance',
    },
    status: 'Ready for Handover',
  },
];

export default function MatchSuggestionsView({ onBack, onViewBoard, selectedMatchItem, onClearSelectedItem }) {
  const [candidates, setCandidates] = useState(INITIAL_CANDIDATES);
  const [filterTab, setFilterTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('Highest Match Score');
  const [toastMessage, setToastMessage] = useState('');
  const [activeHandover, setActiveHandover] = useState(null);
  const [releasedTickets, setReleasedTickets] = useState([]);
  const [showManualIntakeModal, setShowManualIntakeModal] = useState(false);
  const [intakeForm, setIntakeForm] = useState({
    title: '',
    category: 'Electronics',
    location: 'Central Digital Library',
    tag: '#SEC-999',
    finder: 'Campus Officer Shift C',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  React.useEffect(() => {
    if (selectedMatchItem) {
      const titleLower = selectedMatchItem.title?.toLowerCase() || '';
      const matchExists = candidates.some(
        (c) =>
          c.lost.title.toLowerCase().includes(titleLower) ||
          titleLower.includes(c.lost.title.toLowerCase().split(' ')[0])
      );

      if (!matchExists && selectedMatchItem.title) {
        const dynamicCandidate = {
          id: `CAND-${candidates.length + 1}`,
          confidence: 94,
          confidenceTier: 'high',
          confidenceColor: 'emerald',
          strokeDash: '94, 100',
          criteria: [
            { label: 'Category Match', passed: true },
            { label: 'Zone Proximity', passed: true },
            { label: 'Intake Confirmed', passed: true },
          ],
          lost: {
            reportId: selectedMatchItem.id || `LNF-${Date.now().toString().slice(-3)}`,
            date: selectedMatchItem.age || 'Just now',
            reporter: selectedMatchItem.owner || 'Campus Community Student',
            studentId: 'ST-2024-LIVE',
            dept: 'Campus Community',
            category: selectedMatchItem.category || 'General',
            title: selectedMatchItem.title,
            description: selectedMatchItem.description || 'Reported lost item on campus board.',
            location: selectedMatchItem.location || selectedMatchItem.zone || 'Campus Zone',
            image: selectedMatchItem.image || 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80',
            imageLabel: 'Reference Photo',
          },
          found: {
            reportId: `F-${Date.now().toString().slice(-3)}`,
            date: 'Just now',
            finder: 'Verified Student Finder',
            finderRole: 'Student Discovery Confirmation',
            intakeType: 'Discovery Handover Confirmation',
            title: selectedMatchItem.title,
            description: 'Item discovery confirmed by finder. Transferred to custodial custody for owner verification.',
            storage: 'Desk 02 (Quad Intake Bay)',
            storageStatus: 'INTAKE PENDING',
            tag: `#DISC-${Date.now().toString().slice(-4)}`,
            image: selectedMatchItem.image || 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80',
            imageLabel: 'Discovery Intake Photo',
            scansCount: 1,
          },
          doubleBlind: {
            question: 'Custody Handover Verification',
            ownerClaim: 'Awaiting student arrival at security desk.',
            officerVerification: 'Physical custody token pending desk scan.',
            concordanceScore: 94,
            status: 'Verified Concordance',
          },
          status: 'Ready for Handover',
        };
        setCandidates((prev) => [dynamicCandidate, ...prev]);
      }

      showToast(`Discovery confirmed for "${selectedMatchItem.title}"! AI Triage matching active.`);
    }
  }, [selectedMatchItem]);

  const handleDismiss = (id) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
    showToast('Match candidate dismissed and archived.');
  };

  const handleSendAlert = (candidate) => {
    showToast(`Instant SMS & Portal match alert sent to ${candidate.lost.reporter} (${candidate.lost.studentId}).`);
  };

  const handleRequestEvidence = (candidate) => {
    showToast(`Photo evidence request sent to ${candidate.lost.reporter}. Expected turnaround ~2h.`);
  };

  const handleApproveHandover = (candidate) => {
    setActiveHandover(candidate);
  };

  const confirmHandoverRelease = () => {
    if (!activeHandover) return;
    setReleasedTickets((prev) => [...prev, activeHandover.id]);
    showToast(`Custody release approved! Digital Pickup Pass #${activeHandover.found.tag} issued to ${activeHandover.lost.reporter}.`);
    setActiveHandover(null);
  };

  const handleCreateIntake = (e) => {
    e.preventDefault();
    if (!intakeForm.title.trim()) return;

    const newCandidate = {
      id: `CAND-0${candidates.length + 5}`,
      confidence: 91,
      confidenceTier: 'high',
      confidenceColor: 'emerald',
      strokeDash: '91, 100',
      criteria: [
        { label: 'Category Match', passed: true },
        { label: 'Near Perimeter', passed: true },
        { label: 'New Deposit', passed: true },
      ],
      lost: {
        reportId: `L-${70 + candidates.length}`,
        date: 'Just now',
        reporter: 'Campus Community Student',
        studentId: 'ST-2024-9901',
        dept: 'Engineering',
        category: intakeForm.category,
        title: intakeForm.title,
        description: 'Reported unattended item in campus zone.',
        location: intakeForm.location,
        image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80',
        imageLabel: 'Reference Photo',
      },
      found: {
        reportId: `F-${30 + candidates.length}`,
        date: 'Just now',
        finder: intakeForm.finder,
        finderRole: 'Campus Patrol Officer',
        intakeType: 'Manual Scan',
        title: intakeForm.title,
        description: 'Logged directly via manual intake scanner.',
        storage: 'Desk 01 (Vault Safe A-01)',
        storageStatus: 'SECURED',
        tag: intakeForm.tag,
        image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80',
        imageLabel: 'Intake Scan Photo',
        scansCount: 1,
      },
      doubleBlind: {
        question: 'Physical Descriptor Check',
        ownerClaim: 'Brand model and color match.',
        officerVerification: 'Physical vault check confirmed serial label.',
        concordanceScore: 94,
        status: 'Verified Concordance',
      },
      status: 'Ready for Handover',
    };

    setCandidates([newCandidate, ...candidates]);
    setShowManualIntakeModal(false);
    setIntakeForm({ title: '', category: 'Electronics', location: 'Central Digital Library', tag: '#SEC-999', finder: 'Campus Officer Shift C' });
    showToast(`New intake scan registered! AI matched candidate ${newCandidate.id} with 91% confidence.`);
  };

  const filteredCandidates = useMemo(() => {
    return candidates
      .filter((c) => {
        if (filterTab === 'High Confidence') return c.confidence >= 90;
        if (filterTab === 'Awaiting Verification') return c.confidence < 90;
        return true;
      })
      .filter((c) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          c.lost.title.toLowerCase().includes(q) ||
          c.lost.reporter.toLowerCase().includes(q) ||
          c.lost.studentId.toLowerCase().includes(q) ||
          c.found.tag.toLowerCase().includes(q) ||
          c.lost.reportId.toLowerCase().includes(q) ||
          c.found.reportId.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortOrder === 'Highest Match Score') return b.confidence - a.confidence;
        if (sortOrder === 'Lowest Match Score') return a.confidence - b.confidence;
        return 0;
      });
  }, [candidates, filterTab, searchQuery, sortOrder]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20 animate-fade-in font-sans text-slate-800">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl border border-blue-200 bg-slate-900 px-5 py-3 text-xs font-semibold text-white shadow-2xl animate-fade-in">
          <Sparkles size={16} className="text-blue-400 animate-pulse" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage('')}
            className="ml-2 rounded-lg p-1 text-slate-400 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Breadcrumb Navigation & Engine Live Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 font-bold text-blue-700 hover:text-blue-900 transition-colors"
          >
            <ArrowLeft size={15} />
            Back to Services Overview
          </button>
          <span>•</span>
          <span className="text-slate-600 font-semibold">Campus Security Command</span>
          <span>•</span>
          <span className="text-slate-900 font-bold">Lost & Found Reconciliation Desk</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
            AI Multimodal Reconciliation Live
          </span>
          {onViewBoard && (
            <button
              onClick={onViewBoard}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 underline underline-offset-2"
            >
              Open Public Board
            </button>
          )}
        </div>
      </div>

      {/* Main Page Title & Top Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Automated Match Suggestions & Claim Verification
          </h1>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">
            AI-assisted multimodal matching between reported lost items and physical security custodial deposits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {candidates.length < INITIAL_CANDIDATES.length && (
            <button
              onClick={() => setCandidates(INITIAL_CANDIDATES)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
            >
              <RefreshCw size={13} />
              Restore Dismissed ({INITIAL_CANDIDATES.length - candidates.length})
            </button>
          )}
          <button
            onClick={() => setShowManualIntakeModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Camera size={14} />
            Manual Intake Scan
          </button>
        </div>
      </div>

      {/* Active Discovery Banner if triggered from I Found This */}
      {selectedMatchItem && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border-2 border-blue-500/30 bg-blue-50/80 p-4 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700">
                  Item Discovery Confirmed
                </span>
                <span className="rounded-full bg-blue-200/90 px-2 py-0.5 text-[10px] font-bold text-blue-900">
                  {selectedMatchItem.id}
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  AI Triage Active
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedMatchItem.title}</p>
              <p className="text-xs text-slate-600">
                Zone: <strong className="text-slate-800">{selectedMatchItem.location || selectedMatchItem.zone}</strong> · Please deposit the physical item at Quad Security Desk #02.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onClearSelectedItem && (
              <button
                type="button"
                onClick={() => {
                  onClearSelectedItem();
                  setSearchQuery('');
                }}
                className="rounded-xl border border-blue-300 bg-white px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50 transition shadow-2xs"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>
      )}

      {/* KPI METRIC SUMMARY SECTION */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* KPI 1 */}
        <div className="flex items-start justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-slate-300">
          <div>
            <span className="text-xs font-semibold text-slate-500">Pending Match Suggestions</span>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{candidates.length}</span>
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-extrabold text-blue-700">
                <Zap size={12} />
                +2 new since 9 AM
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              High-confidence threshold: &gt;85% <strong className="font-bold text-slate-700 ml-1">2 ready</strong>
            </p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-inner">
            <Sparkles size={20} />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="flex items-start justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-slate-300">
          <div>
            <span className="text-xs font-semibold text-slate-500">Awaiting Ownership Verification</span>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">2</span>
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-extrabold text-amber-800">
                <AlertCircle size={12} />
                Urgent Review
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              Double-blind security check <strong className="font-bold text-slate-700 ml-1">1 exact match</strong>
            </p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shadow-inner">
            <Shield size={20} />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="flex items-start justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-slate-300">
          <div>
            <span className="text-xs font-semibold text-slate-500">Items Returned This Month</span>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">18</span>
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-extrabold text-emerald-700">
                <CheckCircle2 size={12} />
                94.2% Success Rate
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              Average turnaround time <strong className="font-bold text-slate-700 ml-1">4.6 Hours</strong>
            </p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-inner">
            <FileCheck size={20} />
          </div>
        </div>
      </section>

      {/* FILTER & SEARCH TOOLBAR */}
      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs md:flex-row md:items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'All', label: `All Matches (${candidates.length})` },
            { id: 'High Confidence', label: 'High Confidence >90%' },
            { id: 'Awaiting Verification', label: 'Awaiting Claimant Verification' },
          ].map((tab) => {
            const active = filterTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterTab(tab.id)}
                className={`whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {/* Search box */}
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, Token ID, roll no..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-1.5 pl-8 pr-12 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-slate-100 px-1 font-mono text-[10px] text-slate-500">
              ⌘K
            </kbd>
          </div>

          {/* Sort dropdown */}
          <div className="relative shrink-0">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="appearance-none rounded-xl border border-slate-200 bg-slate-50/60 py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-700 outline-none hover:bg-slate-100 focus:border-blue-500"
            >
              <option value="Highest Match Score">Highest Confidence</option>
              <option value="Lowest Match Score">Lowest Confidence</option>
            </select>
            <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </section>

      {/* CANDIDATE MATCHES LIST */}
      <div className="space-y-6">
        {filteredCandidates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Search size={22} />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Match Candidates Found</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              There are no match candidates currently matching your filter criteria. Try selecting "All Matches" or clearing search query.
            </p>
            <button
              onClick={() => { setFilterTab('All'); setSearchQuery(''); }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredCandidates.map((candidate) => {
            const isReleased = releasedTickets.includes(candidate.id);
            const isHighConfidence = candidate.confidence >= 90;

            return (
              <article
                key={candidate.id}
                className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all hover:border-slate-300 hover:shadow-md animate-fade-in"
              >
                {/* Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-slate-50/70 px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 font-mono text-xs font-extrabold text-blue-800">
                      {candidate.id.replace('CAND-', '#')}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-black text-slate-900">Match Candidate Pair</h2>
                        <span className="rounded bg-slate-200/80 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                          {candidate.lost.reportId} ↔ {candidate.found.reportId}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Paired {candidate.found.date} • Vault Location: <strong className="text-slate-700">{candidate.found.storage}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isReleased ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700">
                        <CheckCircle2 size={13} />
                        CUSTODY RELEASED
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                        isHighConfidence ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        <Sparkles size={11} />
                        {candidate.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Body: Lost vs Found Side-by-Side Comparison */}
                <div className="p-5 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-11 gap-5 items-stretch">
                    {/* LEFT: REPORTED LOST ITEM */}
                    <div className="md:col-span-4 flex flex-col justify-between rounded-2xl border border-slate-200/70 bg-slate-50/60 p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                          <span className="rounded border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-rose-700">
                            • Lost Report #{candidate.lost.reportId}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400">{candidate.lost.date}</span>
                        </div>

                        {/* Student Info */}
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                            {candidate.lost.reporter.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <h3 className="text-xs font-extrabold text-slate-900 leading-tight">
                              {candidate.lost.reporter}
                            </h3>
                            <p className="text-[11px] text-slate-500">
                              {candidate.lost.studentId} • {candidate.lost.dept}
                            </p>
                          </div>
                        </div>

                        {/* Item Details */}
                        <div className="space-y-1.5 text-xs">
                          <span className="inline-block rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                            {candidate.lost.category}
                          </span>
                          <p className="text-sm font-extrabold text-slate-900">{candidate.lost.title}</p>
                          <p className="text-[11px] leading-relaxed text-slate-600 bg-white/70 p-2.5 rounded-xl border border-slate-200/50">
                            "{candidate.lost.description}"
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
                            <MapPin size={13} className="shrink-0 text-slate-400" />
                            <span>{candidate.lost.location}</span>
                          </div>
                        </div>
                      </div>

                      {/* Photo Thumbnail */}
                      <div className="mt-4 pt-3 border-t border-slate-200/60">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          <span>{candidate.lost.imageLabel}</span>
                          <span className="text-blue-600 font-semibold">Self-uploaded</span>
                        </div>
                        <div className="relative h-28 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                          <img
                            src={candidate.lost.image}
                            alt={candidate.lost.title}
                            className="h-full w-full object-cover transition hover:scale-105 duration-300"
                          />
                          <span className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-white">
                            Student Photo
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CENTER: AI MATCH CONFIDENCE GAUGE */}
                    <div className="md:col-span-3 flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-gradient-to-b from-slate-50/50 to-white p-4 text-center">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                        Multimodal Match Engine
                      </span>

                      {/* Circular Gauge */}
                      <div className="relative mb-3 flex h-28 w-28 items-center justify-center">
                        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
                          <path
                            className="text-slate-100"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.2"
                          />
                          <path
                            className={candidate.confidence >= 90 ? 'text-emerald-500' : 'text-amber-500'}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeDasharray={candidate.strokeDash}
                            strokeLinecap="round"
                            strokeWidth="3.2"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-2xl font-black text-slate-900 leading-none">
                            {candidate.confidence}%
                          </span>
                          <span className={`text-[10px] font-extrabold tracking-wider mt-0.5 uppercase ${
                            candidate.confidence >= 90 ? 'text-emerald-600' : 'text-amber-600'
                          }`}>
                            MATCH
                          </span>
                        </div>
                      </div>

                      {/* Criteria Factors Checklist */}
                      <div className="w-full space-y-1.5 text-left text-[11px]">
                        {candidate.criteria.map((cr, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-lg border border-slate-200/60 bg-white px-2.5 py-1 text-slate-700 shadow-2xs"
                          >
                            <span className="flex items-center gap-1.5 font-medium">
                              <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                              {cr.label}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600">PASS</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* RIGHT: CUSTODIAL DEPOSIT / FOUND */}
                    <div className="md:col-span-4 flex flex-col justify-between rounded-2xl border border-slate-200/70 bg-slate-50/60 p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                          <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                            • Found Report #{candidate.found.reportId}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400">{candidate.found.date}</span>
                        </div>

                        {/* Finder Info */}
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
                            {candidate.found.finder.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <h3 className="text-xs font-extrabold text-slate-900 leading-tight">
                              {candidate.found.finder}
                            </h3>
                            <p className="text-[11px] text-slate-500">
                              {candidate.found.finderRole}
                            </p>
                          </div>
                        </div>

                        {/* Item Details */}
                        <div className="space-y-1.5 text-xs">
                          <span className="inline-block rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                            {candidate.found.intakeType}
                          </span>
                          <p className="text-sm font-extrabold text-slate-900">{candidate.found.title}</p>
                          <p className="text-[11px] leading-relaxed text-slate-600 bg-white/70 p-2.5 rounded-xl border border-slate-200/50">
                            "{candidate.found.description}"
                          </p>
                          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-800 pt-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                            <span>{candidate.found.storage}</span>
                            <span className="rounded bg-slate-200 px-1.5 py-0.2 font-mono text-[9px] font-extrabold text-slate-700">
                              {candidate.found.storageStatus}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Security Scan Photo */}
                      <div className="mt-4 pt-3 border-t border-slate-200/60">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          <span>{candidate.found.imageLabel}</span>
                          <span className="font-mono text-emerald-700 font-extrabold">{candidate.found.tag}</span>
                        </div>
                        <div className="relative h-28 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                          <img
                            src={candidate.found.image}
                            alt={candidate.found.title}
                            className="h-full w-full object-cover transition hover:scale-105 duration-300"
                          />
                          <span className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-white">
                            {candidate.found.scansCount} Scan Verified
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* DOUBLE-BLIND SECRET CONCORDANCE CHECK */}
                  <div className="mt-5 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/80 via-slate-50 to-indigo-50/70 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-200/60 pb-2.5 mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white text-xs">
                          <ShieldCheck size={14} />
                        </span>
                        <h4 className="text-xs font-bold text-blue-950">
                          Double-Blind Secret Concordance Check
                        </h4>
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-extrabold text-blue-800">
                          Zero-Trust Verification
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-[11px] text-slate-500 font-medium">Concordance Score:</span>
                        <strong className="font-mono text-xs font-extrabold text-blue-900">
                          {candidate.doubleBlind.concordanceScore}%
                        </strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl bg-white p-3 border border-slate-200/80">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Claimant Secret Description (Private)
                        </span>
                        <p className="text-slate-700 italic">
                          "{candidate.doubleBlind.ownerClaim}"
                        </p>
                      </div>

                      <div className="rounded-xl bg-white p-3 border border-slate-200/80">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Campus Security Physical Vault Audit
                        </span>
                        <p className="text-slate-700 font-medium flex items-start gap-1.5">
                          <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span>{candidate.doubleBlind.officerVerification}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ACTION BAR / CTAS */}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Lock size={14} className="text-slate-400" />
                      <span>Security Custody Vault Protected • Audit Log #{candidate.id}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleDismiss(candidate.id)}
                        className="rounded-xl border border-rose-200 bg-rose-50/70 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
                      >
                        Dismiss False Match
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendAlert(candidate)}
                        className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Send Alert to Owner
                      </button>

                      {candidate.confidence < 90 && (
                        <button
                          type="button"
                          onClick={() => handleRequestEvidence(candidate)}
                          className="rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          Request Photo Evidence
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={isReleased}
                        onClick={() => handleApproveHandover(candidate)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold text-white shadow-sm transition-all ${
                          isReleased
                            ? 'bg-slate-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                        }`}
                      >
                        <CheckCircle2 size={14} />
                        <span>{isReleased ? 'Handover Completed' : 'Verify Proof & Approve Handover'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* ================= MODAL: DIGITAL HANDOVER PASS ================= */}
      {activeHandover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <QrCode size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Digital Custody Pickup Pass</h3>
                  <p className="text-xs text-slate-500">Security Clearance & Asset Release Authorization</p>
                </div>
              </div>
              <button
                onClick={() => setActiveHandover(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-center space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600">
                Authorized Collection Pass
              </span>
              <div className="text-2xl font-black text-blue-900 font-mono tracking-wider">
                {activeHandover.found.tag}-RELEASE
              </div>
              <p className="text-[11px] text-slate-500">
                Present this digital pass at certified security collection desk.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Claimant</span>
                <strong className="text-slate-900 font-bold block">{activeHandover.lost.reporter}</strong>
                <span className="text-[11px] text-slate-500">{activeHandover.lost.studentId}</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Pickup Vault</span>
                <strong className="text-slate-900 font-bold block">{activeHandover.found.storage}</strong>
                <span className="text-[11px] text-emerald-600 font-bold">● Officer On Duty</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-3 text-xs space-y-1.5 bg-white">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Asset Title</span>
              <strong className="text-slate-900 block">{activeHandover.lost.title}</strong>
              <p className="text-[11px] text-slate-500">
                Matches Lost Report #{activeHandover.lost.reportId} and Found Deposit #{activeHandover.found.reportId} ({activeHandover.confidence}% Confidence).
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-900 border border-amber-200/70">
              <AlertTriangle size={16} className="shrink-0 text-amber-600" />
              <span>Claimant must present official student smartcard identity at custody desk to complete release.</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveHandover(null)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmHandoverRelease}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
              >
                <CheckCircle2 size={16} />
                Confirm & Issue Pickup Pass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: MANUAL INTAKE SCAN ================= */}
      {showManualIntakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Camera size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Manual Custodial Intake Scan</h3>
                  <p className="text-[11px] text-slate-500">Log newly turned-in property for AI matching</p>
                </div>
              </div>
              <button
                onClick={() => setShowManualIntakeModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateIntake} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Item Title / Description *</label>
                <input
                  required
                  value={intakeForm.title}
                  onChange={(e) => setIntakeForm({ ...intakeForm, title: e.target.value })}
                  placeholder="e.g. Scientific Calculator or Blue Backpack"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={intakeForm.category}
                    onChange={(e) => setIntakeForm({ ...intakeForm, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 outline-none"
                  >
                    <option>Electronics</option>
                    <option>Accessories</option>
                    <option>Wallets & IDs</option>
                    <option>Study Materials</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Intake Vault Tag</label>
                  <input
                    value={intakeForm.tag}
                    onChange={(e) => setIntakeForm({ ...intakeForm, tag: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Custodial Intake Location</label>
                <input
                  value={intakeForm.location}
                  onChange={(e) => setIntakeForm({ ...intakeForm, location: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowManualIntakeModal(false)}
                  className="rounded-xl px-4 py-2 text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 font-bold text-white shadow-sm hover:bg-blue-700"
                >
                  <Sparkles size={14} />
                  Run AI Match Intake
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
