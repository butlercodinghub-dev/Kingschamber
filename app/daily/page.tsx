"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import ImageBackground from "@/components/ImageBackground";
import GoldDivider from "@/components/ui/GoldDivider";
import HomeButton from "@/components/ui/HomeButton";
import { WisdomResponse } from "@/types/wisdom";

export default function DailyWisdom() {
  const router = useRouter();
  const [wisdom, setWisdom] = useState<WisdomResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/daily")
      .then((r) => r.json())
      .then((data) => {
        setWisdom(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">
      <ImageBackground src="/chamber.jpg" opacity={0.12} />
      <HomeButton />

      <div className="relative z-10 flex flex-col items-center gap-10 text-center max-w-2xl w-full">
        {/* Label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="font-sans text-xs uppercase tracking-[0.4em] text-chamber-gold"
        >
          Today&apos;s Wisdom
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="w-full"
        >
          <GoldDivider />
        </motion.div>

        {/* Quote */}
        <div className="min-h-[150px] flex flex-col items-center justify-center gap-6 w-full">
          {loading && (
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-chamber-gold"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                />
              ))}
            </div>
          )}

          {!loading && wisdom && (
            <>
              <motion.blockquote
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
                className="font-serif italic text-2xl md:text-4xl text-chamber-warm-white leading-relaxed"
              >
                &ldquo;{wisdom.quote}&rdquo;
              </motion.blockquote>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6, duration: 0.8 }}
                className="font-sans text-sm uppercase tracking-[0.25em] text-chamber-gold"
              >
                — {wisdom.author}
              </motion.p>
            </>
          )}

          {!loading && !wisdom && (
            <p className="font-serif italic text-xl text-chamber-warm-white/40">
              The Chamber is preparing its wisdom.
            </p>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="w-full"
        >
          <GoldDivider />
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.8 }}
          onClick={() => router.push("/chamber")}
          className="text-xs uppercase tracking-[0.4em] text-chamber-gold border border-chamber-gold/40 hover:border-chamber-gold hover:bg-chamber-gold/5 px-10 py-4 transition-all duration-500"
        >
          Enter the Chamber
        </motion.button>
      </div>
    </main>
  );
}
