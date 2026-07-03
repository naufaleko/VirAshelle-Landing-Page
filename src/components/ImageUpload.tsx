import React from 'react';
import { Link } from 'lucide-react';

interface ImageUploadProps {
  currentUrl: string;
  onUploadSuccess: (url: string) => void;
  path: string;
}

export function ImageUpload({ currentUrl, onUploadSuccess }: ImageUploadProps) {
  return (
    <div className="space-y-3">
      {currentUrl && (
        <div className="w-full h-32 bg-black/50 border border-white/10 rounded-lg overflow-hidden relative group">
          <img src={currentUrl} alt="Preview" className="w-full h-full object-cover" />
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
            onChange={(e) => onUploadSuccess(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#7d39eb] transition-all focus:ring-1 focus:ring-[#7d39eb]"
          />
        </div>
        <p className="text-[10px] text-zinc-500 mt-2">Paste a direct image link. No Firebase upload required.</p>
      </div>
    </div>
  );
}
