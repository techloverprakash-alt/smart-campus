import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { useRouter } from '../../../router';
import {
  PackageSearch, Plus, MapPin, Tag, Calendar, Clock,
  Sparkles, CheckCircle2, AlertTriangle, ShieldCheck,
  RefreshCw, Trash2, ArrowLeft, Camera, Search, Filter,
  FileCheck, X, Eye
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
  uploadMediaAsset
} from '../../../services/api/lostAndFound';

export default function StudentLostFound() {
  const { user, profile } = useAuth();
  const { navigation } = useRouter();

  // Resolved student identifier
  const studentId = profile?.student_id || profile?.id || user?.student_id || user?.id || 'STU-DEMO-01';
  const studentName = profile?.name || profile?.full_name || user?.name || 'Student';

  // State
  const [activeTab, setActiveTab] = useState('lost'); // 'lost' | 'found' | 'matches'
  const [myLostItems, setMyLostItems] = useState([]);
  const [myFoundItems, setMyFoundItems] = useState([]);
  const [myMatches, setMyMatches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState({ text: '', type: 'info' });

  // Modals
  const [showLostModal, setShowLostModal] = useState(false);
  const [showFoundModal, setShowFoundModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(null); // match or found item
  const [claimProof, setClaimProof] = useState('');

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
    custody_desk: 'Central Security Helpdesk',
    found_at: new Date().toISOString().slice(0, 16),
    description: '',
    image_url: '',
  });

  const notify = (text, type = 'info') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback({ text: '', type: 'info' }), 4000);
  };

  // Load live data scoped strictly to this student
  const loadData = async () => {
    try {
      setRefreshing(true);
      const [catsRes, locsRes, lostRes, foundRes, matchRes] = await Promise.all([
        getCategories().catch(() => []),
        getLocations().catch(() => []),
        getLostReports({ reporter_id: studentId }).catch(() => []),
        getFoundReports({ reported_by: studentId }).catch(() => []),
        getMatches({ user_id: studentId }).catch(() => [])
      ]);

      const catList = Array.isArray(catsRes) ? catsRes : catsRes?.data || [];
      const locList = Array.isArray(locsRes) ? locsRes : locsRes?.data || [];
      const lostList = Array.isArray(lostRes) ? lostRes : lostRes?.data || [];
      const foundList = Array.isArray(foundRes) ? foundRes : foundRes?.data || [];
      const matchList = Array.isArray(matchRes) ? matchRes : matchRes?.data || [];

      setCategories(catList);
      setLocations(locList);
      setMyLostItems(lostList);
      setMyFoundItems(foundList);
      setMyMatches(matchList);

      // Default category and location selection
      if (catList.length > 0 && !lostForm.category_id) {
        setLostForm((prev) => ({ ...prev, category_id: catList[0].id }));
        setFoundForm((prev) => ({ ...prev, category_id: catList[0].id }));
      }
      if (locList.length > 0 && !lostForm.last_seen_location_id) {
        setLostForm((prev) => ({ ...prev, last_seen_location_id: locList[0].id }));
        setFoundForm((prev) => ({ ...prev, found_location_id: locList[0].id }));
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

  // Handle Lost Report Submission
  const handleSubmitLost = async (e) => {
    e.preventDefault();
    if (!lostForm.title.trim() || !lostForm.category_id) {
      notify('Please enter a title and select a category.', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: lostForm.title,
        category_id: lostForm.category_id,
        last_seen_location_id: lostForm.last_seen_location_id || null,
        brand_model: lostForm.brand_model || null,
        description: lostForm.description,
        lost_at: lostForm.lost_at ? new Date(lostForm.lost_at).toISOString() : new Date().toISOString(),
        media_urls: lostForm.image_url ? [lostForm.image_url] : []
      };

      await createLostReport(payload);
      notify('Lost report successfully registered and queued for cross-modal matching!', 'success');
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

  // Handle Found Report Submission
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
        custody_desk: foundForm.custody_desk || 'Security Main Desk',
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
        custody_desk: 'Central Security Helpdesk',
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
        review_notes: claimProof ? `Student verification notes: ${claimProof}` : 'Claim filed via Student Portal'
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

  const filteredLost = useMemo(() => {
    if (!searchQuery.trim()) return myLostItems;
    const q = searchQuery.toLowerCase();
    return myLostItems.filter(
      (item) =>
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.brand_model?.toLowerCase().includes(q)
    );
  }, [myLostItems, searchQuery]);

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
            My Lost & Found Portal
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Student ID: <span className="font-semibold text-slate-700">{studentId}</span> • Reports and AI similarity candidates are strictly private to you.
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>My Lost Reports</span>
            <Tag size={16} className="text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{myLostItems.length}</p>
          <p className="text-[11px] text-slate-400">Items you registered as missing</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>My Found Deposits</span>
            <ShieldCheck size={16} className="text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{myFoundItems.length}</p>
          <p className="text-[11px] text-slate-400">Items handed over to security desks</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>AI Matches For You</span>
            <Sparkles size={16} className="text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{myMatches.length}</p>
          <p className="text-[11px] text-slate-400">Cross-modal matches awaiting verification</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6">
        <button
          onClick={() => setActiveTab('lost')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'lost'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Tag size={14} />
          My Lost Items ({myLostItems.length})
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
          My Found Items ({myFoundItems.length})
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
          AI Similarity Matches ({myMatches.length})
        </button>
      </div>

      {/* TAB 1: MY LOST ITEMS */}
      {activeTab === 'lost' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search size={15} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search my lost reports..."
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs font-medium focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {filteredLost.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <PackageSearch className="mx-auto text-slate-300" size={48} />
              <h3 className="mt-3 text-sm font-bold text-slate-700">No Lost Items Reported Yet</h3>
              <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
                If you have misplaced an item on campus, click &quot;Report Lost Item&quot; above to submit its details. Our AI will automatically compare it with discovered items.
              </p>
              <button
                onClick={() => setShowLostModal(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs"
              >
                <Plus size={14} />
                Report Lost Item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredLost.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-blue-700">
                        {item.category_name || 'Item'}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          item.status === 'OPEN'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : item.status === 'RESOLVED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.status}
                      </span>
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

                  <div className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-400 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-slate-400" />
                      <span>{item.location_name || 'Campus Grounds'}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span>Lost: {new Date(item.lost_at).toLocaleDateString()}</span>
                      <button
                        onClick={() => handleDeleteLost(item.id)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                        title="Withdraw report"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY FOUND ITEMS */}
      {activeTab === 'found' && (
        <div className="space-y-4">
          {myFoundItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <CheckCircle2 className="mx-auto text-slate-300" size={48} />
              <h3 className="mt-3 text-sm font-bold text-slate-700">No Found Items Submitted By You</h3>
              <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
                Found a lost belonging on campus? Turn it in to any security custody desk and register it here to help the owner recover it.
              </p>
              <button
                onClick={() => setShowFoundModal(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
              >
                <Plus size={14} />
                Turn In Found Item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myFoundItems.map((item) => (
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

                  <div className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-500 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={13} className="text-emerald-600" />
                      <span>Custody: {item.custody_desk}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 pt-1">
                      <span>Status: <span className="font-semibold text-slate-700">{item.storage_status}</span></span>
                      <span>{new Date(item.found_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AI SIMILARITY MATCHES */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          {myMatches.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Sparkles className="mx-auto text-slate-300" size={48} />
              <h3 className="mt-3 text-sm font-bold text-slate-700">No Candidate Matches Detected Yet</h3>
              <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
                When a campus item matches your lost reports, our MobileCLIP cross-modal neural network will generate an alert here with confidence scoring.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myMatches.map((m) => (
                <div key={m.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-extrabold text-amber-800">
                          <Sparkles size={12} />
                          {Math.round(m.combined_score * 100)}% AI Match Confidence
                        </span>
                        <span className="text-xs font-semibold text-slate-400">Match ID: {m.id}</span>
                      </div>
                      <h4 className="mt-2 text-base font-bold text-slate-900">
                        {m.lost_title || 'Your Lost Item'} <span className="text-slate-400 font-normal">&harr;</span> {m.found_title || 'Discovered Item'}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        m.status === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {m.status === 'VERIFIED' ? 'Verified by Officer' : 'Pending Verification'}
                      </span>
                      <button
                        onClick={() => setShowClaimModal(m)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs"
                      >
                        <FileCheck size={14} />
                        Claim Item
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                      <p className="font-bold text-slate-700">Your Reported Item:</p>
                      <p className="mt-1 font-semibold text-slate-900">{m.lost_title}</p>
                      <p className="mt-1 text-slate-500">{m.lost_description || 'No description provided'}</p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                      <p className="font-bold text-slate-700">Discovered Custody Deposit:</p>
                      <p className="mt-1 font-semibold text-slate-900">{m.found_title}</p>
                      <p className="mt-1 text-slate-500">{m.found_description || 'In campus custody desk'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: REPORT LOST ITEM */}
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

      {/* MODAL: REPORT FOUND ITEM */}
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

      {/* MODAL: SUBMIT CLAIM */}
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
                You are claiming: <span className="font-bold text-slate-900">{showClaimModal.found_title || 'Item'}</span>
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
