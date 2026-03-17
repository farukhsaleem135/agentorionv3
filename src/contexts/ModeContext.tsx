import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Mode = "autopilot" | "pro";

interface ModeContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
  isAutopilot: boolean;
  isPro: boolean;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export const ModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setModeState] = useState<Mode>(() => {
    const stored = localStorage.getItem("agentorion-mode");
    return (stored === "pro" ? "pro" : "autopilot") as Mode;
  });

  const setMode = (m: Mode) => {
    setModeState(m);
    localStorage.setItem("agentorion-mode", m);
  };

  return (
    <ModeContext.Provider value={{ mode, setMode, isAutopilot: mode === "autopilot", isPro: mode === "pro" }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error("useMode must be used within ModeProvider");
  return ctx;
};
