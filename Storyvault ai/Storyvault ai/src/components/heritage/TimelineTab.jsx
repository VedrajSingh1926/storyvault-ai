import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  ChevronLeft,
  Drum,
  Landmark,
  Loader2,
  MapPin,
  Music4,
  Palette,
  RefreshCw,
  ScrollText,
  Search,
  Shirt,
  Sparkles,
  Sunrise,
  UtensilsCrossed,
  Wand2,
  X
} from "lucide-react";
import { buildImageUrl, generateCultureMap, generateTopicSuggestions } from "@/services/gemini";
import CulturalImage from "./CulturalImage";
import { LOCATION_CATEGORY_TOPICS } from "@/data/cultural-kb";

const CATEGORY_OPTIONS = [
  { id: "festivals", label: "Festivals", icon: Sparkles },
  { id: "traditional-foods", label: "Traditional Foods", icon: UtensilsCrossed },
  { id: "folk-dances", label: "Folk Dances", icon: Drum },
  { id: "folk-music", label: "Folk Music", icon: Music4 },
  { id: "traditional-clothing", label: "Traditional Clothing", icon: Shirt },
  { id: "traditions-rituals", label: "Traditions & Rituals", icon: Sunrise },
  { id: "art-forms", label: "Art Forms", icon: Palette },
  { id: "heritage-sites", label: "Heritage Sites", icon: Landmark },
  { id: "folk-stories", label: "Folk Stories", icon: BookOpen },
  { id: "local-legends", label: "Local Legends", icon: ScrollText },
  { id: "handicrafts", label: "Handicrafts", icon: Wand2 },
];

const LOCATION_OPTIONS = [
  "Rajasthan", "Gujarat", "Maharashtra", "Kerala", "Tamil Nadu", "Karnataka",
  "Uttar Pradesh", "West Bengal", "Assam", "Punjab", "Himachal Pradesh", "Bihar",
];

const TIMELINE_ORDER = ["origin", "historical", "modern", "today", "future2035"];
const TIMELINE_LABELS = {
  origin: "Origin",
  historical: "Historical",
  modern: "Modern",
  today: "Today",
  future2035: "2035"
};

export default function TimelineTab({ onStepChange }) {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [topicInput, setTopicInput] = useState("");
  const [cultureMap, setCultureMap] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastPayload, setLastPayload] = useState(null);

  const [hybridTopics, setHybridTopics] = useState([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [activeModalStage, setActiveModalStage] = useState(null);

  const topicFetchRef = useRef(0);

  useEffect(() => {
    if (step !== 3 || !selectedCategory || !selectedLocation) return;

    const localTopics = LOCATION_CATEGORY_TOPICS[selectedLocation]?.[selectedCategory.id];
    if (localTopics && localTopics.length > 0) {
      setHybridTopics(localTopics);
      return;
    }

    const fetchId = ++topicFetchRef.current;
    let cancelled = false;

    const fetchGeminiTopics = async () => {
      setIsLoadingTopics(true);
      try {
        const res = await generateTopicSuggestions({
          category: selectedCategory.label,
          location: selectedLocation,
        });
        if (!cancelled) {
          setHybridTopics(res.topics || []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch topics", err);
          setHybridTopics(["Cultural Heritage", "Local Tradition"]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingTopics(false);
        }
      }
    };

    fetchGeminiTopics();

    return () => {
      cancelled = true;
    };
  }, [step, selectedCategory, selectedLocation]);

  const filteredTopics = useMemo(() => {
    const query = topicInput.trim().toLowerCase();
    if (!query) return hybridTopics;
    return hybridTopics.filter((topic) => topic.toLowerCase().includes(query));
  }, [hybridTopics, topicInput]);

  function goToStep(nextStep) {
    setStep(nextStep);
    onStepChange?.(nextStep);
  }

  function resetFlow() {
    setSelectedCategory(null);
    setSelectedLocation("");
    setTopicInput("");
    setCultureMap(null);
    setActiveModalStage(null);
    setError("");
    setIsLoading(false);
    setHybridTopics([]);
    goToStep(1);
  }

  function handleBack() {
    if (step === 3) goToStep(2);
    else if (step === 2) goToStep(1);
  }

  async function handleGenerateMap() {
    const topic = topicInput.trim();
    if (!selectedCategory || !selectedLocation || !topic) {
      setError("Choose a category, location, and topic before generating the culture map.");
      return;
    }

    if (isLoading) return;

    const payload = {
      category: selectedCategory.label,
      location: selectedLocation,
      topic,
    };

    setIsLoading(true);
    setError("");
    setLastPayload(payload);

    try {
      const result = await generateCultureMap(payload);
      setCultureMap(result);
      goToStep(4);
    } catch (requestError) {
      setError(
        requestError.message ||
          "The Culture Map could not be generated right now. Please retry."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-6 flex items-center justify-center gap-2">
        {[1, 2, 3].map((index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                step >= index
                  ? "bg-gradient-to-br from-[#E6C697] to-[#06B6D4] text-[#0d0d0c]"
                  : "border border-[#E6C697]/15 bg-[#E6C697]/8 text-[#E6C697]/40"
              }`}
            >
              {index}
            </div>
            {index < 3 ? (
              <div
                className={`h-[2px] w-10 rounded-full ${
                  step > index ? "bg-gradient-to-r from-[#E6C697] to-[#06B6D4]" : "bg-[#E6C697]/10"
                }`}
              />
            ) : null}
          </div>
        ))}
      </div>

      {step > 1 && step < 4 ? (
        <button
          type="button"
          onClick={handleBack}
          className="mb-5 inline-flex items-center gap-1 text-xs text-[#E6C697]/55 transition-colors hover:text-[#E6C697]"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back
        </button>
      ) : null}

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="culture-step-1"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
          >
            <div className="mb-7 text-center">
              <h3 className="font-heading text-2xl text-[#E6C697]">Select Category</h3>
              <p className="mt-2 text-sm text-[#E6C697]/45">
                Start with a cultural lens to map its evolution from origin to future.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-5">
              {CATEGORY_OPTIONS.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category);
                      setTopicInput("");
                      setHybridTopics([]);
                      goToStep(2);
                    }}
                    className="rounded-3xl border border-[#E6C697]/15 bg-[#0d0d0c]/62 p-5 text-center transition-all duration-300 hover:border-[#E6C697]/35 hover:bg-[#E6C697]/5"
                  >
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E6C697]/20 bg-[#E6C697]/8">
                      <Icon className="h-5 w-5 text-[#E6C697]" />
                    </div>
                    <p className="text-xs leading-snug text-[#E6C697]/75">{category.label}</p>
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : null}

        {step === 2 ? (
          <motion.div
            key="culture-step-2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
          >
            <div className="mb-7 text-center">
              <h3 className="font-heading text-2xl text-[#E6C697]">Select Location</h3>
              <p className="mt-2 text-sm text-[#E6C697]/45">
                Category: <span className="text-[#E6C697]/80">{selectedCategory?.label}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
              {LOCATION_OPTIONS.map((location) => (
                <button
                  key={location}
                  type="button"
                  onClick={() => {
                    setSelectedLocation(location);
                    setHybridTopics([]);
                    goToStep(3);
                  }}
                  className="rounded-3xl border border-[#E6C697]/15 bg-[#0d0d0c]/62 px-4 py-4 text-sm text-[#E6C697]/75 transition-all duration-300 hover:border-[#E6C697]/35 hover:bg-[#E6C697]/5"
                >
                  <div className="mb-1 flex items-center justify-center gap-2 text-[#06B6D4]/70">
                    <MapPin className="h-4 w-4" />
                    <span className="text-[11px] uppercase tracking-[0.2em]">Region</span>
                  </div>
                  {location}
                </button>
              ))}
            </div>
          </motion.div>
        ) : null}

        {step === 3 ? (
          <motion.div
            key="culture-step-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="rounded-[30px] border border-[#E6C697]/15 bg-[#0d0d0c]/68 p-5 shadow-2xl backdrop-blur-sm sm:p-6"
          >
            <div className="mb-6 text-center">
              <h3 className="font-heading text-2xl text-[#E6C697]">Search Or Select Topic</h3>
              <p className="mt-2 text-sm text-[#E6C697]/45">
                {selectedCategory?.label} <span className="mx-2 text-[#E6C697]/20">·</span> {selectedLocation}
              </p>
            </div>

            <div className="mx-auto mb-5 max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#E6C697]/35" />
                <input
                  value={topicInput}
                  onChange={(event) => setTopicInput(event.target.value)}
                  placeholder="Search or type a topic, for example Ghoomar, Diwali, Banarasi Saree..."
                  className="w-full rounded-2xl border border-[#E6C697]/20 bg-[#15120f] py-3 pl-11 pr-4 text-sm text-[#F6E7C8] outline-none transition-all placeholder:text-[#E6C697]/25 focus:border-[#E6C697]/45"
                />
              </div>
            </div>

            <div className="mb-6 flex flex-wrap justify-center gap-3">
              {isLoadingTopics ? (
                <div className="flex items-center gap-2 text-xs text-[#E6C697]/50">
                  <Loader2 className="h-3 w-3 animate-spin" /> Gathering local knowledge...
                </div>
              ) : (
                filteredTopics.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setTopicInput(topic)}
                    className={`rounded-full border px-4 py-2 text-xs transition-all ${
                      topicInput === topic
                        ? "border-[#E6C697]/40 bg-[#E6C697]/10 text-[#E6C697]"
                        : "border-[#E6C697]/15 bg-[#E6C697]/5 text-[#E6C697]/70 hover:border-[#E6C697]/35"
                    }`}
                  >
                    {topic}
                  </button>
                ))
              )}
            </div>

            {error ? (
              <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200 sm:flex-row sm:items-center sm:justify-between">
                <p>{error}</p>
                {lastPayload ? (
                  <button
                    type="button"
                    onClick={() => handleGenerateMap()}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200/20 px-3 py-2 text-xs font-medium text-red-100 transition-all hover:bg-white/5 disabled:opacity-50"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Retry
                  </button>
                ) : null}
              </div>
            ) : null}

            <div className="text-center">
              <button
                type="button"
                onClick={handleGenerateMap}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#E6C697] to-[#d5a869] px-6 py-3 text-sm font-semibold text-[#130f0a] transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {isLoading ? "Generating Culture Map" : "Generate AI Timeline"}
              </button>
            </div>
          </motion.div>
        ) : null}

        {step === 4 ? (
          <motion.div
            key="culture-step-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="space-y-6 relative"
          >
            {isLoading ? (
              <div className="rounded-[30px] border border-[#E6C697]/15 bg-[#0d0d0c]/68 p-10 text-center backdrop-blur-sm">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#E6C697]/20 bg-[#E6C697]/10">
                  <Loader2 className="h-6 w-6 animate-spin text-[#E6C697]" />
                </div>
                <h3 className="font-heading text-xl text-[#E6C697]">
                  Curating a visual cultural timeline
                </h3>
                <p className="mt-2 text-sm text-[#E6C697]/50">
                  StoryVault AI is validating a structured museum-style narrative.
                </p>
              </div>
            ) : null}

            {!isLoading && cultureMap ? (
              <>
                <div className="rounded-[30px] border border-[#E6C697]/15 bg-[#0d0d0c]/72 p-6 shadow-2xl backdrop-blur-sm">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-[#E6C697]/45">
                        Culture Map
                      </p>
                      <h3 className="mt-2 font-heading text-3xl text-[#E6C697]">
                        {cultureMap.title}
                      </h3>
                      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#E6C697]/55">
                        {cultureMap.overview}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={resetFlow}
                      className="inline-flex items-center gap-2 rounded-2xl border border-[#E6C697]/20 bg-[#E6C697]/8 px-4 py-3 text-xs font-medium text-[#E6C697]/85 transition-all hover:border-[#E6C697]/40"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Build Another Map
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-8">
                    <span className="rounded-full border border-[#E6C697]/15 bg-[#E6C697]/5 px-3 py-2 text-xs text-[#E6C697]/70">
                      {cultureMap.category}
                    </span>
                    <span className="rounded-full border border-[#06B6D4]/15 bg-[#06B6D4]/10 px-3 py-2 text-xs text-[#9fe7f2]">
                      {cultureMap.location}
                    </span>
                    <span className="rounded-full border border-[#E6C697]/15 bg-[#E6C697]/5 px-3 py-2 text-xs text-[#E6C697]/70">
                      {cultureMap.topic}
                    </span>
                  </div>

                  <div className="relative py-12 px-4 overflow-x-auto hide-scrollbar">
                    <div className="absolute top-[88px] left-10 right-10 h-[2px] bg-gradient-to-r from-[#E6C697]/10 via-[#E6C697]/40 to-[#06B6D4]/40"></div>
                    <div className="flex justify-between items-start min-w-[600px] relative z-10 gap-4">
                      {TIMELINE_ORDER.map((stageKey) => {
                        const stageData = cultureMap[stageKey];
                        if (!stageData) return null;

                        return (
                          <div key={stageKey} className="flex flex-col items-center flex-1">
                            <button
                              type="button"
                              onClick={() => setActiveModalStage({ ...stageData, stageKey })}
                              className="group relative flex flex-col items-center"
                            >
                              <div className="text-xs font-medium text-[#E6C697]/50 mb-4 tracking-wider uppercase">
                                {TIMELINE_LABELS[stageKey]}
                              </div>
                              <div className="w-6 h-6 rounded-full border-2 border-[#15120f] bg-[#E6C697] shadow-[0_0_15px_rgba(230,198,151,0.5)] transition-transform group-hover:scale-125 mb-4 z-10 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-[#15120f]"></div>
                              </div>
                              <div className="bg-[#0d0d0c] border border-[#E6C697]/20 rounded-xl px-4 py-3 text-center transition-all group-hover:border-[#E6C697]/50 group-hover:bg-[#E6C697]/10 shadow-lg min-w-[120px]">
                                <p className="text-xs font-bold text-[#E6C697] mb-1">{stageData.year}</p>
                                <p className="text-[10px] text-[#E6C697]/70 line-clamp-2 leading-tight">{stageData.title}</p>
                              </div>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {activeModalStage && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                      onClick={() => setActiveModalStage(null)}
                    >
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-lg bg-[#0d0d0c] border border-[#E6C697]/20 rounded-3xl overflow-hidden shadow-2xl relative"
                      >
                        <button
                          type="button"
                          onClick={() => setActiveModalStage(null)}
                          className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-[#E6C697] hover:bg-[#E6C697]/20 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className="h-48 relative border-b border-[#E6C697]/10 bg-[#15120f]">
                          <CulturalImage
                            src={buildImageUrl(activeModalStage.imageQuery, "landscape_4_3")}
                            alt={activeModalStage.title}
                            className="w-full h-full absolute inset-0"
                            icon={Landmark}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0c] to-transparent"></div>
                          <div className="absolute bottom-4 left-6">
                            <span className="px-3 py-1 text-[10px] uppercase tracking-widest text-[#06B6D4]/80 bg-[#06B6D4]/10 border border-[#06B6D4]/20 rounded-full backdrop-blur-md">
                              {activeModalStage.year}
                            </span>
                          </div>
                        </div>

                        <div className="p-6">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-[#E6C697]/40 mb-1">
                            {TIMELINE_LABELS[activeModalStage.stageKey]}
                          </p>
                          <h4 className="font-heading text-2xl text-[#E6C697] mb-4">
                            {activeModalStage.title}
                          </h4>
                          <p className="text-sm leading-relaxed text-[#E6C697]/80 italic border-l-2 border-[#E6C697]/30 pl-4 bg-[#E6C697]/5 py-2">
                            {activeModalStage.description}
                          </p>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
