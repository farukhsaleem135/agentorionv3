import { motion } from "framer-motion";

interface OrionLogoProps {
  className?: string;
  variant?: "nav" | "footer" | "mobile" | "splash";
}

const OrionLogo = ({ className = "", variant = "nav" }: OrionLogoProps) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <motion.svg
      width="44"
      height="14"
      viewBox="0 0 44 14"
      fill="none"
      className="shrink-0"
      animate={variant === "nav" ? { scale: [1, 1.12, 1] } : undefined}
      transition={variant === "nav" ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      {/* Connecting line */}
      <line x1="5" y1="7" x2="39" y2="7" stroke="var(--color-orion-blue)" strokeWidth="1.5" opacity="0.4" />
      {/* Small dot */}
      <circle
        cx="5" cy="7" r="3"
        fill="var(--color-orion-blue)"
        style={{ filter: "drop-shadow(0 0 6px var(--color-orion-blue-glow))" }}
      />
      {/* Medium dot */}
      <circle
        cx="22" cy="7" r="4"
        fill="var(--color-orion-blue)"
        style={{ filter: "drop-shadow(0 0 6px var(--color-orion-blue-glow))" }}
      />
      {/* Large dot */}
      <circle
        cx="39" cy="7" r="5"
        fill="var(--color-orion-blue)"
        style={{ filter: "drop-shadow(0 0 6px var(--color-orion-blue-glow))" }}
      />
    </motion.svg>
    <span className={`wordmark wordmark-${variant}`}>
      <span className="wordmark-agent">AGENT</span>
      <span className="wordmark-orion">ORION</span>
    </span>
  </div>
);

export default OrionLogo;
