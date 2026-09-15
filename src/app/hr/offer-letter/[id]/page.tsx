'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Send, ArrowLeft, CheckCircle2, AlertCircle, Sparkles, Building2, User, Mail, Phone, Calendar } from 'lucide-react';
import { numberToWords } from '@/lib/number-to-words';
import { getDefaultResponsibilities } from '@/lib/role-responsibilities';

export default function OfferLetterGeneratorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: candidateId } = use(params);

  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  // Offer Letter Form State
  const [offerType, setOfferType] = useState<'UNPAID_INTERNSHIP' | 'PAID_INTERNSHIP' | 'FULL_TIME'>('PAID_INTERNSHIP');
  const [candidateAddress, setCandidateAddress] = useState('Lucknow, Uttar Pradesh, 226028');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [hrName, setHrName] = useState('Aditya Gupta');
  const [hrPhone, setHrPhone] = useState('+91 72379 00686');
  const [responsibilitiesText, setResponsibilitiesText] = useState('');

  // Internship Fields matching official VAMTech template
  const [duration, setDuration] = useState('3 months');
  const [startDate, setStartDate] = useState('5 September 2026');
  const [endDate, setEndDate] = useState('5 December 2026');
  const [workingHours, setWorkingHours] = useState('10:00 AM to 5:00 PM, 5 days a week (Monday to Friday)');
  const [stipendAmount, setStipendAmount] = useState('5000');
  const [workLocation, setWorkLocation] = useState('Remote');
  const [reportingManager, setReportingManager] = useState('Aditya Gupta, HR');

  // Full-time Fields
  const [dateOfJoining, setDateOfJoining] = useState('2026-10-01');
  const [probationPeriod, setProbationPeriod] = useState('6 Months');
  const [annualCtc, setAnnualCtc] = useState('1200000');
  const [noticePeriod, setNoticePeriod] = useState('60 Days');

  const handleAutoPopulateResponsibilities = (targetRole?: string, targetType?: string) => {
    const role = targetRole !== undefined ? targetRole : designation;
    const type = targetType !== undefined ? targetType : offerType;
    const defaultBullets = getDefaultResponsibilities(role, type !== 'FULL_TIME');
    setResponsibilitiesText(defaultBullets.join('\n'));
  };

  const [searchType, setSearchType] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const t = params.get('type')?.toUpperCase();
      if (t) setSearchType(t);
    }
  }, []);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const res = await fetch(`/api/hr/candidates?id=${encodeURIComponent(candidateId)}&search=${encodeURIComponent(candidateId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.candidates && data.candidates.length > 0) {
            const cand = data.candidates.find((c: any) => c.id === candidateId || c.refNumber === candidateId) || data.candidates[0];
            setCandidate(cand);
            const cleanRole = (cand.roleApplied || '').replace(/\s*\((paid|unpaid)\)\s*$/gi, '').trim();
            setDesignation(cleanRole || cand.roleApplied);

            // Respect explicit URL parameter type or auto-detect from role/ref
            let detectedType: 'UNPAID_INTERNSHIP' | 'PAID_INTERNSHIP' | 'FULL_TIME' = 'FULL_TIME';
            if (searchType === 'PAID_INTERNSHIP' || searchType === 'INTERN') {
              detectedType = 'PAID_INTERNSHIP';
            } else if (searchType === 'UNPAID_INTERNSHIP' || searchType === 'UNPAID') {
              detectedType = 'UNPAID_INTERNSHIP';
            } else if (searchType === 'FULL_TIME') {
              detectedType = 'FULL_TIME';
            } else if (cand.roleApplied?.toLowerCase().includes('(unpaid)') || cand.roleApplied?.toLowerCase().includes('unpaid intern')) {
              detectedType = 'UNPAID_INTERNSHIP';
            } else if (cand.refNumber?.includes('INT') || cand.roleApplied?.toLowerCase().includes('intern')) {
              detectedType = 'PAID_INTERNSHIP';
            }
            setOfferType(detectedType);

            // Auto-populate default responsibilities for this role
            const defaultBullets = getDefaultResponsibilities(cleanRole || cand.roleApplied, detectedType !== 'FULL_TIME');
            setResponsibilitiesText(defaultBullets.join('\n'));
          }
        }
      } catch (e) {
        console.error('Failed to fetch candidate details', e);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidate();
  }, [candidateId, searchType]);

  const handleGenerateAndSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/hr/offer-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: candidate?.id || candidateId,
          type: offerType,
          candidateAddress,
          designation,
          department,
          duration,
          startDate,
          endDate,
          workingHours,
          stipendAmount,
          reportingManager,
          workLocation,
          dateOfJoining,
          probationPeriod,
          annualCtc,
          noticePeriod,
          hrName,
          hrPhone,
          responsibilities: responsibilitiesText,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate offer letter.');
      }

      setSuccessMsg(data.message);
      setTimeout(() => {
        router.push('/hr');
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to generate offer letter.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-vamorange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-xs font-semibold">Loading candidate parameters...</p>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="glass-panel p-10 max-w-lg mx-auto text-center space-y-4 my-12 border-slate-200 bg-white shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-500 shadow-inner">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="font-display text-xl font-black text-[#0f172a]">Candidate Not Found</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Could not find an applicant matching <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">&ldquo;{candidateId}&rdquo;</span>. They may have been moved or updated.
          </p>
        </div>
        <div className="pt-3">
          <Link
            href="/hr"
            className="inline-flex items-center gap-2 btn-navy text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Candidate Pipeline</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link
        href="/hr"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-vamorange-500 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Candidate Pipeline</span>
      </Link>

      <div className="glass-panel p-6 sm:p-8 space-y-6 bg-white border-slate-200 shadow-lg">
        <div className="border-b border-slate-100 pb-5">
          <h1 className="font-display text-2xl font-black text-[#0f172a] flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-vamorange-500" />
            <span>Generate Official Offer Letter</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1.5">
            Issue formal offer letter for <strong className="text-slate-800">{candidate.name}</strong> ({candidate.refNumber} &bull; {candidate.email}).
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-center gap-3 text-xs text-rose-700">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3 text-xs text-emerald-800 font-bold">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleGenerateAndSend} className="space-y-6 text-xs">
          {/* Select Offer Letter Type (Intern or Full Time) */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div>
                <label htmlFor="offerTypeSelect" className="block text-slate-900 font-bold text-sm flex items-center gap-2">
                  <span>Select Offer Type (Intern or Full Time) *</span>
                </label>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose whether this offer is for an <strong>Intern</strong> or a <strong>Full-Time</strong> employee. All fields, calculations, and duties will adjust automatically.
                </p>
              </div>
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full w-fit ${
                offerType === 'FULL_TIME'
                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                  : offerType === 'PAID_INTERNSHIP'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-orange-50 text-vamorange-600 border border-orange-200'
              }`}>
                {offerType === 'FULL_TIME' ? '💼 Full-Time Employment' : offerType === 'PAID_INTERNSHIP' ? '🎓 Paid Internship' : '🎓 Unpaid Internship'}
              </span>
            </div>

            {/* Prominent Select Dropdown */}
            <div>
              <select
                id="offerTypeSelect"
                value={offerType}
                onChange={(e) => {
                  const newType = e.target.value as 'UNPAID_INTERNSHIP' | 'PAID_INTERNSHIP' | 'FULL_TIME';
                  setOfferType(newType);
                  handleAutoPopulateResponsibilities(designation, newType);
                }}
                className="w-full glass-input px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-vamorange-500 font-bold text-slate-800 text-sm cursor-pointer transition shadow-sm"
              >
                <optgroup label="🎓 Internships">
                  <option value="PAID_INTERNSHIP">Intern — Paid Internship (₹5,000 / month stipend)</option>
                  <option value="UNPAID_INTERNSHIP">Intern — Unpaid Internship (Skill Development)</option>
                </optgroup>
                <optgroup label="💼 Full-Time Roles">
                  <option value="FULL_TIME">Full Time — Regular Employment (Annual CTC, Probation & Notice)</option>
                </optgroup>
              </select>
            </div>

            {/* Visual Quick-Toggle Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setOfferType('UNPAID_INTERNSHIP');
                  handleAutoPopulateResponsibilities(designation, 'UNPAID_INTERNSHIP');
                }}
                className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  offerType === 'UNPAID_INTERNSHIP'
                    ? 'border-vamorange-500 bg-orange-50/50 shadow-md ring-2 ring-vamorange-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-xs sm:text-sm text-[#0f172a]">a) Unpaid Intern</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">Ref: VAMT/HR/INT/YYYY-XXX</div>
                <div className="text-[10px] text-vamorange-600 font-bold mt-2 bg-orange-100/80 inline-block px-2 py-0.5 rounded">
                  Unpaid Intern Offer
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOfferType('PAID_INTERNSHIP');
                  handleAutoPopulateResponsibilities(designation, 'PAID_INTERNSHIP');
                }}
                className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  offerType === 'PAID_INTERNSHIP'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-600/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-xs sm:text-sm text-[#0f172a]">b) Paid Intern</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">Ref: VAMT/HR/INT/YYYY-XXX</div>
                <div className="text-[10px] text-emerald-700 font-bold mt-2 bg-emerald-100/80 inline-block px-2 py-0.5 rounded">
                  Paid Intern Offer (₹5,000)
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOfferType('FULL_TIME');
                  handleAutoPopulateResponsibilities(designation, 'FULL_TIME');
                }}
                className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  offerType === 'FULL_TIME'
                    ? 'border-sky-600 bg-sky-50/50 shadow-md ring-2 ring-sky-600/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-xs sm:text-sm text-[#0f172a]">c) Full Time</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">Ref: VAMT/HR/EMP/YYYY-XXX</div>
                <div className="text-[10px] text-sky-700 font-bold mt-2 bg-sky-100/80 inline-block px-2 py-0.5 rounded">
                  Full Time (Annual CTC)
                </div>
              </button>
            </div>
          </div>

          {/* Form Fields Container */}
          <div className="space-y-4 bg-slate-50/80 p-5 sm:p-6 rounded-2xl border border-slate-200">
            <h3 className="text-xs font-bold text-[#0f172a] uppercase tracking-wider mb-2 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-vamorange-500" />
              <span>Template Placeholders & Parameters</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Candidate Designation / Job Title *</label>
                <input
                  type="text"
                  required
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Department *</label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Candidate Address *</label>
                <input
                  type="text"
                  required
                  value={candidateAddress}
                  onChange={(e) => setCandidateAddress(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">HR Signatory *</label>
                <input
                  type="text"
                  required
                  value={hrName}
                  onChange={(e) => setHrName(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">HR Contact Phone *</label>
                <input
                  type="text"
                  required
                  value={hrPhone}
                  onChange={(e) => setHrPhone(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl bg-white font-mono"
                  placeholder="+91 72379 00686"
                />
              </div>
            </div>

            {/* Template Specific Fields for Internships */}
            {(offerType === 'UNPAID_INTERNSHIP' || offerType === 'PAID_INTERNSHIP') && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Internship Duration</label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full glass-input px-3.5 py-2.5 rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Commencement (Start Date)</label>
                    <input
                      type="text"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full glass-input px-3.5 py-2.5 rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">End Date</label>
                    <input
                      type="text"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full glass-input px-3.5 py-2.5 rounded-xl bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Work Location</label>
                    <input
                      type="text"
                      value={workLocation}
                      onChange={(e) => setWorkLocation(e.target.value)}
                      className="w-full glass-input px-3.5 py-2.5 rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Reporting Manager</label>
                    <input
                      type="text"
                      value={reportingManager}
                      onChange={(e) => setReportingManager(e.target.value)}
                      className="w-full glass-input px-3.5 py-2.5 rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Working Hours</label>
                    <input
                      type="text"
                      value={workingHours}
                      onChange={(e) => setWorkingHours(e.target.value)}
                      className="w-full glass-input px-3.5 py-2.5 rounded-xl bg-white"
                    />
                  </div>
                </div>

                {offerType === 'PAID_INTERNSHIP' && (
                  <div className="pt-2">
                    <label className="block text-slate-700 font-semibold mb-1">Monthly Stipend Amount (INR) *</label>
                    <input
                      type="number"
                      required
                      value={stipendAmount}
                      onChange={(e) => setStipendAmount(e.target.value)}
                      className="w-full glass-input px-3.5 py-2.5 rounded-xl bg-white font-mono font-bold text-emerald-700"
                    />
                    <span className="text-[11px] text-emerald-700 font-semibold mt-1.5 block">
                      Auto-rendered in PDF: &ldquo;₹{Number(stipendAmount || 0).toLocaleString('en-IN')} ({numberToWords(stipendAmount || 0)})&rdquo;
                    </span>
                  </div>
                )}
              </>
            )}

            {offerType === 'FULL_TIME' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Reporting Manager</label>
                    <input
                      type="text"
                      value={reportingManager}
                      onChange={(e) => setReportingManager(e.target.value)}
                      className="w-full glass-input px-3.5 py-2.5 rounded-xl bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Work Location</label>
                    <input
                      type="text"
                      value={workLocation}
                      onChange={(e) => setWorkLocation(e.target.value)}
                      className="w-full glass-input px-3.5 py-2.5 rounded-xl bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Date of Joining</label>
                    <input
                      type="date"
                      value={dateOfJoining}
                      onChange={(e) => setDateOfJoining(e.target.value)}
                      className="w-full glass-input px-3.5 py-2.5 rounded-xl bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Annual CTC Amount (Numeric in INR) *</label>
                    <input
                      type="number"
                      required
                      value={annualCtc}
                      onChange={(e) => setAnnualCtc(e.target.value)}
                      className="w-full glass-input px-3.5 py-2.5 rounded-xl bg-white font-mono font-bold text-sky-700"
                    />
                    <span className="text-[11px] text-sky-700 font-semibold mt-1.5 block">
                      Auto-converted in PDF: &ldquo;{numberToWords(annualCtc || 0)}&rdquo;
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Probation Period</label>
                    <select
                      value={probationPeriod}
                      onChange={(e) => setProbationPeriod(e.target.value)}
                      className="w-full glass-input px-3.5 py-2.5 rounded-xl bg-white"
                    >
                      <option value="3 Months">3 Months</option>
                      <option value="6 Months">6 Months</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Notice Period (Post-Confirmation)</label>
                  <select
                    value={noticePeriod}
                    onChange={(e) => setNoticePeriod(e.target.value)}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl bg-white"
                  >
                    <option value="30 Days">30 Days</option>
                    <option value="60 Days">60 Days</option>
                  </select>
                </div>
              </>
            )}

            {/* Roles and Responsibilities (Section 5) */}
            <div className="pt-3 border-t border-slate-200/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div>
                  <label className="block text-slate-800 font-bold text-sm flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-vamorange-500" />
                    <span>Roles & Responsibilities (Offer Section 5) *</span>
                  </label>
                  <p className="text-[12px] text-slate-500 mt-0.5">
                    Tailored for <span className="font-semibold text-slate-700">{designation || 'this role'}</span> ({offerType === 'FULL_TIME' ? 'Full-Time' : 'Internship'}). One bullet point per line.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAutoPopulateResponsibilities()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-vamorange-600 bg-orange-50 hover:bg-orange-100 rounded-lg border border-vamorange-200 transition-colors self-start sm:self-auto cursor-pointer"
                  title="Auto-load official duties for this role"
                >
                  <Sparkles className="w-3.5 h-3.5 text-vamorange-500" />
                  <span>Auto-load for &ldquo;{designation || 'Role'}&rdquo;</span>
                </button>
              </div>
              <textarea
                rows={6}
                required
                value={responsibilitiesText}
                onChange={(e) => setResponsibilitiesText(e.target.value)}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl bg-white font-sans text-xs sm:text-sm leading-relaxed border-slate-200 focus:border-vamorange-500"
                placeholder="Enter one role duty/responsibility per line..."
              />
              <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                <span>PDFKit renders each line as a clean, professionally formatted bullet item.</span>
                <span className="font-semibold text-slate-600">
                  {responsibilitiesText.split('\n').filter((r) => r.trim()).length} responsibilities configured
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-orange text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <span>Generating Branded PDF & Sending Email...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Generate PDF Offer Letter & Dispatch Email to Candidate</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
