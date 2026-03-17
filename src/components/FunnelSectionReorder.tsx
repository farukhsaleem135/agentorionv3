import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GripVertical, LayoutTemplate, BarChart3, FileText, ShieldCheck } from "lucide-react";

interface FunnelSectionReorderProps {
  sectionOrder: string[];
  onReorder: (newOrder: string[]) => void;
}

const SECTION_META: Record<string, { label: string; icon: React.ElementType; desc: string }> = {
  hero: { label: "Hero", icon: LayoutTemplate, desc: "Main headline, subline & CTA" },
  stats: { label: "Stats / Trust Bar", icon: BarChart3, desc: "Market stats or step indicators" },
  form: { label: "Lead Form", icon: FileText, desc: "Name, email & submit CTA" },
  trust: { label: "Trust Block", icon: ShieldCheck, desc: "Social proof & testimonials" },
};

const FunnelSectionReorder = ({ sectionOrder, onReorder }: FunnelSectionReorderProps) => {
  const [dragging, setDragging] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const handleDragStart = useCallback((index: number) => {
    setDragging(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOver(index);
  }, []);

  const handleDrop = useCallback(
    (index: number) => {
      if (dragging === null || dragging === index) {
        setDragging(null);
        setDragOver(null);
        return;
      }
      const updated = [...sectionOrder];
      const [moved] = updated.splice(dragging, 1);
      updated.splice(index, 0, moved);
      onReorder(updated);
      setDragging(null);
      setDragOver(null);
    },
    [dragging, sectionOrder, onReorder]
  );

  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...sectionOrder];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onReorder(updated);
  };

  const moveDown = (index: number) => {
    if (index === sectionOrder.length - 1) return;
    const updated = [...sectionOrder];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    onReorder(updated);
  };

  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-1 block">Section Order</label>
      <p className="text-[10px] text-muted-foreground mb-3">
        Drag to reorder funnel sections, or use the arrows.
      </p>
      <div className="space-y-1.5">
        <AnimatePresence mode="popLayout">
          {sectionOrder.map((sectionId, index) => {
            const meta = SECTION_META[sectionId];
            if (!meta) return null;
            const Icon = meta.icon;
            const isDragging = dragging === index;
            const isOver = dragOver === index;

            return (
              <motion.div
                key={sectionId}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onDragEnd={() => {
                  setDragging(null);
                  setDragOver(null);
                }}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing ${
                  isDragging
                    ? "opacity-50 border-primary bg-primary/5"
                    : isOver
                    ? "border-primary/50 bg-primary/5"
                    : "bg-card border-border"
                }`}
              >
                <GripVertical size={14} className="text-muted-foreground shrink-0" />
                <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Icon size={13} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">{meta.label}</p>
                  <p className="text-[9px] text-muted-foreground truncate">{meta.desc}</p>
                </div>
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-0.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                    aria-label="Move up"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 3L10 8H2L6 3Z" fill="currentColor" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(index)}
                    disabled={index === sectionOrder.length - 1}
                    className="p-0.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                    aria-label="Move down"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 9L2 4H10L6 9Z" fill="currentColor" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FunnelSectionReorder;
