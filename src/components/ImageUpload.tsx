import React from 'react';
import { Link } from 'lucide-react';

interface ImageUploadProps {
  currentUrl: string;
  onUploadSuccess: (url: string) => void;
  path: string;
}

export function ImageUpload({ currentUrl, onUploadSuccess }: ImageUploadProps) {
  
  // Auto-convert Google Drive share links into direct image links
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let url = e.target.value;
    
    // Check for drive.google.com/file/d/ID/...
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      url = `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}`;
    } else {
      // Check for drive.google.com/open?id=ID
      const openIdMatch = url.match(/open\?id=([a-zA-Z0-9_-]+)/);
      if (openIdMatch && openIdMatch[1]) {
        url = `https://lh3.googleusercontent.com/d/${openIdMatch[1]}`;
      }
    }
    
    onUploadSuccess(url);
  };

  return (
    <div className="space-y-3">
      {currentUrl && (
        <div className="w-full h-32 bg-black/50 border border-white/10 rounded-lg overflow-hidden relative group flex items-center justify-center">
          <img 
            src={currentUrl} 
            alt="Preview" 
            className="w-full h-full object-cover" 
            onError={(e) => {
              // If image fails to load, replace with a placeholder or error text
              (e.target as HTMLImageElement).src = `https://placehold.co/600x400/1a1a1a/7d39eb?text=Invalid+Image+Link`;
            }}
          />
        </div>
      )}
      
      <div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <Link size={16} />
          </div>
          <input 
            type="text" 
            placeholder="Paste Image URL (Google Drive, Imgur, etc)"
            value={currentUrl}
            onChange={handleUrlChange}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb]"
          />
        </div>
        <p className="text-[10px] text-zinc-500 mt-2">Paste a direct image link. No Firebase upload required.</p>
      </div>
    </div>
  );
}
