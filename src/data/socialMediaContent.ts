import { Facebook, Linkedin, Instagram, Youtube, FileText, Mail } from "lucide-react";

export interface PlatformDef {
  id: string;
  name: string;
  icon: typeof Facebook;
  color: string;
  strategy: string;
  contentTypes: string[];
  tips: string[];
}

export const platforms: PlatformDef[] = [
  {
    id: "facebook",
    name: "Facebook Authority",
    icon: Facebook,
    color: "#1877F2",
    strategy: "Build local community trust and become the go-to neighborhood expert through consistent value-driven posts.",
    contentTypes: [
      "Weekly Market Update",
      "Neighborhood Spotlight",
      "Educational Tip",
      "Success Story",
      "Open House Announcement",
      "Community Engagement Post",
      "First Time Buyer Tip",
      "Seller Preparation Tip",
    ],
    tips: [
      "Post between 9–11 AM on weekdays for maximum reach in real estate audiences.",
      "Use local neighborhood photos — they get 3x more engagement than stock images.",
      "Ask a question at the end of every post to boost comment engagement by 2x.",
    ],
  },
  {
    id: "linkedin",
    name: "LinkedIn Credibility",
    icon: Linkedin,
    color: "#0A66C2",
    strategy: "Establish professional authority and attract referral partners through data-driven insights and industry commentary.",
    contentTypes: [
      "Professional Article (600-800 words)",
      "Short Insight Post",
      "Market Commentary",
      "Achievement Post",
      "Industry Observation",
      "Client Success Story",
      "Local Market Analysis",
    ],
    tips: [
      "LinkedIn articles with data get 3x more shares than opinion-only posts.",
      "Post Tuesday through Thursday mornings for peak B2B engagement.",
      "Tag mortgage lenders and title companies to expand your professional network reach.",
    ],
  },
  {
    id: "instagram",
    name: "Instagram Presence",
    icon: Instagram,
    color: "#E4405F",
    strategy: "Create a visual brand that showcases your market expertise and personality through stories, reels, and curated posts.",
    contentTypes: [
      "Property Caption",
      "Neighborhood Caption",
      "Market Stat Graphic Caption",
      "Behind the Scenes Caption",
      "Story Talking Points",
      "Reel Script (30 seconds)",
      "Motivational Agent Quote",
    ],
    tips: [
      "Reels reach 5x more non-followers than static posts — prioritize short video.",
      "Use 5-8 hyperlocal hashtags (#YourCityHomes) instead of 30 generic ones.",
      "Carousel posts with market stats get saved more, boosting your algorithm ranking.",
    ],
  },
  {
    id: "youtube",
    name: "YouTube Scripts",
    icon: Youtube,
    color: "#FF0000",
    strategy: "Build a searchable video library that generates leads 24/7 through neighborhood tours, market updates, and buyer/seller guides.",
    contentTypes: [
      "Neighborhood Tour Script",
      "Market Update Script",
      "Buyer Guide Script",
      "Seller Guide Script",
      "FAQ Answer Script",
      "First Time Buyer Series Episode",
      "Investment Property Overview",
    ],
    tips: [
      "YouTube is the #2 search engine — optimize titles with your city + topic for SEO.",
      "Videos under 8 minutes have the highest completion rate for real estate content.",
      "Add timestamps in descriptions to increase watch time and search visibility.",
    ],
  },
  {
    id: "blog",
    name: "Blog Posts",
    icon: FileText,
    color: "hsl(220, 80%, 56%)",
    strategy: "Create SEO-optimized articles that rank in search and establish you as the local market authority for years to come.",
    contentTypes: [
      "Neighborhood Guide (800 words)",
      "Market Analysis (600 words)",
      "Buyer Tips Article",
      "Seller Tips Article",
      "Local Area Feature",
      "First Time Buyer Complete Guide",
      "Investment Property Guide",
      "Relocation Guide for Your Market",
    ],
    tips: [
      "Blog posts with local keywords rank 4x better than generic real estate content.",
      "Include an FAQ section — it doubles your chance of appearing in AI search answers.",
      "Update older posts quarterly with fresh data to maintain search rankings.",
    ],
  },
  {
    id: "email",
    name: "Email Newsletter",
    icon: Mail,
    color: "hsl(220, 80%, 56%)",
    strategy: "Nurture your sphere of influence with consistent value so you're top of mind when they or someone they know is ready to buy or sell.",
    contentTypes: [
      "Monthly Market Update Newsletter",
      "Just Listed Announcement",
      "Seasonal Market Forecast",
      "Referral Request Email",
      "Sphere of Influence Check-In",
      "New Agent Introduction Email",
      "Past Client Anniversary Email",
    ],
    tips: [
      "Emails sent Tuesday 10 AM have the highest open rates for real estate newsletters.",
      "Keep subject lines under 40 characters with a local reference for best open rates.",
      "Include one clear CTA per email — multiple CTAs reduce click-through by 30%.",
    ],
  },
];

export interface CalendarDay {
  day: string;
  platformId: string;
  contentType: string;
  description: string;
}

export const weeklyCalendar: CalendarDay[] = [
  { day: "Monday", platformId: "facebook", contentType: "Weekly Market Update", description: "Share local market stats to start the week" },
  { day: "Tuesday", platformId: "instagram", contentType: "Neighborhood Caption", description: "Post a neighborhood photo with insights" },
  { day: "Wednesday", platformId: "linkedin", contentType: "Professional Article (600-800 words)", description: "Publish a thought leadership article" },
  { day: "Thursday", platformId: "youtube", contentType: "Market Update Script", description: "Record a video + Instagram story" },
  { day: "Friday", platformId: "facebook", contentType: "Success Story", description: "Share a win or milestone across platforms" },
  { day: "Saturday", platformId: "facebook", contentType: "Community Engagement Post", description: "Engage your local community" },
  { day: "Sunday", platformId: "email", contentType: "Monthly Market Update Newsletter", description: "Send newsletter (1st Sunday of month)" },
];

export const performanceTips = [
  { title: "Consistency Beats Perfection", body: "Post consistency beats post perfection. A good post every day outperforms a perfect post once a month." },
  { title: "Hyperlocal Wins", body: "Hyperlocal content outperforms national content every time. Your neighbors don't care about national trends — they care about their street." },
  { title: "Data Drives Engagement", body: "Market data posts generate 3x more engagement than listing posts. Lead with stats, not sales pitches." },
  { title: "Video Reaches Further", body: "Video content reaches 5x more people than static images. Even a 30-second market update on your phone works." },
  { title: "Questions Double Comments", body: "Asking questions doubles comment engagement. End every post with a question to start a conversation." },
  { title: "Education Builds Trust", body: "Educational content builds trust faster than promotional content. Teach first, sell second." },
];
