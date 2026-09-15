'use client';

import React, { useState, useEffect } from 'react';
import { Megaphone, PartyPopper, Plus, Send } from 'lucide-react';

export default function HRAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isHoliday, setIsHoliday] = useState(false);
  const [holidayDate, setHolidayDate] = useState('');

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements');
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements || []);
      }
    } catch (e) {
      console.error('Failed to fetch announcements', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          isHoliday,
          holidayDate: isHoliday ? holidayDate : null,
        }),
      });

      if (res.ok) {
        setTitle('');
        setContent('');
        setIsHoliday(false);
        setHolidayDate('');
        fetchAnnouncements();
      }
    } catch (e) {
      console.error('Create announcement error', e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-[#64748b] text-sm">Loading announcements editor...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#0f172a] flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-[#FF4400]" />
          <span>Announcements &amp; Holiday Calendar Editor</span>
        </h1>
        <p className="text-xs text-[#64748b] mt-1">Publish company-wide notices or register official holidays on the portal.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        {/* Form Column */}
        <div className="bg-white border border-[#cbd5e1] rounded-2xl p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-extrabold text-[#0f172a] border-b border-[#e2e8f0] pb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#FF4400]" />
            <span>Publish Announcement / Holiday</span>
          </h2>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-[#334155] font-semibold mb-1">Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Q4 Company Strategy Townhall"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#cbd5e1] focus:bg-white focus:border-[#FF4400] text-[#0f172a] placeholder:text-[#94a3b8] px-3.5 py-2.5 rounded-xl outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[#334155] font-semibold mb-1">Announcement Body / Content *</label>
              <textarea
                rows={4}
                required
                placeholder="Provide complete notice details..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#cbd5e1] focus:bg-white focus:border-[#FF4400] text-[#0f172a] placeholder:text-[#94a3b8] px-3.5 py-2.5 rounded-xl outline-none transition"
              />
            </div>

            <div className="flex items-center gap-2 bg-[#f8fafc] p-3 rounded-xl border border-[#cbd5e1]">
              <input
                type="checkbox"
                id="isHolidayCheck"
                checked={isHoliday}
                onChange={(e) => setIsHoliday(e.target.checked)}
                className="w-4 h-4 accent-[#FF4400] rounded cursor-pointer"
              />
              <label htmlFor="isHolidayCheck" className="text-[#334155] font-semibold cursor-pointer">
                This is an Official Company Holiday
              </label>
            </div>

            {isHoliday && (
              <div>
                <label className="block text-[#334155] font-semibold mb-1">Holiday Date *</label>
                <input
                  type="date"
                  required
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] focus:bg-white focus:border-[#FF4400] text-[#0f172a] px-3.5 py-2.5 rounded-xl outline-none transition"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-orange text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Publishing...' : 'Publish Announcement'}</span>
            </button>
          </form>
        </div>

        {/* Existing Announcements & Holidays */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-extrabold text-[#0f172a] border-b border-[#e2e8f0] pb-3">Active Portal Announcements</h2>

          <div className="space-y-3">
            {announcements.length === 0 ? (
              <div className="bg-white border border-[#cbd5e1] rounded-2xl p-8 text-center text-[#64748b]">
                No announcements published yet.
              </div>
            ) : (
              announcements.map((item) => (
                <div key={item.id} className="bg-white border border-[#cbd5e1] hover:border-[#94a3b8] rounded-2xl p-5 space-y-2 shadow-sm transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#0f172a]">{item.title}</h3>
                      {item.isHoliday && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md">
                          HOLIDAY ({item.holidayDate})
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-[#64748b]">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-[#475569] leading-relaxed whitespace-pre-wrap">{item.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
