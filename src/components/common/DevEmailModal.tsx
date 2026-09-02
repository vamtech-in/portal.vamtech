'use client';

import React, { useState, useEffect } from 'react';
import { Mail, X, RefreshCw, Eye } from 'lucide-react';

interface DevEmail {
  id: string;
  to: string;
  subject: string;
  html: string;
  sentAt: string;
}

export default function DevEmailModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [emails, setEmails] = useState<DevEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<DevEmail | null>(null);

  const fetchOutbox = async () => {
    try {
      const res = await fetch('/api/public/outbox');
      if (res.ok) {
        const data = await res.json();
        setEmails(data.emails || []);
        if (data.emails && data.emails.length > 0 && !selectedEmail) {
          setSelectedEmail(data.emails[0]);
        }
      }
    } catch (e) {
      console.error('Failed to fetch outbox', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOutbox();
      const interval = setInterval(fetchOutbox, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          fetchOutbox();
        }}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-vamgold-500 hover:bg-vamgold-400 text-vamnavy-950 font-bold px-4 py-2.5 rounded-full shadow-xl transition-all hover:scale-105"
        title="View Transactional Email Outbox (Dev Mode)"
      >
        <Mail className="w-5 h-5" />
        <span>Dev Email Outbox ({emails.length})</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-vamnavy-900 border border-vamnavy-700 rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-vamnavy-700 bg-vamnavy-950">
              <div className="flex items-center gap-2 text-vamgold-400 font-bold text-lg">
                <Mail className="w-5 h-5" />
                <h3>Internal Portal Transactional Email Outbox</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchOutbox}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-vamnavy-800 transition"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-vamnavy-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden">
              {/* Email List Sidebar */}
              <div className="border-r border-vamnavy-700 overflow-y-auto max-h-[65vh] p-3 space-y-2 bg-vamnavy-950/50">
                {emails.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-sm">
                    No emails sent yet. Submit a job application, generate an offer letter, or onboard an employee to inspect emails!
                  </div>
                ) : (
                  emails.map((mail) => (
                    <button
                      key={mail.id}
                      onClick={() => setSelectedEmail(mail)}
                      className={`w-full text-left p-3 rounded-lg border transition ${
                        selectedEmail?.id === mail.id
                          ? 'bg-vamnavy-800 border-vamgold-500/50 text-white'
                          : 'bg-vamnavy-900/60 border-vamnavy-800 text-slate-300 hover:bg-vamnavy-800/50'
                      }`}
                    >
                      <div className="text-xs font-semibold text-vamgold-400 truncate">
                        To: {mail.to}
                      </div>
                      <div className="text-sm font-medium truncate mt-0.5">{mail.subject}</div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {new Date(mail.sentAt).toLocaleTimeString()} &bull; {new Date(mail.sentAt).toLocaleDateString()}
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Email HTML Preview Panel */}
              <div className="md:col-span-2 overflow-y-auto max-h-[65vh] p-6 bg-slate-950 flex flex-col">
                {selectedEmail ? (
                  <div>
                    <div className="border-b border-slate-800 pb-4 mb-4">
                      <h4 className="text-lg font-bold text-white mb-1">{selectedEmail.subject}</h4>
                      <div className="text-xs text-slate-400">
                        <span className="text-slate-300 font-semibold">To:</span> {selectedEmail.to} &bull;{' '}
                        <span className="text-slate-300 font-semibold">Sent:</span>{' '}
                        {new Date(selectedEmail.sentAt).toLocaleString()}
                      </div>
                    </div>
                    <div
                      className="bg-white rounded-lg p-2 text-slate-900 overflow-x-auto"
                      dangerouslySetInnerHTML={{ __html: selectedEmail.html }}
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-12">
                    <Eye className="w-10 h-10 mb-2 opacity-40" />
                    <p className="text-sm">Select an email from the left list to view HTML content</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
