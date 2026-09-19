import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Plus, FolderOpen } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useProjects } from '../hooks/useProjects';
import { ProjectCard } from '../components/ProjectCard';
import { NewProjectModal } from '../components/NewProjectModal';
import type { Project, ProjectStatus } from '../types';

export function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');
  
  const { projects, loading, createProject } = useProjects({
    search: searchTerm || undefined,
    status: (statusFilter as ProjectStatus) || undefined
  });

  const isNewModalOpen = searchParams.get('new') === 'true';

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
        <h1 className="text-2xl font-bold text-white">Projects</h1>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#4BD200]"
            />
          </div>
          
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4BD200]"
          >
            <option value="">All Statuses</option>
            <option value="briefing">Briefing</option>
            <option value="concept">Concept</option>
            <option value="production">Production</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>

          <button 
            onClick={() => setSearchParams({ new: 'true' })}
            className="bg-[#4BD200] hover:bg-[#4BD200]/90 text-black px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Plus size={16} /> New Project
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-48 bg-zinc-900/50 rounded-xl animate-pulse border border-white/5" />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {projects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onClick={(p) => navigate(`/admin/projects/${p.id}`)} 
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-20 bg-zinc-900/30 rounded-xl border border-white/5">
          <FolderOpen size={48} className="mx-auto text-zinc-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No projects found</h3>
          <p className="text-zinc-400 text-sm">Adjust your filters or create a new project.</p>
        </div>
      )}

      <NewProjectModal
        open={isNewModalOpen}
        onClose={closeNewModal}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}
