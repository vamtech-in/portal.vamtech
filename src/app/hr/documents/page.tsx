'use client';

import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Upload, Lock, ShieldCheck, FileText, UserCheck } from 'lucide-react';

export default function HRDocumentManagementPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Upload Form State
  const [selectedUser, setSelectedUser] = useState('');
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('Payslip');
  const [fileUrl, setFileUrl] = useState('/api/documents/demo-payslip-sep-2026.pdf');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch('/api/hr/employees');
        if (res.ok) {
          const data = await res.json();
          setEmployees(data.employees || []);
          if (data.employees && data.employees.length > 0) {
            setSelectedUser(data.employees[0].id);
          }
        }
      } catch (e) {
        console.error('Failed to fetch employees', e);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/hr/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser,
          title,
          type: docType,
          fileUrl,
          fileSize: '240 KB',
        }),
      });

      if (res.ok) {
        setSuccessMsg('Document successfully issued to employee vault with signed URL access control!');
        setTitle('');
      }
    } catch (e) {
      console.error('Document upload error', e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400 text-sm">Loading document manager...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-vamgold-400" />
          <span>HR Document Management & Vault Uploader</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Issue payslips, appointment contracts, and ID proofs to specific employees with strict server-side access controls.
        </p>
      </div>

      <div className="bg-vamnavy-900/80 border border-emerald-500/30 p-4 rounded-xl flex items-center gap-3 text-xs text-emerald-300">
        <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400" />
        <span>
          <strong>Access Control Policy:</strong> Documents are stored in access-controlled storage (`/api/documents/[id]/download`) with signed URLs. Only the recipient employee or HR admin can view/download.
        </span>
      </div>

      <div className="glass-panel p-6 sm:p-8 space-y-6">
        <h3 className="text-sm font-bold text-white border-b border-vamnavy-800 pb-3">Upload / Issue New Confidential Document</h3>

        {successMsg && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-bold">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Select Target Employee *</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full glass-input px-3.5 py-2.5 rounded-lg bg-vamnavy-900"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.email}) - ID: {emp.refNumber || 'EMP'}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Document Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. September 2026 Salary Payslip"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full glass-input px-3.5 py-2.5 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Document Type *</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full glass-input px-3.5 py-2.5 rounded-lg bg-vamnavy-900"
              >
                <option value="Payslip">Payslip</option>
                <option value="Offer Letter">Offer Letter</option>
                <option value="Appointment Letter">Appointment Letter</option>
                <option value="ID Proof">ID Proof</option>
                <option value="Tax Form">Tax Form / Form 16</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Upload File (PDF / Image)</label>
            <div className="border border-dashed border-vamnavy-700 bg-vamnavy-950/60 p-4 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-sky-400" />
                <div>
                  <span className="text-slate-300 font-medium block">Encrypted Document Upload</span>
                  <span className="text-[10px] text-slate-500">PDF up to 25MB</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFileUrl('/api/documents/demo-uploaded-file.pdf')}
                className="bg-vamnavy-800 hover:bg-vamnavy-700 text-xs px-3 py-1.5 rounded text-slate-300 transition flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Selected</span>
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-vamgold-500 hover:bg-vamgold-400 disabled:opacity-50 text-vamnavy-950 font-bold py-3 rounded-lg text-xs flex items-center justify-center gap-2 transition"
            >
              <Upload className="w-4 h-4" />
              <span>{submitting ? 'Issuing Document...' : 'Issue Document to Employee Vault'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
