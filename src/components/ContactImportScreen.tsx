import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Users, CloudDownload, CheckCircle2, AlertCircle, ArrowRight, Loader2, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import StarField from "@/components/landing/StarField";
import OrionLogo from "@/components/landing/OrionLogo";

interface ContactImportScreenProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface CSVResult {
  imported: number;
  skipped: { row: number; name: string; reason: string }[];
}

const RELATIONSHIP_TYPES = [
  "sphere", "past_client", "personal", "professional",
  "met_once", "funnel_lead", "buyer_lead", "seller_prospect",
] as const;

const ContactImportScreen = ({ onComplete, onSkip }: ContactImportScreenProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [view, setView] = useState<"main" | "csv" | "success">("main");
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [csvResult, setCsvResult] = useState<CSVResult | null>(null);

  const handleGoogleImport = async () => {
    if (!user) return;
    setImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("import-google-contacts", {
        body: { user_id: user.id },
      });
      if (error) throw error;
      setImportedCount(data?.imported_count ?? 0);
      setView("success");
    } catch (err: any) {
      toast({
        title: "Google Contacts import requires setup",
        description: "Google OAuth credentials need to be configured. You can use CSV import instead.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleCSVUpload = async (file: File) => {
    if (!user) return;
    setImporting(true);

    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) {
        toast({ title: "Empty CSV", description: "No data rows found.", variant: "destructive" });
        setImporting(false);
        return;
      }

      // Parse header
      const header = lines[0].toLowerCase().split(",").map((h) => h.trim().replace(/"/g, ""));
      const nameIdx = header.findIndex((h) => h.includes("name"));
      const emailIdx = header.findIndex((h) => h.includes("email"));
      const phoneIdx = header.findIndex((h) => h.includes("phone"));
      const typeIdx = header.findIndex((h) => h.includes("relationship") || h.includes("type"));

      if (nameIdx === -1) {
        toast({ title: "Invalid CSV", description: "A 'Full Name' column is required.", variant: "destructive" });
        setImporting(false);
        return;
      }

      // Get profile id
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) {
        toast({ title: "Profile not found", variant: "destructive" });
        setImporting(false);
        return;
      }

      const imported: any[] = [];
      const skipped: { row: number; name: string; reason: string }[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
        const fullName = cols[nameIdx]?.trim();

        if (!fullName) {
          skipped.push({ row: i + 1, name: "(empty)", reason: "Missing full name" });
          continue;
        }

        const email = emailIdx >= 0 ? cols[emailIdx]?.trim() || null : null;
        const phone = phoneIdx >= 0 ? cols[phoneIdx]?.trim() || null : null;
        let relType = typeIdx >= 0 ? cols[typeIdx]?.trim().toLowerCase() : "sphere";

        if (!RELATIONSHIP_TYPES.includes(relType as any)) {
          relType = "sphere";
        }

        imported.push({
          agent_id: profile.id,
          full_name: fullName,
          email,
          phone,
          relationship_type: relType,
          source: "csv_import" as const,
        });
      }

      if (imported.length > 0) {
        const { error } = await supabase.from("contacts" as any).insert(imported);
        if (error) throw error;
      }

      setCsvResult({ imported: imported.length, skipped });
      setImportedCount(imported.length);
      setView("success");
    } catch (err: any) {
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csv = `Full Name,Email,Phone,Relationship Type\nJohn Smith,john@example.com,(555) 123-4567,sphere\nJane Doe,jane@example.com,(555) 987-6543,past_client\n,,,"Valid types: sphere, past_client, personal, professional, met_once"`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "agentorion-contacts-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-base overflow-auto">
      <StarField count={60} />
      <div className="relative z-10 w-full max-w-[560px] mx-auto px-6 py-10 flex flex-col items-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <OrionLogo variant="splash" />
        </motion.div>

        <AnimatePresence mode="wait">
          {view === "main" && (
            <motion.div
              key="main"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="w-full flex flex-col items-center mt-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mb-5">
                <Users size={32} className="text-primary" />
              </div>
              <h1 className="font-satoshi font-bold text-[24px] sm:text-[30px] text-text-primary text-center leading-tight">
                Your sphere is your fastest path to your first closing
              </h1>
              <p className="font-inter text-base text-text-secondary text-center max-w-[440px] mt-3">
                Import your contacts so AgentOrion can help you work your existing relationships systematically
              </p>

              <div className="w-full space-y-3 mt-8">
                <Button
                  className="w-full h-14 text-base font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleGoogleImport}
                  disabled={importing}
                >
                  {importing ? (
                    <Loader2 size={18} className="mr-2 animate-spin" />
                  ) : (
                    <CloudDownload size={18} className="mr-2" />
                  )}
                  Connect Google Contacts
                </Button>

                <button
                  onClick={() => setView("csv")}
                  className="w-full text-center text-sm text-text-secondary hover:text-text-primary transition-colors py-2"
                >
                  <FileSpreadsheet size={14} className="inline mr-1.5" />
                  Upload a CSV instead
                </button>
              </div>

              <button
                onClick={onSkip}
                className="font-inter text-[13px] text-text-disabled text-center mt-6 hover:text-text-muted transition-colors"
              >
                Skip for now — I'll add contacts later
              </button>
            </motion.div>
          )}

          {view === "csv" && (
            <motion.div
              key="csv"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="w-full flex flex-col items-center mt-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mb-5">
                <Upload size={32} className="text-primary" />
              </div>
              <h1 className="font-satoshi font-bold text-[24px] sm:text-[28px] text-text-primary text-center leading-tight">
                Upload Your Contacts
              </h1>
              <p className="font-inter text-sm text-text-secondary text-center max-w-[400px] mt-2">
                Use our template with four columns: Full Name, Email, Phone, Relationship Type
              </p>

              <div className="w-full space-y-3 mt-6">
                <Button
                  variant="outline"
                  className="w-full rounded-xl"
                  onClick={downloadTemplate}
                >
                  <FileSpreadsheet size={16} className="mr-2" />
                  Download CSV Template
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleCSVUpload(f);
                  }}
                />

                <Button
                  className="w-full h-14 text-base font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importing}
                >
                  {importing ? (
                    <Loader2 size={18} className="mr-2 animate-spin" />
                  ) : (
                    <Upload size={18} className="mr-2" />
                  )}
                  Upload CSV File
                </Button>
              </div>

              <button
                onClick={() => setView("main")}
                className="font-inter text-[13px] text-text-muted text-center mt-4 hover:text-text-primary transition-colors"
              >
                ← Go back
              </button>
              <button
                onClick={onSkip}
                className="font-inter text-[13px] text-text-disabled text-center mt-2 hover:text-text-muted transition-colors"
              >
                Skip for now — I'll add contacts later
              </button>
            </motion.div>
          )}

          {view === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="w-full flex flex-col items-center mt-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-signal-green/15 flex items-center justify-center mb-5">
                <CheckCircle2 size={32} className="text-signal-green" />
              </div>
              <h1 className="font-satoshi font-bold text-[24px] sm:text-[28px] text-text-primary text-center leading-tight">
                We imported {importedCount} contacts
              </h1>
              <p className="font-inter text-base text-text-secondary text-center max-w-[440px] mt-3">
                Your first SOI queue will be ready Monday morning.
              </p>

              {csvResult && csvResult.skipped.length > 0 && (
                <div className="w-full mt-4 rounded-xl border border-border bg-card p-4 max-h-[200px] overflow-y-auto">
                  <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                    <AlertCircle size={14} className="text-amber-500" />
                    {csvResult.skipped.length} rows skipped
                  </p>
                  {csvResult.skipped.map((s, i) => (
                    <p key={i} className="text-xs text-muted-foreground">
                      Row {s.row}: {s.name} — {s.reason}
                    </p>
                  ))}
                </div>
              )}

              <Button
                className="w-full h-14 text-base font-semibold rounded-xl bg-signal-green hover:bg-signal-green/90 text-white mt-6"
                onClick={onComplete}
              >
                Go to Dashboard <ArrowRight size={18} className="ml-2" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ContactImportScreen;
