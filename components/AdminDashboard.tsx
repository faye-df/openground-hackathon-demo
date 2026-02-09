
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SocialMetrics, Task } from '../types';

interface AdminDashboardProps {
  metrics: SocialMetrics;
  tasks: Task[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ metrics, tasks }) => {
  const chartData = [
    { name: 'Empathy', value: 85 },
    { name: 'Action', value: 65 },
    { name: 'Joy', value: 92 },
    { name: 'Trust', value: 74 },
  ];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-800">Urban Resonance</h2>
        <p className="text-sm text-slate-500">Real-time social impact metrics</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase">Total Interactions</p>
          <p className="text-2xl font-bold text-indigo-600">{metrics.totalInteractions}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase">Active Tasks</p>
          <p className="text-2xl font-bold text-emerald-600">{metrics.activeTasks}</p>
        </div>
      </div>

      {/* Heatmap/Mood Section */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-700">Collective Mood</h3>
          <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full uppercase">
            {metrics.collectiveMood}
          </span>
        </div>
        
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip cursor={{ fill: 'transparent' }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hot Keywords */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-3">
        <h3 className="font-bold text-slate-700">Current Resonances</h3>
        <div className="flex flex-wrap gap-2">
          {metrics.topKeywords.map((kw, i) => (
            <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-sm font-medium border border-slate-100">
              #{kw}
            </span>
          ))}
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-700 px-1">Recent Activities</h3>
        {tasks.map((task) => (
          <div key={task.id} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${task.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-700 truncate">{task.title}</p>
              <p className="text-xs text-slate-400">Status: {task.status.toUpperCase()}</p>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {new Date(task.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
