import { ReactNode, useEffect } from "react";
import BottomNav from "./BottomNav";
import DesktopSidebar from "./DesktopSidebar";
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
      <div className="h-screen flex w-full">
        {/* Desktop sidebar — hidden below lg */}
        <DesktopSidebar />

        {/* Main content area */}
        <div
          className="flex-1 h-screen bg-bg-base text-text-primary overflow-y-auto overflow-x-hidden relative"
          style={{ transition: "background-color 350ms ease, color 350ms ease" }}
        >
          <main className="pb-20 lg:pb-6 max-w-5xl mx-auto">
            {children}
          </main>
          <WizardButton />
          <WizardOverlay />
          <HybridGuideButton />
          <HybridGuide />
          {/* Bottom nav — visible only below lg */}
          <div className="lg:hidden">
            <BottomNav />
          </div>
        </div>
      </div>
    </WizardProvider>
  );
};

export default MobileShell;
