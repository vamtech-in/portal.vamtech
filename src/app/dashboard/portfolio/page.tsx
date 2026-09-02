'use client';

import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Calendar, Code, CheckCircle2 } from 'lucide-react';

export default function PortfolioPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [dateCompleted, setDateCompleted] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/user/portfolio');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (e) {
      console.error('Failed to fetch portfolio', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/user/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectTitle, description, skills, dateCompleted }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setProjectTitle('');
        setDescription('');
        setSkills('');
        setDateCompleted('');
        fetchHistory();
      }
    } catch (e) {
      console.error('Failed to add project', e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400 text-sm">Loading portfolio entries...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Portfolio & Work History</h1>
          <p className="text-xs text-slate-400 mt-1">Showcase your VAMTech engineering achievements, projects, and skills.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-vamgold-500 hover:bg-vamgold-400 text-vamnavy-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Project Entry</span>
        </button>
      </div>

      {/* History Grid */}
      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="glass-panel p-8 text-center text-slate-500 text-xs">
            No work history entries added yet. Click "Add Project Entry" to add your completed contributions!
          </div>
        ) : (
          history.map((item) => (
            <div key={item.id} className="glass-panel p-6 space-y-3 border-vamnavy-700 hover:border-vamgold-500/30 transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-vamgold-400" />
                  <span>{item.projectTitle}</span>
                </h3>
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Completed: {item.dateCompleted || 'Recent'}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>

              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Code className="w-3.5 h-3.5 text-sky-400" />
                  Tech Stack:
                </span>
                {item.skills.split(',').map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="text-[11px] font-mono bg-vamnavy-900 border border-vamnavy-700 text-slate-300 px-2 py-0.5 rounded"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-vamnavy-900 border border-vamnavy-700 rounded-xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Add New Work History Entry</h3>

            <form onSubmit={handleAddProject} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js Analytics Engine Integration"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description & Impact *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your role, key technical contributions, and outcome..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Skills & Technologies (comma separated) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. React, Next.js, TypeScript, PostgreSQL"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Date Completed</label>
                <input
                  type="date"
                  value={dateCompleted}
                  onChange={(e) => setDateCompleted(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-vamnavy-800 text-slate-300 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-vamgold-500 text-vamnavy-950 font-bold px-4 py-2 rounded-lg"
                >
                  {submitting ? 'Saving...' : 'Add to Portfolio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
