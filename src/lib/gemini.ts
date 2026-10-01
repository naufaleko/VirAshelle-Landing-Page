/**
 * Gemini Flash AI Integration for Smart Thumbnail Selection
 */

const GEMINI_KEY_STORAGE = 'virashelle_gemini_api_key';

export function getGeminiApiKey(): string {
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(GEMINI_KEY_STORAGE);
    if (local) return local.trim();
  }
  return (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
}

export function setGeminiApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    if (key.trim()) {
      localStorage.setItem(GEMINI_KEY_STORAGE, key.trim());
    } else {
      localStorage.removeItem(GEMINI_KEY_STORAGE);
    }
  }
}

export interface ExtractedFrame {
  timestamp: number;
  dataUrl: string;
  base64: string;
  mimeType: string;
}

export interface SmartThumbnailResult {
  bestIndex: number;
  aestheticScore: number;
  rationale: string;
  scores?: number[];
}

/**
 * Extracts candidate frames from a video URL using an offscreen video element and canvas.
 */
export async function extractCandidateFrames(
  videoUrl: string,
  frameCount = 5
): Promise<ExtractedFrame[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.src = videoUrl;

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Waktu ekstraksi frame habis (timeout 30 detik).'));
    }, 30000);

    const cleanup = () => {
      clearTimeout(timeout);
      video.pause();
      video.removeAttribute('src');
      video.load();
    };

    video.onerror = () => {
      cleanup();
      reject(new Error(`Gagal memuat video untuk ekstraksi frame: ${video.error?.message || 'Network/CORS error'}`));
    };

    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration;
        if (!duration || isNaN(duration) || duration <= 0) {
          cleanup();
          return reject(new Error('Durasi video tidak valid.'));
        }

        // Generate timestamps evenly spaced (avoiding extreme edges: 10% to 90%)
        const timestamps: number[] = [];
        const start = duration * 0.1;
        const end = duration * 0.9;
        const step = (end - start) / Math.max(1, frameCount - 1);
        for (let i = 0; i < frameCount; i++) {
          timestamps.push(start + i * step);
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          cleanup();
          return reject(new Error('Canvas context tidak tersedia.'));
        }

        // Limit dimensions to save memory & payload (e.g. 720p max)
        const scale = Math.min(1, 1280 / (video.videoWidth || 1280));
        canvas.width = Math.round((video.videoWidth || 1280) * scale);
        canvas.height = Math.round((video.videoHeight || 720) * scale);

        const frames: ExtractedFrame[] = [];

        for (const t of timestamps) {
          await seekToTime(video, t);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          const base64 = dataUrl.split(',')[1] || '';
          frames.push({
            timestamp: Math.round(t * 10) / 10,
            dataUrl,
            base64,
            mimeType: 'image/jpeg',
          });
        }

        cleanup();
        resolve(frames);
      } catch (err: any) {
        cleanup();
        reject(err);
      }
    };
  });
}

function seekToTime(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      resolve();
    };
    video.addEventListener('seeked', onSeeked);
    video.currentTime = time;
  });
}

/**
 * Sends extracted candidate frames to Gemini 2.5 Flash / 1.5 Flash to pick the most aesthetic frame.
 */
export async function selectBestThumbnailWithGemini(
  frames: ExtractedFrame[],
  apiKey: string
): Promise<SmartThumbnailResult> {
  if (!apiKey) {
    throw new Error('Gemini API Key belum dimasukkan. Silakan masukkan API Key di panel.');
  }

  // Multimodal prompt with candidate images
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: `You are the Lead Art Director & Creative Director for VirAshelle, a high-end commercial creative production studio.
Analyze these ${frames.length} candidate frames extracted from a video project to pick the single most striking hero thumbnail for our portfolio.

Evaluation criteria:
1. Sharp visual focus (strictly NO motion blur, NO closed eyes, NO awkward intermediate poses).
2. Strong composition, depth, and rule of thirds.
3. Compelling lighting, rich contrast, and vibrant color balance.
4. Clear product focus, branding, or punchy creative storytelling.

Candidate frames provided in order (Frame 0 to Frame ${frames.length - 1}):
`,
        },
        ...frames.flatMap((frame, index) => [
          {
            text: `\n--- Candidate Frame #${index} (Timestamp: ${frame.timestamp}s) ---\n`,
          },
          {
            inlineData: {
              mimeType: frame.mimeType,
              data: frame.base64,
            },
          },
        ]),
        {
          text: `\nProvide your evaluation. Output STRICTLY a valid JSON object with no markdown wrapping, no backticks, matching this exact TypeScript structure:
{
  "bestIndex": number, // integer 0 to ${frames.length - 1} representing the chosen frame
  "aestheticScore": number, // 1 to 100 overall score for the winning frame
  "scores": number[], // array of scores (1-100) for each frame in order [score0, score1, ...]
  "rationale": "Clear, professional 1-2 sentence explanation of why this specific frame is the best hero thumbnail"
}`,
        },
      ],
    },
  ];

  // Primary model: gemini-2.5-flash, fallback: gemini-1.5-flash
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini API Error (${res.status} on ${model}): ${errText}`);
      }

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error(`Response kosong dari ${model}`);
      }

      const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson) as SmartThumbnailResult;

      if (typeof parsed.bestIndex !== 'number' || parsed.bestIndex < 0 || parsed.bestIndex >= frames.length) {
        parsed.bestIndex = 0;
      }
      return parsed;
    } catch (err: any) {
      console.warn(`Attempt with ${model} failed:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('Gagal memproses rekomendasi frame dari Gemini Flash.');
}
