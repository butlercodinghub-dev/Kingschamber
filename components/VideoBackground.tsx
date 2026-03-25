"use client";

interface VideoBackgroundProps {
  src: string;
  fallbackSrc?: string;
  opacity?: number;
}

export default function VideoBackground({
  src,
  fallbackSrc,
  opacity = 0.1,
}: VideoBackgroundProps) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Static image fallback */}
      {fallbackSrc && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${fallbackSrc})`,
            opacity: opacity * 0.8,
          }}
        />
      )}

      {/* Video layer */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity }}
      >
        <source src={src} type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-chamber-black/85" />
    </div>
  );
}
