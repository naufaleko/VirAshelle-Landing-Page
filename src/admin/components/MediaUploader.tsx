import React, { useId, useRef, useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, Video, X, Play, Link2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { isVideoMedia, getVideoThumbnail } from '../../components/VideoPlayer';

interface MediaUploaderProps {
  value: string;
  onChange: (url: string) => void;
  category?: string;
  label?: string;
  placeholder?: string;
  onMediaTypeChange?: (type: 'image' | 'video') => void;
}

export function MediaUploader({
  value,
  onChange,
  category = 'media',
  label = 'Foto atau video',
  placeholder = 'Tempel URL (YouTube, Drive, MP4) atau unggah file',
  onMediaTypeChange,
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const hintId = `${inputId}-hint`;

  const isVideo = isVideoMedia(value);
  const videoThumb = getVideoThumbnail(value);

  const fileAccept = category === 'clients'
    ? 'image/svg+xml,image/png,image/jpeg,image/webp,image/*'
    : category === 'team'
    ? 'image/png,image/jpeg,image/webp,image/*'
    : 'image/*,video/mp4,video/webm,video/quicktime,video/*';

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Support up to 100MB for direct video/image uploads to Cloudflare R2
    if (file.size > 100 * 1024 * 1024) {
      setError('File lebih dari 100 MB. Untuk video panjang, tempel link YouTube, Vimeo, atau Google Drive.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess(false);

    try {
      const isVid = file.type.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(file.name);
      if (onMediaTypeChange) {
        onMediaTypeChange(isVid ? 'video' : 'image');
      }

      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const uniquePath = `${category}/${Date.now()}-${cleanName}`;

      // 1. Try uploading to Cloudflare Worker R2 if configured
      let uploadedUrl = '';
      const workerUrl = import.meta.env.VITE_R2_WORKER_URL;

      if (workerUrl) {
        // Worker requires a valid Supabase session (Bearer token)
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError('Sesi login sudah habis. Silakan login ulang.');
          return;
        }

        try {
          const form = new FormData();
          form.append('file', file);
          form.append('category', category);

          const res = await fetch(`${workerUrl.replace(/\/$/, '')}/upload`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
            body: form,
          });

          if (res.status === 401 || res.status === 403) {
            // Not allowed to upload: stop here, the Supabase Storage fallback would
            // be the wrong answer to an authorisation failure.
            let message = '';
            try {
              const body = await res.json();
              message = body?.error || '';
            } catch {
              /* non-JSON body */
            }
            setError(message || 'Unggahan ditolak: akun ini tidak punya akses upload.');
            return;
          }
          // Any other non-OK status (404 stale URL, 413/415, 5xx) falls through to the
          // Supabase Storage fallback below, same as before.

          if (res.ok) {
            const data = await res.json();
            if (data.url) {
              uploadedUrl = data.url;
            }
          }
        } catch (workerErr) {
          console.warn('R2 Worker upload failed, falling back to cloud storage:', workerErr);
        }
      }

      // 2. If R2 worker is not set or failed, fallback to Supabase Storage 'media' bucket
      if (!uploadedUrl) {
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(uniquePath, file, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage.from('media').getPublicUrl(uniquePath);
        uploadedUrl = data.publicUrl;
      }

      onChange(uploadedUrl);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
    } catch (err: any) {
      setError(err?.message || 'Unggahan gagal. Coba lagi, atau tempel link file-nya.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlChange = (newUrl: string) => {
    onChange(newUrl);
    setError('');
    if (onMediaTypeChange && newUrl.trim()) {
      onMediaTypeChange(isVideoMedia(newUrl) ? 'video' : 'image');
    }
  };

  const helperText =
    category === 'clients'
      ? 'Logo PNG transparan atau SVG. Tanpa logo, landing menampilkan nama klien.'
      : category === 'team'
      ? 'Foto persegi atau potret, JPG atau PNG. Tanpa foto, landing menampilkan huruf depan nama.'
      : 'Foto atau video maksimal 100 MB. Video panjang lebih baik lewat link YouTube, Vimeo, atau Google Drive.';

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-ui font-semibold text-zinc-300">
          {label}
        </label>
      )}

      <div className="flex items-start gap-3">
        {/* Preview: shows what the URL points at, so a wrong link is visible before saving. */}
        <div className="w-16 h-16 rounded-lg bg-[#0a0a0f] border border-white/10 flex items-center justify-center overflow-hidden shrink-0 relative">
          {value ? (
            isVideo ? (
              videoThumb ? (
                <>
                  <img src={videoThumb} alt="" className="w-full h-full object-cover" />
                  <span className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Play size={14} className="text-white fill-white" aria-hidden="true" />
                  </span>
                </>
              ) : (
                <>
                  <video src={value} className="w-full h-full object-cover" muted playsInline />
                  <span className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Video size={16} className="text-white" aria-hidden="true" />
                  </span>
                </>
              )
            ) : (
              <img
                src={value}
                alt=""
                className={`w-full h-full ${category === 'clients' ? 'object-contain p-2' : 'object-cover'}`}
              />
            )
          ) : (
            <ImageIcon size={18} className="text-dim" aria-hidden="true" />
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="relative w-full">
            <Link2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim pointer-events-none" aria-hidden="true" />
            <input
              id={inputId}
              type="url"
              inputMode="url"
              value={value || ''}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder={placeholder}
              aria-describedby={hintId}
              aria-label={label ? undefined : 'URL media'}
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg pl-8 pr-3 py-2 text-white text-xs font-body placeholder:text-dim hover:border-white/20 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <input
              ref={fileInputRef}
              type="file"
              accept={fileAccept}
              onChange={handleFileSelect}
              className="hidden"
              tabIndex={-1}
              aria-hidden="true"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="h-11 pointer-fine:h-8 px-3 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white text-xs font-ui font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-wait"
            >
              {uploading ? (
                <>
                  <Loader2 size={13} className="animate-spin" aria-hidden="true" />
                  Mengunggah...
                </>
              ) : (
                <>
                  <UploadCloud size={13} aria-hidden="true" />
                  Unggah file
                </>
              )}
            </button>
            {value && !uploading && (
              <button
                type="button"
                onClick={() => handleUrlChange('')}
                className="h-11 pointer-fine:h-8 px-3 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 text-xs font-ui font-semibold flex items-center gap-1.5 transition-colors"
              >
                <X size={13} aria-hidden="true" />
                Hapus media
              </button>
            )}
          </div>

          <div role="status" aria-live="polite">
            {error && (
              <p className="text-[11px] font-ui text-red-400 flex items-start gap-1.5">
                <AlertCircle size={12} className="shrink-0 mt-0.5" aria-hidden="true" />
                <span>{error}</span>
              </p>
            )}
            {success && (
              <p className="text-[11px] font-ui text-zinc-300 flex items-center gap-1.5">
                <CheckCircle2 size={12} className="shrink-0 text-[#4BD200]" aria-hidden="true" />
                File terunggah.
              </p>
            )}
          </div>

          <p id={hintId} className="text-[11px] font-ui text-dim leading-relaxed">{helperText}</p>
        </div>
      </div>
    </div>
  );
}
