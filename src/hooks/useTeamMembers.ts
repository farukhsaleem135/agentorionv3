import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface TeamMember {
  id: string;
  email: string;
  role: string;
  status: string;
  member_user_id: string | null;
  display_name: string | null;
  invited_at: string;
  joined_at: string | null;
}

export function useTeamMembers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["team_members", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("team_owner_id", user.id)
        .neq("status", "removed")
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch display names for active members
      const activeIds = (data || [])
        .filter((m: any) => m.member_user_id)
        .map((m: any) => m.member_user_id);

      let profileMap: Record<string, string> = {};
      if (activeIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", activeIds);
        if (profiles) {
          profileMap = Object.fromEntries(
            profiles.map((p: any) => [p.user_id, p.display_name])
          );
        }
      }

      return (data || []).map((m: any) => ({
        ...m,
        display_name: m.member_user_id ? profileMap[m.member_user_id] || m.email : null,
      })) as TeamMember[];
    },
    enabled: !!user,
  });

  const inviteMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("team_members").insert({
        team_owner_id: user.id,
        email,
        role,
        status: "pending",
      });
      if (error) {
        if (error.code === "23505") throw new Error("This email has already been invited");
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team_members"] });
      toast({ title: "Invitation sent", description: "Team member has been invited." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from("team_members")
        .update({ status: "removed" })
        .eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team_members"] });
      toast({ title: "Member removed" });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: string }) => {
      const { error } = await supabase
        .from("team_members")
        .update({ role })
        .eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team_members"] });
      toast({ title: "Role updated" });
    },
  });

  return {
    members,
    isLoading,
    inviteMember: inviteMutation.mutateAsync,
    removeMember: removeMutation.mutateAsync,
    updateRole: updateRoleMutation.mutateAsync,
    isInviting: inviteMutation.isPending,
  };
}
