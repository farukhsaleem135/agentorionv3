import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Facebook, Search, Linkedin, Video, Copy, Check, ExternalLink } from "lucide-react";

interface PromoteFunnelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  funnelSlug: string;
  funnelName: string;
}

const PUBLISHED_APP_ORIGIN = "https://agentorionv3.lovable.app";

const platforms = [
  {
    id: "facebook",
    name: "Facebook & Instagram Ads",
    icon: Facebook,
    description: "Reach homebuyers and sellers in your target market. AgentOrion pre-fills your funnel link as the destination URL.",
    deepLink: "https://www.facebook.com/adsmanager/creation?objective=LEAD_GENERATION",
    utmSource: "facebook",
    launchLabel: "Launch Facebook Ads",
  },
  {
    id: "google",
    name: "Google Ads",
    icon: Search,
    description: "Capture leads from agents actively searching for real estate help in your market.",
    deepLink: "https://ads.google.com/aw/campaigns/new",
    utmSource: "google",
    launchLabel: "Launch Google Ads",
  },
  {
    id: "linkedin",
    name: "LinkedIn Ads",
    icon: Linkedin,
    description: "Reach real estate investors, relocation clients, and professional buyers on LinkedIn.",
    deepLink: "https://www.linkedin.com/campaignmanager",
    utmSource: "linkedin",
    launchLabel: "Launch LinkedIn Ads",
  },
  {
    id: "tiktok",
    name: "TikTok Ads",
    icon: Video,
    description: "Reach first-time buyers and younger homeowners where they spend the most time. TikTok's real estate content reaches millions of engaged viewers daily.",
    deepLink: "https://ads.tiktok.com/i18n/home",
    utmSource: "tiktok",
    launchLabel: "Launch TikTok Ads",
  },
];

const PromoteFunnelModal = ({ open, onOpenChange, funnelSlug, funnelName }: PromoteFunnelModalProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const isMobile = useIsMobile();

  const getUtmUrl = (source: string) => {
    const base = `${PUBLISHED_APP_ORIGIN}/f/${funnelSlug}`;
    return `${base}?utm_source=${source}&utm_medium=paid&utm_campaign=agentorion-ads`;
  };

  const defaultUtmUrl = getUtmUrl("facebook");

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(defaultUtmUrl);
    setCopied(true);
    toast({ title: "Link copied!", description: "Your funnel link with tracking is ready to paste." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchPlatform = async (platform: typeof platforms[0]) => {
    const utmUrl = getUtmUrl(platform.utmSource);
    await navigator.clipboard.writeText(utmUrl);
    window.open(platform.deepLink, "_blank", "noopener,noreferrer");
    toast({
      title: "Your funnel link has been copied",
      description: "Paste it as your destination URL in the next step.",
    });
  };

  const content = (
    <div className="space-y-4">
      {/* Platform cards — 2x2 grid on desktop, single column on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          return (
            <div
              key={platform.id}
              className="border border-primary/20 rounded-xl p-4 bg-card flex flex-col"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-primary" />
                </div>
                <h4 className="text-sm font-semibold text-foreground">{platform.name}</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">{platform.description}</p>
              <Button
                size="sm"
                variant="outline"
                className="w-full gap-1.5 border-primary text-primary hover:bg-primary/5 mt-auto"
                onClick={() => handleLaunchPlatform(platform)}
              >
                <ExternalLink size={14} />
                {platform.launchLabel}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Funnel Link Copy */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-foreground">Your Funnel Link — Ready to Paste</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-[11px] bg-muted border border-border rounded-lg px-3 py-2.5 text-foreground truncate block">
            {defaultUtmUrl}
          </code>
          <Button size="sm" variant="outline" onClick={handleCopyLink} className="shrink-0 gap-1.5">
            {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Copy this link and paste it as your ad destination URL when prompted by your chosen platform.
        </p>
      </div>

      {/* Fair Housing Notice */}
      <div className="p-3 bg-muted/50 rounded-lg border border-border">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          <strong>Fair Housing Compliance:</strong> Real estate advertising on Facebook, Instagram, and TikTok is subject to the Fair Housing Act. When setting up your audience, avoid targeting by race, color, religion, sex, national origin, familial status, or disability. Select <em>Housing</em> as your special ad category where required by the platform.{" "}
          <a
            href="https://www.facebook.com/policies/ads/special_ad_categories"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            Learn more
          </a>
        </p>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle className="font-display text-lg">Promote This Funnel</DrawerTitle>
            <DrawerDescription className="text-sm text-muted-foreground">
              Choose your advertising platform. AgentOrion will take you directly to the ad creation screen with your funnel link pre-filled.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6 overflow-y-auto">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">Promote This Funnel</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Choose your advertising platform. AgentOrion will take you directly to the ad creation screen with your funnel link pre-filled.
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default PromoteFunnelModal;
