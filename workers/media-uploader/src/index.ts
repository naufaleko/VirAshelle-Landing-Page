interface Env {
  virashelle_media: R2Bucket;
}

const PUBLIC_R2_URL = "https://pub-c61e4e9a5dfd40a899f95b4314976ee8.r2.dev";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, POST, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    if (url.pathname === "/upload" && request.method === "POST") {
      try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const category = (formData.get("category") as string) || "media";

        if (!file) {
          return new Response(JSON.stringify({ error: "No file uploaded" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Clean filename and create unique key
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        const key = `${category}/${uniqueId}-${safeName}`;

        await env.virashelle_media.put(key, file.stream(), {
          httpMetadata: {
            contentType: file.type || "application/octet-stream",
          },
        });

        const publicUrl = `${PUBLIC_R2_URL}/${key}`;

        return new Response(
          JSON.stringify({
            success: true,
            key,
            url: publicUrl,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } catch (err: any) {
        return new Response(
          JSON.stringify({ error: err?.message || "Upload failed" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    return new Response("VirAshelle Media Uploader API", {
      headers: corsHeaders,
    });
  },
};

