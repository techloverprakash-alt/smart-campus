import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { useRouter } from '../../../router';
import {
  PackageSearch, Plus, MapPin, Tag, Calendar, Clock,
  Sparkles, CheckCircle2, AlertTriangle, ShieldCheck,
  RefreshCw, Trash2, ArrowLeft, Camera, Search, Filter,
  FileCheck, X, Eye, Briefcase, Hand, Users
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
  sendFoundRequest,
  requestHumanVerification
} from '../../../services/api/lostAndFound';

export default function StaffLostFound() {
  const { user, profile } = useAuth();
  const { navigation } = useRouter();

  // Resolved staff identifier
  const staffId = profile?.staff_id || profile?.id || user?.staff_id || user?.id || 'STAFF-DEMO-01';
  const staffName = profile?.name || profile?.full_name || user?.name || 'Faculty Member';

  // State
  const [activeTab, setActiveTab] = useState('lost'); // 'lost' | 'found' | 'matches'
  const [lostScope, setLostScope] = useState('all'); // 'all' | 'mine'
  const [foundScope, setFoundScope] = useState('all'); // 'all' | 'mine'
  const [allLostItems, setAllLostItems] = useState([]);
  const [allFoundItems, setAllFoundItems] = useState([]);
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
  const [showClaimModal, setShowClaimModal] = useState(null);
  const [claimProof, setClaimProof] = useState('');
  const [showFoundRequestModal, setShowFoundRequestModal] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(null);
  const [verifyForm, setVerifyForm] = useState({
    owner_response: '',
    challenge_question: 'Confirm unique identifying marks, contents, or serial suffix.',
  });
  const [foundRequestForm, setFoundRequestForm] = useState({
    description: '',
    custody_desk: 'Faculty Staff Room Desk 4',
    finder_notes: '',
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
    custody_desk: 'Faculty Staff Room Desk 4',
    found_at: new Date().toISOString().slice(0, 16),
    description: '',
    image_url: '',
  });

  const notify = (text, type = 'info') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback({ text: '', type: 'info' }), 4000);
  };

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [catsRes, locsRes, lostRes, foundRes, matchRes] = await Promise.all([
        getCategories().catch(() => []),
        getLocations().catch(() => []),
        getLostReports().catch(() => []), // Visible to all users
        getFoundReports().catch(() => []), // Visible to all users
        getMatches({ user_id: staffId }).catch(() => [])
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
      setMyLostItems(lostList.filter(l => l.reporter_id === staffId || l.reporter_name === staffName));
      setMyFoundItems(foundList.filter(f => f.reported_by === staffId || f.reported_by_name === staffName));
      setMyMatches(matchList);

      if (catList.length > 0 && !lostForm.category_id) {
        setLostForm((prev) => ({ ...prev, category_id: catList[0].id }));
        setFoundForm((prev) => ({ ...prev, category_id: catList[0].id }));
      }
      if (locList.length > 0 && !lostForm.last_seen_location_id) {
        setLostForm((prev) => ({ ...prev, last_seen_location_id: locList[0].id }));
        setFoundForm((prev) => ({ ...prev, found_location_id: locList[0].id }));
      }
    } catch (err) {
      notify('Failed to sync faculty lost & found data: ' + err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [staffId]);

  const handleSubmitLost = async (e) => {
    e.preventDefault();
    if (!lostForm.title.trim()) {
      notify('Please enter a title for the lost article.', 'error');
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
      notify('Faculty lost report saved and broadcasted to campus!', 'success');
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
      notify('Submission error: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFound = async (e) => {
    e.preventDefault();
    if (!foundForm.title.trim() || !foundForm.category_id) {
      notify('Title and category are required.', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: foundForm.title,
        category_id: foundForm.category_id,
        found_location_id: foundForm.found_location_id || null,
        custody_desk: foundForm.custody_desk || 'Faculty Desk',
        description: foundForm.description,
        found_at: foundForm.found_at ? new Date(foundForm.found_at).toISOString() : new Date().toISOString(),
        media_urls: foundForm.image_url ? [foundForm.image_url] : []
      };

      await createFoundReport(payload);
      notify('Found article logged with inventory tag.', 'success');
      setShowFoundModal(false);
      setFoundForm({
        title: '',
        category_id: categories[0]?.id || '',
        found_location_id: locations[0]?.id || '',
        custody_desk: 'Faculty Staff Room Desk 4',
        found_at: new Date().toISOString().slice(0, 16),
        description: '',
        image_url: '',
      });
      await loadData();
    } catch (err) {
      notify('Found report error: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLost = async (id) => {
    if (!window.confirm('Withdraw this lost report?')) return;
    try {
      await deleteLostReport(id);
      notify('Lost report withdrawn.', 'info');
      await loadData();
    } catch (err) {
      notify('Could not remove: ' + err.message, 'error');
    }
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!showClaimModal) return;

    try {
      setLoading(true);
      await submitClaim({
        found_report_id: showClaimModal.found_report_id || showClaimModal.id,
        lost_report_id: showClaimModal.lost_report_id || null,
        review_notes: claimProof ? `Faculty verification notes: ${claimProof}` : 'Claim filed via Faculty Portal'
      });
      notify('Claim submitted! Campus Admin will verify ownership.', 'success');
      setShowClaimModal(null);
      setClaimProof('');
      await loadData();
    } catch (err) {
      notify('Claim error: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendFoundRequest = async (e) => {
    e.preventDefault();
    if (!showFoundRequestModal) return;
    if (!foundRequestForm.description.trim()) {
      notify('Please describe the found item details.', 'error');
      return;
    }

    try {
      setLoading(true);
      await sendFoundRequest(showFoundRequestModal.id, {
        description: foundRequestForm.description,
        custody_desk: foundRequestForm.custody_desk || 'Faculty Staff Room Desk 4',
        finder_notes: foundRequestForm.finder_notes || null,
      });

      notify(`Found notification sent to ${showFoundRequestModal.reporter_name || 'the owner'}!`, 'success');
      setShowFoundRequestModal(null);
      setFoundRequestForm({
        description: '',
        custody_desk: 'Faculty Staff Room Desk 4',
        finder_notes: '',
      });
      await loadData();
    } catch (err) {
      notify('Failed to send found request: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Move match to Human Verification Queue
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

  const filteredLost = useMemo(() => {
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

  const filteredFound = useMemo(() => {
    const base = foundScope === 'mine' ? myFoundItems : allFoundItems;
    if (!searchQuery.trim()) return base;
    const q = searchQuery.toLowerCase();
    return base.filter(
      (item) =>
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.inventory_tag?.toLowerCase().includes(q) ||
        item.custody_desk?.toLowerCase().includes(q)
    );
  }, [foundScope, myFoundItems, allFoundItems, searchQuery]);

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-y-auto bg-slate-50 font-sans text-slate-800 antialiased p-4 sm:p-6 lg:p-8">
      {/* Header Banner */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigation.navigate('StaffDashboard')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft size={14} /> Back to Faculty Dashboard
            </button>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl flex items-center gap-3">
            <Briefcase className="text-indigo-600" size={32} />
            Faculty Lost & Found Portal
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Staff ID: <span className="font-semibold text-slate-700">{staffId}</span> • Open campus board connects all missing belongings across departments.
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
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
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

      {feedback.text && (
        <div
          className={`mb-4 rounded-xl p-3 text-xs font-semibold shadow-xs flex items-center justify-between ${
            feedback.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback({ text: '', type: 'info' })} className="text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Search Input Bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search all campus lost/found articles by title, room, or desc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs font-medium text-slate-800 shadow-xs placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6">
        <button
          onClick={() => setActiveTab('lost')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'lost'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Tag size={14} />
          Campus Lost Board ({allLostItems.length})
        </button>

        <button
          onClick={() => setActiveTab('found')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'found'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CheckCircle2 size={14} />
          Campus Custody Vault ({allFoundItems.length})
        </button>

        <button
          onClick={() => setActiveTab('matches')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'matches'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sparkles size={14} />
          AI Similarity Matches ({myMatches.length})
        </button>
      </div>

      {/* TAB 1: LOST ITEMS */}
      {activeTab === 'lost' && (
        <div className="space-y-4">
          {/* Sub-scope toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLostScope('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                lostScope === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Campus Reports ({allLostItems.length})
            </button>
            <button
              onClick={() => setLostScope('mine')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                lostScope === 'mine'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              My Reported Items ({myLostItems.length})
            </button>
          </div>

          {filteredLost.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <PackageSearch className="mx-auto text-slate-300" size={48} />
              <h3 className="mt-3 text-sm font-bold text-slate-700">No Lost Reports Found</h3>
              <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
                No active missing item reports match your current filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredLost.map((item) => {
                const isMyItem = item.reporter_id === staffId || item.reporter_name === staffName;
                return (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-extrabold text-indigo-700">
                          {item.category_name || 'Category'}
                        </span>
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          {item.status || 'MISSING'}
                        </span>
                      </div>

                      <h3 className="mt-3 text-sm font-bold text-slate-900">{item.title}</h3>
                      {item.brand_model && (
                        <p className="text-xs text-slate-500 font-medium">{item.brand_model}</p>
                      )}
                      <p className="mt-2 text-xs text-slate-600 line-clamp-3">{item.description}</p>
                      
                      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
                        <MapPin size={13} className="text-slate-400" />
                        <span className="truncate">{item.location_name || 'Campus Grounds'}</span>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-slate-400">
                        <span>{item.lost_at ? new Date(item.lost_at).toLocaleDateString() : 'Recent'}</span>
                        <span className="block text-[10px] text-slate-500">Owner: {item.reporter_name || 'Student'}</span>
                      </div>

                      {isMyItem ? (
                        <button
                          onClick={() => handleDeleteLost(item.id)}
                          className="inline-flex items-center gap-1 text-xs text-rose-500 hover:text-rose-700 font-semibold"
                        >
                          <Trash2 size={14} /> Withdraw
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setShowFoundRequestModal(item);
                            setFoundRequestForm((prev) => ({
                              ...prev,
                              description: `Found article matching '${item.title}' in campus area`,
                            }));
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
                        >
                          <Hand size={13} />
                          I Found This!
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FOUND ITEMS */}
      {activeTab === 'found' && (
        <div className="space-y-4">
          {/* Sub-scope toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFoundScope('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                foundScope === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Campus Custody ({allFoundItems.length})
            </button>
            <button
              onClick={() => setFoundScope('mine')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                foundScope === 'mine'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Logged By Me ({myFoundItems.length})
            </button>
          </div>

          {filteredFound.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <CheckCircle2 className="mx-auto text-slate-300" size={48} />
              <h3 className="mt-3 text-sm font-bold text-slate-700">No Found Articles in Vault</h3>
              <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
                Articles collected in seminar halls, labs, or faculty desks can be logged here and tagged for student claims.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredFound.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
                        {item.category_name}
                      </span>
                      <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        {item.inventory_tag || `#FND-${item.id?.slice(0, 6)}`}
                      </span>
                    </div>

                    <h3 className="mt-3 text-sm font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-xs text-slate-600 line-clamp-3">{item.description}</p>
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                    <p>Desk: <span className="font-semibold text-slate-700">{item.custody_desk || 'Campus Custody Desk'}</span></p>
                    <p className="text-slate-400 mt-0.5">Status: {item.storage_status || 'IN_VAULT'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MATCHES */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          {myMatches.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Sparkles className="mx-auto text-slate-300" size={48} />
              <h3 className="mt-3 text-sm font-bold text-slate-700">No AI Match Candidates For You</h3>
              <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
                Candidates pairing your lost items with campus deposits will be displayed here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myMatches.map((m) => (
                <div key={m.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5">
                      {Math.round(m.combined_score * 100)}% Match
                    </span>
                    <h4 className="mt-1 text-sm font-bold text-slate-900">{m.lost_title} &harr; {m.found_title}</h4>
                    <p className="text-xs text-slate-500">Status: {m.status}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {m.status === 'HUMAN_VERIFICATION' ? (
                      <span className="rounded-full bg-amber-100 text-amber-900 border border-amber-200 px-3 py-1 text-xs font-bold">
                        In Human Verification Queue
                      </span>
                    ) : m.status === 'VERIFIED' ? (
                      <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 text-xs font-bold">
                        Verified for Handover
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => setShowVerifyModal(m)}
                          className="rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-amber-700 shadow-xs"
                        >
                          Move to Human Verification
                        </button>
                        <button
                          onClick={() => setShowClaimModal(m)}
                          className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-700"
                        >
                          Claim Item
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: REPORT FOUND REQUEST TO OWNER */}
      {showFoundRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Found Item Notification</h3>
                <p className="text-xs text-slate-500">Notify {showFoundRequestModal.reporter_name || 'the owner'} about: {showFoundRequestModal.title}</p>
              </div>
              <button onClick={() => setShowFoundRequestModal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendFoundRequest} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700">Where/How did you find it? *</label>
                <textarea
                  required
                  rows={3}
                  value={foundRequestForm.description}
                  onChange={(e) => setFoundRequestForm({ ...foundRequestForm, description: e.target.value })}
                  placeholder="e.g. Found on desk in Lab 302 after 2nd period class..."
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Current Holding Location / Desk *</label>
                <input
                  type="text"
                  required
                  value={foundRequestForm.custody_desk}
                  onChange={(e) => setFoundRequestForm({ ...foundRequestForm, custody_desk: e.target.value })}
                  placeholder="e.g. Faculty Room 12 Desk #4, or Admin Custody"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Finder Notes (Optional)</label>
                <input
                  type="text"
                  value={foundRequestForm.finder_notes}
                  onChange={(e) => setFoundRequestForm({ ...foundRequestForm, finder_notes: e.target.value })}
                  placeholder="e.g. Kept safely in faculty drawer"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowFoundRequestModal(null)} className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700">
                  Send Found Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REPORT LOST ITEM */}
      {showLostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Faculty: Log Missing Article</h3>
              <button onClick={() => setShowLostModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitLost} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700">Article Title *</label>
                <input
                  type="text"
                  required
                  value={lostForm.title}
                  onChange={(e) => setLostForm({ ...lostForm, title: e.target.value })}
                  placeholder="e.g. Dell Power Supply, Faculty Smartcard, Blue Binder"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700">Category *</label>
                  <select
                    value={lostForm.category_id}
                    onChange={(e) => setLostForm({ ...lostForm, category_id: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700">Last Seen Location</label>
                  <select
                    value={lostForm.last_seen_location_id}
                    onChange={(e) => setLostForm({ ...lostForm, last_seen_location_id: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium"
                  >
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={lostForm.description}
                  onChange={(e) => setLostForm({ ...lostForm, description: e.target.value })}
                  placeholder="Description of item..."
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowLostModal(false)} className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="rounded-xl bg-indigo-600 px-5 py-2 font-bold text-white">
                  Log Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REPORT FOUND ITEM */}
      {showFoundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Faculty: Log Discovered Article</h3>
              <button onClick={() => setShowFoundModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitFound} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700">Article Name *</label>
                <input
                  type="text"
                  required
                  value={foundForm.title}
                  onChange={(e) => setFoundForm({ ...foundForm, title: e.target.value })}
                  placeholder="e.g. Wireless Mouse, Notebook"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700">Category *</label>
                  <select
                    value={foundForm.category_id}
                    onChange={(e) => setFoundForm({ ...foundForm, category_id: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700">Holding Desk *</label>
                  <input
                    type="text"
                    required
                    value={foundForm.custody_desk}
                    onChange={(e) => setFoundForm({ ...foundForm, custody_desk: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={foundForm.description}
                  onChange={(e) => setFoundForm({ ...foundForm, description: e.target.value })}
                  placeholder="Where in the room it was found, color, condition..."
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowFoundModal(false)} className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white">
                  Log Found Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MOVE TO HUMAN VERIFICATION */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Request Human Verification</h3>
                <p className="text-xs text-slate-500">Initiate physical challenge verification for candidate match #{showVerifyModal.id}</p>
              </div>
              <button onClick={() => setShowVerifyModal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleMoveToHumanVerification} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700">Verification Challenge Question</label>
                <input
                  type="text"
                  value={verifyForm.challenge_question}
                  onChange={(e) => setVerifyForm({ ...verifyForm, challenge_question: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Your Identifying Secret Marks or Details *</label>
                <textarea
                  required
                  rows={3}
                  value={verifyForm.owner_response}
                  onChange={(e) => setVerifyForm({ ...verifyForm, owner_response: e.target.value })}
                  placeholder="Describe unique marks, internal contents, serial numbers, stickers, or scratches that only the true owner would know..."
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-amber-600 px-5 py-2 font-bold text-white hover:bg-amber-700 shadow-xs"
                >
                  {loading ? 'Submitting...' : 'Send to Campus Custody Queue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
