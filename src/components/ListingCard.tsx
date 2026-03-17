import { motion } from "framer-motion";
import { MapPin, Eye, Clock, Pencil, Trash2, Megaphone } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface Listing {
  id: string;
  address: string;
  price: string;
  beds: number;
  baths: number;
  sqft: string;
  image: string;
  daysOnMarket: number;
  views: number;
  status: "active" | "pending" | "coming_soon" | "sold";
}

const statusBadge = {
  active: { label: "Active", className: "bg-success/15 text-success" },
  pending: { label: "Pending", className: "bg-warm/15 text-warm" },
  coming_soon: { label: "Coming Soon", className: "bg-info/15 text-info" },
  sold: { label: "Sold", className: "bg-muted text-muted-foreground" },
};

interface ListingCardProps {
  listing: Listing;
  onEdit?: (listing: Listing) => void;
  onDelete?: (id: string) => void;
  onPromote?: (listing: Listing) => void;
}

const ListingCard = ({ listing, onEdit, onDelete, onPromote }: ListingCardProps) => {
  const badge = statusBadge[listing.status] || statusBadge.active;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-card rounded-xl border border-border shadow-card overflow-hidden"
    >
      <div className="relative h-40 bg-secondary">
        <img
          src={listing.image}
          alt={listing.address}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[11px] font-semibold backdrop-blur-sm ${badge.className}`}>
          {badge.label}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h4 className="font-display text-lg font-bold text-foreground">{listing.price}</h4>
          {(onEdit || onDelete) && (
            <div className="flex items-center gap-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(listing)}
                  className="p-1.5 rounded-lg bg-secondary active:scale-95 transition-transform"
                >
                  <Pencil size={12} className="text-muted-foreground" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(listing.id)}
                  className="p-1.5 rounded-lg bg-secondary active:scale-95 transition-transform"
                >
                  <Trash2 size={12} className="text-destructive" />
                </button>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-muted-foreground mb-3">
          <MapPin size={12} />
          <span className="text-xs">{listing.address}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-secondary-foreground mb-3">
          <span>{listing.beds} bd</span>
          <span className="text-border">|</span>
          <span>{listing.baths} ba</span>
          <span className="text-border">|</span>
          <span>{listing.sqft} sqft</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-2 border-t border-border">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{listing.daysOnMarket}d on market</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye size={12} />
            <span>{listing.views} views</span>
          </div>
        </div>

        {/* Promote This Listing */}
        {onPromote && (
          <button
            onClick={() => onPromote(listing)}
            className="w-full mt-3 py-2.5 rounded-xl bg-gradient-cta text-primary-foreground text-xs font-semibold flex items-center justify-center gap-2 shadow-glow active:scale-[0.97] transition-transform"
          >
            <Megaphone size={14} />
            Promote This Listing
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ListingCard;
