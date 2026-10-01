import React from 'react';

export function isVideoMedia(url: string): boolean {
  if (!url) return false;
  const clean = url.toLowerCase().split('?')[0];

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
  if (url.includes('youtube.com/watch')) {
    try {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get('v');
      if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    } catch (e) {}
  } else if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  } else if (url.includes('drive.google.com/file/d/')) {
    const videoId = url.split('file/d/')[1]?.split('/')[0];
    if (videoId) return `https://drive.google.com/thumbnail?id=${videoId}&sz=w1280-h720`;
  }
  return null;
}

export function VideoPlayer({ src }: { src: string }) {
  if (!src) return null;

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

  if (isDirectVideo) {
    const mimeType = clean.endsWith('.webm') ? 'video/webm' : clean.endsWith('.mov') ? 'video/quicktime' : 'video/mp4';
    return (
      <video
        controls
        autoPlay
        playsInline
        className="w-full h-full object-contain bg-black"
      >
        <source src={targetUrl} type={mimeType} />
        Browser Anda belum mendukung pemutaran video langsung.
      </video>
    );
  }

  let embedUrl = targetUrl;

  // Handle YouTube
  if (targetUrl.includes('youtube.com/watch')) {
    try {
      const urlObj = new URL(targetUrl);
      const videoId = urlObj.searchParams.get('v');
      if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    } catch (e) {}
  } else if (targetUrl.includes('youtu.be/')) {
    const videoId = targetUrl.split('youtu.be/')[1]?.split('?')[0];
    if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  } 
  // Handle Vimeo
  else if (targetUrl.includes('vimeo.com/') && !targetUrl.includes('player.vimeo.com')) {
    const videoId = targetUrl.split('vimeo.com/')[1]?.split('?')[0];
    if (videoId) embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1`;
  }
  // Handle Google Drive
  else if (targetUrl.includes('drive.google.com/file/d/')) {
    const videoId = targetUrl.split('file/d/')[1]?.split('/')[0];
    if (videoId) embedUrl = `https://drive.google.com/file/d/${videoId}/preview`;
  }

  return (
    <iframe
      src={embedUrl}
      title="Video player"
      className="w-full h-full border-none"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    />
  );
}
