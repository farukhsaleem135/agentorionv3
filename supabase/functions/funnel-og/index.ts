import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const FALLBACK_APP_ORIGIN = "https://agentorionv3.lovable.app";

// Social crawlers should receive static OG HTML. Human browsers should be redirected
// with an HTTP redirect so crawlers don't follow meta/js redirects into SPA fallback tags.
function isSocialCrawler(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  const crawlerSignatures = [
    "facebookexternalhit",
    "facebot",
    "meta-externalagent",
    "linkedinbot",
    "twitterbot",
    "xbot",
    "slackbot",
    "discordbot",
    "whatsapp",
    "telegrambot",
    "skypeuripreview",
    "pinterest",
    "redditbot",
    "googlebot",
    "bingbot",
    "duckduckbot",
    "applebot",
    "embedly",
    "quora link preview",
    "outbrain",
  ];

  return crawlerSignatures.some((signature) => ua.includes(signature));
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function resolveAppOrigin(): string {
  const rawOrigin = Deno.env.get("APP_ORIGIN")?.trim();

  if (!rawOrigin) return FALLBACK_APP_ORIGIN;

  try {
    const parsed = new URL(rawOrigin);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.origin;
    }
  } catch {
    console.warn(`[funnel-og] Invalid APP_ORIGIN secret \"${rawOrigin}\", using fallback`);
  }

  return FALLBACK_APP_ORIGIN;
}

function resolveFunctionOrigin(): string {
  const rawOrigin = Deno.env.get("SUPABASE_URL")?.trim();

  if (!rawOrigin) {
    throw new Error("Missing SUPABASE_URL for funnel share metadata");
  }

  return rawOrigin.replace(/\/$/, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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

    // Fetch funnel data
    // Support both hierarchical slugs (agent/funnel) and legacy single slugs
    let query = supabase
      .from("funnels")
      .select("id, name, headline, subheadline, type, target_area, hero_image_url, slug, user_id");

    if (slug.includes("/")) {
      // Hierarchical slug: match exactly
      query = query.eq("slug", slug);
    } else {
      // Legacy single slug: match suffix after /
      query = query.or(`slug.eq.${slug},slug.ilike.%/${slug}`);
    }

    const { data: funnel, error } = await query.maybeSingle();

    if (error || !funnel) {
      return new Response("Funnel not found", {
        status: 404,
        headers: corsHeaders,
      });
    }

    const appOrigin = resolveAppOrigin();
    const canonicalUrl = `${appOrigin}/f/${funnel.slug}`;
    const functionOrigin = resolveFunctionOrigin();
    const shareObjectUrl = `${functionOrigin}/functions/v1/funnel-og?${url.searchParams.toString()}`;

    const userAgent = req.headers.get("user-agent") || "";
    if (!isSocialCrawler(userAgent)) {
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          Location: canonicalUrl,
          "Cache-Control": "no-store, max-age=0",
        },
      });
    }

    // Fetch agent branding for richer previews
    let companyName = "";
    if (funnel.user_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_name, display_name")
        .eq("user_id", funnel.user_id)
        .maybeSingle();
      if (profile) {
        companyName = profile.company_name || profile.display_name || "";
      }
    }

    // Resolve hero image: prefer funnels.hero_image_url, fall back to funnel_hero_images variant A
    let resolvedHeroImage = funnel.hero_image_url || "";
    if (!resolvedHeroImage) {
      const { data: heroImg } = await supabase
        .from("funnel_hero_images")
        .select("image_url")
        .eq("funnel_id", funnel.id)
        .eq("is_active", true)
        .eq("variant", "A")
        .maybeSingle();
      if (heroImg?.image_url) {
        resolvedHeroImage = heroImg.image_url;
      }
    }

    const title = funnel.headline || funnel.name;
    const description = funnel.subheadline ||
      `${funnel.type.replace(/[-_]/g, " ")} — ${funnel.target_area || "Real Estate"}`;
    const ogImage = resolvedHeroImage;
    const siteName = companyName || "AgentOrion";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(shareObjectUrl)}" />
  <meta property="og:site_name" content="${escapeHtml(siteName)}" />
  ${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}" />` : ""}
  ${ogImage ? `<meta property="og:image:url" content="${escapeHtml(ogImage)}" />` : ""}
  ${ogImage ? `<meta property="og:image:secure_url" content="${escapeHtml(ogImage)}" />` : ""}
  ${ogImage ? `<meta property="og:image:width" content="1200" />` : ""}
  ${ogImage ? `<meta property="og:image:height" content="630" />` : ""}
  ${ogImage ? `<meta property="og:image:alt" content="${escapeHtml(title)}" />` : ""}
  <meta name="twitter:card" content="${ogImage ? "summary_large_image" : "summary"}" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  ${ogImage ? `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />` : ""}
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
  <a href="${escapeHtml(canonicalUrl)}">View this page</a>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (e) {
    console.error("funnel-og error:", e);
    return new Response("Internal error", { status: 500, headers: corsHeaders });
  }
});