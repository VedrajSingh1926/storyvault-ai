import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BookMarked, Pen, ChefHat, Map, Sparkles, ArrowRight,
  Palette, Music, Theater, BookOpen, Utensils, Globe
} from "lucide-react";

const MODULES = [
  {
    id: "timeline", icon: BookMarked, title: "Culture Map", emoji: "🗺️",
    desc: "Generate a visual cultural evolution map from origin to future across festivals, food, craft, music, stories, and heritage sites.",
    accent: "from-[#E6C697]/20 to-[#E6C697]/5", border: "border-[#E6C697]/20"
  },
  {
    id: "story", icon: Pen, title: "Share Your Story", emoji: "📝",
    desc: "Preserve family memory with a local community form for oral traditions, folklore, rituals, and regional stories.",
    accent: "from-[#06B6D4]/20 to-[#06B6D4]/5", border: "border-[#06B6D4]/20"
  },
  {
    id: "recipe", icon: ChefHat, title: "Traditional Recipe", emoji: "🍲",
    desc: "Discover forgotten regional dishes with origin stories, cultural context, local-language names, and traditional preparation.",
    accent: "from-amber-500/20 to-amber-500/5", border: "border-amber-500/20"
  },
  {
    id: "travel", icon: Map, title: "NRI Travel Planner", emoji: "✈️",
    desc: "Build premium day-wise heritage journeys connecting diaspora travelers with authentic places, food, and local culture in India.",
    accent: "from-[#06B6D4]/20 to-[#E6C697]/5", border: "border-[#06B6D4]/20"
  },
];

const CRAFT_ICONS = [Palette, Music, Theater, BookOpen, Utensils, Globe];

export default function HomeLanding({ onNavigate }) {
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      className="max-w-6xl mx-auto px-4 py-6 sm:py-12"
    >
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-[#E6C697]" />
          <span className="text-[10px] text-[#E6C697]/50 font-heading tracking-[0.25em] uppercase">
            Multi-generational Preservation
          </span>
          <Sparkles className="w-5 h-5 text-[#E6C697]" />
        </div>

        <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl text-[#E6C697] tracking-wider mb-3 leading-tight">
          StoryVault AI
        </h1>

        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#E6C697]/60 to-transparent mx-auto mb-4" />

        <p className="text-sm sm:text-base text-[#E6C697]/60 font-display italic max-w-2xl mx-auto leading-relaxed">
          Transmission of heritage. Preservation of endangered cultural memory.
          <br className="hidden sm:block" />
          Reimagined through AI-assisted storytelling, food, and diaspora journeys.
        </p>
      </motion.div>

      {/* Guiding Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-center mb-8 sm:mb-12"
      >
        <div className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-3 px-5 py-3 rounded-2xl border border-[#E6C697]/20 bg-[#E6C697]/5">
          <p className="text-xs sm:text-sm text-[#E6C697]/80 font-medium">
            Select a gallery below to begin your heritage journey
          </p>
          <ArrowRight className="hidden sm:block w-4 h-4 text-[#E6C697] animate-pulse" />
        </div>
      </motion.div>

      {/* Macro Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 max-w-4xl mx-auto">
        {MODULES.map((mod, i) => {
          const Icon = mod.icon;
          const CraftIcon = CRAFT_ICONS[i % CRAFT_ICONS.length];
          return (
            <motion.button
              key={mod.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              onMouseEnter={() => setHoveredCard(mod.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => onNavigate(mod.id)}
              className={`group relative overflow-hidden rounded-2xl border ${mod.border} bg-gradient-to-br ${mod.accent} p-5 sm:p-6 text-left transition-all duration-500 active:scale-[0.97] hover:shadow-[0_0_30px_rgba(230,198,151,0.08)]`}
            >
              {/* Background icon */}
              <CraftIcon className="absolute -right-4 -bottom-4 w-24 h-24 text-[#E6C697]/3 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
                    hoveredCard === mod.id ? "bg-[#E6C697]/20 scale-110" : "bg-[#E6C697]/10"
                  }`}>
                    <Icon className={`w-5 h-5 transition-colors duration-500 ${
                      hoveredCard === mod.id ? "text-[#E6C697]" : "text-[#E6C697]/60"
                    }`} />
                  </div>
                  <div>
                    <span className="text-lg mr-2">{mod.emoji}</span>
                    <h3 className="font-heading text-sm sm:text-base text-[#E6C697] tracking-wider inline">
                      {mod.title}
                    </h3>
                  </div>
                </div>

                <p className="text-[11px] sm:text-xs text-[#E6C697]/50 leading-relaxed pl-[52px]">
                  {mod.desc}
                </p>

                <div className={`flex items-center gap-1.5 mt-4 pl-[52px] text-[10px] font-medium transition-all duration-300 ${
                  hoveredCard === mod.id ? "text-[#E6C697] translate-x-1" : "text-[#E6C697]/30"
                }`}>
                  Explore Module
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Footer quote */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        className="text-center mt-10 sm:mt-14 text-[10px] text-[#E6C697]/20 font-display italic"
      >
        "Every tradition preserved today becomes a living inheritance for tomorrow."
      </motion.p>
    </motion.div>
  );
}
