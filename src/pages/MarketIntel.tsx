import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, TrendingUp, TrendingDown, Minus, Search, Plus, Loader2,
  Thermometer, BarChart3, Users, Home, Eye, UserPlus, ExternalLink,
  ArrowUpRight, Sparkles, ChevronRight
} from "lucide-react";
import MobileShell from "@/components/MobileShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

interface MarketArea {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  state: string | null;
  avg_sale_price: number | null;
  median_dom: number | null;
  inventory_count: number | null;
  price_trend: string | null;
  demand_score: number | null;
  competition_score: number | null;
  opportunity_score: number | null;
  market_temp: string | null;
  ai_summary: string | null;
  ai_highlights: any[];
  views: number;
  leads_captured: number;
  status: string;
  last_analyzed_at: string | null;
}

const tempColors: Record<string, string> = {
  hot: "text-hot bg-hot/15",
  warm: "text-warm bg-warm/15",
  neutral: "text-muted-foreground bg-secondary",
  cool: "text-cold bg-cold/15",
  cold: "text-cold bg-cold/15",
};

const trendIcon = (trend: string | null) => {
  if (trend === "rising" || trend === "up") return <TrendingUp size={12} className="text-success" />;
  if (trend === "declining" || trend === "down") return <TrendingDown size={12} className="text-destructive" />;
  return <Minus size={12} className="text-muted-foreground" />;
};

const formatPrice = (n: number | null) => {
  if (!n) return "—";
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
};

const MarketIntel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [areas, setAreas] = useState<MarketArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newNeighborhood, setNewNeighborhood] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAreas = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("market_areas")
      .select("*")
      .order("opportunity_score", { ascending: false });
    setAreas((data as any) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAreas(); }, [fetchAreas]);

  const handleAnalyze = async () => {
    if (!newNeighborhood.trim()) return;
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("market-intelligence", {
        body: {
          action: "analyze",
          neighborhood: newNeighborhood.trim(),
          city: newCity.trim() || null,
          state: newState.trim() || null,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: "Market Analyzed", description: `${newNeighborhood} intelligence generated with opportunity score ${data.opportunity_score}/100` });
      setNewNeighborhood("");
      setNewCity("");
      setNewState("");
      setShowAdd(false);
      fetchAreas();
    } catch (e: any) {
      toast({ title: "Analysis Failed", description: e.message, variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const filtered = areas.filter(a =>
    !searchQuery || a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Aggregate stats
  const totalViews = areas.reduce((s, a) => s + (a.views || 0), 0);
  const totalLeads = areas.reduce((s, a) => s + (a.leads_captured || 0), 0);
  const avgOpportunity = areas.length ? Math.round(areas.reduce((s, a) => s + (a.opportunity_score || 0), 0) / areas.length) : 0;

  return (
    <MobileShell>
      <div className="px-4 pt-4 pb-24 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Market Intel</h1>
            <p className="text-xs text-muted-foreground">Hyper-local neighborhood intelligence</p>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground active:scale-95 transition-transform"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Add Neighborhood */}
        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-gradient-card rounded-xl border border-border p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={14} className="text-primary" />
                  <span className="text-xs font-semibold text-foreground">Analyze New Submarket</span>
                </div>
                <Input
                  placeholder="Neighborhood name (e.g., Midtown, Coral Gables)"
                  value={newNeighborhood}
                  onChange={(e) => setNewNeighborhood(e.target.value)}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="City"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="text-sm flex-1"
                  />
                  <Input
                    placeholder="State"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="text-sm w-20"
                  />
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing || !newNeighborhood.trim()}
                  className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {analyzing ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
                  {analyzing ? "Analyzing Market..." : "Generate Intelligence"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Aggregate Stats */}
        {areas.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gradient-card rounded-xl border border-border p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <BarChart3 size={12} className="text-primary" />
              </div>
              <p className="font-display text-lg font-bold text-foreground">{avgOpportunity}</p>
              <p className="text-[10px] text-muted-foreground">Avg Opportunity</p>
            </div>
            <div className="bg-gradient-card rounded-xl border border-border p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Eye size={12} className="text-primary" />
              </div>
              <p className="font-display text-lg font-bold text-foreground">{totalViews}</p>
              <p className="text-[10px] text-muted-foreground">Page Views</p>
            </div>
            <div className="bg-gradient-card rounded-xl border border-border p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <UserPlus size={12} className="text-primary" />
              </div>
              <p className="font-display text-lg font-bold text-foreground">{totalLeads}</p>
              <p className="text-[10px] text-muted-foreground">Leads Captured</p>
            </div>
          </div>
        )}

        {/* Search */}
        {areas.length > 2 && (
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>
        )}

        {/* Heatmap Visualization */}
        {areas.length > 0 && (
          <div className="bg-gradient-card rounded-xl border border-border p-4">
            <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
              <Thermometer size={14} className="text-primary" />
              Market Heatmap
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {filtered.slice(0, 6).map((area) => {
                const opp = area.opportunity_score || 0;
                const hue = opp > 70 ? 142 : opp > 50 ? 45 : opp > 30 ? 25 : 0;
                const sat = 70;
                const light = 45;
                return (
                  <button
                    key={area.id}
                    onClick={() => navigate(`/market/${area.slug}`)}
                    className="relative rounded-lg p-3 text-left active:scale-95 transition-transform overflow-hidden"
                    style={{ backgroundColor: `hsla(${hue}, ${sat}%, ${light}%, 0.15)` }}
                  >
                    <div
                      className="absolute inset-0 opacity-20 rounded-lg"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, hsla(${hue}, ${sat}%, ${light}%, 0.4), transparent 70%)`,
                      }}
                    />
                    <div className="relative">
                      <p className="text-[10px] font-bold text-foreground truncate">{area.name}</p>
                      <p className="text-[9px] text-muted-foreground">{area.city}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs font-display font-bold" style={{ color: `hsl(${hue}, ${sat}%, ${light}%)` }}>
                          {opp}
                        </span>
                        {trendIcon(area.price_trend)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Market Area Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <MapPin size={40} className="mx-auto text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No markets analyzed yet</p>
            <p className="text-[10px] text-muted-foreground">Tap + to analyze your first neighborhood</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((area, i) => (
              <motion.div
                key={area.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/market/${area.slug}`)}
                className="bg-gradient-card rounded-xl border border-border p-4 shadow-card active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground truncate">{area.name}</h3>
                      {area.market_temp && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold capitalize ${tempColors[area.market_temp] || tempColors.neutral}`}>
                          {area.market_temp}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {[area.city, area.state].filter(Boolean).join(", ")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display text-2xl font-bold text-primary">{area.opportunity_score || 0}</p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Opportunity</p>
                  </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-4 gap-2 mt-3">
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">Avg Price</p>
                    <p className="text-xs font-semibold text-foreground flex items-center justify-center gap-0.5">
                      {formatPrice(area.avg_sale_price)}
                      {trendIcon(area.price_trend)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">DOM</p>
                    <p className="text-xs font-semibold text-foreground">{area.median_dom || "—"}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">Demand</p>
                    <p className="text-xs font-semibold text-foreground">{area.demand_score || 0}/100</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">Competition</p>
                    <p className="text-xs font-semibold text-foreground">{area.competition_score || 0}/100</p>
                  </div>
                </div>

                {area.ai_summary && (
                  <p className="text-[10px] text-muted-foreground mt-2 line-clamp-2">{area.ai_summary}</p>
                )}

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5"><Eye size={10} /> {area.views}</span>
                    <span className="flex items-center gap-0.5"><UserPlus size={10} /> {area.leads_captured}</span>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MobileShell>
  );
};

export default MarketIntel;
