export const config = { runtime: "edge" };

const CRAWLER_RE =
  /twitterbot|xbot|linkedinbot|facebookexternalhit|meta-externalagent|facebot|slackbot|discordbot|whatsapp|telegrambot|googlebot|bingbot|applebot/i;

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug") || "";
  const ua = request.headers.get("user-agent") || "";

  const proto = request.headers.get("x-forwarded-proto") || "https";
  const host = request.headers.get("host");

  if (CRAWLER_RE.test(ua)) {
    const supabaseUrl = process.env.SUPABASE_URL!.replace(/\/$/, "");
    const ogUrl = `${supabaseUrl}/functions/v1/funnel-og?slug=${encodeURIComponent(slug)}&v=3`;

    // Proxy the response instead of redirecting — LinkedIn does not reliably follow
    // cross-domain 302s, and it strictly validates that og:url matches the shared domain.
    // We fetch OG HTML from Supabase and rewrite any lovable.app/supabase origin references
    // to the actual Vercel host so og:url matches what LinkedIn was asked to preview.
    const ogResponse = await fetch(ogUrl, { headers: { "user-agent": ua } });
    const html = (await ogResponse.text())
      .replace(/https:\/\/agentorionv3\.lovable\.app/g, `${proto}://${host}`);

    return new Response(html, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  }

  // Regular user: serve index.html so the SPA handles routing.
  // The browser URL stays at /f/:slug (rewrite, not redirect), so React Router
  // will render the correct funnel page.
  const indexResponse = await fetch(`${proto}://${host}/index.html`);
  return new Response(indexResponse.body, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}
