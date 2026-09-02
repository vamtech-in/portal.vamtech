'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { Search, ArrowLeft, CheckCircle2, Clock, FileCheck2, UserCheck, XCircle, AlertCircle } from 'lucide-react';

function StatusContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || '';
  const initialEmail = searchParams.get('email') || '';

  const [refNumber, setRefNumber] = useState(initialRef);
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const fetchStatus = async (refVal: string, emailVal: string) => {
    if (!refVal || !emailVal) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/public/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refNumber: refVal, email: emailVal }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lookup failed');
      }

      setResult(data.candidate);
    } catch (err: any) {
      setError(err.message || 'No matching application found.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialRef && initialEmail) {
      fetchStatus(initialRef, initialEmail);
    }
  }, [initialRef, initialEmail]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStatus(refNumber, email);
  };

  const steps = [
    { key: 'Applied', label: 'Applied' },
    { key: 'Interviewed', label: 'Interviewed' },
    { key: 'Selected', label: 'Selected' },
    { key: 'Offer Sent', label: 'Offer Sent' },
    { key: 'Joined', label: 'Joined' },
  ];

  const getStepIndex = (status: string) => {
    if (status === 'Rejected') return -1;
    return steps.findIndex((s) => s.key === status);
  };

  return (
    <div className="space-y-6">
      {/* Lookup Form */}
      <div className="glass-panel p-6 sm:p-8 bg-white border-slate-200">
        <h1 className="font-display text-2xl font-black text-[#0f172a] mb-1">Check Application Status</h1>
        <p className="text-xs text-slate-500 mb-6">
          Enter your Candidate Reference Number (<span className="font-mono text-slate-900 font-bold">VT-YYYY-XXX</span>) and the email address used during submission.
        </p>

        {error && (
          <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl flex items-center gap-2.5 text-xs text-rose-600 font-semibold mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Reference Number *</label>
            <input
              type="text"
              required
              placeholder="e.g. VT-2026-001"
              value={refNumber}
              onChange={(e) => setRefNumber(e.target.value)}
              className="w-full glass-input px-3.5 py-2.5 rounded-xl font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Email Address *</label>
            <input
              type="email"
              required
              placeholder="e.g. candidate@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full glass-input px-3.5 py-2.5 rounded-xl"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-orange font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Searching...' : 'Lookup Status'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Result Display */}
      {result && (
        <div className="glass-panel p-6 sm:p-8 space-y-6 animate-fade-in bg-white border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-display text-xl font-bold text-[#0f172a]">{result.name}</h2>
                <span className="font-mono text-xs font-bold text-[#f9572a] bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-md">
                  {result.refNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Role: <strong className="text-slate-800">{result.roleApplied}</strong></p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Current Status</span>
              <span
                className={`inline-block px-3 py-1 text-xs font-extrabold rounded-full mt-1 ${
                  result.status === 'Joined'
                    ? 'badge-joined'
                    : result.status === 'Offer Sent'
                    ? 'badge-offer'
                    : result.status === 'Selected'
                    ? 'badge-selected'
                    : result.status === 'Interviewed'
                    ? 'badge-interviewed'
                    : result.status === 'Rejected'
                    ? 'badge-rejected'
                    : 'badge-applied'
                }`}
              >
                {result.status}
              </span>
            </div>
          </div>

          {/* Timeline Progress */}
          {result.status === 'Rejected' ? (
            <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center space-y-2">
              <XCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <h3 className="font-display text-sm font-bold text-rose-700">Application Closed / Unsuccessful</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Thank you for your interest in VAMTech. While we are unable to move forward with your application at this time, we encourage you to apply for future openings.
              </p>
            </div>
          ) : (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Application Progress Timeline</h3>
              <div className="relative flex items-center justify-between">
                {/* Progress bar line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 z-0" />

                {steps.map((step, idx) => {
                  const currentIdx = getStepIndex(result.status);
                  const isCompleted = currentIdx >= idx;
                  const isCurrent = currentIdx === idx;

                  return (
                    <div key={step.key} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                          isCompleted
                            ? 'bg-emerald-500 text-white shadow-md ring-4 ring-emerald-100'
                            : 'bg-white border-2 border-slate-300 text-slate-400'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>
                      <span
                        className={`text-[11px] font-semibold mt-2.5 ${
                          isCurrent
                            ? 'text-[#f9572a] font-bold'
                            : isCompleted
                            ? 'text-slate-800 font-semibold'
                            : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Latest Offer Note if applicable */}
          {result.offerLetters && result.offerLetters.length > 0 && (
            <div className="bg-sky-50 border border-sky-200 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileCheck2 className="w-5 h-5 text-sky-600" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Official Offer Issued</span>
                  <span className="text-[10px] text-slate-500 font-mono">Ref: {result.offerLetters[0].offerRefNumber} &bull; {result.offerLetters[0].type.replace('_', ' ')}</span>
                </div>
              </div>
              <span className="text-xs text-sky-700 font-semibold">Communicated via Email</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function StatusPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 selection:bg-vamorange-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <Suspense fallback={<div className="text-center py-10 text-slate-400 text-sm">Loading application status lookup...</div>}>
          <StatusContent />
        </Suspense>
      </main>
    </div>
  );
}
