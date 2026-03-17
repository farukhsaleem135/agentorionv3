/**
 * Color utility functions for funnel theming.
 * Shared across FunnelPublic, FunnelLivePreview, and LeadCaptureFlow.
 */

/** Converts #RRGGBB hex to "hsl(H S% L%)" string. Returns null on invalid input. */
export function hexToHsl(hex: string): string | null {
  try {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;
    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return `hsl(${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`;
  } catch {
    return null;
  }
}

/**
 * Returns whether white or black text has better contrast against the given HSL color.
 * Used for CTA button text color when brand color could be light or dark.
 */
export function getContrastTextColor(hslColor: string): 'white' | 'black' {
  try {
    const match = hslColor.match(/hsl\((\d+)\s+(\d+)%\s+(\d+)%\)/);
    if (!match) return 'white';
    const lightness = parseInt(match[3]);
    return lightness > 55 ? 'black' : 'white';
  } catch {
    return 'white';
  }
}

/**
 * Generates a responsive Unsplash image URL with modern format negotiation.
 * Overrides w, fm, q, fit, crop params on the given Unsplash URL.
 */
export function buildResponsiveUnsplashUrl(
  baseUrl: string,
  width: number,
  format: 'webp' | 'jpg' = 'webp'
): string {
  if (!baseUrl || !baseUrl.includes('unsplash.com')) return baseUrl;
  try {
    const url = new URL(baseUrl);
    url.searchParams.set('w', String(width));
    url.searchParams.set('fm', format);
    url.searchParams.set('q', width <= 400 ? '70' : '80');
    url.searchParams.set('fit', 'crop');
    url.searchParams.set('crop', 'entropy');
    url.searchParams.delete('auto');
    return url.toString();
  } catch {
    return baseUrl;
  }
}

export function buildUnsplashSrcSet(baseUrl: string): string {
  if (!baseUrl || !baseUrl.includes('unsplash.com')) return '';
  const widths = [390, 640, 828, 1080, 1440, 1920];
  return widths
    .map(w => `${buildResponsiveUnsplashUrl(baseUrl, w, 'webp')} ${w}w`)
    .join(', ');
}
