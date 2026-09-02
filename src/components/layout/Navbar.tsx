'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, LogOut, User as UserIcon, Building2 } from 'lucide-react';
import { UserSession } from '@/lib/session';

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
    <header className="sticky top-0 z-40 bg-vamnavy-950/90 backdrop-blur-md border-b border-vamnavy-800 px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Brand & Subdomain Badge */}
        <div className="flex items-center gap-3">
          <Link href={session ? (session.role === 'admin' ? '/hr' : '/dashboard') : '/'} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-vamnavy-800 to-vamnavy-700 border border-vamnavy-600 flex items-center justify-center text-vamgold-400 group-hover:scale-105 transition">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white tracking-tight">VAMTech</span>
                <span className="text-[10px] font-mono font-bold bg-vamnavy-800 text-vamgold-400 px-2 py-0.5 rounded border border-vamgold-500/30">
                  PORTAL
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">portal.vamtech.in</p>
            </div>
          </Link>
        </div>

        {/* User Status / Quick Actions */}
        <div className="flex items-center gap-4">
          {!session ? (
            <div className="flex items-center gap-3 text-xs">
              <Link
                href="/status"
                className="text-slate-300 hover:text-white transition hidden sm:inline-block font-medium"
              >
                Track Status
              </Link>
              <Link
                href="/apply"
                className="text-slate-300 hover:text-white transition hidden sm:inline-block font-medium"
              >
                Apply for Job
              </Link>
              <Link
                href="/login"
                className="bg-vamgold-500 hover:bg-vamgold-400 text-vamnavy-950 font-bold px-4 py-2 rounded-lg transition"
              >
                Employee Login
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {/* Role Badge */}
              <div className="flex items-center gap-2 bg-vamnavy-900 border border-vamnavy-700 px-3 py-1.5 rounded-lg text-xs">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-300 font-medium">{session.name}</span>
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded uppercase ${
                    session.role === 'admin'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  }`}
                >
                  {session.role}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 bg-vamnavy-900 hover:bg-rose-500/10 border border-vamnavy-800 hover:border-rose-500/30 px-3 py-1.5 rounded-lg transition"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
