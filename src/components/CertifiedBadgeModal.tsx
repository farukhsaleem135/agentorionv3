import { motion, AnimatePresence } from "framer-motion";
import { Award, Download, Linkedin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface CertifiedBadgeModalProps {
  open: boolean;
  onClose: () => void;
}

const confettiColors = ["#2D6BE4", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

const ConfettiPiece = ({ index }: { index: number }) => {
  const color = confettiColors[index % confettiColors.length];
  const left = Math.random() * 100;
  const delay = Math.random() * 0.5;
  const duration = 1.5 + Math.random() * 1.5;
  const size = 6 + Math.random() * 6;
  const rotation = Math.random() * 360;

  return (
    <motion.div
      initial={{ y: -20, x: 0, opacity: 1, rotate: 0 }}
      animate={{ y: 500, x: (Math.random() - 0.5) * 200, opacity: 0, rotate: rotation + 360 }}
      transition={{ duration, delay, ease: "easeOut" }}
      className="absolute pointer-events-none"
      style={{
        left: `${left}%`,
        top: 0,
        width: size,
        height: size * 0.6,
        backgroundColor: color,
        borderRadius: 2,
      }}
    />
  );
};

const CertifiedBadgeModal = ({ open, onClose }: CertifiedBadgeModalProps) => {
  const [confettiPieces, setConfettiPieces] = useState<number[]>([]);

  useEffect(() => {
    if (open) {
      setConfettiPieces(Array.from({ length: 60 }, (_, i) => i));
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Confetti */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {confettiPieces.map((i) => (
              <ConfettiPiece key={i} index={i} />
            ))}
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-bg-elevated border border-border-brand/30 rounded-2xl p-8 max-w-md w-full text-center relative"
            style={{ boxShadow: "0 0 60px rgba(45,107,228,0.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-text-primary">
              <X size={20} />
            </button>

            {/* Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
              className="w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, hsl(var(--orion-blue)), hsl(var(--orion-blue) / 0.7))",
                boxShadow: "0 0 40px rgba(45,107,228,0.4)",
              }}
            >
              <Award size={56} className="text-white" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="font-satoshi font-bold text-2xl text-text-primary mb-2">
                🎉 Congratulations!
              </h2>
              <p className="text-text-secondary text-sm mb-1">You've completed all 30 days!</p>
              <div className="inline-block px-4 py-2 rounded-full bg-orion-blue/10 border border-orion-blue/30 mt-3 mb-6">
                <p className="text-orion-blue font-bold text-sm">
                  AgentOrion Certified AI Agent 2026
                </p>
              </div>

              <p className="text-text-tertiary text-xs mb-6">
                You've built a complete AI-powered lead generation system. Share your achievement with your network.
              </p>

              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    // Placeholder download
                    window.open("https://agentorion.com", "_blank");
                  }}
                >
                  <Download size={16} /> Download Badge
                </Button>
                <Button
                  className="gap-2 bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white"
                  onClick={() => {
                    window.open(
                      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://agentorion.com")}&title=${encodeURIComponent("I just completed the AgentOrion 30 Day Launch Program and earned my AgentOrion Certified AI Agent 2026 badge!")}`,
                      "_blank"
                    );
                  }}
                >
                  <Linkedin size={16} /> Share on LinkedIn
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CertifiedBadgeModal;
