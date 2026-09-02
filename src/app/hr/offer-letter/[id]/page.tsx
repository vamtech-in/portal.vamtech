'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Send, ArrowLeft, CheckCircle2, AlertCircle, Sparkles, Building2 } from 'lucide-react';
import { numberToWords } from '@/lib/number-to-words';

export default function OfferLetterGeneratorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: candidateId } = use(params);

  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  // Offer Letter Form State
  const [offerType, setOfferType] = useState<'UNPAID_INTERNSHIP' | 'PAID_INTERNSHIP' | 'FULL_TIME'>('FULL_TIME');
  const [candidateAddress, setCandidateAddress] = useState('123 Tech Park Road, Bengaluru, India');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [hrName, setHrName] = useState('Anike (Head of HR)');

  // Internship Fields
  const [duration, setDuration] = useState('3 Months (Oct 01, 2026 to Dec 31, 2026)');
  const [workingHours, setWorkingHours] = useState('9:30 AM to 6:30 PM (Mon - Fri)');
  const [stipendAmount, setStipendAmount] = useState('15000');

  // Full-time & Paid Internship Fields
  const [reportingManager, setReportingManager] = useState('VP of Engineering');

  // Full-time Fields
  const [workLocation, setWorkLocation] = useState('VAMTech HQ / Hybrid');
  const [dateOfJoining, setDateOfJoining] = useState('2026-10-01');
  const [probationPeriod, setProbationPeriod] = useState('6 Months');
  const [annualCtc, setAnnualCtc] = useState('1200000');
  const [noticePeriod, setNoticePeriod] = useState('60 Days');

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const res = await fetch(`/api/hr/candidates?search=${candidateId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.candidates && data.candidates.length > 0) {
            const cand = data.candidates.find((c: any) => c.id === candidateId) || data.candidates[0];
            setCandidate(cand);
            setDesignation(cand.roleApplied);
          }
        }
      } catch (e) {
        console.error('Failed to fetch candidate details', e);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidate();
  }, [candidateId]);

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
          candidateId,
          type: offerType,
          candidateAddress,
          designation,
          department,
          duration,
          workingHours,
          stipendAmount,
          reportingManager,
          workLocation,
          dateOfJoining,
          probationPeriod,
          annualCtc,
          noticePeriod,
          hrName,
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
    return <div className="text-center py-12 text-slate-400 text-sm">Loading offer letter generator...</div>;
  }

  if (!candidate) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-rose-400 text-sm font-semibold">Candidate record not found.</p>
        <Link href="/hr" className="text-xs text-slate-300 underline">Return to Candidate Pipeline</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link
        href="/hr"
        className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Candidate Pipeline</span>
      </Link>

      <div className="glass-panel p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="border-b border-vamnavy-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-white">Generate Official Offer Letter</h1>
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-vamnavy-900 text-vamgold-400 rounded border border-vamgold-500/30">
                {candidate.refNumber}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Candidate: <strong className="text-slate-200">{candidate.name}</strong> &bull; {candidate.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sky-400 bg-sky-500/10 px-3 py-1.5 rounded-lg border border-sky-500/20">
              One-Click PDF Generator
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-lg flex items-center gap-3 text-xs text-rose-300">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-lg flex items-center gap-3 text-xs text-emerald-300 font-bold">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleGenerateAndSend} className="space-y-6 text-xs">
          {/* Offer Type Selection Selector */}
          <div>
            <label className="block text-slate-300 font-bold mb-2 uppercase tracking-wider text-[11px]">
              Select Offer Letter Template & Role Type *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setOfferType('UNPAID_INTERNSHIP')}
                className={`p-4 rounded-xl border text-left transition ${
                  offerType === 'UNPAID_INTERNSHIP'
                    ? 'bg-vamnavy-900 border-vamgold-500 text-white shadow-lg'
                    : 'bg-vamnavy-950/60 border-vamnavy-800 text-slate-400 hover:bg-vamnavy-900'
                }`}
              >
                <div className="font-bold text-sm">a) Unpaid Internship</div>
                <div className="text-[10px] text-slate-400 mt-1">Ref: VAMT/HR/INT/YYYY-XXX</div>
                <div className="text-[10px] text-rose-400 font-bold mt-2">Explicitly states unpaid (no stipend)</div>
              </button>

              <button
                type="button"
                onClick={() => setOfferType('PAID_INTERNSHIP')}
                className={`p-4 rounded-xl border text-left transition ${
                  offerType === 'PAID_INTERNSHIP'
                    ? 'bg-vamnavy-900 border-vamgold-500 text-white shadow-lg'
                    : 'bg-vamnavy-950/60 border-vamnavy-800 text-slate-400 hover:bg-vamnavy-900'
                }`}
              >
                <div className="font-bold text-sm">b) Paid Internship</div>
                <div className="text-[10px] text-slate-400 mt-1">Ref: VAMT/HR/INT/YYYY-XXX</div>
                <div className="text-[10px] text-emerald-400 font-bold mt-2">Includes monthly stipend (in words)</div>
              </button>

              <button
                type="button"
                onClick={() => setOfferType('FULL_TIME')}
                className={`p-4 rounded-xl border text-left transition ${
                  offerType === 'FULL_TIME'
                    ? 'bg-vamnavy-900 border-vamgold-500 text-white shadow-lg'
                    : 'bg-vamnavy-950/60 border-vamnavy-800 text-slate-400 hover:bg-vamnavy-900'
                }`}
              >
                <div className="font-bold text-sm">c) Full-Time Offer</div>
                <div className="text-[10px] text-slate-400 mt-1">Ref: VAMT/HR/EMP/YYYY-XXX</div>
                <div className="text-[10px] text-sky-400 font-bold mt-2">Annual CTC, probation & notice period</div>
              </button>
            </div>
          </div>

          {/* Form Fields Container */}
          <div className="space-y-4 bg-vamnavy-950/80 p-5 rounded-xl border border-vamnavy-800">
            <h3 className="text-xs font-bold text-vamgold-400 uppercase tracking-wider mb-2">
              Template Placeholders & Form Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Candidate Designation / Job Title *</label>
                <input
                  type="text"
                  required
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full glass-input px-3.5 py-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Department *</label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full glass-input px-3.5 py-2 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Candidate Postal Address *</label>
              <input
                type="text"
                required
                value={candidateAddress}
                onChange={(e) => setCandidateAddress(e.target.value)}
                className="w-full glass-input px-3.5 py-2 rounded-lg"
              />
            </div>

            {/* Template Specific Fields */}
            {offerType === 'UNPAID_INTERNSHIP' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Internship Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full glass-input px-3.5 py-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Working Hours</label>
                  <input
                    type="text"
                    value={workingHours}
                    onChange={(e) => setWorkingHours(e.target.value)}
                    className="w-full glass-input px-3.5 py-2 rounded-lg"
                  />
                </div>
              </div>
            )}

            {offerType === 'PAID_INTERNSHIP' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Internship Duration</label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full glass-input px-3.5 py-2 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Reporting Manager Name/Title</label>
                    <input
                      type="text"
                      value={reportingManager}
                      onChange={(e) => setReportingManager(e.target.value)}
                      className="w-full glass-input px-3.5 py-2 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Monthly Stipend Amount (Numeric in INR) *</label>
                  <input
                    type="number"
                    required
                    value={stipendAmount}
                    onChange={(e) => setStipendAmount(e.target.value)}
                    className="w-full glass-input px-3.5 py-2 rounded-lg font-mono"
                  />
                  <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
                    Auto-converted in PDF: &ldquo;{numberToWords(stipendAmount || 0)}&rdquo;
                  </span>
                </div>
              </>
            )}

            {offerType === 'FULL_TIME' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Reporting Manager</label>
                    <input
                      type="text"
                      value={reportingManager}
                      onChange={(e) => setReportingManager(e.target.value)}
                      className="w-full glass-input px-3.5 py-2 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Work Location</label>
                    <input
                      type="text"
                      value={workLocation}
                      onChange={(e) => setWorkLocation(e.target.value)}
                      className="w-full glass-input px-3.5 py-2 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Date of Joining</label>
                    <input
                      type="date"
                      value={dateOfJoining}
                      onChange={(e) => setDateOfJoining(e.target.value)}
                      className="w-full glass-input px-3.5 py-2 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Annual CTC Amount (Numeric in INR) *</label>
                    <input
                      type="number"
                      required
                      value={annualCtc}
                      onChange={(e) => setAnnualCtc(e.target.value)}
                      className="w-full glass-input px-3.5 py-2 rounded-lg font-mono"
                    />
                    <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
                      Auto-converted in PDF: &ldquo;{numberToWords(annualCtc || 0)}&rdquo;
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Probation Period</label>
                    <select
                      value={probationPeriod}
                      onChange={(e) => setProbationPeriod(e.target.value)}
                      className="w-full glass-input px-3.5 py-2 rounded-lg bg-vamnavy-900"
                    >
                      <option value="3 Months">3 Months</option>
                      <option value="6 Months">6 Months</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Notice Period (Post-Confirmation)</label>
                  <select
                    value={noticePeriod}
                    onChange={(e) => setNoticePeriod(e.target.value)}
                    className="w-full glass-input px-3.5 py-2 rounded-lg bg-vamnavy-900"
                  >
                    <option value="30 Days">30 Days</option>
                    <option value="60 Days">60 Days</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1">HR Manager / Authorized Signatory Name</label>
              <input
                type="text"
                value={hrName}
                onChange={(e) => setHrName(e.target.value)}
                className="w-full glass-input px-3.5 py-2 rounded-lg"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-vamgold-500 hover:bg-vamgold-400 disabled:opacity-50 text-vamnavy-950 font-bold py-3.5 rounded-lg text-xs flex items-center justify-center gap-2 transition shadow-xl"
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
