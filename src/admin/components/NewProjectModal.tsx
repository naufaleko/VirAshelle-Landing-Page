import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, AlertCircle, Plus, Check } from 'lucide-react';
import { BrandedDropdown } from './BrandedDropdown';
import { MediaUploader } from './MediaUploader';
import { useTeamMembers } from '../hooks/useTeamMembers';
import { useAdmin } from '../../lib/useAdmin';
import type { Project, ProjectPriority, ProjectStatus } from '../types';

interface NewProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (project: Partial<Project>) => Promise<unknown>;
}

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'briefing', label: 'Briefing' },
  { value: 'concept', label: 'Concept' },
  { value: 'production', label: 'Production' },
  { value: 'review', label: 'Review' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
];

const PRIORITY_OPTIONS: { value: ProjectPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const DEFAULT_CATEGORIES = ['VIDEO EDITING', 'MOTION GRAPHIC', '3D PRODUCTION', 'GRAPHIC DESIGN'];

const inputClass =
  'w-full bg-zinc-950/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#4BD200] focus:ring-1 focus:ring-[#4BD200]/30 transition-all';

const labelClass = 'block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5';

type FormState = {
  title: string;
  client: string;
  category: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  description: string;
  start_date: string;
  deadline: string;
  budget: string;
  team: string[];
  tags: string;
  thumbnail_url: string;
};

const initialForm: FormState = {
  title: '',
  client: '',
  category: '',
  status: 'briefing',
  priority: 'medium',
  description: '',
  start_date: '',
  deadline: '',
  budget: '',
  team: [],
  tags: '',
  thumbnail_url: '',
};

export function NewProjectModal({ open, onClose, onSubmit }: NewProjectModalProps) {
  const { content } = useAdmin();
  const { members, loading: membersLoading } = useTeamMembers();

  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Category options follow the services managed in the CMS, with a sane fallback.
  const categoryOptions = useMemo(() => {
    const fromCms = (content?.services?.items || [])
      .map((s) => s.title?.trim())
      .filter(Boolean) as string[];
    return fromCms.length > 0 ? fromCms : DEFAULT_CATEGORIES;
  }, [content]);

  // Reset form each time the modal is opened
  useEffect(() => {
    if (open) {
      setForm({ ...initialForm, category: categoryOptions[0] || '' });
      setError('');
      setSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, submitting, onClose]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleMember = (name: string) => {
    setForm((prev) => ({
      ...prev,
      team: prev.team.includes(name) ? prev.team.filter((m) => m !== name) : [...prev.team, name],
    }));
  };

  const parsedTags = useMemo(
    () =>
      Array.from(
        new Set(
          form.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        )
      ),
    [form.tags]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const title = form.title.trim();
    const client = form.client.trim();

    if (!title) return setError('Project title is required.');
    if (!client) return setError('Client name is required.');
    if (form.start_date && form.deadline && form.deadline < form.start_date) {
      return setError('Deadline cannot be earlier than the start date.');
    }

    const budgetNum = form.budget.trim() === '' ? null : Number(form.budget);
    if (budgetNum !== null && (Number.isNaN(budgetNum) || budgetNum < 0)) {
      return setError('Budget must be a valid positive number.');
    }

    const payload: Partial<Project> = {
      title,
      client,
      category: form.category || '',
      status: form.status,
      priority: form.priority,
      description: form.description.trim(),
      start_date: form.start_date || null,
      deadline: form.deadline || null,
      completed_at: form.status === 'completed' ? new Date().toISOString() : null,
      progress: form.status === 'completed' ? 100 : 0,
      team: form.team,
      budget: budgetNum,
      tags: parsedTags,
      thumbnail_url: form.thumbnail_url.trim() || null,
    };

    setSubmitting(true);
    try {
      await onSubmit(payload);
    } catch (err: any) {
      console.error('Failed to create project:', err);
      setError(err?.message || 'Failed to create project. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !submitting) onClose();
          }}
        >
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_24px_64px_rgba(0,0,0,0.8)]"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-white/5">
              <div>
                <h2 className="text-xl font-bold text-white">Create New Project</h2>
                <p className="text-zinc-400 text-sm mt-1">Fill in the details below to start tracking a new project.</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="text-zinc-500 hover:text-white transition-colors disabled:opacity-40"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="np-title">Project Title *</label>
                  <input
                    id="np-title"
                    type="text"
                    autoFocus
                    value={form.title}
                    onChange={(e) => set('title', e.target.value)}
                    placeholder="e.g. Product Launch Commercial"
                    className={inputClass}
                    maxLength={120}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="np-client">Client *</label>
                  <input
                    id="np-client"
                    type="text"
                    value={form.client}
                    onChange={(e) => set('client', e.target.value)}
                    placeholder="Client / brand name"
                    className={inputClass}
                    maxLength={120}
                  />
                </div>

                <BrandedDropdown
                  label="Category"
                  value={form.category}
                  onChange={(v) => set('category', v)}
                  options={categoryOptions}
                  placeholder="Select a category..."
                />

                <BrandedDropdown
                  label="Status"
                  value={form.status}
                  onChange={(v) => set('status', v as ProjectStatus)}
                  options={STATUS_OPTIONS}
                />

                <BrandedDropdown
                  label="Priority"
                  value={form.priority}
                  onChange={(v) => set('priority', v as ProjectPriority)}
                  options={PRIORITY_OPTIONS}
                />

                <div>
                  <label className={labelClass} htmlFor="np-start">Start Date</label>
                  <input
                    id="np-start"
                    type="date"
                    value={form.start_date}
                    onChange={(e) => set('start_date', e.target.value)}
                    className={`${inputClass} [color-scheme:dark]`}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="np-deadline">Deadline</label>
                  <input
                    id="np-deadline"
                    type="date"
                    value={form.deadline}
                    min={form.start_date || undefined}
                    onChange={(e) => set('deadline', e.target.value)}
                    className={`${inputClass} [color-scheme:dark]`}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="np-budget">Budget</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm pointer-events-none">$</span>
                    <input
                      id="np-budget"
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      value={form.budget}
                      onChange={(e) => set('budget', e.target.value)}
                      placeholder="0.00"
                      className={`${inputClass} pl-7`}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass} htmlFor="np-tags">Tags</label>
                  <input
                    id="np-tags"
                    type="text"
                    value={form.tags}
                    onChange={(e) => set('tags', e.target.value)}
                    placeholder="Comma separated, e.g. tiktok, 30s, vertical"
                    className={inputClass}
                  />
                  {parsedTags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {parsedTags.map((t) => (
                        <span key={t} className="text-[10px] bg-white/5 border border-white/10 text-zinc-300 px-1.5 py-0.5 rounded">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="np-desc">Description</label>
                  <textarea
                    id="np-desc"
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                    placeholder="Brief, deliverables, references, notes..."
                    className={`${inputClass} min-h-[96px] resize-y`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Team</label>
                  {membersLoading ? (
                    <p className="text-xs text-zinc-500">Loading team members...</p>
                  ) : members.length === 0 ? (
                    <p className="text-xs text-zinc-500">No team members found.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {members.map((m) => {
                        const selected = form.team.includes(m.name);
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => toggleMember(m.name)}
                            aria-pressed={selected}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                              selected
                                ? 'bg-[#4BD200]/15 text-[#4BD200] border-[#4BD200]/40 shadow-[0_0_10px_rgba(75,210,0,0.12)]'
                                : 'bg-zinc-900 text-zinc-300 border-white/10 hover:border-[#4BD200]/40 hover:text-white'
                            }`}
                          >
                            {selected ? <Check size={12} /> : <Plus size={12} />}
                            <span>{m.name}</span>
                            {m.role && <span className="text-[10px] text-zinc-500">· {m.role}</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <MediaUploader
                    label="Thumbnail (optional)"
                    value={form.thumbnail_url}
                    onChange={(url) => set('thumbnail_url', url)}
                    category="projects"
                    placeholder="Paste an image URL or upload a cover..."
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-[#4BD200] hover:bg-[#4BD200]/90 text-black rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Creating...
                  </>
                ) : (
                  <>
                    <Plus size={16} /> Create Project
                  </>
                )}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
