import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useCheckout = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const startCheckout = async (plan: string) => {
    if (!user) {
      toast({ title: "Please sign in first", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan },
      });

      if (error) throw error;

      if (data?.url) {
        // Real Stripe checkout
        window.location.href = data.url;
      } else if (data?.redirect) {
        // Dev mode — direct upgrade
        toast({ title: "Plan upgraded!", description: data.message });
        window.location.href = data.redirect;
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      toast({
        title: "Checkout failed",
        description: err.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { startCheckout, loading };
};
