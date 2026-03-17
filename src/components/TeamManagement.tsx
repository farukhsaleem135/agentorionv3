import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import InviteTeamMemberModal from "@/components/InviteTeamMemberModal";
import { Users, UserPlus, Trash2, Crown, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface SeatInfo {
  is_team_plan: boolean;
  tier?: string;
  subscription_id?: string;
  max_seats?: number;
  extra_seat_price?: number;
  current_seats?: number;
  seats_remaining?: number;
}

const TeamManagement = () => {
  const { user } = useAuth();
  const { members, isLoading, inviteMember, removeMember, isInviting } = useTeamMembers();
  const [seatInfo, setSeatInfo] = useState<SeatInfo | null>(null);
  const [loadingSeatInfo, setLoadingSeatInfo] = useState(true);
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.rpc("get_team_seat_info", { p_user_id: user.id })
      .then(({ data }) => {
        setSeatInfo(data as unknown as SeatInfo);
        setLoadingSeatInfo(false);
      });
  }, [user, members]);

  if (loadingSeatInfo) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin text-muted-foreground" size={20} />
      </div>
    );
  }

  if (!seatInfo?.is_team_plan) return null;

  const isTeam = seatInfo.tier === "team";
  const isBrokerage = seatInfo.tier === "brokerage";
  const maxSeats = seatInfo.max_seats || (isTeam ? 5 : 20);
  const currentSeats = seatInfo.current_seats || 1;
  const seatsRemaining = seatInfo.seats_remaining || 0;
  const extraPrice = seatInfo.extra_seat_price || (isTeam ? 25 : 15);
  const seatUsagePercent = Math.min((currentSeats / maxSeats) * 100, 100);

  const handleInvite = async (email: string, role: string) => {
    await inviteMember({ email, role });
    setShowInvite(false);
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    await removeMember(memberId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Users size={18} className="text-primary" />
        <h3 className="font-display text-sm font-semibold text-foreground">
          {isBrokerage ? "Brokerage" : "Team"} Management
        </h3>
        <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
          {isBrokerage ? "Brokerage Plan" : "Team Plan"}
        </span>
      </div>

      {/* Seat Usage */}
      <div className="bg-card border border-border rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-foreground">Seat Usage</p>
          <p className="text-sm font-semibold text-foreground">
            {currentSeats} / {maxSeats}
          </p>
        </div>
        <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${seatUsagePercent}%`,
              background: seatUsagePercent >= 100 ? "hsl(var(--destructive))" : "hsl(var(--primary))",
            }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <p className="text-[11px] text-muted-foreground">
            {seatsRemaining > 0
              ? `${seatsRemaining} seat${seatsRemaining !== 1 ? "s" : ""} remaining`
              : "All included seats used"}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Additional seats: ${extraPrice}/mo each
          </p>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Current Members
          </p>
          <span className="text-xs text-muted-foreground">{members.length} member{members.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Owner row */}
        <div className="px-4 py-3 flex items-center gap-3 border-b border-border/50">
          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <Crown size={14} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.email} <span className="text-xs text-primary font-semibold">(Owner)</span>
            </p>
            <p className="text-[11px] text-muted-foreground">Pro access</p>
          </div>
        </div>

        {isLoading ? (
          <div className="px-4 py-6 flex justify-center">
            <Loader2 className="animate-spin text-muted-foreground" size={16} />
          </div>
        ) : members.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">No team members yet</p>
            <p className="text-[11px] text-muted-foreground mt-1">Invite members to give them Pro-level access</p>
          </div>
        ) : (
          members.map((member) => (
            <div key={member.id} className="px-4 py-3 flex items-center gap-3 border-b border-border/50 last:border-0">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <Users size={14} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {member.display_name || member.email}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {member.status === "pending" ? "Invited" : "Active · Pro access"}{" "}
                  · {member.joined_at
                    ? `Joined ${format(new Date(member.joined_at), "MMM d, yyyy")}`
                    : `Invited ${format(new Date(member.invited_at), "MMM d, yyyy")}`}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  member.status === "active"
                    ? "bg-green-500/10 text-green-500"
                    : "bg-amber-500/10 text-amber-500"
                }`}>
                  {member.status === "active" ? "Active" : "Pending"}
                </span>
                <button
                  onClick={() => handleRemove(member.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="Remove member"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Invite Button */}
      <Button
        onClick={() => setShowInvite(true)}
        className="w-full"
        variant="default"
      >
        <UserPlus size={16} className="mr-2" />
        Invite Member
      </Button>

      {seatsRemaining <= 0 && (
        <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-500">
            You've used all {maxSeats} included seats. Additional members will be billed at ${extraPrice}/seat/month.
          </p>
        </div>
      )}

      <InviteTeamMemberModal
        open={showInvite}
        onOpenChange={setShowInvite}
        onInvite={handleInvite}
        loading={isInviting}
      />
    </motion.div>
  );
};

export default TeamManagement;
