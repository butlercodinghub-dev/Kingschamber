"use client";

interface ImageBackgroundProps {
  src: string;
  opacity?: number;
}

export default function ImageBackground({
  src,
  opacity = 0.15,
}: ImageBackgroundProps) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity,
        }}
      />
      <div className="absolute inset-0 bg-chamber-black/85" />
    </div>
  );
}
