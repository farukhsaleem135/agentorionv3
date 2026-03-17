import { motion } from "framer-motion";
import orionLogoImg from "@/assets/orion-logo.png";

interface OrionLogoProps {
  className?: string;
  variant?: "nav" | "footer" | "mobile" | "splash";
}

const sizeMap = {
  nav: 28,
  footer: 24,
  mobile: 24,
  splash: 44,
};

const OrionLogo = ({ className = "", variant = "nav" }: OrionLogoProps) => {
  const size = sizeMap[variant];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <motion.img
        src={orionLogoImg}
        alt="AgentOrion logo"
        width={size}
        height={size}
        className="shrink-0"
        animate={
          variant === "nav"
            ? { rotate: [0, 360] }
            : undefined
        }
        transition={
          variant === "nav"
            ? { duration: 12, repeat: Infinity, ease: "linear" }
            : undefined
        }
      />
      <span className={`wordmark wordmark-${variant}`}>
        <span className="wordmark-agent">AGENT</span>
        <span className="wordmark-orion">ORION</span>
      </span>
    </div>
  );
};

export default OrionLogo;
