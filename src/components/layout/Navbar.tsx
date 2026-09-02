'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
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
      router.push('/');
      router.refresh();
    } catch (e) {
      console.error('Logout error', e);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 lg:px-12 py-4 shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Brand Logo matching vamtech.in */}
        <Link href={session ? (session.role === 'admin' ? '/hr' : '/dashboard') : '/'} className="group">
          <VamtechLogo size="md" />
        </Link>

        {/* Public Candidate Navigation Links (Hidden login from screen) */}
        {!session ? (
          <nav className="flex items-center gap-6 sm:gap-8 text-xs sm:text-sm font-semibold text-slate-700">
            <Link href="/" className="hover:text-vamorange-500 transition">
              Home
            </Link>
            <Link href="/apply" className="hover:text-vamorange-500 transition">
              Apply
            </Link>
            <Link href="/status" className="hover:text-vamorange-500 transition">
              Track Status
            </Link>
          </nav>
        ) : (
          <div className="flex items-center gap-3">
            {/* Role Pill */}
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-800 font-semibold">{session.name}</span>
              <span
                className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full uppercase tracking-wider ${
                  session.role === 'admin'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-sky-100 text-sky-800 border border-sky-300'
                }`}
              >
                {session.role}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 px-3.5 py-1.5 rounded-full transition-all font-semibold"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
