import { motion } from "framer-motion";
import { useRef, useState, useCallback } from "react";
import { buildResponsiveUnsplashUrl, buildUnsplashSrcSet } from "@/utils/colorUtils";
import { analyzeLoadedImage, type BrightnessResult } from "@/utils/imageBrightness";

interface PremiumHeroBackgroundProps {
  primaryColor?: string;
  baseColor?: string;
  heroImageUrl?: string | null;
  variant?: "mini" | "full";
  overlayStrength?: 'light' | 'medium' | 'strong' | 'maximum';
  onBrightnessAnalyzed?: (result: BrightnessResult) => void;
}

const overlayAlphas = {
  light:   { top: '99', mid: '80', bottom: 'cc' },
  medium:  { top: 'cc', mid: '99', bottom: 'ee' },
  strong:  { top: 'dd', mid: 'bb', bottom: 'f2' },
  maximum: { top: 'ee', mid: 'cc', bottom: 'f7' },
};

const PremiumHeroBackground = ({
  primaryColor = "hsl(152 82% 48%)",
  baseColor = "hsl(220 26% 9%)",
  heroImageUrl,
  variant = "full",
  overlayStrength = "medium",
  onBrightnessAnalyzed,
}: PremiumHeroBackgroundProps) => {
  const isMini = variant === "mini";
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    if (imgRef.current && onBrightnessAnalyzed) {
      const result = analyzeLoadedImage(imgRef.current);
      onBrightnessAnalyzed(result);
    }
  }, [onBrightnessAnalyzed]);

  // If hero image is uploaded, render image + adaptive overlay
  if (heroImageUrl) {
    const alpha = overlayAlphas[overlayStrength];
    const isUnsplash = heroImageUrl.includes('unsplash.com');
    const srcSet = isUnsplash ? buildUnsplashSrcSet(heroImageUrl) : undefined;
    const defaultSrc = isUnsplash
      ? buildResponsiveUnsplashUrl(heroImageUrl, 1080, 'webp')
      : heroImageUrl;
    const placeholderUrl = isUnsplash
      ? buildResponsiveUnsplashUrl(heroImageUrl, 20, 'jpg') + '&blur=500'
      : null;

    return (
      <div className="absolute inset-0 overflow-hidden">
        {/* Layer 1: Blur placeholder — visible immediately, ~1.5KB */}
        {placeholderUrl && !imageLoaded && (
          <img
            src={placeholderUrl}
            alt=""
            role="presentation"
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover scale-105"
            style={{ filter: 'blur(20px)' }}
          />
        )}
        {/* Layer 2: Full resolution image — fades in when loaded */}
        <img
          ref={imgRef}
          src={defaultSrc}
          srcSet={srcSet}
          sizes="100vw"
          alt=""
          role="presentation"
          fetchPriority="high"
          loading="eager"
          decoding="async"
          crossOrigin="anonymous"
          onLoad={handleImageLoad}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          style={{
            opacity: imageLoaded ? 1 : 0,
            willChange: 'opacity',
          }}
        />
        {/* Layer 3: Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, ${baseColor}${alpha.top} 0%, ${baseColor}${alpha.mid} 40%, ${baseColor}${alpha.bottom} 100%)`,
          }}
        />
      </div>
    );
  }

  const orbSize = isMini ? { w: 60, h: 60 } : { w: 400, h: 400 };
  const orbBlur = isMini ? "30px" : "120px";
  const gridSize = isMini ? "20px" : "60px";

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Layer 1: Animated mesh gradient */}
      <div
        className="absolute inset-0 premium-hero-gradient"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 40%, ${primaryColor}15 0%, transparent 70%),
            radial-gradient(ellipse 60% 80% at 80% 20%, ${primaryColor}0a 0%, transparent 60%),
            radial-gradient(ellipse 100% 60% at 50% 100%, ${primaryColor}08 0%, transparent 50%),
            ${baseColor}
          `,
        }}
      />

      {/* Layer 2: Geometric grid pattern */}
      <div
        className="absolute inset-0"
        style={{
          opacity: isMini ? 0.06 : 0.04,
          backgroundImage: `
            linear-gradient(${primaryColor}40 1px, transparent 1px),
            linear-gradient(90deg, ${primaryColor}40 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize} ${gridSize}`,
          maskImage: `radial-gradient(ellipse 70% 60% at 50% 30%, black 0%, transparent 80%)`,
          WebkitMaskImage: `radial-gradient(ellipse 70% 60% at 50% 30%, black 0%, transparent 80%)`,
        }}
      />

      {/* Layer 3: Floating orbs */}
      <motion.div
        className="absolute"
        style={{
          width: orbSize.w,
          height: orbSize.h,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${primaryColor}18 0%, transparent 70%)`,
          filter: `blur(${orbBlur})`,
          top: "10%",
          left: "15%",
        }}
        animate={{
          x: [0, isMini ? 10 : 40, 0],
          y: [0, isMini ? -8 : -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: isMini ? 6 : 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute"
        style={{
          width: orbSize.w * 0.7,
          height: orbSize.h * 0.7,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${primaryColor}12 0%, transparent 70%)`,
          filter: `blur(${orbBlur})`,
          bottom: "20%",
          right: "10%",
        }}
        animate={{
          x: [0, isMini ? -8 : -30, 0],
          y: [0, isMini ? 6 : 20, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: isMini ? 7 : 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Layer 4: Diagonal accent line */}
      {!isMini && (
        <motion.div
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{
            background: `linear-gradient(135deg, transparent 40%, ${primaryColor}06 50%, transparent 60%)`,
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Layer 5: Top edge glow line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(to right, transparent, ${primaryColor}40, transparent)`,
        }}
      />

      {/* Layer 6: Bottom fade to content */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: isMini ? "30%" : "40%",
          background: `linear-gradient(to top, ${baseColor}, transparent)`,
        }}
      />
    </div>
  );
};

export default PremiumHeroBackground;
