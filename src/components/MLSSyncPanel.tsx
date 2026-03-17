import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, RefreshCw, Download, Check, Loader2, Sparkles, X, Home, MapPin, DollarSign, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface MLSListing {
  mls_id: string;
  address: string;
  price: string;
  beds: number;
  baths: number;
  sqft: string;
  status: string;
  days_on_market: number;
  photo_url: string;
  ai_description?: string;
}

const mockMLSListings: MLSListing[] = [
  { mls_id: "MLS-20261542", address: "412 Oak Ridge Dr, Austin, TX", price: "$485,000", beds: 3, baths: 2, sqft: "1,850", status: "active", days_on_market: 4, photo_url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80" },
  { mls_id: "MLS-20261098", address: "1887 Lakewood Blvd, Round Rock, TX", price: "$625,000", beds: 4, baths: 3, sqft: "2,400", status: "active", days_on_market: 1, photo_url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80" },
  { mls_id: "MLS-20260887", address: "223 Sunset Ave, Cedar Park, TX", price: "$375,000", beds: 2, baths: 2, sqft: "1,200", status: "pending", days_on_market: 12, photo_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80" },
  { mls_id: "MLS-20261203", address: "9010 Congress Ave #402, Austin, TX", price: "$310,000", beds: 1, baths: 1, sqft: "850", status: "active", days_on_market: 7, photo_url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80" },
];

interface MLSSyncPanelProps {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

const MLSSyncPanel = ({ open, onClose, onImported }: MLSSyncPanelProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [listings, setListings] = useState<MLSListing[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    // Simulate MLS feed pull
    await new Promise(r => setTimeout(r, 2000));
    setListings(mockMLSListings);
    setLastSync(new Date().toLocaleTimeString());
    setSyncing(false);
    toast({ title: "MLS synced", description: `${mockMLSListings.length} listings found` });
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === listings.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(listings.map(l => l.mls_id)));
    }
  };

  const handleGenerateDescription = async (listing: MLSListing) => {
    setGeneratingDesc(listing.mls_id);
    try {
      const resp = await supabase.functions.invoke("generate-content", {
        body: {
          type: "listing-description",
          context: `Write a compelling, professional MLS listing description for: ${listing.address}. ${listing.beds} bed, ${listing.baths} bath, ${listing.sqft} sqft. Listed at ${listing.price}. Make it warm, inviting, and highlight lifestyle benefits. Keep under 100 words.`,
        },
      });
      const desc = resp.data?.body || `Stunning ${listing.beds}-bedroom home in a prime location. Featuring ${listing.sqft} sqft of thoughtfully designed living space with modern finishes throughout. Don't miss this opportunity!`;
      setListings(prev => prev.map(l =>
        l.mls_id === listing.mls_id ? { ...l, ai_description: desc } : l
      ));
    } catch {
      toast({ title: "Failed to generate description", variant: "destructive" });
    }
    setGeneratingDesc(null);
  };

  const handleImport = async () => {
    if (!user || selected.size === 0) return;
    setImporting(true);

    const toImport = listings.filter(l => selected.has(l.mls_id));
    const inserts = toImport.map(l => ({
      user_id: user.id,
      address: l.address,
      price: l.price,
      beds: l.beds,
      baths: l.baths,
      sqft: l.sqft,
      status: l.status === "pending" ? "pending" : "active",
      days_on_market: l.days_on_market,
    }));

    const { error } = await supabase.from("listings").insert(inserts);
    setImporting(false);

    if (error) {
      toast({ title: "Import failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `${inserts.length} listings imported!` });
      onImported();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[75] bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute inset-0 bg-card flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <Database size={18} className="text-primary" />
                  <h2 className="font-display text-lg font-bold text-foreground">MLS Sync</h2>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Import listings from your MLS feed</p>
              </div>
              <button onClick={onClose} className="p-2.5 rounded-xl bg-secondary active:scale-95 transition-transform">
                <X size={18} className="text-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
              {/* Sync button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-cta text-primary-foreground font-semibold text-sm shadow-glow active:scale-[0.98] transition-transform disabled:opacity-50"
                >
                  {syncing ? (
                    <><Loader2 size={16} className="animate-spin" /> Syncing MLS Feed...</>
                  ) : (
                    <><RefreshCw size={16} /> Pull Latest from MLS</>
                  )}
                </button>
              </div>

              {lastSync && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-[11px] text-muted-foreground">Last sync: {lastSync}</span>
                  <span className="text-[11px] text-muted-foreground">· {listings.length} listings available</span>
                </div>
              )}

              {/* Listing results */}
              {listings.length > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <button onClick={selectAll} className="text-xs text-primary font-medium">
                      {selected.size === listings.length ? "Deselect All" : "Select All"}
                    </button>
                    {selected.size > 0 && (
                      <span className="text-[11px] text-muted-foreground">{selected.size} selected</span>
                    )}
                  </div>

                  {listings.map((listing, i) => (
                    <motion.div
                      key={listing.mls_id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`rounded-xl border overflow-hidden transition-all ${
                        selected.has(listing.mls_id) ? "border-primary/40 bg-primary/5" : "border-border bg-card"
                      }`}
                    >
                      <div className="flex gap-3 p-3" onClick={() => toggleSelect(listing.mls_id)}>
                        <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-secondary">
                          <img src={listing.photo_url} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-foreground truncate">{listing.address}</p>
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                              selected.has(listing.mls_id) ? "border-primary bg-primary" : "border-border"
                            }`}>
                              {selected.has(listing.mls_id) && <Check size={12} className="text-primary-foreground" />}
                            </div>
                          </div>
                          <p className="font-display text-base font-bold text-primary mt-0.5">{listing.price}</p>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                            <span>{listing.beds}bd · {listing.baths}ba</span>
                            <span>{listing.sqft} sqft</span>
                            <span>{listing.days_on_market}d on market</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-mono text-muted-foreground">{listing.mls_id}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold capitalize ${
                              listing.status === "active" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                            }`}>{listing.status}</span>
                          </div>
                        </div>
                      </div>

                      {/* AI Description */}
                      <div className="px-3 pb-3 border-t border-border mt-0">
                        {listing.ai_description ? (
                          <div className="bg-secondary/50 rounded-lg p-2.5 mt-2">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Sparkles size={10} className="text-primary" />
                              <span className="text-[9px] text-primary font-semibold uppercase tracking-wider">AI Description</span>
                            </div>
                            <p className="text-[11px] text-foreground/80 leading-relaxed">{listing.ai_description}</p>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleGenerateDescription(listing); }}
                            disabled={generatingDesc === listing.mls_id}
                            className="flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[11px] font-medium active:scale-95 transition-transform disabled:opacity-50"
                          >
                            {generatingDesc === listing.mls_id ? (
                              <><Loader2 size={10} className="animate-spin" /> Generating...</>
                            ) : (
                              <><Sparkles size={10} /> Generate AI Description</>
                            )}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {/* Import button */}
                  {selected.size > 0 && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      <button
                        onClick={handleImport}
                        disabled={importing}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-cta text-primary-foreground font-semibold text-sm shadow-glow active:scale-[0.98] transition-transform disabled:opacity-50"
                      >
                        {importing ? (
                          <><Loader2 size={16} className="animate-spin" /> Importing...</>
                        ) : (
                          <><Download size={16} /> Import {selected.size} Listing{selected.size > 1 ? "s" : ""}</>
                        )}
                      </button>
                    </motion.div>
                  )}
                </>
              )}

              {/* Empty state */}
              {listings.length === 0 && !syncing && (
                <div className="text-center py-12">
                  <Database size={32} className="text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-sm text-muted-foreground">No MLS data loaded</p>
                  <p className="text-xs text-muted-foreground mt-1">Tap "Pull Latest from MLS" to sync your feed</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MLSSyncPanel;
