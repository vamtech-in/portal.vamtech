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
    return <div className="text-center py-12 text-[#64748b] text-sm">Loading leave applications...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#0f172a] flex items-center gap-2">
          <CalendarCheck className="w-6 h-6 text-[#FF4400]" />
          <span>Leave Requests &amp; HR Approvals</span>
        </h1>
        <p className="text-xs text-[#64748b] mt-1">Review pending employee leave applications and update approval statuses.</p>
      </div>

      {/* Pending Leave Requests Section */}
      <div className="bg-white border border-amber-300 rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-sm font-extrabold text-[#0f172a] flex items-center gap-2 border-b border-amber-100 pb-3">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Pending Leave Applications ({pendingLeaves.length})</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-[#334155]">
            <thead className="bg-[#f8fafc] text-[#475569] uppercase text-[10px] tracking-wider border-b border-[#e2e8f0]">
              <tr>
                <th className="px-4 py-3 font-bold">Employee</th>
                <th className="px-4 py-3 font-bold">Leave Type</th>
                <th className="px-4 py-3 font-bold">Duration</th>
                <th className="px-4 py-3 font-bold">Reason</th>
                <th className="px-4 py-3 text-right font-bold">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {pendingLeaves.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-[#94a3b8] italic">
                    No pending leave requests requiring review.
                  </td>
                </tr>
              ) : (
                pendingLeaves.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f8fafc] transition">
                    <td className="px-4 py-3 font-bold text-[#0f172a]">
                      {item.user.name}
                      <span className="block text-[10px] text-[#64748b] font-normal">{item.user.email}</span>
                    </td>
                    <td className="px-4 py-3 font-bold text-amber-700">{item.leaveType}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-[#0f172a]">
                      {item.startDate} to {item.endDate}
                    </td>
                    <td className="px-4 py-3 max-w-xs text-[#475569]">{item.reason}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setReviewModalLeave(item);
                          setReviewAction('Approved');
                        }}
                        className="btn-orange text-white font-bold px-3 py-1.5 rounded-lg text-[11px] transition shadow-xs cursor-pointer"
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
      <div className="bg-white border border-[#cbd5e1] rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-sm font-extrabold text-[#0f172a] border-b border-[#e2e8f0] pb-3">Reviewed Leave History</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-[#334155]">
            <thead className="bg-[#f8fafc] text-[#475569] uppercase text-[10px] tracking-wider border-b border-[#e2e8f0]">
              <tr>
                <th className="px-4 py-3 font-bold">Employee</th>
                <th className="px-4 py-3 font-bold">Type</th>
                <th className="px-4 py-3 font-bold">Dates</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Reviewed By</th>
                <th className="px-4 py-3 font-bold">Comment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {reviewedLeaves.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[#94a3b8] italic">
                    No historical leave applications recorded yet.
                  </td>
                </tr>
              ) : (
                reviewedLeaves.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f8fafc] transition">
                    <td className="px-4 py-3 font-bold text-[#0f172a]">{item.user.name}</td>
                    <td className="px-4 py-3 font-semibold text-[#334155]">{item.leaveType}</td>
                    <td className="px-4 py-3 font-mono text-[#475569]">{item.startDate} - {item.endDate}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                          item.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#64748b]">{item.reviewedBy || 'HR Admin'}</td>
                    <td className="px-4 py-3 text-[#64748b] italic">{item.reviewComment || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModalLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#cbd5e1] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-extrabold text-[#0f172a]">Review Leave Application ({reviewModalLeave.user.name})</h3>

            <div className="bg-[#f8fafc] border border-[#e2e8f0] p-3.5 rounded-xl text-xs space-y-1.5 text-[#334155]">
              <p><strong className="text-[#0f172a]">Leave Type:</strong> {reviewModalLeave.leaveType}</p>
              <p><strong className="text-[#0f172a]">Duration:</strong> {reviewModalLeave.startDate} to {reviewModalLeave.endDate}</p>
              <p><strong className="text-[#0f172a]">Reason:</strong> &ldquo;{reviewModalLeave.reason}&rdquo;</p>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#334155] font-semibold mb-1">Decision Action *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewAction('Approved')}
                    className={`py-2.5 rounded-xl font-bold border transition cursor-pointer ${
                      reviewAction === 'Approved'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-[#f8fafc] text-[#64748b] border-[#cbd5e1] hover:bg-[#f1f5f9]'
                    }`}
                  >
                    Approve Leave
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewAction('Rejected')}
                    className={`py-2.5 rounded-xl font-bold border transition cursor-pointer ${
                      reviewAction === 'Rejected'
                        ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                        : 'bg-[#f8fafc] text-[#64748b] border-[#cbd5e1] hover:bg-[#f1f5f9]'
                    }`}
                  >
                    Reject Leave
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[#334155] font-semibold mb-1">Reviewer Comment (Emailed to Employee)</label>
                <textarea
                  rows={3}
                  placeholder="Optional notes or feedback..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] focus:bg-white focus:border-[#FF4400] text-[#0f172a] px-3.5 py-2.5 rounded-xl outline-none transition placeholder:text-[#94a3b8]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalLeave(null)}
                  className="bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#475569] font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-orange text-white font-bold px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50"
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
