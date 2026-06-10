import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, ScrollText } from "lucide-react";
import { AI_CONFIG, assertGeminiApiKey } from "@/config/ai";

const SUGGESTED_PROMPTS = [
  "Suggest a forgotten Indian recipe to explore",
  "Tell me about a cultural tradition from Rajasthan",
  "Help me plan a heritage trip to Varanasi",
  "What's the history behind Ghoomar dance?",
];

const SYSTEM_PROMPT = [
  "You are Vedaa, the Heritage Sentinel for StoryVault AI — an ancient-knowledge-infused AI curator dedicated to preserving oral histories and cultural memory.",
  "You safely catalog oral histories, forgotten traditions, regional cuisines, folk music, historical timelines, festivals, and diaspora journeys across India.",
  "Keep answers concise (2-4 sentences), warm, evocative, and poetic in tone — as if wisdom is being passed down through generations.",
  "When relevant, gently suggest which StoryVault module (Culture Map, Traditional Recipe, NRI Travel Planner, or Share Your Story) the user can visit for a deeper experience.",
  "Respond only about cultural heritage topics. If asked about unrelated topics, politely redirect to heritage discovery.",
].join(" ");

async function askVedaa(userMessage) {
  assertGeminiApiKey();
  const response = await fetch(
    `${AI_CONFIG.gemini.apiUrl}?key=${AI_CONFIG.gemini.apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          role: "system",
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
        generationConfig: {
          temperature: 0.65,
          topP: 0.9,
          maxOutputTokens: 320,
        },
      }),
    }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "Vedaa could not respond right now.");
  }
  return (
    data?.candidates?.[0]?.content?.parts?.map((p) => p?.text ?? "").join("").trim() ||
    "I could not retrieve an answer. Please try again."
  );
}

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "vedaa",
      text: "I am Vedaa, Guardian of Echoes. How may I help archive your legacy today?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [fabHovered, setFabHovered] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, messages]);

  async function handleSend(text) {
    const query = (text || input).trim();
    if (!query || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: query }]);
    setLoading(true);
    try {
      const reply = await askVedaa(query);
      setMessages((prev) => [...prev, { role: "vedaa", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "vedaa",
          text: "The echoes are faint right now. Please try again in a moment.",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* ── Chat Panel ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-28 right-4 sm:right-6 z-[9998] w-[calc(100vw-2rem)] max-w-sm flex flex-col rounded-2xl border border-[#E6C697]/25 bg-[#110e08]/95 backdrop-blur-xl shadow-[0_24px_64px_rgba(0,0,0,0.7),0_0_0_1px_rgba(230,198,151,0.08)] overflow-hidden"
            style={{ maxHeight: "min(520px, calc(100vh - 130px))" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E6C697]/15 bg-[#1a1610]/60">
              <div className="flex items-center gap-2.5">
                <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-[#E6C697]/20 to-[#E6C697]/5 border border-[#E6C697]/20">
                  <ScrollText className="w-4 h-4 text-[#E6C697]" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#110e08]" />
                </div>
                <div>
                  <p className="text-xs font-heading tracking-wider text-[#E6C697]">Vedaa AI</p>
                  <p className="text-[9px] text-[#E6C697]/40 tracking-widest">The Heritage Sentinel</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#E6C697]/40 hover:text-[#E6C697] hover:bg-[#E6C697]/8 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-hide">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "vedaa" && (
                    <div className="w-5 h-5 rounded-lg bg-[#E6C697]/10 border border-[#E6C697]/20 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                      <ScrollText className="w-2.5 h-2.5 text-[#E6C697]/70" />
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#E6C697]/15 text-[#E6C697]/90 rounded-tr-sm"
                        : msg.error
                        ? "bg-red-900/20 border border-red-500/20 text-red-300/80 rounded-tl-sm"
                        : "bg-[#1e1810]/80 border border-[#E6C697]/10 text-[#E6C697]/75 rounded-tl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-lg bg-[#E6C697]/10 border border-[#E6C697]/20 flex items-center justify-center shrink-0">
                    <ScrollText className="w-2.5 h-2.5 text-[#E6C697]/70" />
                  </div>
                  <div className="bg-[#1e1810]/80 border border-[#E6C697]/10 rounded-xl rounded-tl-sm px-3 py-2.5">
                    <Loader2 className="w-3.5 h-3.5 text-[#E6C697]/50 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggested prompts — shown only before any user message */}
            {messages.length === 1 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                {SUGGESTED_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => handleSend(p)}
                    className="text-[10px] px-2.5 py-1 rounded-full border border-[#E6C697]/15 bg-[#E6C697]/5 text-[#E6C697]/55 hover:text-[#E6C697]/80 hover:border-[#E6C697]/30 hover:bg-[#E6C697]/10 transition-all duration-200 text-left"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-3 pb-3 pt-1 border-t border-[#E6C697]/10">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#E6C697]/20 bg-[#1a1610]/60 focus-within:border-[#E6C697]/40 transition-colors">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask Vedaa about your heritage…"
                  disabled={loading}
                  className="flex-1 bg-transparent text-[11px] text-[#E6C697]/80 placeholder:text-[#E6C697]/25 outline-none min-w-0"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className="w-6 h-6 flex items-center justify-center rounded-lg bg-[#E6C697]/10 hover:bg-[#E6C697]/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-3 h-3 text-[#E6C697]" />
                </button>
              </div>
              <p className="text-[8px] text-[#E6C697]/20 text-center mt-1.5 tracking-widest">
                Vedaa AI · Powered by Gemini · StoryVault AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB + Tooltip ──────────────────────────────────────────────── */}
      <div className="fixed bottom-5 right-4 sm:right-6 z-[9999] flex items-center gap-3">

        {/* "Ask Vedaa AI" persistent label — slides in from right */}
        <AnimatePresence>
          {(!open && fabHovered) && (
            <motion.div
              initial={{ opacity: 0, x: 12, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 12, scale: 0.92 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none"
            >
              <div className="px-3 py-1.5 rounded-full bg-[#1a1610]/90 backdrop-blur-md border border-[#E6C697]/30 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                <span className="text-[11px] font-heading tracking-wider text-[#E6C697] whitespace-nowrap">
                  Ask Vedaa AI
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Persistent "Ask Vedaa AI" micro-badge shown when not hovered and chat is closed */}
        {!open && !fabHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.4 }}
            className="pointer-events-none"
          >
            <div className="px-2.5 py-1 rounded-full bg-[#1a1610]/80 backdrop-blur-sm border border-[#E6C697]/20">
              <span className="text-[10px] font-heading tracking-wide text-[#E6C697]/70 whitespace-nowrap">
                Ask Vedaa AI
              </span>
            </div>
          </motion.div>
        )}

        {/* FAB button */}
        <motion.button
          onClick={() => setOpen((o) => !o)}
          onMouseEnter={() => setFabHovered(true)}
          onMouseLeave={() => setFabHovered(false)}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.92 }}
          className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#2a1f10] to-[#0d0d0c] border border-[#D6AF37]/40 transition-all duration-300"
          style={{
            boxShadow: fabHovered || open
              ? "0 0 0 0 transparent, 0 8px 32px rgba(0,0,0,0.6), 0 0 28px rgba(214,175,55,0.65), 0 0 56px rgba(214,175,55,0.3)"
              : "0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(214,175,55,0.4), 0 0 40px rgba(214,175,55,0.2)",
          }}
          aria-label="Open Vedaa AI chat"
        >
          {/* Outer pulse ring */}
          {!open && (
            <span className="absolute inset-0 rounded-full border border-[#D6AF37]/30 animate-ping opacity-60" />
          )}

          {/* Icon */}
          <AnimatePresence mode="wait">
            {open ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6 text-[#E6C697]" />
              </motion.div>
            ) : (
              <motion.div
                key="scroll"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ScrollText className="w-6 h-6 text-[#E6C697]" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Online dot */}
          {!open && (
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0d0d0c] animate-pulse" />
          )}
        </motion.button>
      </div>
    </>
  );
}
