import { useMemo, useState } from "react";
import { CalendarDays, Globe2, Loader2, MapPinned, RefreshCw, Sparkles } from "lucide-react";
import { generateTravelPlan } from "@/services/gemini";
import { TRAVEL_KB } from "@/data/travel-kb";
import CulturalImage from "./CulturalImage";

function InfoCard({ title, children }) {
  return (
    <div className="rounded-2xl border border-[#E6C697]/15 bg-[#0d0d0c]/65 p-5 backdrop-blur-sm">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#E6C697]/65">
        {title}
      </h4>
      {children}
    </div>
  );
}

function getDefaultDates() {
  const start = new Date();
  const end = new Date();
  end.setDate(start.getDate() + 4);

  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}

export default function TravelTab() {
  const defaults = useMemo(() => getDefaultDates(), []);
  const [form, setForm] = useState({
    currentCountry: "United Kingdom",
    destination: "Jaipur, Rajasthan",
    startDate: defaults.startDate,
    endDate: defaults.endDate,
  });
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastPayload, setLastPayload] = useState(null);

  async function handleGenerate(event) {
    event?.preventDefault();

    if (
      !form.currentCountry.trim() ||
      !form.destination.trim() ||
      !form.startDate ||
      !form.endDate
    ) {
      setError("Complete all four travel inputs to generate a personalized journey.");
      return;
    }

    if (form.endDate < form.startDate) {
      setError("End date must be the same as or later than the start date.");
      return;
    }

    setIsLoading(true);
    setError("");
    setLastPayload(form);

    try {
      const result = await generateTravelPlan(form);
      setPlan(result);
    } catch (requestError) {
      setError(
        requestError.message ||
          "The travel planner could not generate an itinerary right now."
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Find recognized destination for curated data
  const recognizedLocation = useMemo(() => {
    if (!form.destination) return null;
    const destLower = form.destination.toLowerCase();
    const match = Object.keys(TRAVEL_KB).find(loc => destLower.includes(loc.toLowerCase()));
    return match ? { name: match, data: TRAVEL_KB[match] } : null;
  }, [form.destination]);

  return (
    <div className="mx-auto max-w-6xl p-4 text-[#F6E7C8] sm:p-6">
      <div className="mb-8 text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-[#E6C697]/45">
          NRI Cultural Travel Planner
        </p>
        <h2 className="font-heading text-3xl text-[#E6C697] sm:text-4xl">
          Return Journey Concierge
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#E6C697]/55">
          Generate a premium day-wise itinerary with cultural experiences,
          heritage spaces, local food, and diaspora-friendly guidance for your
          visit to India.
        </p>
      </div>

      <form
        onSubmit={handleGenerate}
        className="mb-6 grid grid-cols-1 gap-4 rounded-3xl border border-[#E6C697]/15 bg-[#0d0d0c]/72 p-5 shadow-2xl backdrop-blur-sm md:grid-cols-2 xl:grid-cols-4"
      >
        <label className="text-sm">
          <span className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#E6C697]/55">
            <Globe2 className="h-3.5 w-3.5" />
            Current Country
          </span>
          <input
            type="text"
            value={form.currentCountry}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                currentCountry: event.target.value,
              }))
            }
            className="w-full rounded-2xl border border-[#E6C697]/20 bg-[#15120f] px-4 py-3 text-sm text-[#F6E7C8] outline-none transition-all focus:border-[#E6C697]/45"
          />
        </label>

        <label className="text-sm">
          <span className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#E6C697]/55">
            <MapPinned className="h-3.5 w-3.5" />
            Destination In India
          </span>
          <input
            type="text"
            value={form.destination}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                destination: event.target.value,
              }))
            }
            className="w-full rounded-2xl border border-[#E6C697]/20 bg-[#15120f] px-4 py-3 text-sm text-[#F6E7C8] outline-none transition-all focus:border-[#E6C697]/45"
          />
        </label>

        <label className="text-sm">
          <span className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#E6C697]/55">
            <CalendarDays className="h-3.5 w-3.5" />
            Start Date
          </span>
          <input
            type="date"
            value={form.startDate}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                startDate: event.target.value,
              }))
            }
            className="w-full rounded-2xl border border-[#E6C697]/20 bg-[#15120f] px-4 py-3 text-sm text-[#F6E7C8] outline-none transition-all focus:border-[#E6C697]/45"
          />
        </label>

        <label className="text-sm">
          <span className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#E6C697]/55">
            <CalendarDays className="h-3.5 w-3.5" />
            End Date
          </span>
          <input
            type="date"
            value={form.endDate}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                endDate: event.target.value,
              }))
            }
            className="w-full rounded-2xl border border-[#E6C697]/20 bg-[#15120f] px-4 py-3 text-sm text-[#F6E7C8] outline-none transition-all focus:border-[#E6C697]/45"
          />
        </label>

        <div className="md:col-span-2 xl:col-span-4">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#E6C697] to-[#d5a869] px-5 py-3 text-sm font-semibold text-[#130f0a] transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isLoading ? "Curating Journey" : "Generate Cultural Journey"}
          </button>
        </div>
      </form>

      {error ? (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200 sm:flex-row sm:items-center sm:justify-between">
          <p>{error}</p>
          {lastPayload ? (
            <button
              type="button"
              onClick={() => handleGenerate()}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200/20 px-3 py-2 text-xs font-medium text-red-100 transition-all hover:bg-white/5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          ) : null}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-3xl border border-[#E6C697]/15 bg-[#0d0d0c]/65 p-8 text-center backdrop-blur-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#E6C697]/20 bg-[#E6C697]/10">
            <Loader2 className="h-6 w-6 animate-spin text-[#E6C697]" />
          </div>
          <h3 className="font-heading text-xl text-[#E6C697]">
            Mapping a premium return itinerary
          </h3>
          <p className="mt-2 text-sm text-[#E6C697]/50">
            Building day-wise heritage experiences, food recommendations, and cultural pathways.
          </p>
        </div>
      ) : null}

      {!plan && !isLoading && !error ? (
        <div className="rounded-3xl border border-dashed border-[#E6C697]/15 bg-[#0d0d0c]/50 p-10 text-center">
          <p className="text-sm text-[#E6C697]/45">
            Enter your country, destination, and travel dates to open the itinerary salon.
          </p>
        </div>
      ) : null}

      {plan && !isLoading ? (
        <div className="space-y-6">
          <div className="rounded-[28px] border border-[#E6C697]/15 bg-[#0d0d0c]/75 p-6 shadow-2xl backdrop-blur-sm">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-[#E6C697]/20 bg-[#E6C697]/8 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-[#E6C697]/70">
                Personalized Journey
              </span>
              <span className="rounded-full border border-[#06B6D4]/20 bg-[#06B6D4]/10 px-3 py-1 text-xs text-[#9fe7f2]">
                {plan.travelWindow}
              </span>
            </div>

            <h3 className="font-heading text-3xl text-[#E6C697]">{plan.title}</h3>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#E6C697]/60">
              {plan.summary}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <InfoCard title="Starting Point">
                <p className="text-sm text-[#E6C697]/70">{plan.currentCountry}</p>
              </InfoCard>
              <InfoCard title="Destination">
                <p className="text-sm text-[#E6C697]/70">{plan.destination}</p>
              </InfoCard>
              <InfoCard title="Style Notes">
                <ul className="space-y-2 text-sm text-[#E6C697]/65">
                  {plan.styleNotes.map((note) => (
                    <li key={note} className="flex gap-2">
                      <span className="text-[#06B6D4]">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </InfoCard>
            </div>
          </div>

          {recognizedLocation && (
            <div className="rounded-[28px] border border-[#06B6D4]/20 bg-gradient-to-br from-[#06B6D4]/10 to-[#0d0d0c] p-6 shadow-2xl backdrop-blur-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                 <MapPinned className="w-48 h-48 text-[#06B6D4]" />
               </div>
               
               <div className="relative z-10">
                 <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#06B6D4]/30 bg-[#06B6D4]/15 px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-[#9fe7f2]">
                   <Sparkles className="h-3 w-3" />
                   Curated Cultural Intelligence
                 </div>
                 
                 <h4 className="font-heading text-2xl text-[#E6C697] mb-6">
                   Essential {recognizedLocation.name} Knowledge Base
                 </h4>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <InfoCard title="Top Heritage Sites">
                      <ul className="space-y-1 text-sm text-[#E6C697]/70">
                        {recognizedLocation.data.heritageSites.slice(0, 4).map(s => <li key={s}>• {s}</li>)}
                      </ul>
                    </InfoCard>
                    <InfoCard title="Cultural Experiences">
                      <ul className="space-y-1 text-sm text-[#E6C697]/70">
                        {recognizedLocation.data.culturalExperiences.slice(0, 4).map(s => <li key={s}>• {s}</li>)}
                      </ul>
                    </InfoCard>
                    <InfoCard title="Traditional Foods">
                      <ul className="space-y-1 text-sm text-[#E6C697]/70">
                        {recognizedLocation.data.traditionalFoods.slice(0, 4).map(s => <li key={s}>• {s}</li>)}
                      </ul>
                    </InfoCard>
                    <InfoCard title="Suggested Markets">
                      <ul className="space-y-1 text-sm text-[#E6C697]/70">
                        {recognizedLocation.data.suggestedMarkets.slice(0, 4).map(s => <li key={s}>• {s}</li>)}
                      </ul>
                    </InfoCard>
                 </div>
               </div>
            </div>
          )}

          <div className="space-y-4">
            {plan.itinerary.map((day) => (
              <div
                key={`${day.day}-${day.title}`}
                className="rounded-[26px] border border-[#E6C697]/15 bg-[#0d0d0c]/72 p-6 shadow-xl backdrop-blur-sm"
              >
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-[#E6C697]/45">
                      Day {day.day}
                    </p>
                    <h4 className="mt-1 font-heading text-2xl text-[#E6C697]">
                      {day.title}
                    </h4>
                  </div>
                  <span className="rounded-full border border-[#E6C697]/15 bg-[#E6C697]/7 px-3 py-2 text-xs text-[#E6C697]/75">
                    {day.area}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                  <InfoCard title="Activities">
                    <ul className="space-y-2 text-sm text-[#E6C697]/65">
                      {day.activities.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="text-[#06B6D4]">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </InfoCard>

                  <InfoCard title="Places To Visit">
                    <ul className="space-y-2 text-sm text-[#E6C697]/65">
                      {day.placesToVisit.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="text-[#06B6D4]">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </InfoCard>

                  <InfoCard title="Cultural Experiences">
                    <ul className="space-y-2 text-sm text-[#E6C697]/65">
                      {day.culturalExperiences.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="text-[#06B6D4]">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </InfoCard>

                  <InfoCard title="Local Food">
                    <ul className="space-y-2 text-sm text-[#E6C697]/65">
                      {day.localFoodRecommendations.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="text-[#06B6D4]">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </InfoCard>

                  <InfoCard title="Heritage Experiences">
                    <ul className="space-y-2 text-sm text-[#E6C697]/65">
                      {day.heritageExperiences.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="text-[#06B6D4]">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </InfoCard>
                </div>
              </div>
            ))}
          </div>

          {plan.optionalGuides.length ? (
            <div className="rounded-[26px] border border-[#E6C697]/15 bg-[#0d0d0c]/72 p-6 shadow-xl backdrop-blur-sm">
              <h4 className="mb-4 font-heading text-2xl text-[#E6C697]">
                Optional Local Guide Leads
              </h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {plan.optionalGuides.map((guide) => (
                  <InfoCard key={`${guide.name}-${guide.area}`} title={guide.name}>
                    <p className="mb-2 text-sm text-[#E6C697]/70">{guide.specialty}</p>
                    <p className="mb-1 text-xs uppercase tracking-[0.18em] text-[#06B6D4]/75">
                      {guide.area}
                    </p>
                    <p className="text-sm leading-relaxed text-[#E6C697]/60">
                      {guide.note}
                    </p>
                  </InfoCard>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
