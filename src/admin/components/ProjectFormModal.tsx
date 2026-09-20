import React, { useEffect, useMemo, useState } from 'react';
import { useModalPresence } from '../lib/usePresence';
import { BrandedDatePicker } from './BrandedDatePicker';
import { X, Loader2, AlertCircle, Plus, Check, Save, Briefcase, CalendarDays, MapPin } from 'lucide-react';
import { BrandedDropdown } from './BrandedDropdown';
import { MediaUploader } from './MediaUploader';
import { parseEventState } from './JourneyMap';
import { useTeamMembers } from '../hooks/useTeamMembers';
import { useAdmin } from '../../lib/useAdmin';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '../lib/projectStatus';
import type { Project, ProjectPriority, ProjectStatus } from '../types';

interface ProjectFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: Partial<Project>) => Promise<unknown>;
  /** When provided the modal works in edit mode and prefills from this project. */
  initial?: Project | null;
}

const DEFAULT_CATEGORIES = ['VIDEO EDITING', 'MOTION GRAPHIC', '3D PRODUCTION', 'GRAPHIC DESIGN'];

const inputClass =
  'w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-dim focus:outline-none focus:border-[#4BD200] focus:ring-1 focus:ring-[#4BD200]/30 transition-all font-body';

const labelClass = 'block text-[11px] font-ui font-bold text-zinc-400 mb-1.5';

type FormState = {
  projectType: 'standard' | 'event';
  title: string;
  client: string;
  venue: string;
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
  rawEventState?: string;
};

const initialForm: FormState = {
  projectType: 'standard',
  title: '',
  client: '',
  venue: '',
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

function formFromProject(p: Project): FormState {
  const isEvent = p.category === 'Event';
  const { cleanDesc, venue } = parseEventState(p.description);
  const hasEventState = (p.description || '').includes('---EVENT_STATE---');
  const rawEventState = hasEventState ? (p.description || '').split('---EVENT_STATE---')[1] : undefined;

  return {
    projectType: isEvent ? 'event' : 'standard',
    title: p.title || '',
    client: p.client || '',
    venue: venue || '',
    category: p.category || '',
    status: p.status || 'briefing',
    priority: p.priority || 'medium',
    description: isEvent ? cleanDesc : (p.description || ''),
    start_date: p.start_date ? p.start_date.slice(0, 10) : '',
    deadline: p.deadline ? p.deadline.slice(0, 10) : '',
    budget: p.budget !== null && p.budget !== undefined ? String(p.budget) : '',
    team: Array.isArray(p.team) ? [...p.team] : [],
    tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
    thumbnail_url: p.thumbnail_url || '',
    rawEventState,
  };
}

export function ProjectFormModal({ open, onClose, onSubmit, initial = null }: ProjectFormModalProps) {
  const { content } = useAdmin();
  const { members, loading: membersLoading } = useTeamMembers();
  const isEdit = !!initial;
  const { mounted, overlayRef, panelRef } = useModalPresence(open);

  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Category options follow the services managed in the CMS, with a sane fallback.
  const categoryOptions = useMemo(() => {
    const fromCms = (content?.services?.items || [])
      .map((s) => s.title?.trim())
      .filter(Boolean) as string[];
    const base = fromCms.length > 0 ? fromCms : DEFAULT_CATEGORIES;
    // Keep an existing project's category selectable even if it is no longer a CMS service.
    if (initial?.category && !base.includes(initial.category)) return [initial.category, ...base];
    return base;
  }, [content, initial?.category]);

  // Reset / prefill form each time the modal is opened
  useEffect(() => {
    if (open) {
      setForm(initial ? formFromProject(initial) : { ...initialForm, category: categoryOptions[0] || '' });
      setError('');
      setSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial?.id]);

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

  const handleSelectProjectType = (type: 'standard' | 'event') => {
    setForm((prev) => ({
      ...prev,
      projectType: type,
      category: type === 'event' ? 'Event' : (prev.category === 'Event' ? (categoryOptions[0] || '') : prev.category),
    }));
  };

  const toggleMember = (name: string) => {
    setForm((prev) => ({
      ...prev,
      team: prev.team.includes(name) ? prev.team.filter((m) => m !== name) : [...prev.team, name],
    }));
  };

  // Names on the project that are not (or no longer) in team_members, shown as extra chips
  // so editing an older project does not silently drop them.
  const legacyTeam = useMemo(() => {
    if (!initial?.team) return [] as string[];
    const known = new Set(members.map((m) => m.name));
    return initial.team.filter((name) => !known.has(name));
  }, [initial?.team, members]);

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

    if (!title) return setError(form.projectType === 'event' ? 'Nama event wajib diisi.' : 'Judul proyek wajib diisi.');
    if (!client) return setError(form.projectType === 'event' ? 'Klien / sponsor utama wajib diisi.' : 'Nama klien wajib diisi.');
    if (form.start_date && form.deadline && form.deadline < form.start_date) {
      return setError(form.projectType === 'event' ? 'Hari H event tidak boleh sebelum tanggal mulai.' : 'Tenggat tidak boleh sebelum tanggal mulai.');
    }

    const budgetNum = form.budget.trim() === '' ? null : Number(form.budget);
    if (budgetNum !== null && (Number.isNaN(budgetNum) || budgetNum < 0)) {
      return setError('Anggaran harus berupa angka positif.');
    }

    const isEvent = form.projectType === 'event';
    const finalCategory = isEvent ? 'Event' : (form.category || '');

    let finalDescription = form.description.trim();
    if (isEvent) {
      if (form.venue.trim()) {
        finalDescription = `Lokasi: ${form.venue.trim()}${finalDescription ? `\n\n${finalDescription}` : ''}`;
      }
      if (form.rawEventState) {
        finalDescription = `${finalDescription}\n\n---EVENT_STATE---${form.rawEventState}`;
      }
    }

    // progress / completed_at are derived by the hooks (withStatusSideEffects), not here.
    const payload: Partial<Project> = {
      title,
      client,
      category: finalCategory,
      status: form.status,
      priority: form.priority,
      description: finalDescription,
      start_date: form.start_date || null,
      deadline: form.deadline || null,
      team: form.team,
      budget: budgetNum,
      tags: parsedTags,
      thumbnail_url: form.thumbnail_url.trim() || null,
    };

    setSubmitting(true);
    try {
      await onSubmit(payload);
    } catch (err: any) {
      console.error(isEdit ? 'Failed to save project:' : 'Failed to create project:', err);
      setError(err?.message || (isEdit ? 'Perubahan gagal disimpan. Coba lagi.' : 'Proyek gagal dibuat. Coba lagi.'));
      setSubmitting(false);
    }
  };

  const chipClass = (selected: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
      selected
        ? 'bg-[#4BD200]/15 text-[#4BD200] border-[#4BD200]/40'
        : 'bg-zinc-900 text-zinc-300 border-white/10 hover:border-[#4BD200]/40 hover:text-white'
    }`;

  if (!mounted) return null;

  return (
        <div
          ref={overlayRef}
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !submitting) onClose();
          }}
        >
          <form
            ref={panelRef as React.RefObject<HTMLFormElement>}
            onSubmit={handleSubmit}
            className="bg-[#0a0a0f] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_24px_64px_rgba(0,0,0,0.8)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#4BD200]/40 to-transparent" />
            {/* Header */}
            <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-white/[0.08]">
              <div>
                <h2 className="text-xl font-display font-bold text-white">{isEdit ? 'Edit proyek' : 'Proyek baru'}</h2>
                <p className="text-zinc-400 font-ui text-xs sm:text-sm mt-1">
                  {isEdit
                    ? 'Ubah detail proyek, lalu simpan.'
                    : 'Isi judul dan klien; sisanya bisa dilengkapi nanti.'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="text-dim hover:text-white p-1 rounded-lg transition-colors disabled:opacity-40"
                aria-label="Tutup"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              {/* Segmented Control: Standard vs Event Tracker */}
              <div className="p-1 bg-black/50 border border-white/10 rounded-xl flex gap-1 font-ui">
                <button
                  type="button"
                  onClick={() => handleSelectProjectType('standard')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    form.projectType === 'standard'
                      ? 'bg-zinc-800 text-white shadow border border-white/10'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Briefcase size={16} />
                  <span>Proyek biasa</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectProjectType('event')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    form.projectType === 'event'
                      ? 'bg-[#4BD200]/15 text-[#4BD200] border border-[#4BD200]/40'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <CalendarDays size={16} />
                  <span>Event dengan roadmap</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="np-title">
                    {form.projectType === 'event' ? 'Nama event *' : 'Judul proyek *'}
                  </label>
                  <input
                    id="np-title"
                    type="text"
                    autoFocus
                    value={form.title}
                    onChange={(e) => set('title', e.target.value)}
                    placeholder={
                      form.projectType === 'event'
                        ? 'cth: nama event dan tahun'
                        : 'cth: iklan peluncuran produk 30 detik'
                    }
                    className={inputClass}
                    maxLength={120}
                  />
                </div>

                <div className={form.projectType === 'event' ? 'sm:col-span-2' : ''}>
                  <label className={labelClass} htmlFor="np-client">
                    {form.projectType === 'event' ? 'Klien / sponsor utama *' : 'Klien *'}
                  </label>
                  <input
                    id="np-client"
                    type="text"
                    value={form.client}
                    onChange={(e) => set('client', e.target.value)}
                    placeholder={
                      form.projectType === 'event'
                        ? 'Nama perusahaan atau sponsor'
                        : 'Nama klien atau brand'
                    }
                    className={inputClass}
                    maxLength={120}
                  />
                </div>

                {/* Conditional Lokasi Venue for Event */}
                {form.projectType === 'event' && (
                  <div className="sm:col-span-2">
                    <label className={labelClass} htmlFor="np-venue">Lokasi Venue</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dim pointer-events-none" />
                      <input
                        id="np-venue"
                        type="text"
                        value={form.venue}
                        onChange={(e) => set('venue', e.target.value)}
                        placeholder="e.g. Grand Ballroom Hotel Mulia / Hall B JCC Senayan"
                        className={`${inputClass} pl-10`}
                        maxLength={150}
                      />
                    </div>
                  </div>
                )}

                {/* Conditional Category for Standard Project only */}
                {form.projectType === 'standard' && (
                  <BrandedDropdown
                    label="Kategori"
                    value={form.category}
                    onChange={(v) => set('category', v)}
                    options={categoryOptions}
                    placeholder="Pilih kategori"
                  />
                )}

                <BrandedDropdown
                  label="Status"
                  value={form.status}
                  onChange={(v) => set('status', v as ProjectStatus)}
                  options={STATUS_OPTIONS}
                />

                <BrandedDropdown
                  label="Prioritas"
                  value={form.priority}
                  onChange={(v) => set('priority', v as ProjectPriority)}
                  options={PRIORITY_OPTIONS}
                />

                <div>
                  <label className={labelClass} htmlFor="np-start">Tanggal mulai</label>
                  <BrandedDatePicker
                    id="np-start"
                    value={form.start_date}
                    onChange={(v) => set('start_date', v)}
                    max={form.deadline || undefined}
                    clearable
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="np-deadline">
                    {form.projectType === 'event' ? 'Tanggal hari H' : 'Tenggat'}
                  </label>
                  <BrandedDatePicker
                    id="np-deadline"
                    value={form.deadline}
                    onChange={(v) => set('deadline', v)}
                    min={form.start_date || undefined}
                    clearable
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="np-budget">Anggaran</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm pointer-events-none" aria-hidden="true">Rp</span>
                    <input
                      id="np-budget"
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      value={form.budget}
                      onChange={(e) => set('budget', e.target.value)}
                      placeholder="0"
                      className={`${inputClass} pl-7`}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass} htmlFor="np-tags">Tag</label>
                  <input
                    id="np-tags"
                    type="text"
                    value={form.tags}
                    onChange={(e) => set('tags', e.target.value)}
                    placeholder="Pisahkan dengan koma, cth: tiktok, 30s, vertikal"
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
                  <label className={labelClass} htmlFor="np-desc">
                    {form.projectType === 'event' ? 'Deskripsi & catatan event' : 'Deskripsi'}
                  </label>
                  <textarea
                    id="np-desc"
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                    placeholder={
                      form.projectType === 'event'
                        ? 'Rundown singkat, konsep tema, atau catatan teknis acara...'
                        : 'Brief, deliverable, referensi, catatan'
                    }
                    className={`${inputClass} min-h-[96px] resize-y`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Tim</label>
                  {membersLoading ? (
                    <p className="text-xs text-dim">Memuat daftar anggota tim...</p>
                  ) : members.length === 0 && legacyTeam.length === 0 ? (
                    <p className="text-xs text-dim">Belum ada anggota tim terdaftar. Tambahkan lewat tabel team_members.</p>
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
                            className={chipClass(selected)}
                          >
                            {selected ? <Check size={12} /> : <Plus size={12} />}
                            <span>{m.name}</span>
                            {m.role && <span className="text-[10px] text-dim">· {m.role}</span>}
                          </button>
                        );
                      })}
                      {legacyTeam.map((name) => {
                        const selected = form.team.includes(name);
                        return (
                          <button
                            key={`legacy-${name}`}
                            type="button"
                            onClick={() => toggleMember(name)}
                            aria-pressed={selected}
                            title="Tidak ada di daftar anggota tim saat ini"
                            className={chipClass(selected)}
                          >
                            {selected ? <Check size={12} /> : <Plus size={12} />}
                            <span>{name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <MediaUploader
                    label="Thumbnail (opsional)"
                    value={form.thumbnail_url}
                    onChange={(url) => set('thumbnail_url', url)}
                    category="projects"
                    placeholder="Tempel URL gambar atau unggah cover"
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
            <div className="flex justify-end gap-3 p-6 pt-4 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2.5 text-xs sm:text-sm font-ui text-zinc-400 hover:text-white transition-colors disabled:opacity-40"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-[#4BD200] hover:bg-[#7cff33] text-black font-ui font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> {isEdit ? 'Menyimpan...' : 'Membuat...'}
                  </>
                ) : isEdit ? (
                  <>
                    <Save size={16} /> Simpan perubahan
                  </>
                ) : (
                  <>
                    <Plus size={16} /> Buat proyek
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
  );
}
