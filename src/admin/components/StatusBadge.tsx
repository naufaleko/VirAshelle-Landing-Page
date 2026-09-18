import { ProjectStatus } from '../types';

interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = {
    briefing: { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', dot: 'bg-blue-400', label: 'Briefing' },
    concept: { color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', dot: 'bg-purple-400', label: 'Concept' },
    production: { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', dot: 'bg-amber-400', label: 'Production' },
    review: { color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20', dot: 'bg-orange-400', label: 'Review' },
    completed: { color: 'text-[#4BD200]', bg: 'bg-[#4BD200]/10', border: 'border-[#4BD200]/20', dot: 'bg-[#4BD200]', label: 'Completed' },
    on_hold: { color: 'text-zinc-400', bg: 'bg-zinc-800', border: 'border-zinc-700', dot: 'bg-zinc-400', label: 'On Hold' }
  };

  const current = config[status] || config.briefing;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${current.bg} ${current.border} ${current.color} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      {current.label}
    </span>
  );
}
