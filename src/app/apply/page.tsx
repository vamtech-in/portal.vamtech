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

  // Dynamic Open Roles loaded from database
  const [openRoles, setOpenRoles] = useState<any[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState<'ALL' | 'INTERN' | 'FULL_TIME'>('ALL');

  React.useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch('/api/public/roles');
        if (res.ok) {
          const data = await res.json();
          if (data.roles && data.roles.length > 0) {
            setOpenRoles(data.roles);

            if (typeof window !== 'undefined') {
              const params = new URLSearchParams(window.location.search);
              const urlRole = params.get('role');
              const urlType = params.get('type')?.toUpperCase();

              if (urlType === 'INTERN' || urlType === 'FULL_TIME') {
                setSelectedTrack(urlType);
              }

              if (urlRole) {
                const match = data.roles.find(
                  (r: any) => r.title.toLowerCase() === urlRole.toLowerCase()
                );
                if (match) {
                  setFormData((prev) => ({ ...prev, roleApplied: match.title }));
                  setSelectedTrack(match.type);
                  return;
                }
              }

              // Set default to first role
              setFormData((prev) => ({ ...prev, roleApplied: data.roles[0].title }));
            }
          }
        }
      } catch (e) {
        console.error('Failed to load open roles', e);
      } finally {
        setLoadingRoles(false);
      }
    };
    fetchRoles();
  }, []);

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
    <div className="min-h-screen flex flex-col bg-[#F5F4EF] text-[#111111] selection:bg-[#FF4400] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#6F6F6A] hover:text-[#111111] transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {submittedRef ? (
          <div className="glass-panel p-8 text-center space-y-6 animate-fade-in border-[rgba(17,17,17,0.08)] bg-white">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-[#111111]">Application Submitted Successfully!</h2>
              <p className="text-sm text-[#6F6F6A] mt-2">
                Thank you for applying to VAMTech Pvt Ltd. Your application record has been registered.
              </p>
            </div>

            <div className="bg-[#F5F4EF] border border-[rgba(17,17,17,0.08)] p-6 rounded-2xl max-w-md mx-auto">
              <span className="text-xs uppercase font-mono font-bold text-[#6F6F6A] tracking-wider block">
                Your Candidate Reference Number
              </span>
              <span className="text-3xl font-extrabold font-mono text-[#FF4400] block mt-2">
                {submittedRef}
              </span>
              <p className="text-xs text-[#6F6F6A] mt-3">
                This number has been emailed to <strong className="text-[#111111]">{formData.email}</strong>.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={`/status?ref=${submittedRef}&email=${encodeURIComponent(formData.email)}`}
                className="w-full sm:w-auto btn-orange font-semibold px-6 py-3 rounded-full text-sm transition"
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
                className="w-full sm:w-auto bg-[#F5F4EF] hover:bg-[#ECEAE4] border border-[rgba(17,17,17,0.1)] text-[#111111] font-semibold px-6 py-3 rounded-full text-sm transition"
              >
                Submit Another Application
              </button>
            </div>
          </div>
        ) : (
          <div className="glass-panel p-6 sm:p-8 space-y-6 bg-white border-[rgba(17,17,17,0.08)]">
            <div className="border-b border-[rgba(17,17,17,0.08)] pb-4">
              <div className="editorial-badge mb-3 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#FF4400] animate-pulse" />
                <span>ONLINE CANDIDATE APPLICATION</span>
              </div>
              <h1 className="text-2xl font-black text-[#111111]">VAMTech Job Application</h1>
              <p className="text-xs text-[#6F6F6A] mt-1">
                Fill out the form below to receive your unique Candidate Reference Number (<span className="font-mono text-[#111111] font-bold">VT-YYYY-XXX</span>).
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
                  <label className="block text-[#111111] font-semibold mb-1">Phone Number *</label>
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
                  <label className="block text-[#111111] font-semibold mb-1">LinkedIn Profile (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl"
                  />
                </div>
              </div>

              {/* Role Selection with Track Filter */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-[#111111] font-bold text-xs">
                      Choose Your Position *
                    </label>
                    <span className="text-[11px] text-[#6F6F6A]">
                      Select whether you are applying for an <strong>Internship</strong> or <strong>Full-Time</strong> position.
                    </span>
                  </div>

                  {/* Track Pills */}
                  <div className="inline-flex rounded-xl bg-[#F5F4EF] p-1 border border-[rgba(17,17,17,0.08)] text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setSelectedTrack('ALL')}
                      className={`px-3 py-1 rounded-lg transition ${
                        selectedTrack === 'ALL'
                          ? 'bg-white text-[#111111] shadow-xs'
                          : 'text-[#6F6F6A] hover:text-[#111111]'
                      }`}
                    >
                      All ({openRoles.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTrack('INTERN')}
                      className={`px-3 py-1 rounded-lg transition ${
                        selectedTrack === 'INTERN'
                          ? 'bg-white text-[#FF4400] shadow-xs'
                          : 'text-[#6F6F6A] hover:text-[#111111]'
                      }`}
                    >
                      🎓 Internships ({openRoles.filter((r) => r.type === 'INTERN').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTrack('FULL_TIME')}
                      className={`px-3 py-1 rounded-lg transition ${
                        selectedTrack === 'FULL_TIME'
                          ? 'bg-white text-sky-800 shadow-xs'
                          : 'text-[#6F6F6A] hover:text-[#111111]'
                      }`}
                    >
                      💼 Full-Time ({openRoles.filter((r) => r.type === 'FULL_TIME').length})
                    </button>
                  </div>
                </div>

                {/* Interactive Cards Grid */}
                {loadingRoles ? (
                  <div className="p-4 rounded-xl border border-[rgba(17,17,17,0.08)] bg-slate-50 text-center text-xs text-[#6F6F6A]">
                    Loading open positions...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                    {openRoles
                      .filter((r) => selectedTrack === 'ALL' || r.type === selectedTrack)
                      .map((role) => {
                        const isSelected = formData.roleApplied === role.title;
                        return (
                          <div
                            key={role.id || role.title}
                            onClick={() => setFormData({ ...formData, roleApplied: role.title })}
                            className={`p-3 rounded-xl border-2 transition cursor-pointer text-left flex items-start gap-2.5 ${
                              isSelected
                                ? 'border-[#FF4400] bg-[#FFF4EE]/60 shadow-xs'
                                : 'border-[rgba(17,17,17,0.08)] bg-white hover:border-[rgba(17,17,17,0.18)] hover:bg-[#F5F4EF]/30'
                            }`}
                          >
                            <div className="pt-0.5 shrink-0">
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  isSelected
                                    ? 'border-[#FF4400] bg-[#FF4400] text-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-1">
                                <span
                                  className={`text-[9.5px] font-mono font-bold uppercase px-1.5 py-0.2 rounded ${
                                    role.type === 'INTERN'
                                      ? 'bg-orange-100/70 text-[#FF4400]'
                                      : 'bg-sky-100/70 text-sky-800'
                                  }`}
                                >
                                  {role.type === 'INTERN' ? 'Intern' : 'Full-Time'}
                                </span>
                                <span className="text-[10px] text-[#6F6F6A] font-medium truncate">
                                  {role.department}
                                </span>
                              </div>

                              <span className="text-xs font-bold text-[#111111] block leading-tight">
                                {role.title}
                              </span>

                              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#6F6F6A]">
                                {role.stipendOrCtc && (
                                  <span className="font-semibold text-[#111111] font-mono">
                                    {role.stipendOrCtc}
                                  </span>
                                )}
                                {role.duration && (
                                  <span>&bull; {role.duration}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}

                {/* Dropdown Sync */}
                <div className="pt-1">
                  <label className="block text-[11px] text-[#6F6F6A] font-semibold mb-1">
                    Selected Position Dropdown:
                  </label>
                  <select
                    value={formData.roleApplied}
                    onChange={(e) => setFormData({ ...formData, roleApplied: e.target.value })}
                    className="w-full glass-input px-3 py-2 text-xs rounded-xl bg-white font-semibold"
                  >
                    {openRoles.map((role) => (
                      <option key={role.id || role.title} value={role.title}>
                        {role.type === 'INTERN' ? '🎓 [Intern] ' : '💼 [Full-Time] '}
                        {role.title} {role.stipendOrCtc ? `(${role.stipendOrCtc})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
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
                        {formData.resumeUrl ? `${resumeFileSize || 'Uploaded'} • Ready for submission` : 'PDF or DOC up to 5MB'}
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
