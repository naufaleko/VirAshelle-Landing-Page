import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Trash2, Calendar, Tag, DollarSign, User, AlertTriangle } from 'lucide-react';
import { useProjectDetail } from '../hooks/useProjectDetail';
import { StatusBadge } from '../components/StatusBadge';
import { useAdmin } from '../../lib/useAdmin';
import type { ProjectStatus } from '../types';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAdmin();
  
  const { project, updates, loading, updateProject, addUpdate, deleteProject } = useProjectDetail(id || '');
  
  const [updateMsg, setUpdateMsg] = useState('');
  const [newStatus, setNewStatus] = useState<ProjectStatus | ''>('');
  const [newProgress, setNewProgress] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) return <div className="p-8 text-zinc-400">Loading project details...</div>;
  if (!project) return <div className="p-8 text-red-400">Project not found</div>;

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateMsg.trim()) return;
    
    setIsSubmitting(true);
    try {
      const pUpdates: any = {};
      if (newStatus) pUpdates.status = newStatus as ProjectStatus;
      if (newProgress !== '') pUpdates.progress = Number(newProgress);
      
      await addUpdate({
        message: updateMsg,
        author: user?.email || 'Admin',
        old_status: newStatus ? project.status : null,
        new_status: newStatus ? (newStatus as ProjectStatus) : null,
        progress: newProgress !== '' ? Number(newProgress) : null
      }, pUpdates);
      
      setUpdateMsg('');
      setNewStatus('');
      setNewProgress('');
    } catch (err) {
      console.error(err);
      alert('Failed to add update');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project? This cannot be undone.')) {
      try {
        await deleteProject();
        navigate('/admin/projects');
      } catch (err) {
        alert('Failed to delete project');
      }
    }
  };

  const statusWorkflow: ProjectStatus[] = ['briefing', 'concept', 'production', 'review', 'completed'];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <button onClick={() => navigate('/admin/projects')} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
        <ArrowLeft size={16} /> Back to Projects
      </button>

      {/* Header */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <StatusBadge status={project.status} />
            <span className="text-xs uppercase tracking-wider px-2 py-0.5 rounded border border-zinc-700 bg-zinc-800 text-zinc-400">
              {project.priority} Priority
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{project.title}</h1>
          <p className="text-lg text-zinc-400">{project.client}</p>
        </div>
        
        <button onClick={handleDelete} className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-2 rounded-lg transition-colors self-start" title="Delete Project">
          <Trash2 size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4">Description</h3>
            <p className="text-zinc-300 whitespace-pre-wrap">{project.description || 'No description provided.'}</p>
          </div>

          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-white">Progress Workflow</h3>
              <span className="text-xl font-bold text-[#4BD200]">{project.progress}%</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-2 bg-zinc-800 rounded-full mb-8 overflow-hidden">
              <div className="h-full bg-[#4BD200] transition-all duration-500" style={{ width: `${project.progress}%` }} />
            </div>

            {/* Status Steps */}
            <div className="flex justify-between relative">
              <div className="absolute top-4 left-0 w-full h-0.5 bg-zinc-800 -z-10" />
              {statusWorkflow.map((step, idx) => {
                const isActive = project.status === step;
                const isPast = statusWorkflow.indexOf(project.status) > idx;
                
                return (
                  <div key={step} className="flex flex-col items-center gap-2">
                    <button 
                      onClick={() => updateProject({ status: step })}
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                        isActive ? 'bg-[#4BD200] border-[#4BD200] text-black shadow-[0_0_15px_rgba(75,210,0,0.3)]' 
                        : isPast ? 'bg-[#4BD200]/20 border-[#4BD200] text-[#4BD200]' 
                        : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:border-zinc-500'
                      }`}
                    >
                      {idx + 1}
                    </button>
                    <span className={`text-[10px] sm:text-xs capitalize text-center max-w-[58px] sm:max-w-none leading-tight ${isActive || isPast ? 'text-zinc-200 font-medium' : 'text-zinc-500'}`}>
                      {step.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
            <h3 className="text-sm font-medium text-white mb-4 uppercase tracking-wider">Details</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Tag size={18} className="text-zinc-500 mt-0.5" />
                <div>
                  <div className="text-xs text-zinc-500">Category</div>
                  <div className="text-sm text-zinc-200">{project.category}</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Calendar size={18} className="text-zinc-500 mt-0.5" />
                <div>
                  <div className="text-xs text-zinc-500">Deadline</div>
                  <div className={`text-sm ${project.deadline && new Date(project.deadline) < new Date() && project.status !== 'completed' ? 'text-red-400' : 'text-zinc-200'}`}>
                    {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Not set'}
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <DollarSign size={18} className="text-zinc-500 mt-0.5" />
                <div>
                  <div className="text-xs text-zinc-500">Budget</div>
                  <div className="text-sm text-zinc-200">{project.budget ? `$${project.budget.toLocaleString()}` : 'Not specified'}</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <User size={18} className="text-zinc-500 mt-0.5" />
                <div>
                  <div className="text-xs text-zinc-500">Team</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {project.team && project.team.length > 0 ? project.team.map(m => (
                      <span key={m} className="px-2 py-0.5 bg-white/5 rounded text-xs text-zinc-300">{m}</span>
                    )) : <span className="text-sm text-zinc-500">No team assigned</span>}
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Updates Timeline */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 lg:p-8">
        <h3 className="text-lg font-medium text-white mb-6">Activity Timeline</h3>
        
        {updates.length > 0 ? (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
            {updates.map((update, i) => (
              <div key={update.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-zinc-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-[#4BD200]">
                  <AlertTriangle size={16} className={update.new_status ? 'block' : 'hidden'} />
                  {!update.new_status && <div className="w-2 h-2 rounded-full bg-zinc-600" />}
                </div>
                
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/5 bg-zinc-900/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm text-white">{update.author}</span>
                    <span className="text-xs text-zinc-500">{new Date(update.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-zinc-300">{update.message}</p>
                  
                  {(update.new_status || update.progress !== null) && (
                    <div className="mt-3 pt-3 border-t border-white/5 flex gap-2 flex-wrap">
                      {update.old_status && update.new_status && (
                        <div className="text-xs flex items-center gap-1 text-zinc-400">
                          Status: <span className="line-through">{update.old_status}</span> <span>→</span> <span className="text-white">{update.new_status}</span>
                        </div>
                      )}
                      {update.progress !== null && (
                        <div className="text-xs flex items-center gap-1 text-zinc-400">
                          Progress: <span className="text-white">{update.progress}%</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-zinc-500 text-center py-8">No updates yet.</p>
        )}

        {/* Add Update Form */}
        <form onSubmit={handleAddUpdate} className="mt-8 pt-8 border-t border-white/5">
          <h4 className="text-sm font-medium text-white mb-4">Post an Update</h4>
          <textarea 
            required
            value={updateMsg}
            onChange={(e) => setUpdateMsg(e.target.value)}
            placeholder="What's the latest progress?"
            className="w-full bg-zinc-950 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#4BD200] min-h-[100px] mb-4 resize-none"
          />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <select 
                value={newStatus} 
                onChange={(e) => setNewStatus(e.target.value as any)}
                className="bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4BD200]"
              >
                <option value="">No status change</option>
                {statusWorkflow.map(s => <option key={s} value={s}>{s}</option>)}
                <option value="on_hold">on_hold</option>
              </select>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400">Progress:</span>
                <input 
                  type="number" 
                  min="0" max="100" 
                  value={newProgress} 
                  onChange={(e) => setNewProgress(e.target.value ? Number(e.target.value) : '')}
                  placeholder={project.progress.toString()}
                  className="w-16 bg-zinc-950 border border-white/10 rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-[#4BD200] text-center"
                />
                <span className="text-sm text-zinc-400">%</span>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[#4BD200] hover:bg-[#4BD200]/90 text-black px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Posting...' : <><Send size={16} /> Post Update</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
