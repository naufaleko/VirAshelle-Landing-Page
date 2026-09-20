import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Plus, FolderOpen, AlertCircle } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectFormModal } from '../components/ProjectFormModal';
import { BrandedDropdown } from '../components/BrandedDropdown';
import { useAdmin } from '../../lib/useAdmin';
import { STATUS_OPTIONS } from '../lib/projectStatus';
import type { Project, ProjectStatus } from '../types';

export function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { content } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = useState('');
  // Categories seen in any loaded project, accumulated so the list never shrinks when a filter is applied.
  const [seenCategories, setSeenCategories] = useState<string[]>([]);

  const { projects, loading, error, createProject } = useProjects({
    search: searchTerm || undefined,
    status: (statusFilter as ProjectStatus) || undefined,
    category: categoryFilter || undefined,
  });

  useEffect(() => {
    // Keep the raw stored value: the filter is an exact .eq() match, so a trimmed
    // option would never match a legacy row that has surrounding whitespace.
    const incoming = projects.map((p) => p.category).filter(Boolean) as string[];
    if (incoming.length === 0) return;
    setSeenCategories((prev) => {
      const next = Array.from(new Set([...prev, ...incoming]));
      return next.length === prev.length ? prev : next;
    });
  }, [projects]);

  const categoryOptions = useMemo(() => {
    const fromCms = (content?.services?.items || [])
      .map((s) => s.title?.trim())
      .filter(Boolean) as string[];
    return Array.from(new Set([...fromCms, ...seenCategories]));
  }, [content, seenCategories]);

  const isNewModalOpen = searchParams.get('new') === 'true';
  const hasActiveFilter = searchTerm.trim() !== '' || statusFilter !== '' || categoryFilter !== '';

  const closeNewModal = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  const handleCreateProject = async (project: Partial<Project>) => {
    const created = await createProject(project);
    closeNewModal();
    if (created?.id) navigate(`/admin/projects/${created.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight mb-1">Proyek</h1>
          <p className="text-xs sm:text-sm font-body text-zinc-400">
            {loading ? 'Memuat daftar proyek...' : `${projects.length} proyek${hasActiveFilter ? ' cocok dengan filter' : ''}. Status, tenggat, dan fase tiap proyek klien.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto font-ui">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} aria-hidden="true" />
            <input
              type="search"
              aria-label="Cari proyek"
              placeholder="Cari judul proyek..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs font-ui text-white placeholder:text-dim focus:outline-none focus:border-[#4BD200] focus:ring-1 focus:ring-[#4BD200] transition-colors"
            />
          </div>

          <BrandedDropdown
            size="sm"
            ariaLabel="Filter status"
            className="flex-1 min-w-[140px] sm:flex-none sm:w-40"
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as ProjectStatus | '')}
            options={[{ value: '', label: 'Semua Status' }, ...STATUS_OPTIONS]}
          />

          <BrandedDropdown
            size="sm"
            ariaLabel="Filter kategori"
            className="flex-1 min-w-[140px] sm:flex-none sm:w-48"
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[{ value: '', label: 'Semua Kategori' }, ...categoryOptions.map((c) => ({ value: c, label: c }))]}
          />

          <button
            onClick={() => setSearchParams({ new: 'true' })}
            className="bg-[#4BD200] hover:bg-[#7cff33] text-black px-4 py-2 rounded-xl text-xs font-ui font-bold flex items-center gap-2 active:scale-[0.98] transition-colors"
          >
            <Plus size={15} strokeWidth={2.5} aria-hidden="true" /> Proyek Baru
          </button>
        </div>
      </div>

      {error ? (
        <div className="max-w-xl mx-auto mt-10 bg-[#111118] border border-red-500/30 rounded-2xl p-6 text-center space-y-3" role="alert">
          <AlertCircle size={28} className="mx-auto text-red-400" aria-hidden="true" />
          <h2 className="text-lg font-display font-bold text-white">Daftar proyek tidak bisa dimuat</h2>
          <p className="text-xs font-ui text-zinc-400">{error}</p>
          <p className="text-xs font-ui text-zinc-400">Periksa koneksi atau hak akses tabel projects, lalu muat ulang.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-ui font-semibold transition-colors"
          >
            Muat ulang
          </button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="status" aria-label="Memuat daftar proyek">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-48 bg-[#111118] rounded-2xl animate-pulse border border-white/5" aria-hidden="true" />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={(p) => navigate(`/admin/projects/${p.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#111118] rounded-2xl border border-white/10">
          <FolderOpen size={40} className="mx-auto text-zinc-400 mb-4" aria-hidden="true" />
          {hasActiveFilter ? (
            <>
              <h2 className="text-lg font-display font-bold text-white mb-1">Tidak ada proyek yang cocok</h2>
              <p className="text-zinc-400 font-body text-xs">Ubah kata kunci atau pilih "Semua Status" dan "Semua Kategori".</p>
            </>
          ) : (
            <>
              <h2 className="text-lg font-display font-bold text-white mb-1">Belum ada proyek</h2>
              <p className="text-zinc-400 font-body text-xs mb-4">Proyek pertama akan muncul di sini setelah dibuat.</p>
              <button
                type="button"
                onClick={() => setSearchParams({ new: 'true' })}
                className="bg-[#4BD200] hover:bg-[#7cff33] text-black px-4 py-2 rounded-xl text-xs font-ui font-bold transition-colors"
              >
                Buat proyek pertama
              </button>
            </>
          )}
        </div>
      )}

      <ProjectFormModal
        open={isNewModalOpen}
        onClose={closeNewModal}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}
