import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { priorityLabel } from '../lib/projectStatus';
import type { Project } from '../types';

interface ProjectCardProps {
  key?: React.Key;
  project: Project;
  onClick: (project: Project) => void;
}

// Priority is one neutral chip; only "urgent" is colored, because it is the only level
// that should pull the eye in a grid of cards.
const priorityClass: Record<string, string> = {
  low: 'text-zinc-400 bg-white/[0.04] border-white/10',
  medium: 'text-zinc-300 bg-white/[0.04] border-white/10',
  high: 'text-amber-300 bg-amber-400/10 border-amber-400/20',
  urgent: 'text-red-400 bg-red-400/10 border-red-400/20',
};

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const isOverdue = project.deadline && new Date(project.deadline) < new Date() && project.status !== 'completed';
  const progress = project.progress || 0;

  const open = () => onClick(project);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      }}
      aria-label={`Buka proyek ${project.title}`}
      className="bg-[#111118] border border-white/10 hover:border-[#4BD200]/40 rounded-2xl p-5 cursor-pointer transition-colors relative overflow-hidden group"
    >
      <div className="flex items-start justify-between gap-3 mb-3.5">
        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-display font-bold text-white mb-0.5 truncate group-hover:text-[#4BD200] transition-colors" title={project.title}>
            {project.title}
          </h3>
          <p className="text-xs sm:text-sm font-ui text-zinc-400 truncate" title={project.client}>
            {project.client}
          </p>
        </div>
        <div className="shrink-0">
          <StatusBadge status={project.status} />
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1.5 font-ui">
          <span className="text-zinc-400">Progres</span>
          <span className="text-white font-mono font-bold">{progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-[#0a0a0f] rounded-full overflow-hidden border border-white/5" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-[#4BD200] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mt-auto pt-3.5 border-t border-white/5">
        <div className={`flex items-center gap-1.5 text-xs font-mono truncate min-w-0 ${isOverdue ? 'text-red-400' : 'text-zinc-400'}`}>
          {isOverdue ? <AlertCircle size={13} className="shrink-0" aria-label="Lewat tenggat" /> : <Calendar size={13} className="shrink-0" aria-hidden="true" />}
          <span className="truncate">{project.deadline ? new Date(project.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Tanpa tenggat'}</span>
        </div>
        <span className={`text-[10px] font-ui font-bold px-2 py-0.5 rounded border shrink-0 ${priorityClass[project.priority] || priorityClass.medium}`}>
          {priorityLabel(project.priority)}
        </span>
      </div>

      {project.team && project.team.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {project.team.slice(0, 3).map((member, i) => (
            <span key={i} className="text-[10px] font-ui bg-white/5 text-zinc-300 px-2 py-0.5 rounded-md border border-white/5">
              {member}
            </span>
          ))}
          {project.team.length > 3 && (
            <span className="text-[10px] font-mono bg-white/5 text-zinc-400 px-1.5 py-0.5 rounded-md border border-white/5">
              +{project.team.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
