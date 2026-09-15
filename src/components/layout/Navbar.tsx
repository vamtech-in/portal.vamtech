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
    <header className="sticky top-0 z-40 bg-[#F5F4EF]/90 backdrop-blur-md border-b border-[rgba(17,17,17,0.08)] px-6 lg:px-12 py-3.5 transition-all">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Brand Logo matching vamtech.in */}
        <Link href={session ? (session.role === 'admin' ? '/hr' : '/dashboard') : '/'} className="group flex items-center">
          <VamtechLogo size="md" />
        </Link>

        {/* Public Candidate Navigation Links */}
        {!session ? (
          <div className="flex items-center gap-6 sm:gap-8">
            <nav className="flex items-center gap-6 sm:gap-8 text-xs sm:text-sm font-medium text-[#4A4A46]">
              <Link href="/" className="hover:text-[#111111] transition">
                Home
              </Link>
              <Link href="/apply" className="hover:text-[#111111] transition">
                Open Roles
              </Link>
              <Link href="/status" className="hover:text-[#111111] transition">
                Track Application
              </Link>
            </nav>
            <Link
              href="/apply"
              className="hidden sm:inline-flex items-center justify-center bg-[#111111] hover:bg-[#262626] text-white text-xs font-semibold px-5 py-2.5 rounded-full transition-all shadow-sm"
            >
              Apply Now
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {/* Role Pill */}
            <div className="flex items-center gap-2 bg-white border border-[rgba(17,17,17,0.12)] px-3.5 py-1.5 rounded-full text-xs shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[#111111] font-semibold">{session.name}</span>
              <span
                className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full uppercase tracking-wider ${
                  session.role === 'admin'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : session.role === 'intern'
                    ? 'bg-purple-100 text-purple-800 border border-purple-300'
                    : 'bg-stone-100 text-stone-800 border border-stone-300'
                }`}
              >
                {session.role}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-[#6F6F6A] hover:text-rose-600 bg-white hover:bg-rose-50 border border-[rgba(17,17,17,0.12)] hover:border-rose-200 px-3.5 py-1.5 rounded-full transition-all font-semibold"
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
