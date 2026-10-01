import { supabase } from './supabase';

export async function uploadMediaFile(
  file: File | Blob,
  fileName: string,
  category = 'thumbnails'
): Promise<string> {
  const workerUrl = import.meta.env.VITE_R2_WORKER_URL;
  const { data: { session } } = await supabase.auth.getSession();

  // Try Cloudflare Worker R2 upload first
  if (workerUrl && session?.access_token) {
    try {
      const form = new FormData();
      form.append('file', file, fileName);
      form.append('category', category);

      const res = await fetch(`${workerUrl.replace(/\/$/, '')}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: form,
      });

      if (res.ok) {
        const json = await res.json();
        if (json?.url) return json.url;
      }
    } catch (e) {
      console.warn('R2 upload failed, falling back to Supabase Storage:', e);
    }
  }

  // Fallback to Supabase Storage
  const uniquePath = `${category}/${Date.now()}-${fileName}`;
  const { error } = await supabase.storage.from('media').upload(uniquePath, file, {
    cacheControl: '31536000',
    upsert: true,
  });

  if (error) {
    throw new Error(`Upload gagal: ${error.message}`);
  }

  const { data: publicData } = supabase.storage.from('media').getPublicUrl(uniquePath);
  return publicData.publicUrl;
}
