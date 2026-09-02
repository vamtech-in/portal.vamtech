import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { getSession } from '@/lib/session';
import { ArrowRight, ChevronRight } from 'lucide-react';

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 selection:bg-vamorange-500 selection:text-white">
      <Navbar session={session} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-12 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Copy matching vamtech.in */}
          <div className="lg:col-span-7 space-y-8">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-mono font-bold text-slate-700 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-vamorange-500 animate-pulse" />
              <span>CANDIDATE RECRUITMENT & APPLICATION PORTAL</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="font-display text-5xl sm:text-7xl font-black tracking-tight leading-[1.05] text-[#0f172a]">
                Software <br />
                Transform <br />
                <span className="text-[#f9572a]">Accelerate</span>
              </h1>
            </div>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed font-sans font-normal">
              Lucknow&apos;s premier custom software development agency application system. Submit your job application to receive a unique Candidate Reference Number (<span className="font-mono text-slate-900 font-bold">VT-2026-XXX</span>) and track hiring status.
            </p>

            {/* Public Action Buttons (Staff Login hidden from screen) */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/apply"
                className="btn-orange px-8 py-4 rounded-2xl text-sm font-bold flex items-center gap-2 transition"
              >
                <span>Start Your Application</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/status"
                className="btn-navy px-8 py-4 rounded-2xl text-sm font-bold transition"
              >
                Track Status (VT-2026-XXX)
              </Link>
            </div>
          </div>

          {/* Right Column: Code Window & Floating Badges */}
          <div className="lg:col-span-5 relative">
            {/* Top Floating Badge */}
            <div className="absolute -top-6 left-6 z-20 bg-white border border-slate-200/80 px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-vamorange-500 font-bold text-xs">
                ⚡
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">2-4 WEEKS</span>
                <span className="text-xs font-bold text-slate-800">Rapid Recruitment</span>
              </div>
            </div>

            {/* Code Window Card matching screenshot */}
            <div className="bg-[#0f172a] rounded-3xl p-6 shadow-2xl border border-slate-800 text-slate-200 space-y-4 font-mono text-xs relative overflow-hidden">
              {/* Window Controls */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <span className="text-[10px] text-slate-500">vamtech-portal-engine.ts</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">
                  LIVE
                </span>
              </div>

              {/* Code Snippet */}
              <div className="space-y-1.5 pt-2 text-[11px] leading-relaxed text-slate-300">
                <p className="text-slate-500">// Launching VAMTech Candidate Engine</p>
                <p>
                  <span className="text-rose-400 font-bold">const</span> candidate ={' '}
                  <span className="text-amber-300">createApplicant</span>({'{'}
                </p>
                <p className="pl-4">
                  ref: <span className="text-emerald-400">&apos;VT-2026-001&apos;</span>,
                </p>
                <p className="pl-4">
                  role: <span className="text-emerald-400">&apos;Full Stack Engineer&apos;</span>,
                </p>
                <p className="pl-4">
                  status: <span className="text-vamorange-500 font-bold">&apos;Applied&apos;</span>,
                </p>
                <p className="pl-4">
                  ownership: <span className="text-sky-400">100%</span>,
                </p>
                <p className="pl-4">
                  security: <span className="text-sky-400">&apos;Encrypted Verification&apos;</span>,
                </p>
                <p>{'});'}</p>
                <p className="text-slate-500 pt-2">// Deploy to production</p>
                <p className="text-emerald-400 font-bold">deployToPortal({'{ status: "Online" }'});</p>
              </div>
            </div>

            {/* Bottom Floating Badges matching screenshot */}
            <div className="flex items-center gap-3 mt-4">
              <div className="flex-1 bg-white border border-slate-200 px-4 py-3 rounded-2xl shadow-md flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-xs shrink-0">
                  &lt;/&gt;
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-800 block uppercase">DIRECT ACCESS</span>
                  <span className="text-[10px] text-slate-500 block">Fast Sync</span>
                </div>
              </div>

              <div className="flex-1 bg-white border border-slate-200 px-4 py-3 rounded-2xl shadow-md flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs shrink-0">
                  🛡️
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-800 block uppercase">100% SECURITY</span>
                  <span className="text-[10px] text-slate-500 block">Protected Records</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} VAMTech Pvt Ltd. Internal Application System. All rights reserved.
      </footer>
    </div>
  );
}
