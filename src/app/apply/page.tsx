'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { Send, CheckCircle2, AlertCircle, ArrowLeft, Upload, FileText } from 'lucide-react';

export default function ApplyPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    roleApplied: 'Senior Full Stack Engineer',
    resumeUrl: '',
    linkedin: '',
    coverNote: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/public/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      setSubmittedRef(data.refNumber);
    } catch (err: any) {
      setError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-vamnavy-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {submittedRef ? (
          <div className="glass-panel p-8 text-center space-y-6 animate-fade-in border-emerald-500/30">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">Application Submitted Successfully!</h2>
              <p className="text-sm text-slate-300 mt-2">
                Thank you for applying to VAMTech Pvt Ltd. Your application record has been registered.
              </p>
            </div>

            <div className="bg-vamnavy-900 border border-vamgold-500/40 p-6 rounded-xl max-w-md mx-auto">
              <span className="text-xs uppercase font-mono text-slate-400 tracking-wider block">
                Your Candidate Reference Number
              </span>
              <span className="text-3xl font-extrabold font-mono text-vamgold-400 block mt-2">
                {submittedRef}
              </span>
              <p className="text-xs text-slate-400 mt-3">
                This number has been emailed to <strong className="text-slate-200">{formData.email}</strong>.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={`/status?ref=${submittedRef}&email=${encodeURIComponent(formData.email)}`}
                className="w-full sm:w-auto bg-vamgold-500 hover:bg-vamgold-400 text-vamnavy-950 font-bold px-6 py-3 rounded-lg text-sm transition"
              >
                Track Application Status
              </Link>
              <button
                onClick={() => {
                  setSubmittedRef(null);
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    roleApplied: 'Senior Full Stack Engineer',
                    resumeUrl: '',
                    linkedin: '',
                    coverNote: '',
                  });
                }}
                className="w-full sm:w-auto bg-vamnavy-900 hover:bg-vamnavy-800 border border-vamnavy-700 text-slate-300 px-6 py-3 rounded-lg text-sm transition"
              >
                Submit Another Application
              </button>
            </div>
          </div>
        ) : (
          <div className="glass-panel p-6 sm:p-8 space-y-6">
            <div className="border-b border-vamnavy-800 pb-4">
              <h1 className="text-2xl font-extrabold text-white">VAMTech Job Application</h1>
              <p className="text-xs text-slate-400 mt-1">
                Fill out the form below to receive your unique Candidate Reference Number (VT-YYYY-XXX).
              </p>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-lg flex items-center gap-3 text-xs text-rose-300">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aniket Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full glass-input px-3.5 py-2.5 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. candidate@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full glass-input px-3.5 py-2.5 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full glass-input px-3.5 py-2.5 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Role Applying For *</label>
                  <select
                    value={formData.roleApplied}
                    onChange={(e) => setFormData({ ...formData, roleApplied: e.target.value })}
                    className="w-full glass-input px-3.5 py-2.5 rounded-lg bg-vamnavy-900"
                  >
                    <option value="Senior Full Stack Engineer">Senior Full Stack Engineer</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Engineer">Backend Engineer</option>
                    <option value="UI/UX Designer">UI/UX Designer</option>
                    <option value="AI / Machine Learning Engineer">AI / Machine Learning Engineer</option>
                    <option value="DevOps Specialist">DevOps Specialist</option>
                    <option value="Software Engineer Intern (Paid)">Software Engineer Intern (Paid)</option>
                    <option value="Research Intern (Unpaid)">Research Intern (Unpaid)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">LinkedIn Profile (Optional)</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  className="w-full glass-input px-3.5 py-2.5 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Resume Document (PDF/DOC)</label>
                <div className="border border-dashed border-vamnavy-700 bg-vamnavy-950/60 p-4 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-vamgold-400" />
                    <div>
                      <span className="text-slate-300 font-medium block">
                        {formData.resumeUrl ? 'Resume file selected' : 'Upload Resume File'}
                      </span>
                      <span className="text-[10px] text-slate-500">PDF or DOC up to 10MB</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, resumeUrl: '/api/documents/uploaded-resume-sample.pdf' })
                    }
                    className="bg-vamnavy-800 hover:bg-vamnavy-700 text-xs px-3 py-1.5 rounded text-slate-300 transition flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{formData.resumeUrl ? 'Attached' : 'Simulate Upload'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Cover Note (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Tell us briefly about your background and why you want to join VAMTech..."
                  value={formData.coverNote}
                  onChange={(e) => setFormData({ ...formData, coverNote: e.target.value })}
                  className="w-full glass-input px-3.5 py-2.5 rounded-lg"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-vamgold-500 hover:bg-vamgold-400 disabled:opacity-50 text-vamnavy-950 font-bold py-3 rounded-lg text-sm flex items-center justify-center gap-2 transition"
                >
                  {loading ? (
                    <span>Submitting Application...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Application & Generate Ref No</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
