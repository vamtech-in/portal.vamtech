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
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-vamgold-400" />
            <span>Candidate Recruitment Pipeline</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage applicants, track reference numbers, issue offer letters, and onboard hires.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, email, or ref no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-input pl-9 pr-3 py-2 rounded-lg"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full glass-input px-3 py-2 rounded-lg bg-vamnavy-900"
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
            className="w-full glass-input px-3 py-2 rounded-lg bg-vamnavy-900"
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
      <div className="glass-panel p-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-vamnavy-900 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Ref Number</th>
                <th className="px-4 py-3">Candidate Name</th>
                <th className="px-4 py-3">Role Applied</th>
                <th className="px-4 py-3">Applied Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions & Offers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vamnavy-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">Loading candidate records...</td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500 italic">No candidate records match your search query.</td>
                </tr>
              ) : (
                candidates.map((cand) => (
                  <tr key={cand.id} className="hover:bg-vamnavy-900/60 transition">
                    {/* Ref Number */}
                    <td className="px-4 py-3 font-mono font-bold text-vamgold-400">
                      {cand.refNumber}
                    </td>

                    {/* Candidate Name & Contact */}
                    <td className="px-4 py-3">
                      <span className="font-bold text-white block">{cand.name}</span>
                      <span className="text-[11px] text-slate-400 block">{cand.email}</span>
                      <span className="text-[10px] text-slate-500 font-mono block">{cand.phone}</span>
                    </td>

                    {/* Role Applied */}
                    <td className="px-4 py-3 font-medium text-slate-200">
                      {cand.roleApplied}
                    </td>

                    {/* Applied Date */}
                    <td className="px-4 py-3 font-mono text-slate-400">
                      {new Date(cand.appliedAt).toLocaleDateString()}
                    </td>

                    {/* Status Dropdown */}
                    <td className="px-4 py-3">
                      <select
                        value={cand.status}
                        onChange={(e) => handleStatusChange(cand.id, e.target.value)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg bg-vamnavy-900 border cursor-pointer ${
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
                        <option value="Applied" className="bg-vamnavy-950 text-sky-300">Applied</option>
                        <option value="Interviewed" className="bg-vamnavy-950 text-purple-300">Interviewed</option>
                        <option value="Selected" className="bg-vamnavy-950 text-amber-300">Selected</option>
                        <option value="Offer Sent" className="bg-vamnavy-950 text-orange-300">Offer Sent</option>
                        <option value="Joined" className="bg-vamnavy-950 text-emerald-300">Joined</option>
                        <option value="Rejected" className="bg-vamnavy-950 text-rose-300">Rejected</option>
                      </select>
                    </td>

                    {/* Actions & Offers */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {cand.status === 'Selected' || cand.status === 'Offer Sent' ? (
                          <Link
                            href={`/hr/offer-letter/${cand.id}`}
                            className="bg-vamgold-500 hover:bg-vamgold-400 text-vamnavy-950 font-bold px-3 py-1.5 rounded text-[11px] flex items-center gap-1 transition shadow"
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
                            className="bg-emerald-500 hover:bg-emerald-400 text-vamnavy-950 font-bold px-3 py-1.5 rounded text-[11px] flex items-center gap-1 transition shadow"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-vamnavy-900 border border-emerald-500/40 rounded-xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              <span>Onboard Employee ({onboardCandidate.refNumber})</span>
            </h3>
            <p className="text-xs text-slate-400">
              This will create a new employee account carrying over Candidate Ref <strong className="text-vamgold-400 font-mono">{onboardCandidate.refNumber}</strong> as their Employee ID, set forced password reset on first login, and email credentials.
            </p>

            {onboardMsg ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-bold text-center">
                {onboardMsg}
              </div>
            ) : (
              <form onSubmit={handleOnboardSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    disabled
                    value={onboardCandidate.name}
                    className="w-full glass-input px-3.5 py-2.5 rounded-lg opacity-70 bg-vamnavy-950"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                  <input
                    type="text"
                    disabled
                    value={onboardCandidate.email}
                    className="w-full glass-input px-3.5 py-2.5 rounded-lg opacity-70 bg-vamnavy-950"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Department *</label>
                    <select
                      value={onboardDept}
                      onChange={(e) => setOnboardDept(e.target.value)}
                      className="w-full glass-input px-3.5 py-2.5 rounded-lg bg-vamnavy-950"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Product Design">Product Design</option>
                      <option value="Infrastructure / DevOps">Infrastructure / DevOps</option>
                      <option value="AI Research">AI Research</option>
                      <option value="Business Operations">Business Operations</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Official Designation *</label>
                    <input
                      type="text"
                      required
                      value={onboardDesignation}
                      onChange={(e) => setOnboardDesignation(e.target.value)}
                      className="w-full glass-input px-3.5 py-2.5 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOnboardCandidate(null)}
                    className="bg-vamnavy-800 text-slate-300 px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={onboarding}
                    className="bg-emerald-500 text-vamnavy-950 font-bold px-4 py-2 rounded-lg"
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
