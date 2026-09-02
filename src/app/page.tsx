import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { getSession } from '@/lib/session';
import { ShieldCheck, FileCheck, Search, LogIn, Building2, UserCheck, ArrowRight } from 'lucide-react';

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="min-h-screen flex flex-col bg-vamnavy-950 text-slate-100">
      <Navbar session={session} />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-12 flex flex-col items-center justify-center">
        {/* Banner Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-vamnavy-900 border border-vamgold-500/30 text-vamgold-400 text-xs font-mono font-medium mb-6">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>VAMTech Pvt Ltd Internal Gateway &bull; portal.vamtech.in</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-center text-white tracking-tight leading-tight max-w-3xl">
          Secure Internal Portal & Candidate Management
        </h1>
        <p className="text-base sm:text-lg text-slate-400 text-center max-w-2xl mt-4 leading-relaxed">
          Official platform for job applicants, candidate status tracking, employee workspace, and HR administration.
        </p>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-12">
          {/* Card 1: Job Applicants */}
          <div className="glass-panel p-6 flex flex-col justify-between hover:border-vamgold-500/40 transition group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4 group-hover:scale-110 transition">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Job Applicants</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Submit your job application to receive an official Candidate Reference Number (<span className="font-mono text-vamgold-400">VT-YYYY-XXX</span>).
              </p>
            </div>
            <Link
              href="/apply"
              className="inline-flex items-center justify-between w-full bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 font-semibold px-4 py-2.5 rounded-lg text-xs transition"
            >
              <span>Apply for Open Roles</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: Track Status */}
          <div className="glass-panel p-6 flex flex-col justify-between hover:border-vamgold-500/40 transition group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Check Application Status</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Lookup your real-time application status using your Candidate Reference Number and email address. No login required.
              </p>
            </div>
            <Link
              href="/status"
              className="inline-flex items-center justify-between w-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold px-4 py-2.5 rounded-lg text-xs transition"
            >
              <span>Track Application</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 3: Employee / HR Portal */}
          <div className="glass-panel p-6 flex flex-col justify-between hover:border-vamgold-500/40 transition group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Employees & HR</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Authorized VAMTech staff login for tasks, attendance, leave management, offer letter generation, and directory.
              </p>
            </div>
            <Link
              href={session ? (session.role === 'admin' ? '/hr' : '/dashboard') : '/login'}
              className="inline-flex items-center justify-between w-full bg-vamgold-500 hover:bg-vamgold-400 text-vamnavy-950 font-bold px-4 py-2.5 rounded-lg text-xs transition"
            >
              <span>{session ? 'Go to Workspace' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Demo Credentials Quick Guide */}
        <div className="w-full mt-12 p-6 glass-card rounded-xl border border-vamnavy-800">
          <h4 className="text-sm font-bold text-vamgold-400 uppercase tracking-wider mb-3">
            Quick Testing Credentials (Demo Mode)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-vamnavy-950/80 p-3 rounded-lg border border-vamnavy-800">
              <span className="font-semibold text-white block">HR Admin</span>
              <span className="text-slate-400 block mt-1 font-mono">admin@vamtech.in</span>
              <span className="text-slate-400 block font-mono">Admin@123</span>
            </div>
            <div className="bg-vamnavy-950/80 p-3 rounded-lg border border-vamnavy-800">
              <span className="font-semibold text-white block">Existing Employee</span>
              <span className="text-slate-400 block mt-1 font-mono">employee@vamtech.in</span>
              <span className="text-slate-400 block font-mono">Emp@123</span>
            </div>
            <div className="bg-vamnavy-950/80 p-3 rounded-lg border border-vamnavy-800">
              <span className="font-semibold text-white block">New Hire (Force Password Reset)</span>
              <span className="text-slate-400 block mt-1 font-mono">new.hire@vamtech.in</span>
              <span className="text-slate-400 block font-mono">Temp@123</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-vamnavy-800 py-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} VAMTech Pvt Ltd. Internal Application System. All rights reserved.
      </footer>
    </div>
  );
}
