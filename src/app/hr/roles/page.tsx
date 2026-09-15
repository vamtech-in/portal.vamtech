'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit2,
  Trash2,
  Users,
  GraduationCap,
  Building2,
  MapPin,
  Clock,
  IndianRupee,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';

interface JobRole {
  id: string;
  title: string;
  type: 'INTERN' | 'FULL_TIME';
  department: string;
  location: string;
  stipendOrCtc?: string | null;
  duration?: string | null;
  description?: string | null;
  isOpen: boolean;
  order: number;
  applicantCount?: number;
  createdAt: string;
}

export default function HRJobRolesPage() {
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'INTERN' | 'FULL_TIME'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<JobRole | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'INTERN' as 'INTERN' | 'FULL_TIME',
    department: 'Engineering',
    location: 'Lucknow / Hybrid',
    stipendOrCtc: '',
    duration: '',
    description: '',
    isOpen: true,
  });

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/hr/roles');
      if (res.ok) {
        const data = await res.json();
        setRoles(data.roles || []);
      }
    } catch (e) {
      console.error('Failed to fetch job roles', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const openCreateModal = () => {
    setEditingRole(null);
    setFormData({
      title: '',
      type: 'INTERN',
      department: 'Engineering',
      location: 'Lucknow / Hybrid',
      stipendOrCtc: '₹6,000–₹12,000 / month',
      duration: '3–6 Months',
      description: '',
      isOpen: true,
    });
    setModalError('');
    setShowModal(true);
  };

  const openEditModal = (role: JobRole) => {
    setEditingRole(role);
    setFormData({
      title: role.title,
      type: role.type,
      department: role.department || 'Engineering',
      location: role.location || 'Lucknow / Hybrid',
      stipendOrCtc: role.stipendOrCtc || '',
      duration: role.duration || '',
      description: role.description || '',
      isOpen: role.isOpen,
    });
    setModalError('');
    setShowModal(true);
  };

  const handleToggleOpen = async (role: JobRole) => {
    setTogglingId(role.id);
    try {
      const newStatus = !role.isOpen;
      // Optimistic update
      setRoles((prev) =>
        prev.map((r) => (r.id === role.id ? { ...r, isOpen: newStatus } : r))
      );

      const res = await fetch('/api/hr/roles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: role.id, isOpen: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update role status');
      }
    } catch (e) {
      console.error('Toggle error', e);
      // Rollback
      fetchRoles();
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteRole = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove the job role "${title}"?`)) return;
    try {
      const res = await fetch(`/api/hr/roles?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRoles((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert('Failed to delete role');
      }
    } catch (e) {
      console.error('Delete error', e);
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');

    try {
      if (!formData.title.trim()) {
        throw new Error('Role title is required');
      }

      const method = editingRole ? 'PATCH' : 'POST';
      const payload = editingRole ? { id: editingRole.id, ...formData } : formData;

      const res = await fetch('/api/hr/roles', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save job role');
      }

      setShowModal(false);
      fetchRoles();
    } catch (err: any) {
      setModalError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered Roles
  const filteredRoles = roles.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.department.toLowerCase().includes(search.toLowerCase()) ||
      (r.description || '').toLowerCase().includes(search.toLowerCase());

    const matchesType =
      filterType === 'ALL' || r.type === filterType;

    const matchesStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'OPEN' ? r.isOpen : !r.isOpen);

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalRoles = roles.length;
  const openInternships = roles.filter((r) => r.type === 'INTERN' && r.isOpen).length;
  const openFullTime = roles.filter((r) => r.type === 'FULL_TIME' && r.isOpen).length;
  const totalApplicants = roles.reduce((acc, r) => acc + (r.applicantCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[rgba(17,17,17,0.1)] text-xs font-mono font-bold text-[#6F6F6A] mb-2 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#FF4400] animate-pulse" />
            <span>CAREER OPENINGS &amp; ROLE MANAGER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111111] flex items-center gap-2.5">
            <Briefcase className="w-7 h-7 text-[#FF4400]" />
            <span>Job Roles &amp; Open Positions</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#6F6F6A] mt-1">
            Choose which roles are actively open for <strong>Interns</strong> or <strong>Full-Time</strong> hires. Candidates see and apply to active roles in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/apply"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-white border border-[rgba(17,17,17,0.1)] text-[#111111] hover:bg-[#F5F4EF] transition shadow-xs"
          >
            <span>Preview Candidate Portal</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#6F6F6A]" />
          </Link>

          <button
            onClick={openCreateModal}
            className="btn-orange px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Role</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[rgba(17,17,17,0.08)] shadow-xs">
          <span className="text-[11px] font-bold text-[#6F6F6A] uppercase tracking-wider block">
            Total Positions
          </span>
          <span className="text-2xl sm:text-3xl font-black text-[#111111] font-mono block mt-1">
            {totalRoles}
          </span>
          <span className="text-[10px] text-[#6F6F6A] mt-1 block">Configured in system</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-orange-200/80 bg-[#FFF4EE]/40 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#FF4400] uppercase tracking-wider block">
              Active Internships
            </span>
            <GraduationCap className="w-4 h-4 text-[#FF4400]" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-[#FF4400] font-mono block mt-1">
            {openInternships}
          </span>
          <span className="text-[10px] text-orange-700/80 mt-1 block">Live on /apply</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-sky-200/80 bg-sky-50/40 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider block">
              Active Full-Time
            </span>
            <Briefcase className="w-4 h-4 text-sky-700" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-sky-900 font-mono block mt-1">
            {openFullTime}
          </span>
          <span className="text-[10px] text-sky-700 mt-1 block">Live on /apply</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[rgba(17,17,17,0.08)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#6F6F6A] uppercase tracking-wider block">
              Total Applicants
            </span>
            <Users className="w-4 h-4 text-[#6F6F6A]" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-[#111111] font-mono block mt-1">
            {totalApplicants}
          </span>
          <span className="text-[10px] text-[#6F6F6A] mt-1 block">Across all positions</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[rgba(17,17,17,0.08)] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#9E9E98] absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search roles, skills, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-input pl-10 pr-4 py-2 text-xs rounded-xl"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Track Filter */}
          <div className="inline-flex rounded-xl bg-[#F5F4EF] p-1 border border-[rgba(17,17,17,0.08)] text-xs font-semibold">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1 rounded-lg transition ${
                filterType === 'ALL'
                  ? 'bg-white text-[#111111] shadow-xs'
                  : 'text-[#6F6F6A] hover:text-[#111111]'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setFilterType('INTERN')}
              className={`px-3 py-1 rounded-lg transition ${
                filterType === 'INTERN'
                  ? 'bg-white text-[#FF4400] shadow-xs'
                  : 'text-[#6F6F6A] hover:text-[#111111]'
              }`}
            >
              🎓 Internships ({roles.filter((r) => r.type === 'INTERN').length})
            </button>
            <button
              onClick={() => setFilterType('FULL_TIME')}
              className={`px-3 py-1 rounded-lg transition ${
                filterType === 'FULL_TIME'
                  ? 'bg-white text-sky-800 shadow-xs'
                  : 'text-[#6F6F6A] hover:text-[#111111]'
              }`}
            >
              💼 Full-Time ({roles.filter((r) => r.type === 'FULL_TIME').length})
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="glass-input px-3 py-1.5 rounded-xl text-xs font-semibold bg-white cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="OPEN">🟢 Active (Accepting Apps)</option>
            <option value="CLOSED">⚪ Closed / Paused</option>
          </select>
        </div>
      </div>

      {/* Role Cards Grid */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-[rgba(17,17,17,0.08)] text-center text-[#6F6F6A] text-sm">
          Loading job openings...
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[rgba(17,17,17,0.08)] text-center space-y-3">
          <Briefcase className="w-12 h-12 text-[#9E9E98] mx-auto opacity-50" />
          <h3 className="text-base font-bold text-[#111111]">No positions found</h3>
          <p className="text-xs text-[#6F6F6A] max-w-sm mx-auto">
            {search || filterType !== 'ALL' || filterStatus !== 'ALL'
              ? 'Try changing your search or filter options.'
              : 'Click "Post New Role" to create your first open position.'}
          </p>
          <button
            onClick={openCreateModal}
            className="btn-orange px-4 py-2 rounded-full text-xs font-semibold"
          >
            Create Role
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRoles.map((role) => (
            <div
              key={role.id}
              className={`bg-white rounded-2xl p-5 border transition-all shadow-xs flex flex-col justify-between ${
                role.isOpen
                  ? 'border-[rgba(17,17,17,0.12)] hover:border-[#FF4400]/40'
                  : 'border-slate-200/80 bg-slate-50/60 opacity-80'
              }`}
            >
              <div className="space-y-3">
                {/* Header Row: Type Badge + Open Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold font-mono uppercase tracking-wider ${
                        role.type === 'INTERN'
                          ? 'bg-[#FFF4EE] text-[#FF4400] border border-orange-200'
                          : 'bg-sky-50 text-sky-800 border border-sky-200'
                      }`}
                    >
                      {role.type === 'INTERN' ? '🎓 Internship' : '💼 Full-Time'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#F5F4EF] text-[#6F6F6A]">
                      {role.department}
                    </span>
                  </div>

                  {/* One-Click Open/Closed Toggle */}
                  <button
                    onClick={() => handleToggleOpen(role)}
                    disabled={togglingId === role.id}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                      role.isOpen
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-200 text-slate-700 border border-slate-300 hover:bg-slate-300'
                    }`}
                    title={role.isOpen ? 'Click to Pause / Close applications' : 'Click to Open for candidates'}
                  >
                    <span className={`w-2 h-2 rounded-full ${role.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                    <span>{role.isOpen ? 'Accepting Apps' : 'Closed'}</span>
                  </button>
                </div>

                {/* Role Title */}
                <div>
                  <h3 className="text-base font-bold text-[#111111]">{role.title}</h3>
                  {role.description && (
                    <p className="text-xs text-[#6F6F6A] mt-1 line-clamp-2 leading-relaxed">
                      {role.description}
                    </p>
                  )}
                </div>

                {/* Metadata Pills */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#6F6F6A] pt-1">
                  {role.stipendOrCtc && (
                    <span className="inline-flex items-center gap-1 bg-[#F5F4EF] px-2.5 py-1 rounded-lg font-semibold text-[#111111]">
                      <IndianRupee className="w-3 h-3 text-[#FF4400]" />
                      <span>{role.stipendOrCtc}</span>
                    </span>
                  )}

                  {role.duration && (
                    <span className="inline-flex items-center gap-1 bg-[#F5F4EF] px-2.5 py-1 rounded-lg">
                      <Clock className="w-3 h-3 text-[#6F6F6A]" />
                      <span>{role.duration}</span>
                    </span>
                  )}

                  {role.location && (
                    <span className="inline-flex items-center gap-1 bg-[#F5F4EF] px-2.5 py-1 rounded-lg">
                      <MapPin className="w-3 h-3 text-[#6F6F6A]" />
                      <span>{role.location}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Actions Row */}
              <div className="pt-4 mt-4 border-t border-[rgba(17,17,17,0.06)] flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-[#6F6F6A]">
                  <Users className="w-3.5 h-3.5 text-[#111111]" />
                  <span className="font-bold text-[#111111] font-mono">
                    {role.applicantCount || 0}
                  </span>
                  <span>applicant{(role.applicantCount || 0) === 1 ? '' : 's'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/hr?role=${encodeURIComponent(role.title)}`}
                    className="text-[11px] text-[#6F6F6A] hover:text-[#111111] font-semibold px-2 py-1 rounded-lg hover:bg-[#F5F4EF] transition"
                  >
                    View Pipeline &rarr;
                  </Link>
                  <button
                    onClick={() => openEditModal(role)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                    title="Edit Role"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteRole(role.id, role.title)}
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete Role"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Role Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#111111]">
                  {editingRole ? 'Edit Job Opening' : 'Post New Job Opening'}
                </h3>
                <p className="text-xs text-[#6F6F6A] mt-0.5">
                  Configure whether this position is an Internship or Full-Time role.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                &times;
              </button>
            </div>

            {modalError && (
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-center gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleModalSubmit} className="space-y-4 text-xs">
              {/* Type Switcher: Intern vs Full-Time */}
              <div>
                <label className="block text-slate-800 font-bold mb-1.5">
                  Role Classification (Intern or Full-Time) *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        type: 'INTERN',
                        stipendOrCtc: formData.stipendOrCtc || '₹6,000–₹12,000 / month',
                        duration: formData.duration || '3–6 Months',
                      })
                    }
                    className={`p-3 rounded-xl border-2 text-left transition flex items-center gap-3 cursor-pointer ${
                      formData.type === 'INTERN'
                        ? 'border-[#FF4400] bg-[#FFF4EE] text-[#FF4400] font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-2xl">🎓</span>
                    <div>
                      <span className="text-xs block">Internship</span>
                      <span className="text-[10px] font-normal text-slate-500">Stipend &amp; Term</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        type: 'FULL_TIME',
                        stipendOrCtc: formData.stipendOrCtc || '₹8–16 LPA',
                        duration: 'Permanent Full-Time',
                      })
                    }
                    className={`p-3 rounded-xl border-2 text-left transition flex items-center gap-3 cursor-pointer ${
                      formData.type === 'FULL_TIME'
                        ? 'border-sky-600 bg-sky-50 text-sky-800 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-2xl">💼</span>
                    <div>
                      <span className="text-xs block">Full-Time</span>
                      <span className="text-[10px] font-normal text-slate-500">Annual CTC &amp; Perks</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-slate-800 font-bold mb-1">
                  Position Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    formData.type === 'INTERN'
                      ? 'e.g. Frontend Web Development Intern (Paid)'
                      : 'e.g. Senior Full Stack Engineer'
                  }
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl font-semibold"
                />
              </div>

              {/* Department & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl bg-white"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design / UI / UX</option>
                    <option value="AI & Data">AI &amp; Data Engineering</option>
                    <option value="Operations">Operations / PM</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Lucknow / Hybrid"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl"
                  />
                </div>
              </div>

              {/* Compensation & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {formData.type === 'INTERN' ? 'Stipend Amount' : 'Annual CTC Range'}
                  </label>
                  <input
                    type="text"
                    placeholder={
                      formData.type === 'INTERN'
                        ? 'e.g. ₹6,000–₹12,000 / month'
                        : 'e.g. ₹8–16 LPA'
                    }
                    value={formData.stipendOrCtc}
                    onChange={(e) => setFormData({ ...formData, stipendOrCtc: e.target.value })}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {formData.type === 'INTERN' ? 'Internship Duration' : 'Employment Type'}
                  </label>
                  <input
                    type="text"
                    placeholder={formData.type === 'INTERN' ? 'e.g. 3–6 Months' : 'e.g. Full-Time'}
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Short Description / Key Skills</label>
                <textarea
                  rows={3}
                  placeholder="Key responsibilities and skills required for this role..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
                />
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F5F4EF] border border-[rgba(17,17,17,0.08)]">
                <div>
                  <span className="font-bold text-slate-900 block">Open for Applications</span>
                  <span className="text-[10px] text-slate-500">
                    If toggled on, candidates will be able to select and apply for this role on the portal.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isOpen}
                  onChange={(e) => setFormData({ ...formData, isOpen: e.target.checked })}
                  className="w-5 h-5 accent-[#FF4400] cursor-pointer"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-full text-slate-600 hover:bg-slate-100 transition font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-orange px-6 py-2.5 rounded-full font-semibold shadow-sm transition cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingRole ? 'Save Changes' : 'Publish Position'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
