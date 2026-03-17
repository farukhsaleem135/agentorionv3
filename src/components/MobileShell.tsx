import { ReactNode, useEffect } from "react";
import BottomNav from "./BottomNav";
import HybridGuideButton from "./HybridGuideButton";
import HybridGuide from "./HybridGuide";
import WizardButton from "./WizardButton";
import WizardOverlay from "./WizardOverlay";
import { WizardProvider, useWizard } from "@/contexts/WizardContext";

interface MobileShellProps {
  children: ReactNode;
  activateWizard?: boolean;
}

const WizardActivator = ({ activate }: { activate?: boolean }) => {
  const { resetAndOpen } = useWizard();
  useEffect(() => {
    if (activate) resetAndOpen();
  }, [activate, resetAndOpen]);
  return null;
};

const MobileShell = ({ children, activateWizard }: MobileShellProps) => {
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <WizardProvider>
      <WizardActivator activate={activateWizard} />
      <div
        className="h-screen bg-bg-base text-text-primary max-w-5xl mx-auto relative overflow-y-auto overflow-x-hidden"
        style={{ transition: 'background-color 350ms ease, color 350ms ease' }}
      >
        <main className="pb-20">
          {children}
        </main>
        <WizardButton />
        <WizardOverlay />
        <HybridGuideButton />
        <HybridGuide />
        <BottomNav />
      </div>
    </WizardProvider>
  );
};

export default MobileShell;
