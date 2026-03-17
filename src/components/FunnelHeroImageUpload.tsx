import { useState, useRef, useEffect, useCallback } from "react";
import { ImagePlus, X, Loader2, Sparkles, Upload, RotateCcw, Camera, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import UnsplashAttribution from "@/components/UnsplashAttribution";

interface UnsplashPhoto {
  id: string;
  url_regular: string;
  photographer_name: string;
  photographer_profile_url: string;
  unsplash_photo_page_url: string;
}

export interface UnsplashMeta {
  unsplash_photo_id: string;
  photographer_name: string;
  photographer_profile_url: string;
  unsplash_photo_page_url: string;
  download_location_url?: string;
}

interface FunnelHeroImageUploadProps {
  heroImageUrl: string | null;
  onImageChange: (url: string | null) => void;
  onUnsplashMetaChange?: (meta: UnsplashMeta | null) => void;
  funnelType?: string;
  brandColor?: string;
  avgSalePrice?: number | null;
  targetNeighborhoods?: string;
}

const FunnelHeroImageUpload = ({ heroImageUrl, onImageChange, onUnsplashMetaChange, funnelType, brandColor, avgSalePrice, targetNeighborhoods }: FunnelHeroImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [loadingUnsplash, setLoadingUnsplash] = useState(false);
  const [unsplashPhotos, setUnsplashPhotos] = useState<UnsplashPhoto[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedSource, setSelectedSource] = useState<"unsplash" | "upload">(heroImageUrl ? "upload" : "unsplash");
  const [selectedUnsplash, setSelectedUnsplash] = useState<UnsplashPhoto | null>(null);
  const [rotateEnabled, setRotateEnabled] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Part 1 — Profile data gate: allow fetch once avgSalePrice has resolved (even if null)
  const profileReady = avgSalePrice !== undefined;

  const fetchUnsplashPhotos = useCallback(async () => {
    if (!profileReady) return; // Gate: don't fire until profile resolves
    setLoadingUnsplash(true);
    try {
      const requestBody = {
        action: "search",
        funnel_type: funnelType || "buyer",
        brand_color: brandColor ?? '',
        avg_sale_price: avgSalePrice ?? 0,
        target_neighborhoods: targetNeighborhoods ?? '',
      };
      console.log('[FunnelHeroImageUpload] unsplash-hero request body:', JSON.stringify(requestBody));
      const { data, error } = await supabase.functions.invoke("unsplash-hero", {
        body: requestBody,
      });
      if (error) throw error;
      if (data?.photos) {
        setUnsplashPhotos(data.photos.slice(0, 6));
      }
    } catch (err: any) {
      console.error("Unsplash fetch error:", err);
      toast({ title: "Failed to load images", description: err.message, variant: "destructive" });
    } finally {
      setLoadingUnsplash(false);
    }
  }, [profileReady, avgSalePrice, funnelType, brandColor, targetNeighborhoods, toast]);

  // Part 3 — Retry trigger when profile arrives while picker is open
  useEffect(() => {
    if (profileReady && showPicker && unsplashPhotos.length === 0) {
      fetchUnsplashPhotos();
    }
  }, [profileReady, showPicker, unsplashPhotos.length, fetchUnsplashPhotos]);

  const handleSelectUnsplash = (photo: UnsplashPhoto) => {
    setSelectedUnsplash(photo);
    onImageChange(photo.url_regular);
    onUnsplashMetaChange?.({
      unsplash_photo_id: photo.id,
      photographer_name: photo.photographer_name,
      photographer_profile_url: photo.photographer_profile_url,
      unsplash_photo_page_url: photo.unsplash_photo_page_url,
    });
    setShowPicker(false);
    toast({ title: "Hero image set", description: `Photo by ${photo.photographer_name}` });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5 MB.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("funnel-assets").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;

      const { data: urlData } = supabase.storage.from("funnel-assets").getPublicUrl(path);
      onImageChange(urlData.publicUrl);
      setSelectedUnsplash(null);
      onUnsplashMetaChange?.(null);
      setSelectedSource("upload");
      toast({ title: "Image uploaded!" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onImageChange(null);
    setSelectedUnsplash(null);
    onUnsplashMetaChange?.(null);
    setSelectedSource("unsplash");
  };

  const handleOpenPicker = () => {
    setShowPicker(true);
    if (unsplashPhotos.length === 0) {
      fetchUnsplashPhotos();
    }
  };

  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-1 block">Hero Image</label>
      <p className="text-[10px] text-muted-foreground mb-3">
        AI auto-selects optimized hero images. Upload your own to override.
      </p>

      {/* Current hero preview */}
      {heroImageUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-border mb-3">
          <img
            src={heroImageUrl}
            alt="Hero preview"
            className="w-full h-32 object-cover"
          />
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
              selectedUnsplash ? "bg-info/20 text-info" : "bg-success/20 text-success"
            }`}>
              {selectedUnsplash ? "Recommended (Unsplash)" : "Uploaded"}
            </span>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-border active:scale-95 transition-transform"
          >
            <X size={14} className="text-foreground" />
          </button>

          {/* Attribution for Unsplash */}
          {selectedUnsplash && (
            <UnsplashAttribution
              photographerName={selectedUnsplash.photographer_name}
              photographerProfileUrl={selectedUnsplash.photographer_profile_url}
              className="absolute bottom-0 right-0 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-tl-lg z-10"
            />
          )}
        </div>
      ) : null}

      {/* Action buttons */}
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={handleOpenPicker}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors active:scale-[0.98] text-xs font-medium text-foreground"
        >
          <Sparkles size={14} className="text-info" />
          Recommended Images
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors active:scale-[0.98] text-xs font-medium text-foreground disabled:opacity-60"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} className="text-muted-foreground" />}
          Upload My Own
        </button>
      </div>

      {/* Rotation toggle */}
      <div className="flex items-center justify-between px-1 mb-3">
        <div>
          <p className="text-xs font-medium text-foreground">Rotate 3 Heroes for Testing</p>
          <p className="text-[9px] text-muted-foreground">A/B/C rotation to find best performer</p>
        </div>
        <Switch
          checked={rotateEnabled}
          onCheckedChange={setRotateEnabled}
        />
      </div>

      {/* Unsplash picker panel */}
      {showPicker && (
        <div className="rounded-xl border border-border bg-card p-3 mb-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-foreground">Curated Hero Images</p>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={fetchUnsplashPhotos}
                disabled={loadingUnsplash}
                className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
              >
                <RotateCcw size={12} className={`text-muted-foreground ${loadingUnsplash ? "animate-spin" : ""}`} />
              </button>
              <button
                type="button"
                onClick={() => setShowPicker(false)}
                className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
              >
                <X size={12} className="text-muted-foreground" />
              </button>
            </div>
          </div>

          {!profileReady ? (
            <div>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="w-full h-20 rounded-lg" />
                ))}
              </div>
              <p className="text-[9px] text-muted-foreground text-center animate-pulse">
                Personalizing image suggestions for your market...
              </p>
            </div>
          ) : loadingUnsplash ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {unsplashPhotos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => handleSelectUnsplash(photo)}
                  className="relative group rounded-lg overflow-hidden border border-border hover:border-primary transition-colors active:scale-[0.97]"
                >
                  <img
                    src={photo.url_regular + "&w=300&h=200&fit=crop"}
                    alt={`Photo by ${photo.photographer_name}`}
                    className="w-full h-20 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-background/0 group-hover:bg-background/30 transition-colors flex items-center justify-center">
                    <Check size={16} className="text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                  </div>
                  <UnsplashAttribution
                    photographerName={photo.photographer_name}
                    photographerProfileUrl={photo.photographer_profile_url}
                    className="absolute bottom-0 left-0 right-0 px-1.5 py-1 bg-black/60 backdrop-blur-sm"
                    size="xs"
                  />
                </button>
              ))}
            </div>
          )}

          <p className="text-[8px] text-muted-foreground mt-2 text-center">
            Photos provided by Unsplash. Attribution auto-included.
          </p>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
};

export default FunnelHeroImageUpload;
