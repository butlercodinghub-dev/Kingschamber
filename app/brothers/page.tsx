"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import ImageBackground from "@/components/ImageBackground";
import GoldDivider from "@/components/ui/GoldDivider";
import HomeButton from "@/components/ui/HomeButton";

interface Brother {
  name: string;
  displayName: string;
  slug: string;
  wisdomCount: number;
  dominantThemes: { theme: string; count: number }[];
  topQuotes: string[];
}

export default function BrothersPage() {
  const [brothers, setBrothers] = useState<Brother[]>([]);
  const [totalWisdom, setTotalWisdom] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedBrother, setSelectedBrother] = useState<Brother | null>(null);

  useEffect(() => {
    fetch("/api/brothers")
      .then((r) => r.json())
      .then((data) => {
        setBrothers(data.brothers || []);
        setTotalWisdom(data.totalWisdom || 0);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="relative min-h-screen flex flex-col items-start justify-start overflow-hidden px-6 py-24">
      <ImageBackground src="/chamber.jpg" opacity={0.08} />
      <HomeButton />

      {/* Back to Chamber */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 1 }}
        className="fixed top-5 right-5 z-50"
      >
        <Link
          href="/chamber"
          className="font-sans text-xs uppercase tracking-[0.3em] text-chamber-muted hover:text-chamber-gold transition-colors duration-300"
        >
          Enter Chamber
        </Link>
      </motion.div>

      <div className="relative z-10 w-full max-w-3xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 1 }}
          className="text-center space-y-3"
        >
          <p className="font-sans text-xs uppercase tracking-[0.4em] text-chamber-gold">
            The Brotherhood
          </p>
          <p className="font-serif italic text-lg text-chamber-warm-white/50">
            {totalWisdom.toLocaleString()} words of wisdom from{" "}
            {brothers.length} kings
          </p>
          <GoldDivider />
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center gap-2 py-20">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-chamber-gold"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.4,
                }}
              />
            ))}
          </div>
        )}

        {/* Brothers grid */}
        {!loading && !selectedBrother && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {brothers.map((brother, i) => (
              <motion.button
                key={brother.slug}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.05, duration: 0.5 }}
                onClick={() => setSelectedBrother(brother)}
                className="group text-left p-6 border border-chamber-gold/10 hover:border-chamber-gold/40 transition-all duration-500 bg-black/20 hover:bg-black/40"
              >
                <p className="font-sans text-sm uppercase tracking-[0.2em] text-chamber-gold group-hover:text-chamber-gold transition-colors">
                  {brother.displayName}
                </p>
                <p className="font-sans text-xs text-chamber-muted mt-2">
                  {brother.wisdomCount} wisdom units
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {brother.dominantThemes.slice(0, 3).map((t) => (
                    <span
                      key={t.theme}
                      className="font-sans text-[10px] uppercase tracking-wider text-chamber-muted/60 border border-chamber-muted/15 px-2 py-0.5"
                    >
                      {t.theme}
                    </span>
                  ))}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Brother detail view */}
        {selectedBrother && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <button
              onClick={() => setSelectedBrother(null)}
              className="font-sans text-xs uppercase tracking-[0.3em] text-chamber-muted hover:text-chamber-gold transition-colors duration-300"
            >
              &larr; All Brothers
            </button>

            <div className="text-center space-y-2">
              <h2 className="font-sans text-lg uppercase tracking-[0.3em] text-chamber-gold">
                {selectedBrother.displayName}
              </h2>
              <p className="font-sans text-xs text-chamber-muted">
                {selectedBrother.wisdomCount} wisdom units contributed
              </p>
            </div>

            {/* Dominant themes */}
            <div className="space-y-3">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-chamber-muted">
                Dominant Themes
              </p>
              <div className="space-y-2">
                {selectedBrother.dominantThemes.map((t) => {
                  const maxCount = selectedBrother.dominantThemes[0]?.count || 1;
                  const pct = Math.round((t.count / maxCount) * 100);
                  return (
                    <div key={t.theme} className="flex items-center gap-3">
                      <span className="font-sans text-xs text-chamber-warm-white/70 w-24 capitalize">
                        {t.theme}
                      </span>
                      <div className="flex-1 h-1 bg-chamber-gold/10 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className="h-full bg-chamber-gold/50"
                        />
                      </div>
                      <span className="font-sans text-[10px] text-chamber-muted w-8 text-right">
                        {t.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <GoldDivider />

            {/* Top quotes */}
            <div className="space-y-6">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-chamber-muted">
                Notable Wisdom
              </p>
              {selectedBrother.topQuotes.map((q, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                >
                  <p className="font-serif italic text-base text-chamber-warm-white/70 leading-relaxed">
                    &ldquo;{q}&rdquo;
                  </p>
                  {i < selectedBrother.topQuotes.length - 1 && (
                    <div className="border-b border-chamber-gold/5 mt-6" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Back to chamber link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-center pt-8"
        >
          <Link
            href="/chamber"
            className="font-sans text-xs uppercase tracking-[0.3em] text-chamber-muted hover:text-chamber-gold transition-colors duration-300"
          >
            Return to the Chamber
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
