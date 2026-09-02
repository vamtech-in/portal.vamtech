'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Sparkles } from 'lucide-react';
import { UserSession } from '@/lib/session';
import VamtechLogo from '@/components/common/VamtechLogo';

interface NavbarProps {
  session?: UserSession | null;
}

export default function Navbar({ session }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error('Logout error', e);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#07111e]/90 backdrop-blur-xl border-b border-white/10 px-4 lg:px-8 py-3 shadow-2xl">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* VAMTech Brand Logo Header */}
        <Link href={session ? (session.role === 'admin' ? '/hr' : '/dashboard') : '/'} className="group">
          <VamtechLogo size="md" />
        </Link>

        {/* User Status / Quick Actions */}
        <div className="flex items-center gap-4">
          {!session ? (
            <div className="flex items-center gap-3 text-xs">
              <Link
                href="/status"
                className="text-slate-300 hover:text-white transition hidden sm:inline-block font-medium px-3 py-1.5 rounded-lg hover:bg-white/5"
              >
                Track Status
              </Link>
              <Link
                href="/apply"
                className="text-slate-300 hover:text-white transition hidden sm:inline-block font-medium px-3 py-1.5 rounded-lg hover:bg-white/5"
              >
                Apply for Job
              </Link>
              <Link
                href="/login"
                className="btn-primary px-4 py-2 rounded-xl text-xs font-bold transition"
              >
                Employee Login
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {/* Role Badge */}
              <div className="flex items-center gap-2.5 bg-[#0b1f3a]/80 border border-white/10 px-3.5 py-1.5 rounded-xl text-xs shadow-inner">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                <span className="text-slate-200 font-semibold">{session.name}</span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md uppercase tracking-wider ${
                    session.role === 'admin'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                      : 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                  }`}
                >
                  {session.role}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-300 bg-[#0b1f3a]/80 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 px-3.5 py-1.5 rounded-xl transition-all"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
