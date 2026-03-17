import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Video, FileText, Copy, Check, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PublicContent {
  id: string;
  type: string;
  title: string;
  body: string | null;
  duration: string | null;
  created_at: string;
}

const ContentPortfolio = () => {
  const { userId } = useParams<{ userId: string }>();
  const [items, setItems] = useState<PublicContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentName, setAgentName] = useState("Agent");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      const [contentRes, profileRes] = await Promise.all([
        supabase
          .from("content")
          .select("id, type, title, body, duration, created_at")
          .eq("user_id", userId)
          .eq("status", "published")
          .order("created_at", { ascending: false }),
        supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", userId)
          .maybeSingle(),
      ]);

      if (contentRes.data) setItems(contentRes.data as unknown as PublicContent[]);
      if (profileRes.data?.display_name) setAgentName(profileRes.data.display_name);
      setLoading(false);
    };
    fetchData();
  }, [userId]);

  const handleCopy = async (item: PublicContent) => {
    const text = `${item.title}\n\n${item.body || ""}`;
    await navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="px-5 pt-8 pb-6 border-b border-border">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4 hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} />
            Back
          </button>
          <h1 className="font-display text-2xl font-bold text-foreground">{agentName}'s Content</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {items.length} published piece{items.length !== 1 ? "s" : ""}
          </p>
        </div>
      </header>

      <main className="px-5 py-6 max-w-2xl mx-auto">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No published content yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  className="w-full flex items-center gap-4 p-4 text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    {item.type === "video" ? (
                      <Video size={16} className="text-primary" />
                    ) : (
                      <FileText size={16} className="text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.duration && (
                        <span className="text-[11px] text-muted-foreground">{item.duration}</span>
                      )}
                      <span className="text-[11px] text-muted-foreground capitalize">{item.type}</span>
                    </div>
                  </div>
                </button>

                {expandedId === item.id && item.body && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4"
                  >
                    <div className="bg-secondary rounded-lg p-4 mb-3">
                      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                        {item.body}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(item)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium active:scale-95 transition-transform"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check size={14} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copy to clipboard
                        </>
                      )}
                    </button>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ContentPortfolio;
