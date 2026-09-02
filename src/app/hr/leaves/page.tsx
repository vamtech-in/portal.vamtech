'use client';

import React, { useState, useEffect } from 'react';
import { CalendarCheck, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

export default function HRLeaveApprovalsPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalLeave, setReviewModalLeave] = useState<any | null>(null);
  const [reviewAction, setReviewAction] = useState<'Approved' | 'Rejected'>('Approved');
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchLeaves = async () => {
    try {
      const res = await fetch('/api/hr/leaves');
      if (res.ok) {
        const data = await res.json();
        setLeaves(data.leaves || []);
      }
    } catch (e) {
      console.error('Failed to fetch leave requests', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalLeave) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/hr/leaves', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaveId: reviewModalLeave.id,
          status: reviewAction,
          reviewComment,
        }),
      });

      if (res.ok) {
        setReviewModalLeave(null);
        setReviewComment('');
        fetchLeaves();
      }
    } catch (e) {
      console.error('Review submit error', e);
    } finally {
      setSubmitting(false);
    }
  };

  const pendingLeaves = leaves.filter((l) => l.status === 'Pending');
  const reviewedLeaves = leaves.filter((l) => l.status !== 'Pending');

  if (loading) {
    return <div className="text-center py-12 text-slate-400 text-sm">Loading leave requests...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <CalendarCheck className="w-6 h-6 text-vamgold-400" />
          <span>Leave Requests & HR Approvals</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Review pending employee leave applications and update approval statuses.</p>
      </div>

      {/* Pending Leave Requests Section */}
      <div className="glass-panel p-6 space-y-4 border-amber-500/30">
        <h2 className="text-sm font-bold text-amber-400 flex items-center gap-2 border-b border-vamnavy-800 pb-3">
          <Clock className="w-4 h-4" />
          <span>Pending Leave Applications ({pendingLeaves.length})</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-vamnavy-900 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Leave Type</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vamnavy-800">
              {pendingLeaves.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-500 italic">
                    No pending leave requests requiring review.
                  </td>
                </tr>
              ) : (
                pendingLeaves.map((item) => (
                  <tr key={item.id} className="hover:bg-vamnavy-900/50">
                    <td className="px-4 py-3 font-semibold text-white">
                      {item.user.name}
                      <span className="block text-[10px] text-slate-400 font-normal">{item.user.email}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-vamgold-400">{item.leaveType}</td>
                    <td className="px-4 py-3 font-mono">
                      {item.startDate} to {item.endDate}
                    </td>
                    <td className="px-4 py-3 max-w-xs">{item.reason}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setReviewModalLeave(item);
                          setReviewAction('Approved');
                        }}
                        className="bg-vamgold-500 hover:bg-vamgold-400 text-vamnavy-950 font-bold px-3 py-1.5 rounded text-[11px] transition shadow"
                      >
                        Review Application
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Reviewed Leaves */}
      <div className="glass-panel p-6 space-y-4">
        <h2 className="text-sm font-bold text-white border-b border-vamnavy-800 pb-3">Reviewed Leave History</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-vamnavy-900 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Reviewed By</th>
                <th className="px-4 py-3">Comment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vamnavy-800">
              {reviewedLeaves.map((item) => (
                <tr key={item.id} className="hover:bg-vamnavy-900/50">
                  <td className="px-4 py-3 font-semibold text-white">{item.user.name}</td>
                  <td className="px-4 py-3">{item.leaveType}</td>
                  <td className="px-4 py-3 font-mono">{item.startDate} - {item.endDate}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.status === 'Approved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{item.reviewedBy || 'HR Admin'}</td>
                  <td className="px-4 py-3 text-slate-400 italic">{item.reviewComment || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModalLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-vamnavy-900 border border-vamnavy-700 rounded-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Review Leave Application ({reviewModalLeave.user.name})</h3>

            <div className="bg-vamnavy-950 p-3 rounded-lg text-xs space-y-1">
              <p><strong className="text-slate-300">Leave Type:</strong> {reviewModalLeave.leaveType}</p>
              <p><strong className="text-slate-300">Duration:</strong> {reviewModalLeave.startDate} to {reviewModalLeave.endDate}</p>
              <p><strong className="text-slate-300">Reason:</strong> &ldquo;{reviewModalLeave.reason}&rdquo;</p>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Decision Action *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewAction('Approved')}
                    className={`py-2 rounded-lg font-bold border transition ${
                      reviewAction === 'Approved'
                        ? 'bg-emerald-500 text-vamnavy-950 border-emerald-400'
                        : 'bg-vamnavy-950 text-slate-400 border-vamnavy-800'
                    }`}
                  >
                    Approve Leave
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewAction('Rejected')}
                    className={`py-2 rounded-lg font-bold border transition ${
                      reviewAction === 'Rejected'
                        ? 'bg-rose-500 text-white border-rose-400'
                        : 'bg-vamnavy-950 text-slate-400 border-vamnavy-800'
                    }`}
                  >
                    Reject Leave
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reviewer Comment (Emailed to Employee)</label>
                <textarea
                  rows={3}
                  placeholder="Optional notes or feedback..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalLeave(null)}
                  className="bg-vamnavy-800 text-slate-300 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-vamgold-500 text-vamnavy-950 font-bold px-4 py-2 rounded-lg"
                >
                  {submitting ? 'Submitting...' : 'Submit HR Decision & Email Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
