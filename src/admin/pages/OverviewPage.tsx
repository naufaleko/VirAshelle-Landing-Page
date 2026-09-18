import { motion } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';
import { Plus, Edit3, FolderOpen, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useProjectStats } from '../hooks/useProjectStats';

export function OverviewPage() {
  const { total, active, completed, overdue, byStatus, recentUpdates, loading } = useProjectStats();

  if (loading) {
    return <div className="animate-pulse h-full flex items-center justify-center text-zinc-500">Loading stats...</div>;
  }

  const statCards = [
    { title: 'Total Projects', value: total, icon: FolderOpen, color: 'text-blue-400' },
    { title: 'Active', value: active, icon: Clock, color: 'text-amber-400' },
    { title: 'Completed', value: completed, icon: CheckCircle, color: 'text-[#4BD200]' },
    { title: 'Overdue', value: overdue, icon: AlertTriangle, color: 'text-red-400' },
  ];

  const pieData = Object.entries(byStatus).map(([name, value]) => ({ name, value }));
  const COLORS = ['#3b82f6', '#a855f7', '#f59e0b', '#f97316', '#4BD200', '#9ca3af'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <div className="flex gap-3">
          <Link to="/admin/cms" className="px-4 py-2 bg-zinc-900 border border-white/10 hover:bg-zinc-800 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Edit3 size={16} /> Edit Website
          </Link>
          <Link to="/admin/projects?new=true" className="px-4 py-2 bg-[#4BD200] hover:bg-[#4BD200]/90 text-black rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Plus size={16} /> New Project
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-zinc-400 mb-1">{stat.title}</p>
              <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-lg bg-white/5 ${stat.color}`}>
              <stat.icon size={24} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 lg:col-span-1"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Projects by Status</h2>
          <div className="h-64">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '0.5rem', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-500">No data available</div>
            )}
          </div>
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="capitalize">{entry.name.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 lg:col-span-2"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentUpdates.length > 0 ? recentUpdates.map((update) => (
              <div key={update.id} className="flex gap-4 p-4 rounded-lg bg-black/20 border border-white/5">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                  {update.author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-zinc-200">{update.author}</span>
                    <span className="text-zinc-500 text-sm">updated</span>
                    <Link to={`/admin/projects/${update.project_id}`} className="text-[#4BD200] hover:underline text-sm font-medium">
                      {update.project_title || 'Unknown Project'}
                    </Link>
                  </div>
                  <p className="text-zinc-400 text-sm">{update.message}</p>
                  <div className="text-xs text-zinc-600 mt-2">
                    {new Date(update.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center text-zinc-500 py-8">No recent activity</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
