import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Facebook, Search, Linkedin, Copy, Check, ExternalLink } from "lucide-react";

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
  },
  {
    id: "google",
    name: "Google Ads",
    icon: Search,
    description: "Capture leads from agents actively searching for real estate help in your market.",
    deepLink: "https://ads.google.com/aw/campaigns/new",
    utmSource: "google",
  },
  {
    id: "linkedin",
    name: "LinkedIn Ads",
    icon: Linkedin,
    description: "Reach real estate investors, relocation clients, and professional buyers on LinkedIn.",
    deepLink: "https://www.linkedin.com/campaignmanager",
    utmSource: "linkedin",
  },
];

const PromoteFunnelModal = ({ open, onOpenChange, funnelSlug, funnelName }: PromoteFunnelModalProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">Promote This Funnel</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Choose your advertising platform. AgentOrion will take you directly to the ad creation screen with your funnel link pre-filled.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <div
                key={platform.id}
                className="border border-border rounded-xl p-4 bg-card"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground">{platform.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{platform.description}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => handleLaunchPlatform(platform)}
                >
                  <ExternalLink size={14} />
                  Launch {platform.name.split(" ")[0]} Ads
                </Button>
              </div>
            );
          })}
        </div>

        {/* Funnel Link Copy */}
        <div className="mt-4 space-y-2">
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
        <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border">
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <strong>Fair Housing Compliance:</strong> Real estate advertising on Facebook and Instagram is subject to the Fair Housing Act. When setting up your audience, avoid targeting by race, color, religion, sex, national origin, familial status, or disability. Select <em>Housing</em> as your special ad category in Facebook Ads Manager.{" "}
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
      </DialogContent>
    </Dialog>
  );
};

export default PromoteFunnelModal;
