import { ReactNode, useEffect } from "react";
import BottomNav from "./BottomNav";
import DesktopSidebar from "./DesktopSidebar";
import HeaderBar from "./navigation/HeaderBar";
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
        {/* Desktop sidebar */}
        <DesktopSidebar />

        {/* Main content area */}
        <div className="flex-1 h-screen flex flex-col overflow-hidden">
          <HeaderBar />
          <div
            className="flex-1 overflow-y-auto overflow-x-hidden relative"
            style={{
              backgroundColor: "var(--color-bg-base)",
              color: "var(--color-text-primary)",
            }}
          >
            <main className="pb-20 lg:pb-6 max-w-5xl mx-auto">
              {children}
            </main>
            <WizardButton />
            <WizardOverlay />
            <HybridGuideButton />
            <HybridGuide />
          </div>
          {/* Bottom nav — mobile/tablet only */}
          <BottomNav />
        </div>
      </div>
    </WizardProvider>
  );
};

export default MobileShell;
