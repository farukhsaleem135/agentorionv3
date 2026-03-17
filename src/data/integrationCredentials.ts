interface CredentialField {
  key: string;
  label: string;
  placeholder: string;
  required: boolean;
}

export const integrationCredentialFields: Record<string, CredentialField[]> = {
  // CRM
  followupboss: [
    { key: "api_key", label: "API Key", placeholder: "Enter your Follow Up Boss API key", required: true },
  ],
  kvcore: [
    { key: "api_key", label: "API Key", placeholder: "Enter your kvCORE API key", required: true },
    { key: "api_secret", label: "API Secret", placeholder: "Enter your kvCORE API secret", required: false },
  ],
  chime: [
    { key: "api_key", label: "API Key", placeholder: "Enter your Chime / Lofty API key", required: true },
  ],
  hubspot: [
    { key: "api_key", label: "Private App Token", placeholder: "Enter your HubSpot private app token", required: true },
  ],
  liondesk: [
    { key: "api_key", label: "API Key", placeholder: "Enter your LionDesk API key", required: true },
  ],
  // MLS
  mls: [
    { key: "api_key", label: "API Key / RESO Token", placeholder: "Enter your MLS/IDX API key", required: true },
    { key: "api_secret", label: "API Secret", placeholder: "Enter your API secret (if applicable)", required: false },
    { key: "mls_id", label: "MLS ID", placeholder: "Enter your MLS board ID", required: false },
  ],
  // Referral
  prolinc: [
    { key: "api_key", label: "API Key", placeholder: "Enter your PROLINC API key", required: true },
    { key: "agent_id", label: "Agent ID", placeholder: "Enter your PROLINC agent ID", required: true },
  ],
  // Calendar
  google_cal: [
    { key: "api_key", label: "API Key / OAuth Token", placeholder: "Enter your Google Calendar API key", required: true },
    { key: "calendar_id", label: "Calendar ID", placeholder: "primary", required: false },
  ],
  outlook: [
    { key: "api_key", label: "API Key / OAuth Token", placeholder: "Enter your Microsoft API key", required: true },
  ],
  // Ads
  meta_ads: [
    { key: "access_token", label: "Access Token", placeholder: "Enter your Meta Ads access token", required: true },
    { key: "ad_account_id", label: "Ad Account ID", placeholder: "act_123456789", required: true },
  ],
  google_ads: [
    { key: "api_key", label: "Developer Token", placeholder: "Enter your Google Ads developer token", required: true },
    { key: "customer_id", label: "Customer ID", placeholder: "123-456-7890", required: true },
  ],
  tiktok_ads: [
    { key: "access_token", label: "Access Token", placeholder: "Enter your TikTok Ads access token", required: true },
    { key: "advertiser_id", label: "Advertiser ID", placeholder: "Enter your advertiser ID", required: true },
  ],
  youtube_ads: [
    { key: "api_key", label: "Developer Token", placeholder: "Enter your YouTube/Google Ads developer token", required: true },
    { key: "customer_id", label: "Customer ID", placeholder: "123-456-7890", required: true },
  ],
  // Messaging
  twilio: [
    { key: "account_sid", label: "Account SID", placeholder: "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", required: true },
    { key: "auth_token", label: "Auth Token", placeholder: "Enter your Twilio Auth Token", required: true },
    { key: "phone_number", label: "Phone Number", placeholder: "+1234567890", required: true },
  ],
  resend: [
    { key: "api_key", label: "API Key", placeholder: "re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", required: true },
    { key: "from_email", label: "From Email", placeholder: "noreply@yourdomain.com", required: true },
  ],
  // AI / Voice
  elevenlabs: [
    { key: "api_key", label: "API Key", placeholder: "Enter your ElevenLabs API key", required: true },
  ],
};
