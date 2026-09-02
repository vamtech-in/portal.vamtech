'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Download, ShieldCheck, FileCheck, Eye, Lock } from 'lucide-react';

export default function MyDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/user/documents');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (e) {
      console.error('Failed to fetch documents', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-slate-400 text-sm">Loading employee document vault...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">My Employee Documents</h1>
          <p className="text-xs text-slate-400 mt-1">Access-controlled confidential document vault (Offer Letters, Appointment Contracts, Payslips).</p>
        </div>
      </div>

      <div className="bg-vamnavy-900/80 border border-emerald-500/30 p-4 rounded-xl flex items-center gap-3 text-xs text-emerald-300">
        <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400" />
        <span>
          <strong>Encrypted & Access Controlled:</strong> Documents are restricted to your session. URLs use authenticated signed tokens and are blocked from search engines.
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        {documents.length === 0 ? (
          <div className="col-span-full glass-panel p-8 text-center text-slate-500">
            No official documents uploaded yet. Contact HR to issue your payslips or employment letters.
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="glass-panel p-5 space-y-4 border-vamnavy-700 hover:border-vamgold-500/40 transition">
              <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-vamgold-400 bg-vamnavy-900 px-2 py-0.5 rounded border border-vamgold-500/30 uppercase">
                  {doc.type}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-white text-sm truncate">{doc.title}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Uploaded by: {doc.uploadedBy} &bull; {doc.fileSize || 'PDF'}
                </p>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <a
                  href={`/api/documents/${doc.id}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-vamnavy-900 hover:bg-vamnavy-800 border border-vamnavy-700 text-slate-200 font-semibold py-2 rounded text-[11px] flex items-center justify-center gap-1.5 transition"
                >
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  <span>View PDF</span>
                </a>
                <a
                  href={`/api/documents/${doc.id}/download`}
                  download
                  className="bg-vamgold-500 hover:bg-vamgold-400 text-vamnavy-950 font-bold px-3 py-2 rounded text-[11px] flex items-center gap-1 transition"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
