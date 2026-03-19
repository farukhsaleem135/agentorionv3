import { useState, useEffect } from "react";
import { Plug, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import MLSConnectionModal from "./MLSConnectionModal";

const MLSConnectionBanner = () => {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [idxConnected, setIdxConnected] = useState<boolean | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("idx_connected")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setIdxConnected(data?.idx_connected ?? false);
      });
  }, [user]);

  if (idxConnected === null || idxConnected || dismissed) return null;

  return (
    <>
      <div
        className="flex items-center gap-3 p-3 rounded-xl border mb-4"
        style={{ backgroundColor: "#E8EFFD", borderColor: "#2D6BE4" }}
      >
        <Plug size={18} className="text-orion-blue flex-shrink-0" />
        <p className="flex-1 text-xs text-foreground">
          Connect your MLS/IDX data to power this feature with real listing data
        </p>
        <Button
          size="sm"
          className="bg-orion-blue hover:bg-orion-blue/90 text-white text-xs h-7 px-3 flex-shrink-0"
          onClick={() => setShowModal(true)}
        >
          Connect Now
        </Button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-md hover:bg-black/10 transition-colors flex-shrink-0"
        >
          <X size={14} className="text-muted-foreground" />
        </button>
      </div>

      <MLSConnectionModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConnected={() => setIdxConnected(true)}
      />
    </>
  );
};

export default MLSConnectionBanner;
