'use client';

import React, { useState, useEffect } from 'react';
import { Award, Search, Plus, CheckSquare, Edit3, ShieldAlert, KeyRound } from 'lucide-react';

export default function EmployeeDirectoryPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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
        fetchEmployees();
      }
    } catch (e) {
      console.error('Assign task error', e);
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
        fetchEmployees();
      }
    } catch (e) {
      console.error('Save edit error', e);
    } finally {
      setSavingEdit(false);
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      (emp.refNumber && emp.refNumber.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-vamgold-400" />
            <span>Employee Directory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage staff accounts, assign engineering tasks, and update roles & departments.</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="glass-panel p-4 text-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search employee by name, email, or employee ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-input pl-9 pr-3 py-2 rounded-lg"
          />
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {loading ? (
          <div className="col-span-full text-center py-8 text-slate-400">Loading directory...</div>
        ) : filteredEmployees.length === 0 ? (
          <div className="col-span-full glass-panel p-8 text-center text-slate-500">No employees found.</div>
        ) : (
          filteredEmployees.map((emp) => (
            <div key={emp.id} className="glass-panel p-5 space-y-4 border-vamnavy-700 hover:border-vamgold-500/30 transition">
              <div className="flex items-start justify-between gap-3 border-b border-vamnavy-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-vamnavy-800 to-vamnavy-700 border border-vamgold-500/30 flex items-center justify-center text-vamgold-400 font-bold text-base">
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{emp.name}</h3>
                    <p className="text-[11px] text-slate-400">{emp.email}</p>
                  </div>
                </div>

                <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded border ${
                  emp.role === 'intern'
                    ? 'text-purple-300 bg-purple-950/40 border-purple-500/30'
                    : 'text-vamgold-400 bg-vamnavy-900 border-vamgold-500/30'
                }`}>
                  ID: {emp.refNumber || (emp.role === 'intern' ? 'INT' : 'EMP')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 font-medium block">Department</span>
                  <span className="text-white font-semibold">{emp.department || 'Engineering'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Designation</span>
                  <span className="text-white font-semibold">{emp.designation || 'Team Member'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Role Privilege</span>
                  <span className={`font-bold uppercase ${emp.role === 'admin' ? 'text-amber-400' : emp.role === 'intern' ? 'text-purple-400' : 'text-sky-400'}`}>
                    {emp.role}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Assigned Tasks</span>
                  <span className="text-slate-200 font-semibold">{emp.tasks ? emp.tasks.length : 0} Tasks</span>
                </div>
              </div>

              {emp.mustResetPassword && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded text-[10px] text-amber-300 flex items-center gap-1.5 font-semibold">
                  <KeyRound className="w-3.5 h-3.5 shrink-0" />
                  <span>Pending First Login Password Reset</span>
                </div>
              )}

              <div className="pt-2 flex items-center gap-2 border-t border-vamnavy-800">
                <button
                  onClick={() => {
                    setTaskModalUser(emp);
                  }}
                  className="flex-1 bg-vamnavy-900 hover:bg-vamnavy-800 border border-vamnavy-700 text-slate-200 py-1.5 rounded text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-sky-400" />
                  <span>Assign Task</span>
                </button>

                <button
                  onClick={() => {
                    setEditModalUser(emp);
                    setEditDept(emp.department || 'Engineering');
                    setEditDesignation(emp.designation || '');
                    setEditRole(emp.role);
                  }}
                  className="bg-vamgold-500 hover:bg-vamgold-400 text-vamnavy-950 font-bold px-3 py-1.5 rounded text-[11px] flex items-center gap-1 transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Role/Dept</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task Assign Modal */}
      {taskModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-vamnavy-900 border border-vamnavy-700 rounded-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Assign Engineering Task to {taskModalUser.name}</h3>

            <form onSubmit={handleAssignTask} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement Vercel Postgres Migration"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Task instructions and requirements..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Due Date</label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTaskModalUser(null)}
                  className="bg-vamnavy-800 text-slate-300 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigningTask}
                  className="bg-sky-500 text-vamnavy-950 font-bold px-4 py-2 rounded-lg"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-vamnavy-900 border border-vamnavy-700 rounded-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Edit Profile & Role for {editModalUser.name}</h3>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Department</label>
                <input
                  type="text"
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Designation</label>
                <input
                  type="text"
                  value={editDesignation}
                  onChange={(e) => setEditDesignation(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Portal Access Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full glass-input px-3 py-2 rounded-lg bg-vamnavy-950"
                >
                  <option value="employee">Employee (Standard Workspace)</option>
                  <option value="intern">Intern (Intern Workspace)</option>
                  <option value="admin">Admin / HR (Full Management Access)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalUser(null)}
                  className="bg-vamnavy-800 text-slate-300 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="bg-vamgold-500 text-vamnavy-950 font-bold px-4 py-2 rounded-lg"
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
