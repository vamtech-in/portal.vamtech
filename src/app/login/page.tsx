'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { LogIn, Lock, Mail, AlertCircle, Shield, ArrowLeft } from 'lucide-react';

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

      // Redirect to target workspace or forced password reset
      router.push(data.redirectTo || '/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-vamnavy-950 text-slate-100">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Portal Home</span>
          </Link>

          <div className="glass-panel p-8 space-y-6 border-vamnavy-700 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-vamnavy-900 border border-vamgold-500/30 flex items-center justify-center text-vamgold-400 mx-auto">
                <Shield className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-extrabold text-white">VAMTech Staff Login</h1>
              <p className="text-xs text-slate-400">
                Secure access for employees and HR administrators on <span className="font-mono text-slate-300">portal.vamtech.in</span>
              </p>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 p-3.5 rounded-lg flex items-center gap-3 text-xs text-rose-300">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. employee@vamtech.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full glass-input pl-10 pr-3.5 py-2.5 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full glass-input pl-10 pr-3.5 py-2.5 rounded-lg"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-vamgold-500 hover:bg-vamgold-400 disabled:opacity-50 text-vamnavy-950 font-bold py-3 rounded-lg text-xs flex items-center justify-center gap-2 transition"
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

            <div className="pt-4 border-t border-vamnavy-800 text-center">
              <span className="text-[11px] text-slate-400 block mb-2">Need access or help?</span>
              <span className="text-[10px] text-slate-500 block">
                Contact HR Admin at <strong className="text-slate-300 font-mono">admin@vamtech.in</strong>
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
