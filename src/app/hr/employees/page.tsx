'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  CheckSquare,
  Edit3,
  UserMinus,
  KeyRound,
  AlertTriangle,
  X,
  Briefcase,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';

export default function EmployeeDirectoryPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'employee' | 'intern' | 'admin'>('all');
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Task Assign Modal State
  const [taskModalUser, setTaskModalUser] = useState<any | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [assigningTask, setAssigningTask] = useState(false);

  // Edit Role/Dept Modal State
  const [editModalUser, setEditModalUser] = useState<any | null>(null);
  const [editDept, setEditDept] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editRole, setEditRole] = useState<'employee' | 'admin' | 'intern'>('employee');
  const [savingEdit, setSavingEdit] = useState(false);

  // Offboard / Layoff / Resign / Remove Modal State
  const [offboardModalUser, setOffboardModalUser] = useState<any | null>(null);
  const [offboardReason, setOffboardReason] = useState<string>('Mock Data / Test Account');
  const [offboardNotes, setOffboardNotes] = useState('');
  const [confirmRemoval, setConfirmRemoval] = useState(false);
  const [submittingOffboard, setSubmittingOffboard] = useState(false);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/hr/employees');
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.employees || []);
      }
    } catch (e) {
      console.error('Failed to fetch employees', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskModalUser) return;
    setAssigningTask(true);

    try {
      const res = await fetch('/api/hr/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: taskModalUser.id,
          title: taskTitle,
          description: taskDesc,
          dueDate: taskDueDate,
        }),
      });

      if (res.ok) {
        setTaskModalUser(null);
        setTaskTitle('');
        setTaskDesc('');
        setTaskDueDate('');
        setActionNotice({ type: 'success', message: 'Engineering task successfully assigned!' });
        fetchEmployees();
      } else {
        const errData = await res.json();
        setActionNotice({ type: 'error', message: errData.error || 'Failed to assign task.' });
      }
    } catch (e) {
      console.error('Assign task error', e);
      setActionNotice({ type: 'error', message: 'Unexpected network error assigning task.' });
    } finally {
      setAssigningTask(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalUser) return;
    setSavingEdit(true);

    try {
      const res = await fetch('/api/hr/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: editModalUser.id,
          department: editDept,
          designation: editDesignation,
          role: editRole,
        }),
      });

      if (res.ok) {
        setEditModalUser(null);
        setActionNotice({ type: 'success', message: 'Employee profile updated successfully.' });
        fetchEmployees();
      } else {
        const errData = await res.json();
        setActionNotice({ type: 'error', message: errData.error || 'Failed to save changes.' });
      }
    } catch (e) {
      console.error('Save edit error', e);
      setActionNotice({ type: 'error', message: 'Unexpected network error updating profile.' });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirmOffboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offboardModalUser) return;
    setSubmittingOffboard(true);

    try {
      const res = await fetch('/api/hr/employees', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: offboardModalUser.id,
          reason: offboardReason,
          notes: offboardNotes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setActionNotice({
          type: 'success',
          message: data.message || `Employee ${offboardModalUser.name} removed successfully.`,
        });
        setOffboardModalUser(null);
        setOffboardReason('Mock Data / Test Account');
        setOffboardNotes('');
        setConfirmRemoval(false);
        fetchEmployees();
      } else {
        setActionNotice({
          type: 'error',
          message: data.error || 'Failed to offboard employee.',
        });
      }
    } catch (e) {
      console.error('Offboard employee error', e);
      setActionNotice({ type: 'error', message: 'Error processing employee removal.' });
    } finally {
      setSubmittingOffboard(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      (emp.refNumber && emp.refNumber.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = roleFilter === 'all' || emp.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const totalStaff = employees.length;
  const regularEmployees = employees.filter((e) => e.role === 'employee').length;
  const internCount = employees.filter((e) => e.role === 'intern').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
            <span className="p-2 rounded-xl bg-orange-100 text-vamorange-600">
              <Users className="w-5 h-5" />
            </span>
            <span>Employee Directory</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1.5 font-medium">
            Manage corporate staff, interns, role privileges, engineering tasks, and employee offboarding/layoffs.
          </p>
        </div>

        {/* Staff Metrics Quick Summary */}
        <div className="flex items-center gap-2">
          <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 shadow-sm">
            Total Staff: <strong className="text-slate-900">{totalStaff}</strong>
          </span>
          <span className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-700">
            Employees: <strong>{regularEmployees}</strong>
          </span>
          <span className="bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-700">
            Interns: <strong>{internCount}</strong>
          </span>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between transition ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionNotice.type === 'success' ? (
              <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{actionNotice.message}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="p-1 hover:bg-black/5 rounded text-slate-500 hover:text-slate-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Controls: Search & Filter */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search employee by name, email, or employee ID (e.g. VT-2026-001)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-vamorange-500 focus:ring-2 focus:ring-vamorange-200/50 pl-10 pr-4 py-2 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 font-medium transition"
          />
        </div>

        {/* Filter by Role Buttons */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {(['all', 'employee', 'intern', 'admin'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition shrink-0 ${
                roleFilter === role
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {role === 'all' ? 'All Roles' : `${role}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 font-medium">
            Loading directory accounts...
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 font-medium">
            No employees or staff members match your criteria.
          </div>
        ) : (
          filteredEmployees.map((emp) => {
            const isIntern = emp.role === 'intern';
            const isAdmin = emp.role === 'admin';
            const isProtectedAdmin =
              emp.refNumber === 'VT-HR-ADMIN' || emp.email.toLowerCase() === 'contactvamtech@gmail.com';

            return (
              <div
                key={emp.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Avatar, Name, Email, and ID Badge */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base shadow-sm shrink-0 ${
                          isAdmin
                            ? 'bg-amber-500 text-white'
                            : isIntern
                            ? 'bg-purple-600 text-white'
                            : 'bg-[#0f172a] text-white'
                        }`}
                      >
                        {emp.name ? emp.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm truncate">{emp.name}</h3>
                        <p className="text-[12px] text-slate-500 font-medium truncate">{emp.email}</p>
                      </div>
                    </div>

                    <span
                      className={`font-mono text-[11px] font-bold px-2.5 py-1 rounded-md border whitespace-nowrap ${
                        isIntern
                          ? 'text-purple-700 bg-purple-50 border-purple-200'
                          : isAdmin
                          ? 'text-amber-800 bg-amber-50 border-amber-200'
                          : 'text-blue-700 bg-blue-50 border-blue-200'
                      }`}
                    >
                      ID: {emp.refNumber || (isIntern ? 'INT' : 'EMP')}
                    </span>
                  </div>

                  {/* Employee Details Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs pt-3">
                    <div>
                      <span className="text-slate-500 text-[11px] font-medium block">Department</span>
                      <span className="text-slate-900 font-bold block truncate">
                        {emp.department || 'Engineering'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[11px] font-medium block">Designation</span>
                      <span className="text-slate-900 font-bold block truncate">
                        {emp.designation || 'Team Member'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[11px] font-medium block">Role Privilege</span>
                      <span
                        className={`inline-block font-bold text-[10px] uppercase px-2 py-0.5 rounded ${
                          isAdmin
                            ? 'bg-amber-100 text-amber-800'
                            : isIntern
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {emp.role}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[11px] font-medium block">Assigned Tasks</span>
                      <span className="text-slate-900 font-bold block">
                        {emp.tasks ? emp.tasks.length : 0} Tasks
                      </span>
                    </div>
                  </div>

                  {/* Pending Password Reset Badge */}
                  {emp.mustResetPassword && (
                    <div className="mt-3 bg-amber-50 border border-amber-200 p-2 rounded-lg text-[11px] text-amber-800 flex items-center gap-1.5 font-semibold">
                      <KeyRound className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Pending First Login Password Reset</span>
                    </div>
                  )}
                </div>

                {/* Card Actions: Assign Task, Edit, Offboard/Remove */}
                <div className="pt-3 flex items-center gap-2 border-t border-slate-100">
                  <button
                    onClick={() => setTaskModalUser(emp)}
                    className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-1.5 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>Assign Task</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditModalUser(emp);
                      setEditDept(emp.department || 'Engineering');
                      setEditDesignation(emp.designation || '');
                      setEditRole(emp.role);
                    }}
                    className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold px-2.5 py-1.5 rounded-lg text-[11px] flex items-center gap-1 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                    <span>Edit</span>
                  </button>

                  {/* Offboard / Layoff / Resign / Remove Button */}
                  {isProtectedAdmin ? (
                    <span
                      title="Primary HR Admin account is protected from deletion"
                      className="bg-slate-100 text-slate-400 font-semibold px-2.5 py-1.5 rounded-lg text-[11px] cursor-not-allowed"
                    >
                      Admin
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setOffboardModalUser(emp);
                        setConfirmRemoval(false);
                      }}
                      className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-semibold px-2.5 py-1.5 rounded-lg text-[11px] flex items-center gap-1 transition"
                      title="Fire, Layoff, Accept Resignation, or Delete Employee"
                    >
                      <UserMinus className="w-3.5 h-3.5 text-red-600" />
                      <span>Offboard</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Offboard / Layoff / Removal Modal */}
      {offboardModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl w-full max-w-lg p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-100 text-red-600">
                  <UserMinus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Offboard / Remove Employee</h3>
                  <p className="text-xs text-slate-500">Fire, layoff, record resignation, or remove mock data.</p>
                </div>
              </div>
              <button
                onClick={() => setOffboardModalUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Employee Summary Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 block text-sm">{offboardModalUser.name}</span>
                <span className="text-slate-500 block">{offboardModalUser.email}</span>
                <span className="text-slate-600 font-medium block mt-0.5">
                  {offboardModalUser.designation || 'Staff'} &bull; {offboardModalUser.department || 'General'}
                </span>
              </div>
              <span className="font-mono font-bold text-[11px] bg-white border border-slate-200 px-2 py-1 rounded text-slate-700">
                {offboardModalUser.refNumber || 'No ID'}
              </span>
            </div>

            <form onSubmit={handleConfirmOffboard} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Offboarding Reason / Category *</label>
                <select
                  value={offboardReason}
                  onChange={(e) => setOffboardReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                >
                  <option value="Mock Data / Test Account">Mock Data / Test Account Removal (Immediate Purge)</option>
                  <option value="Layoff / Involuntary Termination">Layoff / Involuntary Termination (Downsizing / Performance)</option>
                  <option value="Voluntary Resignation">Voluntary Resignation (Employee Notice / Resignation)</option>
                  <option value="Internship Completed">Internship / Contract Term Completed</option>
                  <option value="Mutual Separation">Mutual Separation Agreement</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">HR Notes & Remarks (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Cleared handover, assets returned, mock data removed..."
                  value={offboardNotes}
                  onChange={(e) => setOffboardNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              {/* Warning Callout */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2.5 text-red-800">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Removing this employee will immediately revoke their workspace login access, unassign all active tasks, and clean up their employee profile from the active directory.
                </p>
              </div>

              {/* Confirmation Checkbox */}
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={confirmRemoval}
                  onChange={(e) => setConfirmRemoval(e.target.checked)}
                  className="rounded border-slate-300 text-red-600 focus:ring-red-500 w-4 h-4"
                />
                <span>I confirm that I want to offboard and remove this employee.</span>
              </label>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOffboardModalUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!confirmRemoval || submittingOffboard}
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5 ${
                    confirmRemoval && !submittingOffboard
                      ? 'bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20'
                      : 'bg-slate-300 cursor-not-allowed text-slate-500'
                  }`}
                >
                  {submittingOffboard ? 'Removing...' : 'Confirm Offboard & Remove'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Assign Modal */}
      {taskModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Assign Task to {taskModalUser.name}</h3>
                <p className="text-xs text-slate-500">Employee ID: {taskModalUser.refNumber || 'Staff'}</p>
              </div>
              <button
                onClick={() => setTaskModalUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignTask} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement Next.js Auth Middleware"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Task instructions, sprint objectives, and requirements..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Due Date</label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTaskModalUser(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigningTask}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl shadow-md transition"
                >
                  {assigningTask ? 'Assigning...' : 'Assign Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role/Dept Modal */}
      {editModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Staff Profile: {editModalUser.name}</h3>
                <p className="text-xs text-slate-500">Employee ID: {editModalUser.refNumber || 'Staff'}</p>
              </div>
              <button
                onClick={() => setEditModalUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Department</label>
                <input
                  type="text"
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:bg-white focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Designation</label>
                <input
                  type="text"
                  value={editDesignation}
                  onChange={(e) => setEditDesignation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:bg-white focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Portal Access Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-slate-800"
                >
                  <option value="employee">Employee (Standard Workspace)</option>
                  <option value="intern">Intern (Intern Workspace)</option>
                  <option value="admin">Admin / HR (Full Management Access)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalUser(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="bg-slate-900 hover:bg-black text-white font-bold px-4 py-2 rounded-xl shadow-md transition"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
