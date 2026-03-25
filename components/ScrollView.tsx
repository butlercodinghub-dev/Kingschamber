"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SavedQuote } from "@/types/wisdom";
import GoldDivider from "./ui/GoldDivider";

const STORAGE_KEY = "kings-chamber-scroll";

export function useSavedQuotes() {
  const getQuotes = (): SavedQuote[] => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  };

  const saveQuote = (quote: Omit<SavedQuote, "id" | "saved_at">) => {
    const quotes = getQuotes();
    const newQuote: SavedQuote = {
      ...quote,
      id: crypto.randomUUID(),
      saved_at: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([newQuote, ...quotes]));
  };

  const removeQuote = (id: string) => {
    const quotes = getQuotes().filter((q) => q.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
  };

  return { getQuotes, saveQuote, removeQuote };
}

export default function ScrollView() {
  const [quotes, setQuotes] = useState<SavedQuote[]>([]);
  const { getQuotes, removeQuote } = useSavedQuotes();

  useEffect(() => {
    setQuotes(getQuotes());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemove = (id: string) => {
    removeQuote(id);
    setQuotes(getQuotes());
  };

  if (quotes.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="font-serif italic text-xl text-chamber-warm-white/40">
          Your scroll is empty.
        </p>
        <p className="font-sans text-xs uppercase tracking-widest text-chamber-muted mt-3">
          Seek wisdom in the Chamber
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <AnimatePresence>
        {quotes.map((q, i) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: i * 0.05 }}
            className="group relative"
          >
            <div className="space-y-3">
              <p className="font-serif italic text-xl text-chamber-warm-white leading-relaxed">
                &ldquo;{q.quote}&rdquo;
              </p>
              <div className="flex items-center justify-between">
                <p className="font-sans text-xs uppercase tracking-[0.2em] text-chamber-gold">
                  — {q.author}
                </p>
                <div className="flex items-center gap-4">
                  <span className="font-sans text-xs text-chamber-muted/50">
                    {new Date(q.saved_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <button
                    onClick={() => handleRemove(q.id)}
                    className="opacity-0 group-hover:opacity-100 text-chamber-muted hover:text-chamber-gold transition-all duration-300 text-xs"
                    aria-label="Remove quote"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
            {i < quotes.length - 1 && <GoldDivider className="mt-8" />}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
