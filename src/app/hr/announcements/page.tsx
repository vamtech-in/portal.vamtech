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
    return <div className="text-center py-12 text-slate-400 text-sm">Loading announcements editor...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-vamgold-400" />
          <span>Announcements & Holiday Calendar Editor</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Publish company-wide notices or register official holidays on the portal.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        {/* Form Column */}
        <div className="glass-panel p-6 space-y-4">
          <h2 className="text-sm font-bold text-white border-b border-vamnavy-800 pb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-vamgold-400" />
            <span>Publish Announcement / Holiday</span>
          </h2>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Q4 Company Strategy Townhall"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full glass-input px-3.5 py-2.5 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Announcement Body / Content *</label>
              <textarea
                rows={4}
                required
                placeholder="Provide complete notice details..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full glass-input px-3.5 py-2.5 rounded-lg"
              />
            </div>

            <div className="flex items-center gap-2 bg-vamnavy-950 p-3 rounded-lg border border-vamnavy-800">
              <input
                type="checkbox"
                id="isHolidayCheck"
                checked={isHoliday}
                onChange={(e) => setIsHoliday(e.target.checked)}
                className="w-4 h-4 accent-vamgold-500 rounded cursor-pointer"
              />
              <label htmlFor="isHolidayCheck" className="text-slate-300 font-semibold cursor-pointer">
                This is an Official Company Holiday
              </label>
            </div>

            {isHoliday && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Holiday Date *</label>
                <input
                  type="date"
                  required
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-lg"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-vamgold-500 hover:bg-vamgold-400 disabled:opacity-50 text-vamnavy-950 font-bold py-3 rounded-lg text-xs flex items-center justify-center gap-2 transition"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Publishing...' : 'Publish Announcement'}</span>
            </button>
          </form>
        </div>

        {/* Existing Announcements & Holidays */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-white border-b border-vamnavy-800 pb-3">Active Portal Announcements</h2>

          <div className="space-y-3">
            {announcements.map((item) => (
              <div key={item.id} className="glass-panel p-5 space-y-2 border-vamnavy-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{item.title}</h3>
                    {item.isHoliday && (
                      <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                        HOLIDAY ({item.holidayDate})
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
