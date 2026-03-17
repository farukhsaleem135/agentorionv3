import { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface WizardContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  resetAndOpen: () => void;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export const useWizard = () => {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used within WizardProvider");
  return ctx;
};

export const WizardProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const resetAndOpen = useCallback(() => {
    setCurrentStep(0);
    setIsOpen(true);
  }, []);

  return (
    <WizardContext.Provider value={{ isOpen, open, close, currentStep, setCurrentStep, resetAndOpen }}>
      {children}
    </WizardContext.Provider>
  );
};
