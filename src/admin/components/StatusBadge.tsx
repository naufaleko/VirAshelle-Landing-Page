import { ProjectStatus } from '../types';
import { STATUS_COLORS, statusLabel } from '../lib/projectStatus';

interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

/** Neutral chip; the dot carries the status color so the same color means the same thing everywhere. */
export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const color = STATUS_COLORS[status] || STATUS_COLORS.briefing;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-ui font-semibold border border-white/10 bg-white/[0.04] text-zinc-200 ${className}`}>
      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} aria-hidden="true" />
      {statusLabel(status)}
    </span>
  );
}
