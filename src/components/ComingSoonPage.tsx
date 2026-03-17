import { motion } from "framer-motion";
import { Clock, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { type LucideIcon } from "lucide-react";

interface ComingSoonPageProps {
  icon: LucideIcon;
  title: string;
  message: string;
}

const ComingSoonPage = ({ icon: Icon, title, message }: ComingSoonPageProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 px-1">
        <Icon size={16} className="text-primary" />
        <h3 className="font-display text-sm font-semibold text-foreground">{title}</h3>
        <Badge variant="secondary" className="text-[10px] px-2 py-0 bg-muted text-muted-foreground border-border">
          Coming Soon
        </Badge>
      </div>

      <div className="bg-card rounded-[var(--radius-lg)] border border-border p-8 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Clock size={22} className="text-muted-foreground" />
        </div>
        <h4 className="font-display text-base font-semibold text-foreground mb-2">{title} is coming soon</h4>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed mb-6">
          {message}
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => toast.success("We will notify you when this feature launches.")}
          className="gap-1.5"
        >
          <Bell size={14} />
          Notify Me
        </Button>
      </div>
    </motion.div>
  );
};

export default ComingSoonPage;
