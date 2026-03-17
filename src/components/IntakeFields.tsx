import { useState, useMemo } from "react";
import { ChevronDown, Zap, Phone, Calendar, BarChart2 } from "lucide-react";

export interface IntakeValues {
  audience: string;
  area: string;
  tone: string;
  propertyType: string;
  priceRange: string;
  // Expanded fields
  market_condition?: string;
  target_neighborhoods?: string;
  prospect_profile?: string;
  unique_value_prop?: string;
  urgency_signals?: string[];
  proof_point_1?: string;
  proof_point_2?: string;
  proof_point_3?: string;
  competitor_claims?: string[];
  follow_up_mechanism?: string;
  funnel_type?: string;
  custom_audience?: string;
}

const audienceOptions = [
  "First-Time Home Buyers",
  "Move-Up Buyers",
  "Luxury Buyers",
  "Investors",
  "Downsizers",
  "Renters Converting to Ownership",
  "Sellers",
  "Distressed Sellers",
  "Landlords",
];

const toneOptions: Record<string, string[]> = {
  default: [
    "Professional & Authoritative",
    "Friendly & Approachable",
    "Urgent & Action-Driven",
    "Educational & Informative",
    "Luxury & Exclusive",
    "Casual & Conversational",
  ],
  "Distressed Sellers": [
    "Empathetic & Supportive",
    "Urgent & Solution-Oriented",
    "Professional & Reassuring",
    "Direct & No-Nonsense",
  ],
  Sellers: [
    "Professional & Authoritative",
    "Friendly & Approachable",
    "Urgent & Action-Driven",
    "Educational & Informative",
    "Luxury & Exclusive",
  ],
};

const propertyTypeOptions: Record<string, string[]> = {
  default: [
    "Single Family Home",
    "Condo / Townhome",
    "Multi-Family",
    "Luxury Estate",
    "New Construction",
    "Investment Property",
    "Land / Lots",
    "Commercial",
  ],
  Investors: [
    "Multi-Family (2-4 Units)",
    "Multi-Family (5+ Units)",
    "Single Family Rental",
    "Commercial",
    "Mixed-Use",
    "Land / Development",
    "Short-Term Rental / Airbnb",
    "Fix & Flip",
  ],
  Landlords: [
    "Single Family Rental",
    "Multi-Family (2-4 Units)",
    "Multi-Family (5+ Units)",
    "Apartment Complex",
    "Commercial Lease",
    "Mixed-Use",
  ],
  "Luxury Buyers": [
    "Luxury Estate",
    "Waterfront Property",
    "Penthouse / High-Rise",
    "Historic / Architectural",
    "Custom Build",
    "Gated Community",
  ],
};

// Audience-specific "price" field config
interface PriceFieldConfig {
  label: string;
  placeholder: string;
  options: string[];
}

function getPriceFieldConfig(audience: string): PriceFieldConfig {
  switch (audience) {
    case "Sellers":
      return {
        label: "Home Value Range",
        placeholder: "Estimated home value?",
        options: [
          "Under $150K",
          "$150K – $300K",
          "$300K – $500K",
          "$500K – $750K",
          "$750K – $1M",
          "$1M – $2M",
          "$2M+",
        ],
      };
    case "Distressed Sellers":
      return {
        label: "Situation Type",
        placeholder: "What's the seller's situation?",
        options: [
          "Pre-Foreclosure",
          "Foreclosure",
          "Divorce / Life Change",
          "Inherited Property",
          "Behind on Payments",
          "Vacant / Abandoned",
          "Code Violations / Repairs Needed",
          "Relocating Quickly",
        ],
      };
    case "Investors":
      return {
        label: "Investment Budget",
        placeholder: "Target acquisition budget?",
        options: [
          "Under $100K",
          "$100K – $250K",
          "$250K – $500K",
          "$500K – $1M",
          "$1M – $2.5M",
          "$2.5M+",
        ],
      };
    case "Landlords":
      return {
        label: "Monthly Rental Range",
        placeholder: "Target rental income?",
        options: [
          "Under $1,000/mo",
          "$1,000 – $2,000/mo",
          "$2,000 – $3,500/mo",
          "$3,500 – $5,000/mo",
          "$5,000+/mo",
        ],
      };
    case "Luxury Buyers":
      return {
        label: "Price Range",
        placeholder: "Target price range?",
        options: [
          "$750K – $1M",
          "$1M – $2M",
          "$2M – $5M",
          "$5M – $10M",
          "$10M+",
        ],
      };
    default:
      return {
        label: "Price Range",
        placeholder: "Target price range?",
        options: [
          "Under $150K",
          "$150K – $300K",
          "$300K – $500K",
          "$500K – $750K",
          "$750K – $1M",
          "$1M – $2M",
          "$2M+",
        ],
      };
  }
}

function getOptions(map: Record<string, string[]>, audience: string): string[] {
  return map[audience] || map.default;
}

interface DropdownFieldProps {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  placeholder: string;
}

const DropdownField = ({ label, value, options, onChange, placeholder }: DropdownFieldProps) => {
  const [showOther, setShowOther] = useState(false);
  const [customValue, setCustomValue] = useState("");

  const handleChange = (val: string) => {
    if (val === "__other__") {
      setShowOther(true);
      onChange(customValue);
    } else {
      setShowOther(false);
      setCustomValue("");
      onChange(val);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        <select
          value={showOther ? "__other__" : value}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full h-9 px-3 pr-8 rounded-lg border border-border bg-card text-xs text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
          <option value="__other__">Other (custom)</option>
        </select>
        <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      </div>
      {showOther && (
        <input
          type="text"
          value={customValue}
          onChange={(e) => { setCustomValue(e.target.value); onChange(e.target.value); }}
          placeholder="Enter your custom answer…"
          className="w-full h-8 px-3 rounded-lg border border-border bg-secondary text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          autoFocus
        />
      )}
    </div>
  );
};

interface IntakeFieldsProps {
  values: IntakeValues;
  onChange: (values: IntakeValues) => void;
}

export function buildIntakeContext(values: IntakeValues): string {
  const audience = values.audience || "";
  const isSeller = audience === "Sellers" || audience === "Distressed Sellers";
  const isInvestor = audience === "Investors";
  const isLandlord = audience === "Landlords";

  const priceLabel = isSeller
    ? (audience === "Distressed Sellers" ? "Situation" : "Home value")
    : isInvestor
      ? "Investment budget"
      : isLandlord
        ? "Rental range"
        : "Price range";

  let context = [
    audience ? `Target audience: ${audience}.` : "",
    values.area ? `Market area: ${values.area}.` : "",
    values.tone ? `Tone: ${values.tone}.` : "",
    values.propertyType ? `Property type: ${values.propertyType}.` : "",
    values.priceRange ? `${priceLabel}: ${values.priceRange}.` : "",
  ].filter(Boolean).join(" ");

  // Expanded context fields
  if (values.market_condition) {
    context += `\nMarket condition: ${values.market_condition}`;
  }
  if (values.target_neighborhoods) {
    context += `\nTarget neighborhoods: ${values.target_neighborhoods}`;
  }
  if (values.prospect_profile) {
    context += `\nProspect profile: ${values.prospect_profile}`;
  }
  if (values.unique_value_prop) {
    context += `\nAgent unique value proposition: ${values.unique_value_prop}`;
  }
  if (values.urgency_signals?.length) {
    context += `\nUrgency signals: ${values.urgency_signals.join(', ')}`;
  }
  const proofPoints = [values.proof_point_1, values.proof_point_2, values.proof_point_3].filter(Boolean);
  if (proofPoints.length) {
    context += `\nAgent proof points: ${proofPoints.join(' | ')}`;
  }
  if (values.competitor_claims?.length) {
    context += `\nCompetitor claims to avoid: ${values.competitor_claims.join(', ')}`;
  }
  if (values.follow_up_mechanism) {
    context += `\nFollow-up mechanism: ${values.follow_up_mechanism}`;
  }
  if (values.custom_audience) {
    context += `\nCustom audience description: ${values.custom_audience}`;
  }

  return context;
}

const IntakeFields = ({ values, onChange }: IntakeFieldsProps) => {
  const update = (key: keyof IntakeValues, val: string) => {
    const next = { ...values, [key]: val };
    // Reset dependent fields when audience changes
    if (key === "audience" && val !== values.audience) {
      next.priceRange = "";
      next.propertyType = "";
      next.tone = "";
    }
    onChange(next);
  };

  const priceConfig = useMemo(() => getPriceFieldConfig(values.audience), [values.audience]);
  const propTypes = useMemo(() => getOptions(propertyTypeOptions, values.audience), [values.audience]);
  const tones = useMemo(() => getOptions(toneOptions, values.audience), [values.audience]);

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-muted-foreground">Target your content for better results:</p>
      <DropdownField label="Audience *" value={values.audience} options={audienceOptions} onChange={(v) => update("audience", v)} placeholder="Who is this for?" />
      <DropdownField label="Market Area" value={values.area} options={[]} onChange={(v) => update("area", v)} placeholder="e.g. Detroit's East English Village" />

      {/* MARKET CONDITION — inserted after area field */}
      <div className="w-full mt-4">
        <label className="block text-xs font-semibold mb-2"
          style={{ color: 'var(--color-text-secondary)' }}>
          How would you describe your current market?
        </label>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'sellers', label: "Seller's Market 🔥" },
            { value: 'balanced', label: 'Balanced Market ⚖️' },
            { value: 'buyers', label: "Buyer's Market 🏠" },
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ ...values, market_condition: opt.value })}
              className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200"
              style={{
                background: values.market_condition === opt.value
                  ? 'var(--color-orion-blue)' : 'var(--color-bg-elevated)',
                borderColor: values.market_condition === opt.value
                  ? 'var(--color-orion-blue)' : 'var(--color-border-default)',
                color: values.market_condition === opt.value
                  ? 'white' : 'var(--color-text-secondary)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* NEIGHBORHOOD SPECIFICITY */}
      <div className="w-full mt-4">
        <label className="block text-xs font-semibold mb-1"
          style={{ color: 'var(--color-text-secondary)' }}>
          Target neighborhoods or subdivisions{' '}
          <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional — increases conversion)</span>
        </label>
        <input
          type="text"
          placeholder="e.g., Arcadia, Biltmore, Paradise Valley — separate with commas"
          value={values.target_neighborhoods || ''}
          onChange={e => onChange({ ...values, target_neighborhoods: e.target.value })}
          className="w-full rounded-lg px-3 py-2 text-sm border"
          style={{
            background: 'var(--color-bg-elevated)',
            borderColor: 'var(--color-border-subtle)',
            color: 'var(--color-text-primary)',
          }}
        />
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Specific neighborhood names in your copy make prospects feel understood
        </p>
      </div>

      <DropdownField label="Tone" value={values.tone} options={tones} onChange={(v) => update("tone", v)} placeholder="How should it sound?" />

      {/* UNIQUE VALUE PROPOSITION — inserted after tone */}
      <div className="w-full mt-4">
        <label className="block text-xs font-semibold mb-1"
          style={{ color: 'var(--color-text-secondary)' }}>
          What makes you different from other agents in your market?{' '}
          <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional but powerful)</span>
        </label>
        <textarea
          rows={3}
          maxLength={300}
          placeholder="e.g., I've sold 47 homes in Arcadia in the last 3 years. I specialize in getting sellers $15K–$30K above asking using my pre-listing renovation program."
          value={values.unique_value_prop || ''}
          onChange={e => onChange({ ...values, unique_value_prop: e.target.value })}
          className="w-full rounded-lg px-3 py-2 text-sm border resize-none"
          style={{
            background: 'var(--color-bg-elevated)',
            borderColor: 'var(--color-border-subtle)',
            color: 'var(--color-text-primary)',
          }}
        />
        <div className="flex justify-between mt-1">
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            The AI uses this to write copy no other agent could claim
          </p>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {(values.unique_value_prop || '').length}/300
          </span>
        </div>
      </div>

      <DropdownField label="Property Type" value={values.propertyType} options={propTypes} onChange={(v) => update("propertyType", v)} placeholder="What type?" />
      <DropdownField label={priceConfig.label} value={values.priceRange} options={priceConfig.options} onChange={(v) => update("priceRange", v)} placeholder={priceConfig.placeholder} />

      {/* PROSPECT PROFILE — inserted after price range */}
      <div className="w-full mt-4">
        <label className="block text-xs font-semibold mb-1"
          style={{ color: 'var(--color-text-secondary)' }}>
          What do most of your {values.funnel_type === 'seller' || values.funnel_type === 'cash_offer' ? 'sellers' : 'buyers'} in this range look like?
        </label>
        <select
          value={values.prospect_profile || ''}
          onChange={e => onChange({ ...values, prospect_profile: e.target.value })}
          className="w-full rounded-lg px-3 py-2 text-sm border"
          style={{
            background: 'var(--color-bg-elevated)',
            borderColor: 'var(--color-border-subtle)',
            color: 'var(--color-text-primary)',
          }}
        >
          <option value="">Select prospect type...</option>
          {(values.funnel_type === 'seller' || values.funnel_type === 'cash_offer'
            ? [
                { value: 'curious_homeowner', label: 'Curious homeowners — just want to know their value' },
                { value: 'motivated_seller', label: 'Motivated sellers — ready to move in 30–90 days' },
                { value: 'inherited_property', label: 'Inherited property — managing an estate sale' },
                { value: 'investor_liquidating', label: 'Investor liquidating — selling rental or investment property' },
                { value: 'life_change', label: 'Divorce or life change — need a smooth, fast transaction' },
                { value: 'upgrading', label: 'Upgrading — selling to buy something bigger or better' },
              ]
            : [
                { value: 'first_time', label: 'First-time buyers — budget-conscious, need guidance' },
                { value: 'move_up', label: 'Move-up buyers — upgrading from their current home' },
                { value: 'investor', label: 'Investors — looking for ROI and cash flow' },
                { value: 'relocating', label: 'Relocating from out of area — unfamiliar with the market' },
                { value: 'downsizer', label: 'Downsizers — empty nesters simplifying their lives' },
                { value: 'luxury', label: 'Luxury buyers — lifestyle and prestige driven' },
              ]
          ).map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* ── FUNNEL INTELLIGENCE SECTION ───────────────────────── */}
      <div className="w-full mt-6 pt-6 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          ✦ Make It Smarter
        </h3>
        <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
          The more context you give, the more specific — and effective — your funnel copy will be.
        </p>

        {/* URGENCY SIGNALS */}
        <label className="block text-xs font-semibold mb-2"
          style={{ color: 'var(--color-text-secondary)' }}>
          Is there a specific reason prospects should act now?
        </label>
        <div className="flex flex-wrap gap-2 mb-5">
          {[
            'Low inventory in my market',
            'Interest rates may rise soon',
            'Spring/summer buying season',
            'New listing coming soon',
            'Limited slots available',
            'Prices rising in this area',
            'No specific urgency — evergreen',
          ].map(signal => {
            const isSelected = (values.urgency_signals || []).includes(signal);
            return (
              <button
                key={signal}
                type="button"
                onClick={() => {
                  const current = values.urgency_signals || [];
                  const updated = isSelected
                    ? current.filter(s => s !== signal)
                    : [...current, signal];
                  onChange({ ...values, urgency_signals: updated });
                }}
                className="px-3 py-1.5 rounded-full text-xs border transition-all duration-200"
                style={{
                  background: isSelected ? 'var(--color-orion-blue)' : 'var(--color-bg-elevated)',
                  borderColor: isSelected ? 'var(--color-orion-blue)' : 'var(--color-border-default)',
                  color: isSelected ? 'white' : 'var(--color-text-secondary)',
                  fontWeight: isSelected ? 600 : 400,
                }}
              >
                {signal}
              </button>
            );
          })}
        </div>

        {/* PROOF POINTS */}
        <label className="block text-xs font-semibold mb-1"
          style={{ color: 'var(--color-text-secondary)' }}>
          Do you have any recent results you can reference?{' '}
          <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(all optional)</span>
        </label>
        <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Specific numbers convert better than general claims. "4 days" beats "fast." "$22K over asking" beats "great results."
        </p>
        {([
          { key: 'proof_point_1' as keyof IntakeValues, label: 'Recent sale result', placeholder: 'e.g., Sold in 4 days at $22K over asking in Arcadia' },
          { key: 'proof_point_2' as keyof IntakeValues, label: 'Volume or experience', placeholder: 'e.g., 127 homes sold in the East Valley since 2019' },
          { key: 'proof_point_3' as keyof IntakeValues, label: 'Client outcome', placeholder: 'e.g., Helped 14 first-time buyers close with $0 down in 2025' },
        ]).map(field => (
          <div key={field.key} className="mb-2">
            <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
              {field.label}
            </label>
            <input
              type="text"
              placeholder={field.placeholder}
              value={(values[field.key] as string) || ''}
              onChange={e => onChange({ ...values, [field.key]: e.target.value })}
              className="w-full rounded-lg px-3 py-2 text-sm border"
              style={{
                background: 'var(--color-bg-elevated)',
                borderColor: 'var(--color-border-subtle)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>
        ))}

        {/* COMPETITOR CLAIMS */}
        <label className="block text-xs font-semibold mb-1 mt-5"
          style={{ color: 'var(--color-text-secondary)' }}>
          What do most agents in your market claim?
        </label>
        <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
          AgentOrion avoids these overused angles so your copy stands out instead of blending in.
        </p>
        <div className="flex flex-wrap gap-2 mb-5">
          {[
            'Local expertise / born and raised here',
            'Best customer service',
            'Top producer / #1 agent',
            'Family owned and operated',
            'Full service at every price point',
            'Tech-savvy / modern approach',
            'Not sure / skip this',
          ].map(claim => {
            const isSelected = (values.competitor_claims || []).includes(claim);
            return (
              <button
                key={claim}
                type="button"
                onClick={() => {
                  const current = values.competitor_claims || [];
                  const updated = isSelected
                    ? current.filter(c => c !== claim)
                    : [...current, claim];
                  onChange({ ...values, competitor_claims: updated });
                }}
                className="px-3 py-1.5 rounded-full text-xs border transition-all duration-200"
                style={{
                  background: isSelected ? 'var(--color-bg-elevated)' : 'var(--color-bg-surface)',
                  borderColor: isSelected ? 'var(--color-orion-blue)' : 'var(--color-border-subtle)',
                  color: isSelected ? 'var(--color-orion-blue)' : 'var(--color-text-secondary)',
                  fontWeight: isSelected ? 600 : 400,
                }}
              >
                {claim}
              </button>
            );
          })}
        </div>

        {/* FOLLOW-UP MECHANISM */}
        <label className="block text-xs font-semibold mb-2"
          style={{ color: 'var(--color-text-secondary)' }}>
          What happens immediately after someone submits this form?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {([
            {
              value: 'instant_ai',
              icon: Zap,
              iconColor: 'var(--color-signal-green)',
              title: 'Instant AI follow-up',
              desc: 'Automated text + email within 60 seconds',
              onlyFor: null as string[] | null,
            },
            {
              value: 'personal_call',
              icon: Phone,
              iconColor: 'var(--color-orion-blue)',
              title: "I'll call them personally",
              desc: 'Best for high-value leads',
              onlyFor: null as string[] | null,
            },
            {
              value: 'calendar',
              icon: Calendar,
              iconColor: 'var(--color-nebula-purple)',
              title: 'They book on my calendar',
              desc: 'Links to scheduling tool',
              onlyFor: null as string[] | null,
            },
            {
              value: 'instant_valuation',
              icon: BarChart2,
              iconColor: 'var(--color-pulse-gold)',
              title: 'Show instant valuation',
              desc: 'AVM result displayed immediately',
              onlyFor: ['seller', 'valuation', 'cash_offer'] as string[] | null,
            },
          ])
            .filter(opt => !opt.onlyFor || opt.onlyFor.includes(values.funnel_type || ''))
            .map(opt => {
              const IconComp = opt.icon;
              const isSelected = values.follow_up_mechanism === opt.value;
              return (
                <div
                  key={opt.value}
                  onClick={() => onChange({ ...values, follow_up_mechanism: opt.value })}
                  className="cursor-pointer rounded-lg p-3 border transition-all duration-200"
                  style={{
                    background: isSelected ? 'var(--color-bg-elevated)' : 'var(--color-bg-surface)',
                    borderColor: isSelected ? 'var(--color-orion-blue)' : 'var(--color-border-subtle)',
                  }}
                >
                  <IconComp size={16} style={{ color: opt.iconColor }} className="mb-1.5" />
                  <div className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {opt.title}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {opt.desc}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default IntakeFields;
