import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, X, Sparkles, ArrowRight, Copy, Check, Search, Users, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const NLPCommandBar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [command, setCommand] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") closeBar();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const closeBar = () => {
    setOpen(false);
    setResult(null);
    setCommand("");
    setCopied(false);
  };

  const copyDraft = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copied!", description: "Draft copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  const executeCommand = async () => {
    if (!command.trim()) return;
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to use AI commands.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    setCopied(false);

    try {
      const { data, error } = await supabase.functions.invoke("nlp-command", {
        body: { command: command.trim(), user_id: user.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult(data);

      if (data.route) {
        setTimeout(() => {
          navigate(data.route);
          closeBar();
        }, 1500);
      }
    } catch (e: any) {
      toast({ title: "Command failed", description: e.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const suggestions = [
    "Show me my hottest leads",
    "Draft a follow-up for warm leads",
    "How many leads did I get this week?",
    "Search for leads named Sarah",
  ];

  const renderSearchResults = (data: any) => {
    const sections: { label: string; items: any[]; icon: any }[] = [];
    if (data.leads?.length) sections.push({ label: "Leads", items: data.leads, icon: Users });
    if (data.funnels?.length) sections.push({ label: "Funnels", items: data.funnels, icon: BarChart3 });
    if (data.listings?.length) sections.push({ label: "Listings", items: data.listings, icon: Search });
    return sections.map((s) => (
      <div key={s.label} className="mt-2">
        <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 mb-1">
          <s.icon size={10} /> {s.label}
        </p>
        <div className="space-y-1">
          {s.items.slice(0, 5).map((item: any) => (
            <div key={item.id} className="flex items-center justify-between bg-secondary rounded-lg p-2">
              <span className="text-xs text-foreground font-medium truncate">
                {item.name || item.address || item.email || item.id}
              </span>
              {item.temperature && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ml-2 ${
                  item.temperature === "hot" ? "bg-hot/15 text-hot" :
                  item.temperature === "warm" ? "bg-warm/15 text-warm" :
                  "bg-cold/15 text-cold"
                }`}>{item.temperature}</span>
              )}
              {item.status && !item.temperature && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground shrink-0 ml-2">
                  {item.status}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    ));
  };

  const renderRouteResults = (data: any) => (
    <div className="mt-2 bg-secondary rounded-lg p-3 space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Leads matched</span>
        <span className="text-foreground font-semibold">{data.leads_matched}</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Destination</span>
        <span className="text-foreground font-semibold capitalize">{data.destination}</span>
      </div>
      {data.sample_leads && (
        <div className="pt-1 border-t border-border">
          <p className="text-[10px] text-muted-foreground mb-1">Sample leads:</p>
          <p className="text-xs text-foreground">{data.sample_leads.join(", ")}{data.note ? ` ${data.note}` : ""}</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 w-full px-4 py-3 rounded-xl bg-secondary/60 border border-border text-muted-foreground text-sm active:scale-[0.98] transition-transform"
      >
        <Sparkles size={14} className="text-primary" />
        <span>Ask AI anything...</span>
        <kbd className="ml-auto text-[10px] bg-background px-1.5 py-0.5 rounded border border-border font-mono">⌘K</kbd>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-background/80 backdrop-blur-md"
            onClick={closeBar}
          >
            <motion.div
              initial={{ y: -20, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
              className="mx-4 mt-16 bg-card border border-border rounded-2xl shadow-card overflow-hidden max-h-[75vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Input row */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Sparkles size={16} className="text-primary shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !loading && executeCommand()}
                  placeholder="Type a command or question..."
                  className="flex-1 bg-transparent text-foreground text-sm focus:outline-none placeholder:text-muted-foreground"
                />
                {loading && <Loader2 size={16} className="text-primary animate-spin shrink-0" />}
                {!loading && command.trim() && (
                  <button onClick={executeCommand} className="p-1.5 rounded-lg bg-primary text-primary-foreground shrink-0">
                    <Send size={12} />
                  </button>
                )}
                {/* Always-visible close button */}
                <button onClick={closeBar} className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors shrink-0">
                  <X size={12} className="text-muted-foreground" />
                </button>
              </div>

              {/* Result area */}
              <div className="overflow-y-auto">
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border-b border-border"
                  >
                    <p className="text-sm text-foreground mb-2">{result.display_text}</p>

                    {/* Navigation indicator */}
                    {result.route && (
                      <div className="flex items-center gap-2 text-primary text-xs font-medium">
                        <ArrowRight size={12} /> Navigating to {result.route}...
                      </div>
                    )}

                    {/* Draft message */}
                    {result.draft && (
                      <div className="mt-2">
                        <div className="bg-secondary rounded-lg p-3 text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                          {result.draft}
                        </div>
                        <button
                          onClick={() => copyDraft(result.draft)}
                          className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium transition-colors"
                        >
                          {copied ? <Check size={12} /> : <Copy size={12} />}
                          {copied ? "Copied!" : "Copy to clipboard"}
                        </button>
                        {result.leads_targeted && result.leads_targeted.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-border">
                            <p className="text-[10px] text-muted-foreground mb-1">Targeted leads:</p>
                            <div className="flex flex-wrap gap-1">
                              {result.leads_targeted.map((l: any, i: number) => (
                                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-foreground">
                                  {l.name || l.email}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Route leads confirmation */}
                    {result.action === "route_confirmation" && result.data && typeof result.data === "object" && result.data.leads_matched !== undefined && (
                      renderRouteResults(result.data)
                    )}

                    {/* Search results (structured with leads/funnels/listings) */}
                    {result.search_query && result.data && typeof result.data === "object" && !Array.isArray(result.data) && (result.data.leads || result.data.funnels || result.data.listings) && (
                      renderSearchResults(result.data)
                    )}

                    {/* Stats grid (key-value pairs without leads_matched) */}
                    {result.data && typeof result.data === "object" && !Array.isArray(result.data) && !result.search_query && !result.draft && result.data.leads_matched === undefined && !result.data.leads && !result.data.funnels && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {Object.entries(result.data).map(([key, val]) => (
                          <div key={key} className="bg-secondary rounded-lg p-2">
                            <p className="text-[10px] text-muted-foreground capitalize">{key.replace(/_/g, " ")}</p>
                            <p className="text-xs font-semibold text-foreground">{String(val)}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Lead list (array data) */}
                    {Array.isArray(result.data) && result.data.length > 0 && (
                      <div className="space-y-1.5 mt-2 max-h-48 overflow-y-auto">
                        {result.data.slice(0, 10).map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between bg-secondary rounded-lg p-2">
                            <span className="text-xs text-foreground font-medium">{item.name || item.email || item.id}</span>
                            {item.temperature && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                item.temperature === "hot" ? "bg-hot/15 text-hot" :
                                item.temperature === "warm" ? "bg-warm/15 text-warm" :
                                "bg-cold/15 text-cold"
                              }`}>{item.temperature}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Suggestions */}
                {!result && !loading && (
                  <div className="p-3 space-y-1">
                    <p className="text-[10px] text-muted-foreground px-1 mb-1">Suggestions</p>
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => setCommand(s)}
                        className="w-full text-left px-3 py-2.5 rounded-xl text-xs text-foreground hover:bg-secondary transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NLPCommandBar;
