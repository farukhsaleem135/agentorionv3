import MobileShell from "@/components/MobileShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Facebook, Linkedin, Instagram, Youtube, FileText, Mail, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const platforms = [
  { name: "Facebook Authority", icon: Facebook, color: "#1877F2", desc: "Build local community trust" },
  { name: "LinkedIn Credibility", icon: Linkedin, color: "#0A66C2", desc: "Professional networking content" },
  { name: "Instagram Presence", icon: Instagram, color: "#E4405F", desc: "Visual market storytelling" },
  { name: "YouTube Videos", icon: Youtube, color: "#FF0000", desc: "Market update video scripts" },
  { name: "Blog Posts", icon: FileText, color: "hsl(var(--orion-blue))", desc: "SEO-optimized market content" },
  { name: "Email Newsletter", icon: Mail, color: "hsl(var(--orion-blue))", desc: "Nurture your sphere of influence" },
];

const SocialMedia = () => {
  const navigate = useNavigate();

  return (
    <MobileShell>
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-orion-blue/10 flex items-center justify-center">
            <Share2 size={20} className="text-orion-blue" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-text-primary">Social Media Mastery</h1>
            <p className="text-xs text-text-tertiary">AI-powered content across every platform</p>
          </div>
        </div>
      </div>

      <div className="px-5 space-y-3 pb-8">
        {platforms.map((p) => {
          const Icon = p.icon;
          return (
            <Card key={p.name} className="cursor-pointer" onClick={() => navigate("/content")}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${p.color}15` }}>
                  <Icon size={22} style={{ color: p.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary">{p.name}</p>
                  <p className="text-xs text-text-tertiary">{p.desc}</p>
                </div>
                <ArrowRight size={16} className="text-text-muted flex-shrink-0" />
              </CardContent>
            </Card>
          );
        })}

        <Button
          className="w-full mt-4 bg-orion-blue hover:bg-orion-blue/90 text-white"
          onClick={() => navigate("/content")}
        >
          Generate Content Now <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </MobileShell>
  );
};

export default SocialMedia;
