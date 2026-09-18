export function getR2PublicUrl(key: string): string {
  const publicUrl = import.meta.env.VITE_R2_PUBLIC_URL;
  if (publicUrl) {
    return `${publicUrl.replace(/\/$/, '')}/${key}`;
  }
  return key;
}

export async function uploadToR2(
  file: File,
  category: string,
  supabaseToken: string,
  onProgress?: (pct: number) => void
): Promise<string> {
  const workerUrl = import.meta.env.VITE_R2_WORKER_URL;
  if (!workerUrl) {
    throw new Error('R2 Worker URL is not configured. Please set VITE_R2_WORKER_URL.');
  }

  const key = `${category}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', `${workerUrl.replace(/\/$/, '')}/${key}`);
    xhr.setRequestHeader('Authorization', `Bearer ${supabaseToken}`);
    xhr.setRequestHeader('Content-Type', file.type);
    
    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
    }
    
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(getR2PublicUrl(key));
      } else {
        reject(new Error(`Upload failed with status: ${xhr.status}`));
      }
    };
    
    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.send(file);
  });
}
