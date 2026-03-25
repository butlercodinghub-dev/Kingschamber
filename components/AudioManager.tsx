"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";

export default function AudioManager() {
  const pathname = usePathname();
  const entranceRef = useRef<HTMLAudioElement>(null);
  const chamberRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isInChamber = pathname !== "/";

  const crossfade = useCallback(
    (toChamber: boolean) => {
      if (!entranceRef.current || !chamberRef.current) return;
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

      const fadingOut = toChamber ? entranceRef.current : chamberRef.current;
      const fadingIn = toChamber ? chamberRef.current : entranceRef.current;

      fadingIn.volume = 0;
      if (!muted) {
        fadingIn.play().catch(() => {});
      }

      let vol = fadingOut.volume;
      fadeIntervalRef.current = setInterval(() => {
        vol = Math.max(0, vol - 0.05);
        fadingOut.volume = vol;
        fadingIn.volume = Math.min(1, 1 - vol);
        if (vol <= 0) {
          clearInterval(fadeIntervalRef.current!);
          fadingOut.pause();
          fadingOut.volume = 1;
        }
      }, 150);
    },
    [muted]
  );

  // Try to autoplay entrance music immediately on mount
  useEffect(() => {
    if (started || !entranceRef.current) return;
    if (muted) return;

    const audio = entranceRef.current;
    audio.play().then(() => {
      setStarted(true);
    }).catch(() => {
      // Autoplay blocked — fall back to first interaction
    });
  }, [muted, started]);

  const handleFirstInteraction = useCallback(() => {
    if (!entranceRef.current || started) return;
    setStarted(true);
    if (!muted) {
      entranceRef.current.play().catch(() => {});
    }
    document.removeEventListener("click", handleFirstInteraction);
  }, [started, muted]);

  useEffect(() => {
    if (started) return;
    document.addEventListener("click", handleFirstInteraction);
    return () => document.removeEventListener("click", handleFirstInteraction);
  }, [handleFirstInteraction, started]);

  useEffect(() => {
    if (!started) return;
    crossfade(isInChamber);
  }, [isInChamber, started, crossfade]);

  useEffect(() => {
    if (entranceRef.current) entranceRef.current.muted = muted;
    if (chamberRef.current) chamberRef.current.muted = muted;
  }, [muted]);

  return (
    <>
      <audio ref={entranceRef} src="/entrance-music.mp3" loop preload="auto" />
      <audio ref={chamberRef} src="/chamber-music.mp3" loop preload="none" />

      <button
        onClick={() => {
          const next = !muted;
          setMuted(next);
          if (typeof window !== "undefined") {
            localStorage.setItem("kc-muted", String(next));
          }
        }}
        className="fixed bottom-5 left-5 z-50 w-8 h-8 flex items-center justify-center text-chamber-muted hover:text-chamber-gold transition-colors duration-300"
        title={muted ? "Unmute" : "Mute"}
        aria-label={muted ? "Unmute music" : "Mute music"}
      >
        {muted ? (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
        )}
      </button>
    </>
  );
}
