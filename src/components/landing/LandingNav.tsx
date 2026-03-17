import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import OrionLogo from "./OrionLogo";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";

const links = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Integrations", href: "#integrations" },
];

const LandingNav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (href: string) => {
    setOpen(false);
    const el = document.querySelector(href);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    setOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 ${
          scrolled ? "border-b border-border-subtle" : ""
        }`}
        style={{
          backgroundColor: scrolled
            ? (theme === "dark" ? "rgba(10,14,26,0.85)" : "rgba(248,250,255,0.85)")
            : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          transition: "background-color 350ms ease, border-color 350ms ease",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <button onClick={scrollToTop} className="cursor-pointer">
            <OrionLogo />
          </button>
          <div className="hidden md:flex items-center gap-8 ml-10">
            {links.map((l) => (
              <button
                key={l.href}
                onClick={() => scrollTo(l.href)}
                className="text-sm text-text-secondary hover:text-text-primary transition-colors font-medium"
              >
                {l.label}
              </button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => navigate("/auth")} className="text-sm text-text-primary/80 hover:text-text-primary px-4 py-2 transition-colors">
              Sign In
            </button>
            <ThemeToggle size="sm" />
            <button
              onClick={() => navigate("/auth")}
              className="text-sm font-semibold font-satoshi bg-orion-blue text-white px-5 py-2.5 rounded-lg glow-orion-hover transition-all hover:scale-[1.02]"
            >
              Start Free
            </button>
          </div>
          <button className="md:hidden text-text-primary" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="fixed top-16 inset-x-0 z-40 bg-bg-overlay/95 backdrop-blur-lg border-b border-border-subtle overflow-hidden md:hidden"
            style={{ transition: "background-color 350ms ease" }}
          >
            <div className="flex flex-col gap-1 p-4">
              {links.map((l) => (
                <button
                  key={l.href}
                  onClick={() => scrollTo(l.href)}
                  className="text-left text-text-primary/80 hover:text-text-primary py-3 px-2 text-base"
                >
                  {l.label}
                </button>
              ))}
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border-subtle">
                <ThemeToggle size="sm" showLabel={true} />
                <button onClick={() => { setOpen(false); navigate("/auth"); }} className="text-text-primary/80 py-2 mt-2">Sign In</button>
                <button onClick={() => { setOpen(false); navigate("/auth"); }} className="bg-orion-blue text-white py-3 rounded-lg font-semibold font-satoshi">
                  Start Free
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LandingNav;
