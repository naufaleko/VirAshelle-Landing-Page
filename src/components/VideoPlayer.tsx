import React from 'react';

export function isVideoMedia(url: string): boolean {
  if (!url) return false;
  const clean = url.toLowerCase().split('?')[0];
  if (
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.mov') ||
    clean.endsWith('.mkv') ||
    clean.includes('cloudinary.com/video') ||
    url.includes('pub-c61e4e9a5dfd40a899f95b4314976ee8.r2.dev') ||
    url.includes('r2.dev') && (clean.endsWith('.mp4') || clean.endsWith('.mov'))
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

  const clean = src.toLowerCase().split('?')[0];
  const isDirectVideo =
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.mov') ||
    clean.endsWith('.mkv') ||
    src.includes('cloudinary.com/video/upload') ||
    src.includes('r2.dev') ||
    src.includes('supabase.co/storage/v1/object/public');

  if (isDirectVideo) {
    return (
      <video
        controls
        playsInline
        className="w-full h-full object-contain bg-black"
      >
        <source src={src} type={clean.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
        Browser lo belum support HTML5 video tag.
      </video>
    );
  }

  let embedUrl = src;

  // Handle YouTube
  if (src.includes('youtube.com/watch')) {
    try {
      const urlObj = new URL(src);
      const videoId = urlObj.searchParams.get('v');
      if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    } catch (e) {}
  } else if (src.includes('youtu.be/')) {
    const videoId = src.split('youtu.be/')[1]?.split('?')[0];
    if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  } 
  // Handle Vimeo
  else if (src.includes('vimeo.com/') && !src.includes('player.vimeo.com')) {
    const videoId = src.split('vimeo.com/')[1]?.split('?')[0];
    if (videoId) embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1`;
  }
  // Handle Google Drive
  else if (src.includes('drive.google.com/file/d/')) {
    const videoId = src.split('file/d/')[1]?.split('/')[0];
    if (videoId) embedUrl = `https://drive.google.com/file/d/${videoId}/preview`;
  }

  return (
    <iframe
      src={embedUrl}
      className="w-full h-full border-none"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    />
  );
}
