'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import VamtechLogo from '@/components/common/VamtechLogo';
import { LogIn, Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push(data.redirectTo || '/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 selection:bg-vamorange-500 selection:text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Portal Home</span>
          </Link>

          <div className="glass-panel p-8 space-y-6 shadow-xl border-slate-200">
            <div className="text-center space-y-3 flex flex-col items-center">
              <VamtechLogo size="lg" showSubtext={false} />
              <div className="pt-2">
                <h1 className="font-display text-2xl font-black text-[#0f172a]">Staff Portal Login</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Authorized access for employees and HR administrators on <span className="font-mono text-slate-700">portal.vamtech.in</span>
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl flex items-center gap-3 text-xs text-rose-600 font-semibold">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. employee@vamtech.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full glass-input pl-10 pr-3.5 py-2.5 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full glass-input pl-10 pr-3.5 py-2.5 rounded-xl"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-orange font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                {loading ? (
                  <span>Authenticating Session...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Workspace</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center">
              <span className="text-[11px] text-slate-500 block mb-1">Need access or assistance?</span>
              <span className="text-[10px] text-slate-600 block font-medium">
                Contact HR Admin at <strong className="text-[#0f172a] font-mono">admin@vamtech.in</strong>
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
