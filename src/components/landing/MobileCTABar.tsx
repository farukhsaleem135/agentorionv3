import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const MobileCTABar = () => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("mobile-cta-dismissed")) {
      setDismissed(true);
      return;
    }
    const onScroll = () => setVisible(window.scrollY > window.innerHeight);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("mobile-cta-dismissed", "1");
  };

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-bg-overlay/95 backdrop-blur-lg border-t border-border-subtle px-4 py-3 flex items-center gap-3 safe-bottom"
          style={{ transition: "background-color 350ms ease, border-color 350ms ease" }}
        >
          <button onClick={dismiss} className="text-text-muted hover:text-text-primary transition-colors shrink-0">
            <X size={18} />
          </button>
          <a
            href="/auth"
            className="flex-1 text-center bg-orion-blue text-white font-satoshi font-bold text-sm py-2.5 rounded-lg glow-orion"
          >
            Start Free — No Credit Card
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileCTABar;
