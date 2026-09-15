'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FileSpreadsheet, Upload, Lock, ShieldCheck, FileText, UserCheck, Loader2, Check } from 'lucide-react';

export default function HRDocumentManagementPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Upload Form State
  const [selectedUser, setSelectedUser] = useState('');
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('Payslip');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg('');

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('category', 'documents');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload document file.');
      }

      setFileUrl(data.fileUrl);
      setFileName(data.fileName);
      setFileSize(data.fileSize);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'File upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fileUrl) {
      setErrorMsg('Please choose and upload a document file before submitting.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/hr/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser,
          title,
          type: docType,
          fileUrl,
          fileSize: fileSize || 'Document',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to issue document.');
      }

      setSuccessMsg('Document successfully uploaded and issued to employee vault!');
      setTitle('');
      setFileUrl('');
      setFileName('');
      setFileSize('');
    } catch (e: any) {
      console.error('Document upload error', e);
      setErrorMsg(e.message || 'Failed to upload document.');
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
        <h1 className="text-2xl font-black text-[#0f172a] flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-[#FF4400]" />
          <span>HR Document Management &amp; Vault Uploader</span>
        </h1>
        <p className="text-xs text-[#64748b] mt-1">
          Issue payslips, appointment contracts, and ID proofs to specific employees with strict server-side access controls.
        </p>
      </div>

      <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl flex items-center gap-3 text-xs text-emerald-900">
        <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600" />
        <span>
          <strong>Access Control Policy:</strong> Documents are stored in access-controlled storage (`/api/documents/[id]/download`) with signed URLs. Only the recipient employee or HR admin can view/download.
        </span>
      </div>

      <div className="bg-white border border-[#cbd5e1] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <h3 className="text-sm font-extrabold text-[#0f172a] border-b border-[#e2e8f0] pb-3">Upload / Issue New Confidential Document</h3>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl text-xs font-bold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#334155] font-semibold mb-1">Select Target Employee *</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full bg-[#f8fafc] border border-[#cbd5e1] focus:bg-white focus:border-[#FF4400] text-[#0f172a] px-3.5 py-2.5 rounded-xl outline-none transition"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.refNumber || 'Staff'}) - {emp.designation} ({emp.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#334155] font-semibold mb-1">Document Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. September 2026 Salary Payslip"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#cbd5e1] focus:bg-white focus:border-[#FF4400] text-[#0f172a] placeholder:text-[#94a3b8] px-3.5 py-2.5 rounded-xl outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[#334155] font-semibold mb-1">Document Type *</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#cbd5e1] focus:bg-white focus:border-[#FF4400] text-[#0f172a] px-3.5 py-2.5 rounded-xl outline-none transition"
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
            <label className="block text-[#334155] font-semibold mb-1">Upload File (PDF / Image) *</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              className="hidden"
            />
            <div className={`border border-dashed p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${fileUrl ? 'border-emerald-500 bg-emerald-50' : 'border-[#cbd5e1] bg-[#f8fafc]'}`}>
              <div className="flex items-center gap-3">
                <FileText className={`w-6 h-6 ${fileUrl ? 'text-emerald-600' : 'text-[#FF4400]'}`} />
                <div>
                  <span className="text-[#0f172a] font-bold block">
                    {fileUrl ? (fileName || 'Document File Attached') : 'Choose document file to upload'}
                  </span>
                  <span className="text-[11px] text-[#64748b]">
                    {fileUrl ? `${fileSize || 'Uploaded'} • Ready to issue` : 'PDF, DOC, DOCX, or Image up to 25MB'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className={`text-xs px-4 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${fileUrl ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-[#0f172a] hover:bg-black text-white'}`}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : fileUrl ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Change File</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Select File</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-orange text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm cursor-pointer disabled:opacity-50"
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
