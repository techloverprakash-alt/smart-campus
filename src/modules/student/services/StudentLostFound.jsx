import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { useRouter } from '../../../router';
import {
  PackageSearch, Plus, MapPin, Tag, Calendar, Clock,
  Sparkles, CheckCircle2, AlertTriangle, ShieldCheck,
  RefreshCw, Trash2, ArrowLeft, Camera, Search, Filter,
  FileCheck, X, Eye, Hand, Users, ShieldAlert, Check
} from 'lucide-react';
import {
  getLostReports,
  getFoundReports,
  getMatches,
  getCategories,
  getLocations,
  createLostReport,
  createFoundReport,
  deleteLostReport,
  submitClaim,
  uploadMediaAsset,
  sendFoundRequest,
  requestHumanVerification,
  searchSimilarFoundItems
} from '../../../services/api/lostAndFound';

export default function StudentLostFound() {
  const { user, profile } = useAuth();
  const { navigation } = useRouter();

  // Resolved student identifier
  const studentId = user?.id || profile?.id || profile?.student_id || 'STU-DEMO-01';
  const studentName = profile?.name || profile?.full_name || user?.name || 'Student';

  // Navigation & Scoping State
  const [activeTab, setActiveTab] = useState('lost'); // 'lost' | 'found' | 'matches'
  const [lostScope, setLostScope] = useState('all'); // 'all' (Campus Lost) | 'mine' (My Lost)
  const [foundScope, setFoundScope] = useState('all'); // 'all' (Campus Custody) | 'mine' (My Deposits)

  // Data Collections
  const [allLostItems, setAllLostItems] = useState([]);
  const [allFoundItems, setAllFoundItems] = useState([]);
  const [myMatches, setMyMatches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [similarFoundResults, setSimilarFoundResults] = useState([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState({ text: '', type: 'info' });

  // Modals State
  const [showLostModal, setShowLostModal] = useState(false);
  const [showFoundModal, setShowFoundModal] = useState(false);
  const [showFoundRequestModal, setShowFoundRequestModal] = useState(null); // Selected lost item for "I Found This!"
  const [showVerifyModal, setShowVerifyModal] = useState(null); // Selected match for "Move to Human Verification"
  const [showClaimModal, setShowClaimModal] = useState(null); // match or found item
  const [claimProof, setClaimProof] = useState('');

  // Found Request Form State (Finder reporting they found a lost item)
  const [foundRequestForm, setFoundRequestForm] = useState({
    description: '',
    found_location_id: '',
    custody_desk: 'Admin Ground Floor Custody Desk',
    finder_notes: '',
    image_url: '',
  });

  // Human Verification Request Form State (Owner confirming and moving to human verification)
  const [verifyForm, setVerifyForm] = useState({
    owner_response: '',
    challenge_question: 'Confirm unique identifying marks, contents, or serial suffix.',
  });

  // Lost Form State
  const [lostForm, setLostForm] = useState({
    title: '',
    category_id: '',
    brand_model: '',
    last_seen_location_id: '',
    lost_at: new Date().toISOString().slice(0, 16),
    description: '',
    image_url: '',
  });

  // Found Form State
  const [foundForm, setFoundForm] = useState({
    title: '',
    category_id: '',
    found_location_id: '',
    custody_desk: 'Admin Ground Floor Custody Desk',
    found_at: new Date().toISOString().slice(0, 16),
    description: '',
    image_url: '',
  });

  const notify = (text, type = 'info') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback({ text: '', type: 'info' }), 4500);
  };

  // Load live data: All campus lost and found items are publicly visible to students
  const loadData = async () => {
    try {
      setRefreshing(true);
      const [catsRes, locsRes, lostRes, foundRes, matchRes] = await Promise.all([
        getCategories().catch(() => []),
        getLocations().catch(() => []),
        getLostReports().catch(() => []), // Visible to all users
        getFoundReports().catch(() => []), // Visible to all users
        getMatches({ user_id: studentId }).catch(() => []) // Filtered to matches involving this student
      ]);

      const catList = Array.isArray(catsRes) ? catsRes : catsRes?.data || [];
      const locList = Array.isArray(locsRes) ? locsRes : locsRes?.data || [];
      const lostList = Array.isArray(lostRes) ? lostRes : lostRes?.data || [];
      const foundList = Array.isArray(foundRes) ? foundRes : foundRes?.data || [];
      const matchList = Array.isArray(matchRes) ? matchRes : matchRes?.data || [];

      setCategories(catList);
      setLocations(locList);
      setAllLostItems(lostList);
      setAllFoundItems(foundList);
      setMyMatches(matchList);

      if (catList.length > 0 && !lostForm.category_id) {
        setLostForm((prev) => ({ ...prev, category_id: catList[0].id }));
        setFoundForm((prev) => ({ ...prev, category_id: catList[0].id }));
      }
      if (locList.length > 0 && !lostForm.last_seen_location_id) {
        setLostForm((prev) => ({ ...prev, last_seen_location_id: locList[0].id }));
        setFoundForm((prev) => ({ ...prev, found_location_id: locList[0].id }));
        setFoundRequestForm((prev) => ({ ...prev, found_location_id: locList[0].id }));
      }
    } catch (err) {
      notify('Failed to sync lost & found data: ' + err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [studentId]);

  // Derived user-specific lists
  const myLostItems = useMemo(() => {
    return allLostItems.filter((i) => String(i.reporter_id) === String(studentId) || i.reporter_name === studentName);
  }, [allLostItems, studentId, studentName]);

  const myFoundItems = useMemo(() => {
    return allFoundItems.filter((i) => String(i.reported_by) === String(studentId) || i.finder_name === studentName);
  }, [allFoundItems, studentId, studentName]);

  // Realtime similarity check when searching for lost items (Checking against already assigned found items)
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSimilarFoundResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await searchSimilarFoundItems({ query: q, top_k: 4 });
        const list = Array.isArray(res) ? res : res?.data || [];
        setSimilarFoundResults(list);
      } catch (err) {
        console.error('Similarity search error:', err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filtered lists based on active scope & search query
  const displayedLost = useMemo(() => {
    const base = lostScope === 'mine' ? myLostItems : allLostItems;
    if (!searchQuery.trim()) return base;
    const q = searchQuery.toLowerCase();
    return base.filter(
      (item) =>
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.brand_model?.toLowerCase().includes(q) ||
        item.location_name?.toLowerCase().includes(q)
    );
  }, [lostScope, myLostItems, allLostItems, searchQuery]);

  const displayedFound = useMemo(() => {
    const base = foundScope === 'mine' ? myFoundItems : allFoundItems;
    if (!searchQuery.trim()) return base;
    const q = searchQuery.toLowerCase();
    return base.filter(
      (item) =>
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.inventory_tag?.toLowerCase().includes(q) ||
        item.custody_desk?.toLowerCase().includes(q) ||
        item.location_name?.toLowerCase().includes(q)
    );
  }, [foundScope, myFoundItems, allFoundItems, searchQuery]);

  // Handle Lost Report Submission
  const handleSubmitLost = async (e) => {
    e.preventDefault();
    if (!lostForm.title.trim()) {
      notify('Please enter a title for the lost item.', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: lostForm.title.trim(),
        category_id: lostForm.category_id || categories[0]?.id || 1,
        last_seen_location_id: lostForm.last_seen_location_id || null,
        brand_model: lostForm.brand_model?.trim() || null,
        description: lostForm.description?.trim() && lostForm.description.trim().length >= 5
          ? lostForm.description.trim()
          : `Reported missing item on campus: ${lostForm.title.trim()}`,
        lost_at: lostForm.lost_at ? new Date(lostForm.lost_at).toISOString() : new Date().toISOString(),
        media_urls: lostForm.image_url ? [lostForm.image_url] : []
      };

      await createLostReport(payload);
      notify('Lost report saved and broadcasted to all campus members!', 'success');
      setShowLostModal(false);
      setLostForm({
        title: '',
        category_id: categories[0]?.id || '',
        brand_model: '',
        last_seen_location_id: locations[0]?.id || '',
        lost_at: new Date().toISOString().slice(0, 16),
        description: '',
        image_url: '',
      });
      await loadData();
    } catch (err) {
      notify('Submission failed: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Found Report Submission (Direct intake)
  const handleSubmitFound = async (e) => {
    e.preventDefault();
    if (!foundForm.title.trim() || !foundForm.category_id) {
      notify('Please enter a title and category.', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: foundForm.title,
        category_id: foundForm.category_id,
        found_location_id: foundForm.found_location_id || null,
        custody_desk: foundForm.custody_desk || 'Admin Ground Floor Custody Desk',
        description: foundForm.description,
        found_at: foundForm.found_at ? new Date(foundForm.found_at).toISOString() : new Date().toISOString(),
        media_urls: foundForm.image_url ? [foundForm.image_url] : []
      };

      await createFoundReport(payload);
      notify('Found item logged. Custody inventory tag generated!', 'success');
      setShowFoundModal(false);
      setFoundForm({
        title: '',
        category_id: categories[0]?.id || '',
        found_location_id: locations[0]?.id || '',
        custody_desk: 'Admin Ground Floor Custody Desk',
        found_at: new Date().toISOString().slice(0, 16),
        description: '',
        image_url: '',
      });
      await loadData();
    } catch (err) {
      notify('Found report failed: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Finder Sending a "Found Request" for a Lost Item
  const handleSendFoundRequest = async (e) => {
    e.preventDefault();
    if (!showFoundRequestModal) return;
    if (!foundRequestForm.description.trim()) {
      notify('Please describe where and how you found the item.', 'error');
      return;
    }

    try {
      setLoading(true);
      await sendFoundRequest(showFoundRequestModal.id, {
        description: foundRequestForm.description,
        found_location_id: foundRequestForm.found_location_id || null,
        custody_desk: foundRequestForm.custody_desk || 'Admin Ground Floor Custody Desk',
        finder_notes: foundRequestForm.finder_notes || null,
        image_url: foundRequestForm.image_url || null,
      });

      notify(`Found request sent to ${showFoundRequestModal.reporter_name || 'the owner'}! They can now move to human verification.`, 'success');
      setShowFoundRequestModal(null);
      setFoundRequestForm({
        description: '',
        found_location_id: locations[0]?.id || '',
        custody_desk: 'Admin Ground Floor Custody Desk',
        finder_notes: '',
        image_url: '',
      });
      await loadData();
    } catch (err) {
      notify('Failed to send found request: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Lost User Moving Match to Human Verification
  const handleMoveToHumanVerification = async (e) => {
    e.preventDefault();
    if (!showVerifyModal) return;

    try {
      setLoading(true);
      await requestHumanVerification(showVerifyModal.id, {
        owner_response: verifyForm.owner_response,
        challenge_question: verifyForm.challenge_question,
      });

      notify('Moved to Human Verification! Campus Custody Officer alerted for physical inspection.', 'success');
      setShowVerifyModal(null);
      setVerifyForm({
        owner_response: '',
        challenge_question: 'Confirm unique identifying marks, contents, or serial suffix.',
      });
      await loadData();
    } catch (err) {
      notify('Failed to request human verification: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Withdraw / Delete Lost Report
  const handleDeleteLost = async (id) => {
    if (!window.confirm('Withdraw this lost report?')) return;
    try {
      await deleteLostReport(id);
      notify('Lost report removed.', 'info');
      await loadData();
    } catch (err) {
      notify('Could not remove report: ' + err.message, 'error');
    }
  };

  // Handle Claim Submission
  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!showClaimModal) return;

    try {
      setLoading(true);
      await submitClaim({
        found_report_id: showClaimModal.found_report_id || showClaimModal.id,
        lost_report_id: showClaimModal.lost_report_id || null,
        verification_notes: claimProof ? `Student verification notes: ${claimProof}` : 'Claim filed via Student Portal'
      });
      notify('Ownership claim submitted! Campus Admin will verify your claim.', 'success');
      setShowClaimModal(null);
      setClaimProof('');
      await loadData();
    } catch (err) {
      notify('Claim submission failed: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-y-auto bg-slate-50 font-sans text-slate-800 antialiased p-4 sm:p-6 lg:p-8">
      {/* Header Banner */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigation.navigate('StudentDashboard')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </button>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl flex items-center gap-3">
            <PackageSearch className="text-blue-600" size={32} />
            Campus Lost & Found Hub
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            All lost and found items are publicly visible across campus â€¢ Secure verification is required before custody release.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => setShowLostModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
          >
            <Plus size={15} />
            Report Lost Item
          </button>
          <button
            onClick={() => setShowFoundModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
          >
            <CheckCircle2 size={15} />
            Turn In Found Item
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback.text && (
        <div
          className={`mb-4 rounded-xl p-3 text-xs font-semibold shadow-xs flex items-center justify-between ${
            feedback.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback({ text: '', type: 'info' })} className="text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 mb-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Campus Lost Items</span>
            <Tag size={16} className="text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{allLostItems.length}</p>
          <p className="text-[11px] text-slate-400">{myLostItems.length} reported by you</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>In Custody (Found)</span>
            <ShieldCheck size={16} className="text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{allFoundItems.length}</p>
          <p className="text-[11px] text-slate-400">{myFoundItems.length} turned in by you</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Found Requests & Matches</span>
            <Sparkles size={16} className="text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{myMatches.length}</p>
          <p className="text-[11px] text-slate-400">Awaiting your review or verification</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Custody Desks Active</span>
            <ShieldAlert size={16} className="text-indigo-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">4 Desks</p>
          <p className="text-[11px] text-slate-400">Admin Ground, Library, Canteen</p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('lost')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'lost'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Tag size={14} />
            Lost Items ({allLostItems.length})
          </button>

          <button
            onClick={() => setActiveTab('found')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'found'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <CheckCircle2 size={14} />
            Found In Custody ({allFoundItems.length})
          </button>

          <button
            onClick={() => setActiveTab('matches')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'matches'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Sparkles size={14} className={myMatches.length > 0 ? 'text-amber-300' : ''} />
            Requests & Verifications ({myMatches.length})
          </button>
        </div>

        {/* Sub-scope toggle for Lost & Found */}
        {activeTab === 'lost' && (
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 text-xs font-semibold">
            <button
              onClick={() => setLostScope('all')}
              className={`rounded-lg px-3 py-1 transition-all ${
                lostScope === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Campus Lost ({allLostItems.length})
            </button>
            <button
              onClick={() => setLostScope('mine')}
              className={`rounded-lg px-3 py-1 transition-all ${
                lostScope === 'mine' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Reports ({myLostItems.length})
            </button>
          </div>
        )}

        {activeTab === 'found' && (
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 text-xs font-semibold">
            <button
              onClick={() => setFoundScope('all')}
              className={`rounded-lg px-3 py-1 transition-all ${
                foundScope === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Custody Registry ({allFoundItems.length})
            </button>
            <button
              onClick={() => setFoundScope('mine')}
              className={`rounded-lg px-3 py-1 transition-all ${
                foundScope === 'mine' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Deposits ({myFoundItems.length})
            </button>
          </div>
        )}
      </div>

      {/* SEARCH TOOLBAR */}
      <div className="mb-6">
        <div className="relative w-full max-w-xl">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items by title, brand, location, or tag..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-medium focus:border-blue-500 focus:outline-hidden shadow-xs"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
              <X size={15} />
            </button>
          )}
        </div>

        {/* Realtime Similarity Candidates (If found item was already assigned before lost report) */}
        {similarFoundResults.length > 0 && activeTab === 'lost' && (
          <div className="mt-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50/50 p-4 shadow-sm animate-in fade-in">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-indigo-100">
              <span className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-900">
                <Sparkles size={15} className="text-indigo-600" />
                Already Found Items Matching &quot;{searchQuery}&quot; (Vector Similarity Engine)
              </span>
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                Pre-existing Intake Scans
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {similarFoundResults.map((cand, idx) => {
                const conf = Math.round(cand.similarity_score * 100);
                return (
                  <div key={idx} className="rounded-xl border border-indigo-200 bg-white p-3 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {cand.found_report.inventory_tag}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          {conf}% Match
                        </span>
                      </div>
                      <h4 className="mt-2 text-xs font-bold text-slate-900 line-clamp-1">{cand.found_report.title}</h4>
                      <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">{cand.found_report.description}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-medium text-slate-400 truncate max-w-[110px]">
                        {cand.found_report.custody_desk}
                      </span>
                      <button
                        onClick={() => setShowClaimModal(cand.found_report)}
                        className="rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-indigo-700 shadow-xs"
                      >
                        Claim Item
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* TAB 1: LOST ITEMS (PUBLIC TO ALL + MY REPORTS) */}
      {activeTab === 'lost' && (
        <div className="space-y-4">
          {displayedLost.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <PackageSearch className="mx-auto text-slate-300" size={48} />
              <h3 className="mt-3 text-sm font-bold text-slate-700">No Lost Items Found</h3>
              <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
                {lostScope === 'mine'
                  ? 'You have not reported any missing items. If you misplaced an item, click "Report Lost Item".'
                  : 'No lost reports match your current filter.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayedLost.map((item) => {
                const isMyReport = String(item.reporter_id) === String(studentId) || item.reporter_name === studentName;
                return (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-blue-700">
                          {item.category_name || 'Item'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isMyReport && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-extrabold text-blue-800">
                              My Report
                            </span>
                          )}
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              item.status === 'OPEN'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : item.status === 'VERIFICATION_PENDING'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : item.status === 'RESOLVED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {item.status === 'VERIFICATION_PENDING' ? 'Verification Pending' : item.status}
                          </span>
                        </div>
                      </div>

                      {item.primary_image_url && (
                        <div className="mt-3 h-36 w-full overflow-hidden rounded-xl bg-slate-100">
                          <img src={item.primary_image_url} alt={item.title} className="h-full w-full object-cover" />
                        </div>
                      )}

                      <h3 className="mt-3 text-sm font-bold text-slate-900 leading-snug">{item.title}</h3>
                      {item.brand_model && (
                        <p className="text-xs text-slate-500 font-medium">{item.brand_model}</p>
                      )}
                      <p className="mt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed">{item.description}</p>
                    </div>

                    <div className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-500 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-slate-400">
                          <MapPin size={13} />
                          {item.location_name || 'Campus Grounds'}
                        </span>
                        <span className="text-slate-400">
                          {item.lost_at ? new Date(item.lost_at).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>

                      {/* ACTION BUTTON: If another user lost this item, I can click "I Found This!" */}
                      {!isMyReport ? (
                        <button
                          onClick={() => {
                            setShowFoundRequestModal(item);
                            setFoundRequestForm((prev) => ({
                              ...prev,
                              found_location_id: item.last_seen_location_id || locations[0]?.id || '',
                            }));
                          }}
                          className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition-colors"
                        >
                          <Hand size={14} />
                          I Found This Item!
                        </button>
                      ) : (
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-slate-400 font-semibold">Report #{item.id}</span>
                          <button
                            onClick={() => handleDeleteLost(item.id)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                            title="Withdraw report"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FOUND IN CUSTODY (PUBLIC TO ALL) */}
      {activeTab === 'found' && (
        <div className="space-y-4">
          {displayedFound.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <CheckCircle2 className="mx-auto text-slate-300" size={48} />
              <h3 className="mt-3 text-sm font-bold text-slate-700">No Found Items in Registry</h3>
              <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
                No items match your filter. If you discover an unattended item on campus, click &quot;Turn In Found Item&quot;.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayedFound.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
                        {item.category_name || 'Category'}
                      </span>
                      <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {item.inventory_tag}
                      </span>
                    </div>

                    {item.primary_image_url && (
                      <div className="mt-3 h-36 w-full overflow-hidden rounded-xl bg-slate-100">
                        <img src={item.primary_image_url} alt={item.title} className="h-full w-full object-cover" />
                      </div>
                    )}

                    <h3 className="mt-3 text-sm font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-xs text-slate-600 line-clamp-3">{item.description}</p>
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-500 space-y-2">
                    <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <ShieldCheck size={13} className="text-emerald-600" />
                      <span>Custody: {item.custody_desk}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Status: <strong className="text-slate-700">{item.storage_status}</strong></span>
                      <span>{item.found_at ? new Date(item.found_at).toLocaleDateString() : 'Recent'}</span>
                    </div>

                    {/* Claim Button for Students */}
                    <button
                      onClick={() => setShowClaimModal(item)}
                      className="w-full mt-2 inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      <FileCheck size={14} />
                      Claim Ownership & Verify
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MATCHES & HUMAN VERIFICATION REQUESTS */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          {myMatches.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Sparkles className="mx-auto text-slate-300" size={48} />
              <h3 className="mt-3 text-sm font-bold text-slate-700">No Candidate Matches or Requests Yet</h3>
              <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
                When another student reports finding your item or the AI detects candidate similarity, requests will appear here for you to move to Human Verification.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myMatches.map((m) => {
                const conf = Math.round(m.combined_score * 100);
                const isFoundRequest = m.status === 'FOUND_REQUEST';
                const isHumanVerification = m.status === 'HUMAN_VERIFICATION';
                const isVerified = m.status === 'VERIFIED';

                return (
                  <div key={m.id} className="rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-xs">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-extrabold ${
                            isFoundRequest
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : isHumanVerification
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            <Sparkles size={12} />
                            {isFoundRequest
                              ? 'Found Request Received from Peer Finder'
                              : isHumanVerification
                              ? 'Human Verification Queued with Campus Admin'
                              : `${conf}% AI Similarity Match`}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">Match #{m.id}</span>
                        </div>
                        <h4 className="mt-2 text-base font-bold text-slate-900">
                          {m.lost_report?.title || 'Your Lost Item'} <span className="text-slate-400 font-normal">&harr;</span> {m.found_report?.title || 'Discovered Property'}
                        </h4>
                      </div>

                      {/* ACTION BUTTON: The lost user has the button to move to Human Verification! */}
                      <div className="flex items-center gap-2">
                        {isHumanVerification ? (
                          <span className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-100 text-indigo-900 px-3.5 py-2 text-xs font-extrabold">
                            <Clock size={14} className="animate-pulse" />
                            Awaiting Custody Desk Inspection
                          </span>
                        ) : isVerified ? (
                          <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 text-emerald-900 px-3.5 py-2 text-xs font-extrabold">
                            <Check size={14} />
                            Verified & Ready for Handover
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setShowVerifyModal(m);
                              setVerifyForm((prev) => ({
                                ...prev,
                                owner_response: m.lost_report?.description || '',
                              }));
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
                          >
                            <ShieldAlert size={14} />
                            Move to Human Verification
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
                      <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                        <p className="font-bold text-slate-700 flex items-center justify-between">
                          <span>Your Lost Item Description:</span>
                          <span className="text-[10px] text-slate-400">Report #{m.lost_report_id}</span>
                        </p>
                        <p className="mt-1 font-semibold text-slate-900">{m.lost_report?.title}</p>
                        <p className="mt-1 text-slate-500">{m.lost_report?.description || 'No description'}</p>
                      </div>

                      <div className="rounded-xl bg-indigo-50/50 p-3.5 border border-indigo-100">
                        <p className="font-bold text-indigo-900 flex items-center justify-between">
                          <span>Discovered Intake Record:</span>
                          <span className="font-mono text-[10px] text-indigo-700 font-extrabold">
                            Tag: {m.found_report?.inventory_tag}
                          </span>
                        </p>
                        <p className="mt-1 font-semibold text-slate-900">{m.found_report?.title}</p>
                        <p className="mt-1 text-slate-500">{m.found_report?.description || 'In campus custody'}</p>
                        <p className="mt-2 text-[11px] font-semibold text-indigo-800">
                          Intake Custody: {m.found_report?.custody_desk}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: "I FOUND THIS!" (Finder sending found request to lost owner) */}
      {showFoundRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Send Found Request to Owner</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Notify the owner of <span className="font-semibold text-slate-800">&quot;{showFoundRequestModal.title}&quot;</span> that you discovered their item.
                </p>
              </div>
              <button onClick={() => setShowFoundRequestModal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendFoundRequest} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700">Where did you find it? *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Found on 2nd floor library study table 14 under the chair."
                  value={foundRequestForm.description}
                  onChange={(e) => setFoundRequestForm({ ...foundRequestForm, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700">Campus Zone / Building</label>
                  <select
                    value={foundRequestForm.found_location_id}
                    onChange={(e) => setFoundRequestForm({ ...foundRequestForm, found_location_id: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-emerald-500 focus:outline-hidden"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700">Custody Desk Turned Into *</label>
                  <input
                    type="text"
                    required
                    value={foundRequestForm.custody_desk}
                    onChange={(e) => setFoundRequestForm({ ...foundRequestForm, custody_desk: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700">Private Message / Instructions to Owner (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Deposited with Officer Murugan at Ground Floor intake"
                  value={foundRequestForm.finder_notes}
                  onChange={(e) => setFoundRequestForm({ ...foundRequestForm, finder_notes: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Discovery Photo URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://... photo link"
                  value={foundRequestForm.image_url}
                  onChange={(e) => setFoundRequestForm({ ...foundRequestForm, image_url: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-[11px] text-emerald-800">
                <strong>Privacy Protected:</strong> The lost user will receive your discovery notification and will click &quot;Move to Human Verification&quot; to arrange official campus custody return.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFoundRequestModal(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-700 shadow-xs"
                >
                  {loading ? 'Dispatching...' : 'Send Found Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: "MOVE TO HUMAN VERIFICATION" (Lost owner confirming found request) */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Move to Human Verification</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm candidate match and queue for physical campus custody verification.
                </p>
              </div>
              <button onClick={() => setShowVerifyModal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleMoveToHumanVerification} className="mt-4 space-y-3.5 text-xs">
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-blue-900">
                <p className="font-bold">Match #{showVerifyModal.id}:</p>
                <p className="mt-1 font-semibold">{showVerifyModal.lost_report?.title || 'Reported Lost Item'}</p>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  Deposit Custody: {showVerifyModal.found_report?.custody_desk || 'Campus Security Helpdesk'}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700">Verification Challenge Question</label>
                <input
                  type="text"
                  required
                  value={verifyForm.challenge_question}
                  onChange={(e) => setVerifyForm({ ...verifyForm, challenge_question: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">
                  Your Response / Secret Proof (Known only to the rightful owner) *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="State private characteristics: lockscreen pin, secret sticker, engraving, scratch on bottom..."
                  value={verifyForm.owner_response}
                  onChange={(e) => setVerifyForm({ ...verifyForm, owner_response: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 shadow-xs"
                >
                  {loading ? 'Submitting...' : 'Queue Human Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REPORT LOST ITEM */}
      {showLostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Report Missing Item</h3>
              <button onClick={() => setShowLostModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitLost} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700">Item Title / Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Casio FX-991EX Calculator, Navy Laptop Sleeve"
                  value={lostForm.title}
                  onChange={(e) => setLostForm({ ...lostForm, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700">Category *</label>
                  <select
                    value={lostForm.category_id}
                    onChange={(e) => setLostForm({ ...lostForm, category_id: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-blue-500 focus:outline-hidden"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700">Brand / Model</label>
                  <input
                    type="text"
                    placeholder="e.g. Casio / HP / Apple"
                    value={lostForm.brand_model}
                    onChange={(e) => setLostForm({ ...lostForm, brand_model: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700">Last Seen Campus Location</label>
                  <select
                    value={lostForm.last_seen_location_id}
                    onChange={(e) => setLostForm({ ...lostForm, last_seen_location_id: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="">Select location...</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700">Lost Date & Time</label>
                  <input
                    type="datetime-local"
                    value={lostForm.lost_at}
                    onChange={(e) => setLostForm({ ...lostForm, lost_at: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700">Detailed Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe unique marks, stickers, color, engraving, scuffs..."
                  value={lostForm.description}
                  onChange={(e) => setLostForm({ ...lostForm, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Reference Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://... or photo link"
                  value={lostForm.image_url}
                  onChange={(e) => setLostForm({ ...lostForm, image_url: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLostModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 shadow-xs"
                >
                  {loading ? 'Submitting...' : 'Register Lost Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: REPORT FOUND ITEM */}
      {showFoundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Turn In / Report Found Item</h3>
              <button onClick={() => setShowFoundModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitFound} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700">Found Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Blue Hydroflask, Set of Keys"
                  value={foundForm.title}
                  onChange={(e) => setFoundForm({ ...foundForm, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700">Category *</label>
                  <select
                    value={foundForm.category_id}
                    onChange={(e) => setFoundForm({ ...foundForm, category_id: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-emerald-500 focus:outline-hidden"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700">Found Location</label>
                  <select
                    value={foundForm.found_location_id}
                    onChange={(e) => setFoundForm({ ...foundForm, found_location_id: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="">Select location...</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700">Custody Desk / Locker Turned Into *</label>
                <input
                  type="text"
                  required
                  value={foundForm.custody_desk}
                  onChange={(e) => setFoundForm({ ...foundForm, custody_desk: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Visual Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Appearance, stickers, condition, where exactly found..."
                  value={foundForm.description}
                  onChange={(e) => setFoundForm({ ...foundForm, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Intake Photo URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={foundForm.image_url}
                  onChange={(e) => setFoundForm({ ...foundForm, image_url: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFoundModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-700 shadow-xs"
                >
                  {loading ? 'Submitting...' : 'Log Found Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: SUBMIT CLAIM */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Claim This Item</h3>
              <button onClick={() => setShowClaimModal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleClaimSubmit} className="mt-4 space-y-3 text-xs">
              <p className="text-slate-600">
                You are claiming: <span className="font-bold text-slate-900">{showClaimModal.title || showClaimModal.found_title || 'Item'}</span>
              </p>

              <div>
                <label className="block font-bold text-slate-700">Proof of Ownership / Private Identifiers</label>
                <textarea
                  required
                  rows={3}
                  value={claimProof}
                  onChange={(e) => setClaimProof(e.target.value)}
                  placeholder="State private characteristics only you know (e.g. lockscreen pin, engraving, serial suffix)..."
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 shadow-xs"
                >
                  {loading ? 'Submitting...' : 'File Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
