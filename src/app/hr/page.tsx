'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Search, Filter, FileText, Send, UserCheck, CheckCircle2, ArrowRight } from 'lucide-react';

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
    fetchCandidates();
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
                          <Link
                            href={`/hr/offer-letter/${cand.id}`}
                            className="btn-orange text-white font-bold px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1 transition shadow-sm"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{cand.status === 'Offer Sent' ? 'Re-Issue Offer' : 'Generate Offer'}</span>
                          </Link>
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
    </div>
  );
}
