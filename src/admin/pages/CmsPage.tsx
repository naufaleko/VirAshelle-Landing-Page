import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Check, ExternalLink, Loader2, Plus, RefreshCw, Save, Sparkles, Trash2 } from 'lucide-react';
import { useAdmin } from '../../lib/useAdmin';
import type { SiteContent } from '../../lib/useCms';
import { formatBrandText, unformatBrandText } from '../../lib/textFormat';
import { r2PortfolioItems } from '../data/r2Portfolio';
import { MediaUploader } from '../components/MediaUploader';
import { BrandedDropdown } from '../components/BrandedDropdown';
import { SmartThumbnailModal } from '../components/SmartThumbnailModal';
import { isVideoMedia } from '../../components/VideoPlayer';
import {
  FormattedTextField,
  ItemList,
  SectionHeader,
  SubHeading,
  TextAreaField,
  TextField,
  inputClass,
} from '../components/CmsFields';
import { useUnsavedGuard } from '../lib/useUnsavedGuard';

type SectionId =
  | 'hero'
  | 'clients'
  | 'services'
  | 'portfolio'
  | 'whyUs'
  | 'milestone'
  | 'workflow'
  | 'about'
  | 'keyPeople'
  | 'footer';

/** Same order as the landing page, so the list reads top to bottom like the page itself. */
const SECTIONS: { id: SectionId; label: string; keys: (keyof SiteContent)[] }[] = [
  { id: 'hero', label: 'Hero', keys: ['hero', 'header'] },
  { id: 'clients', label: 'Klien', keys: ['clients'] },
  { id: 'services', label: 'Layanan', keys: ['services'] },
  { id: 'portfolio', label: 'Karya', keys: ['portfolio'] },
  { id: 'whyUs', label: 'Kenapa kami', keys: ['whyUs'] },
  { id: 'milestone', label: 'Pencapaian', keys: ['milestone'] },
  { id: 'workflow', label: 'Alur kerja', keys: ['workflow'] },
  { id: 'about', label: 'Tentang', keys: ['about'] },
  { id: 'keyPeople', label: 'Tim', keys: ['keyPeople'] },
  { id: 'footer', label: 'Kontak', keys: ['footer'] },
];

const UNSAVED_MESSAGE = 'Ada perubahan di CMS yang belum disimpan. Tinggalkan halaman dan buang perubahan itu?';

type SaveState =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'saved'; at: Date }
  | { kind: 'error'; message: string };

type ClientItem = SiteContent['clients']['items'][number];
type PortfolioItem = SiteContent['portfolio']['items'][number];

/** Stored content to the shape the form edits: brand spans back to *word*, legacy shapes normalised. */
function toEditable(content: SiteContent): SiteContent {
  const c: SiteContent = JSON.parse(JSON.stringify(content));
  c.hero.title = unformatBrandText(c.hero.title);
  c.about.content = unformatBrandText(c.about.content);
  c.footer.title = unformatBrandText(c.footer.title);
  c.header = c.header || { established: '' };
  // Older rows stored clients as plain strings.
  c.clients.items = ((c.clients.items || []) as (ClientItem | string)[]).map((item) =>
    typeof item === 'string' ? { name: item, logoUrl: '' } : item
  );
  c.whyUs.items = c.whyUs.items || [];
  const phones = c.footer.phones as unknown;
  c.footer.phones = Array.isArray(phones) ? phones : phones ? [String(phones)] : [];
  return c;
}

/** Form back to what the landing reads. */
function toStored(form: SiteContent): SiteContent {
  const c: SiteContent = JSON.parse(JSON.stringify(form));
  c.hero.title = formatBrandText(c.hero.title);
  c.about.content = formatBrandText(c.about.content);
  c.footer.title = formatBrandText(c.footer.title);
  // The landing prints this as "Step 01"; it follows the list order so a moved step renumbers itself.
  c.workflow.items = c.workflow.items.map((step, i) => ({ ...step, number: String(i + 1).padStart(2, '0') }));
  c.footer.phones = c.footer.phones.map((p) => p.trim()).filter(Boolean);
  return c;
}

function listCount(form: SiteContent, id: SectionId): number | undefined {
  switch (id) {
    case 'clients': return form.clients.items.length;
    case 'services': return form.services.items.length;
    case 'portfolio': return form.portfolio.items.length;
    case 'whyUs': return form.whyUs.items?.length ?? 0;
    case 'milestone': return form.milestone.items.length;
    case 'workflow': return form.workflow.items.length;
    case 'keyPeople': return form.keyPeople.length;
    default: return undefined;
  }
}

const EMPTY_LIST_NOTE = 'Kalau disimpan kosong, landing page memakai isi bawaan untuk bagian ini.';

export function CmsPage() {
  const { content, contentLoading, contentError, updateContent } = useAdmin();

  const [form, setForm] = useState<SiteContent | null>(null);
  const [baseline, setBaseline] = useState<SiteContent | null>(null);
  const [active, setActive] = useState<SectionId>('hero');
  const [save, setSave] = useState<SaveState>({ kind: 'idle' });
  // Another session saved while this one had unsaved edits.
  const [remoteChanged, setRemoteChanged] = useState(false);
  const [smartThumbTarget, setSmartThumbTarget] = useState<{ id: string; url: string; title: string } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const baselineJson = useRef<string | null>(null);
  const pendingSaveJson = useRef<string | null>(null);

  const changed = useMemo(() => {
    if (!form || !baseline) return new Set<SectionId>();
    return new Set(
      SECTIONS.filter((s) => s.keys.some((k) => JSON.stringify(form[k]) !== JSON.stringify(baseline[k]))).map((s) => s.id)
    );
  }, [form, baseline]);
  const dirty = changed.size > 0;
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  const adopt = useCallback((next: SiteContent) => {
    baselineJson.current = JSON.stringify(next);
    setForm(next);
    setBaseline(next);
    setRemoteChanged(false);
  }, []);

  // Follow the live row. Unsaved edits are never overwritten; a newer server version is
  // flagged instead so the editor can choose between it and their own changes.
  useEffect(() => {
    if (contentLoading) return;
    const next = toEditable(content);
    const nextJson = JSON.stringify(next);
    if (nextJson === baselineJson.current) return;
    if (!dirtyRef.current || nextJson === pendingSaveJson.current) {
      adopt(next);
    } else {
      setRemoteChanged(true);
    }
  }, [content, contentLoading, adopt]);

  useUnsavedGuard(dirty, UNSAVED_MESSAGE);

  const saving = save.kind === 'saving';

  const handleSave = useCallback(async () => {
    if (!form || !dirty || saving || contentError) return;
    const stored = toStored(form);
    const normalized = toEditable(stored);
    pendingSaveJson.current = JSON.stringify(normalized);
    setSave({ kind: 'saving' });
    try {
      await updateContent(stored);
      adopt(normalized);
      setSave({ kind: 'saved', at: new Date() });
    } catch (err) {
      setSave({ kind: 'error', message: err instanceof Error ? err.message : String(err) });
    } finally {
      pendingSaveJson.current = null;
    }
  }, [form, dirty, saving, contentError, updateContent, adopt]);

  const handleSaveRef = useRef(handleSave);
  handleSaveRef.current = handleSave;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const discard = () => {
    if (!window.confirm('Buang semua perubahan yang belum disimpan?')) return;
    adopt(toEditable(content));
    setSave({ kind: 'idle' });
  };

  const openSection = (id: SectionId) => {
    setActive(id);
    scrollRef.current?.scrollTo({ top: 0 });
  };

  /* ───────────────── States before the editor ───────────────── */

  if (contentError) {
    return (
      <div className="max-w-xl mx-auto mt-10 bg-[#111118] border border-red-500/30 rounded-2xl p-6 text-center space-y-3" role="alert">
        <AlertCircle size={28} className="mx-auto text-red-400" aria-hidden="true" />
        <h1 className="text-lg font-display font-bold text-white">Konten landing page tidak bisa dimuat</h1>
        <p className="text-xs font-ui text-zinc-400">{contentError}</p>
        <p className="text-xs font-ui text-zinc-400">
          Editor dikunci supaya konten live tidak tertimpa isi cadangan. Periksa koneksi atau hak akses tabel site_content, lalu muat ulang.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-4 h-10 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-ui font-semibold transition-colors"
        >
          <RefreshCw size={14} aria-hidden="true" />
          Muat ulang
        </button>
      </div>
    );
  }

  if (contentLoading || !form) {
    return (
      <div className="flex items-center justify-center gap-2 p-12 text-zinc-400 text-sm font-ui" role="status">
        <Loader2 className="w-5 h-5 animate-spin text-[#4BD200]" aria-hidden="true" />
        Memuat konten landing page...
      </div>
    );
  }

  /* ───────────────── Field helpers ───────────────── */

  const setSection = <K extends keyof SiteContent>(key: K, patch: Partial<SiteContent[K]>) => {
    setForm((prev) => (prev ? { ...prev, [key]: { ...(prev[key] as object), ...patch } as SiteContent[K] } : prev));
  };

  /* ───────────────── Sections ───────────────── */

  const renderHero = () => (
    <>
      <SectionHeader title="Hero" where="Layar pertama landing page: judul besar, kalimat pembuka, dan tombol WhatsApp." />
      <div className="space-y-5">
        <FormattedTextField
          label="Judul"
          value={form.hero.title}
          onChange={(v) => setSection('hero', { title: v })}
          rows={3}
          previewClassName="font-display font-bold text-white text-3xl leading-[0.95] tracking-tight"
        />
        <TextAreaField label="Kalimat pembuka" value={form.hero.subtitle} onChange={(v) => setSection('hero', { subtitle: v })} rows={2} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <TextField
            label="Teks tombol"
            value={form.hero.buttonText}
            onChange={(v) => setSection('hero', { buttonText: v })}
            hint="Tombol ini membuka chat WhatsApp studio."
          />
          <TextField
            label="Teks di menu HP"
            value={form.header.established}
            onChange={(v) => setSection('header', { established: v })}
            hint="Baris kecil di bawah menu saat landing dibuka di layar kecil."
          />
        </div>
      </div>
    </>
  );

  const renderClients = () => (
    <>
      <SectionHeader title="Klien" where="Tepat di bawah hero: judul, satu kalimat, lalu deretan klien yang bergerak." />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        <TextField label="Judul" value={form.clients.title} onChange={(v) => setSection('clients', { title: v })} />
        <TextField label="Kalimat di bawah judul" value={form.clients.subtitle} onChange={(v) => setSection('clients', { subtitle: v })} />
      </div>
      <SubHeading count={form.clients.items.length}>Daftar klien</SubHeading>
      <ItemList
        noun="klien"
        items={form.clients.items}
        onChange={(items) => setSection('clients', { items })}
        makeItem={() => ({ name: '', logoUrl: '' })}
        titleOf={(c) => c.name}
        emptyText={`Belum ada klien. ${EMPTY_LIST_NOTE}`}
        renderItem={(c, update, { autoFocus }) => (
          <>
            <TextField label="Nama klien" value={c.name} onChange={(v) => update({ name: v })} autoFocus={autoFocus} />
            <MediaUploader
              label="Logo (opsional)"
              category="clients"
              value={c.logoUrl}
              onChange={(url) => update({ logoUrl: url })}
              placeholder="Tempel URL logo atau unggah file"
            />
          </>
        )}
      />
    </>
  );

  const renderServices = () => (
    <>
      <SectionHeader title="Layanan" where="Daftar layanan studio. Karya yang kategorinya cocok tampil di bawah tiap layanan." />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        <TextField label="Judul" value={form.services.title} onChange={(v) => setSection('services', { title: v })} />
        <TextField
          label="Label kecil di atas judul"
          value={form.services.description}
          onChange={(v) => setSection('services', { description: v })}
        />
      </div>
      <SubHeading count={form.services.items.length}>Daftar layanan</SubHeading>
      <ItemList
        noun="layanan"
        items={form.services.items}
        onChange={(items) => setSection('services', { items })}
        makeItem={() => ({ title: '', desc: '' })}
        titleOf={(s) => s.title}
        emptyText={`Belum ada layanan. ${EMPTY_LIST_NOTE}`}
        renderItem={(s, update, { autoFocus }) => (
          <>
            <TextField
              label="Nama layanan"
              value={s.title}
              onChange={(v) => update({ title: v })}
              autoFocus={autoFocus}
              hint="Nama ini juga menjadi pilihan kategori di bagian Karya."
            />
            <TextAreaField label="Deskripsi" value={s.desc} onChange={(v) => update({ desc: v })} rows={3} />
          </>
        )}
      />
    </>
  );

  const renderPortfolio = () => {
    const serviceOptions = form.services.items.map((s) => s.title.trim()).filter(Boolean);
    const existingSrcs = new Set(form.portfolio.items.map((i) => i.src));
    const unimportedItems = r2PortfolioItems.filter((i) => !existingSrcs.has(i.src));

    const handleImportR2 = () => {
      const realExisting = form.portfolio.items.filter(
        (i) => !i.title.includes('[Placeholder]') && !i.category.includes('[Category]')
      );
      const curSrcs = new Set(realExisting.map((i) => i.src));
      const toAdd = r2PortfolioItems.filter((i) => !curSrcs.has(i.src));
      setSection('portfolio', { items: [...realExisting, ...toAdd] });
    };

    return (
      <>
        <SectionHeader
          title="Karya"
          where="Tampil di bawah layanan yang sesuai kategorinya. Karya yang diklik membuka popup berisi judul, kategori, dan deskripsi."
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <SubHeading count={form.portfolio.items.length}>Daftar karya</SubHeading>
          {unimportedItems.length > 0 && (
            <button
              type="button"
              onClick={handleImportR2}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white/[0.06] hover:bg-[#4BD200]/20 border border-white/10 hover:border-[#4BD200]/40 text-xs font-ui font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer"
            >
              <Sparkles size={14} className="text-[#4BD200]" aria-hidden="true" />
              <span>Muat {unimportedItems.length} media R2</span>
            </button>
          )}
        </div>
        <ItemList
          noun="karya"
          items={form.portfolio.items}
          onChange={(items) => setSection('portfolio', { items })}
          makeItem={(): PortfolioItem => ({ id: String(Date.now()), title: '', category: serviceOptions[0] ?? '', type: 'image', src: '', desc: '' })}
          titleOf={(p) => p.title}
          emptyText={`Belum ada karya. ${EMPTY_LIST_NOTE}`}
          renderItem={(p, update, { autoFocus }) => {
            // A category from an older row stays selectable, so the field never pretends to be empty.
            const options = Array.from(new Set([...serviceOptions, p.category].filter(Boolean)));
            return (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_220px] gap-5">
                  <TextField label="Judul karya" value={p.title} onChange={(v) => update({ title: v })} autoFocus={autoFocus} />
                  <BrandedDropdown
                    label="Kategori"
                    value={p.category}
                    options={options}
                    placeholder="Pilih layanan"
                    emptyText="Tambahkan layanan dulu"
                    onChange={(v) => update({ category: v })}
                  />
                </div>
                <MediaUploader
                  label="Foto atau video"
                  category="portfolio"
                  value={p.src}
                  onChange={(url) => update({ src: url })}
                  onMediaTypeChange={(type) => update({ type })}
                  placeholder="Tempel link YouTube, Vimeo, Google Drive, atau MP4"
                />
                {(p.type === 'video' || isVideoMedia(p.src)) && (
                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-zinc-900/60 border border-white/5">
                    <div className="flex items-center gap-3 min-w-0">
                      {p.thumbnail_url ? (
                        <img
                          src={p.thumbnail_url}
                          alt="Thumbnail"
                          className="w-14 h-9 rounded object-cover border border-white/10 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-9 rounded bg-black/60 border border-white/10 flex items-center justify-center text-zinc-500 text-[10px] shrink-0 font-ui uppercase">
                          Auto
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="text-xs text-white font-medium block truncate">
                          {p.thumbnail_url ? 'Smart Thumbnail Aktif' : 'Thumbnail Default (Frame Pertama)'}
                        </span>
                        <span className="text-[11px] text-zinc-500 block truncate">
                          {p.thumbnail_url || 'Gunakan AI untuk memilih frame paling estetis'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {p.thumbnail_url && (
                        <button
                          type="button"
                          onClick={() => update({ thumbnail_url: undefined })}
                          className="px-2.5 py-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-white/5 text-xs font-ui transition-colors cursor-pointer"
                          title="Hapus custom thumbnail"
                        >
                          Reset
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setSmartThumbTarget({ id: p.id, url: p.src, title: p.title })}
                        className="px-3 py-1.5 rounded-lg bg-[#4BD200]/10 hover:bg-[#4BD200]/20 border border-[#4BD200]/30 text-[#4BD200] text-xs font-ui font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Sparkles size={13} />
                        <span>Smart Frame (AI)</span>
                      </button>
                    </div>
                  </div>
                )}
                <TextAreaField
                  label="Deskripsi di popup (opsional)"
                  value={p.desc || ''}
                  onChange={(v) => update({ desc: v })}
                  rows={2}
                />
              </>
            );
          }}
        />
        <SmartThumbnailModal
          isOpen={!!smartThumbTarget}
          onClose={() => setSmartThumbTarget(null)}
          videoUrl={smartThumbTarget?.url || ''}
          videoTitle={smartThumbTarget?.title || ''}
          onSelectThumbnail={(url) => {
            if (!smartThumbTarget) return;
            const items = form.portfolio.items.map((item) =>
              item.id === smartThumbTarget.id ? { ...item, thumbnail_url: url } : item
            );
            setSection('portfolio', { items });
          }}
        />
      </>
    );
  };

  const renderWhyUs = () => (
    <>
      <SectionHeader title="Kenapa kami" where="Alasan memilih studio, tampil sebagai daftar di samping ilustrasi." />
      <TextField label="Judul" value={form.whyUs.title} onChange={(v) => setSection('whyUs', { title: v })} className="mb-8 sm:max-w-md" />
      <SubHeading count={form.whyUs.items?.length ?? 0}>Daftar alasan</SubHeading>
      <ItemList
        noun="alasan"
        items={form.whyUs.items || []}
        onChange={(items) => setSection('whyUs', { items })}
        makeItem={() => ({ title: '', desc: '' })}
        titleOf={(w) => w.title}
        emptyText={`Belum ada alasan. ${EMPTY_LIST_NOTE}`}
        renderItem={(w, update, { autoFocus }) => (
          <>
            <TextField label="Judul alasan" value={w.title} onChange={(v) => update({ title: v })} autoFocus={autoFocus} />
            <TextAreaField label="Penjelasan" value={w.desc} onChange={(v) => update({ desc: v })} rows={2} />
          </>
        )}
      />
    </>
  );

  const renderMilestone = () => (
    <>
      <SectionHeader title="Pencapaian" where="Garis waktu angka studio. Warna tiap kartu mengikuti urutannya." />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        <TextField label="Judul" value={form.milestone.title} onChange={(v) => setSection('milestone', { title: v })} />
        <TextField
          label="Label kecil di atas judul"
          value={form.milestone.subtitle}
          onChange={(v) => setSection('milestone', { subtitle: v })}
        />
      </div>
      <SubHeading count={form.milestone.items.length}>Daftar pencapaian</SubHeading>
      <ItemList
        noun="pencapaian"
        items={form.milestone.items}
        onChange={(items) => setSection('milestone', { items })}
        // `color` stays in the data for older rows; the landing colours cards by position instead.
        makeItem={() => ({ status: '', count: '', desc: '', color: 'border-brand' })}
        titleOf={(m) => m.status}
        emptyText={`Belum ada pencapaian. ${EMPTY_LIST_NOTE}`}
        renderItem={(m, update, { autoFocus }) => (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <TextField label="Label" value={m.status} onChange={(v) => update({ status: v })} autoFocus={autoFocus} />
              <TextField
                label="Angka"
                mono
                value={m.count}
                onChange={(v) => update({ count: v })}
                hint="Hanya angka yang bisa dibuktikan. Angka di depan, misalnya 45 pada 45+, dihitung naik saat kartu terlihat."
              />
            </div>
            <TextAreaField
              label="Keterangan"
              value={m.desc}
              onChange={(v) => update({ desc: v })}
              rows={2}
              hint="Dua baris atau lebih yang diawali tanda - tampil sebagai daftar."
            />
          </>
        )}
      />
    </>
  );

  const renderWorkflow = () => (
    <>
      <SectionHeader title="Alur kerja" where="Tahap kerja dari brief sampai file akhir. Nomor tahap mengikuti urutan di daftar ini." />
      <TextField label="Judul" value={form.workflow.title} onChange={(v) => setSection('workflow', { title: v })} className="mb-8 sm:max-w-md" />
      <SubHeading count={form.workflow.items.length}>Daftar tahap</SubHeading>
      <ItemList
        noun="tahap"
        items={form.workflow.items}
        onChange={(items) => setSection('workflow', { items })}
        makeItem={() => ({ number: '', title: '', desc: '' })}
        titleOf={(s) => s.title}
        emptyText={`Belum ada tahap. ${EMPTY_LIST_NOTE}`}
        renderItem={(s, update, { autoFocus }) => (
          <>
            <TextField label="Nama tahap" value={s.title} onChange={(v) => update({ title: v })} autoFocus={autoFocus} />
            <TextAreaField label="Penjelasan" value={s.desc} onChange={(v) => update({ desc: v })} rows={2} />
          </>
        )}
      />
    </>
  );

  const renderAbout = () => (
    <>
      <SectionHeader title="Tentang" where="Paragraf tentang studio, di atas bagian Tim." />
      <div className="space-y-5">
        <TextField label="Judul" value={form.about.title} onChange={(v) => setSection('about', { title: v })} className="sm:max-w-md" />
        <FormattedTextField
          label="Isi"
          value={form.about.content}
          onChange={(v) => setSection('about', { content: v })}
          rows={7}
          previewClassName="font-body text-sm leading-relaxed text-zinc-300"
        />
      </div>
    </>
  );

  const renderTeam = () => (
    <>
      <SectionHeader title="Tim" where="Orang di balik studio: foto, nama, peran, dan satu paragraf singkat." />
      <SubHeading count={form.keyPeople.length}>Daftar anggota</SubHeading>
      <ItemList
        noun="anggota"
        items={form.keyPeople}
        onChange={(keyPeople) => setForm((prev) => (prev ? { ...prev, keyPeople } : prev))}
        makeItem={() => ({ name: '', role: '', desc: '', imageUrl: '' })}
        titleOf={(p) => p.name}
        emptyText={`Belum ada anggota. ${EMPTY_LIST_NOTE}`}
        renderItem={(p, update, { autoFocus }) => (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <TextField label="Nama" value={p.name} onChange={(v) => update({ name: v })} autoFocus={autoFocus} />
              <TextField label="Peran" value={p.role} onChange={(v) => update({ role: v })} />
            </div>
            <MediaUploader
              label="Foto (opsional)"
              category="team"
              value={p.imageUrl}
              onChange={(url) => update({ imageUrl: url })}
              placeholder="Tempel URL foto atau unggah file"
            />
            <TextAreaField label="Deskripsi" value={p.desc} onChange={(v) => update({ desc: v })} rows={3} />
          </>
        )}
      />
    </>
  );

  const renderFooter = () => {
    const phones = form.footer.phones;
    const setPhones = (next: string[]) => setSection('footer', { phones: next });
    return (
      <>
        <SectionHeader title="Kontak" where="Penutup halaman: ajakan besar, email, nomor telepon, dan alamat." />
        <div className="space-y-5">
          <FormattedTextField
            label="Judul"
            value={form.footer.title}
            onChange={(v) => setSection('footer', { title: v })}
            rows={2}
            previewClassName="font-display font-bold text-white text-3xl leading-[0.95] tracking-tight"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <TextField
              label="Email"
              type="email"
              value={form.footer.email}
              onChange={(v) => setSection('footer', { email: v })}
              hint="Diklik di landing, email ini membuka aplikasi email pengunjung."
            />
            <TextField label="Alamat" value={form.footer.address} onChange={(v) => setSection('footer', { address: v })} />
          </div>

          <div>
            <SubHeading count={phones.length}>Nomor telepon</SubHeading>
            {phones.length > 0 && (
              <ul className="space-y-2 sm:max-w-md">
                {phones.map((phone, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <label htmlFor={`cms-phone-${i}`} className="sr-only">Nomor telepon {i + 1}</label>
                    <input
                      id={`cms-phone-${i}`}
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhones(phones.map((p, j) => (j === i ? e.target.value : p)))}
                      className={`${inputClass} font-mono`}
                    />
                    <button
                      type="button"
                      aria-label={`Hapus nomor telepon ${i + 1}`}
                      onClick={() => setPhones(phones.filter((_, j) => j !== i))}
                      className="h-11 w-11 shrink-0 flex items-center justify-center rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={() => setPhones([...phones, ''])}
              className="mt-3 inline-flex items-center gap-2 h-11 pointer-fine:h-9 px-3.5 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-xs font-ui font-semibold text-zinc-200 transition-colors"
            >
              <Plus size={15} aria-hidden="true" />
              Tambah nomor
            </button>
            <p className="mt-1.5 text-[11px] font-ui text-dim">Nomor yang dibiarkan kosong tidak ikut disimpan.</p>
          </div>
        </div>
      </>
    );
  };

  const renderSection = () => {
    switch (active) {
      case 'hero': return renderHero();
      case 'clients': return renderClients();
      case 'services': return renderServices();
      case 'portfolio': return renderPortfolio();
      case 'whyUs': return renderWhyUs();
      case 'milestone': return renderMilestone();
      case 'workflow': return renderWorkflow();
      case 'about': return renderAbout();
      case 'keyPeople': return renderTeam();
      case 'footer': return renderFooter();
    }
  };

  const changedLabels = SECTIONS.filter((s) => changed.has(s.id)).map((s) => s.label);

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-[calc(100dvh-6rem)] sm:h-[calc(100dvh-7rem)] lg:h-[calc(100dvh-8rem)]">
      <div className="shrink-0 pb-4 sm:pb-5">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">CMS</h1>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 h-11 pointer-fine:h-9 px-3 -mr-3 sm:mr-0 rounded-lg text-xs font-ui font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            Buka landing page
            <ExternalLink size={14} aria-hidden="true" />
            <span className="sr-only">(tab baru)</span>
          </a>
        </div>
        <p className="mt-1 text-xs sm:text-sm font-body text-zinc-400">
          Teks, foto, dan daftar di landing page. Perubahan tayang setelah disimpan.
        </p>
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-4 lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-6">
        {/* Below lg the ten sections do not fit in a row, so they become one picker instead of a sideways strip. */}
        <div className="lg:hidden shrink-0">
          <BrandedDropdown
            label="Bagian"
            value={active}
            onChange={(v) => openSection(v as SectionId)}
            options={SECTIONS.map((s) => ({
              value: s.id,
              label: s.label,
              badge: changed.has(s.id) ? 'diubah' : undefined,
            }))}
          />
        </div>

        <nav aria-label="Bagian landing page" className="hidden lg:block min-h-0 overflow-y-auto">
          <p className="px-3 mb-2 text-[11px] font-ui text-dim">Urut dari atas landing page</p>
          <ul className="space-y-0.5 font-ui">
            {SECTIONS.map((s) => {
              const isActive = s.id === active;
              const count = listCount(form, s.id);
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => openSection(s.id)}
                    aria-current={isActive ? 'true' : undefined}
                    className={`w-full h-9 pointer-coarse:h-11 px-3 rounded-lg flex items-center gap-2 text-left text-sm transition-colors ${
                      isActive ? 'bg-white/[0.08] text-white font-bold' : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className="flex-1 truncate">{s.label}</span>
                    {changed.has(s.id) && (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" aria-hidden="true" />
                        <span className="sr-only">(belum disimpan)</span>
                      </>
                    )}
                    {count !== undefined && <span className="font-mono text-[11px] font-normal text-dim">{count}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex-1 min-h-0 flex flex-col bg-[#111118] border border-white/10 rounded-2xl overflow-hidden">
          <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            <fieldset disabled={saving} className="min-w-0 max-w-3xl p-5 sm:p-8">
              {renderSection()}
            </fieldset>
          </div>

          <div className="shrink-0 border-t border-white/10 bg-[#0a0a0f] px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0 text-xs font-ui space-y-1" role="status" aria-live="polite">
              {save.kind === 'saving' ? (
                <p className="flex items-center gap-2 text-zinc-300">
                  <Loader2 size={14} className="animate-spin shrink-0" aria-hidden="true" />
                  Menyimpan...
                </p>
              ) : save.kind === 'error' ? (
                <p className="flex items-start gap-2 text-red-400">
                  <AlertCircle size={14} className="shrink-0 mt-px" aria-hidden="true" />
                  <span>Gagal menyimpan: {save.message}. Perubahan masih ada di sini; coba lagi atau periksa hak akses.</span>
                </p>
              ) : dirty ? (
                <p className="flex items-start gap-2 text-zinc-200">
                  <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-amber-400 shrink-0" aria-hidden="true" />
                  <span>Belum disimpan: {changedLabels.join(', ')}.</span>
                </p>
              ) : save.kind === 'saved' ? (
                <p className="flex items-center gap-2 text-zinc-300">
                  <Check size={14} className="text-[#4BD200] shrink-0" aria-hidden="true" />
                  Tersimpan pukul {save.at.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}. Landing page sudah memakai versi ini.
                </p>
              ) : (
                <p className="text-zinc-400">Belum ada perubahan.</p>
              )}
              {remoteChanged && dirty && (
                <p className="flex flex-wrap items-center gap-x-2 text-amber-300">
                  <span>Sesi lain baru saja menyimpan konten ini. Menyimpan sekarang akan menimpanya.</span>
                  <button type="button" onClick={discard} className="underline underline-offset-2 hover:text-amber-200 pointer-coarse:min-h-11">
                    Pakai versi terbaru
                  </button>
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={discard}
                disabled={!dirty || saving}
                className="flex-1 sm:flex-none h-11 pointer-fine:h-10 px-4 rounded-xl border border-white/10 text-xs font-ui font-semibold text-zinc-200 hover:bg-white/[0.06] disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!dirty || saving}
                aria-keyshortcuts="Control+S"
                title="Simpan (Ctrl+S)"
                className="flex-1 sm:flex-none h-11 pointer-fine:h-10 px-5 rounded-xl bg-[#4BD200] hover:bg-[#7cff33] text-black text-xs font-ui font-bold flex items-center justify-center gap-2 transition-colors disabled:bg-white/[0.06] disabled:text-zinc-400 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Save size={15} aria-hidden="true" />}
                Simpan perubahan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
