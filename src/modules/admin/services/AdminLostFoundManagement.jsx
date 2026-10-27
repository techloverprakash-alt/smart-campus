import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { useRouter } from '../../../router';
import {
  Shield, Check, CheckCircle2, AlertTriangle, ArrowLeft,
  Search, SlidersHorizontal, MapPin, Clock, Eye, Trash2, Send,
  FileCheck, ShieldCheck, ChevronDown, User, QrCode, X, Phone, Lock,
  Camera, Zap, RefreshCw, ExternalLink, ThumbsUp, Bell, AlertCircle,
  PackageSearch, Tag, CheckSquare, Layers
} from 'lucide-react';
import {
  getLostReports,
  getFoundReports,
  getMatches,
  getClaims,
  getLocations,
  getCategories,
  verifyMatchChallenge,
  dismissMatch,
  reviewClaim,
  createHandover,
  updateFoundCustody
} from '../../../services/api/lostAndFound';

export default function AdminLostFoundManagement() {
  const { user, profile } = useAuth();
  const { navigation } = useRouter();

  const adminId = profile?.staff_id || profile?.id || user?.id || 'ADMIN-CAMPUS-01';
  const adminName = profile?.name || profile?.full_name || user?.name || 'Campus Administrator';

  // State
  const [activeTab, setActiveTab] = useState('matches'); // 'matches' | 'custody' | 'claims' | 'lost_all'
  const [matches, setMatches] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState({ text: '', type: 'info' });

  // Verification Modal State
  const [verifyingMatch, setVerifyingMatch] = useState(null);
  const [verifyForm, setVerifyForm] = useState({
    challenge_question: 'Confirm specific unique mark or internal identifier.',
    owner_response: 'Matches owner description provided in lost report.',
    officer_notes: 'Physical inspection confirmed match concordance.',
    concordance_score: 95.0,
    status: 'VERIFIED'
  });

  // Claim Review Modal State
  const [reviewingClaim, setReviewingClaim] = useState(null);
  const [claimReviewNotes, setClaimReviewNotes] = useState('');

  // Handover Modal State
  const [handoverClaim, setHandoverClaim] = useState(null);
  const [handoverForm, setHandoverForm] = useState({
    handover_location_id: '',
    handover_notes: 'Physical custody handed over upon verified ID presentation.'
  });

  const notify = (text, type = 'info') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback({ text: '', type: 'info' }), 4500);
  };

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [matchesRes, foundRes, lostRes, claimsRes, locsRes, catsRes] = await Promise.all([
        getMatches().catch(() => []),
        getFoundReports().catch(() => []),
        getLostReports().catch(() => []),
        getClaims().catch(() => []),
        getLocations().catch(() => []),
        getCategories().catch(() => [])
      ]);

      const matchList = Array.isArray(matchesRes) ? matchesRes : matchesRes?.data || [];
      const foundList = Array.isArray(foundRes) ? foundRes : foundRes?.data || [];
      const lostList = Array.isArray(lostRes) ? lostRes : lostRes?.data || [];
      const claimsList = Array.isArray(claimsRes) ? claimsRes : claimsRes?.data || [];
      const locList = Array.isArray(locsRes) ? locsRes : locsRes?.data || [];
      const catList = Array.isArray(catsRes) ? catsRes : catsRes?.data || [];

      setMatches(matchList);
      setFoundItems(foundList);
      setLostItems(lostList);
      setClaims(claimsList);
      setLocations(locList);
      setCategories(catList);

      if (locList.length > 0 && !handoverForm.handover_location_id) {
        setHandoverForm((prev) => ({ ...prev, handover_location_id: locList[0].id }));
      }
    } catch (err) {
      notify('Failed to load admin lost & found registry: ' + err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Submit Manual Verification for a Match
  const handleVerifyMatch = async (e) => {
    e.preventDefault();
    if (!verifyingMatch) return;

    try {
      setLoading(true);
      await verifyMatchChallenge(verifyingMatch.id, {
        challenge_question: verifyForm.challenge_question,
        owner_response: verifyForm.owner_response,
        officer_notes: verifyForm.officer_notes,
        concordance_score: parseFloat(verifyForm.concordance_score) || 90.0,
        status: verifyForm.status
      });

      notify(`Match candidate #${verifyingMatch.id} manually verified!`, 'success');
      setVerifyingMatch(null);
      await loadData();
    } catch (err) {
      notify('Verification submission error: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Dismiss False Match
  const handleDismissMatch = async (matchId) => {
    if (!window.confirm('Dismiss this match candidate as non-matching?')) return;
    try {
      await dismissMatch(matchId);
      notify('Candidate match dismissed.', 'info');
      await loadData();
    } catch (err) {
      notify('Dismiss failed: ' + err.message, 'error');
    }
  };

  // Review Claim (Approve / Reject)
  const handleClaimReviewAction = async (status) => {
    if (!reviewingClaim) return;
    try {
      setLoading(true);
      await reviewClaim(reviewingClaim.id, {
        status,
        review_notes: claimReviewNotes || `Reviewed and ${status.toLowerCase()} by ${adminName}`
      });

      notify(`Ownership claim marked ${status}!`, 'success');
      setReviewingClaim(null);
      setClaimReviewNotes('');
      await loadData();
    } catch (err) {
      notify('Claim review failed: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Complete Handover
  const handleHandoverSubmit = async (e) => {
    e.preventDefault();
    if (!handoverClaim) return;

    try {
      setLoading(true);
      await createHandover({
        claim_id: handoverClaim.id,
        received_by: handoverClaim.claimed_by,
        handover_location_id: handoverForm.handover_location_id || locations[0]?.id,
        handover_notes: handoverForm.handover_notes
      });

      notify('Physical item handover receipt issued! Status updated across registry.', 'success');
      setHandoverClaim(null);
      await loadData();
    } catch (err) {
      notify('Handover execution failed: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Custody Status Update
  const handleUpdateCustodyStatus = async (itemId, newStatus) => {
    try {
      await updateFoundCustody(itemId, { storage_status: newStatus });
      notify(`Inventory status updated to ${newStatus}`, 'success');
      await loadData();
    } catch (err) {
      notify('Failed to update custody status: ' + err.message, 'error');
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-y-auto bg-slate-50 font-sans text-slate-800 antialiased p-4 sm:p-6 lg:p-8">
      {/* Header Banner */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigation.navigate('AdminDashboard')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft size={14} /> Back to Admin Dashboard
            </button>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl flex items-center gap-3">
            <ShieldCheck className="text-blue-600" size={32} />
            Campus Lost & Found Verification Center
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Administrator: <span className="font-semibold text-slate-700">{adminName} ({adminId})</span> • Manual verification authority for cross-modal similarity candidate matches.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh Registry
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

      {/* Metric Counters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 mb-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">AI Matches Pending</span>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {matches.filter((m) => m.status === 'CANDIDATE' || m.status === 'PENDING_VERIFICATION').length}
          </p>
          <p className="text-[11px] text-amber-600 font-medium">Awaiting manual challenge review</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Active Claims</span>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {claims.filter((c) => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW').length}
          </p>
          <p className="text-[11px] text-blue-600 font-medium">Ownership claims filed</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Custody Desk Inventory</span>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {foundItems.filter((f) => f.storage_status === 'IN_CUSTODY' || f.storage_status === 'LOGGED').length}
          </p>
          <p className="text-[11px] text-emerald-600 font-medium">Items secured in lockers/desks</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Campus Missing Reports</span>
          <p className="mt-2 text-2xl font-black text-slate-900">{lostItems.length}</p>
          <p className="text-[11px] text-slate-400">Total reported missing articles</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6">
        <button
          onClick={() => setActiveTab('matches')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'matches'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Zap size={14} />
          AI Candidate Verification ({matches.length})
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'claims'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileCheck size={14} />
          Claims & Handover Desk ({claims.length})
        </button>

        <button
          onClick={() => setActiveTab('custody')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'custody'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldCheck size={14} />
          Found Custody Registry ({foundItems.length})
        </button>

        <button
          onClick={() => setActiveTab('lost_all')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'lost_all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <PackageSearch size={14} />
          All Lost Reports ({lostItems.length})
        </button>
      </div>

      {/* TAB 1: AI CANDIDATE VERIFICATION (ADMIN MANUAL VERIFICATION) */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900 flex items-start gap-3">
            <Shield className="text-blue-600 mt-0.5 shrink-0" size={18} />
            <div>
              <p className="font-bold">Manual AI Verification Policy:</p>
              <p className="text-blue-800 mt-0.5 leading-relaxed">
                As Campus Administrator, inspect the candidate matches generated by MobileCLIP. Validate challenge questions (internal engraving, marks, serials) before marking a candidate &quot;Verified&quot; to authorize student item release.
              </p>
            </div>
          </div>

          {matches.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Zap className="mx-auto text-slate-300" size={48} />
              <h3 className="mt-3 text-sm font-bold text-slate-700">No Candidate Matches In Queue</h3>
              <p className="mt-1 text-xs text-slate-400">
                When students or staff submit lost and found articles with cross-modal similarity &ge; 55%, they will populate here for verification.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map((m) => (
                <div key={m.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800">
                        {Math.round(m.combined_score * 100)}% Confidence
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Match ID: {m.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        m.status === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : m.status === 'DISMISSED'
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {m.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {m.status !== 'VERIFIED' && (
                        <>
                          <button
                            onClick={() => handleDismissMatch(m.id)}
                            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => setVerifyingMatch(m)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs"
                          >
                            <ShieldCheck size={14} />
                            Verify Manually
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
                    {/* Lost Side */}
                    <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                      <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                        <span>Report #{m.lost_report_id}</span>
                        <span>Reporter: {m.reporter_name || 'Student'}</span>
                      </div>
                      <h4 className="mt-2 text-sm font-bold text-slate-900">{m.lost_title}</h4>
                      <p className="mt-1 text-slate-600 leading-relaxed">{m.lost_description}</p>
                    </div>

                    {/* Found Side */}
                    <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                      <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                        <span>Deposit #{m.found_report_id}</span>
                        <span>Custodian: {m.custody_desk || 'Security'}</span>
                      </div>
                      <h4 className="mt-2 text-sm font-bold text-slate-900">{m.found_title}</h4>
                      <p className="mt-1 text-slate-600 leading-relaxed">{m.found_description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CLAIMS & HANDOVER DESK */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          {claims.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <FileCheck className="mx-auto text-slate-300" size={48} />
              <h3 className="mt-3 text-sm font-bold text-slate-700">No Ownership Claims Filed</h3>
              <p className="mt-1 text-xs text-slate-400">
                When students file ownership claims on matched items, they will appear here for administrative approval and physical handover.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {claims.map((claim) => (
                <div key={claim.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-2">
                    <div>
                      <span className="font-mono text-xs text-slate-400">Claim ID: {claim.id}</span>
                      <h4 className="text-base font-bold text-slate-900 mt-0.5">
                        Claimed by: <span className="text-blue-700">{claim.claimant_name || claim.claimed_by}</span>
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        claim.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : claim.status === 'HANDED_OVER'
                          ? 'bg-indigo-100 text-indigo-800'
                          : claim.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {claim.status}
                      </span>

                      {claim.status === 'SUBMITTED' && (
                        <button
                          onClick={() => setReviewingClaim(claim)}
                          className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs"
                        >
                          Review Claim
                        </button>
                      )}

                      {claim.status === 'APPROVED' && (
                        <button
                          onClick={() => setHandoverClaim(claim)}
                          className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs flex items-center gap-1.5"
                        >
                          <CheckSquare size={14} />
                          Issue Handover
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 text-xs space-y-1 text-slate-600">
                    <p><span className="font-semibold text-slate-800">Found Item ID:</span> {claim.found_report_id}</p>
                    {claim.lost_report_id && <p><span className="font-semibold text-slate-800">Lost Item ID:</span> {claim.lost_report_id}</p>}
                    {claim.review_notes && <p className="text-slate-500 italic mt-1">&quot;{claim.review_notes}&quot;</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FOUND INVENTORY */}
      {activeTab === 'custody' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {foundItems.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {item.inventory_tag}
                    </span>
                    <select
                      value={item.storage_status}
                      onChange={(e) => handleUpdateCustodyStatus(item.id, e.target.value)}
                      className="text-[11px] font-bold rounded-lg border border-slate-200 px-2 py-1 bg-white"
                    >
                      <option value="LOGGED">LOGGED</option>
                      <option value="IN_CUSTODY">IN_CUSTODY</option>
                      <option value="CLAIMED">CLAIMED</option>
                      <option value="DISPOSED">DISPOSED</option>
                      <option value="TRANSFERRED">TRANSFERRED</option>
                    </select>
                  </div>

                  <h4 className="mt-3 text-sm font-bold text-slate-900">{item.title}</h4>
                  <p className="mt-1 text-xs text-slate-600 line-clamp-2">{item.description}</p>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-400 space-y-0.5">
                  <p>Desk: <span className="font-medium text-slate-700">{item.custody_desk}</span></p>
                  <p>Logged: {new Date(item.found_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ALL LOST REPORTS */}
      {activeTab === 'lost_all' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lostItems.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                      {item.category_name}
                    </span>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                      {item.status}
                    </span>
                  </div>

                  <h4 className="mt-3 text-sm font-bold text-slate-900">{item.title}</h4>
                  <p className="mt-1 text-xs text-slate-600 line-clamp-2">{item.description}</p>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                  <p>Reporter: <span className="font-medium text-slate-700">{item.reporter_name || item.reporter_id}</span></p>
                  <p>Date: {new Date(item.lost_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: MANUAL MATCH VERIFICATION */}
      {verifyingMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Double-Blind Match Verification</h3>
              <button onClick={() => setVerifyingMatch(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleVerifyMatch} className="mt-4 space-y-3 text-xs">
              <p className="text-slate-600">
                Verifying match: <span className="font-bold text-slate-900">{verifyingMatch.lost_title}</span> &harr; <span className="font-bold text-slate-900">{verifyingMatch.found_title}</span>
              </p>

              <div>
                <label className="block font-bold text-slate-700">Challenge Question *</label>
                <input
                  type="text"
                  required
                  value={verifyForm.challenge_question}
                  onChange={(e) => setVerifyForm({ ...verifyForm, challenge_question: e.target.value })}
                  placeholder="e.g. Confirm specific sticker, lockscreen pin, scratch location..."
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Owner Response / Proof *</label>
                <textarea
                  required
                  rows={2}
                  value={verifyForm.owner_response}
                  onChange={(e) => setVerifyForm({ ...verifyForm, owner_response: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Officer Verification Notes *</label>
                <textarea
                  required
                  rows={2}
                  value={verifyForm.officer_notes}
                  onChange={(e) => setVerifyForm({ ...verifyForm, officer_notes: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700">Concordance Score (0-100) *</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={verifyForm.concordance_score}
                    onChange={(e) => setVerifyForm({ ...verifyForm, concordance_score: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700">Verification Decision *</label>
                  <select
                    value={verifyForm.status}
                    onChange={(e) => setVerifyForm({ ...verifyForm, status: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium"
                  >
                    <option value="VERIFIED">VERIFIED (Approve Match)</option>
                    <option value="REJECTED">REJECTED (Deny Match)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setVerifyingMatch(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 shadow-xs"
                >
                  {loading ? 'Submitting...' : 'Complete Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CLAIM REVIEW */}
      {reviewingClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">Review Ownership Claim</h3>
            <p className="text-xs text-slate-500 mt-1">
              Claimant: <span className="font-bold text-slate-800">{reviewingClaim.claimant_name || reviewingClaim.claimed_by}</span>
            </p>

            <div className="mt-3">
              <label className="block text-xs font-bold text-slate-700">Reviewer Notes</label>
              <textarea
                rows={3}
                value={claimReviewNotes}
                onChange={(e) => setClaimReviewNotes(e.target.value)}
                placeholder="Enter notes on identity verification or reason for decision..."
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={() => setReviewingClaim(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleClaimReviewAction('REJECTED')}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
              >
                Reject Claim
              </button>
              <button
                type="button"
                onClick={() => handleClaimReviewAction('APPROVED')}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              >
                Approve Claim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: HANDOVER EXECUTION */}
      {handoverClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">Issue Physical Handover Receipt</h3>
            <p className="text-xs text-slate-500 mt-1">
              Releasing item to: <span className="font-bold text-slate-800">{handoverClaim.claimant_name || handoverClaim.claimed_by}</span>
            </p>

            <form onSubmit={handleHandoverSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700">Handover Location *</label>
                <select
                  value={handoverForm.handover_location_id}
                  onChange={(e) => setHandoverForm({ ...handoverForm, handover_location_id: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700">Handover Notes / Verification Receipt *</label>
                <textarea
                  required
                  rows={2}
                  value={handoverForm.handover_notes}
                  onChange={(e) => setHandoverForm({ ...handoverForm, handover_notes: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setHandoverClaim(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-700 shadow-xs"
                >
                  {loading ? 'Issuing...' : 'Complete Physical Handover'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
