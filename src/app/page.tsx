import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { getSession } from '@/lib/session';
import { ShieldCheck, FileCheck, Search, LogIn, Building2, UserCheck, ArrowRight, Sparkles, ChevronRight } from 'lucide-react';

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="min-h-screen flex flex-col bg-[#07111e] text-slate-100 selection:bg-vamgold-500 selection:text-vamnavy-950">
      <Navbar session={session} />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-16 flex flex-col items-center justify-center">
        {/* Banner Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0b1f3a]/80 border border-vamgold-500/30 text-vamgold-400 text-xs font-mono font-medium mb-8 shadow-[0_0_20px_rgba(229,169,60,0.15)] animate-pulse">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>VAMTech Pvt Ltd Internal Gateway &bull; portal.vamtech.in</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-display text-4xl sm:text-6xl font-black text-center text-white tracking-tight leading-tight max-w-4xl">
          Engineered for Performance.{' '}
          <span className="bg-gradient-to-r from-vamgold-400 via-amber-300 to-vamgold-500 bg-clip-text text-transparent">
            Built for Talent.
          </span>
        </h1>
        <p className="text-base sm:text-xl text-slate-300 text-center max-w-2xl mt-6 leading-relaxed font-sans font-normal">
          Official VAMTech internal portal for candidate tracking, employee self-service workspace, and HR management.
        </p>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-16">
          {/* Card 1: Job Applicants */}
          <div className="glass-panel p-8 flex flex-col justify-between glass-panel-hover group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-6 group-hover:scale-110 group-hover:border-sky-400/50 shadow-[0_0_20px_rgba(56,189,248,0.15)] transition-all duration-300">
                <FileCheck className="w-7 h-7" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-3">Job Applicants</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Submit your application to receive an official Candidate Reference Number (<span className="font-mono text-vamgold-400">VT-YYYY-XXX</span>).
              </p>
            </div>
            <Link
              href="/apply"
              className="inline-flex items-center justify-between w-full bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 font-bold px-4 py-3 rounded-xl text-xs transition-all duration-200"
            >
              <span>Apply for Open Roles</span>
              <ChevronRight className="w-4 h-4 text-sky-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card 2: Track Status */}
          <div className="glass-panel p-8 flex flex-col justify-between glass-panel-hover group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 group-hover:border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.15)] transition-all duration-300">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-3">Check Status</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Lookup real-time hiring status using your Reference Number and Email. No login required.
              </p>
            </div>
            <Link
              href="/status"
              className="inline-flex items-center justify-between w-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold px-4 py-3 rounded-xl text-xs transition-all duration-200"
            >
              <span>Track Application</span>
              <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card 3: Employee / HR Portal */}
          <div className="glass-panel p-8 flex flex-col justify-between glass-panel-hover group border-vamgold-500/20">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 group-hover:border-emerald-400/50 shadow-[0_0_20px_rgba(52,211,153,0.15)] transition-all duration-300">
                <UserCheck className="w-7 h-7" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-3">Employees & HR</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Authorized staff login for tasks, attendance, leave management, offer letter generation, and directory.
              </p>
            </div>
            <Link
              href={session ? (session.role === 'admin' ? '/hr' : '/dashboard') : '/login'}
              className="inline-flex items-center justify-between w-full btn-primary px-4 py-3 rounded-xl text-xs transition-all duration-200"
            >
              <span>{session ? 'Go to Workspace' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4 text-vamnavy-950 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Demo Credentials Quick Guide */}
        <div className="w-full mt-16 p-8 glass-card rounded-2xl border border-white/10 shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-vamgold-400" />
            <h4 className="font-display text-sm font-bold text-vamgold-400 uppercase tracking-wider">
              Quick Testing Credentials (Demo Mode)
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-[#050d18] p-4 rounded-xl border border-white/10 hover:border-white/20 transition">
              <span className="font-bold text-white block">HR Admin</span>
              <span className="text-slate-400 block mt-1 font-mono">admin@vamtech.in</span>
              <span className="text-slate-400 block font-mono">Admin@123</span>
            </div>
            <div className="bg-[#050d18] p-4 rounded-xl border border-white/10 hover:border-white/20 transition">
              <span className="font-bold text-white block">Existing Employee</span>
              <span className="text-slate-400 block mt-1 font-mono">employee@vamtech.in</span>
              <span className="text-slate-400 block font-mono">Emp@123</span>
            </div>
            <div className="bg-[#050d18] p-4 rounded-xl border border-white/10 hover:border-white/20 transition">
              <span className="font-bold text-white block">New Hire (Force Password Reset)</span>
              <span className="text-slate-400 block mt-1 font-mono">new.hire@vamtech.in</span>
              <span className="text-slate-400 block font-mono">Temp@123</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} VAMTech Pvt Ltd. Internal Application System. All rights reserved.
      </footer>
    </div>
  );
}
