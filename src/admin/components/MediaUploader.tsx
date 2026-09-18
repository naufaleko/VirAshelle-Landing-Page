import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, Video, X, Play, Link2 } from 'lucide-react';
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
  label = 'Upload Media (Foto / Video)',
  placeholder = 'Tempel URL (YouTube / Drive / MP4) atau upload file...',
  onMediaTypeChange,
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setError('Ukuran file maksimal 100MB. Untuk video durasi panjang, disarankan menggunakan link YouTube / Vimeo / Google Drive.');
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
        try {
          const form = new FormData();
          form.append('file', file);
          form.append('category', category);

          const res = await fetch(`${workerUrl.replace(/\/$/, '')}/upload`, {
            method: 'POST',
            body: form,
          });

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
      setError(err?.message || 'Upload gagal. Silakan coba lagi.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlChange = (newUrl: string) => {
    onChange(newUrl);
    if (onMediaTypeChange && newUrl.trim()) {
      onMediaTypeChange(isVideoMedia(newUrl) ? 'video' : 'image');
    }
  };

  const renderHelperText = () => {
    if (category === 'clients') {
      return (
        <p className="text-[10px] text-zinc-500 leading-normal">
          💡 <strong className="text-zinc-400">Rekomendasi:</strong> Gunakan logo PNG transparan atau SVG.
        </p>
      );
    }
    if (category === 'team') {
      return (
        <p className="text-[10px] text-zinc-500 leading-normal">
          💡 <strong className="text-zinc-400">Rekomendasi:</strong> Gunakan foto profil rasio 1:1 atau portrait.
        </p>
      );
    }
    return (
      <p className="text-[10px] text-zinc-500 leading-normal">
        💡 <strong className="text-zinc-400">Upload langsung</strong> file foto/video (s.d 100MB ke R2) atau <strong className="text-zinc-400">paste link</strong> video (YouTube/Drive).
      </p>
    );
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-semibold text-zinc-400">
          {label}
        </label>
      )}

      <div className="flex items-start gap-3">
        {/* Preview Thumbnail */}
        <div className="w-16 h-16 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 relative group shadow-inner">
          {value ? (
            <>
              {isVideo ? (
                videoThumb ? (
                  <div className="w-full h-full relative">
                    <img src={videoThumb} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play size={14} className="text-white fill-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full relative bg-zinc-900 flex items-center justify-center">
                    <video
                      src={value}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Video size={16} className="text-[#4BD200]" />
                    </div>
                  </div>
                )
              ) : (
                <img 
                  src={value} 
                  alt="Preview" 
                  className={`w-full h-full ${category === 'clients' ? 'object-contain p-2' : 'object-cover'}`} 
                />
              )}

              {/* Clear button */}
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                title="Hapus media"
              >
                <X size={16} className="text-red-400" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1 text-zinc-600">
              <UploadCloud size={18} />
              <span className="text-[9px] font-mono tracking-wider">KOSONG</span>
            </div>
          )}
        </div>

        {/* Input URL & Upload button container */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* URL Input */}
          <div className="relative w-full">
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg pl-7 pr-3 py-1.5 text-white text-xs focus:outline-none focus:border-[#4BD200] transition-colors placeholder:text-zinc-600"
            />
            <Link2 size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          </div>

          {/* Action Row: Upload button + format hint */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <input
              ref={fileInputRef}
              type="file"
              accept={fileAccept}
              onChange={handleFileSelect}
              className="hidden"
            />

            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white/10 hover:bg-[#4BD200] hover:text-black border border-white/10 hover:border-[#4BD200] text-white font-medium rounded-lg text-xs flex items-center gap-1.5 transition-all shrink-0 active:scale-95 disabled:opacity-50 shadow-sm cursor-pointer"
            >
              {uploading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Mengupload...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={13} />
                  <span>Upload File</span>
                </>
              )}
            </button>

            <span className="text-[10px] font-mono text-zinc-500 uppercase">
              {category === 'clients' ? 'SVG • PNG' : category === 'team' ? 'JPG • PNG' : 'Max 100MB'}
            </span>
          </div>

          {/* Feedback message */}
          {error && (
            <p className="text-[11px] text-red-400 flex items-center gap-1">
              <AlertCircle size={12} className="shrink-0" /> <span className="truncate">{error}</span>
            </p>
          )}
          {success && (
            <p className="text-[11px] text-[#4BD200] flex items-center gap-1">
              <CheckCircle2 size={12} className="shrink-0" /> <span>Berhasil diupload!</span>
            </p>
          )}

          {renderHelperText()}
        </div>
      </div>
    </div>
  );
}
