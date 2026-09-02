'use client';

import React, { useState, useEffect } from 'react';
import { CalendarCheck, Clock, Plus, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

export default function AttendanceLeavePage() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [leaveBalance, setLeaveBalance] = useState({ paid: 12, casual: 6, sick: 6 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Leave Form State
  const [leaveType, setLeaveType] = useState('Paid');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/user/attendance');
      if (res.ok) {
        const data = await res.json();
        setAttendance(data.attendance || []);
        setLeaveRequests(data.leaveRequests || []);
        if (data.leaveBalance) setLeaveBalance(data.leaveBalance);
      }
    } catch (e) {
      console.error('Failed to fetch attendance data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClockAction = async (action: 'check_in' | 'check_out') => {
    try {
      const res = await fetch('/api/user/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error('Clock action error', e);
    }
  };

  const handleRequestLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/user/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_leave',
          leaveType,
          startDate,
          endDate,
          reason,
        }),
      });

      if (res.ok) {
        setShowLeaveModal(false);
        setLeaveType('Paid');
        setStartDate('');
        setEndDate('');
        setReason('');
        fetchData();
      }
    } catch (e) {
      console.error('Leave request error', e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400 text-sm">Loading attendance & leave portal...</div>;
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = attendance.find((a) => a.date === todayStr);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Attendance & Leave Management</h1>
          <p className="text-xs text-slate-400 mt-1">Daily check-in/out logging, leave balances, and leave request applications.</p>
        </div>

        <button
          onClick={() => setShowLeaveModal(true)}
          className="bg-vamgold-500 hover:bg-vamgold-400 text-vamnavy-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Daily Clock Widget & Leave Balances */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        {/* Clock Card */}
        <div className="glass-panel p-5 space-y-3 border-emerald-500/20">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Daily Check-In/Out</span>
          <div className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            {!todayRecord ? (
              <button
                onClick={() => handleClockAction('check_in')}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-vamnavy-950 font-bold py-2 rounded text-xs transition"
              >
                Check In Now
              </button>
            ) : !todayRecord.checkOut ? (
              <button
                onClick={() => handleClockAction('check_out')}
                className="w-full bg-amber-500 hover:bg-amber-400 text-vamnavy-950 font-bold py-2 rounded text-xs transition"
              >
                Check Out ({todayRecord.checkIn})
              </button>
            ) : (
              <span className="w-full text-center py-2 bg-vamnavy-900 border border-emerald-500/30 text-emerald-400 font-bold rounded">
                Checked Out ({todayRecord.checkOut})
              </span>
            )}
          </div>
        </div>

        {/* Leave Balance 1: Paid */}
        <div className="glass-panel p-5 space-y-2 border-sky-500/20">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Paid Leave Balance</span>
          <div className="text-3xl font-extrabold text-sky-400">{leaveBalance.paid} Days</div>
          <span className="text-[10px] text-slate-400">Available out of 12 Annual</span>
        </div>

        {/* Leave Balance 2: Casual */}
        <div className="glass-panel p-5 space-y-2 border-purple-500/20">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Casual Leave Balance</span>
          <div className="text-3xl font-extrabold text-purple-400">{leaveBalance.casual} Days</div>
          <span className="text-[10px] text-slate-400">Available out of 6 Annual</span>
        </div>

        {/* Leave Balance 3: Sick */}
        <div className="glass-panel p-5 space-y-2 border-amber-500/20">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sick Leave Balance</span>
          <div className="text-3xl font-extrabold text-amber-400">{leaveBalance.sick} Days</div>
          <span className="text-[10px] text-slate-400">Available out of 6 Annual</span>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-sm font-bold text-white border-b border-vamnavy-800 pb-3">My Leave Applications & Status</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-vamnavy-900 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Leave Type</th>
                <th className="px-4 py-3">Start Date</th>
                <th className="px-4 py-3">End Date</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">HR Review Comment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vamnavy-800">
              {leaveRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-500 italic">
                    No leave requests submitted yet.
                  </td>
                </tr>
              ) : (
                leaveRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-vamnavy-900/50">
                    <td className="px-4 py-3 font-semibold text-white">{req.leaveType}</td>
                    <td className="px-4 py-3 font-mono">{req.startDate}</td>
                    <td className="px-4 py-3 font-mono">{req.endDate}</td>
                    <td className="px-4 py-3 max-w-xs truncate">{req.reason}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          req.status === 'Approved'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : req.status === 'Rejected'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 italic">
                      {req.reviewComment || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Application Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-vamnavy-900 border border-vamnavy-700 rounded-xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Apply for Leave</h3>

            <form onSubmit={handleRequestLeave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Leave Type *</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-lg bg-vamnavy-950"
                >
                  <option value="Paid">Paid Leave ({leaveBalance.paid} remaining)</option>
                  <option value="Casual">Casual Leave ({leaveBalance.casual} remaining)</option>
                  <option value="Sick">Sick Leave ({leaveBalance.sick} remaining)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full glass-input px-3.5 py-2.5 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full glass-input px-3.5 py-2.5 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reason for Leave *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide brief details for your leave request..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="bg-vamnavy-800 text-slate-300 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-vamgold-500 text-vamnavy-950 font-bold px-4 py-2 rounded-lg"
                >
                  {submitting ? 'Submitting...' : 'Submit Leave Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
