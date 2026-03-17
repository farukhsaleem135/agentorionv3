import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function useLeadNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const permissionRef = useRef<NotificationPermission>("default");

  // Request notification permission on mount
  useEffect(() => {
    if (!("Notification" in window)) return;
    permissionRef.current = Notification.permission;

    if (Notification.permission === "default") {
      Notification.requestPermission().then((perm) => {
        permissionRef.current = perm;
      });
    }
  }, []);

  // Subscribe to realtime lead inserts
  useEffect(() => {
    if (!user) return;
    let active = true;

    // First get user's funnel IDs so we only listen for their leads
    const channel = supabase
      .channel(`lead-notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "funnel_leads",
        },
        async (payload) => {
          if (!active) return;
          const newLead = payload.new as any;

          // Verify this lead belongs to one of the user's funnels
          const { data: funnel } = await supabase
            .from("funnels")
            .select("user_id, name")
            .eq("id", newLead.funnel_id)
            .maybeSingle();

          if (!active) return;
          if (!funnel || funnel.user_id !== user.id) return;

          const leadName = newLead.name || "Unknown";
          const temp = newLead.temperature || "new";

          // In-app toast
          toast({
            title: "🔥 New Lead!",
            description: `${leadName} just came in via ${funnel.name} (${temp})`,
          });

          // Browser notification
          if (permissionRef.current === "granted") {
            try {
              const notifOptions: NotificationOptions & { vibrate?: number[] } = {
                body: `${leadName} just submitted via ${funnel.name}`,
                icon: "/pwa-192x192.png",
                badge: "/pwa-192x192.png",
                tag: `lead-${newLead.id}`,
              };
              new Notification("New Lead — AgentOrion", notifOptions);
            } catch {
              // Notification constructor may fail on some mobile browsers
            }
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [user, toast]);
}
