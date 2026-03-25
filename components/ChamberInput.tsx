"use client";

import { useState, FormEvent } from "react";

interface ChamberInputProps {
  onSubmit: (question: string) => void;
  isLoading: boolean;
}

export default function ChamberInput({ onSubmit, isLoading }: ChamberInputProps) {
  const [question, setQuestion] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    if (!q || isLoading) return;
    onSubmit(q);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div className="flex flex-col gap-4 items-center">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What wisdom do you seek?"
          maxLength={300}
          disabled={isLoading}
          className="w-full bg-transparent border-b border-chamber-muted/50 focus:border-chamber-gold text-chamber-warm-white font-serif text-lg text-center placeholder:text-chamber-muted/50 placeholder:italic py-3 transition-colors duration-300 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!question.trim() || isLoading}
          className="text-xs uppercase tracking-[0.3em] text-chamber-gold border border-chamber-gold/40 hover:border-chamber-gold hover:bg-chamber-gold/5 px-8 py-3 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isLoading ? "Seeking..." : "Seek"}
        </button>
      </div>
    </form>
  );
}
