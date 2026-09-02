import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 selection:bg-vamorange-500 selection:text-white">
      <Navbar session={session} />
      <div className="flex flex-1">
        <Sidebar role={session.role} />
        <main className="flex-1 p-6 lg:p-8 max-w-6xl overflow-x-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
