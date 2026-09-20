import type { Project, ProjectPriority, ProjectStatus } from '../types';

export const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'briefing', label: 'Briefing' },
  { value: 'concept', label: 'Konsep' },
  { value: 'production', label: 'Produksi' },
  { value: 'review', label: 'Review' },
  { value: 'completed', label: 'Selesai' },
  { value: 'on_hold', label: 'Ditunda' },
];

/**
 * One color per status, shared by badges, the pipeline breakdown, and anything else that
 * shows status. Status is a progression, so the workflow reads as a ramp of the brand green
 * (concept -> review), briefing is neutral (not started), completed is the light wash, and
 * on_hold is amber because it is the only state that needs attention rather than progress.
 * Every value clears 3:1 against the card surface (#111118) as a UI-component color.
 */
export const STATUS_COLORS: Record<ProjectStatus, string> = {
  briefing: "#a1a1aa",
  concept: "#328c00",
  production: "#4BD200",
  review: "#7cff33",
  completed: "#e5ffd6",
  on_hold: "#fbbf24",
};

export const PRIORITY_OPTIONS: { value: ProjectPriority; label: string }[] = [
  { value: 'low', label: 'Rendah' },
  { value: 'medium', label: 'Sedang' },
  { value: 'high', label: 'Tinggi' },
  { value: 'urgent', label: 'Mendesak' },
];

/** Linear workflow shown as step circles on the detail page (on_hold sits outside it). */
export const STATUS_WORKFLOW: ProjectStatus[] = ['briefing', 'concept', 'production', 'review', 'completed'];

export function statusLabel(status: ProjectStatus): string {
  return STATUS_OPTIONS.find((o) => o.value === status)?.label || status;
}

export function priorityLabel(priority: ProjectPriority): string {
  return PRIORITY_OPTIONS.find((o) => o.value === priority)?.label || priority;
}

/**
 * Applies the status-driven side effects (completed_at / progress) to a set of
 * project updates. Always returns a new object and never mutates `updates`.
 *
 * - Transition INTO 'completed' (from anything else, or on create): stamp
 *   completed_at and force progress to 100.
 * - Transition OUT of 'completed': clear completed_at (progress left as provided).
 * - Anything else: shallow copy, unchanged.
 */
export function withStatusSideEffects(
  updates: Partial<Project>,
  current: Pick<Project, 'status' | 'completed_at' | 'progress'> | null
): Partial<Project> {
  const next: Partial<Project> = { ...updates };
  if (!updates.status) return next;

  if (updates.status === 'completed') {
    if (current === null || current.status !== 'completed') {
      next.completed_at = new Date().toISOString();
      next.progress = 100;
    }
    return next;
  }

  if (current?.status === 'completed') {
    next.completed_at = null;
  }
  return next;
}
