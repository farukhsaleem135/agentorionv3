import {
  Home, Users, Filter, Radio, Megaphone, Building2, Mail,
  Rocket, PenTool, Zap, BarChart3, Map, Mic, UsersRound,
  FlaskConical, Calendar, Settings, Contact
} from "lucide-react";

export interface NavItem {
  path?: string;
  icon: React.ElementType;
  label: string;
  comingSoon?: boolean;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const PRIMARY_TABS = [
  { path: "/", icon: Home, label: "Dashboard" },
  { path: "/leads", icon: Users, label: "Leads" },
  { path: "/funnels", icon: Filter, label: "Funnels" },
  { path: "/insights", icon: BarChart3, label: "Insights" },
] as const;

export const DRAWER_SECTIONS: NavSection[] = [
  {
    title: "Lead Generation",
    items: [
      { path: "/posting-ads", icon: Megaphone, label: "Posting Ads" },
      { path: "/listings", icon: Building2, label: "Listings" },
      { path: "/campaigns", icon: Mail, label: "Campaigns" },
    ],
  },
  {
    title: "Growth Tools",
    items: [
      { path: "/social-media", icon: Radio, label: "Social Media" },
      { path: "/launch-program", icon: Rocket, label: "Launch Program" },
      { path: "/content", icon: PenTool, label: "Content" },
      { path: "/autopilot", icon: Zap, label: "Autopilot" },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { path: "/market-intel", icon: Map, label: "Market Intelligence" },
    ],
  },
  {
    title: "Coming Soon",
    items: [
      { path: "/voice-agent", icon: Mic, label: "Voice Agent", comingSoon: true },
      { icon: UsersRound, label: "Referral Network", comingSoon: true },
      { icon: FlaskConical, label: "A/B Testing", comingSoon: true },
      { icon: Calendar, label: "Google Calendar", comingSoon: true },
      { icon: Calendar, label: "Outlook Calendar", comingSoon: true },
    ],
  },
];

export const SIDEBAR_SECTIONS: NavSection[] = [
  {
    items: [
      { path: "/", icon: Home, label: "Dashboard" },
      { path: "/leads", icon: Users, label: "Leads" },
      { path: "/funnels", icon: Filter, label: "Funnels" },
      { path: "/insights", icon: BarChart3, label: "Insights" },
    ],
  },
  ...DRAWER_SECTIONS,
];

export const ROUTE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/leads": "Leads",
  "/funnels": "Funnels",
  "/social-media": "Social Media",
  "/posting-ads": "Posting Ads",
  "/listings": "Listings",
  "/campaigns": "Campaigns",
  "/launch-program": "Launch Program",
  "/content": "Content",
  "/autopilot": "Autopilot",
  "/insights": "Insights",
  "/market-intel": "Market Intelligence",
  "/voice-agent": "Voice Agent",
  "/integrations": "Integrations",
  "/settings": "Settings",
  "/profile": "Profile",
  "/onboarding": "Onboarding",
  "/admin": "Admin",
  "/team": "Team",
};
