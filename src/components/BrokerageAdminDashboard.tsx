import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Users, Zap, BarChart3, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface MemberOverview {
  email: string;
  status: string;
  joined_at: string | null;
  display_name: string | null;
  completed_days: number;
  lead_count: number;
  funnel_count: number;
}

const BrokerageAdminDashboard = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<MemberOverview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.rpc("get_brokerage_overview", { p_user_id: user.id })
      .then(({ data, error }) => {
        if (!error && data && (data as any).members) {
          setMembers((data as any).members);
        }
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin text-muted-foreground" size={20} />
      </div>
    );
  }

  const totalLeads = members.reduce((s, m) => s + (m.lead_count || 0), 0);
  const totalFunnels = members.reduce((s, m) => s + (m.funnel_count || 0), 0);
  const avgProgress = members.length > 0
    ? Math.round(members.reduce((s, m) => s + (m.completed_days || 0), 0) / members.length)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Building2 size={18} className="text-primary" />
        <h3 className="font-display text-sm font-semibold text-foreground">Brokerage Admin Dashboard</h3>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <Users size={16} className="mx-auto text-primary mb-1" />
          <p className="text-lg font-bold text-foreground">{members.length}</p>
          <p className="text-[10px] text-muted-foreground">Members</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <BarChart3 size={16} className="mx-auto text-primary mb-1" />
          <p className="text-lg font-bold text-foreground">{totalLeads}</p>
          <p className="text-[10px] text-muted-foreground">Total Leads</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <Zap size={16} className="mx-auto text-primary mb-1" />
          <p className="text-lg font-bold text-foreground">{totalFunnels}</p>
          <p className="text-[10px] text-muted-foreground">Total Funnels</p>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            All Member Accounts
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border/50">
                <th className="px-4 py-2 text-[11px] font-semibold text-muted-foreground">Member</th>
                <th className="px-4 py-2 text-[11px] font-semibold text-muted-foreground">Status</th>
                <th className="px-4 py-2 text-[11px] font-semibold text-muted-foreground text-center">Launch Progress</th>
                <th className="px-4 py-2 text-[11px] font-semibold text-muted-foreground text-center">Leads</th>
                <th className="px-4 py-2 text-[11px] font-semibold text-muted-foreground text-center">Funnels</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No members yet. Invite team members from the Team Management section above.
                  </td>
                </tr>
              ) : (
                members.map((m, i) => (
                  <tr key={i} className="border-b border-border/30 last:border-0">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground truncate max-w-[160px]">
                        {m.display_name || m.email}
                      </p>
                      {m.display_name && (
                        <p className="text-[10px] text-muted-foreground truncate max-w-[160px]">{m.email}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        m.status === "active"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-amber-500/10 text-amber-500"
                      }`}>
                        {m.status === "active" ? "Active" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${Math.min(((m.completed_days || 0) / 30) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-muted-foreground">{m.completed_days || 0}/30</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-foreground">
                      {m.lead_count || 0}
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-foreground">
                      {m.funnel_count || 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default BrokerageAdminDashboard;
