import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../lib/useAdmin';
import { Save, Loader2, Plus, Trash2, CheckCircle2, Film, Image as ImageIcon } from 'lucide-react';
import { MediaUploader } from '../components/MediaUploader';
import { BrandedDropdown } from '../components/BrandedDropdown';
import { formatBrandText, unformatBrandText } from '../../lib/textFormat';

const TABS = [
  'Hero',
  'About',
  'Services',
  'Why Us',
  'Workflow',
  'Portfolio',
  'Milestone',
  'Team',
  'Clients',
  'Footer'
] as const;

type TabType = typeof TABS[number];

export function CmsPage() {
  const { content, updateContent } = useAdmin();
  const [activeTab, setActiveTab] = useState<TabType>('Hero');
  const [formData, setFormData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (content) {
      const cloned = JSON.parse(JSON.stringify(content));
      // Convert raw HTML span tags to friendly *word* syntax for editing
      if (cloned.hero?.title) cloned.hero.title = unformatBrandText(cloned.hero.title);
      if (cloned.about?.content) cloned.about.content = unformatBrandText(cloned.about.content);
      if (cloned.footer?.title) cloned.footer.title = unformatBrandText(cloned.footer.title);
      setFormData(cloned);
    }
  }, [content]);

  if (!formData) {
    return (
      <div className="flex items-center justify-center p-12 text-zinc-400 text-sm font-ui" role="status">
        <Loader2 className="w-6 h-6 animate-spin text-[#4BD200] mr-2" aria-hidden="true" />
        Memuat konten landing page...
      </div>
    );
  }

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');
      const toSave = JSON.parse(JSON.stringify(formData));
      // Automatically convert *word* into brand green spans when saving
      if (toSave.hero?.title) toSave.hero.title = formatBrandText(toSave.hero.title);
      if (toSave.about?.content) toSave.about.content = formatBrandText(toSave.about.content);
      if (toSave.footer?.title) toSave.footer.title = formatBrandText(toSave.footer.title);

      await updateContent(toSave);
      setMessage('Perubahan berhasil disimpan ke database!');
      setTimeout(() => setMessage(''), 3500);
    } catch (error: any) {
      setMessage(error?.message || 'Gagal menyimpan perubahan.');
    } finally {
      setSaving(false);
    }
  };

  const updateSectionField = (section: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [field]: value
      }
    }));
  };

  // 1. HERO TAB
  const renderHeroTab = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-bold text-white mb-1">Hero Section</h3>
        <p className="text-xs text-zinc-400">Heading utama dan tombol call-to-action di bagian paling atas.</p>
      </div>
      <div>
        <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
          Title
        </label>
        <textarea
          value={formData.hero?.title || ''}
          onChange={(e) => updateSectionField('hero', 'title', e.target.value)}
          className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white font-mono text-sm focus:outline-none focus:border-[#4BD200] transition-colors"
          rows={3}
          placeholder="WE\n*ARCHITECT*\nIDENTITY."
        />
        <p className="text-[11px] text-dim mt-1.5 flex items-center gap-1">
          💡 <span>Tips: Gunakan tanda bintang <code className="text-[#4BD200]">*kata*</code> untuk memberi warna hijau brand VirAshelle pada kata tersebut.</span>
        </p>
      </div>
      <div>
        <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Subtitle</label>
        <textarea
          value={formData.hero?.subtitle || ''}
          onChange={(e) => updateSectionField('hero', 'subtitle', e.target.value)}
          className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#4BD200] transition-colors"
          rows={3}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Button Text</label>
        <input
          type="text"
          value={formData.hero?.buttonText || ''}
          onChange={(e) => updateSectionField('hero', 'buttonText', e.target.value)}
          className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#4BD200] transition-colors"
        />
      </div>
    </div>
  );

  // 2. ABOUT TAB
  const renderAboutTab = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-bold text-white mb-1">About Section</h3>
        <p className="text-xs text-zinc-400">Deskripsi narasi dan cerita studio VirAshelle.</p>
      </div>
      <div>
        <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Section Title</label>
        <input
          type="text"
          value={formData.about?.title || ''}
          onChange={(e) => updateSectionField('about', 'title', e.target.value)}
          className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#4BD200] transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Content</label>
        <textarea
          value={formData.about?.content || ''}
          onChange={(e) => updateSectionField('about', 'content', e.target.value)}
          className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#4BD200] transition-colors"
          rows={7}
          placeholder="*VirAshelle* is a modern multimedia creative studio..."
        />
        <p className="text-[11px] text-dim mt-1.5 flex items-center gap-1">
          💡 <span>Tips: Gunakan <code className="text-[#4BD200]">*kata*</code> untuk memberi warna hijau brand pada kata atau kalimat tertentu.</span>
        </p>
      </div>
    </div>
  );

  // 3. SERVICES TAB
  const renderServicesTab = () => {
    const items = formData.services?.items || [];
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Services Section</h3>
            <p className="text-xs text-zinc-400">Layanan inti studio yang ditawarkan ke klien.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              const next = [...items, { title: 'NEW SERVICE', desc: 'Deskripsi layanan baru...' }];
              updateSectionField('services', 'items', next);
            }}
            className="px-3 py-1.5 bg-[#4BD200]/10 hover:bg-[#4BD200]/20 text-[#4BD200] border border-[#4BD200]/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus size={14} /> Tambah Layanan
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Header Title</label>
            <input
              type="text"
              value={formData.services?.title || ''}
              onChange={(e) => updateSectionField('services', 'title', e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#4BD200]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Sub Header</label>
            <input
              type="text"
              value={formData.services?.description || ''}
              onChange={(e) => updateSectionField('services', 'description', e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#4BD200]"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-xs font-bold text-zinc-400">Daftar Layanan ({items.length})</label>
          {items.map((srv: any, idx: number) => (
            <div key={idx} className="p-4 bg-zinc-950 border border-white/10 rounded-xl relative space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#4BD200] font-bold">Layanan #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => {
                    const next = items.filter((_: any, i: number) => i !== idx);
                    updateSectionField('services', 'items', next);
                  }}
                  className="text-dim hover:text-red-400 transition-colors p-1"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <input
                type="text"
                value={srv.title || ''}
                placeholder="Judul Layanan (misal: VIDEO EDITING)"
                onChange={(e) => {
                  const next = [...items];
                  next[idx] = { ...next[idx], title: e.target.value };
                  updateSectionField('services', 'items', next);
                }}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-[#4BD200]"
              />
              <textarea
                value={srv.desc || ''}
                placeholder="Deskripsi detail layanan..."
                rows={2}
                onChange={(e) => {
                  const next = [...items];
                  next[idx] = { ...next[idx], desc: e.target.value };
                  updateSectionField('services', 'items', next);
                }}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-[#4BD200]"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 4. WHY US TAB
  const renderWhyUsTab = () => {
    const items = formData.whyUs?.items || [];
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Why Us Section</h3>
            <p className="text-xs text-zinc-400">Keunggulan komparatif dan value proposition VirAshelle.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              const next = [...items, { title: 'Keunggulan Baru', desc: 'Penjelasan value...' }];
              updateSectionField('whyUs', 'items', next);
            }}
            className="px-3 py-1.5 bg-[#4BD200]/10 hover:bg-[#4BD200]/20 text-[#4BD200] border border-[#4BD200]/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus size={14} /> Tambah Keunggulan
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Title</label>
            <input
              type="text"
              value={formData.whyUs?.title || ''}
              onChange={(e) => updateSectionField('whyUs', 'title', e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#4BD200]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Subtitle / Deskripsi Singkat</label>
            <input
              type="text"
              value={formData.whyUs?.description || ''}
              onChange={(e) => updateSectionField('whyUs', 'description', e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#4BD200]"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-xs font-bold text-zinc-400">Poin Keunggulan ({items.length})</label>
          {items.map((item: any, idx: number) => (
            <div key={idx} className="p-4 bg-zinc-950 border border-white/10 rounded-xl relative space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#4BD200] font-bold">Poin #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => {
                    const next = items.filter((_: any, i: number) => i !== idx);
                    updateSectionField('whyUs', 'items', next);
                  }}
                  className="text-dim hover:text-red-400 transition-colors p-1"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <input
                type="text"
                value={item.title || ''}
                placeholder="Judul Keunggulan"
                onChange={(e) => {
                  const next = [...items];
                  next[idx] = { ...next[idx], title: e.target.value };
                  updateSectionField('whyUs', 'items', next);
                }}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-[#4BD200]"
              />
              <textarea
                value={item.desc || ''}
                placeholder="Deskripsi keunggulan..."
                rows={2}
                onChange={(e) => {
                  const next = [...items];
                  next[idx] = { ...next[idx], desc: e.target.value };
                  updateSectionField('whyUs', 'items', next);
                }}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-[#4BD200]"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 5. WORKFLOW TAB
  const renderWorkflowTab = () => {
    const items = formData.workflow?.items || [];
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Workflow Section</h3>
            <p className="text-xs text-zinc-400">Tahapan alur pengerjaan project dari brief sampai serah terima.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              const num = String(items.length + 1).padStart(2, '0');
              const next = [...items, { number: num, title: 'Step Baru', desc: 'Deskripsi langkah...' }];
              updateSectionField('workflow', 'items', next);
            }}
            className="px-3 py-1.5 bg-[#4BD200]/10 hover:bg-[#4BD200]/20 text-[#4BD200] border border-[#4BD200]/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus size={14} /> Tambah Langkah
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Section Title</label>
          <input
            type="text"
            value={formData.workflow?.title || ''}
            onChange={(e) => updateSectionField('workflow', 'title', e.target.value)}
            className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#4BD200]"
          />
        </div>

        <div className="space-y-4">
          <label className="block text-xs font-bold text-zinc-400">Daftar Langkah ({items.length})</label>
          {items.map((step: any, idx: number) => (
            <div key={idx} className="p-4 bg-zinc-950 border border-white/10 rounded-xl relative space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#4BD200] font-bold">Langkah #{step.number || idx + 1}</span>
                <button
                  type="button"
                  onClick={() => {
                    const next = items.filter((_: any, i: number) => i !== idx);
                    updateSectionField('workflow', 'items', next);
                  }}
                  className="text-dim hover:text-red-400 transition-colors p-1"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <div className="grid grid-cols-[80px_minmax(0,1fr)] gap-3">
                <input
                  type="text"
                  value={step.number || ''}
                  placeholder="01"
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = { ...next[idx], number: e.target.value };
                    updateSectionField('workflow', 'items', next);
                  }}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white font-mono text-center text-sm focus:outline-none focus:border-[#4BD200]"
                />
                <input
                  type="text"
                  value={step.title || ''}
                  placeholder="Judul Tahap"
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = { ...next[idx], title: e.target.value };
                    updateSectionField('workflow', 'items', next);
                  }}
                  className="w-full min-w-0 bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-[#4BD200]"
                />
              </div>
              <textarea
                value={step.desc || ''}
                placeholder="Deskripsi langkah..."
                rows={2}
                onChange={(e) => {
                  const next = [...items];
                  next[idx] = { ...next[idx], desc: e.target.value };
                  updateSectionField('workflow', 'items', next);
                }}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-[#4BD200]"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 6. PORTFOLIO TAB (with MediaUploader)
  const renderPortfolioTab = () => {
    const items = formData.portfolio?.items || [];
    const serviceList = (formData.services?.items || [])
      .map((s: any) => s.title?.trim())
      .filter(Boolean);
    const serviceOptions = serviceList.length > 0
      ? serviceList
      : ['VIDEO EDITING', 'MOTION GRAPHIC', '3D PRODUCTION', 'GRAPHIC DESIGN'];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Portfolio Works</h3>
            <p className="text-xs text-zinc-400">Showcase karya terpilih di bagian galeri landing page.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              const next = [
                ...items,
                {
                  id: String(Date.now()),
                  title: 'Project Baru',
                  category: serviceOptions[0] || 'VIDEO EDITING',
                  type: 'image',
                  src: '',
                  desc: ''
                }
              ];
              updateSectionField('portfolio', 'items', next);
            }}
            className="px-3 py-1.5 bg-[#4BD200]/10 hover:bg-[#4BD200]/20 text-[#4BD200] border border-[#4BD200]/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus size={14} /> Tambah Karya
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Title</label>
            <input
              type="text"
              value={formData.portfolio?.title || ''}
              onChange={(e) => updateSectionField('portfolio', 'title', e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#4BD200]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Subtitle / Deskripsi</label>
            <input
              type="text"
              value={formData.portfolio?.description || ''}
              onChange={(e) => updateSectionField('portfolio', 'description', e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#4BD200]"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-xs font-bold text-zinc-400">Item Portfolio ({items.length})</label>
          {items.map((item: any, idx: number) => {
            const currentType = item.type || 'image';

            return (
              <div key={item.id || idx} className="p-5 bg-zinc-950 border border-white/10 rounded-xl relative space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#4BD200] font-bold">Karya #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = items.filter((_: any, i: number) => i !== idx);
                      updateSectionField('portfolio', 'items', next);
                    }}
                    className="text-dim hover:text-red-400 transition-colors p-1 cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-dim mb-1">Judul Project</label>
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={(e) => {
                        const next = [...items];
                        next[idx] = { ...next[idx], title: e.target.value };
                        updateSectionField('portfolio', 'items', next);
                      }}
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-[#4BD200]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-dim mb-1">Kategori (Layanan)</label>
                    <BrandedDropdown
                      value={item.category || ''}
                      options={serviceOptions}
                      placeholder="Pilih Layanan"
                      onChange={(val) => {
                        const next = [...items];
                        next[idx] = { ...next[idx], category: val };
                        updateSectionField('portfolio', 'items', next);
                      }}
                    />
                  </div>
                </div>

                {/* Upload & Media Link with MediaUploader (Auto-detects video/photo silently) */}
                <MediaUploader
                  value={item.src || ''}
                  onChange={(url) => {
                    const next = [...items];
                    next[idx] = { ...next[idx], src: url };
                    updateSectionField('portfolio', 'items', next);
                  }}
                  onMediaTypeChange={(type) => {
                    const next = [...items];
                    next[idx] = { ...next[idx], type };
                    updateSectionField('portfolio', 'items', next);
                  }}
                  category="portfolio"
                  label="Media Karya (Foto / Video)"
                  placeholder="Upload file foto/video atau tempel URL YouTube/Vimeo/Drive/MP4..."
                />

                {/* Optional Project Description for Lightbox */}
                <div>
                  <label className="block text-[11px] text-dim mb-1">Deskripsi Singkat Karya (Opsional untuk Popup Modal)</label>
                  <input
                    type="text"
                    value={item.desc || ''}
                    placeholder="Contoh: Commercial video campaign for client X with 3D animation..."
                    onChange={(e) => {
                      const next = [...items];
                      next[idx] = { ...next[idx], desc: e.target.value };
                      updateSectionField('portfolio', 'items', next);
                    }}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-[#4BD200]"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 7. MILESTONE TAB
  const renderMilestoneTab = () => {
    const items = formData.milestone?.items || [];
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Milestones & Statistics</h3>
            <p className="text-xs text-zinc-400">Statistik pencapaian studio dan timeline perjalanan.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              const next = [
                ...items,
                { status: 'Statistik Baru', count: '10+', desc: 'Deskripsi pencapaian...', color: 'border-brand' }
              ];
              updateSectionField('milestone', 'items', next);
            }}
            className="px-3 py-1.5 bg-[#4BD200]/10 hover:bg-[#4BD200]/20 text-[#4BD200] border border-[#4BD200]/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus size={14} /> Tambah Milestone
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Title</label>
            <input
              type="text"
              value={formData.milestone?.title || ''}
              onChange={(e) => updateSectionField('milestone', 'title', e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#4BD200]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Subtitle</label>
            <input
              type="text"
              value={formData.milestone?.subtitle || ''}
              onChange={(e) => updateSectionField('milestone', 'subtitle', e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#4BD200]"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-xs font-bold text-zinc-400">Items ({items.length})</label>
          {items.map((ms: any, idx: number) => (
            <div key={idx} className="p-4 bg-zinc-950 border border-white/10 rounded-xl relative space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#4BD200] font-bold">Milestone #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => {
                    const next = items.filter((_: any, i: number) => i !== idx);
                    updateSectionField('milestone', 'items', next);
                  }}
                  className="text-dim hover:text-red-400 transition-colors p-1"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-dim mb-1">Status Label</label>
                  <input
                    type="text"
                    value={ms.status || ''}
                    placeholder="Project Done / Ongoing"
                    onChange={(e) => {
                      const next = [...items];
                      next[idx] = { ...next[idx], status: e.target.value };
                      updateSectionField('milestone', 'items', next);
                    }}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-[#4BD200]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-dim mb-1">Hitungan Angka (Count)</label>
                  <input
                    type="text"
                    value={ms.count || ''}
                    placeholder="45+ / 12 / 2026"
                    onChange={(e) => {
                      const next = [...items];
                      next[idx] = { ...next[idx], count: e.target.value };
                      updateSectionField('milestone', 'items', next);
                    }}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white font-mono text-sm focus:outline-none focus:border-[#4BD200]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-dim mb-1">Warna Border</label>
                  <input
                    type="text"
                    value={ms.color || ''}
                    placeholder="border-brand / border-white/20"
                    onChange={(e) => {
                      const next = [...items];
                      next[idx] = { ...next[idx], color: e.target.value };
                      updateSectionField('milestone', 'items', next);
                    }}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-[#4BD200]"
                  />
                </div>
              </div>
              <textarea
                value={ms.desc || ''}
                placeholder="Deskripsi pencapaian..."
                rows={2}
                onChange={(e) => {
                  const next = [...items];
                  next[idx] = { ...next[idx], desc: e.target.value };
                  updateSectionField('milestone', 'items', next);
                }}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-[#4BD200]"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 8. TEAM TAB (with MediaUploader)
  const renderTeamTab = () => {
    const people = formData.keyPeople || [];
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Key People (The Team)</h3>
            <p className="text-xs text-zinc-400">Daftar figur inti dan tim VirAshelle Creative Studio.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              const next = [
                ...people,
                { name: 'Nama Anggota', role: 'Role / Posisi', desc: 'Deskripsi peran...', imageUrl: '' }
              ];
              setFormData((prev: any) => ({ ...prev, keyPeople: next }));
            }}
            className="px-3 py-1.5 bg-[#4BD200]/10 hover:bg-[#4BD200]/20 text-[#4BD200] border border-[#4BD200]/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus size={14} /> Tambah Anggota
          </button>
        </div>

        <div className="space-y-4">
          {people.map((person: any, idx: number) => (
            <div key={idx} className="p-5 bg-zinc-950 border border-white/10 rounded-xl relative space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#4BD200] font-bold">Anggota #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => {
                    const next = people.filter((_: any, i: number) => i !== idx);
                    setFormData((prev: any) => ({ ...prev, keyPeople: next }));
                  }}
                  className="text-dim hover:text-red-400 transition-colors p-1"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-dim mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={person.name || ''}
                    placeholder="Nama (misal: Naufal Eko / Dixon)"
                    onChange={(e) => {
                      const next = [...people];
                      next[idx] = { ...next[idx], name: e.target.value };
                      setFormData((prev: any) => ({ ...prev, keyPeople: next }));
                    }}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-[#4BD200]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-dim mb-1">Role / Jabatan</label>
                  <input
                    type="text"
                    value={person.role || ''}
                    placeholder="Posisi (misal: Production / Leader)"
                    onChange={(e) => {
                      const next = [...people];
                      next[idx] = { ...next[idx], role: e.target.value };
                      setFormData((prev: any) => ({ ...prev, keyPeople: next }));
                    }}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-[#4BD200]"
                  />
                </div>
              </div>

              {/* Upload Foto Profil with MediaUploader */}
              <MediaUploader
                value={person.imageUrl || ''}
                onChange={(url) => {
                  const next = [...people];
                  next[idx] = { ...next[idx], imageUrl: url };
                  setFormData((prev: any) => ({ ...prev, keyPeople: next }));
                }}
                category="team"
                label="Foto Profil Anggota"
                placeholder="Upload foto atau tempel URL avatar"
              />

              <div>
                <label className="block text-[11px] text-dim mb-1">Deskripsi / Bio Singkat</label>
                <textarea
                  value={person.desc || ''}
                  placeholder="Peran dan tanggung jawab dalam tim..."
                  rows={2}
                  onChange={(e) => {
                    const next = [...people];
                    next[idx] = { ...next[idx], desc: e.target.value };
                    setFormData((prev: any) => ({ ...prev, keyPeople: next }));
                  }}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-[#4BD200]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 9. CLIENTS TAB (with MediaUploader for brand logos)
  const renderClientsTab = () => {
    const rawItems = formData.clients?.items || [];
    const items = rawItems.map((item: any) =>
      typeof item === 'string' ? { name: item, logoUrl: '' } : item
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Clients & Partners</h3>
            <p className="text-xs text-zinc-400">Logo dan nama brand mitra yang pernah berkolaborasi.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              const next = [...items, { name: 'Nama Brand Baru', logoUrl: '' }];
              updateSectionField('clients', 'items', next);
            }}
            className="px-3 py-1.5 bg-[#4BD200]/10 hover:bg-[#4BD200]/20 text-[#4BD200] border border-[#4BD200]/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus size={14} /> Tambah Client
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Header Title</label>
            <input
              type="text"
              value={formData.clients?.title || ''}
              onChange={(e) => updateSectionField('clients', 'title', e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#4BD200]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Subtitle</label>
            <input
              type="text"
              value={formData.clients?.subtitle || ''}
              onChange={(e) => updateSectionField('clients', 'subtitle', e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#4BD200]"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-zinc-400">Daftar Brand ({items.length})</label>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {items.map((client: any, idx: number) => (
              <div key={idx} className="p-4 bg-zinc-950 border border-white/10 rounded-xl space-y-3">
                <div className="flex items-center justify-between gap-3 min-w-0">
                  <input
                    type="text"
                    value={client.name || ''}
                    placeholder="Nama Brand"
                    onChange={(e) => {
                      const next = [...items];
                      next[idx] = { ...next[idx], name: e.target.value };
                      updateSectionField('clients', 'items', next);
                    }}
                    className="flex-1 min-w-0 bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#4BD200]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const next = items.filter((_: any, i: number) => i !== idx);
                      updateSectionField('clients', 'items', next);
                    }}
                    className="text-dim hover:text-red-400 transition-colors p-1 shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <MediaUploader
                  value={client.logoUrl || ''}
                  onChange={(url) => {
                    const next = [...items];
                    next[idx] = { ...next[idx], logoUrl: url };
                    updateSectionField('clients', 'items', next);
                  }}
                  category="clients"
                  label=""
                  placeholder="Upload logo brand (opsional)"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 10. FOOTER TAB
  const renderFooterTab = () => {
    const phones = formData.footer?.phones || [];
    return (
      <div className="space-y-5">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Footer & Contact</h3>
          <p className="text-xs text-zinc-400">Informasi kontak studio di bagian bawah landing page.</p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Footer Headline</label>
          <textarea
            value={formData.footer?.title || ''}
            onChange={(e) => updateSectionField('footer', 'title', e.target.value)}
            className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white font-mono text-sm focus:outline-none focus:border-[#4BD200]"
            rows={2}
            placeholder="LET'S *BUILD*\nTHE FUTURE"
          />
          <p className="text-[11px] text-dim mt-1.5 flex items-center gap-1">
            💡 <span>Tips: Gunakan tanda bintang <code className="text-[#4BD200]">*kata*</code> untuk highlight kata dengan warna hijau brand.</span>
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Email Kontak</label>
            <input
              type="text"
              value={formData.footer?.email || ''}
              onChange={(e) => updateSectionField('footer', 'email', e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#4BD200]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Alamat</label>
            <input
              type="text"
              value={formData.footer?.address || ''}
              onChange={(e) => updateSectionField('footer', 'address', e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#4BD200]"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Nomor Telepon (Pisahkan dengan koma)</label>
          <input
            type="text"
            value={Array.isArray(phones) ? phones.join(', ') : phones}
            onChange={(e) => {
              const raw = e.target.value;
              const splitted = raw.split(',').map((p) => p.trim()).filter(Boolean);
              updateSectionField('footer', 'phones', splitted);
            }}
            placeholder="+62 88 1212 8323, +62 851 7333 9084"
            className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#4BD200]"
          />
        </div>
      </div>
    );
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'Hero': return renderHeroTab();
      case 'About': return renderAboutTab();
      case 'Services': return renderServicesTab();
      case 'Why Us': return renderWhyUsTab();
      case 'Workflow': return renderWorkflowTab();
      case 'Portfolio': return renderPortfolioTab();
      case 'Milestone': return renderMilestoneTab();
      case 'Team': return renderTeamTab();
      case 'Clients': return renderClientsTab();
      case 'Footer': return renderFooterTab();
      default: return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 shrink-0 border-b border-white/[0.08] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">CMS</h1>
          <p className="text-xs font-ui text-zinc-400 mt-1">Konten landing page VirAshelle. Perubahan tayang setelah disimpan.</p>
        </div>
        <div className="flex items-center gap-3">
          {message && (
            <span className="text-xs font-ui font-medium text-[#4BD200] flex items-center gap-1.5 bg-[#4BD200]/10 border border-[#4BD200]/30 px-3 py-1.5 rounded-xl" role="status">
              <CheckCircle2 size={14} aria-hidden="true" />
              {message}
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-[#4BD200] hover:bg-[#7cff33] text-black font-ui font-bold text-xs rounded-xl flex items-center gap-2 transition-colors active:scale-95 disabled:opacity-50"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Simpan Perubahan
          </button>
        </div>
      </div>

      {/* Main split view */}
      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Navigation pills */}
        <nav aria-label="Bagian konten" className="w-full md:w-52 shrink-0 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto pb-2 md:pb-0 pr-0 md:pr-2 font-ui bg-[#111118] border border-white/10 rounded-2xl p-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              aria-current={activeTab === tab ? 'page' : undefined}
              className={`text-left px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-[#4BD200] text-black font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        <div className="flex-1 bg-[#111118] border border-white/10 rounded-2xl p-6 md:p-8 overflow-y-auto custom-scrollbar relative">
          {renderActiveTabContent()}
        </div>
      </div>
    </div>
  );
}
