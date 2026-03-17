import { Twitter, Linkedin, Instagram, Youtube } from "lucide-react";
import OrionLogo from "./OrionLogo";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Integrations", href: "#integrations" },
    { label: "Changelog", href: "#" },
    { label: "Roadmap", href: "#" },
  ],
  Company: [
    { label: "About AgentOrion", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
    { label: "Contact Us", href: "#" },
    { label: "Partner Program", href: "#" },
  ],
  "Legal & Support": [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "Security", href: "#" },
    { label: "Help Center", href: "#" },
    { label: "System Status", href: "#" },
  ],
};

const scrollTo = (href: string) => {
  if (href === "#") return;
  const el = document.querySelector(href);
  if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
};

const LandingFooter = () => (
  <footer className="bg-bg-overlay border-t border-border-subtle" style={{ transition: "background-color 350ms ease, border-color 350ms ease" }}>
    {/* Upper footer */}
    <div className="max-w-7xl mx-auto px-6 sm:px-12 pt-16 pb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand */}
        <div>
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="cursor-pointer">
            <OrionLogo className="mb-4" variant="footer" />
          </button>
          <p className="text-text-tertiary text-sm font-inter leading-relaxed">
            Your North Star for Real Estate Growth.
          </p>
          <div className="flex gap-3 mt-5">
            {[Twitter, Linkedin, Instagram, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="text-text-disabled hover:text-orion-blue transition-colors duration-200">
                <Icon size={18} />
              </a>
            ))}
          </div>
          {/* Footer CTA */}
          <a href="/auth" className="inline-flex items-center gap-1 mt-4 text-text-brand text-sm font-inter font-medium hover:underline">
            Start Free Today →
          </a>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([heading, links]) => (
          <div key={heading}>
            <h4 className="text-text-muted text-[12px] font-inter font-bold uppercase tracking-widest mb-4">{heading}</h4>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-text-tertiary text-sm font-inter hover:text-text-primary transition-colors duration-150 text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>

    {/* Lower footer */}
    <div className="border-t border-border-subtle" style={{ transition: "border-color 350ms ease" }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-6 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="text-center md:text-left">
          <p className="text-text-disabled text-[12px] font-inter">© 2026 AgentOrion. All rights reserved.</p>
          <p className="text-text-disabled text-[12px] font-inter italic">Built for agents who close.</p>
        </div>
        <p className="text-text-disabled/60 text-[11px] font-inter max-w-[480px] text-center md:text-right leading-relaxed">
          AgentOrion is not affiliated with, endorsed by, or in official partnership with any MLS board, NAR, or real estate franchise. All third-party product names referenced are trademarks of their respective owners. CRM integration availability dates are targets and subject to change.
        </p>
      </div>
    </div>
  </footer>
);

export default LandingFooter;
