import MobileShell from "@/components/MobileShell";
import { motion } from "framer-motion";
import { Users, Crown, TrendingUp, Target, UserPlus, BarChart3, ArrowUpRight, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import InviteTeamMemberModal from "@/components/InviteTeamMemberModal";

const assignmentRules = [
  { label: "Round Robin", desc: "Distribute leads evenly across all agents", active: true },
  { label: "Performance-Based", desc: "Route to agents with highest conversion rates", active: false },
  { label: "Geo-Targeted", desc: "Match leads to agents by market area", active: false },
  { label: "AI-Optimized", desc: "Let AI decide based on lead profile and agent strengths", active: false },
];

const Team = () => {
  const [activeRule, setActiveRule] = useState("Round Robin");
  const [view, setView] = useState<"members" | "rules">("members");
  const [showInvite, setShowInvite] = useState(false);

  const { members, isLoading, inviteMember, removeMember, isInviting } = useTeamMembers();

  const activeMembers = members.filter((m) => m.status === "active");
  const pendingMembers = members.filter((m) => m.status === "pending");

  const statusColors = { active: "bg-success", pending: "bg-warning", removed: "bg-muted-foreground" };
  const roleIcons: Record<string, typeof Crown> = { leader: Crown, agent: Users, admin: Target };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const handleInvite = async (email: string, role: string) => {
    await inviteMember({ email, role });
    setShowInvite(false);
  };

  return (
    <MobileShell>
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-5">
          <h1 className="font-display text-xl font-bold text-foreground">Team</h1>
          <button
            onClick={() => setShowInvite(true)}
            className="p-2.5 rounded-xl bg-gradient-cta touch-target active:scale-95 transition-transform shadow-glow"
          >
            <UserPlus size={18} className="text-primary-foreground" />
          </button>
        </div>

        {/* Team stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Active", value: String(activeMembers.length), icon: Users },
            { label: "Pending", value: String(pendingMembers.length), icon: Target },
            { label: "Total", value: String(members.length), icon: TrendingUp },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-gradient-card rounded-xl p-3 border border-border shadow-card text-center"
            >
              <stat.icon size={16} className="text-primary mx-auto mb-1" />
              <p className="font-display text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* View tabs */}
        <div className="flex gap-1 bg-secondary rounded-xl p-1 mb-5">
          {(["members", "rules"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                view === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Members view */}
        {view === "members" && (
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-primary" />
              </div>
            ) : members.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Users size={32} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">No team members yet</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Invite your first team member to get started
                </p>
                <button
                  onClick={() => setShowInvite(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-cta text-primary-foreground text-sm font-semibold shadow-glow"
                >
                  <UserPlus size={14} className="inline mr-1.5" />
                  Invite Member
                </button>
              </motion.div>
            ) : (
              members.map((member, i) => {
                const RoleIcon = roleIcons[member.role] || Users;
                const initials = getInitials(member.display_name, member.email);
                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card rounded-xl border border-border p-4 shadow-card"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-11 h-11 rounded-xl bg-gradient-gold flex items-center justify-center text-primary-foreground font-display text-sm font-bold">
                          {initials}
                        </div>
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${
                            statusColors[member.status as keyof typeof statusColors] || "bg-muted-foreground"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {member.display_name || member.email}
                          </p>
                          <RoleIcon size={12} className="text-primary flex-shrink-0" />
                        </div>
                        <p className="text-[11px] text-muted-foreground capitalize">
                          {member.role} · {member.status}
                        </p>
                      </div>
                      <button
                        onClick={() => removeMember(member.id)}
                        className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* Rules view */}
        {view === "rules" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground mb-2">
              Choose how new leads are distributed to team members
            </p>
            {assignmentRules.map((rule, i) => (
              <motion.button
                key={rule.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setActiveRule(rule.label)}
                className={`w-full text-left p-4 rounded-xl border transition-all active:scale-[0.98] ${
                  activeRule === rule.label
                    ? "bg-primary/10 border-primary/30"
                    : "bg-card border-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{rule.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{rule.desc}</p>
                  </div>
                  {activeRule === rule.label && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <InviteTeamMemberModal
        open={showInvite}
        onOpenChange={setShowInvite}
        onInvite={handleInvite}
        loading={isInviting}
      />
    </MobileShell>
  );
};

export default Team;
