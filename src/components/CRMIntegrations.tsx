import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Check, ChevronRight, X, Loader2, RefreshCw, ArrowLeftRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CRMProvider {
  id: string;
  name: string;
  logo: string;
  desc: string;
  features: string[];
  connected: boolean;
  syncStatus?: "synced" | "syncing" | "error";
  lastSync?: string;
}

const crmProviders: CRMProvider[] = [
  { id: "followupboss", name: "Follow Up Boss", logo: "FUB", desc: "Lead routing & automation CRM", features: ["Two-way sync", "Activity logging", "Lead tagging", "Auto follow-ups"], connected: false },
  { id: "kvcore", name: "kvCORE", logo: "KV", desc: "Real estate platform & IDX", features: ["Contact sync", "Smart campaigns", "Lead scoring", "Transaction tracking"], connected: false },
  { id: "hubspot", name: "HubSpot", logo: "HS", desc: "Marketing & sales CRM", features: ["Deal pipeline", "Email sequences", "Contact import", "Reporting"], connected: false },
  { id: "liondesk", name: "LionDesk", logo: "LD", desc: "Real estate CRM & drip campaigns", features: ["Video emails", "Drip campaigns", "Lead distribution", "Power dialer"], connected: false },
  { id: "chime", name: "Chime", logo: "CH", desc: "AI-powered real estate CRM", features: ["AI assistant", "IDX website", "Team management", "Smart plans"], connected: false },
];

const CRMIntegrations = () => {
  const [providers, setProviders] = useState(crmProviders);
  const [selectedCRM, setSelectedCRM] = useState<CRMProvider | null>(null);
  const [connecting, setConnecting] = useState(false);
  const { toast } = useToast();

  const handleConnect = async (crm: CRMProvider) => {
    setConnecting(true);
    // Simulate connection — in production this would be OAuth flow
    await new Promise(r => setTimeout(r, 2000));
    setProviders(prev => prev.map(p =>
      p.id === crm.id ? { ...p, connected: true, syncStatus: "synced" as const, lastSync: "Just now" } : p
    ));
    setConnecting(false);
    setSelectedCRM(null);
    toast({ title: `${crm.name} connected!`, description: "Two-way sync is now active." });
  };

  const handleDisconnect = (crmId: string) => {
    setProviders(prev => prev.map(p =>
      p.id === crmId ? { ...p, connected: false, syncStatus: undefined, lastSync: undefined } : p
    ));
    toast({ title: "CRM disconnected" });
  };

  const connectedCount = providers.filter(p => p.connected).length;

  return (
    <div className="space-y-4">
      {/* Header stats */}
      <div className="bg-gradient-card rounded-xl p-4 border border-border shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">CRM Connections</p>
            <p className="font-display text-2xl font-bold text-foreground mt-1">{connectedCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <ArrowLeftRight size={22} className="text-primary" />
          </div>
        </div>
        {connectedCount > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-success font-medium">All syncs active</span>
          </div>
        )}
      </div>

      {/* Provider list */}
      {providers.map((crm, i) => (
        <motion.div
          key={crm.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-card rounded-xl border border-border p-4 shadow-card"
        >
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-display text-sm font-bold shrink-0 ${
              crm.connected ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
            }`}>
              {crm.logo}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">{crm.name}</p>
                {crm.connected && (
                  <span className="px-1.5 py-0.5 rounded-full bg-success/15 text-success text-[9px] font-bold">LIVE</span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">{crm.desc}</p>
              {crm.lastSync && (
                <p className="text-[10px] text-muted-foreground mt-0.5">Last sync: {crm.lastSync}</p>
              )}
            </div>
            {crm.connected ? (
              <button
                onClick={() => handleDisconnect(crm.id)}
                className="p-2 rounded-lg bg-secondary active:scale-95 transition-transform"
              >
                <RefreshCw size={14} className="text-primary" />
              </button>
            ) : (
              <button
                onClick={() => setSelectedCRM(crm)}
                className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold active:scale-95 transition-transform"
              >
                Connect
              </button>
            )}
          </div>
        </motion.div>
      ))}

      {/* Connect Sheet */}
      <AnimatePresence>
        {selectedCRM && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[75] bg-background/80 backdrop-blur-sm"
            onClick={() => !connecting && setSelectedCRM(null)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-2xl p-5 pb-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center font-display text-base font-bold text-primary">
                    {selectedCRM.logo}
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-foreground">{selectedCRM.name}</h3>
                    <p className="text-xs text-muted-foreground">{selectedCRM.desc}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedCRM(null)} className="p-2 rounded-lg bg-secondary active:scale-95 transition-transform">
                  <X size={16} className="text-foreground" />
                </button>
              </div>

              <div className="space-y-2 mb-5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Capabilities</p>
                {selectedCRM.features.map(f => (
                  <div key={f} className="flex items-center gap-2 py-1.5">
                    <Check size={14} className="text-success shrink-0" />
                    <span className="text-sm text-foreground">{f}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleConnect(selectedCRM)}
                disabled={connecting}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-cta text-primary-foreground text-sm font-semibold shadow-glow active:scale-[0.98] transition-transform disabled:opacity-50"
              >
                {connecting ? (
                  <><Loader2 size={16} className="animate-spin" /> Connecting...</>
                ) : (
                  <><Link2 size={16} /> Connect {selectedCRM.name}</>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CRMIntegrations;
