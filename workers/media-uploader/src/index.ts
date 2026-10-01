interface Env {
  virashelle_media: R2Bucket;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  /** Comma-separated list of admin emails allowed to upload. Empty = any authenticated user. */
  ADMIN_EMAILS?: string;
  /** Comma-separated list of allowed origins. Empty = any origin ("*"). */
  ALLOWED_ORIGINS?: string;
  /** Public base URL of the R2 bucket (r2.dev subdomain or custom domain). */
  PUBLIC_R2_URL?: string;
}

const DEFAULT_PUBLIC_R2_URL = "https://pub-c61e4e9a5dfd40a899f95b4314976ee8.r2.dev";
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
// Multipart framing (boundaries + field headers) on top of the file itself
const MULTIPART_OVERHEAD = 64 * 1024;

// Browsers report an empty MIME type for some containers (e.g. .mkv, .mov on
// Windows); fall back to the extension so those uploads are not rejected.
const EXTENSION_TYPES: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif",
  webp: "image/webp", avif: "image/avif", svg: "image/svg+xml",
  mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime", mkv: "video/x-matroska",
};

function parseList(value?: string): string[] {
  return (value || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function resolveContentType(file: File): string {
  if (file.type) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  return EXTENSION_TYPES[ext] || "";
}

function buildCorsHeaders(request: Request, env: Env): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Range",
    "Access-Control-Expose-Headers": "Content-Range, Content-Length, Accept-Ranges, ETag",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };

  const allowed = parseList(env.ALLOWED_ORIGINS);
  if (allowed.length === 0) {
    headers["Access-Control-Allow-Origin"] = "*";
  } else {
    const origin = request.headers.get("Origin");
    if (origin && allowed.includes(origin.toLowerCase())) {
      headers["Access-Control-Allow-Origin"] = origin;
    }
  }

  return headers;
}

function json(body: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

interface SupabaseUser {
  id?: string;
  email?: string;
}

/** Verify a Supabase access token by asking Supabase Auth who it belongs to. */
async function verifySupabaseToken(env: Env, token: string): Promise<SupabaseUser | null> {
  try {
    const res = await fetch(`${env.SUPABASE_URL.replace(/\/$/, "")}/auth/v1/user`, {
      method: "GET",
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.status !== 200) return null;
    return (await res.json()) as SupabaseUser;
  } catch {
    return null;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const cors = buildCorsHeaders(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);

    if (url.pathname === "/upload" && request.method === "POST") {
      if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
        return json(
          { error: "Worker misconfigured: SUPABASE_URL / SUPABASE_ANON_KEY missing in wrangler.toml [vars]" },
          500,
          cors
        );
      }

      // Reject oversized bodies before buffering them (formData() reads everything into memory)
      const contentLength = Number(request.headers.get("Content-Length") || 0);
      if (contentLength > MAX_FILE_SIZE + MULTIPART_OVERHEAD) {
        return json({ error: "File too large (max 100 MB)" }, 413, cors);
      }

      // --- Auth: require a valid Supabase session ---
      const authHeader = request.headers.get("Authorization") || "";
      const match = /^Bearer\s+(.+)$/i.exec(authHeader.trim());
      const token = match?.[1]?.trim();
      if (!token) {
        return json({ error: "Unauthorized" }, 401, cors);
      }

      const user = await verifySupabaseToken(env, token);
      if (!user) {
        return json({ error: "Invalid or expired session" }, 401, cors);
      }

      const adminEmails = parseList(env.ADMIN_EMAILS);
      if (adminEmails.length > 0) {
        const email = (user.email || "").trim().toLowerCase();
        if (!email || !adminEmails.includes(email)) {
          return json({ error: "Forbidden" }, 403, cors);
        }
      }

      // --- Upload ---
      try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        // The category becomes a key prefix and part of the public URL, so it gets
        // the same sanitising as the file name
        const rawCategory = (formData.get("category") as string) || "media";
        const category = rawCategory.replace(/[^a-zA-Z0-9._-]/g, "_") || "media";

        if (!file) {
          return json({ error: "No file uploaded" }, 400, cors);
        }

        if (file.size > MAX_FILE_SIZE) {
          return json({ error: "File too large (max 100 MB)" }, 413, cors);
        }

        const contentType = resolveContentType(file);
        if (!contentType.startsWith("image/") && !contentType.startsWith("video/")) {
          return json({ error: "Unsupported file type (images and videos only)" }, 415, cors);
        }

        // Clean filename and create unique key
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        const key = `${category}/${uniqueId}-${safeName}`;

        await env.virashelle_media.put(key, file.stream(), {
          httpMetadata: {
            contentType,
          },
        });

        const publicBase = (env.PUBLIC_R2_URL || DEFAULT_PUBLIC_R2_URL).replace(/\/$/, "");
        const publicUrl = `${publicBase}/${key}`;

        return json(
          {
            success: true,
            key,
            url: publicUrl,
          },
          200,
          cors
        );
      } catch (err: any) {
        return json({ error: err?.message || "Upload failed" }, 500, cors);
      }
    }

    if (request.method === "GET" || request.method === "HEAD") {
      const pathname = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
      if (!pathname || pathname === "health") {
        return new Response("OK", { status: 200, headers: cors });
      }

      try {
        const object = await env.virashelle_media.get(pathname, {
          range: request.headers,
          onlyIf: request.headers,
        });

        if (!object) {
          return new Response("File not found in R2", { status: 404, headers: cors });
        }

        const headers = new Headers(cors);
        object.writeHttpMetadata(headers);
        headers.set("etag", object.httpEtag);

        const currentContentType = headers.get("content-type");
        if (!currentContentType || currentContentType === "application/octet-stream") {
          const ext = pathname.split(".").pop()?.toLowerCase() || "";
          if (EXTENSION_TYPES[ext]) {
            headers.set("content-type", EXTENSION_TYPES[ext]);
          }
        }

        headers.set("Cache-Control", "public, max-age=31536000, immutable");
        headers.set("Accept-Ranges", "bytes");

        if (request.method === "HEAD") {
          headers.set("Content-Length", String(object.size));
          return new Response(null, { headers, status: 200 });
        }

        if (object.range) {
          const r = object.range as { offset?: number; length?: number; suffix?: number };
          let start = 0;
          let end = object.size - 1;
          let len = object.size;

          if (r.offset !== undefined && r.length !== undefined) {
            start = r.offset;
            end = Math.min(start + r.length - 1, object.size - 1);
            len = end - start + 1;
          } else if (r.suffix !== undefined) {
            start = Math.max(0, object.size - r.suffix);
            end = object.size - 1;
            len = end - start + 1;
          }

          headers.set("Content-Range", `bytes ${start}-${end}/${object.size}`);
          headers.set("Content-Length", String(len));

          return new Response(object.body, {
            headers,
            status: 206,
          });
        }

        headers.set("Content-Length", String(object.size));
        return new Response(object.body, {
          headers,
          status: 200,
        });
      } catch (err: any) {
        return new Response(`Error retrieving object: ${err?.message || err}`, {
          status: 500,
          headers: cors,
        });
      }
    }

    return new Response("VirAshelle Media Uploader API", {
      headers: cors,
    });
  },
};
