import MobileShell from "@/components/MobileShell";
import ListingCard from "@/components/ListingCard";
import MLSSyncPanel from "@/components/MLSSyncPanel";
import { Plus, Search, X, Home, DollarSign, MapPin, BedDouble, Loader2, Ruler, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Listing } from "@/components/ListingCard";

type StatusFilter = "all" | "active" | "pending" | "coming_soon" | "sold";

const Listings = () => {
  const [showForm, setShowForm] = useState(false);
  const [showMLS, setShowMLS] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [beds, setBeds] = useState("");
  const [baths, setBaths] = useState("");
  const [sqft, setSqft] = useState("");
  const [status, setStatus] = useState("active");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchListings = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setListings(
        data.map((d: any) => ({
          id: d.id,
          address: d.address,
          price: d.price || "$0",
          beds: d.beds || 0,
          baths: d.baths || 0,
          sqft: d.sqft || "0",
          image: d.image || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80",
          daysOnMarket: d.days_on_market,
          views: d.views,
          status: d.status as Listing["status"],
        }))
      );
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const resetForm = () => {
    setAddress("");
    setPrice("");
    setBeds("");
    setBaths("");
    setSqft("");
    setStatus("active");
    setEditingListing(null);
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (listing: Listing) => {
    setEditingListing(listing);
    setAddress(listing.address);
    setPrice(listing.price);
    setBeds(String(listing.beds || ""));
    setBaths(String(listing.baths || ""));
    setSqft(listing.sqft || "");
    setStatus(listing.status);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleSubmit = async () => {
    if (!address.trim()) {
      toast({ title: "Address required", description: "Please enter a property address.", variant: "destructive" });
      return;
    }
    if (!user) return;

    if (editingListing) {
      const { error } = await supabase
        .from("listings")
        .update({
          address: address.trim(),
          price: price.trim() || null,
          beds: beds ? parseInt(beds) : null,
          baths: baths ? parseInt(baths) : null,
          sqft: sqft.trim() || null,
          status,
        })
        .eq("id", editingListing.id);

      if (error) {
        toast({ title: "Failed to update", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Listing updated!" });
    } else {
      const { error } = await supabase.from("listings").insert({
        user_id: user.id,
        address: address.trim(),
        price: price.trim() || null,
        beds: beds ? parseInt(beds) : null,
        baths: baths ? parseInt(baths) : null,
        sqft: sqft.trim() || null,
        status,
      });

      if (error) {
        toast({ title: "Failed to add listing", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Listing created!", description: `"${address}" has been added.` });
    }

    closeForm();
    await fetchListings();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this listing?")) return;
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Listing deleted" });
      await fetchListings();
    }
  };

  const handlePromote = (listing: Listing) => {
    toast({
      title: "Let's promote this listing!",
      description: `Generating AI ad copy for "${listing.address}". Use it on Facebook, Instagram, Google, or any platform.`,
    });
    navigate("/content", { state: { promoteListing: listing } });
  };

  const filtered = listings.filter((l) => {
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    const matchesSearch = !search || l.address.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const counts = {
    all: listings.length,
    active: listings.filter((l) => l.status === "active").length,
    pending: listings.filter((l) => l.status === "pending").length,
    coming_soon: listings.filter((l) => l.status === "coming_soon").length,
    sold: listings.filter((l) => l.status === "sold").length,
  };

  const filters: { key: StatusFilter; label: string }[] = [
    { key: "all", label: `All (${counts.all})` },
    { key: "active", label: `Active (${counts.active})` },
    { key: "pending", label: `Pending (${counts.pending})` },
    { key: "coming_soon", label: `Soon (${counts.coming_soon})` },
    { key: "sold", label: `Sold (${counts.sold})` },
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "pending", label: "Pending" },
    { value: "coming_soon", label: "Coming Soon" },
    { value: "sold", label: "Sold" },
  ];

  return (
    <MobileShell>
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-xl font-bold text-foreground">Listings</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMLS(true)}
              className="p-2.5 rounded-xl bg-secondary touch-target active:scale-95 transition-transform"
              title="MLS Sync"
            >
              <Database size={18} className="text-foreground" />
            </button>
            <button
              onClick={openCreate}
              className="p-2.5 rounded-xl bg-gradient-cta touch-target active:scale-95 transition-transform shadow-glow"
            >
              <Plus size={18} className="text-primary-foreground" />
            </button>
          </div>
        </div>

        <div className="relative mb-4">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search listings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex gap-2 mb-2 overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === f.key
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">No listings found</p>
            <p className="text-xs text-muted-foreground mt-1">Add your first listing to get started</p>
          </div>
        ) : (
          filtered.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onEdit={openEdit}
              onDelete={handleDelete}
              onPromote={handlePromote}
            />
          ))
        )}
      </div>

      {/* Add/Edit Listing Sheet */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-background/80 backdrop-blur-sm"
            onClick={closeForm}
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
                <h3 className="font-display text-base font-bold text-foreground">
                  {editingListing ? "Edit Listing" : "Add Listing"}
                </h3>
                <button onClick={closeForm} className="p-2 rounded-lg bg-secondary active:scale-95 transition-transform">
                  <X size={16} className="text-foreground" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="text" placeholder="Property address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full pl-9 pr-4 py-3 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="text" placeholder="Listing price" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full pl-9 pr-4 py-3 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="relative">
                    <BedDouble size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="number" placeholder="Beds" value={beds} onChange={(e) => setBeds(e.target.value)} className="w-full pl-9 pr-2 py-3 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div className="relative">
                    <Home size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="number" placeholder="Baths" value={baths} onChange={(e) => setBaths(e.target.value)} className="w-full pl-9 pr-2 py-3 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div className="relative">
                    <Ruler size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="text" placeholder="Sqft" value={sqft} onChange={(e) => setSqft(e.target.value)} className="w-full pl-9 pr-2 py-3 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>

                {/* Status selector */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Status</label>
                  <div className="flex gap-2">
                    {statusOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setStatus(opt.value)}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                          status === opt.value
                            ? "bg-primary text-primary-foreground shadow-glow"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={handleSubmit} className="w-full py-3.5 rounded-xl bg-gradient-cta text-primary-foreground text-sm font-semibold shadow-glow active:scale-[0.98] transition-transform mt-2">
                  {editingListing ? "Save Changes" : "Add Listing"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MLSSyncPanel open={showMLS} onClose={() => setShowMLS(false)} onImported={fetchListings} />
    </MobileShell>
  );
};

export default Listings;
