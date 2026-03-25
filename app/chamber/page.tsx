"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import ImageBackground from "@/components/ImageBackground";
import GoldDivider from "@/components/ui/GoldDivider";
import HomeButton from "@/components/ui/HomeButton";
import ChamberInput from "@/components/ChamberInput";
import WisdomOutput from "@/components/WisdomOutput";
import { WisdomResponse } from "@/types/wisdom";
import { useSavedQuotes } from "@/components/ScrollView";

export default function Chamber() {
  const [response, setResponse] = useState<WisdomResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastQuestion, setLastQuestion] = useState("");
  const [saved, setSaved] = useState(false);
  const { saveQuote } = useSavedQuotes();

  const handleAsk = async (question: string) => {
    setIsLoading(true);
    setResponse(null);
    setSaved(false);
    setLastQuestion(question);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setResponse(data);
    } catch {
      setResponse({
        quote: "The Chamber is silent. Seek again.",
        author: "Council of Kings",
        theme: "patience",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!response) return;
    await saveQuote({
      quote: response.quote,
      author: response.author,
      theme: response.theme,
    });
    setSaved(true);
  };

  const handleRegenerate = () => {
    if (lastQuestion) handleAsk(lastQuestion);
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 py-20">
      <ImageBackground src="/chamber.jpg" opacity={0.10} />
      <HomeButton />

      {/* Scroll link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="fixed top-5 right-5 z-50 flex gap-6"
      >
        <Link
          href="/brothers"
          className="font-sans text-xs uppercase tracking-[0.3em] text-chamber-muted hover:text-chamber-gold transition-colors duration-300"
        >
          Brotherhood
        </Link>
        <Link
          href="/scroll"
          className="font-sans text-xs uppercase tracking-[0.3em] text-chamber-muted hover:text-chamber-gold transition-colors duration-300"
        >
          My Scroll
        </Link>
      </motion.div>

      <div className="relative z-10 flex flex-col items-center gap-10 w-full max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="text-center space-y-1"
        >
          <p className="font-sans text-xs uppercase tracking-[0.4em] text-chamber-gold">
            King&apos;s Chamber
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="w-full"
        >
          <GoldDivider />
        </motion.div>

        {/* Wisdom output */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 1 }}
          className="w-full"
        >
          <WisdomOutput
            response={response}
            isLoading={isLoading}
            question={lastQuestion}
            onSave={response && !saved ? handleSave : undefined}
            onRegenerate={response ? handleRegenerate : undefined}
          />
          {saved && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-xs text-chamber-gold/60 mt-3 tracking-widest uppercase"
            >
              Saved to your scroll
            </motion.p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="w-full"
        >
          <GoldDivider />
        </motion.div>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="w-full"
        >
          <ChamberInput onSubmit={handleAsk} isLoading={isLoading} />
        </motion.div>
      </div>
    </main>
  );
}
