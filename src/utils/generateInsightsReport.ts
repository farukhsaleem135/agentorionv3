import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";

const NAVY = [10, 14, 26] as const;
const BLUE = [45, 107, 228] as const;
const GREY = [120, 130, 150] as const;
const WHITE = [255, 255, 255] as const;
const LIGHT_BG = [245, 247, 250] as const;

function drawSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFontSize(13);
  doc.setTextColor(...BLUE);
  doc.setFont("helvetica", "bold");
  doc.text(title, 20, y);
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.5);
  doc.line(20, y + 2, 190, y + 2);
  return y + 10;
}

function drawBodyText(doc: jsPDF, text: string, y: number, fontSize = 10): number {
  doc.setFontSize(fontSize);
  doc.setTextColor(60, 60, 70);
  doc.setFont("helvetica", "normal");
  const lines = doc.splitTextToSize(text, 170);
  doc.text(lines, 20, y);
  return y + lines.length * (fontSize * 0.45) + 4;
}

function drawKeyValue(doc: jsPDF, key: string, value: string, y: number): number {
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NAVY);
  doc.text(key + ":", 24, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 70);
  doc.text(value, 80, y);
  return y + 6;
}

function checkPage(doc: jsPDF, y: number, needed = 30): number {
  if (y + needed > 275) {
    doc.addPage();
    return 20;
  }
  return y;
}

function placeholder(doc: jsPDF, msg: string, y: number): number {
  doc.setFontSize(9);
  doc.setTextColor(...GREY);
  doc.setFont("helvetica", "italic");
  doc.text(msg, 24, y);
  return y + 8;
}

export async function generateInsightsReport(userId: string, displayName: string) {
  // Fetch all data in parallel
  const [funnelsRes, leadsRes, listingsRes, contentRes, outreachRes, nlpRes, marketRes, profileRes] = await Promise.all([
    supabase.from("funnels").select("id, name, views, leads_count, status, conversion_rate"),
    supabase.from("funnel_leads").select("id, temperature, created_at, funnel_id"),
    supabase.from("listings").select("price, views, status"),
    supabase.from("content").select("id, type, status"),
    supabase.from("outreach_queue").select("id, status, channel"),
    supabase.from("nlp_commands").select("id"),
    supabase.from("market_areas").select("name, market_temp, avg_sale_price, median_dom, inventory_count, ai_summary, opportunity_score"),
    supabase.from("profiles").select("display_name, market_area, city").eq("user_id", userId).single(),
  ]);

  const funnels = funnelsRes.data || [];
  const leads = leadsRes.data || [];
  const content = contentRes.data || [];
  const outreach = outreachRes.data || [];
  const nlpCommands = nlpRes.data || [];
  const markets = marketRes.data || [];
  const profile = profileRes.data;

  const agentName = profile?.display_name || displayName || "Agent";
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const fileDate = today.toISOString().slice(0, 10);

  const doc = new jsPDF();
  let y = 20;

  // ── HEADER ──
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, 210, 42, "F");
  doc.setFontSize(22);
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.text("AgentOrion", 20, 18);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Performance Report", 20, 26);
  doc.setFontSize(9);
  doc.text(`Agent: ${agentName}`, 20, 34);
  doc.text(`Generated: ${dateStr}`, 120, 34);
  y = 52;

  // ── LEAD SUMMARY ──
  y = drawSectionTitle(doc, "Lead Summary", y);
  if (leads.length === 0) {
    y = placeholder(doc, "No leads captured yet. Create a funnel to start generating leads.", y);
  } else {
    const hot = leads.filter(l => l.temperature === "hot").length;
    const warm = leads.filter(l => l.temperature === "warm").length;
    const cold = leads.filter(l => l.temperature === "cold").length;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
    const newLeads = leads.filter(l => l.created_at >= thirtyDaysAgo).length;
    y = drawKeyValue(doc, "Total Leads", String(leads.length), y);
    y = drawKeyValue(doc, "Hot / Warm / Cold", `${hot} / ${warm} / ${cold}`, y);
    y = drawKeyValue(doc, "New (last 30 days)", String(newLeads), y);
  }
  y += 4;

  // ── FUNNEL PERFORMANCE ──
  y = checkPage(doc, y, 40);
  y = drawSectionTitle(doc, "Funnel Performance", y);
  if (funnels.length === 0) {
    y = placeholder(doc, "No funnels created yet.", y);
  } else {
    // Table header
    doc.setFillColor(...LIGHT_BG);
    doc.rect(20, y - 4, 170, 8, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...NAVY);
    doc.text("Funnel Name", 22, y);
    doc.text("Views", 100, y);
    doc.text("Leads", 125, y);
    doc.text("Conv %", 150, y);
    doc.text("Status", 170, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 70);
    for (const f of funnels) {
      y = checkPage(doc, y, 8);
      const conv = f.views > 0 ? ((f.leads_count / f.views) * 100).toFixed(1) + "%" : "0%";
      const name = f.name.length > 30 ? f.name.slice(0, 28) + "…" : f.name;
      doc.text(name, 22, y);
      doc.text(String(f.views), 100, y);
      doc.text(String(f.leads_count), 125, y);
      doc.text(conv, 150, y);
      doc.text(f.status, 170, y);
      y += 6;
    }
  }
  y += 4;

  // ── AI ACTIVITY ──
  y = checkPage(doc, y, 30);
  y = drawSectionTitle(doc, "AI Activity", y);
  const contentCount = content.length;
  const sentOutreach = outreach.filter(o => o.status === "sent").length;
  const completedSequences = outreach.filter(o => o.status === "completed").length;
  y = drawKeyValue(doc, "Content Generated", String(contentCount), y);
  y = drawKeyValue(doc, "Outreach Sent", String(sentOutreach), y);
  y = drawKeyValue(doc, "Sequences Completed", String(completedSequences), y);
  y = drawKeyValue(doc, "AI Commands Used", String(nlpCommands.length), y);
  y += 4;

  // ── MARKET INTELLIGENCE ──
  y = checkPage(doc, y, 30);
  y = drawSectionTitle(doc, "Market Intelligence", y);
  if (markets.length === 0) {
    y = placeholder(doc, "No market areas configured yet. Add a market area to get intelligence.", y);
  } else {
    for (const m of markets.slice(0, 3)) {
      y = checkPage(doc, y, 20);
      y = drawKeyValue(doc, "Area", m.name, y);
      if (m.avg_sale_price) y = drawKeyValue(doc, "Avg Sale Price", `$${Number(m.avg_sale_price).toLocaleString()}`, y);
      if (m.median_dom) y = drawKeyValue(doc, "Median DOM", `${m.median_dom} days`, y);
      if (m.market_temp) y = drawKeyValue(doc, "Temperature", m.market_temp, y);
      if (m.ai_summary) {
        y = checkPage(doc, y, 15);
        y = drawBodyText(doc, m.ai_summary, y, 9);
      }
      y += 2;
    }
  }
  y += 2;

  // ── TOP PERFORMING FUNNEL ──
  y = checkPage(doc, y, 30);
  y = drawSectionTitle(doc, "Top Performing Funnel", y);
  const funnelsWithData = funnels.filter(f => f.views > 0);
  if (funnelsWithData.length === 0) {
    y = placeholder(doc, "Not enough funnel data yet to determine top performer.", y);
  } else {
    const top = funnelsWithData.sort((a, b) => {
      const ca = a.views > 0 ? a.leads_count / a.views : 0;
      const cb = b.views > 0 ? b.leads_count / b.views : 0;
      return cb - ca;
    })[0];
    const topConv = top.views > 0 ? ((top.leads_count / top.views) * 100).toFixed(1) : "0";
    doc.setFillColor(235, 240, 255);
    doc.roundedRect(20, y - 4, 170, 28, 3, 3, "F");
    y = drawKeyValue(doc, "Name", top.name, y);
    y = drawKeyValue(doc, "Views", String(top.views), y);
    y = drawKeyValue(doc, "Leads", String(top.leads_count), y);
    y = drawKeyValue(doc, "Conversion", `${topConv}%`, y);
  }
  y += 6;

  // ── RECOMMENDED NEXT ACTIONS ──
  y = checkPage(doc, y, 40);
  y = drawSectionTitle(doc, "Recommended Next Actions", y);
  const recommendations: string[] = [];
  const warmLeads = leads.filter(l => l.temperature === "warm").length;
  const hotLeads = leads.filter(l => l.temperature === "hot").length;
  if (warmLeads > 0 && sentOutreach === 0) {
    recommendations.push(`You have ${warmLeads} warm lead${warmLeads > 1 ? "s" : ""} with no outreach sent. Activate Autopilot to start automated follow-ups.`);
  }
  if (funnels.filter(f => f.status === "draft").length > 0) {
    recommendations.push("You have draft funnels that aren't live yet. Publish them to start capturing leads.");
  }
  if (markets.length === 0) {
    recommendations.push("Add a market area to get AI-powered local market intelligence and SEO landing pages.");
  }
  if (hotLeads > 2) {
    recommendations.push(`${hotLeads} hot leads need immediate attention. Schedule tours or follow-up calls today.`);
  }
  if (contentCount === 0) {
    recommendations.push("Generate AI content to boost your social media presence and funnel traffic.");
  }
  if (recommendations.length === 0) {
    recommendations.push("Keep monitoring your funnel performance and lead flow.");
    recommendations.push("Consider creating a new funnel targeting a different buyer segment.");
    recommendations.push("Review your market intelligence weekly for pricing shifts.");
  }
  for (const rec of recommendations.slice(0, 3)) {
    y = checkPage(doc, y, 10);
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 70);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(`• ${rec}`, 165);
    doc.text(lines, 24, y);
    y += lines.length * 4.5 + 3;
  }

  // ── FOOTER ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(...NAVY);
    doc.rect(0, 282, 210, 15, "F");
    doc.setFontSize(8);
    doc.setTextColor(...WHITE);
    doc.setFont("helvetica", "normal");
    doc.text("AgentOrion  •  agentorion.ai  •  This report was generated by AgentOrion AI", 20, 289);
    doc.text(`Page ${i} of ${pageCount}`, 175, 289);
  }

  const safeName = agentName.replace(/[^a-zA-Z0-9]/g, "");
  doc.save(`AgentOrion-Report-${safeName}-${fileDate}.pdf`);
}
