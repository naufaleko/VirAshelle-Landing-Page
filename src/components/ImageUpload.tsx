import React, { useState } from 'react';
import { uploadImage } from '../lib/firebase';
import { Upload, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  currentUrl: string;
  onUploadSuccess: (url: string) => void;
  path: string;
}

export function ImageUpload({ currentUrl, onUploadSuccess, path }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);
      
      const fileName = `${Date.now()}_${file.name}`;
      const fullPath = `${path}/${fileName}`;
      
      const url = await uploadImage(file, fullPath, (progress) => {
        setUploadProgress(progress);
      });
      onUploadSuccess(url);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-3">
      {currentUrl && (
        <div className="w-full h-32 bg-black/50 border border-white/10 rounded-lg overflow-hidden relative group">
          <img src={currentUrl} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}
      
      <div>
        <label className="flex items-center justify-center w-full bg-white/5 hover:bg-white/10 border border-dashed border-white/20 rounded-lg p-4 cursor-pointer transition-colors relative">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange}
            disabled={isUploading}
          />
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 w-full max-w-[200px] text-zinc-400">
              <div className="flex items-center justify-between w-full text-xs font-medium">
                <span>Uploading...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-zinc-400 group-hover:text-white">
              <Upload size={18} />
              <span className="text-xs font-medium uppercase tracking-wider">Choose Image</span>
            </div>
          )}
        </label>
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      </div>
    </div>
  );
}
