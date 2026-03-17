import MobileShell from "@/components/MobileShell";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Bell, Shield, Palette, Globe, LogOut, ChevronRight, Crown, X, Save, Loader2, Zap, TrendingUp, Link2, Users, Monitor, Moon, Sun } from "lucide-react";
import CRMIntegrations from "@/components/CRMIntegrations";
import ReferralNetwork from "@/components/ReferralNetwork";
import PersonalizationEngine from "@/components/PersonalizationEngine";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Returns perceived luminance 0–1 from a hex color
// Used to determine whether CTA preview text should be black or white
function getLuminance(hex: string): number {
  try {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return 0.299 * r + 0.587 * g + 0.114 * b;
  } catch {
    return 0;
  }
}

const BRAND_COLOR_PRESETS = [
  { hex: '#2D6BE4', name: 'Orion Blue' },
  { hex: '#10B981', name: 'Emerald' },
  { hex: '#F59E0B', name: 'Amber' },
  { hex: '#EF4444', name: 'Red' },
  { hex: '#8B5CF6', name: 'Purple' },
  { hex: '#EC4899', name: 'Pink' },
  { hex: '#0EA5E9', name: 'Sky' },
  { hex: '#14B8A6', name: 'Teal' },
];

const Settings = () => {
  const [settingsTab, setSettingsTab] = useState<"general" | "crm" | "referrals" | "ai">("general");
  const { user, signOut } = useAuth();
  const { tier, setShowUpgrade, setUpgradeReason } = useSubscription();
  const { theme, setTheme: setAppTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<{
    display_name: string | null;
    city: string | null;
    license_state: string | null;
    bio: string | null;
    company_name: string | null;
    company_logo_url: string | null;
    phone: string | null;
    website: string | null;
    brand_color: string | null;
  } | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: "",
    city: "",
    license_state: "",
    bio: "",
    company_name: "",
    company_logo_url: "",
    phone: "",
    website: "",
    brand_color: "",
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, city, license_state, bio, company_name, company_logo_url, phone, website, brand_color")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setProfile(data);
          setEditForm({
            display_name: data.display_name || "",
            city: data.city || "",
            license_state: data.license_state || "",
            bio: data.bio || "",
            company_name: data.company_name || "",
            company_logo_url: data.company_logo_url || "",
            phone: data.phone || "",
            website: data.website || "",
            brand_color: data.brand_color || "",
          });
        }
      });
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);

    const profileData = {
      display_name: editForm.display_name.trim() || null,
      city: editForm.city.trim() || null,
      license_state: editForm.license_state.trim() || null,
      bio: editForm.bio.trim() || null,
      company_name: editForm.company_name.trim() || null,
      company_logo_url: editForm.company_logo_url.trim() || null,
      phone: editForm.phone.trim() || null,
      website: editForm.website.trim() || null,
      brand_color: editForm.brand_color.trim() || null,
    };

    // Upsert: insert if no profile exists, update if it does
    const { error } = profile
      ? await supabase.from("profiles").update(profileData).eq("user_id", user.id)
      : await supabase.from("profiles").insert({ user_id: user.id, ...profileData });

    setSaving(false);

    if (error) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    } else {
      setProfile({ ...profileData });
      setEditing(false);
      toast({ title: "Profile updated!" });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const displayName = profile?.display_name || user?.email || "Agent";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const tierLabels: Record<string, { label: string; icon: typeof Zap; color: string }> = {
    free: { label: "Starter (Free)", icon: Zap, color: "text-muted-foreground" },
    growth: { label: "Growth · $29/mo", icon: TrendingUp, color: "text-primary" },
    pro: { label: "Pro · $59/mo", icon: Crown, color: "text-primary" },
  };
  const currentTierInfo = tierLabels[tier] || tierLabels.free;

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<"dark" | "light" | "system">(() => {
    const saved = localStorage.getItem('agentorion-theme-mode');
    if (saved === 'system') return 'system';
    return theme;
  });

  const handleThemeChange = (mode: "dark" | "light" | "system") => {
    setThemeMode(mode);
    localStorage.setItem('agentorion-theme-mode', mode);
    if (mode === "system") {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setAppTheme(prefersDark ? 'dark' : 'light');
    } else {
      setAppTheme(mode);
    }
  };

  const menuItems = [
    {
      icon: CreditCard,
      label: "Subscription",
      desc: currentTierInfo.label,
      onClick: () => { setUpgradeReason(""); setShowUpgrade(true); }
    },
    { icon: Bell, label: "Notifications", desc: "Push & SMS enabled", onClick: () => setNotificationsOpen(true) },
    { icon: Shield, label: "Privacy & Security", desc: "Data encryption active", onClick: () => setPrivacyOpen(true) },
    { icon: Globe, label: "Custom Domain", desc: "Coming soon" },
    { icon: Palette, label: "Branding", desc: profile?.company_name || "Set up your brand", onClick: () => setEditing(true) },
  ];

  return (
    <MobileShell>
      <div className="px-5 pt-6 pb-4">
        <h1 className="font-display text-xl font-bold text-foreground mb-4">Settings</h1>

        {/* Settings tabs */}
        <div className="flex gap-1 bg-secondary rounded-xl p-1 mb-5">
          {([
            { id: "general" as const, label: "General" },
            { id: "crm" as const, label: "CRM" },
            { id: "referrals" as const, label: "Referrals", comingSoon: true },
            { id: "ai" as const, label: "AI" },
          ]).map(t => (
            <button
              key={t.id}
              onClick={() => setSettingsTab(t.id)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                settingsTab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {t.label}
              {'comingSoon' in t && t.comingSoon && (
                <span className="text-[8px] px-1 py-0 rounded-full bg-muted text-muted-foreground border border-border leading-tight">Soon</span>
              )}
            </button>
          ))}
        </div>
        {settingsTab === "general" && (
          <>
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-card rounded-xl p-5 border border-border shadow-card mb-5"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-gold flex items-center justify-center text-primary-foreground font-display text-xl font-bold shadow-gold">
              {initials}
            </div>
            <div className="flex-1">
              <h2 className="font-display text-lg font-bold text-foreground">{displayName}</h2>
              <p className="text-sm text-muted-foreground">
                {profile?.city ? `Licensed Agent · ${profile.city}${profile.license_state ? `, ${profile.license_state}` : ""}` : user?.email}
              </p>
              {profile?.bio && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{profile.bio}</p>
              )}
              <div className="flex items-center gap-1 mt-1">
                <currentTierInfo.icon size={12} className={currentTierInfo.color} />
                <span className={`text-xs font-semibold ${currentTierInfo.color}`}>{currentTierInfo.label}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="w-full py-2.5 rounded-xl bg-secondary text-foreground text-sm font-medium active:scale-[0.98] transition-transform"
          >
            Edit Profile
          </button>
        </motion.div>

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item, i) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={"onClick" in item ? (item as any).onClick : undefined}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-card border border-border touch-target active:scale-[0.98] transition-transform"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <item.icon size={18} className="text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-[11px] text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </motion.button>
          ))}
        </div>

        {/* Appearance Section */}
        <div className="mt-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Palette size={18} className="text-text-tertiary" />
            <h3 className="font-display text-sm font-semibold text-text-primary">Appearance</h3>
          </div>
          <div className="bg-bg-surface border border-border-subtle p-4 mb-4" style={{ borderRadius: "var(--radius-lg)" }}>
            <p className="text-[15px] font-bold text-text-primary mb-1">Interface Theme</p>
            <p className="text-[13px] text-text-tertiary mb-4">Choose how AgentOrion looks. Dark mode is default.</p>
            <div className="grid grid-cols-3 gap-3">
              {([
                { id: "dark" as const, label: "Dark", swatch: "#0A0E1A", dot: "#2D6BE4" },
                { id: "light" as const, label: "Light", swatch: "#F8FAFF", dot: "#2164CC" },
                { id: "system" as const, label: "System", swatch: null, dot: null },
              ]).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleThemeChange(opt.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-[var(--radius-md)] border-2 ${themeMode === opt.id ? "border-orion-blue" : "border-border-subtle"}`}
                  style={{ transition: "all var(--transition-base)" }}
                >
                  {opt.swatch ? (
                    <div className="w-10 h-10 rounded-lg relative" style={{ background: opt.swatch, border: "1px solid var(--color-border-subtle)" }}>
                      <div className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full" style={{ background: opt.dot! }} />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-subtle)" }}>
                      <Monitor size={18} className="text-text-secondary" />
                    </div>
                  )}
                  <span className="text-xs font-medium text-text-primary">{opt.label}</span>
                  {themeMode === opt.id && (
                    <div className="w-4 h-4 rounded-full bg-orion-blue flex items-center justify-center">
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-bg-surface border border-border-subtle p-4" style={{ borderRadius: "var(--radius-lg)" }}>
            <p className="text-xs font-medium text-text-tertiary mb-3">Brand Palette</p>
            <div className="flex justify-between gap-2">
              {[
                { color: "#2D6BE4", name: "--orion-blue" },
                { color: "#6B3FA0", name: "--nebula-purple" },
                { color: "#F4A623", name: "--pulse-gold" },
                { color: "#2ECC8A", name: "--signal-green" },
                { color: "#EF4444", name: "--alert-red" },
              ].map((s) => (
                <div key={s.name} className="flex flex-col items-center gap-1.5">
                  <div className="w-8 h-8 rounded-lg" style={{ background: s.color }} />
                  <span className="font-mono text-[10px] text-text-muted leading-tight text-center">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 p-4 mt-4 rounded-[var(--radius-md)] text-alert-red text-sm font-medium touch-target active:scale-[0.98] border border-alert-red"
          style={{ background: "var(--color-alert-red-bg)", transition: "all var(--transition-base)" }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
          </>
        )}

        {settingsTab === "crm" && <CRMIntegrations />}
        {settingsTab === "referrals" && <ReferralNetwork />}
        {settingsTab === "ai" && <PersonalizationEngine />}
      </div>

      {/* Edit Profile Sheet */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-background/80 backdrop-blur-sm"
            onClick={() => setEditing(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto bg-card border-t border-border rounded-t-2xl p-5 pb-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-base font-bold text-foreground">Edit Profile</h3>
                <button onClick={() => setEditing(false)} className="p-2 rounded-lg bg-secondary active:scale-95 transition-transform">
                  <X size={16} className="text-foreground" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Display Name</label>
                  <input
                    type="text"
                    value={editForm.display_name}
                    onChange={(e) => setEditForm(f => ({ ...f, display_name: e.target.value }))}
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">City</label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm(f => ({ ...f, city: e.target.value }))}
                      placeholder="Austin"
                      className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">License State</label>
                    <input
                      type="text"
                      value={editForm.license_state}
                      onChange={(e) => setEditForm(f => ({ ...f, license_state: e.target.value }))}
                      placeholder="TX"
                      className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>

                {/* BRAND COLOR — position 3, enhanced with context */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-foreground">Brand Color</label>
                    <span className="text-xs text-muted-foreground">Used as your CTA button color on all published funnels</span>
                  </div>
                  <div className="flex gap-2 flex-wrap mb-3">
                    {BRAND_COLOR_PRESETS.map(({ hex, name }) => {
                      const isSelected = editForm.brand_color?.toLowerCase() === hex.toLowerCase();
                      return (
                        <button
                          key={hex}
                          type="button"
                          title={name}
                          onClick={() => setEditForm(prev => ({ ...prev, brand_color: hex }))}
                          className="w-8 h-8 rounded-full border-2 transition-all duration-150 flex items-center justify-center"
                          style={{
                            backgroundColor: hex,
                            borderColor: isSelected ? 'white' : 'transparent',
                            boxShadow: isSelected
                              ? `0 0 0 2px ${hex}, 0 0 0 4px white`
                              : '0 1px 3px rgba(0,0,0,0.3)',
                            transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                          }}
                        >
                          {isSelected && (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={editForm.brand_color || '#2D6BE4'}
                      onChange={e => setEditForm(prev => ({ ...prev, brand_color: e.target.value }))}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-border bg-transparent p-0.5"
                      title="Pick a custom color"
                    />
                    <input
                      type="text"
                      placeholder="#2D6BE4"
                      value={editForm.brand_color || ''}
                      onChange={e => {
                        const val = e.target.value;
                        if (/^#[0-9A-Fa-f]{0,6}$/.test(val) || val === '' || val === '#') {
                          setEditForm(prev => ({ ...prev, brand_color: val }));
                        }
                      }}
                      maxLength={7}
                      className="flex-1 px-4 py-3 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                    />
                    {editForm.brand_color && /^#[0-9A-Fa-f]{6}$/.test(editForm.brand_color) && (
                      <div className="flex-shrink-0">
                        <div
                          className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap"
                          style={{
                            backgroundColor: editForm.brand_color,
                            color: getLuminance(editForm.brand_color) > 0.4 ? '#111' : '#fff',
                          }}
                        >
                          CTA Preview
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select a preset or enter a custom hex value. Changes apply to all your funnels instantly after saving.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="Tell clients about yourself..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                </div>

                {/* Branding Section */}
                <div className="pt-3 border-t border-border">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Branding</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Company Name</label>
                      <input
                        type="text"
                        value={editForm.company_name}
                        onChange={(e) => setEditForm(f => ({ ...f, company_name: e.target.value }))}
                        placeholder="Acme Realty Group"
                        className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Logo URL</label>
                      <input
                        type="url"
                        value={editForm.company_logo_url}
                        onChange={(e) => setEditForm(f => ({ ...f, company_logo_url: e.target.value }))}
                        placeholder="https://example.com/logo.png"
                        className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      {editForm.company_logo_url && (
                        <div className="mt-2 p-3 rounded-xl bg-secondary/50 border border-border flex items-center justify-center">
                          <img
                            src={editForm.company_logo_url}
                            alt="Logo preview"
                            className="h-12 w-auto max-w-[200px] rounded-md object-contain"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label>
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm(f => ({ ...f, phone: e.target.value }))}
                          placeholder="(555) 123-4567"
                          className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Website</label>
                        <input
                          type="url"
                          value={editForm.website}
                          onChange={(e) => setEditForm(f => ({ ...f, website: e.target.value }))}
                          placeholder="acmerealty.com"
                          className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-cta text-primary-foreground text-sm font-semibold shadow-glow active:scale-[0.98] transition-transform disabled:opacity-50 mt-2"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Profile
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Notifications Sheet */}
      <AnimatePresence>
        {notificationsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-background/80 backdrop-blur-sm"
            onClick={() => setNotificationsOpen(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-2xl p-5 pb-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-base font-bold text-foreground">Notifications</h3>
                <button onClick={() => setNotificationsOpen(false)} className="p-2 rounded-lg bg-secondary active:scale-95 transition-transform">
                  <X size={16} className="text-foreground" />
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { label: "New Lead Alerts", desc: "Get notified when a new lead comes in", enabled: true },
                  { label: "Hot Lead Escalation", desc: "Instant alerts for high-intent leads", enabled: true },
                  { label: "Tour Reminders", desc: "Reminders before scheduled showings", enabled: true },
                  { label: "Outreach Updates", desc: "When AI messages are sent or fail", enabled: false },
                  { label: "Weekly Summary", desc: "Performance report every Monday", enabled: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                    </div>
                    <div className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-colors ${item.enabled ? "bg-primary" : "bg-secondary"}`}>
                      <div className={`w-5 h-5 rounded-full bg-primary-foreground shadow-sm transition-transform ${item.enabled ? "translate-x-4" : "translate-x-0"}`} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-5">Notification preferences are saved automatically</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy & Security Sheet */}
      <AnimatePresence>
        {privacyOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-background/80 backdrop-blur-sm"
            onClick={() => setPrivacyOpen(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-2xl p-5 pb-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-base font-bold text-foreground">Privacy & Security</h3>
                <button onClick={() => setPrivacyOpen(false)} className="p-2 rounded-lg bg-secondary active:scale-95 transition-transform">
                  <X size={16} className="text-foreground" />
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { icon: Shield, label: "Data Encryption", desc: "All data encrypted at rest (AES-256) and in transit (TLS 1.3)", status: "Active" },
                  { icon: Shield, label: "API Credentials", desc: "Integration keys are encrypted and never exposed in client code", status: "Secured" },
                  { icon: Shield, label: "Row-Level Security", desc: "Database policies ensure you only see your own data", status: "Enforced" },
                  { icon: Shield, label: "Session Management", desc: "Auto-refresh tokens with secure session persistence", status: "Active" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border">
                    <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                      <item.icon size={16} className="text-success" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-success">{item.status}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-5">SOC2-aware · GDPR/CCPA compliant</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MobileShell>
  );
};

export default Settings;
