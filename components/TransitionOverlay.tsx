"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function TransitionOverlay() {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);

  useEffect(() => {
    if (pathname !== prevPath) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setPrevPath(pathname);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [pathname, prevPath]);

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          key="transition"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] bg-chamber-black pointer-events-none"
        />
      )}
    </AnimatePresence>
  );
}
