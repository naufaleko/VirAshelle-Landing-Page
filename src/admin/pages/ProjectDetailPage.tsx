import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Trash2, Pencil, Calendar, Tag, Banknote, User, Flag, MapPin, AlertCircle } from 'lucide-react';
import { useProjectDetail } from '../hooks/useProjectDetail';
import { StatusBadge } from '../components/StatusBadge';
import { ProjectFormModal } from '../components/ProjectFormModal';
import { BrandedDropdown } from '../components/BrandedDropdown';
import { JourneyMap, parseEventState } from '../components/JourneyMap';
import { useAdmin } from '../../lib/useAdmin';
import { STATUS_OPTIONS, STATUS_WORKFLOW, statusLabel, priorityLabel } from '../lib/projectStatus';
import type { Project, ProjectStatus } from '../types';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAdmin();

  const { project, updates, loading, error, updateProject, addUpdate, deleteProject } = useProjectDetail(id || '');

  const [updateMsg, setUpdateMsg] = useState('');
  const [newStatus, setNewStatus] = useState<ProjectStatus | ''>('');
  const [newProgress, setNewProgress] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const author = user?.email || 'Admin';

  const isEvent = project?.category === 'Event';
  const { cleanDesc, venue: eventVenue } = useMemo(
    () => (project ? parseEventState(project.description) : { cleanDesc: '', venue: '' }),
    [project]
  );

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-3" role="status">
        <div className="w-8 h-8 border-2 border-[#4BD200]/30 border-t-[#4BD200] rounded-full animate-spin" aria-hidden="true" />
        <span className="text-xs font-ui text-zinc-400">Memuat detail proyek...</span>
      </div>
    );
  }
  if (error || !project) {
    return (
      <div className="max-w-xl mx-auto mt-16 bg-[#111118] border border-red-500/30 rounded-2xl p-6 text-center space-y-3" role="alert">
        <AlertCircle size={28} className="mx-auto text-red-400" aria-hidden="true" />
        <h1 className="text-lg font-display font-bold text-white">{error ? 'Detail proyek tidak bisa dimuat' : 'Proyek tidak ditemukan'}</h1>
        <p className="text-xs font-ui text-zinc-400">{error || 'Proyek ini mungkin sudah dihapus atau tautannya salah.'}</p>
        <button
          type="button"
          onClick={() => navigate('/admin/projects')}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-ui font-semibold transition-colors"
        >
          Kembali ke daftar proyek
        </button>
      </div>
    );
  }

  const handleEditSubmit = async (payload: Partial<Project>) => {
    // Errors are rethrown so the modal renders them in its own inline error box.
    // A status change made through the edit form is logged to the timeline just
    // like one made through the workflow steps, so no transition goes unrecorded.
    if (payload.status && payload.status !== project.status) {
      await addUpdate(
        {
          message: `Status diubah dari ${statusLabel(project.status)} ke ${statusLabel(payload.status)}`,
          author,
          old_status: project.status,
          new_status: payload.status,
          progress: payload.status === 'completed' ? 100 : null,
        },
        payload
      );
    } else {
      await updateProject(payload);
    }
    setIsEditOpen(false);
  };

  const handleJourneyMapUpdate = async (
    newProgress: number,
    newDescription: string,
    updateMessage: string,
    newStatus?: ProjectStatus
  ) => {
    const projectPatch: Partial<Project> = {
      progress: newProgress,
      description: newDescription,
    };
    if (newStatus && newStatus !== project.status) {
      projectPatch.status = newStatus;
    }

    await addUpdate(
      {
        message: updateMessage,
        author,
        old_status: newStatus && newStatus !== project.status ? project.status : null,
        new_status: newStatus && newStatus !== project.status ? newStatus : null,
        progress: newProgress,
      },
      projectPatch
    );
  };

  const handleWorkflowStep = async (step: ProjectStatus) => {
    if (step === project.status) return;
    const oldLabel = statusLabel(project.status);
    const newLabel = statusLabel(step);
    if (!window.confirm(`Ubah status proyek ke "${newLabel}"?`)) return;
    try {
      await addUpdate(
        {
          message: `Status diubah dari ${oldLabel} ke ${newLabel}`,
          author,
          old_status: project.status,
          new_status: step,
          // Entering 'completed' forces progress to 100 on the project; mirror it here
          progress: step === 'completed' ? 100 : null,
        },
        { status: step }
      );
    } catch (err) {
      console.error(err);
      alert('Status proyek gagal diubah. Coba lagi atau periksa hak akses.');
    }
  };

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateMsg.trim()) return;

    setIsSubmitting(true);
    try {
      const pUpdates: Partial<Project> = {};
      if (newStatus) pUpdates.status = newStatus as ProjectStatus;
      // Clamp to the DB CHECK range; completing a project always means 100%
      let progress: number | null = newProgress !== '' ? Math.min(100, Math.max(0, Number(newProgress))) : null;
      if (newStatus === 'completed') progress = 100;
      if (progress !== null) pUpdates.progress = progress;

      await addUpdate({
        message: updateMsg,
        author,
        old_status: newStatus ? project.status : null,
        new_status: newStatus ? (newStatus as ProjectStatus) : null,
        progress
      }, pUpdates);
      
      setUpdateMsg('');
      setNewStatus('');
      setNewProgress('');
    } catch (err) {
      console.error(err);
      alert('Pembaruan gagal disimpan. Coba lagi atau periksa hak akses.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Hapus proyek ini beserta semua riwayat pembaruannya? Tindakan ini tidak bisa dibatalkan.')) {
      try {
        await deleteProject();
        navigate('/admin/projects');
      } catch (err) {
        alert('Proyek gagal dihapus. Coba lagi atau periksa hak akses.');
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <button 
        onClick={() => navigate('/admin/projects')} 
        className="flex items-center gap-2 text-xs sm:text-sm font-ui text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={16} aria-hidden="true" /> Kembali ke daftar proyek
      </button>

      {/* Header */}
      <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-2.5">
            <StatusBadge status={project.status} />
            <span className="text-[11px] font-ui font-semibold px-2.5 py-1 rounded-full border border-white/10 bg-black/40 text-zinc-300">
              Prioritas {priorityLabel(project.priority).toLowerCase()}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2 break-words">{project.title}</h1>
          <p className="text-base sm:text-lg font-ui text-zinc-400 break-words">{project.client}</p>
        </div>
        
        <div className="flex items-center gap-2 self-start shrink-0">
          <button
            onClick={() => setIsEditOpen(true)}
            className="text-zinc-400 hover:text-[#4BD200] hover:bg-[#4BD200]/10 p-2.5 rounded-xl border border-transparent hover:border-[#4BD200]/30 transition-all"
            title="Edit proyek"
            aria-label="Edit proyek"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2.5 rounded-xl border border-transparent hover:border-red-500/30 transition-all"
            title="Hapus proyek"
            aria-label="Hapus proyek"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-display font-bold text-white">
                {isEvent ? 'Deskripsi & konsep event' : 'Deskripsi'}
              </h3>
              {isEvent && eventVenue && (
                <div className="flex items-center gap-1.5 text-xs font-ui text-[#4BD200] bg-[#4BD200]/10 border border-[#4BD200]/30 px-3 py-1 rounded-full">
                  <MapPin size={13} className="text-[#4BD200]" />
                  <span className="truncate max-w-[200px]">{eventVenue}</span>
                </div>
              )}
            </div>
            <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">{cleanDesc || 'Belum ada deskripsi. Tambahkan lewat tombol edit di atas.'}</p>
          </div>

          {isEvent ? (
            <JourneyMap project={project} onUpdate={handleJourneyMapUpdate} />
          ) : (
            <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-display font-bold text-white">Tahap pengerjaan</h3>
                <span className="text-xl font-mono font-bold text-[#4BD200]">{project.progress}%</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-black/60 rounded-full mb-8 overflow-hidden p-0.5 border border-white/5">
                <div 
                  className="h-full bg-[#4BD200] rounded-full transition-all duration-500" 
                  style={{ width: `${project.progress}%` }} 
                />
              </div>

              {/* Status Steps */}
              <div className="flex justify-between relative">
                <div className="absolute top-4 left-0 w-full h-0.5 bg-white/10 -z-10" />
                {STATUS_WORKFLOW.map((step, idx) => {
                  const isActive = project.status === step;
                  const isPast = STATUS_WORKFLOW.indexOf(project.status) > idx;

                  return (
                    <div key={step} className="flex flex-col items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleWorkflowStep(step)}
                        title={isActive ? 'Status saat ini' : `Ubah status ke ${statusLabel(step)}`}
                        aria-current={isActive ? 'step' : undefined}
                        className={`w-9 h-9 rounded-full flex items-center justify-center border-2 font-mono text-xs transition-all ${
                          isActive ? 'bg-[#4BD200] border-[#4BD200] text-black font-bold cursor-default'
                          : isPast ? 'bg-[#4BD200]/20 border-[#4BD200] text-[#4BD200]'
                          : 'bg-black/50 border-white/10 text-dim hover:border-white/30'
                        }`}
                      >
                        {idx + 1}
                      </button>
                      <span className={`text-[10px] sm:text-xs font-ui text-center max-w-[58px] sm:max-w-none leading-tight ${isActive || isPast ? 'text-zinc-200 font-semibold' : 'text-dim'}`}>
                        {statusLabel(step)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
            <h3 className="text-xs font-ui font-semibold text-zinc-400 mb-5">Detail proyek</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Tag size={18} className="text-zinc-400 mt-0.5" aria-hidden="true" />
                <div>
                  <div className="text-xs font-ui text-dim">Kategori</div>
                  <div className="text-sm font-ui text-zinc-200">{project.category}</div>
                </div>
              </li>
              {isEvent && eventVenue && (
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-zinc-400 mt-0.5" aria-hidden="true" />
                  <div>
                    <div className="text-xs font-ui text-dim">Lokasi</div>
                    <div className="text-sm font-ui text-zinc-200 font-medium">{eventVenue}</div>
                  </div>
                </li>
              )}
              <li className="flex items-start gap-3">
                <Calendar size={18} className="text-zinc-400 mt-0.5" aria-hidden="true" />
                <div>
                  <div className="text-xs font-ui text-dim">{isEvent ? 'Hari H event' : 'Tenggat'}</div>
                  <div className={`text-sm font-mono ${project.deadline && new Date(project.deadline) < new Date() && project.status !== 'completed' ? 'text-red-400' : 'text-zinc-200'}`}>
                    {project.deadline ? new Date(project.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Belum ditentukan'}
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Banknote size={18} className="text-zinc-400 mt-0.5" aria-hidden="true" />
                <div>
                  <div className="text-xs font-ui text-dim">Anggaran</div>
                  <div className="text-sm font-mono text-zinc-200">{project.budget ? `Rp ${project.budget.toLocaleString('id-ID')}` : 'Belum ditentukan'}</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <User size={18} className="text-zinc-400 mt-0.5" aria-hidden="true" />
                <div>
                  <div className="text-xs font-ui text-dim">Tim</div>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {project.team && project.team.length > 0 ? project.team.map(m => (
                      <span key={m} className="px-2.5 py-1 bg-black/50 border border-white/10 rounded-lg text-xs font-ui text-zinc-300">{m}</span>
                    )) : <span className="text-sm font-ui text-dim">Belum ada anggota tim</span>}
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Updates Timeline */}
      <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <h3 className="text-lg font-display font-bold text-white mb-6">Riwayat pembaruan</h3>
        
        {updates.length > 0 ? (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#4BD200]/20 before:to-transparent">
            {updates.map((update) => (
              <div key={update.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-[#0a0a0f] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-[#4BD200]">
                  {update.new_status ? <Flag size={14} aria-label="Perubahan status" /> : <div className="w-2 h-2 rounded-full bg-[#4BD200]" aria-hidden="true" />}
                </div>
                
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-white/10 bg-[#0a0a0f]">
                  <div className="flex flex-wrap items-baseline justify-between gap-1.5 mb-2">
                    <span className="font-ui font-semibold text-sm text-white truncate max-w-[65%]">{update.author}</span>
                    <span className="text-xs font-mono text-dim shrink-0">{new Date(update.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-zinc-300 break-words leading-relaxed">{update.message}</p>
                  
                  {(update.new_status || update.progress !== null) && (
                    <div className="mt-3 pt-3 border-t border-white/[0.08] flex gap-2 flex-wrap font-ui">
                      {update.old_status && update.new_status && (
                        <div className="text-xs flex items-center gap-1 text-zinc-400">
                          Status: <span className="line-through">{statusLabel(update.old_status)}</span> <span aria-hidden="true">→</span> <span className="text-[#4BD200] font-semibold">{statusLabel(update.new_status)}</span>
                        </div>
                      )}
                      {update.progress !== null && (
                        <div className="text-xs flex items-center gap-1 text-zinc-400">
                          Progress: <span className="text-white font-mono font-bold">{update.progress}%</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-zinc-400 font-ui text-xs text-center py-8">Belum ada pembaruan. Tulis yang pertama di bawah ini.</p>
        )}

        {/* Add Update Form */}
        <form onSubmit={handleAddUpdate} className="mt-8 pt-8 border-t border-white/[0.08]">
          <h4 className="text-sm font-display font-bold text-white mb-4">Tulis pembaruan</h4>
          <textarea 
            required
            value={updateMsg}
            onChange={(e) => setUpdateMsg(e.target.value)}
            placeholder="Progres terbaru, keputusan, atau hambatan"
            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#4BD200] focus:ring-1 focus:ring-[#4BD200]/30 min-h-[100px] mb-4 resize-none transition-all placeholder:text-dim"
          />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <BrandedDropdown
                size="sm"
                ariaLabel="Status baru"
                className="w-full sm:w-44"
                value={newStatus}
                onChange={(v) => setNewStatus(v as ProjectStatus | '')}
                options={[{ value: '', label: 'Status tetap' }, ...STATUS_OPTIONS]}
              />
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-ui text-zinc-400">Progres:</span>
                <input 
                  type="number" 
                  min="0" max="100" 
                  value={newProgress} 
                  onChange={(e) => setNewProgress(e.target.value ? Number(e.target.value) : '')}
                  placeholder={project.progress.toString()}
                  className="w-16 bg-black/50 border border-white/10 rounded-xl px-2 py-2 text-sm font-mono text-white focus:outline-none focus:border-[#4BD200] text-center"
                />
                <span className="text-sm font-mono text-zinc-400">%</span>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[#4BD200] hover:bg-[#7cff33] text-black px-6 py-2.5 rounded-xl text-sm font-ui font-bold flex items-center gap-2 disabled:opacity-50 transition-colors active:scale-95"
            >
              {isSubmitting ? 'Menyimpan...' : <><Send size={16} aria-hidden="true" /> Simpan pembaruan</>}
            </button>
          </div>
        </form>
      </div>

      <ProjectFormModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEditSubmit}
        initial={project}
      />
    </div>
  );
}
