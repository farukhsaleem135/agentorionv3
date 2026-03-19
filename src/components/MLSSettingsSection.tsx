import { useState, useEffect, useRef } from "react";
import { CheckCircle, Plug, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import MLSConnectionModal from "./MLSConnectionModal";
import { format } from "date-fns";

const MLSSettingsSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [idxConnected, setIdxConnected] = useState(false);
  const [credentials, setCredentials] = useState<{
    mls_provider: string;
    login_id: string;
    connected_at: string | null;
  } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    if (!user) return;
    const [profileRes, credRes] = await Promise.all([
      supabase.from("profiles").select("idx_connected").eq("user_id", user.id).maybeSingle(),
      supabase.from("agent_idx_credentials" as any).select("mls_provider, login_id, connected_at").eq("user_id", user.id).maybeSingle(),
    ]);
    setIdxConnected(profileRes.data?.idx_connected ?? false);
    if (credRes.data) {
      setCredentials(credRes.data as any);
    }
    setLoading(false);
  };

  useEffect(() => { fetchStatus(); }, [user]);

  const handleDisconnect = async () => {
    if (!user) return;
    setDisconnecting(true);
    try {
      await supabase.from("agent_idx_credentials" as any).delete().eq("user_id", user.id);
      await supabase.from("profiles").update({ idx_connected: false }).eq("user_id", user.id);
      setIdxConnected(false);
      setCredentials(null);
      setShowDisconnect(false);
      toast({ title: "MLS/IDX Disconnected" });
    } catch (e: any) {
      toast({ title: "Failed to disconnect", description: e.message, variant: "destructive" });
    } finally {
      setDisconnecting(false);
    }
  };

  const maskedLoginId = credentials?.login_id
    ? credentials.login_id.slice(0, 4) + "••••"
    : "";

  if (loading) return null;

  return (
    <div id="mls-connection" className="mt-6 mb-4" ref={sectionRef}>
      <div className="flex items-center gap-2 mb-3">
        <Plug size={18} className="text-orion-blue" />
        <h3 className="font-display text-sm font-semibold text-foreground">MLS/IDX Connection</h3>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        {idxConnected && credentials ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-success-green" />
              <span className="text-sm font-semibold text-foreground">MLS/IDX Connected</span>
            </div>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p><span className="font-medium text-foreground">MLS Provider:</span> {credentials.mls_provider}</p>
              <p><span className="font-medium text-foreground">Login ID:</span> {maskedLoginId}</p>
              {credentials.connected_at && (
                <p><span className="font-medium text-foreground">Connected on:</span> {format(new Date(credentials.connected_at), "MMMM d, yyyy")}</p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-destructive text-destructive hover:bg-destructive/10"
              onClick={() => setShowDisconnect(true)}
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Connect Your MLS/IDX Data</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Connect your MLS/IDX credentials to unlock real listing data, market intelligence, and valuation reports across AgentOrion.
            </p>
            <Button
              className="bg-orion-blue hover:bg-orion-blue/90 text-white"
              size="sm"
              onClick={() => setShowModal(true)}
            >
              Connect MLS/IDX Data
            </Button>
          </div>
        )}
      </div>

      <MLSConnectionModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConnected={fetchStatus}
      />

      {/* Disconnect confirmation */}
      <Dialog open={showDisconnect} onOpenChange={setShowDisconnect}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Disconnect MLS/IDX?</DialogTitle>
            <DialogDescription>
              Disconnecting your MLS/IDX data will disable real listing data across AgentOrion. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowDisconnect(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDisconnect}
              disabled={disconnecting}
            >
              {disconnecting && <Loader2 size={14} className="animate-spin mr-2" />}
              Disconnect
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MLSSettingsSection;
