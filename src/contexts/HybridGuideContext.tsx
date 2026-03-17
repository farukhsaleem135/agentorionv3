import { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface HybridGuideContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  resetAndOpen: () => void;
  /** Tracks which AI action is currently executing */
  executingAction: string | null;
  setExecutingAction: (action: string | null) => void;
}

const HybridGuideContext = createContext<HybridGuideContextType | undefined>(undefined);

export const useHybridGuide = () => {
  const ctx = useContext(HybridGuideContext);
  if (!ctx) throw new Error("useHybridGuide must be used within HybridGuideProvider");
  return ctx;
};

export const HybridGuideProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [executingAction, setExecutingAction] = useState<string | null>(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => { setIsOpen(false); setExecutingAction(null); }, []);
  const resetAndOpen = useCallback(() => {
    setCurrentStep(0);
    setExecutingAction(null);
    setIsOpen(true);
  }, []);

  return (
    <HybridGuideContext.Provider value={{
      isOpen, open, close, currentStep, setCurrentStep, resetAndOpen,
      executingAction, setExecutingAction,
    }}>
      {children}
    </HybridGuideContext.Provider>
  );
};
