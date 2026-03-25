"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function EntryScreen() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fadingOut, setFadingOut] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = 8 / 12;

    // Start fading to black 3 seconds before video ends
    const checkFade = () => {
      if (video.duration && video.currentTime >= video.duration - 3) {
        setFadingOut(true);
      }
    };
    video.addEventListener("timeupdate", checkFade);
    return () => video.removeEventListener("timeupdate", checkFade);
  }, []);

  const handleVideoEnd = () => {
    // Delay content appearance to let black hold for a moment
    setTimeout(() => {
      setIntroComplete(true);
    }, 1500);
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Full-screen video layer */}
      <div className="fixed inset-0 z-[1]">
        {/* Black base */}
        <div className="absolute inset-0 bg-black" />

        {/* Entrance video */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnd}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[3000ms] ease-in-out"
          style={{ opacity: fadingOut ? 0 : 1 }}
        >
          <source src="/entrance.mp4" type="video/mp4" />
        </video>

        {/* Entrance image (fades in slowly after intro) */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-[3000ms] ease-in-out"
          style={{
            backgroundImage: "url(/entrance.jpg)",
            opacity: introComplete ? 0.15 : 0,
          }}
        />

        {/* Dark overlay */}
        <div
          className="absolute inset-0 bg-black transition-opacity duration-[2500ms] ease-in-out"
          style={{ opacity: introComplete ? 0.85 : 0 }}
        />
      </div>

      {/* Content — slow fade in after black hold */}
      <div
        className="relative z-[2] flex flex-col items-center justify-center gap-10 px-6 text-center max-w-2xl transition-opacity duration-[2500ms] ease-in-out"
        style={{
          opacity: introComplete ? 1 : 0,
          pointerEvents: introComplete ? "auto" : "none",
        }}
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={introComplete ? { opacity: 1 } : {}}
          transition={{ delay: 0.8, duration: 2.0 }}
        >
          <Image
            src="/logo.png"
            alt="King's Chamber"
            width={80}
            height={80}
            priority
            className="rounded-full"
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={introComplete ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.5, duration: 1.5, ease: "easeOut" }}
          className="font-serif text-5xl md:text-7xl text-chamber-warm-white tracking-wide"
        >
          King&apos;s Chamber
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={introComplete ? { opacity: 1 } : {}}
          transition={{ delay: 2.5, duration: 1.5 }}
          className="font-serif italic text-lg md:text-xl text-chamber-gold/80 tracking-wide"
        >
          The words have already been spoken. Enter, and seek.
        </motion.p>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={introComplete ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ delay: 3.5, duration: 1.0 }}
          className="w-40 gold-rule"
        />

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={introComplete ? { opacity: 1 } : {}}
          transition={{ delay: 4.0, duration: 1.0 }}
          onClick={() => router.push("/daily")}
          className="text-xs uppercase tracking-[0.4em] text-chamber-gold border border-chamber-gold/50 hover:border-chamber-gold hover:bg-chamber-gold/5 px-10 py-4 transition-all duration-500"
        >
          Enter the Chamber
        </motion.button>
      </div>
    </main>
  );
}
