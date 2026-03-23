import { useState, useEffect, useRef } from "react";
import MobileShell from "@/components/MobileShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Users, Phone, Mail, Upload, Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const RELATIONSHIP_TYPES = [
  { value: "sphere", label: "Sphere" },
  { value: "past_client", label: "Past Client" },
  { value: "personal", label: "Personal" },
  { value: "professional", label: "Professional" },
  { value: "met_once", label: "Met Once" },
  { value: "funnel_lead", label: "Funnel Lead" },
  { value: "buyer_lead", label: "Buyer Lead" },
  { value: "seller_prospect", label: "Seller Prospect" },
] as const;

const TYPE_COLORS: Record<string, string> = {
  sphere: "bg-primary/10 text-primary border-primary/20",
  past_client: "bg-signal-green/10 text-signal-green border-signal-green/20",
  personal: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  professional: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  met_once: "bg-muted text-muted-foreground border-border",
  funnel_lead: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  buyer_lead: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  seller_prospect: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

interface Contact {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  relationship_type: string;
  source: string;
  contact_score: number;
  notes: string | null;
  last_contacted_at: string | null;
  created_at: string;
}

const Contacts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [csvImporting, setCsvImporting] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formType, setFormType] = useState("sphere");
  const [formNotes, setFormNotes] = useState("");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (profile) {
        setProfileId(profile.id);
        const { data } = await supabase
          .from("contacts" as any)
          .select("*")
          .eq("agent_id", profile.id)
          .order("created_at", { ascending: false });
        setContacts((data as any) ?? []);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const filteredContacts = contacts.filter((c) => {
    const matchSearch =
      !search ||
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search);
    const matchType = filterType === "all" || c.relationship_type === filterType;
    return matchSearch && matchType;
  });

  const handleAdd = async () => {
    if (!profileId || !formName.trim()) return;
    setSaving(true);
    const { data, error } = await supabase.from("contacts" as any).insert({
      agent_id: profileId,
      full_name: formName.trim(),
      email: formEmail.trim() || null,
      phone: formPhone.trim() || null,
      relationship_type: formType,
      source: "manual",
      notes: formNotes.trim() || null,
    }).select().single();

    if (error) {
      toast({ title: "Error adding contact", description: error.message, variant: "destructive" });
    } else {
      setContacts((prev) => [data as any, ...prev]);
      setFormName(""); setFormEmail(""); setFormPhone(""); setFormType("sphere"); setFormNotes("");
      setAddOpen(false);
      toast({ title: "Contact added" });
    }
    setSaving(false);
  };

  const handleCSVUpload = async (file: File) => {
    if (!profileId) return;
    setCsvImporting(true);
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) { toast({ title: "Empty CSV", variant: "destructive" }); setCsvImporting(false); return; }

      const header = lines[0].toLowerCase().split(",").map((h) => h.trim().replace(/"/g, ""));
      const nameIdx = header.findIndex((h) => h.includes("name"));
      const emailIdx = header.findIndex((h) => h.includes("email"));
      const phoneIdx = header.findIndex((h) => h.includes("phone"));
      const typeIdx = header.findIndex((h) => h.includes("relationship") || h.includes("type"));
      if (nameIdx === -1) { toast({ title: "Missing 'Full Name' column", variant: "destructive" }); setCsvImporting(false); return; }

      const validTypes = RELATIONSHIP_TYPES.map((t) => t.value);
      const rows: any[] = [];
      let skipped = 0;
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
        const name = cols[nameIdx]?.trim();
        if (!name) { skipped++; continue; }
        let relType: string = typeIdx >= 0 ? cols[typeIdx]?.trim().toLowerCase() : "sphere";
        if (!validTypes.includes(relType as any)) relType = "sphere";
        rows.push({
          agent_id: profileId,
          full_name: name,
          email: emailIdx >= 0 ? cols[emailIdx]?.trim() || null : null,
          phone: phoneIdx >= 0 ? cols[phoneIdx]?.trim() || null : null,
          relationship_type: relType,
          source: "csv_import",
        });
      }
      if (rows.length > 0) {
        const { error } = await supabase.from("contacts" as any).insert(rows);
        if (error) throw error;
        // Refresh
        const { data } = await supabase.from("contacts" as any).select("*").eq("agent_id", profileId).order("created_at", { ascending: false });
        setContacts((data as any) ?? []);
      }
      toast({ title: `${rows.length} contacts imported`, description: skipped > 0 ? `${skipped} rows skipped` : undefined });
    } catch (err: any) {
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
    }
    setCsvImporting(false);
  };

  const downloadTemplate = () => {
    const csv = `Full Name,Email,Phone,Relationship Type\nJohn Smith,john@example.com,(555) 123-4567,sphere\nJane Doe,jane@example.com,(555) 987-6543,past_client\n,,,"Valid types: sphere, past_client, personal, professional, met_once"`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "agentorion-contacts-template.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <MobileShell>
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Contacts</h1>
            <p className="text-xs text-muted-foreground">{contacts.length} total contacts</p>
          </div>
          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCSVUpload(f); }} />
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download size={14} className="mr-1" /> Template
            </Button>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={csvImporting}>
              {csvImporting ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Upload size={14} className="mr-1" />}
              CSV
            </Button>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus size={14} className="mr-1" /> Add</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Contact</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div>
                    <Label>Full Name *</Label>
                    <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Sarah Johnson" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Email</Label>
                      <Input value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="email@example.com" />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="(555) 123-4567" />
                    </div>
                  </div>
                  <div>
                    <Label>Relationship Type</Label>
                    <Select value={formType} onValueChange={setFormType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {RELATIONSHIP_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Optional notes..." rows={2} />
                  </div>
                  <Button className="w-full" onClick={handleAdd} disabled={saving || !formName.trim()}>
                    {saving ? <Loader2 size={14} className="mr-2 animate-spin" /> : null}
                    Add Contact
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search contacts..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {RELATIONSHIP_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Contact List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-12">
            <Users size={40} className="mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">
              {contacts.length === 0 ? "No contacts yet. Add your first contact or import a CSV." : "No contacts match your search."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredContacts.map((contact, i) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="p-3.5 rounded-xl border border-border bg-card hover:border-border/80 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">{contact.full_name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {contact.email && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                          <Mail size={10} /> {contact.email}
                        </span>
                      )}
                      {contact.phone && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone size={10} /> {contact.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-[10px] shrink-0 ml-2 ${TYPE_COLORS[contact.relationship_type] || ""}`}>
                    {RELATIONSHIP_TYPES.find((t) => t.value === contact.relationship_type)?.label || contact.relationship_type}
                  </Badge>
                </div>
                {contact.notes && (
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">{contact.notes}</p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MobileShell>
  );
};

export default Contacts;
