import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, RotateCcw, RotateCw } from 'lucide-react';

export function isVideoMedia(url: string): boolean {
  if (!url) return false;
  const clean = url.toLowerCase().split('?')[0].split('#')[0];

  // Images are never videos
  if (
    clean.endsWith('.webp') ||
    clean.endsWith('.png') ||
    clean.endsWith('.jpg') ||
    clean.endsWith('.jpeg') ||
    clean.endsWith('.gif') ||
    clean.endsWith('.svg') ||
    clean.endsWith('.avif')
  ) {
    return false;
  }

  if (
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.mov') ||
    clean.endsWith('.mkv') ||
    clean.endsWith('.m4v') ||
    clean.includes('cloudinary.com/video')
  ) {
    return true;
  }
  if (
    url.includes('youtube.com') ||
    url.includes('youtu.be') ||
    url.includes('vimeo.com') ||
    url.includes('drive.google.com')
  ) {
    return true;
  }
  return false;
}

export function getOptimizedMediaUrl(url: string): string {
  if (!url) return '';
  // Route public R2 URLs through the worker proxy for fast, reliable streaming and avoiding ISP timeouts on r2.dev
  if (url.includes('pub-c61e4e9a5dfd40a899f95b4314976ee8.r2.dev')) {
    return url.replace(
      'https://pub-c61e4e9a5dfd40a899f95b4314976ee8.r2.dev',
      'https://virashelle-media-uploader.media-uploader.workers.dev'
    );
  }
  return url;
}

export function getVideoThumbnail(url: string): string | null {
  if (!url) return null;
  const clean = url.trim();

  // YouTube (watch, shorts, embed, youtu.be)
  if (clean.includes('youtube.com') || clean.includes('youtu.be')) {
    let videoId = '';
    try {
      if (clean.includes('youtube.com/watch')) {
        const urlObj = new URL(clean);
        videoId = urlObj.searchParams.get('v') || '';
      } else if (clean.includes('youtu.be/')) {
        videoId = clean.split('youtu.be/')[1]?.split(/[?#]/)[0] || '';
      } else if (clean.includes('youtube.com/shorts/')) {
        videoId = clean.split('youtube.com/shorts/')[1]?.split(/[?#]/)[0] || '';
      } else if (clean.includes('youtube.com/embed/')) {
        videoId = clean.split('youtube.com/embed/')[1]?.split(/[?#]/)[0] || '';
      }
    } catch (e) {}

    if (videoId) {
      return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    }
  }

  // Google Drive
  if (clean.includes('drive.google.com/file/d/')) {
    const videoId = clean.split('file/d/')[1]?.split('/')[0];
    if (videoId) return `https://drive.google.com/thumbnail?id=${videoId}&sz=w1280-h720`;
  }

  return null;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export interface VideoPlayerProps {
  src: string;
  autoPlay?: boolean;
  onAspectRatioChange?: (ratio: number) => void;
  className?: string;
}

export function VideoPlayer({
  src,
  autoPlay = true,
  onAspectRatioChange,
  className = '',
}: VideoPlayerProps) {
  const targetUrl = getOptimizedMediaUrl(src);
  const clean = targetUrl.toLowerCase().split('?')[0].split('#')[0];

  const isDirectVideo =
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.mov') ||
    clean.endsWith('.mkv') ||
    clean.endsWith('.m4v') ||
    targetUrl.includes('cloudinary.com/video/upload') ||
    targetUrl.includes('supabase.co/storage/v1/object/public');

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Notify aspect ratio for non-direct video on mount
  useEffect(() => {
    if (!isDirectVideo && onAspectRatioChange) {
      onAspectRatioChange(16 / 9);
    }
  }, [isDirectVideo, onAspectRatioChange]);

  const scheduleHideControls = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setShowControls(true);
    if (isPlaying) {
      hideTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  }, [isPlaying]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, []);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const bar = e.currentTarget;
    if (!video || !duration) return;
    const rect = bar.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = pos * duration;
    setCurrentTime(video.currentTime);
  };

  const jumpSeconds = (delta: number) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + delta));
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    const val = parseFloat(e.target.value);
    if (!video) return;
    video.volume = val;
    setVolume(val);
    if (val === 0) {
      video.muted = true;
      setIsMuted(true);
    } else if (isMuted) {
      video.muted = false;
      setIsMuted(false);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
        scheduleHideControls();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        jumpSeconds(5);
        scheduleHideControls();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        jumpSeconds(-5);
        scheduleHideControls();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, scheduleHideControls, duration]);

  if (isDirectVideo) {
    const mimeType = clean.endsWith('.webm') ? 'video/webm' : clean.endsWith('.mov') ? 'video/quicktime' : 'video/mp4';
    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
      <div
        ref={containerRef}
        onMouseMove={scheduleHideControls}
        onMouseEnter={() => {
          setIsHovered(true);
          setShowControls(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          if (isPlaying) setShowControls(false);
        }}
        className={`relative w-full h-full bg-black flex items-center justify-center overflow-hidden select-none group ${className}`}
      >
        <video
          ref={videoRef}
          src={targetUrl}
          autoPlay={autoPlay}
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onTimeUpdate={() => {
            if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
          }}
          onProgress={() => {
            const video = videoRef.current;
            if (video && video.duration > 0 && video.buffered.length > 0) {
              setBuffered((video.buffered.end(video.buffered.length - 1) / video.duration) * 100);
            }
          }}
          onLoadedMetadata={() => {
            const video = videoRef.current;
            if (video) {
              setDuration(video.duration || 0);
              const w = video.videoWidth;
              const h = video.videoHeight;
              if (w && h && onAspectRatioChange) {
                onAspectRatioChange(w / h);
              }
            }
          }}
          onClick={togglePlay}
          className="w-full h-full object-contain cursor-pointer max-h-full"
        >
          <source src={targetUrl} type={mimeType} />
          Browser Anda belum mendukung pemutaran video langsung.
        </video>

        {/* Center Play Button Overlay when paused */}
        {!isPlaying && (
          <button
            type="button"
            onClick={togglePlay}
            aria-label="Putar video"
            className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/60 hover:bg-[#4BD200] border border-white/20 hover:border-[#4BD200] backdrop-blur-md flex items-center justify-center text-white hover:text-black transition-all duration-300 transform hover:scale-110 shadow-2xl z-20 cursor-pointer"
          >
            <Play size={28} className="fill-current translate-x-0.5" />
          </button>
        )}

        {/* Control Bar */}
        <div
          className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent pt-10 pb-3 px-4 z-30 transition-opacity duration-300 ${
            showControls || !isPlaying || isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Timeline Scrubber */}
          <div
            onClick={handleSeek}
            className="group/scrub relative w-full h-3 flex items-center cursor-pointer mb-2"
          >
            {/* Background track */}
            <div className="absolute inset-x-0 h-1 group-hover/scrub:h-1.5 rounded-full bg-white/20 transition-all duration-150" />
            {/* Buffered track */}
            <div
              className="absolute left-0 h-1 group-hover/scrub:h-1.5 rounded-full bg-white/30 transition-all duration-150"
              style={{ width: `${buffered}%` }}
            />
            {/* Progress track */}
            <div
              className="absolute left-0 h-1 group-hover/scrub:h-1.5 rounded-full bg-[#4BD200] transition-all duration-150 shadow-[0_0_10px_rgba(75,210,0,0.5)]"
              style={{ width: `${progressPercent}%` }}
            />
            {/* Scrubber thumb */}
            <div
              className="absolute w-3.5 h-3.5 rounded-full bg-[#4BD200] border-2 border-white shadow-md transform -translate-x-1/2 scale-0 group-hover/scrub:scale-100 transition-transform duration-150"
              style={{ left: `${progressPercent}%` }}
            />
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between gap-3 text-white text-xs font-ui">
            {/* Left buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Jeda video' : 'Putar video'}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} className="fill-current" />}
              </button>

              <button
                type="button"
                onClick={() => jumpSeconds(-10)}
                aria-label="Mundur 10 detik"
                className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer hidden sm:block"
                title="Mundur 10 detik"
              >
                <RotateCcw size={16} />
              </button>

              <button
                type="button"
                onClick={() => jumpSeconds(10)}
                aria-label="Maju 10 detik"
                className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer hidden sm:block"
                title="Maju 10 detik"
              >
                <RotateCw size={16} />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-1.5 group/vol">
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Nyalakan suara' : 'Bisukan suara'}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
                >
                  {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  aria-label="Volume"
                  className="w-14 sm:w-18 h-1 accent-[#4BD200] bg-white/20 rounded-lg cursor-pointer"
                />
              </div>

              {/* Time display */}
              <div className="font-mono text-[11px] text-zinc-300 tracking-wider">
                <span>{formatTime(currentTime)}</span>
                <span className="text-zinc-500 mx-1">/</span>
                <span className="text-zinc-400">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'Keluar layar penuh' : 'Layar penuh'}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  let embedUrl = targetUrl;

  // Handle YouTube
  if (targetUrl.includes('youtube.com/watch') || targetUrl.includes('youtu.be/')) {
    let videoId = '';
    try {
      if (targetUrl.includes('youtube.com/watch')) {
        const urlObj = new URL(targetUrl);
        videoId = urlObj.searchParams.get('v') || '';
      } else {
        videoId = targetUrl.split('youtu.be/')[1]?.split('?')[0] || '';
      }
    } catch (e) {}

    if (videoId) {
      embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&controls=1&rel=0&modestbranding=1&playsinline=1`;
    }
  } 
  // Handle Vimeo
  else if (targetUrl.includes('vimeo.com/') && !targetUrl.includes('player.vimeo.com')) {
    const videoId = targetUrl.split('vimeo.com/')[1]?.split('?')[0];
    if (videoId) embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=${autoPlay ? 1 : 0}`;
  }
  // Handle Google Drive
  else if (targetUrl.includes('drive.google.com/file/d/')) {
    const videoId = targetUrl.split('file/d/')[1]?.split('/')[0];
    if (videoId) embedUrl = `https://drive.google.com/file/d/${videoId}/preview`;
  }

  return (
    <div className={`relative w-full h-full bg-black ${className}`}>
      <iframe
        src={embedUrl}
        title="Video player"
        className="w-full h-full border-none"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}
