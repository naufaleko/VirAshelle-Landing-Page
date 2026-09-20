import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useModalPresence, usePresence } from '../lib/usePresence';
import { collapseIn, collapseOut } from '../lib/motion';
import { BrandedDatePicker } from './BrandedDatePicker';
import {
  CheckCircle2,
  Calendar,
  MapPin,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Check,
  RotateCcw,
  FileText,
  Paperclip,
  Upload,
  Link2,
  Trash2,
  ExternalLink,
  Image as ImageIcon,
  File as FileIcon,
  Loader2,
  Save,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useEscapeKey } from '../lib/useEscapeKey';
import type { Project, ProjectStatus } from '../types';

export interface EventSubTask {
  id: string;
  title: string;
}

export interface EventPhase {
  id: number;
  title: string;
  subtitle: string;
  iconName: string;
  tasks: EventSubTask[];
}

export const EVENT_PHASES: EventPhase[] = [
  {
    id: 1,
    title: 'Inisiasi dan Konsep',
    subtitle: 'Fase 01',
    iconName: 'Sparkles',
    tasks: [
      { id: '1-1', title: 'Menganalisis tujuan dan target audiens' },
      { id: '1-2', title: 'Merancang tema dan identitas visual' },
      { id: '1-3', title: 'Studi kelayakan (lokasi, waktu, skala)' },
      { id: '1-4', title: 'Membuat draf awal RAB' },
    ],
  },
  {
    id: 2,
    title: 'Perencanaan Utama',
    subtitle: 'Fase 02',
    iconName: 'Calendar',
    tasks: [
      { id: '2-1', title: 'Membentuk kepanitiaan dan job desc' },
      { id: '2-2', title: 'Menentukan tanggal dan booking venue' },
      { id: '2-3', title: 'Merinci anggaran definitif' },
      { id: '2-4', title: 'Menyusun master timeline' },
    ],
  },
  {
    id: 3,
    title: 'Persiapan dan Pengadaan',
    subtitle: 'Fase 03',
    iconName: 'ListTodo',
    tasks: [
      { id: '3-1', title: 'Memilih vendor (katering, dekor, sound)' },
      { id: '3-2', title: 'Mengamankan sponsor' },
      { id: '3-3', title: 'Mengurus legalitas dan izin' },
      { id: '3-4', title: 'Produksi materi promosi' },
      { id: '3-5', title: 'Konfigurasi API Payment Gateway Otomatis untuk tiket' },
    ],
  },
  {
    id: 4,
    title: 'Eksekusi Menjelang Acara (H-1)',
    subtitle: 'Fase 04',
    iconName: 'Clock',
    tasks: [
      { id: '4-1', title: 'Technical Meeting (TM)' },
      { id: '4-2', title: 'Gladi resik (rehearsal)' },
      { id: '4-3', title: 'Pengawasan loading dan setup' },
      { id: '4-4', title: 'Uji coba sistem teknis' },
    ],
  },
  {
    id: 5,
    title: 'Pelaksanaan Hari H',
    subtitle: 'Fase 05',
    iconName: 'CheckCircle2',
    tasks: [
      { id: '5-1', title: 'Briefing final panitia' },
      { id: '5-2', title: 'Buka registrasi ulang' },
      { id: '5-3', title: 'Pengendalian rundown (Show Director)' },
      { id: '5-4', title: 'Manajemen krisis responsif' },
    ],
  },
  {
    id: 6,
    title: 'Pasca Acara',
    subtitle: 'Fase 06',
    iconName: 'Check',
    tasks: [
      { id: '6-1', title: 'Load-out dan clear area' },
      { id: '6-2', title: 'Pelunasan vendor' },
      { id: '6-3', title: 'Mengirim thank you notes dan laporan' },
      { id: '6-4', title: 'Rapat evaluasi internal' },
      { id: '6-5', title: 'Penyusunan LPJ' },
    ],
  },
];

const TOTAL_EVENT_TASKS = EVENT_PHASES.reduce((acc, p) => acc + p.tasks.length, 0); // 26 tasks

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: 'pdf' | 'image' | 'file' | 'link';
  size?: string;
  uploadedAt: string;
}

export interface TaskDetail {
  notes?: string;
  deadline?: string;
  attachments?: TaskAttachment[];
}

export interface EventState {
  completedTasks: string[];
  taskDetails?: Record<string, TaskDetail>;
}

export function parseEventState(description: string | null | undefined): {
  cleanDesc: string;
  state: EventState;
  venue: string;
} {
  if (!description) return { cleanDesc: '', state: { completedTasks: [], taskDetails: {} }, venue: '' };

  const delimiter = '---EVENT_STATE---';
  const parts = description.split(delimiter);
  let mainText = parts[0].trim();

  let venue = '';
  const venueMatch = mainText.match(/^(?:Lokasi|Venue):\s*([^\n]+)(?:\n\n|\n|$)/i);
  if (venueMatch) {
    venue = venueMatch[1].trim();
    mainText = mainText.replace(/^(?:Lokasi|Venue):\s*[^\n]+(?:\n\n|\n|$)/i, '').trim();
  }

  let completedTasks: string[] = [];
  let taskDetails: Record<string, TaskDetail> = {};

  if (parts.length > 1) {
    try {
      const parsed = JSON.parse(parts[1].trim());
      if (Array.isArray(parsed?.completedTasks)) {
        completedTasks = parsed.completedTasks;
      }
      if (parsed?.taskDetails && typeof parsed.taskDetails === 'object' && !Array.isArray(parsed.taskDetails)) {
        taskDetails = parsed.taskDetails;
      }
    } catch (e) {
      console.warn('Failed to parse event state JSON:', e);
    }
  }

  return { cleanDesc: mainText, state: { completedTasks, taskDetails }, venue };
}

export function serializeEventState(cleanDesc: string, state: EventState, venue?: string): string {
  let text = cleanDesc.trim();
  if (venue && venue.trim()) {
    text = `Lokasi: ${venue.trim()}${text ? `\n\n${text}` : ''}`;
  }
  const payload: EventState = {
    completedTasks: state.completedTasks || [],
    taskDetails: state.taskDetails || {},
  };
  const jsonStr = JSON.stringify(payload, null, 2);
  return `${text}\n\n---EVENT_STATE---\n${jsonStr}`;
}

function getAttachmentType(filenameOrUrl: string, mimeType?: string): 'pdf' | 'image' | 'file' | 'link' {
  if (mimeType?.includes('pdf') || /\.pdf$/i.test(filenameOrUrl)) return 'pdf';
  if (mimeType?.startsWith('image/') || /\.(png|jpe?g|webp|svg|gif)$/i.test(filenameOrUrl)) return 'image';
  if (
    /^https?:\/\//i.test(filenameOrUrl) &&
    (filenameOrUrl.includes('drive.google') ||
      filenameOrUrl.includes('docs.google') ||
      filenameOrUrl.includes('figma.com') ||
      filenameOrUrl.includes('notion.so') ||
      filenameOrUrl.includes('canva.com'))
  ) {
    return 'link';
  }
  return 'file';
}

async function uploadEventFile(file: File): Promise<{ url: string; size: string; type: 'pdf' | 'image' | 'file' }> {
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniquePath = `events/${Date.now()}-${cleanName}`;
  let uploadedUrl = '';

  const sizeStr =
    file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.max(1, Math.round(file.size / 1024))} KB`;

  const derivedType = getAttachmentType(file.name, file.type);
  const type = derivedType === 'link' ? 'file' : derivedType;

  // 1. Try Cloudflare Worker R2 if configured
  const workerUrl = import.meta.env.VITE_R2_WORKER_URL;
  if (workerUrl) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const form = new FormData();
        form.append('file', file);
        form.append('category', 'events');
        const res = await fetch(`${workerUrl.replace(/\/$/, '')}/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: form,
        });
        if (res.ok) {
          const data = await res.json();
          if (data.url) uploadedUrl = data.url;
        }
      }
    } catch (e) {
      console.warn('R2 Worker upload failed, falling back to Supabase storage:', e);
    }
  }

  // 2. Fallback to Supabase Storage bucket 'media'
  if (!uploadedUrl) {
    const { error: uploadError } = await supabase.storage.from('media').upload(uniquePath, file, {
      cacheControl: '3600',
      upsert: true,
    });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('media').getPublicUrl(uniquePath);
    uploadedUrl = data.publicUrl;
  }

  return { url: uploadedUrl, size: sizeStr, type };
}

interface JourneyMapProps {
  project: Project;
  onUpdate: (
    newProgress: number,
    newDescription: string,
    updateMessage: string,
    newStatus?: ProjectStatus
  ) => Promise<void>;
}

export function JourneyMap({ project, onUpdate }: JourneyMapProps) {
  const { cleanDesc, state: eventState, venue } = useMemo(
    () => parseEventState(project.description),
    [project.description]
  );
  const [activePhaseId, setActivePhaseId] = useState<number | null>(null);
  useEscapeKey(activePhaseId !== null, () => setActivePhaseId(null));
  const [isUpdating, setIsUpdating] = useState(false);

  const completedSet = useMemo(() => new Set(eventState.completedTasks), [eventState.completedTasks]);

  // Phase statistics
  const phaseStats = useMemo(() => {
    return EVENT_PHASES.map((phase) => {
      const total = phase.tasks.length;
      const completed = phase.tasks.filter((t) => completedSet.has(t.id)).length;
      const percent = Math.round((completed / total) * 100);
      return {
        ...phase,
        total,
        completed,
        percent,
        isDone: percent === 100,
        isInProgress: percent > 0 && percent < 100,
      };
    });
  }, [completedSet]);

  const totalCompleted = completedSet.size;
  const overallProgress = Math.round((totalCompleted / TOTAL_EVENT_TASKS) * 100);

  // Active phase for the drawer modal. The last open phase is kept so the panel still has
  // content to show while its exit animation plays after activePhaseId is cleared.
  const lastPhaseRef = useRef<(typeof phaseStats)[number] | null>(null);
  const activePhase = useMemo(() => {
    const found = phaseStats.find((p) => p.id === activePhaseId) || null;
    if (found) lastPhaseRef.current = found;
    return found;
  }, [phaseStats, activePhaseId]);
  const { mounted: phaseMounted, overlayRef: phaseOverlayRef, panelRef: phasePanelRef } = useModalPresence(activePhaseId !== null);
  const shownPhase = activePhase ?? lastPhaseRef.current;

  const handleToggleTask = async (taskId: string) => {
    if (isUpdating) return;
    setIsUpdating(true);

    const isDone = completedSet.has(taskId);
    const newCompleted = isDone
      ? eventState.completedTasks.filter((id) => id !== taskId)
      : [...eventState.completedTasks, taskId];

    const newProgress = Math.round((newCompleted.length / TOTAL_EVENT_TASKS) * 100);
    const newDesc = serializeEventState(
      cleanDesc,
      {
        completedTasks: newCompleted,
        taskDetails: eventState.taskDetails,
      },
      venue
    );

    const taskObj = EVENT_PHASES.flatMap((p) => p.tasks).find((t) => t.id === taskId);
    const taskName = taskObj?.title || taskId;
    const msg = isDone
      ? `Sub-task dibatalkan: "${taskName}" (Progress: ${newProgress}%)`
      : `Sub-task diselesaikan: "${taskName}" (Progress: ${newProgress}%)`;

    // Calculate corresponding project status
    let derivedStatus: ProjectStatus = project.status;
    if (newProgress === 100) {
      derivedStatus = 'completed';
    } else if (newProgress >= 80) {
      derivedStatus = 'review';
    } else if (newProgress > 0) {
      derivedStatus = 'production';
    }

    try {
      await onUpdate(newProgress, newDesc, msg, derivedStatus);
    } catch (err) {
      console.error('Failed to update event task:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkAllInPhase = async (phase: EventPhase, markCompleted: boolean) => {
    if (isUpdating) return;
    setIsUpdating(true);

    const phaseTaskIds = phase.tasks.map((t) => t.id);
    let newCompleted: string[];

    if (markCompleted) {
      newCompleted = Array.from(new Set([...eventState.completedTasks, ...phaseTaskIds]));
    } else {
      newCompleted = eventState.completedTasks.filter((id) => !phaseTaskIds.includes(id));
    }

    const newProgress = Math.round((newCompleted.length / TOTAL_EVENT_TASKS) * 100);
    const newDesc = serializeEventState(
      cleanDesc,
      {
        completedTasks: newCompleted,
        taskDetails: eventState.taskDetails,
      },
      venue
    );
    const msg = markCompleted
      ? `Semua sub-task di "${phase.title}" diselesaikan! (Progress: ${newProgress}%)`
      : `Semua sub-task di "${phase.title}" di-reset (Progress: ${newProgress}%)`;

    let derivedStatus: ProjectStatus = project.status;
    if (newProgress === 100) {
      derivedStatus = 'completed';
    } else if (newProgress >= 80) {
      derivedStatus = 'review';
    } else if (newProgress > 0) {
      derivedStatus = 'production';
    }

    try {
      await onUpdate(newProgress, newDesc, msg, derivedStatus);
    } catch (err) {
      console.error('Failed to batch update phase:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateTaskDetail = async (
    taskId: string,
    updater: (prev: TaskDetail) => TaskDetail,
    timelineMessage?: string
  ) => {
    const prevDetail: TaskDetail = eventState.taskDetails?.[taskId] || { notes: '', attachments: [] };
    const nextDetail = updater(prevDetail);

    const newTaskDetails: Record<string, TaskDetail> = {
      ...(eventState.taskDetails || {}),
      [taskId]: nextDetail,
    };

    const newState: EventState = {
      completedTasks: eventState.completedTasks,
      taskDetails: newTaskDetails,
    };

    const newDesc = serializeEventState(cleanDesc, newState, venue);
    const taskObj = EVENT_PHASES.flatMap((p) => p.tasks).find((t) => t.id === taskId);
    const taskName = taskObj?.title || taskId;
    const msg = timelineMessage || `Detail diperbarui pada "${taskName}"`;

    await onUpdate(overallProgress, newDesc, msg);
  };

  return (
    <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-8 relative overflow-hidden">
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-display font-bold text-white">Roadmap event</h3>
          {venue && (
            <p className="flex items-center gap-1 text-xs text-zinc-400 mt-1">
              <MapPin size={12} aria-hidden="true" />
              <span className="truncate max-w-[280px]">{venue}</span>
            </p>
          )}
          <p className="text-xs sm:text-sm text-zinc-400 mt-1.5">
            Enam fase dari konsep sampai pasca acara. Buka tiap fase untuk mencentang sub-task, mencatat hasil rapat, dan melampirkan dokumen.
          </p>
        </div>

        {/* Big Circular Metric */}
        <div className="flex items-center gap-4 bg-[#111118] border border-white/10 rounded-2xl p-3 px-5 self-start sm:self-auto hover:border-[#4BD200]/30 transition-colors">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" className="stroke-zinc-800" strokeWidth="4" fill="none" />
              <circle
                cx="24"
                cy="24"
                r="20"
                className="stroke-[#4BD200] transition-all duration-700 ease-out"
                strokeWidth="4"
                strokeDasharray={125.66}
                strokeDashoffset={125.66 - (125.66 * overallProgress) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <span className="absolute text-xs font-bold text-white font-mono">{overallProgress}%</span>
          </div>
          <div>
            <div className="text-[10px] font-ui text-zinc-400 font-bold">Total Progress</div>
            <div className="text-sm font-bold text-white font-display">
              {totalCompleted} <span className="text-dim font-normal font-ui">/ {TOTAL_EVENT_TASKS} Sub-task</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Interactive Winding Visual Map ── */}
      <div className="relative z-10 py-6 max-w-2xl mx-auto">
        {/* Continuous S-Curve Connector Line */}
        <div className="absolute top-12 bottom-12 left-1/2 -translate-x-1/2 w-1 hidden md:block">
          <div className="w-full h-full bg-gradient-to-b from-zinc-800 via-zinc-800 to-zinc-900 rounded-full" />
          <div
            className="absolute top-0 left-0 w-full bg-[#4BD200] rounded-full transition-all duration-700"
            style={{ height: `${overallProgress}%` }}
          />
        </div>

        {/* 6 Nodes in Winding Layout */}
        <div className="space-y-6 md:space-y-12">
          {phaseStats.map((phase, idx) => {
            const isEven = idx % 2 === 0;
            const isDone = phase.isDone;
            const inProgress = phase.isInProgress;

            return (
              <div
                key={phase.id}
                className={`flex items-center gap-4 md:gap-8 ${
                  isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                <div
                  onClick={() => setActivePhaseId(phase.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Buka fase ${phase.id}: ${phase.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActivePhaseId(phase.id);
                    }
                  }}
                  className={`flex-1 bg-[#0a0a0f] border rounded-2xl p-4 sm:p-5 transition-colors duration-200 cursor-pointer group select-none ${
                    isDone
                      ? 'border-[#4BD200]/40 bg-[#4BD200]/5 hover:border-[#4BD200]'
                      : inProgress
                      ? 'border-[#4BD200] bg-[#4BD200]/10'
                      : 'border-white/10 hover:border-white/25'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                          isDone
                            ? 'bg-[#4BD200] text-black'
                            : inProgress
                            ? 'bg-[#4BD200] text-black'
                            : 'bg-white/5 border border-white/10 text-zinc-400 group-hover:text-white'
                        }`}
                      >
                        {isDone ? <Check size={18} strokeWidth={3} /> : phase.id}
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-[#4BD200] font-bold">
                          {phase.subtitle}
                        </div>
                        <h4 className="text-sm sm:text-base font-display font-bold text-white group-hover:text-[#4BD200] transition-colors leading-snug">
                          {phase.title}
                        </h4>
                      </div>
                    </div>

                    {/* Progress Badge */}
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                        isDone
                          ? 'bg-[#4BD200]/20 text-[#4BD200] border-[#4BD200]/40'
                          : inProgress
                          ? 'bg-[#4BD200]/10 text-[#4BD200] border-[#4BD200]/30'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      {phase.completed} / {phase.total} Done
                    </span>
                  </div>

                  {/* Phase Mini Progress Bar */}
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isDone
                            ? 'bg-[#4BD200]'
                            : inProgress
                            ? 'bg-[#4BD200]/70'
                            : 'bg-zinc-700'
                        }`}
                        style={{ width: `${phase.percent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 shrink-0">{phase.percent}%</span>
                    <ChevronRight
                      size={14}
                      className="text-dim group-hover:text-[#4BD200] group-hover:translate-x-0.5 transition-all"
                    />
                  </div>
                </div>

                {/* Central Winding Node Pin (Desktop) */}
                <div className="hidden md:flex flex-col items-center justify-center shrink-0 w-12 relative">
                  <div
                    className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-md ${
                      isDone
                        ? 'bg-black border-[#4BD200] text-[#4BD200]'
                        : inProgress
                        ? 'bg-black border-[#4BD200] text-[#4BD200] ring-4 ring-[#4BD200]/20'
                        : 'bg-black border-zinc-700 text-dim'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full ${
                        isDone ? 'bg-[#4BD200]' : inProgress ? 'bg-[#4BD200]' : 'bg-zinc-800'
                      }`}
                    />
                  </div>
                </div>

                <div className="hidden md:block flex-1" />
              </div>
            );
          })}
        </div>
      </div>

      {phaseMounted && shownPhase && (
          <div ref={phaseOverlayRef} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80" role="dialog" aria-modal="true" aria-label={shownPhase.title}>
            <div
              ref={phasePanelRef as React.RefObject<HTMLDivElement>}
              className="bg-[#0a0a0f] border border-white/10 rounded-2xl w-full max-w-2xl shadow-[0_24px_64px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[92vh]"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 pb-4 border-b border-white/10 flex items-start justify-between gap-4 bg-[#111118]">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs text-zinc-400 font-mono">
                      {shownPhase.subtitle} · {shownPhase.completed} dari {shownPhase.total} selesai ({shownPhase.percent}%)
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-display font-bold text-white tracking-tight">{shownPhase.title}</h3>
                </div>

                <button
                  type="button"
                  onClick={() => setActivePhaseId(null)}
                  className="text-zinc-400 hover:text-white p-2 rounded-lg transition-colors cursor-pointer hover:bg-white/10"
                  aria-label="Tutup"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Progress bar in modal */}
              <div className="w-full h-1.5 bg-zinc-900">
                <div
                  className="h-full bg-[#4BD200] transition-all duration-300"
                  style={{ width: `${shownPhase.percent}%` }}
                />
              </div>

              {/* Sub-task checklist items list */}
              <div className="p-4 sm:p-6 space-y-3.5 overflow-y-auto flex-1">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span>Centang untuk menyelesaikan, klik panah untuk catatan & lampiran:</span>
                </div>

                {shownPhase.tasks.map((task) => {
                  const isChecked = completedSet.has(task.id);
                  const detail = eventState.taskDetails?.[task.id] || { notes: '', attachments: [] };

                  return (
                    <SubTaskItem
                      key={task.id}
                      task={task}
                      isChecked={isChecked}
                      detail={detail}
                      onToggleCheck={() => handleToggleTask(task.id)}
                      onUpdateDetail={(updater, timelineMsg) =>
                        handleUpdateTaskDetail(task.id, updater, timelineMsg)
                      }
                    />
                  );
                })}
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 px-6 border-t border-white/10 bg-[#111118] flex items-center justify-between gap-3 font-ui">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleMarkAllInPhase(shownPhase, !shownPhase.isDone)}
                  className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {shownPhase.isDone ? (
                    <>
                      <RotateCcw size={13} />
                      <span>Batal Semua</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={13} className="text-[#4BD200]" />
                      <span>Tandai Semua Selesai</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActivePhaseId(null)}
                  className="px-5 py-2 bg-[#4BD200] hover:bg-[#7cff33] text-black font-bold text-xs rounded-xl transition-all active:scale-95 cursor-pointer"
                >
                  Selesai
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

// SubTaskItem: Individual Sub-task with Expandable Notes, Deadlines & Attachments
function getDeadlineInfo(deadlineStr?: string, isChecked?: boolean) {
  if (!deadlineStr) return null;

  const target = new Date(deadlineStr);
  if (Number.isNaN(target.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(target);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const dateFormatted = targetDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const isOverdue = diffDays < 0;
  const isToday = diffDays === 0;

  let label = dateFormatted;
  let statusText = `Batas waktu: ${dateFormatted}`;

  if (isChecked) {
    statusText = `Selesai (Target: ${dateFormatted})`;
  } else if (isOverdue) {
    label = `Terlewat ${Math.abs(diffDays)} hari`;
    statusText = `⚠️ Terlewat ${Math.abs(diffDays)} hari dari batas waktu (${dateFormatted})`;
  } else if (isToday) {
    label = `Hari ini!`;
    statusText = `⏰ Batas waktu hari ini! (${dateFormatted})`;
  } else if (diffDays === 1) {
    label = `Besok`;
    statusText = `Sisa 1 hari menjelang batas waktu (${dateFormatted})`;
  } else if (diffDays <= 7) {
    label = `Sisa ${diffDays} hari`;
    statusText = `Sisa ${diffDays} hari menjelang batas waktu (${dateFormatted})`;
  }

  return {
    dateFormatted,
    isOverdue,
    isToday,
    diffDays,
    label,
    statusText,
    title: `Target Deadline: ${dateFormatted}`,
  };
}

interface SubTaskItemProps {
  key?: React.Key;
  task: EventSubTask;
  isChecked: boolean;
  detail: TaskDetail;
  onToggleCheck: () => void;
  onUpdateDetail: (updater: (prev: TaskDetail) => TaskDetail, timelineMsg?: string) => Promise<void>;
}

function SubTaskItem({ task, isChecked, detail, onToggleCheck, onUpdateDetail }: SubTaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { mounted: detailMounted, ref: detailRef } = usePresence<HTMLDivElement>(isExpanded, collapseIn, collapseOut);
  const [notes, setNotes] = useState(detail.notes || '');
  const [deadline, setDeadline] = useState(detail.deadline || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSavedSuccess, setNotesSavedSuccess] = useState(false);

  // Attachment upload / link states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showAddLinkForm, setShowAddLinkForm] = useState(false);
  const [linkName, setLinkName] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync incoming detail props if changed externally
  useEffect(() => {
    setNotes(detail.notes || '');
  }, [detail.notes]);

  useEffect(() => {
    setDeadline(detail.deadline || '');
  }, [detail.deadline]);

  const deadlineBadge = useMemo(
    () => getDeadlineInfo(detail.deadline, isChecked),
    [detail.deadline, isChecked]
  );

  const handleSaveDeadline = async (newDeadline: string) => {
    setDeadline(newDeadline);
    const formattedDate = newDeadline
      ? new Date(newDeadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'dihapus';
    try {
      await onUpdateDetail(
        (prev) => ({ ...prev, deadline: newDeadline || undefined }),
        `Deadline sub-task "${task.title}" diatur ke ${formattedDate}`
      );
    } catch (err) {
      console.error('Failed to save task deadline:', err);
    }
  };

  const hasNotes = Boolean(detail.notes && detail.notes.trim());
  const attachments = detail.attachments || [];
  const attachmentsCount = attachments.length;

  const isNotesDirty = (notes || '').trim() !== (detail.notes || '').trim();

  const handleSaveNotes = async () => {
    if (!isNotesDirty || isSavingNotes) return;
    setIsSavingNotes(true);
    try {
      await onUpdateDetail(
        (prev) => ({ ...prev, notes: notes.trim() }),
        `Catatan diperbarui pada sub-task "${task.title}"`
      );
      setNotesSavedSuccess(true);
      setTimeout(() => setNotesSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setUploadError('Ukuran file maksimal 50MB.');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const uploaded = await uploadEventFile(file);
      const newAttachment: TaskAttachment = {
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        url: uploaded.url,
        type: uploaded.type,
        size: uploaded.size,
        uploadedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      };

      await onUpdateDetail(
        (prev) => ({
          ...prev,
          attachments: [...(prev.attachments || []), newAttachment],
        }),
        `Lampiran "${file.name}" ditambahkan pada sub-task "${task.title}"`
      );
    } catch (err: any) {
      console.error('Failed to upload file:', err);
      setUploadError(err?.message || 'Upload gagal. Pastikan koneksi internet stabil.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = linkName.trim();
    const url = linkUrl.trim();
    if (!name || !url) return;

    const newAttachment: TaskAttachment = {
      id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      url: url.startsWith('http') ? url : `https://${url}`,
      type: 'link',
      uploadedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    };

    try {
      await onUpdateDetail(
        (prev) => ({
          ...prev,
          attachments: [...(prev.attachments || []), newAttachment],
        }),
        `Link "${name}" ditambahkan pada sub-task "${task.title}"`
      );
      setLinkName('');
      setLinkUrl('');
      setShowAddLinkForm(false);
    } catch (err) {
      console.error('Failed to add link attachment:', err);
    }
  };

  const handleDeleteAttachment = async (attId: string, attName: string) => {
    if (!window.confirm(`Hapus lampiran "${attName}"?`)) return;
    try {
      await onUpdateDetail(
        (prev) => ({
          ...prev,
          attachments: (prev.attachments || []).filter((a) => a.id !== attId),
        }),
        `Lampiran "${attName}" dihapus dari sub-task "${task.title}"`
      );
    } catch (err) {
      console.error('Failed to delete attachment:', err);
    }
  };

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        isChecked
          ? 'bg-[#4BD200]/5 border-[#4BD200]/30'
          : isExpanded
          ? 'bg-[#111118] border-white/20 shadow-xl'
          : 'bg-[#111118] border-white/5 hover:border-[#4BD200]/30'
      }`}
    >
      {/* Subtask Row Header */}
      <div className="p-3 sm:p-3.5 flex items-center justify-between gap-3">
        {/* Checkbox + Title */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            type="button"
            onClick={onToggleCheck}
            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
              isChecked
                ? 'bg-[#4BD200] border-[#4BD200] text-black'
                : 'border-zinc-600 bg-zinc-800/90 hover:border-zinc-400'
            }`}
            title={isChecked ? 'Tandai belum selesai' : 'Tandai selesai'}
          >
            {isChecked && <Check size={13} strokeWidth={3} />}
          </button>

          <span
            onClick={() => setIsExpanded((prev) => !prev)}
            className={`text-xs sm:text-sm leading-snug cursor-pointer select-none transition-colors truncate ${
              isChecked ? 'line-through text-zinc-400' : 'text-zinc-200 hover:text-white'
            }`}
            title="Klik untuk melihat detail & lampiran"
          >
            {task.title}
          </span>
        </div>

        {/* Indicators & Accordion Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Deadline badge */}
          {deadlineBadge && (
            <span
              onClick={() => setIsExpanded(true)}
              className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full cursor-pointer border transition-colors ${
                deadlineBadge.isOverdue && !isChecked
                  ? 'bg-red-500/15 text-red-400 border-red-500/30'
                  : deadlineBadge.isToday && !isChecked
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : isChecked
                  ? 'bg-zinc-800 text-dim border-zinc-700'
                  : 'bg-white/5 text-zinc-300 border-white/10 hover:border-[#4BD200]/40'
              }`}
              title={deadlineBadge.title}
            >
              <Calendar
                size={10}
                className={deadlineBadge.isOverdue && !isChecked ? 'text-red-400' : 'text-[#4BD200]'}
              />
              <span>{deadlineBadge.label}</span>
            </span>
          )}

          {/* Notes badge */}
          {hasNotes && (
            <span
              onClick={() => setIsExpanded(true)}
              className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full cursor-pointer hover:border-[#4BD200]/40"
              title="Memiliki catatan"
            >
              <FileText size={10} className="text-[#4BD200]" />
              <span className="hidden sm:inline">Notes</span>
            </span>
          )}

          {/* Attachments badge */}
          {attachmentsCount > 0 && (
            <span
              onClick={() => setIsExpanded(true)}
              className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full cursor-pointer hover:border-[#4BD200]/40"
              title={`${attachmentsCount} Lampiran terlampir`}
            >
              <Paperclip size={10} className="text-[#4BD200]" />
              <span>{attachmentsCount}</span>
            </span>
          )}

          {/* Expand toggle chevron */}
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title={isExpanded ? 'Tutup detail' : 'Buka catatan & lampiran'}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* ── Expandable Detail Section (Deadline, Notes & Attachments) ── */}
      {detailMounted && (
          <div
            ref={detailRef}
            className="border-t border-white/10 bg-black/40 p-3 sm:p-4 space-y-4"
          >
            {/* 1. Target Deadline Section */}
            <div className="bg-[#0a0a0f] border border-white/10 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-ui">
              <div>
                <label htmlFor={`deadline-${task.id}`} className="text-[10px] font-bold text-zinc-400 flex items-center gap-1.5">
                  <Calendar size={12} className="text-[#4BD200]" />
                  <span>Target Deadline Sub-Task</span>
                </label>
                <p className="text-[11px] text-dim mt-0.5">
                  {deadlineBadge?.statusText || 'Tentukan tanggal batas waktu untuk menyelesaikan sub-task ini.'}
                </p>
              </div>

              <BrandedDatePicker
                value={deadline}
                onChange={handleSaveDeadline}
                id={`deadline-${task.id}`}
                size="sm"
                clearable
                className="sm:w-52"
              />
            </div>

            {/* 2. Catatan / Notes Section */}
            <div className="font-ui">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold text-zinc-400 flex items-center gap-1.5">
                  <FileText size={12} className="text-[#4BD200]" />
                  <span>Catatan & Instruksi Detail</span>
                </label>
                {notesSavedSuccess && (
                  <span className="text-[10px] text-[#4BD200] font-semibold flex items-center gap-1">
                    <Check size={11} /> Tersimpan
                  </span>
                )}
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tulis catatan rapat, nama PIC, rincian anggaran, link meeting, atau spesifikasi teknis..."
                className="w-full bg-[#000000]/60 border border-white/10 rounded-xl p-3 text-xs text-zinc-200 placeholder:text-dim focus:outline-none focus:border-[#4BD200] focus:ring-1 focus:ring-[#4BD200] min-h-[72px] resize-y transition-all"
              />

              {isNotesDirty && (
                <div className="flex justify-end mt-1.5">
                  <button
                    type="button"
                    disabled={isSavingNotes}
                    onClick={handleSaveNotes}
                    className="px-3 py-1.5 bg-[#4BD200] hover:bg-[#7cff33] text-black text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSavingNotes ? (
                      <>
                        <Loader2 size={12} className="animate-spin" /> Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save size={12} /> Simpan Catatan
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* 2. Lampiran File & Dokumen */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold text-zinc-400 flex items-center gap-1.5">
                  <Paperclip size={12} className="text-[#4BD200]" />
                  <span>Lampiran Dokumen & File ({attachmentsCount})</span>
                </label>
              </div>

              {/* Attachments List */}
              {attachments.length > 0 ? (
                <div className="space-y-1.5 mb-3">
                  {attachments.map((att) => {
                    const isPdf = att.type === 'pdf';
                    const isImg = att.type === 'image';
                    const isLink = att.type === 'link';

                    return (
                      <div
                        key={att.id}
                        className="flex items-center justify-between gap-2 p-2 px-3 rounded-lg bg-zinc-900/90 border border-white/5 hover:border-white/15 transition-all group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {/* File Type Icon */}
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                              isPdf
                                ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                                : isImg
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : isLink
                                ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {isPdf ? (
                              <FileText size={14} />
                            ) : isImg ? (
                              <ImageIcon size={14} />
                            ) : isLink ? (
                              <ExternalLink size={14} />
                            ) : (
                              <FileIcon size={14} />
                            )}
                          </div>

                          {/* File info */}
                          <div className="min-w-0 flex-1">
                            <a
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-zinc-200 font-medium hover:text-[#4BD200] transition-colors truncate block"
                              title={att.name}
                            >
                              {att.name}
                            </a>
                            <div className="flex items-center gap-2 text-[10px] text-dim">
                              {att.size && <span>{att.size}</span>}
                              {att.uploadedAt && <span>• {att.uploadedAt}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                            title="Buka lampiran"
                          >
                            <ExternalLink size={13} />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDeleteAttachment(att.id, att.name)}
                            className="p-1.5 rounded-md text-dim hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Hapus lampiran"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-dim italic mb-3">
                  Belum ada lampiran file atau link untuk sub-task ini.
                </p>
              )}

              {uploadError && (
                <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-2 mb-2">
                  <AlertCircle size={13} className="shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Form Tambah Link Manual */}
              {showAddLinkForm ? (
                <form onSubmit={handleAddLink} className="p-3 bg-zinc-900 border border-white/10 rounded-xl space-y-2 mb-2">
                  <div className="text-[11px] font-bold text-zinc-300">Tambah Link Dokumen (Google Drive / Figma / dll)</div>
                  <input
                    type="text"
                    required
                    value={linkName}
                    onChange={(e) => setLinkName(e.target.value)}
                    placeholder="Nama dokumen, e.g. Dokumen RAB Final Google Docs"
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-dim focus:outline-none focus:border-[#4BD200]"
                  />
                  <input
                    type="url"
                    required
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://docs.google.com/..."
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-dim focus:outline-none focus:border-[#4BD200]"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddLinkForm(false)}
                      className="px-2.5 py-1 text-xs text-zinc-400 hover:text-white"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-[#4BD200] hover:bg-[#4BD200]/90 text-black font-bold text-xs rounded-lg"
                    >
                      Tambahkan
                    </button>
                  </div>
                </form>
              ) : (
                /* Action buttons: Upload File & Tambah Link */
                <div className="flex flex-wrap items-center gap-2">
                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="application/pdf,image/*,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
                    className="hidden"
                  />

                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 size={13} className="animate-spin text-[#4BD200]" />
                        <span>Mengunggah file...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={13} className="text-[#4BD200]" />
                        <span>Upload File (PDF/Gambar/Doc)</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAddLinkForm(true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Link2 size={13} className="text-[#4BD200]" />
                    <span>Tambah Link Dokumen</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  );
}
