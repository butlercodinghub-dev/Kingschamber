"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SavedQuote } from "@/types/wisdom";
import GoldDivider from "./ui/GoldDivider";

export function useSavedQuotes() {
  const saveQuote = async (quote: Omit<SavedQuote, "id" | "saved_at">) => {
    await fetch("/api/scroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote),
    });
  };

  const removeQuote = async (id: string) => {
    await fetch(`/api/scroll?id=${id}`, { method: "DELETE" });
  };

  return { saveQuote, removeQuote };
}

export default function ScrollView() {
  const [quotes, setQuotes] = useState<SavedQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const { removeQuote } = useSavedQuotes();

  const fetchQuotes = useCallback(async () => {
    try {
      const res = await fetch("/api/scroll");
      const data = await res.json();
      setQuotes(data);
    } catch {
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const handleRemove = async (id: string) => {
    await removeQuote(id);
    setQuotes((prev) => prev.filter((q) => q.id !== id));
  };

  if (loading) {
    return (
      <div className="flex justify-center gap-2 py-20">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-chamber-gold"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}
      </div>
    );
  }

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
