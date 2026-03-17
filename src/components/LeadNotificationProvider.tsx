import { useLeadNotifications } from "@/hooks/useLeadNotifications";

export function LeadNotificationProvider({ children }: { children: React.ReactNode }) {
  useLeadNotifications();
  return <>{children}</>;
}
