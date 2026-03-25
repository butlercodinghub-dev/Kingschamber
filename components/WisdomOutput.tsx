"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WisdomResponse } from "@/types/wisdom";

interface WisdomOutputProps {
  response: WisdomResponse | null;
  isLoading: boolean;
  question?: string;
  onSave?: () => void;
  onRegenerate?: () => void;
}

export default function WisdomOutput({
  response,
  isLoading,
  question,
  onSave,
  onRegenerate,
}: WisdomOutputProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deepening, setDeepening] = useState(false);
  const [showOrigin, setShowOrigin] = useState(false);

  const handleGoDeeper = async () => {
    if (!response || deepening) return;
    setDeepening(true);
    try {
      const res = await fetch("/api/deeper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quote: response.quote,
          author: response.author,
          question: question || "",
        }),
      });
      const data = await res.json();
      setExpanded(data.expanded);
    } catch {
      setExpanded("The Chamber chooses not to elaborate.");
    } finally {
      setDeepening(false);
    }
  };

  // Reset state when response changes
  useEffect(() => {
    if (!response) {
      setExpanded(null);
      setShowOrigin(false);
    }
  }, [response]);

  return (
    <div className="w-full max-w-2xl mx-auto min-h-[200px] flex flex-col items-center justify-center">
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex gap-2"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-chamber-gold"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        )}

        {!isLoading && !response && (
          <motion.p
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="font-serif italic text-xl text-chamber-warm-white text-center"
          >
            Ask and the Chamber shall answer.
          </motion.p>
        )}

        {!isLoading && response && (
          <motion.div
            key="response"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="w-full text-center space-y-6"
          >
            <p className="font-serif italic text-2xl md:text-3xl text-chamber-warm-white leading-relaxed">
              &ldquo;{response.quote}&rdquo;
            </p>
            <p className="font-sans text-sm uppercase tracking-[0.2em] text-chamber-gold">
              — {response.author}
            </p>

            {/* Go Deeper expansion */}
            <AnimatePresence>
              {deepening && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center gap-2 pt-2"
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-chamber-gold/50"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                    />
                  ))}
                </motion.div>
              )}

              {expanded && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="pt-4 border-t border-chamber-gold/10"
                >
                  <p className="font-serif text-base md:text-lg text-chamber-warm-white/80 leading-relaxed italic">
                    {expanded}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reveal Origin */}
            <AnimatePresence>
              {showOrigin && response.sources && response.sources.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.6 }}
                  className="pt-4 space-y-4 border-t border-chamber-gold/10"
                >
                  <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-chamber-muted">
                    Source Wisdom
                  </p>
                  {response.sources.map((s, i) => (
                    <div key={i} className="text-left space-y-1">
                      <p className="font-serif text-sm text-chamber-warm-white/60 italic leading-relaxed">
                        &ldquo;{s.text}&rdquo;
                      </p>
                      <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-chamber-gold/50">
                        — {s.author}
                      </p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              {onSave && (
                <button
                  onClick={onSave}
                  className="text-xs uppercase tracking-widest text-chamber-muted hover:text-chamber-gold transition-colors duration-300 border border-chamber-muted/30 hover:border-chamber-gold/50 px-5 py-2"
                >
                  Save to Scroll
                </button>
              )}
              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="text-xs uppercase tracking-widest text-chamber-muted hover:text-chamber-gold transition-colors duration-300 border border-chamber-muted/30 hover:border-chamber-gold/50 px-5 py-2"
                >
                  Seek Again
                </button>
              )}
              {!expanded && !deepening && (
                <button
                  onClick={handleGoDeeper}
                  className="text-xs uppercase tracking-widest text-chamber-muted hover:text-chamber-gold transition-colors duration-300 border border-chamber-muted/30 hover:border-chamber-gold/50 px-5 py-2"
                >
                  Go Deeper
                </button>
              )}
              {response.sources && response.sources.length > 0 && (
                <button
                  onClick={() => setShowOrigin(!showOrigin)}
                  className="text-xs uppercase tracking-widest text-chamber-muted hover:text-chamber-gold transition-colors duration-300 border border-chamber-muted/30 hover:border-chamber-gold/50 px-5 py-2"
                >
                  {showOrigin ? "Hide Origin" : "Reveal Origin"}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
