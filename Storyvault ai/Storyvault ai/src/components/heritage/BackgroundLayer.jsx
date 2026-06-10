import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function BackgroundLayer({ showVideo, isHome }) {
  return (
    <div className="fixed inset-0 z-0">
      <AnimatePresence mode="wait">
        {isHome ? (
          <motion.div
            key="home-video"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover z-0"
              src="/heritage-hero.mp4"
            />
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/70 via-[#0d0a06]/80 to-[#0d0d0c]" />
            <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
          </motion.div>
        ) : showVideo ? (
          <motion.div
            key="video"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(230,198,151,0.16),_transparent_35%),radial-gradient(circle_at_80%_20%,_rgba(6,182,212,0.18),_transparent_28%),linear-gradient(145deg,_rgba(31,24,17,0.95),_rgba(13,13,12,1))]" />
            <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,rgba(230,198,151,0.09)_1px,transparent_1px),linear-gradient(to_bottom,rgba(230,198,151,0.09)_1px,transparent_1px)] [background-size:4rem_4rem]" />
            <div className="absolute left-[8%] top-[12%] h-56 w-56 rounded-full bg-[#E6C697]/10 blur-3xl" />
            <div className="absolute bottom-[8%] right-[10%] h-64 w-64 rounded-full bg-[#06B6D4]/10 blur-3xl" />
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 matrix-grid-bg"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0c] via-transparent to-[#0d0d0c] opacity-40" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
