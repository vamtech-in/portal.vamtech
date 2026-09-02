'use client';

import React, { useState, useEffect } from 'react';
import { CheckSquare, Clock, Calendar, AlertCircle } from 'lucide-react';

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/user/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (e) {
      console.error('Failed to fetch tasks', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/user/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status: newStatus }),
      });

      if (res.ok) {
        fetchTasks();
      }
    } catch (e) {
      console.error('Failed to update task status', e);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400 text-sm">Loading assigned tasks...</div>;
  }

  const todoTasks = tasks.filter((t) => t.status === 'To Do');
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress');
  const doneTasks = tasks.filter((t) => t.status === 'Done');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">My Tasks & Projects</h1>
          <p className="text-xs text-slate-400 mt-1">Track your assigned engineering deliverables and update work status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        {/* To Do Column */}
        <div className="glass-panel p-5 space-y-4 border-amber-500/20">
          <div className="flex items-center justify-between border-b border-vamnavy-800 pb-3">
            <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>To Do ({todoTasks.length})</span>
            </h3>
          </div>

          <div className="space-y-3">
            {todoTasks.length === 0 ? (
              <p className="text-slate-500 italic py-4 text-center">No tasks pending</p>
            ) : (
              todoTasks.map((t) => (
                <div key={t.id} className="bg-vamnavy-900 border border-vamnavy-800 p-4 rounded-xl space-y-2">
                  <h4 className="font-semibold text-white text-sm">{t.title}</h4>
                  <p className="text-slate-400 leading-relaxed">{t.description}</p>
                  <div className="flex items-center justify-between pt-2 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-amber-400" />
                      Due: {t.dueDate || 'No date'}
                    </span>
                    <button
                      onClick={() => updateTaskStatus(t.id, 'In Progress')}
                      className="bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold px-2 py-1 rounded transition"
                    >
                      Start Task &rarr;
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="glass-panel p-5 space-y-4 border-sky-500/20">
          <div className="flex items-center justify-between border-b border-vamnavy-800 pb-3">
            <h3 className="font-bold text-sky-400 text-sm flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              <span>In Progress ({inProgressTasks.length})</span>
            </h3>
          </div>

          <div className="space-y-3">
            {inProgressTasks.length === 0 ? (
              <p className="text-slate-500 italic py-4 text-center">No active tasks in progress</p>
            ) : (
              inProgressTasks.map((t) => (
                <div key={t.id} className="bg-vamnavy-900 border border-sky-500/30 p-4 rounded-xl space-y-2">
                  <h4 className="font-semibold text-white text-sm">{t.title}</h4>
                  <p className="text-slate-400 leading-relaxed">{t.description}</p>
                  <div className="flex items-center justify-between pt-2 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-sky-400" />
                      Due: {t.dueDate || 'No date'}
                    </span>
                    <button
                      onClick={() => updateTaskStatus(t.id, 'Done')}
                      className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold px-2 py-1 rounded transition"
                    >
                      Mark Complete &check;
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Done Column */}
        <div className="glass-panel p-5 space-y-4 border-emerald-500/20">
          <div className="flex items-center justify-between border-b border-vamnavy-800 pb-3">
            <h3 className="font-bold text-emerald-400 text-sm flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              <span>Completed ({doneTasks.length})</span>
            </h3>
          </div>

          <div className="space-y-3">
            {doneTasks.length === 0 ? (
              <p className="text-slate-500 italic py-4 text-center">No completed tasks</p>
            ) : (
              doneTasks.map((t) => (
                <div key={t.id} className="bg-vamnavy-900/60 border border-vamnavy-800 p-4 rounded-xl space-y-2 opacity-85">
                  <h4 className="font-semibold text-slate-200 text-sm line-through">{t.title}</h4>
                  <p className="text-slate-400 leading-relaxed">{t.description}</p>
                  <span className="inline-block text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Completed
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
