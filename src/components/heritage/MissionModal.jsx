import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Globe, Users, Sparkles } from "lucide-react";

const PILLARS = [
  { icon: Heart, title: "Preserve", desc: "Safeguard endangered art forms, oral traditions, and ancestral knowledge systems from extinction." },
  { icon: Users, title: "Transmit", desc: "Bridge multi-generational gaps by creating digital pathways for heritage transfer to younger communities." },
  { icon: Globe, title: "Scale", desc: "Amplify local artisans globally through diaspora networks, connecting masters to markets worldwide." },
  { icon: Sparkles, title: "Innovate", desc: "Leverage AI-driven tools to reconstruct forgotten recipes, map cultural corridors, and forecast preservation needs." },
];

export default function MissionModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg glass-panel border border-[#E6C697]/30 rounded-2xl p-6 sm:p-8 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[#E6C697]/40 hover:text-[#E6C697] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <h2 className="font-heading text-2xl text-[#E6C697] tracking-wider mb-2">
                Our Mission
              </h2>
              <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#E6C697]/60 to-transparent mx-auto mb-3" />
              <p className="text-xs text-[#E6C697]/50 font-display italic">
                "Multi-generational preservation, transmission of heritage, and scaling local arts."
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PILLARS.map((p, i) => {
                const Icon = p.icon;
                return (
                  <motion.div
                    key={p.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="border border-[#E6C697]/15 rounded-xl p-4 bg-[#E6C697]/5 hover:bg-[#E6C697]/10 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-[#E6C697] mb-2" />
                    <h3 className="font-heading text-sm text-[#E6C697] mb-1">{p.title}</h3>
                    <p className="text-[10px] text-[#E6C697]/50 leading-relaxed">{p.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}