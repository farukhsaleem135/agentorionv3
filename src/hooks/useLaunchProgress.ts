import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type AgentType = "new" | "experienced";

const AGENT_TYPE_KEY = "launch_program_agent_type";

interface ProgressEntry {
  day_number: number;
  completed: boolean;
  completed_at: string | null;
  agent_type: string;
}

export function useLaunchProgress() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [progress, setProgress] = useState<Map<number, boolean>>(new Map());
  const [agentType, setAgentTypeState] = useState<AgentType>("new");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      // Fetch profile agent_type and progress in parallel
      const [profileRes, progressRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("agent_type")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("launch_program_progress")
          .select("day_number, completed, completed_at, agent_type")
          .eq("user_id", user.id),
      ]);

      // Determine agent type: URL param > profile DB value > localStorage > default "new"
      const fromUrl = searchParams.get("mode");
      const profileAgentType = (profileRes.data as any)?.agent_type;
      const stored = localStorage.getItem(AGENT_TYPE_KEY);

      let resolvedType: AgentType = "new";
      if (fromUrl === "experienced" || fromUrl === "new") {
        resolvedType = fromUrl;
      } else if (profileAgentType === "experienced" || profileAgentType === "new") {
        resolvedType = profileAgentType;
      } else if (stored === "experienced" || stored === "new") {
        resolvedType = stored;
      }
      setAgentTypeState(resolvedType);
      localStorage.setItem(AGENT_TYPE_KEY, resolvedType);

      const map = new Map<number, boolean>();
      const data = progressRes.data;
      if (data && data.length > 0) {
        (data as ProgressEntry[]).forEach((r) => map.set(r.day_number, r.completed));
      }
      setProgress(map);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const toggleDay = useCallback(async (day: number, completed: boolean) => {
    if (!user) return;
    setProgress((prev) => new Map(prev).set(day, completed));

    const { data: existing } = await supabase
      .from("launch_program_progress")
      .select("id")
      .eq("user_id", user.id)
      .eq("day_number", day)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("launch_program_progress")
        .update({
          completed,
          completed_at: completed ? new Date().toISOString() : null,
          agent_type: agentType,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("launch_program_progress").insert({
        user_id: user.id,
        day_number: day,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
        agent_type: agentType,
      });
    }
  }, [user, agentType]);

  const setAgentType = useCallback((type: AgentType) => {
    setAgentTypeState(type);
    localStorage.setItem(AGENT_TYPE_KEY, type);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("mode", type);
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const completedCount = Array.from(progress.values()).filter(Boolean).length;

  return { progress, agentType, setAgentType, toggleDay, completedCount, loading };
}
