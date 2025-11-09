import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RecipeRow {
  id: string;
  title: string;
  category: string | null;
  image_url: string | null;
}

async function fetchWikiImage(title: string, category?: string | null): Promise<string | null> {
  // Helper to call Wikipedia summary and extract best image
  async function summaryFor(pageTitle: string): Promise<any | null> {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
    const res = await fetch(url, { headers: { "accept": "application/json" } });
    if (!res.ok) return null;
    const json = await res.json();
    return json;
  }

  const tries: string[] = [
    title,
    `${title} (${category || "dish"})`,
    `${title} (dish)`,
    `${title} (food)`,
  ];

  for (const t of tries) {
    const data = await summaryFor(t);
    if (data && (data.originalimage?.source || data.thumbnail?.source)) {
      return (data.originalimage?.source || data.thumbnail?.source) as string;
    }
  }

  // Fallback to search API then resolve first result
  const searchUrl = `https://en.wikipedia.org/w/rest.php/v1/search/title?q=${encodeURIComponent(
    `${title} ${category || ""}`.trim()
  )}&limit=1`;
  try {
    const res = await fetch(searchUrl);
    if (res.ok) {
      const json = await res.json();
      const pageTitle: string | undefined = json?.pages?.[0]?.title;
      if (pageTitle) {
        const data = await summaryFor(pageTitle);
        if (data && (data.originalimage?.source || data.thumbnail?.source)) {
          return (data.originalimage?.source || data.thumbnail?.source) as string;
        }
      }
    }
  } catch (_) {
    // ignore
  }

  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const dryRun = url.searchParams.get("dryRun") === "true";
    const onlyMissing = url.searchParams.get("onlyMissing") !== "false"; // default true

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Backend not configured: missing URL or service role key");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch recipes
    const { data: recipes, error } = await supabase
      .from("recipes")
      .select("id, title, category, image_url");

    if (error) throw error;

    const targets = (recipes || []).filter((r: RecipeRow) =>
      onlyMissing ? !r.image_url || r.image_url.startsWith("/images/") || r.image_url.includes("unsplash.com") : true
    );

    const concurrency = 5;
    let index = 0;
    const updated: any[] = [];
    const failed: any[] = [];

    async function worker() {
      while (index < targets.length) {
        const i = index++;
        const rec = targets[i];
        try {
          const img = await fetchWikiImage(rec.title, rec.category);
          if (img) {
            if (!dryRun) {
              const { error: upErr } = await supabase
                .from("recipes")
                .update({ image_url: img })
                .eq("id", rec.id);
              if (upErr) throw upErr;
            }
            updated.push({ id: rec.id, title: rec.title, image_url: img });
          } else {
            failed.push({ id: rec.id, title: rec.title, reason: "No image found" });
          }
        } catch (e) {
          failed.push({ id: rec.id, title: rec.title, reason: (e as Error).message });
        }
      }
    }

    await Promise.all(Array.from({ length: concurrency }, () => worker()));

    return new Response(
      JSON.stringify({ total: recipes?.length || 0, processed: targets.length, updated: updated.length, failed: failed.length, dryRun, examples: { updated: updated.slice(0, 5), failed: failed.slice(0, 5) } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("fix-recipe-images error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
