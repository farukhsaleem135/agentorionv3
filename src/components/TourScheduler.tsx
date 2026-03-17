import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Loader2, Check, MapPin, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface TourSchedulerProps {
  leadId: string;
  leadName: string;
  listingId?: string;
  listingAddress?: string;
  open: boolean;
  onClose: () => void;
}

const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
  "5:00 PM",
];

const TourScheduler = ({ leadId, leadName, listingId, listingAddress, open, onClose }: TourSchedulerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const handleSchedule = async () => {
    if (!user || !selectedDate || !selectedTime) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("tour_requests").insert({
        lead_id: leadId,
        user_id: user.id,
        listing_id: listingId || null,
        requested_date: selectedDate,
        requested_time: selectedTime,
        notes: notes || null,
        status: "confirmed",
        ai_confirmed: true,
      });
      if (error) throw error;

      // Log to conversations
      await supabase.from("lead_conversations").insert({
        lead_id: leadId,
        channel: "system",
        direction: "outbound",
        role: "assistant",
        content: `Tour scheduled for ${selectedDate} at ${selectedTime}${listingAddress ? ` at ${listingAddress}` : ""}`,
        metadata: { type: "tour_scheduled", listing_id: listingId },
      });

      setConfirmed(true);
      toast({ title: "Tour scheduled!" });
      setTimeout(() => {
        onClose();
        setConfirmed(false);
        setSelectedDate("");
        setSelectedTime("");
        setNotes("");
      }, 2000);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[75] bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="absolute bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-2xl p-5 pb-10 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />

            {confirmed ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-4">
                  <Check size={28} className="text-success" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-1">Tour Confirmed!</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedDate} at {selectedTime}
                </p>
                {listingAddress && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                    <MapPin size={10} /> {listingAddress}
                  </p>
                )}
              </motion.div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-display text-base font-bold text-foreground">Schedule Tour</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      For {leadName}{listingAddress ? ` • ${listingAddress}` : ""}
                    </p>
                  </div>
                  <button onClick={onClose} className="p-2 rounded-lg bg-secondary">
                    <X size={16} className="text-foreground" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Date */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                      <Calendar size={12} /> Select Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      min={today}
                      max={maxDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-secondary text-foreground text-sm rounded-xl px-4 py-3 border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Time */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                      <Clock size={12} /> Select Time
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-2 rounded-lg text-[11px] font-medium transition-all ${
                            selectedTime === time
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any notes (optional)"
                    rows={2}
                    className="w-full bg-secondary text-foreground text-sm rounded-xl px-4 py-3 border border-border focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground resize-none"
                  />

                  <button
                    onClick={handleSchedule}
                    disabled={submitting || !selectedDate || !selectedTime}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-cta text-primary-foreground font-semibold text-sm active:scale-[0.98] transition-transform disabled:opacity-50 shadow-glow"
                  >
                    {submitting ? (
                      <><Loader2 size={14} className="animate-spin" /> Scheduling...</>
                    ) : (
                      <><Calendar size={14} /> Confirm Tour</>
                    )}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TourScheduler;
