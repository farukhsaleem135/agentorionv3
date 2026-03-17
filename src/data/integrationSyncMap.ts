// Maps integration provider IDs to their edge function names
export const integrationSyncFunctions: Record<string, string> = {
  followupboss: "sync-followupboss",
  kvcore: "sync-kvcore",
  chime: "sync-chime",
  hubspot: "sync-hubspot",
  liondesk: "sync-liondesk",
  mls: "sync-mls",
  prolinc: "sync-prolinc",
  google_cal: "sync-google-calendar",
  outlook: "sync-outlook",
  meta_ads: "sync-meta-ads",
  google_ads: "sync-google-ads",
  tiktok_ads: "sync-tiktok-ads",
  youtube_ads: "sync-youtube-ads",
  twilio: "sync-twilio",
  resend: "sync-resend",
  elevenlabs: "sync-resend", // placeholder — no real sync needed
};
