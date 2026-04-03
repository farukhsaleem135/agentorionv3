export const config = { runtime: "edge" };

const CRAWLER_RE =
  /twitterbot|xbot|linkedinbot|facebookexternalhit|meta-externalagent|facebot|slackbot|discordbot|whatsapp|telegrambot|googlebot|bingbot|applebot/i;

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug") || "";
  const ua = request.headers.get("user-agent") || "";

  if (CRAWLER_RE.test(ua)) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
    const ogUrl = `${supabaseUrl}/functions/v1/funnel-og?slug=${encodeURIComponent(slug)}&v=3`;
    return Response.redirect(ogUrl, 302);
  }

  // Regular user: serve index.html so the SPA handles routing.
  // The browser URL stays at /f/:slug (rewrite, not redirect), so React Router
  // will render the correct funnel page.
  const host = request.headers.get("host");
  const indexResponse = await fetch(`https://${host}/index.html`);
  return new Response(indexResponse.body, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}
