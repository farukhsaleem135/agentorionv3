import { useMemo } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const StarField = ({ count = 80 }: { count?: number }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const stars = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      cx: Math.random() * 100,
      cy: Math.random() * 100,
      r: Math.random() * 1 + 0.5,
      opacity: Math.random() * 0.07 + 0.08,
    })),
    [count]
  );

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="none"
      style={{ transition: "opacity 200ms ease" }}
    >
      {stars.map((s) => (
        <circle
          key={s.id}
          cx={`${s.cx}%`}
          cy={`${s.cy}%`}
          r={s.r}
          fill={isDark ? "var(--color-text-primary)" : "var(--color-orion-blue)"}
          opacity={isDark ? s.opacity : s.opacity * 0.5}
        />
      ))}
    </svg>
  );
};

export default StarField;
