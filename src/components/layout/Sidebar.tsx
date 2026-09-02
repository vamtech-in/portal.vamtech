'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User,
  CheckSquare,
  Briefcase,
  CalendarCheck,
  FileText,
  Megaphone,
  Users,
  FileSpreadsheet,
  Award,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface SidebarProps {
  role: 'employee' | 'admin';
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const employeeLinks = [
    { href: '/dashboard', label: 'My Profile', icon: User },
    { href: '/dashboard/tasks', label: 'My Tasks & Projects', icon: CheckSquare },
    { href: '/dashboard/portfolio', label: 'Portfolio & History', icon: Briefcase },
    { href: '/dashboard/attendance', label: 'Attendance & Leave', icon: CalendarCheck },
    { href: '/dashboard/documents', label: 'My Documents', icon: FileText },
    { href: '/dashboard/announcements', label: 'Announcements', icon: Megaphone },
  ];

  const hrLinks = [
    { href: '/hr', label: 'Candidate Pipeline', icon: Users },
    { href: '/hr/employees', label: 'Employee Directory', icon: Award },
    { href: '/hr/documents', label: 'Document Manager', icon: FileSpreadsheet },
    { href: '/hr/leaves', label: 'Leave Approvals', icon: CalendarCheck },
    { href: '/hr/announcements', label: 'Announcements Editor', icon: Megaphone },
  ];

  const links = role === 'admin' ? hrLinks : employeeLinks;

  return (
    <aside className="w-64 bg-[#050d18]/90 backdrop-blur-xl border-r border-white/10 shrink-0 min-h-[calc(100vh-69px)] p-4 shadow-2xl">
      <div className="mb-5 px-4 py-3 bg-[#0b1f3a]/80 border border-white/10 rounded-xl shadow-inner">
        <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
          {role === 'admin' ? 'HR Admin Panel' : 'Employee Workspace'}
        </div>
        <div className="font-display text-xs font-bold text-vamgold-400 mt-1">
          {role === 'admin' ? 'Management Gateway' : 'Self-Service Portal'}
        </div>
      </div>

      <nav className="space-y-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-[#132847] to-[#1b3861] text-vamgold-400 border border-vamgold-500/40 shadow-[0_0_20px_rgba(229,169,60,0.1)]'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-vamgold-400' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-vamgold-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Switch role quick toggle for admin users */}
      {role === 'admin' && (
        <div className="mt-8 pt-4 border-t border-white/10">
          <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider px-3 mb-2">View As</div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-all"
          >
            <User className="w-4 h-4 text-sky-400" />
            <span>My Employee View</span>
          </Link>
        </div>
      )}
    </aside>
  );
}
