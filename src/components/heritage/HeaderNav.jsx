import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookMarked, ChefHat, Landmark, Map, PenSquare, Home } from "lucide-react";

const TABS = [
  {
    id: "timeline",
    label: "Culture Map",
    icon: BookMarked,
    emoji: "🗺️",
    guide: "Trace the cultural evolution of rituals, foods, crafts, and legends from origin to 2035.",
  },
  {
    id: "story",
    label: "Share Your Story",
    icon: PenSquare,
    emoji: "📝",
    guide: "Store regional memories locally and build a living community archive.",
  },
  {
    id: "recipe",
    label: "Traditional Recipes",
    icon: ChefHat,
    emoji: "🍲",
    guide: "Rediscover forgotten dishes with cultural context, ingredients, and preparation.",
  },
  {
    id: "travel",
    label: "NRI Heritage Journeys",
    icon: Map,
    emoji: "✈️",
    guide: "Generate premium day-wise cultural itineraries for diaspora travelers returning to India.",
  },
];

export default function HeaderNav({ activeTab, setActiveTab, onMissionOpen }) {
  const [hoveredTab, setHoveredTab] = useState(null);

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-[#E6C697]/20">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">

          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("home")}
              aria-label="Go to StoryVault AI home"
              className="logo-spin-dual flex h-11 w-11 items-center justify-center overflow-hidden"
            >
              <img
                src="/sv-logo.png"
                alt="SV"
                className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(230,198,151,0.4)]"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextSibling.style.display = "flex";
                }}
              />
              <span
                className="font-heading text-base text-[#E6C697] hidden items-center justify-center w-full h-full"
                aria-hidden="true"
              >
                SV
              </span>
            </button>
            <div className="hidden sm:block">
              <h1 className="font-heading text-sm font-semibold tracking-wider text-[#E6C697]">
                StoryVault AI
              </h1>
              <p className="text-[10px] text-[#E6C697]/50 tracking-widest uppercase">
                Cultural Museum Experience
              </p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide">

            {/* Home link */}
            <div
              className="relative"
              onMouseEnter={() => setHoveredTab("home")}
              onMouseLeave={() => setHoveredTab(null)}
            >
              <button
                onClick={() => setActiveTab("home")}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 active:scale-95 ${
                  activeTab === null
                    ? "bg-[#E6C697]/15 text-[#E6C697] ring-1 ring-[#E6C697]/40 shadow-[0_0_12px_rgba(230,198,151,0.2)]"
                    : "text-[#E6C697]/50 hover:text-[#E6C697]/80 hover:bg-[#E6C697]/5"
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Home</span>
                {activeTab === null && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#E6C697] rounded-full"
                  />
                )}
              </button>

              <AnimatePresence>
                {hoveredTab === "home" && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-44"
                  >
                    <div className="bg-[#1a1610]/95 backdrop-blur-md border border-[#E6C697]/30 rounded-lg p-3 shadow-xl shadow-black/40">
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-[#1a1610]/95 border-t border-l border-[#E6C697]/30" />
                      <p className="text-[10px] text-[#E6C697]/70 leading-relaxed font-body">
                        🏛️ Return to the StoryVault landing page.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Feature tabs */}
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <div
                  key={tab.id}
                  className="relative"
                  onMouseEnter={() => setHoveredTab(tab.id)}
                  onMouseLeave={() => setHoveredTab(null)}
                >
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 active:scale-95 ${
                      isActive
                        ? "bg-[#E6C697]/15 text-[#E6C697] ring-1 ring-[#E6C697]/40 shadow-[0_0_12px_rgba(230,198,151,0.2)]"
                        : "text-[#E6C697]/50 hover:text-[#E6C697]/80 hover:bg-[#E6C697]/5"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden md:inline whitespace-nowrap">{tab.label}</span>
                    <span className="md:hidden">{tab.emoji}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#E6C697] rounded-full"
                      />
                    )}
                  </button>

                  <AnimatePresence>
                    {hoveredTab === tab.id && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-56"
                      >
                        <div className="bg-[#1a1610]/95 backdrop-blur-md border border-[#E6C697]/30 rounded-lg p-3 shadow-xl shadow-black/40">
                          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-[#1a1610]/95 border-t border-l border-[#E6C697]/30" />
                          <p className="text-[10px] text-[#E6C697]/70 leading-relaxed font-body">
                            <span className="mr-1">{tab.emoji}</span>
                            {tab.guide}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            <button
              onClick={onMissionOpen}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-[#E6C697]/50 hover:text-[#E6C697]/80 hover:bg-[#E6C697]/5 transition-all duration-300 active:scale-95"
            >
              <Landmark className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Mission</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
