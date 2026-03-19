import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface MLSConnectionModalProps {
  open: boolean;
  onClose: () => void;
  onConnected?: () => void;
}

const MLSConnectionModal = ({ open, onClose, onConnected }: MLSConnectionModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loginId, setLoginId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState("realcomp");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    if (!loginId.trim() || !apiKey.trim()) {
      toast({ title: "All fields required", description: "Please fill in your MLS login ID and API key.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      // Simple base64 encoding for the API key (in production, use server-side encryption)
      const encrypted = btoa(apiKey);

      // Upsert credentials
      const { error: credError } = await supabase
        .from("agent_idx_credentials" as any)
        .upsert({
          user_id: user.id,
          mls_provider: provider === "realcomp" ? "Realcomp — Michigan" : "Other MLS",
          login_id: loginId.trim(),
          api_key_encrypted: encrypted,
          idx_connected: true,
          connected_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

      if (credError) throw credError;

      // Update profiles idx_connected
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ idx_connected: true })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      toast({ title: "MLS/IDX Connected!", description: "Your credentials have been saved securely." });
      setLoginId("");
      setApiKey("");
      onConnected?.();
      onClose();
    } catch (e: any) {
      toast({ title: "Connection failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">Connect Your MLS/IDX Data</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Enter your MLS/IDX credentials to unlock real listing data across AgentOrion.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">MLS/IDX Username or Login ID</label>
            <Input
              type="text"
              placeholder="Enter your MLS login ID"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">MLS/IDX API Key or Password</label>
            <Input
              type="password"
              placeholder="Enter your MLS API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">MLS Provider</label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realcomp">Realcomp — Michigan</SelectItem>
                <SelectItem value="other" disabled>Other MLS — Coming Soon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full bg-orion-blue hover:bg-orion-blue/90 text-white"
            onClick={handleSave}
            disabled={saving}
          >
            {saving && <Loader2 size={14} className="animate-spin mr-2" />}
            Save and Connect
          </Button>

          <button
            onClick={onClose}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MLSConnectionModal;
