import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BookMarked, Pen, ChefHat, Map, ArrowRight,
  Palette, Music, Theater, BookOpen, Utensils, Globe
} from "lucide-react";

const MODULES = [
  {
    id: "timeline", icon: BookMarked, title: "Culture Map", emoji: "🗺️",
    desc: "Visual cultural evolution from origin to 2035 across festivals, food, craft, and heritage sites.",
    accent: "from-[#E6C697]/15 to-[#E6C697]/3", border: "border-[#E6C697]/20",
    glow: "hover:shadow-[0_0_40px_rgba(230,198,151,0.12)]",
  },
  {
    id: "story", icon: Pen, title: "Share Your Story", emoji: "📝",
    desc: "Preserve family memory with oral traditions, folklore, rituals, and regional stories.",
    accent: "from-[#06B6D4]/15 to-[#06B6D4]/3", border: "border-[#06B6D4]/20",
    glow: "hover:shadow-[0_0_40px_rgba(6,182,212,0.12)]",
  },
  {
    id: "recipe", icon: ChefHat, title: "Traditional Recipe", emoji: "🍲",
    desc: "Discover forgotten regional dishes with cultural context, local-language names, and preparation.",
    accent: "from-amber-500/15 to-amber-500/3", border: "border-amber-500/20",
    glow: "hover:shadow-[0_0_40px_rgba(245,158,11,0.12)]",
  },
  {
    id: "travel", icon: Map, title: "NRI Travel Planner", emoji: "✈️",
    desc: "Premium day-wise heritage journeys connecting diaspora travelers with authentic India.",
    accent: "from-[#06B6D4]/15 to-[#E6C697]/3", border: "border-[#06B6D4]/20",
    glow: "hover:shadow-[0_0_40px_rgba(6,182,212,0.1)]",
  },
];

const CRAFT_ICONS = [Palette, Music, Theater, BookOpen, Utensils, Globe];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export default function HomeLanding({ onNavigate }) {
  const [hoveredCard, setHoveredCard] = useState(null);

  function scrollToGallery() {
    document.getElementById("module-gallery")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Cinematic Hero ─────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-[80vh] pt-16 pb-10 px-6 text-center overflow-hidden">
        {/* Horizontal rule accent top */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent via-[#E6C697]/40 to-transparent"
        />

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="relative z-10 flex flex-col items-center gap-5 max-w-4xl"
        >
          {/* Logo hourglass */}
          <motion.div variants={fadeUp} className="mb-2">
            <img
              src="/sv-logo.png"
              alt="StoryVault AI"
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-[0_0_32px_rgba(230,198,151,0.45)]"
            />
          </motion.div>

          {/* Eyebrow */}
          <motion.p
            variants={fadeUp}
            className="text-[9px] sm:text-[10px] tracking-[0.35em] uppercase text-[#E6C697]/55 font-heading"
          >
            Multi-generational Preservation
          </motion.p>

          {/* Main headline */}
          <motion.h1
            variants={fadeUp}
            className="font-heading text-4xl sm:text-6xl md:text-7xl text-[#E6C697] tracking-[0.08em] leading-[1.1] drop-shadow-[0_4px_32px_rgba(0,0,0,0.9)]"
            style={{ textShadow: "0 2px 40px rgba(0,0,0,0.8), 0 0 80px rgba(0,0,0,0.5)" }}
          >
            Bridges of Time:
            <br />
            <span className="text-[#E6C697]/75 text-3xl sm:text-5xl md:text-6xl tracking-[0.12em]">
              Your Heritage, Reimagined
            </span>
          </motion.h1>

          {/* Divider */}
          <motion.div
            variants={fadeUp}
            className="w-32 h-px bg-gradient-to-r from-transparent via-[#E6C697]/60 to-transparent"
          />

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            className="text-sm sm:text-base md:text-lg text-[#E6C697]/65 font-display italic max-w-2xl leading-relaxed tracking-wide"
            style={{ textShadow: "0 1px 20px rgba(0,0,0,0.9)" }}
          >
            Preserving the soul of generations through AI-powered storytelling,
            <br className="hidden sm:block" />
            immersive cultural maps, and forgotten culinary archives.
          </motion.p>

          {/* CTA */}
          <motion.button
            variants={fadeUp}
            type="button"
            onClick={scrollToGallery}
            className="mt-2 inline-flex items-center gap-2.5 px-6 py-3 rounded-full border border-[#E6C697]/25 bg-[#E6C697]/8 backdrop-blur-sm text-[#E6C697]/80 text-xs tracking-widest font-heading uppercase transition-all duration-300 hover:bg-[#E6C697]/15 hover:border-[#E6C697]/45 hover:text-[#E6C697] active:scale-95 cursor-pointer"
          >
            <span>Select a gallery below</span>
            <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
          </motion.button>
        </motion.div>

        {/* Bottom fade into cards section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0d0d0c] to-transparent pointer-events-none" />
      </section>

      {/* ── Module Cards ───────────────────────────────────────────────── */}
      <section id="module-gallery" className="relative z-10 bg-[#0d0d0c] px-4 pb-16 pt-2">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 max-w-4xl mx-auto"
        >
          {MODULES.map((mod, i) => {
            const Icon = mod.icon;
            const CraftIcon = CRAFT_ICONS[i % CRAFT_ICONS.length];
            const isHovered = hoveredCard === mod.id;
            return (
              <motion.button
                key={mod.id}
                variants={fadeUp}
                onMouseEnter={() => setHoveredCard(mod.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => onNavigate(mod.id)}
                className={`group relative overflow-hidden rounded-2xl border ${mod.border} bg-gradient-to-br ${mod.accent} backdrop-blur-sm p-5 sm:p-6 text-left transition-all duration-500 active:scale-[0.97] ${mod.glow}`}
              >
                <CraftIcon className="absolute -right-4 -bottom-4 w-28 h-28 text-[#E6C697]/4 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12" />

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
                      isHovered ? "bg-[#E6C697]/20 scale-110" : "bg-[#E6C697]/8"
                    }`}>
                      <Icon className={`w-5 h-5 transition-colors duration-500 ${
                        isHovered ? "text-[#E6C697]" : "text-[#E6C697]/55"
                      }`} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{mod.emoji}</span>
                      <h3 className="font-heading text-sm sm:text-base text-[#E6C697] tracking-wider">
                        {mod.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-[11px] sm:text-xs text-[#E6C697]/45 leading-relaxed pl-[52px]">
                    {mod.desc}
                  </p>

                  <div className={`flex items-center gap-1.5 mt-4 pl-[52px] text-[10px] font-medium tracking-wider transition-all duration-300 ${
                    isHovered ? "text-[#E6C697] translate-x-1" : "text-[#E6C697]/25"
                  }`}>
                    Explore Module
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Footer quote */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-12 text-[10px] text-[#E6C697]/18 font-display italic tracking-widest"
        >
          "Every tradition preserved today becomes a living inheritance for tomorrow."
        </motion.p>
      </section>
    </div>
  );
}
