import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BOT_PATTERNS = [
  "facebookexternalhit",
  "Facebot",
  "Twitterbot",
  "LinkedInBot",
  "WhatsApp",
  "Slackbot",
  "TelegramBot",
  "Discordbot",
  "Googlebot",
  "bingbot",
  "Applebot",
];

function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return BOT_PATTERNS.some((bot) =>
    userAgent.toLowerCase().includes(bot.toLowerCase())
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");

    if (!slug) {
      return new Response("Missing slug parameter", { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: area, error } = await supabase
      .from("market_areas")
      .select("id, name, slug, seo_title, seo_description, ai_summary, market_temp, avg_sale_price, user_id, status")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error || !area) {
      return new Response("Market report not found", { status: 404, headers: corsHeaders });
    }

    // Fetch agent branding
    let agentName = "";
    let companyName = "";
    if (area.user_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, company_name")
        .eq("user_id", area.user_id)
        .maybeSingle();
      if (profile) {
        agentName = profile.display_name || "";
        companyName = profile.company_name || "";
      }
    }

    const title = area.seo_title || `${area.name} Market Report`;
    const description =
      area.seo_description ||
      area.ai_summary ||
      `Real estate market intelligence for ${area.name}`;
    const siteName = companyName || agentName || "AgentOrion";

    const appOrigin = Deno.env.get("APP_ORIGIN") || "https://agentorionv2.lovable.app";
    const canonicalUrl = `${appOrigin}/market/${area.slug}`;
    // Use the clean app URL for og:url so Facebook displays a friendly domain
    const ogUrl = canonicalUrl;

    // Use the default OG image
    const ogImage = `${appOrigin}/og-default.png`;

    const userAgent = req.headers.get("user-agent");

    if (isBot(userAgent)) {
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(ogUrl)}" />
  <meta property="og:site_name" content="${escapeHtml(siteName)}" />
  <meta property="og:image" content="${escapeHtml(ogImage)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(ogImage)}" />
  <link rel="canonical" href="${escapeHtml(ogUrl)}" />
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
  ${agentName ? `<p>By ${escapeHtml(agentName)}${companyName ? `, ${escapeHtml(companyName)}` : ""}</p>` : ""}
  <a href="${escapeHtml(canonicalUrl)}">View this report</a>
</body>
</html>`;

      return new Response(html, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    // Humans: redirect to the actual page
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        Location: canonicalUrl,
      },
    });
  } catch (e) {
    console.error("market-og error:", e);
    return new Response("Internal error", { status: 500, headers: corsHeaders });
  }
});
