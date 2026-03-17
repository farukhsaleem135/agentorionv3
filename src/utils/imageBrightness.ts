/**
 * Image brightness analysis for adaptive hero overlays.
 * Samples a loaded image to determine average brightness in the text region,
 * then returns recommended overlay strength and text color classes.
 */

export type BrightnessResult = {
  averageBrightness: number;
  isDark: boolean;
  isLight: boolean;
  overlayStrength: 'light' | 'medium' | 'strong' | 'maximum';
  textColorClass: 'text-white' | 'text-gray-900';
  subTextColorClass: 'text-white/80' | 'text-white/90';
};

export function analyzeImageBrightness(
  imgElement: HTMLImageElement
): BrightnessResult {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 56;
    const ctx = canvas.getContext('2d');
    if (!ctx) return getDefaultResult();

    ctx.drawImage(imgElement, 0, 0, 100, 56);

    // Sample the top 60% — where headline text appears
    const imageData = ctx.getImageData(0, 0, 100, 34);
    const data = imageData.data;

    let totalBrightness = 0;
    let pixelCount = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Perceived brightness (WCAG relative luminance approximation)
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      totalBrightness += brightness;
      pixelCount++;
    }

    const averageBrightness = pixelCount > 0
      ? totalBrightness / pixelCount
      : 128;

    const isDark = averageBrightness < 85;
    const isLight = averageBrightness > 160;

    const overlayStrength: BrightnessResult['overlayStrength'] =
      averageBrightness > 200 ? 'maximum' :
      averageBrightness > 160 ? 'strong' :
      averageBrightness > 100 ? 'medium' : 'light';

    // Always use white text — stronger overlay compensates for light images.
    // Dark text on real estate hero images looks jarring.
    const subTextColorClass: BrightnessResult['subTextColorClass'] =
      isLight ? 'text-white/90' : 'text-white/80';

    return {
      averageBrightness,
      isDark,
      isLight,
      overlayStrength,
      textColorClass: 'text-white',
      subTextColorClass,
    };
  } catch {
    return getDefaultResult();
  }
}

function getDefaultResult(): BrightnessResult {
  return {
    averageBrightness: 128,
    isDark: false,
    isLight: false,
    overlayStrength: 'strong',
    textColorClass: 'text-white',
    subTextColorClass: 'text-white/80',
  };
}

/** Sync version — analyzes an already-loaded img element without extra fetch */
export function analyzeLoadedImage(imgElement: HTMLImageElement): BrightnessResult {
  if (!imgElement.complete || imgElement.naturalWidth === 0) {
    return getDefaultResult();
  }
  return analyzeImageBrightness(imgElement);
}

/** Async version — loads image from URL before analyzing */
export function analyzeImageUrl(url: string): Promise<BrightnessResult> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(analyzeImageBrightness(img));
    img.onerror = () => resolve(getDefaultResult());
    // Use small version for sampling
    const separator = url.includes('?') ? '&' : '?';
    img.src = url.includes('unsplash.com')
      ? `${url}${separator}fm=jpg&w=400&q=60`
      : url;
    // Timeout fallback
    setTimeout(() => resolve(getDefaultResult()), 3000);
  });
}
