import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, DollarSign, Target, ArrowRight, ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const STEPS = ["business", "intent", "recommendation"] as const;
type Step = typeof STEPS[number];

const focusOptions = [
  { value: "buyers", label: "Buyers" },
  { value: "sellers", label: "Sellers" },
  { value: "both", label: "Both" },
];

const goalOptions = [
  { value: "test", label: "Test growth", desc: "See if the platform works for me" },
  { value: "moderate", label: "3–5 closings/month", desc: "Build predictable pipeline" },
  { value: "aggressive", label: "Scale aggressively", desc: "Maximize leads and closings" },
];

const OnboardingFlow = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("business");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 1: Business Setup
  const [displayName, setDisplayName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [licenseState, setLicenseState] = useState('');
  const [city, setCity] = useState('');
  const [marketArea, setMarketArea] = useState("");
  const [primaryFocus, setPrimaryFocus] = useState("both");
  const [avgSalePrice, setAvgSalePrice] = useState("350000");
  const [commissionRate, setCommissionRate] = useState([3]);
  const [targetClosings, setTargetClosings] = useState([3]);
  const [brandColor, setBrandColor] = useState('#2D6BE4');

  // Step 2: Growth Intent
  const [growthGoal, setGrowthGoal] = useState("moderate");
  const [bio, setBio] = useState('');

  const stepIndex = STEPS.indexOf(step);

  const goNext = () => {
    if (step === "business") {
      const newErrors: Record<string, string> = {};
      if (!marketArea.trim()) newErrors.marketArea = "Please enter your market area";
      if (!displayName.trim()) newErrors.displayName = "Please enter your name";
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setErrors({});
    }
    if (stepIndex < STEPS.length - 1) setStep(STEPS[stepIndex + 1]);
  };
  const goBack = () => {
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1]);
  };

  const recommendedPlan = (() => {
    if (growthGoal === "test") return "free";
    if (growthGoal === "moderate") return "growth";
    return "pro";
  })();

  const planLabels: Record<string, { name: string; price: string; reason: string }> = {
    free: {
      name: "Starter (Free)",
      price: "Free",
      reason: "Perfect for testing the platform and exploring your market.",
    },
    growth: {
      name: "Growth",
      price: "$29/mo",
      reason: `For your goal of ${targetClosings[0]} closings/month, Growth gives you unlimited funnels and automated optimization.`,
    },
    pro: {
      name: "Pro",
      price: "$59/mo",
      reason: `For aggressive scaling, Pro unlocks A/B testing, attribution, and advanced analytics to maximize every dollar.`,
    },
  };

  const estCommission = Math.round(parseFloat(avgSalePrice || "0") * (commissionRate[0] / 100));
  const monthsCovered = estCommission > 0 ? Math.floor(estCommission / 59) : 0;

  const handleComplete = async () => {
    if (!user) return;
    setSaving(true);

    const profileData = {
      display_name: displayName.trim() || null,
      company_name: companyName.trim() || null,
      license_state: licenseState || null,
      city: city.trim() || null,
      market_area: marketArea.trim() || null,
      primary_focus: primaryFocus,
      avg_sale_price: parseFloat(avgSalePrice) || null,
      commission_rate: commissionRate[0],
      target_closings: targetClosings[0],
      growth_goal: growthGoal,
      brand_color: brandColor || '#2D6BE4',
      bio: bio.trim() || null,
      onboarding_complete: true,
    };

    await supabase.from("profiles").upsert({ user_id: user.id, ...profileData } as any, { onConflict: "user_id" });

    // If recommended plan isn't free, upgrade automatically
    if (recommendedPlan !== "free") {
      const { error } = await supabase
        .from("subscriptions")
        .update({
          tier: recommendedPlan as any,
          billing_period: "monthly",
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
        })
        .eq("user_id", user.id);

      if (error) {
        // Insert if no row
        await supabase.from("subscriptions").insert([{
          user_id: user.id,
          tier: recommendedPlan as any,
          billing_period: "monthly",
          status: "active",
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
        }]);
      }
    }

    setSaving(false);
    toast({ title: "Welcome to AgentOrion!", description: `You're on the ${planLabels[recommendedPlan].name} plan.` });
    navigate("/", { replace: true });
  };

  const handleSkip = async () => {
    if (!user) return;
    await supabase.from("profiles").upsert({ user_id: user.id, onboarding_complete: true } as any, { onConflict: "user_id" });
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-surface flex items-start justify-center px-5 py-8 overflow-y-auto">
      <div className="w-full max-w-md my-auto">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-all ${
                i <= stepIndex ? "bg-primary" : "bg-secondary"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === "business" && (
            <motion.div
              key="business"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-5"
            >
              <div>
                <h2 className="font-display text-xl font-bold text-foreground mb-1">Set Up Your Business</h2>
                <p className="text-sm text-muted-foreground">Tell us about your market so we can optimize your growth.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Your Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Johnson"
                  value={displayName}
                  onChange={e => { setDisplayName(e.target.value); setErrors(prev => ({ ...prev, displayName: '' })); }}
                  className={`w-full px-4 py-3 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.displayName ? 'border-destructive' : 'border-border'}`}
                />
                {errors.displayName && <p className="text-xs text-destructive">{errors.displayName}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Brokerage or Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Keller Williams Realty"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">License State</label>
                  <select
                    value={licenseState}
                    onChange={e => setLicenseState(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Select state...</option>
                    {['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Primary City</label>
                  <input
                    type="text"
                    placeholder="e.g. Phoenix"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Market Area *</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="e.g. North Dallas, Austin Metro, Detroit & SE Michigan"
                    value={marketArea}
                    onChange={(e) => { setMarketArea(e.target.value); setErrors(prev => ({ ...prev, marketArea: '' })); }}
                    className={`w-full pl-9 pr-4 py-3 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.marketArea ? 'border-destructive' : 'border-border'}`}
                  />
                </div>
                {errors.marketArea ? <p className="text-xs text-destructive">{errors.marketArea}</p> : <p className="text-xs text-muted-foreground">Used in your funnels and market pages</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Primary Focus</label>
                <div className="flex gap-2">
                  {focusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setPrimaryFocus(opt.value)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        primaryFocus === opt.value
                          ? "bg-primary text-primary-foreground shadow-glow"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Average Sale Price *</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="number"
                    placeholder="350000"
                    value={avgSalePrice}
                    onChange={(e) => setAvgSalePrice(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-medium text-muted-foreground">Commission Rate *</label>
                  <span className="text-xs font-bold text-foreground">{commissionRate[0]}%</span>
                </div>
                <Slider
                  value={commissionRate}
                  onValueChange={setCommissionRate}
                  min={1}
                  max={6}
                  step={0.5}
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-medium text-muted-foreground">Target Closings / Month</label>
                  <span className="text-xs font-bold text-foreground">{targetClosings[0]}</span>
                </div>
                <Slider
                  value={targetClosings}
                  onValueChange={setTargetClosings}
                  min={1}
                  max={20}
                  step={1}
                />
              </div>

              {/* BRAND COLOR — onboarding step, presets only */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-foreground">Pick your brand color</label>
                <p className="text-xs text-muted-foreground">
                  This becomes your CTA button color on every funnel you publish. You can change it anytime in Settings.
                </p>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { hex: '#2D6BE4', name: 'Orion Blue' },
                    { hex: '#10B981', name: 'Emerald' },
                    { hex: '#F59E0B', name: 'Amber' },
                    { hex: '#EF4444', name: 'Red' },
                    { hex: '#8B5CF6', name: 'Purple' },
                    { hex: '#EC4899', name: 'Pink' },
                    { hex: '#0EA5E9', name: 'Sky' },
                    { hex: '#14B8A6', name: 'Teal' },
                  ].map(({ hex, name }) => {
                    const isSelected = brandColor === hex;
                    return (
                      <button
                        key={hex}
                        type="button"
                        title={name}
                        onClick={() => setBrandColor(hex)}
                        className="w-10 h-10 rounded-full border-2 transition-all duration-150"
                        style={{
                          backgroundColor: hex,
                          borderColor: isSelected ? 'white' : 'transparent',
                          boxShadow: isSelected
                            ? `0 0 0 2px ${hex}, 0 0 0 4px white`
                            : '0 1px 3px rgba(0,0,0,0.3)',
                          transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                        }}
                      />
                    );
                  })}
                </div>
                {brandColor && (
                  <p className="text-xs" style={{ color: brandColor }}>
                    ✦ {['Orion Blue','Emerald','Amber','Red','Purple','Pink','Sky','Teal'][
                      ['#2D6BE4','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#0EA5E9','#14B8A6'].indexOf(brandColor)
                    ] ?? 'Custom'} selected
                  </p>
                )}
              </div>

              <button
                onClick={goNext}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-cta text-primary-foreground text-sm font-semibold shadow-glow active:scale-[0.98] transition-transform"
              >
                Continue <ArrowRight size={16} />
              </button>

              <button onClick={handleSkip} className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-2">
                Skip for now
              </button>
            </motion.div>
          )}

          {step === "intent" && (
            <motion.div
              key="intent"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-5"
            >
              <div>
                <h2 className="font-display text-xl font-bold text-foreground mb-1">What's Your Goal?</h2>
                <p className="text-sm text-muted-foreground">We'll recommend the best plan for your ambitions.</p>
              </div>

              <div className="space-y-3">
                {goalOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setGrowthGoal(opt.value)}
                    className={`w-full text-left p-4 rounded-xl border transition-all active:scale-[0.98] ${
                      growthGoal === opt.value
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card"
                    }`}
                  >
                    <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Tell prospects what makes you different
                  <span className="font-normal text-muted-foreground ml-2 text-xs">
                    (optional — used in your funnel copy)
                  </span>
                </label>
                <textarea
                  rows={3}
                  maxLength={300}
                  placeholder="e.g. I've helped 127 families buy and sell homes in the East Valley since 2019. I specialize in getting sellers above asking price using my pre-listing renovation program."
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
                <div className="flex justify-between">
                  <p className="text-xs text-muted-foreground">
                    Specific numbers convert better than general claims
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {bio.length}/300
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={goBack}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-secondary text-foreground text-sm font-medium active:scale-[0.98] transition-transform"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  onClick={goNext}
                  className="flex-[2] flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-cta text-primary-foreground text-sm font-semibold shadow-glow active:scale-[0.98] transition-transform"
                >
                  See Recommendation <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === "recommendation" && (
            <motion.div
              key="recommendation"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-5"
            >
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-cta flex items-center justify-center mx-auto mb-4 shadow-glow">
                  <Sparkles size={24} className="text-primary-foreground" />
                </div>
                <h2 className="font-display text-xl font-bold text-foreground mb-1">Your Recommended Plan</h2>
                <p className="text-sm text-muted-foreground">{planLabels[recommendedPlan].reason}</p>
              </div>

              <div className="bg-gradient-card rounded-xl p-5 border border-primary/30 shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display text-lg font-bold text-foreground">{planLabels[recommendedPlan].name}</span>
                  <span className="font-display text-lg font-bold text-primary">{planLabels[recommendedPlan].price}</span>
                </div>

                {estCommission > 0 && (
                  <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                    <p className="text-xs text-foreground">
                      Your average commission: <span className="font-bold">${estCommission.toLocaleString()}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      One additional closing covers <span className="font-semibold text-primary">{monthsCovered} months</span> of Pro.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={goBack}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-secondary text-foreground text-sm font-medium active:scale-[0.98] transition-transform"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={saving}
                  className="flex-[2] flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-cta text-primary-foreground text-sm font-semibold shadow-glow active:scale-[0.98] transition-transform disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <>{`Start with ${planLabels[recommendedPlan].name}`} <ArrowRight size={16} /></>}
                </button>
              </div>

              {recommendedPlan !== "free" && (
                <button onClick={handleSkip} className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-2">
                  Start with Free instead
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingFlow;
