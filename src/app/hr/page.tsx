'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Search, Filter, FileText, Send, UserCheck, CheckCircle2, ArrowRight, UserPlus, Plus, X, AlertCircle, Sparkles } from 'lucide-react';

export default function CandidatePipelinePage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Onboarding Modal state
  const [onboardCandidate, setOnboardCandidate] = useState<any | null>(null);
  const [onboardDept, setOnboardDept] = useState('Engineering');
  const [onboardDesignation, setOnboardDesignation] = useState('');
  const [onboarding, setOnboarding] = useState(false);
  const [onboardMsg, setOnboardMsg] = useState('');

  // Add External Candidate Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingCandidate, setAddingCandidate] = useState(false);
  const [addError, setAddError] = useState('');
  const [createdCandidate, setCreatedCandidate] = useState<any | null>(null);
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    email: '',
    phone: '',
    roleApplied: 'Frontend Web Development Intern',
    customRole: '',
    status: 'Selected',
    linkedin: '',
    resumeUrl: '',
    coverNote: '',
    sendSelectionEmail: false,
  });
  const [candidateTrack, setCandidateTrack] = useState<'INTERN' | 'FULL_TIME'>('INTERN');
  const [offerModalCandidate, setOfferModalCandidate] = useState<any | null>(null);

  const resetAddModal = () => {
    setShowAddModal(false);
    setCreatedCandidate(null);
    setAddError('');
    setCandidateTrack('INTERN');
    setNewCandidate({
      name: '',
      email: '',
      phone: '',
      roleApplied: 'Frontend Web Development Intern',
      customRole: '',
      status: 'Selected',
      linkedin: '',
      resumeUrl: '',
      coverNote: '',
      sendSelectionEmail: false,
    });
  };

  const handleAddCandidateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingCandidate(true);
    setAddError('');

    let resolvedRole = newCandidate.roleApplied === 'Other'
      ? newCandidate.customRole.trim()
      : newCandidate.roleApplied.trim();

    if (!resolvedRole) {
      setAddError('Please specify the candidate role or job title.');
      setAddingCandidate(false);
      return;
    }

    if (candidateTrack === 'INTERN' && !resolvedRole.toLowerCase().includes('intern')) {
      resolvedRole = `${resolvedRole} Intern`;
    }

    try {
      const res = await fetch('/api/hr/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCandidate.name,
          email: newCandidate.email,
          phone: newCandidate.phone,
          roleApplied: resolvedRole,
          status: newCandidate.status,
          linkedin: newCandidate.linkedin,
          resumeUrl: newCandidate.resumeUrl,
          coverNote: newCandidate.coverNote || 'Direct candidate selected via external interview & skill assessment.',
          sendSelectionEmail: newCandidate.sendSelectionEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register external candidate.');
      }

      setCreatedCandidate(data.candidate);
      fetchCandidates();
    } catch (err: any) {
      setAddError(err.message || 'Failed to register external candidate.');
    } finally {
      setAddingCandidate(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (roleFilter) params.append('role', roleFilter);

      const res = await fetch(`/api/hr/candidates?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCandidates(data.candidates || []);
      }
    } catch (e) {
      console.error('Failed to fetch candidates', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCandidates();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter, roleFilter]);

  const handleStatusChange = async (candidateId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/hr/candidates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId, status: newStatus }),
      });

      if (res.ok) {
        fetchCandidates();
        if (newStatus === 'Selected') {
          const target = candidates.find((c) => c.id === candidateId || c.refNumber === candidateId);
          if (target) {
            setOfferModalCandidate(target);
          }
        }
      }
    } catch (e) {
      console.error('Status change error', e);
    }
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardCandidate) return;
    setOnboarding(true);

    try {
      const res = await fetch('/api/hr/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: onboardCandidate.id,
          department: onboardDept,
          designation: onboardDesignation || onboardCandidate.roleApplied,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setOnboardMsg(data.message);
        setTimeout(() => {
          setOnboardCandidate(null);
          setOnboardMsg('');
          fetchCandidates();
        }, 2000);
      }
    } catch (e) {
      console.error('Onboard error', e);
    } finally {
      setOnboarding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-[#0f172a] flex items-center gap-2.5">
            <Users className="w-6 h-6 text-vamorange-500" />
            <span>Candidate Recruitment Pipeline</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage applicants, track reference numbers, issue offer letters, and onboard hires.</p>
        </div>

        <button
          type="button"
          onClick={() => {
            setCreatedCandidate(null);
            setAddError('');
            setShowAddModal(true);
          }}
          className="btn-orange text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm hover:shadow transition self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add External Candidate</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white border-slate-200">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, email, or ref no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-input pl-9 pr-3 py-2 rounded-xl"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full glass-input px-3 py-2 rounded-xl bg-white"
          >
            <option value="">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Interviewed">Interviewed</option>
            <option value="Selected">Selected</option>
            <option value="Offer Sent">Offer Sent</option>
            <option value="Joined">Joined</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full glass-input px-3 py-2 rounded-xl bg-white"
          >
            <option value="">All Roles</option>
            <option value="Senior Full Stack Engineer">Senior Full Stack Engineer</option>
            <option value="Frontend Developer">Frontend Developer</option>
            <option value="UI/UX Designer">UI/UX Designer</option>
            <option value="AI / Machine Learning Engineer">AI / Machine Learning Engineer</option>
            <option value="DevOps Specialist">DevOps Specialist</option>
          </select>
        </div>
      </div>

      {/* Candidate Pipeline Table */}
      <div className="glass-panel p-6 overflow-hidden bg-white border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Ref Number</th>
                <th className="px-4 py-3">Candidate Name</th>
                <th className="px-4 py-3">Role Applied</th>
                <th className="px-4 py-3">Applied Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions & Offers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">Loading candidate records...</td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500 italic">No candidate records match your search query.</td>
                </tr>
              ) : (
                candidates.map((cand) => (
                  <tr key={cand.id} className="hover:bg-slate-50 transition">
                    {/* Ref Number */}
                    <td className="px-4 py-3 font-mono font-bold text-[#f9572a]">
                      {cand.refNumber}
                    </td>

                    {/* Candidate Name & Contact */}
                    <td className="px-4 py-3">
                      <span className="font-bold text-[#0f172a] block">{cand.name}</span>
                      <span className="text-[11px] text-slate-500 block">{cand.email}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">{cand.phone}</span>
                      {cand.resumeUrl && (
                        <a
                          href={cand.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-sky-700 hover:text-sky-900 font-semibold mt-1.5 bg-sky-50 hover:bg-sky-100 px-2 py-0.5 rounded border border-sky-200 transition"
                        >
                          <FileText className="w-3 h-3" />
                          <span>View Resume</span>
                        </a>
                      )}
                    </td>

                    {/* Role Applied */}
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {cand.roleApplied}
                    </td>

                    {/* Applied Date */}
                    <td className="px-4 py-3 font-mono text-slate-500">
                      {new Date(cand.appliedAt).toLocaleDateString()}
                    </td>

                    {/* Status Dropdown */}
                    <td className="px-4 py-3">
                      <select
                        value={cand.status}
                        onChange={(e) => handleStatusChange(cand.id, e.target.value)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg cursor-pointer border ${
                          cand.status === 'Joined'
                            ? 'badge-joined'
                            : cand.status === 'Offer Sent'
                            ? 'badge-offer'
                            : cand.status === 'Selected'
                            ? 'badge-selected'
                            : cand.status === 'Interviewed'
                            ? 'badge-interviewed'
                            : cand.status === 'Rejected'
                            ? 'badge-rejected'
                            : 'badge-applied'
                        }`}
                      >
                        <option value="Applied" className="bg-white text-sky-700">Applied</option>
                        <option value="Interviewed" className="bg-white text-purple-700">Interviewed</option>
                        <option value="Selected" className="bg-white text-yellow-700">Selected</option>
                        <option value="Offer Sent" className="bg-white text-orange-700">Offer Sent</option>
                        <option value="Joined" className="bg-white text-emerald-700">Joined</option>
                        <option value="Rejected" className="bg-white text-rose-700">Rejected</option>
                      </select>
                    </td>

                    {/* Actions & Offers */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {cand.status === 'Selected' || cand.status === 'Offer Sent' ? (
                          <div className="inline-flex items-center gap-1.5 bg-[#FFF4EE] border border-orange-200/90 p-1 rounded-xl shadow-xs">
                            <Link
                              href={`/hr/offer-letter/${cand.id}?type=PAID_INTERNSHIP`}
                              className="btn-orange text-white font-semibold px-2.5 py-1 rounded-lg text-[10.5px] flex items-center gap-1 transition"
                              title="Generate Internship Offer Letter"
                            >
                              <span>🎓 Intern Offer</span>
                            </Link>
                            <Link
                              href={`/hr/offer-letter/${cand.id}?type=FULL_TIME`}
                              className="bg-[#111111] hover:bg-[#262626] text-white font-semibold px-2.5 py-1 rounded-lg text-[10.5px] flex items-center gap-1 transition"
                              title="Generate Full-Time Employment Offer Letter"
                            >
                              <span>💼 Full-Time Offer</span>
                            </Link>
                          </div>
                        ) : null}

                        {cand.status === 'Joined' || cand.status === 'Offer Sent' || cand.status === 'Selected' ? (
                          <button
                            onClick={() => {
                              setOnboardCandidate(cand);
                              setOnboardDesignation(cand.roleApplied);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1 transition shadow-sm"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Onboard Employee</span>
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard Employee Modal */}
      {onboardCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-[#0f172a] flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              <span>Onboard Employee ({onboardCandidate.refNumber})</span>
            </h3>
            <p className="text-xs text-slate-500">
              This will create a new employee account carrying over Candidate Ref <strong className="text-vamorange-500 font-mono">{onboardCandidate.refNumber}</strong> as their Employee ID, set forced password reset on first login, and email credentials.
            </p>

            {onboardMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold text-center">
                {onboardMsg}
              </div>
            ) : (
              <form onSubmit={handleOnboardSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    disabled
                    value={onboardCandidate.name}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl opacity-70 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
                  <input
                    type="text"
                    disabled
                    value={onboardCandidate.email}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl opacity-70 bg-slate-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Department *</label>
                    <select
                      value={onboardDept}
                      onChange={(e) => setOnboardDept(e.target.value)}
                      className="w-full glass-input px-3.5 py-2.5 rounded-xl bg-white"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Product Design">Product Design</option>
                      <option value="Infrastructure / DevOps">Infrastructure / DevOps</option>
                      <option value="AI Research">AI Research</option>
                      <option value="Business Operations">Business Operations</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Official Designation *</label>
                    <input
                      type="text"
                      required
                      value={onboardDesignation}
                      onChange={(e) => setOnboardDesignation(e.target.value)}
                      className="w-full glass-input px-3.5 py-2.5 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOnboardCandidate(null)}
                    className="bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={onboarding}
                    className="btn-orange text-white font-bold px-4 py-2 rounded-xl"
                  >
                    {onboarding ? 'Onboarding...' : 'Confirm Onboarding & Email Credentials'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add External Candidate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-vamorange-500">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-[#0f172a]">
                    Register External / Direct Candidate
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add candidates evaluated outside the portal. Official Ref will be auto-generated.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={resetAddModal}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createdCandidate ? (
              <div className="space-y-5 py-4 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-display text-base font-bold text-[#0f172a]">
                    Candidate Successfully Registered!
                  </h4>
                  <p className="text-xs text-slate-500">
                    Candidate profile created and added to your recruitment pipeline.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-left space-y-2 max-w-md mx-auto">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Reference Number:</span>
                    <span className="font-mono font-bold text-vamorange-500 bg-white px-2 py-0.5 rounded border border-orange-200">
                      {createdCandidate.refNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Full Name:</span>
                    <span className="font-bold text-slate-800">{createdCandidate.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Email:</span>
                    <span className="font-mono text-slate-700">{createdCandidate.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Role:</span>
                    <span className="font-semibold text-slate-800">{createdCandidate.roleApplied}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Current Status:</span>
                    <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                      {createdCandidate.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 w-full">
                  <Link
                    href={`/hr/offer-letter/${createdCandidate.id}?type=PAID_INTERNSHIP`}
                    className="btn-orange text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>🎓 Generate Intern Offer</span>
                  </Link>

                  <Link
                    href={`/hr/offer-letter/${createdCandidate.id}?type=FULL_TIME`}
                    className="bg-[#111111] hover:bg-[#262626] text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>💼 Generate Full-Time Offer</span>
                  </Link>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCreatedCandidate(null);
                      setNewCandidate({
                        name: '',
                        email: '',
                        phone: '',
                        roleApplied: 'Senior Full Stack Engineer',
                        customRole: '',
                        status: 'Selected',
                        linkedin: '',
                        resumeUrl: '',
                        coverNote: '',
                        sendSelectionEmail: false,
                      });
                    }}
                    className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl text-xs transition"
                  >
                    Add Another
                  </button>

                  <button
                    type="button"
                    onClick={resetAddModal}
                    className="w-full sm:w-auto bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-semibold px-4 py-2.5 rounded-xl text-xs transition"
                  >
                    Done / Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAddCandidateSubmit} className="space-y-4 text-xs">
                {addError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{addError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-semibold mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jane Doe"
                      value={newCandidate.name}
                      onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                      className="w-full glass-input px-3.5 py-2.5 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="candidate@example.com"
                      value={newCandidate.email}
                      onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                      className="w-full glass-input px-3.5 py-2.5 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 9876543210"
                      value={newCandidate.phone}
                      onChange={(e) => setNewCandidate({ ...newCandidate, phone: e.target.value })}
                      className="w-full glass-input px-3.5 py-2.5 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Offer Track (Intern or Full Time) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={candidateTrack}
                      onChange={(e) => {
                        const track = e.target.value as 'INTERN' | 'FULL_TIME';
                        setCandidateTrack(track);
                        if (track === 'INTERN') {
                          setNewCandidate((prev) => ({ ...prev, roleApplied: 'Frontend Web Development Intern' }));
                        } else {
                          setNewCandidate((prev) => ({ ...prev, roleApplied: 'Frontend Developer' }));
                        }
                      }}
                      className="w-full glass-input px-3 py-2.5 rounded-xl bg-white font-bold text-slate-800 border-orange-200 focus:border-vamorange-500"
                    >
                      <option value="INTERN">🎓 Intern (Internship Offer)</option>
                      <option value="FULL_TIME">💼 Full Time (Employment Offer)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Role / Position <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={newCandidate.roleApplied}
                      onChange={(e) => setNewCandidate({ ...newCandidate, roleApplied: e.target.value })}
                      className="w-full glass-input px-3 py-2.5 rounded-xl bg-white font-medium"
                    >
                      {candidateTrack === 'INTERN' ? (
                        <>
                          <option value="Frontend Web Development Intern">Frontend Web Development Intern</option>
                          <option value="Backend Development Intern">Backend Development Intern</option>
                          <option value="Full Stack Intern">Full Stack Intern</option>
                          <option value="UI/UX Design Intern">UI/UX Design Intern</option>
                          <option value="AI / Machine Learning Intern">AI / Machine Learning Intern</option>
                          <option value="Mobile App Development Intern">Mobile App Development Intern</option>
                          <option value="Digital Marketing Intern">Digital Marketing Intern</option>
                          <option value="Human Resources (HR) Intern">Human Resources (HR) Intern</option>
                        </>
                      ) : (
                        <>
                          <option value="Senior Full Stack Engineer">Senior Full Stack Engineer</option>
                          <option value="Frontend Developer">Frontend Developer</option>
                          <option value="Full Stack Developer">Full Stack Developer</option>
                          <option value="Backend Engineer">Backend Engineer</option>
                          <option value="AI / Machine Learning Engineer">AI / Machine Learning Engineer</option>
                          <option value="UI/UX Designer">UI/UX Designer</option>
                          <option value="DevOps Specialist">DevOps Specialist</option>
                          <option value="QA / Test Automation Engineer">QA / Test Automation Engineer</option>
                          <option value="Digital Marketing Executive">Digital Marketing Executive</option>
                          <option value="Human Resources (HR) Executive">Human Resources (HR) Executive</option>
                        </>
                      )}
                      <option value="Other">Other (Custom Role / Title)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Initial Status <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={newCandidate.status}
                      onChange={(e) => setNewCandidate({ ...newCandidate, status: e.target.value })}
                      className="w-full glass-input px-3 py-2.5 rounded-xl bg-white font-medium"
                    >
                      <option value="Selected">Selected (Ready for Offer Letter)</option>
                      <option value="Interviewed">Interviewed</option>
                      <option value="Applied">Applied</option>
                    </select>
                  </div>
                </div>

                {newCandidate.roleApplied === 'Other' && (
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Specify Custom Role Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mobile App Engineer or Data Analyst"
                      value={newCandidate.customRole}
                      onChange={(e) => setNewCandidate({ ...newCandidate, customRole: e.target.value })}
                      className="w-full glass-input px-3.5 py-2.5 rounded-xl"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Tip: Including &ldquo;Intern&rdquo; in the title automatically generates an internship reference number (VT-INT-YYYY-XXX).
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      LinkedIn / Portfolio URL <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/..."
                      value={newCandidate.linkedin}
                      onChange={(e) => setNewCandidate({ ...newCandidate, linkedin: e.target.value })}
                      className="w-full glass-input px-3.5 py-2.5 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Resume Link / File URL <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="https://... or Drive link"
                      value={newCandidate.resumeUrl}
                      onChange={(e) => setNewCandidate({ ...newCandidate, resumeUrl: e.target.value })}
                      className="w-full glass-input px-3.5 py-2.5 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Evaluation Notes / Context <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Direct selection from technical round, off-campus drive, high performance on coding challenge..."
                    value={newCandidate.coverNote}
                    onChange={(e) => setNewCandidate({ ...newCandidate, coverNote: e.target.value })}
                    className="w-full glass-input px-3.5 py-2 rounded-xl resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="sendSelectionEmail"
                    checked={newCandidate.sendSelectionEmail}
                    onChange={(e) => setNewCandidate({ ...newCandidate, sendSelectionEmail: e.target.checked })}
                    className="w-4 h-4 rounded text-vamorange-500 focus:ring-vamorange-500 border-slate-300 cursor-pointer"
                  />
                  <label htmlFor="sendSelectionEmail" className="text-slate-600 text-[11px] cursor-pointer">
                    Also send candidate an immediate &ldquo;Selection Notification&rdquo; email
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={resetAddModal}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingCandidate}
                    className="btn-orange text-white font-bold px-5 py-2 rounded-xl shadow transition cursor-pointer disabled:opacity-50"
                  >
                    {addingCandidate ? 'Registering...' : 'Register Candidate'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Offer Letter Selection Prompt Modal */}
      {offerModalCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-[10px] font-mono font-bold text-[#FF4400] uppercase mb-1">
                  Candidate Selected
                </div>
                <h3 className="text-lg font-bold text-[#111111]">
                  Generate Offer Letter for {offerModalCandidate.name}
                </h3>
                <p className="text-xs text-[#6F6F6A] font-mono mt-0.5">
                  {offerModalCandidate.refNumber} &bull; {offerModalCandidate.roleApplied}
                </p>
              </div>
              <button
                onClick={() => setOfferModalCandidate(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Select which offer letter format to generate. All terms, responsibilities, and calculations will pre-populate automatically:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Intern Offer */}
              <Link
                href={`/hr/offer-letter/${offerModalCandidate.id}?type=PAID_INTERNSHIP`}
                onClick={() => setOfferModalCandidate(null)}
                className="p-4 rounded-xl border-2 border-orange-200 hover:border-[#FF4400] bg-[#FFF4EE]/60 hover:bg-[#FFF4EE] text-left transition flex flex-col justify-between group"
              >
                <div>
                  <div className="text-2xl mb-2">🎓</div>
                  <h4 className="text-xs font-bold text-[#111111] group-hover:text-[#FF4400] transition">
                    Internship Offer Letter
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Monthly stipend (e.g. ₹5,000–₹12,000/mo), fixed term (3–6 months), training outcomes.
                  </p>
                </div>
                <span className="mt-3 text-[11px] font-bold text-[#FF4400] flex items-center gap-1">
                  <span>Open Intern Template</span> &rarr;
                </span>
              </Link>

              {/* Option 2: Full-Time Offer */}
              <Link
                href={`/hr/offer-letter/${offerModalCandidate.id}?type=FULL_TIME`}
                onClick={() => setOfferModalCandidate(null)}
                className="p-4 rounded-xl border-2 border-slate-200 hover:border-[#111111] bg-slate-50 hover:bg-slate-100 text-left transition flex flex-col justify-between group"
              >
                <div>
                  <div className="text-2xl mb-2">💼</div>
                  <h4 className="text-xs font-bold text-[#111111] group-hover:text-[#111111] transition">
                    Full-Time Employment Offer
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Annual CTC (e.g. ₹6–16 LPA), probation terms, notice period, and company benefits.
                  </p>
                </div>
                <span className="mt-3 text-[11px] font-bold text-[#111111] flex items-center gap-1">
                  <span>Open Full-Time Template</span> &rarr;
                </span>
              </Link>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setOfferModalCandidate(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Decide Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
