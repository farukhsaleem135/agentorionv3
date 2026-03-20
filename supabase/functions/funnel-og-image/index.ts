import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function inferContentType(url: string, fallback: string | null): string {
  if (fallback?.startsWith("image/")) return fallback;

  const lower = url.toLowerCase();
  if (lower.includes("fm=png") || lower.endsWith(".png")) return "image/png";
  if (lower.includes("fm=webp") || lower.endsWith(".webp")) return "image/webp";
  if (lower.includes("fm=gif") || lower.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");

    if (!slug) {
      return new Response("Missing slug parameter", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let query = supabase
      .from("funnels")
      .select("id, hero_image_url, slug")
      .limit(1);

    if (slug.includes("/")) {
      query = query.eq("slug", slug);
    } else {
      query = query.or(`slug.eq.${slug},slug.ilike.%/${slug}`);
    }

    const { data: funnel, error } = await query.maybeSingle();

    if (error || !funnel) {
      return new Response("Funnel not found", {
        status: 404,
        headers: corsHeaders,
      });
    }

    let imageUrl = funnel.hero_image_url || "";

    if (!imageUrl) {
      const { data: heroImg } = await supabase
        .from("funnel_hero_images")
        .select("image_url")
        .eq("funnel_id", funnel.id)
        .eq("is_active", true)
        .eq("variant", "A")
        .maybeSingle();

      if (heroImg?.image_url) {
        imageUrl = heroImg.image_url;
      }
    }

    if (!imageUrl) {
      return new Response("No funnel image found", {
        status: 404,
        headers: corsHeaders,
      });
    }

    const upstream = await fetch(imageUrl, {
      headers: {
        "user-agent": req.headers.get("user-agent") || "Mozilla/5.0",
        accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });

    if (!upstream.ok) {
      return new Response("Unable to fetch funnel image", {
        status: 502,
        headers: corsHeaders,
      });
    }

    const contentType = inferContentType(
      imageUrl,
      upstream.headers.get("content-type"),
    );

    return new Response(upstream.body, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("funnel-og-image error:", error);
    return new Response("Internal error", {
      status: 500,
      headers: corsHeaders,
    });
  }
});