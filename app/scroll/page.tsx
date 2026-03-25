"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import ImageBackground from "@/components/ImageBackground";
import GoldDivider from "@/components/ui/GoldDivider";
import HomeButton from "@/components/ui/HomeButton";
import ScrollView from "@/components/ScrollView";

export default function ScrollPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-start justify-start overflow-hidden px-6 py-24">
      <ImageBackground src="/chamber.jpg" opacity={0.08} />
      <HomeButton />

      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 1 }}
          className="text-center space-y-4"
        >
          <p className="font-sans text-xs uppercase tracking-[0.4em] text-chamber-gold">
            Your Scroll
          </p>
          <GoldDivider />
        </motion.div>

        {/* Saved quotes */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <ScrollView />
        </motion.div>

        {/* Back link */}
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
