import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Sparkles } from "lucide-react";

interface ContentIntakeModalProps {
  open: boolean;
  onClose: () => void;
  templateLabel: string;
  onGenerate: (params: IntakeParams) => void;
  generating: boolean;
}

export interface IntakeParams {
  audience: string;
  area: string;
  tone: string;
  propertyType: string;
  priceRange: string;
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

const toneMap: Record<string, string[]> = {
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

const propertyTypeMap: Record<string, string[]> = {
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

interface PriceFieldConfig {
  label: string;
  placeholder: string;
  options: string[];
}

function getPriceConfig(audience: string): PriceFieldConfig {
  switch (audience) {
    case "Sellers":
      return { label: "Home Value Range", placeholder: "Estimated home value?", options: ["Under $150K","$150K – $300K","$300K – $500K","$500K – $750K","$750K – $1M","$1M – $2M","$2M+"] };
    case "Distressed Sellers":
      return { label: "Situation Type", placeholder: "What's the seller's situation?", options: ["Pre-Foreclosure","Foreclosure","Divorce / Life Change","Inherited Property","Behind on Payments","Vacant / Abandoned","Code Violations / Repairs Needed","Relocating Quickly"] };
    case "Investors":
      return { label: "Investment Budget", placeholder: "Target acquisition budget?", options: ["Under $100K","$100K – $250K","$250K – $500K","$500K – $1M","$1M – $2.5M","$2.5M+"] };
    case "Landlords":
      return { label: "Monthly Rental Range", placeholder: "Target rental income?", options: ["Under $1,000/mo","$1,000 – $2,000/mo","$2,000 – $3,500/mo","$3,500 – $5,000/mo","$5,000+/mo"] };
    case "Luxury Buyers":
      return { label: "Price Range", placeholder: "Target price range?", options: ["$750K – $1M","$1M – $2M","$2M – $5M","$5M – $10M","$10M+"] };
    default:
      return { label: "Price Range", placeholder: "Target price range?", options: ["Under $150K","$150K – $300K","$300K – $500K","$500K – $750K","$750K – $1M","$1M – $2M","$2M+"] };
  }
}

function getOpts(map: Record<string, string[]>, key: string): string[] {
  return map[key] || map.default;
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
          className="w-full h-10 px-3 pr-8 rounded-lg border border-border bg-card text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
          <option value="__other__">Other (custom)</option>
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      </div>
      {showOther && (
        <input
          type="text"
          value={customValue}
          onChange={(e) => { setCustomValue(e.target.value); onChange(e.target.value); }}
          placeholder="Enter your custom answer…"
          className="w-full h-9 px-3 rounded-lg border border-border bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          autoFocus
        />
      )}
    </div>
  );
};

const ContentIntakeModal = ({ open, onClose, templateLabel, onGenerate, generating }: ContentIntakeModalProps) => {
  const [audience, setAudience] = useState("");
  const [area, setArea] = useState("");
  const [tone, setTone] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [priceRange, setPriceRange] = useState("");

  const canGenerate = audience.trim().length > 0;

  const handleAudienceChange = (val: string) => {
    setAudience(val);
    // Reset dependent fields when audience changes
    setPriceRange("");
    setPropertyType("");
    setTone("");
  };

  const handleGenerate = () => {
    onGenerate({ audience, area, tone, propertyType, priceRange });
  };

  const priceConfig = useMemo(() => getPriceConfig(audience), [audience]);
  const propTypes = useMemo(() => getOpts(propertyTypeMap, audience), [audience]);
  const tones = useMemo(() => getOpts(toneMap, audience), [audience]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-background/95 backdrop-blur-sm flex flex-col"
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute inset-0 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-6 pb-3">
              <div>
                <p className="text-xs text-muted-foreground">Creating</p>
                <h2 className="font-display text-lg font-bold text-foreground">{templateLabel}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 rounded-xl bg-secondary touch-target active:scale-95 transition-transform"
              >
                <X size={18} className="text-foreground" />
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-auto px-5 pb-8 space-y-4">
              <p className="text-sm text-muted-foreground">
                Tell us about your target audience so the AI can create highly targeted, optimized content.
              </p>

              <DropdownField
                label="Target Audience *"
                value={audience}
                options={audienceOptions}
                onChange={handleAudienceChange}
                placeholder="Who is this content for?"
              />

              <DropdownField
                label="Location / Market Area"
                value={area}
                options={[]}
                onChange={setArea}
                placeholder="e.g. Detroit's East English Village"
              />

              <DropdownField
                label="Tone & Style"
                value={tone}
                options={tones}
                onChange={setTone}
                placeholder="How should the content sound?"
              />

              <DropdownField
                label="Property Type"
                value={propertyType}
                options={propTypes}
                onChange={setPropertyType}
                placeholder="What type of property?"
              />

              <DropdownField
                label={priceConfig.label}
                value={priceRange}
                options={priceConfig.options}
                onChange={setPriceRange}
                placeholder={priceConfig.placeholder}
              />

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!canGenerate || generating}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-cta text-primary-foreground text-sm font-semibold shadow-glow active:scale-[0.97] transition-transform disabled:opacity-50 mt-2"
              >
                {generating ? (
                  <><Sparkles size={16} className="animate-pulse" /> Generating…</>
                ) : (
                  <><Sparkles size={16} /> Generate Content</>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContentIntakeModal;
