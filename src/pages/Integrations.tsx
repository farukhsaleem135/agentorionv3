import MobileShell from "@/components/MobileShell";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import IntegrationConnectModal from "@/components/IntegrationConnectModal";
import { integrationCredentialFields } from "@/data/integrationCredentials";
import { integrationSyncFunctions } from "@/data/integrationSyncMap";
import {
  Link2, CheckCircle2, XCircle, ChevronRight,
  Calendar, Mail, Building2, Share2,
  Facebook, Search, Video, Megaphone, Loader2, Unlink, RefreshCw,
  Send, Upload, ArrowRight, Clock, Bell
} from "lucide-react";
import { toast as sonnerToast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface Integration {
  id: string;
  name: string;
  icon: typeof Building2;
  category: string;
  description: string;
}

const integrations: Integration[] = [
  { id: "mls", name: "MLS / IDX", icon: Building2, category: "MLS", description: "Import real listings with market data" },
  { id: "prolinc", name: "PROLINC", icon: Share2, category: "Referral", description: "Agent-to-agent referral network" },
  { id: "google_cal", name: "Google Calendar", icon: Calendar, category: "Calendar", description: "Sync tours and appointments" },
  { id: "outlook", name: "Outlook", icon: Mail, category: "Calendar", description: "Microsoft calendar & email sync" },
  { id: "meta_ads", name: "Meta Ads", icon: Facebook, category: "Ads", description: "Publish campaigns directly to Facebook & Instagram" },
  { id: "google_ads", name: "Google Ads", icon: Search, category: "Ads", description: "Search & display ad management" },
  { id: "tiktok_ads", name: "TikTok Ads", icon: Video, category: "Ads", description: "Reach new audiences on TikTok" },
  { id: "youtube_ads", name: "YouTube Ads", icon: Megaphone, category: "Ads", description: "Video ad campaigns on YouTube" },
  { id: "resend", name: "Resend", icon: Send, category: "Messaging", description: "Transactional & drip email delivery" },
];

const crmSources = [
  { name: "Follow Up Boss", icon: "FUB" },
  { name: "kvCORE", icon: "kv" },
  { name: "Chime / Lofty", icon: "CH" },
  { name: "HubSpot", icon: "HS" },
  { name: "LionDesk", icon: "LD" },
];

const categories = ["MLS", "Referral", "Calendar", "Ads", "Messaging"];

const comingSoonIntegrations: Record<string, string> = {
  google_cal: "This integration will allow you to automatically sync your AgentOrion appointments and follow-up tasks directly to your Google Calendar. Stay tuned.",
  outlook: "This integration will allow you to automatically sync your AgentOrion appointments and follow-up tasks directly to your Outlook Calendar. Stay tuned.",
};

type ConnectionStatus = "connected" | "disconnected";

const Integrations = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [expandedCategory, setExpandedCategory] = useState<string | null>("Ads");
  const [connections, setConnections] = useState<Record<string, { id: string; status: string }>>({});
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [connectModal, setConnectModal] = useState<string | null>(null);
  const [disconnectTarget, setDisconnectTarget] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);

  const fetchConnections = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("integration_connections")
      .select("id, provider, status")
      .eq("user_id", user.id);

    const map: Record<string, { id: string; status: string }> = {};
    data?.forEach((c) => { map[c.provider] = { id: c.id, status: c.status }; });
    setConnections(map);
    setLoadingConnections(false);
  }, [user]);

  useEffect(() => { fetchConnections(); }, [fetchConnections]);

  const getStatus = (integrationId: string): ConnectionStatus => {
    return connections[integrationId]?.status === "connected" ? "connected" : "disconnected";
  };

  const handleConnect = async (credentials: Record<string, string>) => {
    if (!user || !connectModal) return;
    setSaving(true);

    const existing = connections[connectModal];
    let error;

    if (existing) {
      ({ error } = await supabase
        .from("integration_connections")
        .update({ credentials, status: "connected", last_synced_at: new Date().toISOString() })
        .eq("id", existing.id));
    } else {
      ({ error } = await supabase
        .from("integration_connections")
        .insert({ user_id: user.id, provider: connectModal, credentials, status: "connected" }));
    }

    setSaving(false);
    if (error) {
      toast({ title: "Error", description: "Failed to save credentials. Please try again.", variant: "destructive" });
    } else {
      toast({ title: "Connected!", description: `${integrations.find(i => i.id === connectModal)?.name} is now connected.` });
      setConnectModal(null);
      fetchConnections();
    }
  };

  const handleDisconnect = async () => {
    if (!disconnectTarget || !connections[disconnectTarget]) return;
    setSaving(true);

    const { error } = await supabase
      .from("integration_connections")
      .delete()
      .eq("id", connections[disconnectTarget].id);

    setSaving(false);
    if (error) {
      toast({ title: "Error", description: "Failed to disconnect. Please try again.", variant: "destructive" });
    } else {
      toast({ title: "Disconnected", description: `${integrations.find(i => i.id === disconnectTarget)?.name} has been disconnected.` });
      setDisconnectTarget(null);
      fetchConnections();
    }
  };

  const connectedCount = Object.values(connections).filter(c => c.status === "connected").length;

  const statusBadge = (status: ConnectionStatus) => {
    if (status === "connected") {
      return (
        <span className="flex items-center gap-1 text-[10px] text-success font-medium">
          <CheckCircle2 size={10} /> Connected
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
        <XCircle size={10} /> Not connected
      </span>
    );
  };

  return (
    <MobileShell>
      <div className="px-5 pt-6 pb-4">
        <div className="mb-5">
          <h1 className="font-display text-xl font-bold text-foreground">Integrations</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Connect your operational tools for seamless workflows</p>
        </div>

        {/* Import Contacts Migration Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <Upload size={18} className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground">Import Contacts</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Migrate your leads from an existing CRM to get started fast
              </p>
              <div className="flex gap-1.5 mt-2.5 flex-wrap">
                {crmSources.map((crm) => (
                  <span
                    key={crm.name}
                    className="px-2 py-0.5 rounded-md bg-secondary text-[9px] font-medium text-muted-foreground"
                  >
                    {crm.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => toast({ title: "Coming Soon", description: "CRM import wizard is under development." })}
            className="w-full mt-3 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium active:scale-[0.97] transition-transform flex items-center justify-center gap-1.5"
          >
            Import from CRM <ArrowRight size={12} />
          </button>
        </motion.div>

        {/* Stats */}
        <div className="flex gap-3 mb-5">
          <div className="flex-1 bg-gradient-card rounded-xl p-3 border border-border text-center">
            <p className="font-display text-lg font-bold text-foreground">
              {loadingConnections ? "—" : connectedCount}
            </p>
            <p className="text-[10px] text-muted-foreground">Connected</p>
          </div>
          <div className="flex-1 bg-gradient-card rounded-xl p-3 border border-border text-center">
            <p className="font-display text-lg font-bold text-foreground">{integrations.length}</p>
            <p className="text-[10px] text-muted-foreground">Available</p>
          </div>
          <div className="flex-1 bg-gradient-card rounded-xl p-3 border border-border text-center">
            <p className="font-display text-lg font-bold text-primary">{categories.length}</p>
            <p className="text-[10px] text-muted-foreground">Categories</p>
          </div>
        </div>

        {/* Category sections */}
        {categories.map((category) => {
          const items = integrations.filter(i => i.category === category);
          const isExpanded = expandedCategory === category;

          return (
            <div key={category} className="mb-4">
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category)}
                className="w-full flex items-center justify-between px-1 py-2"
              >
                <h3 className="font-display text-sm font-semibold text-foreground">{category}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{items.length}</span>
                  <ChevronRight size={14} className={`text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                </div>
              </button>

              {isExpanded && (
                <div className="space-y-2">
                  {items.map((integration, i) => {
                    const isComingSoon = integration.id in comingSoonIntegrations;
                    const status = getStatus(integration.id);
                    const isConnected = status === "connected";

                    return (
                      <motion.div
                        key={integration.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="bg-gradient-card rounded-xl p-4 border border-border shadow-card"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isComingSoon ? "bg-muted" : isConnected ? "bg-primary/10" : "bg-secondary"}`}>
                            <integration.icon size={18} className={isComingSoon ? "text-muted-foreground" : isConnected ? "text-primary" : "text-muted-foreground"} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-sm font-semibold text-foreground">{integration.name}</h4>
                                {isComingSoon && (
                                  <span className="inline-flex items-center rounded-full bg-muted text-muted-foreground text-[9px] px-1.5 py-0 font-medium border border-border">
                                    Coming Soon
                                  </span>
                                )}
                              </div>
                              {!isComingSoon && statusBadge(status)}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{integration.description}</p>
                          </div>
                        </div>

                        {isComingSoon ? (
                          <div className="mt-3 text-center py-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                              <Clock size={14} className="text-muted-foreground" />
                            </div>
                            <p className="text-[11px] text-muted-foreground max-w-xs mx-auto leading-relaxed mb-3">
                              {comingSoonIntegrations[integration.id]}
                            </p>
                            <button
                              onClick={() => sonnerToast.success("We will notify you when this feature launches.")}
                              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-secondary text-foreground text-xs font-medium active:scale-[0.97] transition-transform"
                            >
                              <Bell size={12} /> Notify Me
                            </button>
                          </div>
                        ) : isConnected ? (
                          <div className="space-y-2 mt-3">
                            <button
                            onClick={async () => {
                                const fnName = integrationSyncFunctions[integration.id];
                                if (!fnName) {
                                  toast({ title: "Sync Unavailable", description: `${integration.name} does not have a sync function configured yet.` });
                                  return;
                                }
                                const conn = connections[integration.id];
                                if (!conn || conn.status !== "connected") {
                                  toast({ title: "Not Connected", description: `Please connect ${integration.name} first before syncing.`, variant: "destructive" });
                                  return;
                                }
                                setSyncing(integration.id);
                                try {
                                  const { data, error } = await supabase.functions.invoke(fnName, {
                                    body: { action: "list_campaigns" },
                                  });
                                  if (error) throw error;
                                  toast({ title: "Sync Complete", description: `${integration.name} synced successfully. ${data?.synced ?? data?.total ?? ""} records processed.` });
                                  fetchConnections();
                                } catch (err: any) {
                                  toast({ title: "Sync Failed", description: err.message || "Could not sync.", variant: "destructive" });
                                } finally {
                                  setSyncing(null);
                                }
                              }}
                              disabled={syncing === integration.id}
                              className="w-full py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium active:scale-[0.97] transition-transform flex items-center justify-center gap-1.5"
                            >
                              <RefreshCw size={12} className={syncing === integration.id ? "animate-spin" : ""} />
                              {syncing === integration.id ? "Syncing..." : "Sync Now"}
                            </button>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setConnectModal(integration.id)}
                                className="flex-1 py-2 rounded-lg bg-secondary text-foreground text-xs font-medium active:scale-[0.97] transition-transform flex items-center justify-center gap-1.5"
                              >
                                <Link2 size={12} /> Update Keys
                              </button>
                              <button
                                onClick={() => setDisconnectTarget(integration.id)}
                                className="py-2 px-4 rounded-lg bg-destructive/10 text-destructive text-xs font-medium active:scale-[0.97] transition-transform flex items-center justify-center gap-1.5"
                              >
                                <Unlink size={12} /> Disconnect
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConnectModal(integration.id)}
                            className="w-full mt-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium active:scale-[0.97] transition-transform flex items-center justify-center gap-1.5"
                          >
                            <Link2 size={12} /> Connect
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Connect Modal */}
      {connectModal && integrationCredentialFields[connectModal] && (
        <IntegrationConnectModal
          open={!!connectModal}
          onOpenChange={(open) => !open && setConnectModal(null)}
          integrationName={integrations.find(i => i.id === connectModal)?.name || ""}
          integrationId={connectModal}
          credentialFields={integrationCredentialFields[connectModal]}
          onConnect={handleConnect}
          loading={saving}
        />
      )}

      {/* Disconnect Confirmation */}
      <AlertDialog open={!!disconnectTarget} onOpenChange={(open) => !open && setDisconnectTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">Disconnect {integrations.find(i => i.id === disconnectTarget)?.name}?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              This will remove your saved credentials. You can reconnect anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisconnect} className="bg-destructive text-destructive-foreground text-xs" disabled={saving}>
              {saving && <Loader2 size={14} className="animate-spin mr-1.5" />}
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MobileShell>
  );
};

export default Integrations;
