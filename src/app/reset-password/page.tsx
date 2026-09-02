'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { KeyRound, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword, confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Password update failed');
      }

      router.push(data.redirectTo || '/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-vamnavy-950 text-slate-100">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="glass-panel p-8 space-y-6 border-amber-500/30 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                <KeyRound className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-extrabold text-white">First Login Password Reset</h1>
              <p className="text-xs text-slate-400">
                For security reasons, newly onboarded employee accounts are required to change their temporary password on first login.
              </p>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 p-3.5 rounded-lg flex items-center gap-3 text-xs text-rose-300">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleReset} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">New Permanent Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-lg"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-vamnavy-950 font-bold py-3 rounded-lg text-xs flex items-center justify-center gap-2 transition"
              >
                {loading ? (
                  <span>Updating Password...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Set New Password & Access Portal</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
