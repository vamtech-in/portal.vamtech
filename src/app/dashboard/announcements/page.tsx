'use client';

import React, { useState, useEffect } from 'react';
import { Megaphone, Calendar, PartyPopper } from 'lucide-react';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="text-center py-12 text-slate-400 text-sm">Loading announcements & holiday calendar...</div>;
  }

  const companyNotices = announcements.filter((a) => !a.isHoliday);
  const holidays = announcements.filter((a) => a.isHoliday);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Announcements & Holiday Calendar</h1>
        <p className="text-xs text-slate-400 mt-1">Official VAMTech company notices, town hall schedules, and annual holidays.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        {/* Notices Column */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-white border-b border-vamnavy-800 pb-2 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-vamgold-400" />
            <span>Company Broadcasts & Bulletins</span>
          </h2>

          <div className="space-y-4">
            {companyNotices.length === 0 ? (
              <div className="glass-panel p-6 text-center text-slate-500">No company announcements posted.</div>
            ) : (
              companyNotices.map((item) => (
                <div key={item.id} className="glass-panel p-6 space-y-2 border-vamnavy-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white">{item.title}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Posted by {item.authorName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Holidays Column */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-white border-b border-vamnavy-800 pb-2 flex items-center gap-2">
            <PartyPopper className="w-4 h-4 text-amber-400" />
            <span>Official Holiday Calendar</span>
          </h2>

          <div className="space-y-3">
            {holidays.length === 0 ? (
              <div className="glass-panel p-6 text-center text-slate-500">No holiday entries listed.</div>
            ) : (
              holidays.map((h) => (
                <div key={h.id} className="glass-panel p-4 flex items-center justify-between border-amber-500/20">
                  <div>
                    <span className="font-bold text-white block">{h.title}</span>
                    <span className="text-[11px] text-slate-400">{h.content}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-vamnavy-900 border border-amber-500/30 px-2 py-1 rounded">
                    {h.holidayDate || 'TBD'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
