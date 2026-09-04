'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { Send, CheckCircle2, AlertCircle, ArrowLeft, Upload, FileText, Loader2, Check } from 'lucide-react';

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
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeFileName, setResumeFileName] = useState('');
  const [resumeFileSize, setResumeFileSize] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const handleResumeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingResume(true);
    setError('');

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('category', 'resumes');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload resume file.');
      }

      setFormData((prev) => ({ ...prev, resumeUrl: data.fileUrl }));
      setResumeFileName(data.fileName);
      setResumeFileSize(data.fileSize);
    } catch (err: any) {
      setError(err.message || 'Resume upload failed. Please try again.');
    } finally {
      setUploadingResume(false);
    }
  };

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

        {submittedRef ? (
          <div className="glass-panel p-8 text-center space-y-6 animate-fade-in border-emerald-200 bg-white">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="font-display text-2xl font-black text-[#0f172a]">Application Submitted Successfully!</h2>
              <p className="text-sm text-slate-600 mt-2">
                Thank you for applying to VAMTech Pvt Ltd. Your application record has been registered.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl max-w-md mx-auto">
              <span className="text-xs uppercase font-mono font-bold text-slate-500 tracking-wider block">
                Your Candidate Reference Number
              </span>
              <span className="text-3xl font-extrabold font-mono text-[#f9572a] block mt-2">
                {submittedRef}
              </span>
              <p className="text-xs text-slate-500 mt-3">
                This number has been emailed to <strong className="text-slate-800">{formData.email}</strong>.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={`/status?ref=${submittedRef}&email=${encodeURIComponent(formData.email)}`}
                className="w-full sm:w-auto btn-orange font-bold px-6 py-3 rounded-xl text-sm transition"
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
                className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold px-6 py-3 rounded-xl text-sm transition"
              >
                Submit Another Application
              </button>
            </div>
          </div>
        ) : (
          <div className="glass-panel p-6 sm:p-8 space-y-6 bg-white border-slate-200">
            <div className="border-b border-slate-200 pb-4">
              <h1 className="font-display text-2xl font-black text-[#0f172a]">VAMTech Job Application</h1>
              <p className="text-xs text-slate-500 mt-1">
                Fill out the form below to receive your unique Candidate Reference Number (<span className="font-mono text-slate-900 font-bold">VT-YYYY-XXX</span>).
              </p>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-center gap-3 text-xs text-rose-600 font-semibold">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aniket Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. candidate@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Role Applying For *</label>
                  <select
                    value={formData.roleApplied}
                    onChange={(e) => setFormData({ ...formData, roleApplied: e.target.value })}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl bg-white"
                  >
                    <option value="Senior Full Stack Engineer">Senior Full Stack Engineer</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Engineer">Backend Engineer</option>
                    <option value="UI/UX Designer">UI/UX Designer</option>
                    <option value="AI / Machine Learning Engineer">AI / Machine Learning Engineer</option>
                    <option value="DevOps Specialist">DevOps Specialist</option>
                    <option value="Full Stack Development Intern (Paid)">Full Stack Development Intern (Paid)</option>
                    <option value="Full Stack Development Intern (Unpaid)">Full Stack Development Intern (Unpaid)</option>
                    <option value="Software Engineer Intern (Paid)">Software Engineer Intern (Paid)</option>
                    <option value="Research Intern (Unpaid)">Research Intern (Unpaid)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">LinkedIn Profile (Optional)</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Resume Document (PDF/DOC)</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleResumeFileChange}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                />
                <div className={`border border-dashed p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${formData.resumeUrl ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-300 bg-slate-50'}`}>
                  <div className="flex items-center gap-3">
                    <FileText className={`w-6 h-6 ${formData.resumeUrl ? 'text-emerald-600' : 'text-vamorange-500'}`} />
                    <div>
                      <span className="text-slate-800 font-semibold block text-xs">
                        {formData.resumeUrl ? (resumeFileName || 'Resume Attached') : 'Upload Resume File'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {formData.resumeUrl ? `${resumeFileSize || 'Uploaded'} • Ready for submission` : 'PDF or DOC up to 25MB'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={uploadingResume}
                    onClick={() => fileInputRef.current?.click()}
                    className={`text-xs px-3.5 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 ${formData.resumeUrl ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'}`}
                  >
                    {uploadingResume ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : formData.resumeUrl ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Change File</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Choose File</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Cover Note (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Tell us briefly about your background and why you want to join VAMTech..."
                  value={formData.coverNote}
                  onChange={(e) => setFormData({ ...formData, coverNote: e.target.value })}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-orange font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition"
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
