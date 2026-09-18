import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { StatusBadge } from './StatusBadge';
import type { Project } from '../types';

interface ProjectCardProps {
  key?: React.Key;
  project: Project;
  onClick: (project: Project) => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const isOverdue = project.deadline && new Date(project.deadline) < new Date() && project.status !== 'completed';
  const progress = project.progress || 0;

  const priorityColors = {
    low: 'text-zinc-400 bg-zinc-800 border-zinc-700',
    medium: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    high: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    urgent: 'text-red-400 bg-red-400/10 border-red-400/20',
  };

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      onClick={() => onClick(project)}
      className="bg-zinc-900/50 backdrop-blur-sm border border-white/5 hover:border-white/10 hover:shadow-[0_0_15px_rgba(75,210,0,0.1)] rounded-xl p-5 cursor-pointer transition-colors"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1 truncate">{project.title}</h3>
          <p className="text-sm text-zinc-400 truncate">{project.client}</p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-zinc-400">Progress</span>
          <span className="text-white">{progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#4BD200] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
        <div className={`flex items-center gap-1.5 text-xs font-medium ${isOverdue ? 'text-red-400' : 'text-zinc-400'}`}>
          {isOverdue ? <AlertCircle size={14} /> : <Calendar size={14} />}
          <span>{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}</span>
        </div>
        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${priorityColors[project.priority] || priorityColors.medium}`}>
          {project.priority}
        </span>
      </div>
      
      {project.team && project.team.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {project.team.slice(0, 3).map((member, i) => (
            <span key={i} className="text-[10px] bg-white/5 text-zinc-300 px-1.5 py-0.5 rounded">
              {member}
            </span>
          ))}
          {project.team.length > 3 && (
            <span className="text-[10px] bg-white/5 text-zinc-400 px-1.5 py-0.5 rounded">
              +{project.team.length - 3}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
