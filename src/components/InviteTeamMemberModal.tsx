import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { UserPlus, Mail, Shield, Loader2 } from "lucide-react";

interface InviteTeamMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (email: string, role: string) => Promise<void>;
  loading: boolean;
}

const roles = [
  { value: "agent", label: "Agent", desc: "Can view leads and manage their pipeline" },
  { value: "admin", label: "Admin", desc: "Can manage team settings and assignments" },
  { value: "leader", label: "Leader", desc: "Full access including team management" },
];

const InviteTeamMemberModal = ({ open, onOpenChange, onInvite, loading }: InviteTeamMemberModalProps) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("agent");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    await onInvite(email.trim(), role);
    setEmail("");
    setRole("agent");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus size={18} className="text-primary" />
            Invite Team Member
          </DialogTitle>
          <DialogDescription>
            Send an invitation to join your team. They'll appear as pending until they sign up or accept.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email Address</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                placeholder="teammate@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              <Shield size={12} className="inline mr-1" />
              Role
            </label>
            <div className="space-y-2">
              {roles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    role === r.value
                      ? "bg-primary/10 border-primary/30"
                      : "bg-card border-border hover:border-primary/20"
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">{r.label}</p>
                  <p className="text-[11px] text-muted-foreground">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="flex-1 py-2.5 rounded-xl bg-gradient-cta text-primary-foreground text-sm font-semibold shadow-glow disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
              Send Invite
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteTeamMemberModal;
