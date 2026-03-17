import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription, Tier } from "@/contexts/SubscriptionContext";

interface UpgradePromptProps {
  feature: string;
  requiredTier: "growth" | "pro";
  description: string;
  variant?: "inline" | "modal";
  onClose?: () => void;
  open?: boolean;
  children?: ReactNode;
}

const tierLabel: Record<string, string> = { growth: "Growth", pro: "Pro" };
const tierPrice: Record<string, string> = { growth: "$29", pro: "$59" };

export function UpgradePromptInline({ feature, requiredTier }: { feature: string; requiredTier: "growth" | "pro" }) {
  const { setShowUpgrade, setUpgradeReason, setUpgradeTarget } = useSubscription();

  return (
    <button
      onClick={() => {
        setUpgradeTarget(requiredTier);
        setUpgradeReason(`Unlock ${feature}`);
        setShowUpgrade(true);
      }}
      className="flex items-center gap-2 py-1.5 px-3 rounded-full"
      style={{ transition: "all var(--transition-base)" }}
    >
      <Lock size={14} className="text-text-muted" />
      <span className="text-text-muted text-sm line-through">{feature}</span>
      <span
        className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full"
        style={{ background: "linear-gradient(135deg, var(--color-orion-blue), var(--color-nebula-purple))" }}
      >
        {tierLabel[requiredTier]}
      </span>
    </button>
  );
}

export function UpgradePromptModal({ feature, requiredTier, description, open, onClose }: UpgradePromptProps) {
  const { setShowUpgrade, setUpgradeReason, setUpgradeTarget } = useSubscription();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-5"
          style={{ background: "rgba(7, 11, 20, 0.85)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative w-full max-w-[440px] bg-bg-elevated border border-border-brand p-8 text-center"
            style={{ borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-brand)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary"
              style={{ transition: "color var(--transition-base)" }}
            >
              <X size={18} />
            </button>

            <motion.div
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-14 h-14 mx-auto mb-5 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, var(--color-orion-blue), var(--color-nebula-purple))" }}
            >
              <Sparkles size={24} className="text-white" />
            </motion.div>

            <h2 className="font-display text-[28px] font-bold text-text-primary mb-3">
              Unlock {feature}
            </h2>
            <p className="text-[15px] text-text-secondary mb-2 leading-relaxed">
              {description}
            </p>
            <p className="text-text-tertiary text-sm mb-6">
              Starting at {tierPrice[requiredTier]}/month — cancel anytime.
            </p>

            <div className="flex flex-col gap-3">
              <Button
                variant="pro-badge"
                size="lg"
                className="w-full"
                onClick={() => {
                  onClose?.();
                  setUpgradeTarget(requiredTier);
                  setUpgradeReason(`Unlock ${feature}`);
                  setShowUpgrade(true);
                }}
              >
                Upgrade Now →
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  onClose?.();
                  setUpgradeTarget(requiredTier);
                  setUpgradeReason("");
                  setShowUpgrade(true);
                }}
              >
                See All Plans
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function UpgradePrompt(props: UpgradePromptProps) {
  if (props.variant === "modal") return <UpgradePromptModal {...props} />;
  return <UpgradePromptInline feature={props.feature} requiredTier={props.requiredTier} />;
}
