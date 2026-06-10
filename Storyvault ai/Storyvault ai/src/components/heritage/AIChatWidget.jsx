import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";
import { AI_CONFIG, assertGeminiApiKey } from "@/config/ai";

const SUGGESTED_PROMPTS = [
  "Suggest a forgotten Indian recipe to explore",
  "Tell me about a cultural tradition from Rajasthan",
  "Help me plan a heritage trip to Varanasi",
  "What's the history behind Ghoomar dance?",
];

const SYSTEM_PROMPT = [
  "You are Sage, the cultural AI guide for StoryVault AI — a premium heritage preservation platform.",
  "You help users discover Indian cultural heritage: traditional recipes, regional art, folk music, festivals, historical timelines, and diaspora travel.",
  "Keep answers concise (2-4 sentences), warm, and evocative.",
  "When relevant, gently suggest which StoryVault module (Culture Map, Traditional Recipe, NRI Travel Planner, or Share Your Story) the user can visit for a deeper experience.",
  "Respond only about cultural heritage topics. If asked about unrelated topics, politely redirect to heritage discovery.",
].join(" ");

async function askSage(userMessage) {
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
          temperature: 0.6,
          topP: 0.9,
          maxOutputTokens: 300,
        },
      }),
    }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "Sage could not respond right now.");
  }
  return (
    data?.candidates?.[0]?.content?.parts?.map((p) => p?.text ?? "").join("").trim() ||
    "I couldn't generate a response. Please try again."
  );
}

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "sage",
      text: "Namaste 🙏 I'm Sage, your cultural guide. Ask me about Indian heritage, traditions, recipes, or travel — or pick a prompt below to begin.",
    },
  ]);
  const [loading, setLoading] = useState(false);
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
      const reply = await askSage(query);
      setMessages((prev) => [...prev, { role: "sage", text: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "sage",
          text: "I'm having trouble connecting right now. Please try again in a moment.",
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
      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-4 sm:right-6 z-[9998] w-[calc(100vw-2rem)] max-w-sm flex flex-col rounded-2xl border border-[#E6C697]/25 bg-[#110e08]/95 backdrop-blur-xl shadow-[0_24px_64px_rgba(0,0,0,0.7),0_0_0_1px_rgba(230,198,151,0.08)] overflow-hidden"
            style={{ maxHeight: "min(520px, calc(100vh - 120px))" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E6C697]/15 bg-[#1a1610]/60">
              <div className="flex items-center gap-2.5">
                <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-[#E6C697]/20 to-[#E6C697]/5 border border-[#E6C697]/20">
                  <Sparkles className="w-4 h-4 text-[#E6C697]" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#110e08]" />
                </div>
                <div>
                  <p className="text-xs font-heading tracking-wider text-[#E6C697]">Sage</p>
                  <p className="text-[9px] text-[#E6C697]/40 tracking-widest">Cultural AI Guide</p>
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
                  {msg.role === "sage" && (
                    <div className="w-5 h-5 rounded-lg bg-[#E6C697]/10 border border-[#E6C697]/20 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                      <Sparkles className="w-2.5 h-2.5 text-[#E6C697]/70" />
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
                    <Sparkles className="w-2.5 h-2.5 text-[#E6C697]/70" />
                  </div>
                  <div className="bg-[#1e1810]/80 border border-[#E6C697]/10 rounded-xl rounded-tl-sm px-3 py-2.5">
                    <Loader2 className="w-3.5 h-3.5 text-[#E6C697]/50 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggested prompts (only shown when no user messages yet) */}
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
                  placeholder="Ask about Indian heritage…"
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
                Powered by Gemini · StoryVault AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Trigger */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-5 right-4 sm:right-6 z-[9999] flex items-center justify-center w-14 h-14 rounded-full border border-[#E6C697]/30 bg-gradient-to-br from-[#2a1f10] to-[#0d0d0c] shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_0_1px_rgba(230,198,151,0.08),0_0_24px_rgba(230,198,151,0.1)] transition-all"
        aria-label="Open Sage AI chat"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X className="w-5 h-5 text-[#E6C697]" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <Sparkles className="w-5 h-5 text-[#E6C697]" />
            </motion.div>
          )}
        </AnimatePresence>
        {!open && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0d0d0c] animate-pulse" />
        )}
      </motion.button>
    </>
  );
}
