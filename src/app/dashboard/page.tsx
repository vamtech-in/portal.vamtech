'use client';

import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Building2, Calendar, ShieldCheck, Edit3, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function EmployeeProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setPhone(data.user.phone || '');
        setEmergencyContact(data.user.emergencyContact || '');
      }
    } catch (e) {
      console.error('Failed to fetch profile', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, emergencyContact }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setIsEditing(false);
        setMsg({ type: 'success', text: 'Contact details updated successfully!' });
      } else {
        throw new Error('Failed to update details');
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to save changes.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400 text-sm">Loading employee profile...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="glass-panel p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-vamgold-500/20">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-vamnavy-800 to-vamnavy-700 border-2 border-vamgold-500/40 flex items-center justify-center text-vamgold-400 text-2xl font-bold uppercase shadow-xl">
            {profile.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-white">{profile.name}</h1>
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-vamnavy-900 text-vamgold-400 rounded border border-vamgold-500/30">
                ID: {profile.refNumber || 'VT-EMPLOYEE'}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-1">
              {profile.designation || 'Team Member'} &bull; <span className="text-sky-400">{profile.department || 'Engineering'}</span>
            </p>
            <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-2">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {profile.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Joined {profile.joiningDate || 'Feb 2026'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-vamnavy-900 hover:bg-vamnavy-800 border border-vamnavy-700 text-slate-200 font-semibold px-4 py-2 rounded-lg text-xs flex items-center gap-2 transition"
        >
          <Edit3 className="w-4 h-4 text-vamgold-400" />
          <span>{isEditing ? 'Cancel Edit' : 'Edit Contact Info'}</span>
        </button>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 text-xs ${
            msg.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}
        >
          {msg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Fixed HR Details (Read-only for employee) */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-vamnavy-800 pb-3 text-white font-bold text-sm">
            <Building2 className="w-4 h-4 text-sky-400" />
            <h3>Official HR & Organization Details</h3>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-slate-400 font-medium block">Employee Reference ID</span>
              <span className="text-slate-100 font-mono font-bold">{profile.refNumber || 'VT-2026-001'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Assigned Department</span>
              <span className="text-slate-100 font-semibold">{profile.department || 'Engineering'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Official Designation</span>
              <span className="text-slate-100 font-semibold">{profile.designation || 'Full Stack Engineer'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Employment Role</span>
              <span className="text-amber-400 font-semibold uppercase">{profile.role}</span>
            </div>
          </div>
        </div>

        {/* Self-Editable Contact Details */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-vamnavy-800 pb-3 text-white font-bold text-sm">
            <Phone className="w-4 h-4 text-emerald-400" />
            <h3>Contact & Emergency Details (Self-Editable)</h3>
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full glass-input px-3 py-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Emergency Contact Info</label>
                <textarea
                  rows={2}
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="e.g. Father - +91 98111 22233"
                  className="w-full glass-input px-3 py-2 rounded-lg"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-vamnavy-950 font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Updated Contact Details'}</span>
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              <div>
                <span className="text-slate-400 font-medium block">Direct Phone</span>
                <span className="text-slate-100 font-semibold">{profile.phone || 'Not provided yet'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Emergency Contact</span>
                <span className="text-slate-100 font-semibold">{profile.emergencyContact || 'Not provided yet'}</span>
              </div>
              <p className="text-[10px] text-slate-500 pt-2 border-t border-vamnavy-800">
                Note: Role and department changes can only be performed by HR Admin.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
