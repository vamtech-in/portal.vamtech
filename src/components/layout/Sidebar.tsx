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
    <aside className="w-64 bg-vamnavy-950/70 border-r border-vamnavy-800 shrink-0 min-h-[calc(100vh-61px)] p-4">
      <div className="mb-4 px-3 py-2 bg-vamnavy-900/80 border border-vamnavy-800 rounded-lg">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {role === 'admin' ? 'HR Admin Panel' : 'Employee Workspace'}
        </div>
        <div className="text-xs font-semibold text-vamgold-400 mt-0.5">
          {role === 'admin' ? 'Management Mode' : 'Self-Service Portal'}
        </div>
      </div>

      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                isActive
                  ? 'bg-vamnavy-800 text-vamgold-400 border border-vamgold-500/30 shadow-md'
                  : 'text-slate-300 hover:bg-vamnavy-900 hover:text-white'
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
        <div className="mt-8 pt-4 border-t border-vamnavy-800">
          <div className="text-[10px] text-slate-400 uppercase font-semibold px-3 mb-2">View As</div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-vamnavy-900 hover:text-white transition"
          >
            <User className="w-4 h-4 text-sky-400" />
            <span>My Employee View</span>
          </Link>
        </div>
      )}
    </aside>
  );
}
