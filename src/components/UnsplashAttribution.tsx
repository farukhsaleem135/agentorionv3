/**
 * UnsplashAttribution — Shared attribution overlay for Unsplash images.
 *
 * Implements Unsplash API Guidelines:
 * - Photographer name is a clickable link to their Unsplash profile with UTM params
 * - "Unsplash" brand is a clickable link to unsplash.com with UTM params
 * - Both links open in a new tab
 *
 * Format: "Photo by [Photographer Name] on [Unsplash]"
 *
 * UTM format:
 *   Photographer: https://unsplash.com/@username?utm_source=AgentOrion&utm_medium=referral
 *   Unsplash:     https://unsplash.com?utm_source=AgentOrion&utm_medium=referral
 */

const UTM_PARAMS = "utm_source=AgentOrion&utm_medium=referral";
const UNSPLASH_BRAND_URL = `https://unsplash.com?${UTM_PARAMS}`;

/**
 * Ensures the photographer profile URL has the correct UTM parameters.
 * Handles cases where the URL might already have params, or might be missing them.
 */
export function buildPhotographerUrl(rawUrl: string | null | undefined): string {
  if (!rawUrl) return UNSPLASH_BRAND_URL;
  try {
    const url = new URL(rawUrl);
    url.searchParams.set("utm_source", "AgentOrion");
    url.searchParams.set("utm_medium", "referral");
    return url.toString();
  } catch {
    return UNSPLASH_BRAND_URL;
  }
}

interface UnsplashAttributionProps {
  photographerName: string;
  photographerProfileUrl?: string | null;
  /** Position classes — defaults to bottom-left overlay */
  className?: string;
  /** Text size — 'xs' for picker thumbnails, 'sm' for hero overlays */
  size?: "xs" | "sm";
}

const UnsplashAttribution = ({
  photographerName,
  photographerProfileUrl,
  className = "absolute bottom-0 left-0 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-tr-lg z-10",
  size = "sm",
}: UnsplashAttributionProps) => {
  const textClass = size === "xs" ? "text-[8px]" : "text-[9px]";
  const profileHref = buildPhotographerUrl(photographerProfileUrl);

  return (
    <div className={className}>
      <p className={`${textClass} text-white/90`}>
        Photo by{" "}
        <a
          href={profileHref}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-white hover:text-white/80"
        >
          {photographerName}
        </a>{" "}
        on{" "}
        <a
          href={UNSPLASH_BRAND_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-white hover:text-white/80"
        >
          Unsplash
        </a>
      </p>
    </div>
  );
};

export default UnsplashAttribution;
