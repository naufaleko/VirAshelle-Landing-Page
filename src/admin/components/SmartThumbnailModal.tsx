import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Check, Loader2, AlertCircle, Key, RefreshCw, Star } from 'lucide-react';
import {
  extractCandidateFrames,
  selectBestThumbnailWithGemini,
  getGeminiApiKey,
  setGeminiApiKey,
  ExtractedFrame,
  SmartThumbnailResult,
} from '../../lib/gemini';
import { uploadMediaFile } from '../../lib/uploadHelper';
import { getOptimizedMediaUrl } from '../../components/VideoPlayer';

interface SmartThumbnailModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  videoTitle: string;
  onSelectThumbnail: (thumbnailUrl: string) => void;
}

export function SmartThumbnailModal({
  isOpen,
  onClose,
  videoUrl,
  videoTitle,
  onSelectThumbnail,
}: SmartThumbnailModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [step, setStep] = useState<'idle' | 'extracting' | 'analyzing' | 'done' | 'saving'>('idle');
  const [frames, setFrames] = useState<ExtractedFrame[]>([]);
  const [geminiResult, setGeminiResult] = useState<SmartThumbnailResult | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getGeminiApiKey());
      setStep('idle');
      setFrames([]);
      setGeminiResult(null);
      setSelectedIndex(null);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartAnalysis = async () => {
    if (!apiKey.trim()) {
      setError('Masukkan Gemini API Key terlebih dahulu.');
      return;
    }

    setGeminiApiKey(apiKey);
    setError(null);
    setStep('extracting');

    try {
      // 1. Extract candidate frames
      const optimizedUrl = getOptimizedMediaUrl(videoUrl);
      const extracted = await extractCandidateFrames(optimizedUrl, 5);
      setFrames(extracted);

      // 2. Gemini Flash Analysis
      setStep('analyzing');
      const result = await selectBestThumbnailWithGemini(extracted, apiKey);
      setGeminiResult(result);
      setSelectedIndex(result.bestIndex);
      setStep('done');
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan saat menganalisis video.');
      setStep('idle');
    }
  };

  const handleApplyThumbnail = async () => {
    if (selectedIndex === null || !frames[selectedIndex]) return;

    setStep('saving');
    setError(null);

    try {
      const chosen = frames[selectedIndex];
      // Convert dataUrl to blob
      const res = await fetch(chosen.dataUrl);
      const blob = await res.blob();
      const fileName = `thumb-${Date.now()}-${selectedIndex}.jpg`;

      const publicUrl = await uploadMediaFile(blob, fileName, 'portfolio/thumbnails');
      onSelectThumbnail(publicUrl);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Gagal mengunggah thumbnail ke storage.');
      setStep('done');
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer" />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#4BD200]/10 border border-[#4BD200]/20 flex items-center justify-center text-[#4BD200]">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-white font-display font-bold text-base leading-tight">
                Smart Thumbnail AI (Gemini Flash)
              </h3>
              <p className="text-zinc-400 text-xs font-body truncate max-w-sm">
                {videoTitle || 'Pilih frame terbaik dengan AI'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* API Key Input */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4">
            <label className="flex items-center justify-between text-xs font-ui font-medium text-zinc-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Key size={14} className="text-[#4BD200]" /> Gemini API Key
              </span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#4BD200] hover:underline"
              >
                Dapatkan Key Gratis &rarr;
              </a>
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              disabled={step === 'extracting' || step === 'analyzing' || step === 'saving'}
              className="w-full bg-black/60 border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-[#4BD200]"
            />
            <p className="text-[11px] text-zinc-500 mt-1.5">
              API key tersimpan di browser Anda untuk keperluan pengambilan frame estetis otomatis.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Loading / Process Indicators */}
          {(step === 'extracting' || step === 'analyzing') && (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
              <Loader2 size={32} className="animate-spin text-[#4BD200]" />
              <p className="text-sm font-ui text-white font-medium">
                {step === 'extracting'
                  ? 'Mengekstrak 5 kandidat frame dari video...'
                  : 'Gemini 2.5 Flash sedang menilai estetika & komposisi...'}
              </p>
              <p className="text-xs text-zinc-500 max-w-xs">
                Mengevaluasi ketajaman, pencahayaan, ketiadaan blur gerak, dan daya tarik visual.
              </p>
            </div>
          )}

          {/* Frame Previews & Rationale */}
          {step === 'done' && frames.length > 0 && (
            <div className="space-y-4">
              {geminiResult && (
                <div className="p-4 rounded-xl bg-[#4BD200]/10 border border-[#4BD200]/25">
                  <div className="flex items-center gap-2 mb-1 text-[#4BD200] font-ui font-bold text-xs uppercase tracking-wider">
                    <Star size={14} className="fill-current" />
                    <span>Rekomendasi Gemini Flash (Skor: {geminiResult.aestheticScore}/100)</span>
                  </div>
                  <p className="text-xs text-zinc-200 font-body leading-relaxed">
                    {geminiResult.rationale}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-ui text-zinc-400 mb-2 font-medium">
                  Pilih Frame untuk Dijadikan Thumbnail:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {frames.map((f, i) => {
                    const isSelected = selectedIndex === i;
                    const isRecommended = geminiResult?.bestIndex === i;
                    const score = geminiResult?.scores?.[i];

                    return (
                      <div
                        key={i}
                        onClick={() => setSelectedIndex(i)}
                        className={`relative rounded-xl overflow-hidden cursor-pointer border transition-all ${
                          isSelected
                            ? 'border-[#4BD200] ring-2 ring-[#4BD200]/40 shadow-[0_0_16px_rgba(75,210,0,0.3)]'
                            : 'border-white/10 hover:border-white/30 opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={f.dataUrl}
                          alt={`Frame ${i + 1}`}
                          className="w-full aspect-video object-cover"
                        />
                        {isRecommended && (
                          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-[#4BD200] text-black font-ui font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                            <Star size={10} className="fill-current" /> AI Pick
                          </div>
                        )}
                        <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-xs text-white text-[9px] font-mono">
                          {f.timestamp}s {score ? `• ${score}pt` : ''}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-zinc-900/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-ui text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            Batal
          </button>

          {step === 'idle' && (
            <button
              onClick={handleStartAnalysis}
              className="px-4 py-2 rounded-lg bg-[#4BD200] hover:bg-[#3eb300] text-black text-xs font-ui font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
            >
              <Sparkles size={14} />
              <span>Analisis Frame dengan Gemini</span>
            </button>
          )}

          {step === 'done' && (
            <button
              onClick={handleApplyThumbnail}
              disabled={selectedIndex === null}
              className="px-4 py-2 rounded-lg bg-[#4BD200] hover:bg-[#3eb300] text-black text-xs font-ui font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md disabled:opacity-50"
            >
              <Check size={14} />
              <span>Terapkan Sebagai Thumbnail</span>
            </button>
          )}

          {step === 'saving' && (
            <button
              disabled
              className="px-4 py-2 rounded-lg bg-[#4BD200]/50 text-black text-xs font-ui font-bold flex items-center gap-1.5"
            >
              <Loader2 size={14} className="animate-spin" />
              <span>Menyimpan...</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
