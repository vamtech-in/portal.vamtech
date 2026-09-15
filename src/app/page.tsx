import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { getSession } from '@/lib/session';
import { ArrowRight, ChevronRight } from 'lucide-react';

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F4EF] text-[#111111] selection:bg-[#FF4400] selection:text-white">
      <Navbar session={session} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-12 py-12 lg:py-20 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Hero Copy matching vamtech.in */}
          <div className="lg:col-span-7 space-y-8">
            {/* Editorial Badge matching vamtech.in */}
            <div className="editorial-badge shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#FF4400] animate-pulse" />
              <span>CAREERS &amp; TALENT PIPELINE &bull; LUCKNOW</span>
            </div>

            {/* Main Headline with vamtech.in signature typography */}
            <div className="space-y-3">
              <h1 className="text-5xl sm:text-7xl lg:text-[80px] font-black tracking-[-0.04em] leading-[1.04] text-[#111111]">
                Build software <br />
                <span className="text-[#FF4400]">that runs itself.</span>
              </h1>
              <p className="text-lg sm:text-xl text-[#6F6F6A] max-w-xl leading-relaxed font-normal pt-1">
                Join VAMTech&apos;s core engineering and product team. We build high-performance web systems, mobile apps, SaaS MVPs, and AI automations with speed, clarity, and no drama.
              </p>
            </div>

            {/* Public Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/apply"
                className="btn-orange px-8 py-4 text-sm font-semibold flex items-center gap-2.5 transition group"
              >
                <span>Apply for Open Roles</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/status"
                className="btn-navy px-8 py-4 text-sm font-semibold transition"
              >
                Track Status (VT-2026-XXX)
              </Link>
            </div>

            {/* Value Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[rgba(17,17,17,0.08)] max-w-lg">
              <div>
                <span className="font-mono text-xl sm:text-2xl font-bold text-[#111111] block">2–4 Wks</span>
                <span className="text-xs text-[#6F6F6A]">Sprint Cycles</span>
              </div>
              <div>
                <span className="font-mono text-xl sm:text-2xl font-bold text-[#111111] block">100%</span>
                <span className="text-xs text-[#6F6F6A]">Code Ownership</span>
              </div>
              <div>
                <span className="font-mono text-xl sm:text-2xl font-bold text-[#111111] block">HQ LKO</span>
                <span className="text-xs text-[#6F6F6A]">Global Clients</span>
              </div>
            </div>
          </div>

          {/* Right Column: Code Window & Floating Badges matching vamtech.in */}
          <div className="lg:col-span-5 relative">
            {/* Top Floating Badge */}
            <div className="absolute -top-5 left-6 z-20 bg-white border border-[rgba(17,17,17,0.1)] px-4 py-2.5 rounded-full shadow-md flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#FFF4EE] flex items-center justify-center text-[#FF4400] font-bold text-xs">
                ⚡
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-[#6F6F6A] block uppercase">RAPID RESPONSE</span>
                <span className="text-xs font-bold text-[#111111]">Direct Team Interview</span>
              </div>
            </div>

            {/* Dark Code Window Card matching vamtech.in dark palette */}
            <div className="bg-[#111111] rounded-3xl p-6 shadow-2xl border border-[rgba(255,255,255,0.1)] text-white space-y-4 font-mono text-xs relative overflow-hidden">
              {/* Window Controls */}
              <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.1)] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <span className="text-[11px] text-[#A3A39E]">vamtech-career-engine.ts</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">
                  ACTIVE
                </span>
              </div>

              {/* Code Snippet */}
              <div className="space-y-1.5 pt-2 text-[11px] leading-relaxed text-[#D6D3CC]">
                <p className="text-[#6F6F6A]">// Initialize candidate recruitment pipeline</p>
                <p>
                  <span className="text-[#FF6026] font-bold">const</span> applicant ={' '}
                  <span className="text-[#a7fccd]">registerCandidate</span>({'{'}
                </p>
                <p className="pl-4">
                  ref: <span className="text-amber-300">&apos;VT-2026-001&apos;</span>,
                </p>
                <p className="pl-4">
                  domain: <span className="text-amber-300">&apos;career.vamtech.in&apos;</span>,
                </p>
                <p className="pl-4">
                  role: <span className="text-emerald-400">&apos;Full Stack Engineer&apos;</span>,
                </p>
                <p className="pl-4">
                  status: <span className="text-[#FF4400] font-bold">&apos;Under Review&apos;</span>,
                </p>
                <p className="pl-4">
                  evaluation: <span className="text-sky-300">&apos;Direct Founder Call&apos;</span>,
                </p>
                <p>{'});'}</p>
                <p className="text-[#6F6F6A] pt-2">// Dispatched confirmation email</p>
                <p className="text-emerald-400 font-bold">notifyCandidate({'{ verified: true }'});</p>
              </div>
            </div>

            {/* Bottom Cards */}
            <div className="flex items-center gap-3 mt-4">
              <div className="flex-1 bg-white border border-[rgba(17,17,17,0.08)] px-4 py-3.5 rounded-2xl shadow-sm flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F5F4EF] border border-[rgba(17,17,17,0.06)] flex items-center justify-center text-[#111111] font-bold text-xs shrink-0">
                  &lt;/&gt;
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#111111] block">Real Production Code</span>
                  <span className="text-[10px] text-[#6F6F6A] block">Next.js, Node, Cloud</span>
                </div>
              </div>

              <div className="flex-1 bg-white border border-[rgba(17,17,17,0.08)] px-4 py-3.5 rounded-2xl shadow-sm flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFF4EE] border border-[#FF4400]/15 flex items-center justify-center text-[#FF4400] font-bold text-xs shrink-0">
                  ⚡
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#111111] block">High Velocity</span>
                  <span className="text-[10px] text-[#6F6F6A] block">Fast-Track Hiring</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-[rgba(17,17,17,0.08)] bg-[#ECEAE4]/50 py-8 px-6 lg:px-12 text-center text-xs text-[#6F6F6A]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} VAMTech Pvt Ltd &bull; career.vamtech.in &bull; Tiwariganj, Lucknow, UP 226028</p>
          <a
            href="https://vamtech.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#111111] hover:text-[#FF4400] font-semibold transition"
          >
            Visit VAMTech.in &rarr;
          </a>
        </div>
      </footer>
    </div>
  );
}
