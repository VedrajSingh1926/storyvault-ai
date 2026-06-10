import { useMemo, useState } from "react";
import { ChefHat, Loader2, MapPin, RefreshCw, Search, Sparkles } from "lucide-react";
import { buildImageUrl, generateRecipe } from "@/services/gemini";
import CulturalImage from "./CulturalImage";

const FEATURED_RECIPES = [
  { name: "Panchkuta", state: "Rajasthan" },
  { name: "Maheri", state: "Rajasthan" },
  { name: "Khar", state: "Assam" },
  { name: "Patrode", state: "Himachal Pradesh" },
  { name: "Khurasani Chutney", state: "Maharashtra" },
];

function SectionCard({ title, children }) {
  return (
    <div className="rounded-2xl border border-[#E6C697]/15 bg-[#0d0d0c]/65 p-5 backdrop-blur-sm">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#E6C697]/65">
        {title}
      </h4>
      {children}
    </div>
  );
}

export default function RecipeTab() {
  const [query, setQuery] = useState("");
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState("");

  const featuredLabels = useMemo(
    () => FEATURED_RECIPES.map((item) => `${item.name} (${item.state})`),
    []
  );

  async function handleGenerate(input) {
    const recipeQuery = (input ?? query).trim();
    if (!recipeQuery) {
      setError("Enter a recipe name or choose a suggested traditional dish.");
      return;
    }

    setIsLoading(true);
    setError("");
    setLastQuery(recipeQuery);

    try {
      const result = await generateRecipe({ recipeQuery });
      setRecipe(result);
      setQuery(recipeQuery);
    } catch (requestError) {
      setError(
        requestError.message ||
          "The recipe archive could not be generated right now. Please retry."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl p-4 text-[#F6E7C8] sm:p-6">
      <div className="mb-8 text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-[#E6C697]/45">
          Traditional Recipe Module
        </p>
        <h2 className="font-heading text-3xl text-[#E6C697] sm:text-4xl">
          Forgotten Culinary Archive
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#E6C697]/55">
          Search a traditional dish or begin with a curated suggestion. Every
          response is structured into origin, ingredients, preparation, cultural
          meaning, and the reasons a recipe is fading away.
        </p>
      </div>

      <div className="mb-6 rounded-3xl border border-[#E6C697]/15 bg-[#0d0d0c]/70 p-5 shadow-2xl backdrop-blur-sm">
        <div className="mb-4 flex items-center gap-2 text-sm text-[#E6C697]">
          <ChefHat className="h-4 w-4" />
          Recipe suggestions
        </div>

        <div className="mb-5 flex flex-wrap gap-3">
          {FEATURED_RECIPES.map((item) => (
            <button
              key={`${item.name}-${item.state}`}
              type="button"
              onClick={() => handleGenerate(`${item.name} (${item.state})`)}
              className="rounded-full border border-[#E6C697]/20 bg-[#E6C697]/7 px-4 py-2 text-xs text-[#E6C697]/80 transition-all hover:border-[#E6C697]/40 hover:bg-[#E6C697]/10"
            >
              {item.name} <span className="text-[#06B6D4]/70">({item.state})</span>
            </button>
          ))}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleGenerate();
          }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#E6C697]/35" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search a recipe, for example ${featuredLabels[0]}`}
              className="w-full rounded-2xl border border-[#E6C697]/20 bg-[#15120f] py-3 pl-11 pr-4 text-sm text-[#F6E7C8] outline-none transition-all placeholder:text-[#E6C697]/25 focus:border-[#E6C697]/45"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#E6C697] to-[#d5a869] px-5 py-3 text-sm font-semibold text-[#130f0a] transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isLoading ? "Reconstructing" : "Generate Recipe"}
          </button>
        </form>

        {error ? (
          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200 sm:flex-row sm:items-center sm:justify-between">
            <p>{error}</p>
            {lastQuery ? (
              <button
                type="button"
                onClick={() => handleGenerate(lastQuery)}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200/20 px-3 py-2 text-xs font-medium text-red-100 transition-all hover:bg-white/5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-[#E6C697]/15 bg-[#0d0d0c]/65 p-8 text-center backdrop-blur-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#E6C697]/20 bg-[#E6C697]/10">
            <Loader2 className="h-6 w-6 animate-spin text-[#E6C697]" />
          </div>
          <h3 className="font-heading text-xl text-[#E6C697]">
            Restoring a forgotten kitchen memory
          </h3>
          <p className="mt-2 text-sm text-[#E6C697]/50">
            StoryVault AI is validating a structured cultural recipe response.
          </p>
        </div>
      ) : null}

      {!recipe && !isLoading && !error ? (
        <div className="rounded-3xl border border-dashed border-[#E6C697]/15 bg-[#0d0d0c]/50 p-10 text-center">
          <p className="text-sm text-[#E6C697]/45">
            Choose a suggestion or search a regional dish to open the culinary archive.
          </p>
        </div>
      ) : null}

      {recipe && !isLoading ? (
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[28px] border border-[#E6C697]/15 bg-[#0d0d0c]/75 shadow-2xl backdrop-blur-sm">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="p-6 sm:p-7">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-[#E6C697]/20 bg-[#E6C697]/8 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-[#E6C697]/70">
                    Traditional Recipe
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#06B6D4]/20 bg-[#06B6D4]/10 px-3 py-1 text-xs text-[#9fe7f2]">
                    <MapPin className="h-3.5 w-3.5" />
                    {recipe.state}
                  </span>
                </div>

                <h3 className="font-heading text-3xl text-[#E6C697]">
                  {recipe.recipeName}
                </h3>
                <p className="mt-2 font-display text-xl italic text-[#F3D9A3]/85">
                  {recipe.localName}
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <SectionCard title="Origin Story">
                    <div className="space-y-3 text-sm leading-relaxed text-[#E6C697]/65">
                      {recipe.originStory.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  </SectionCard>

                  <SectionCard title="Cultural Importance">
                    <p className="text-sm leading-relaxed text-[#E6C697]/65">
                      {recipe.culturalImportance}
                    </p>
                  </SectionCard>
                </div>
              </div>

              <div className="relative min-h-[280px] border-t border-[#E6C697]/10 lg:min-h-full lg:border-l lg:border-t-0">
                <CulturalImage
                  src={buildImageUrl(recipe.imagePrompt, "portrait_4_3")}
                  alt={`${recipe.recipeName} from ${recipe.state}`}
                  className="absolute inset-0 w-full h-full"
                  icon={ChefHat}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0c] via-[#0d0d0c]/10 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#E6C697]/55">
                    Traditional presentation
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SectionCard title="Ingredients">
              <ul className="space-y-2 text-sm text-[#E6C697]/65">
                {recipe.ingredients.map((ingredient) => (
                  <li key={ingredient} className="flex gap-2">
                    <span className="text-[#06B6D4]">•</span>
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard title="Festivals / Occasions">
              <div className="flex flex-wrap gap-2">
                {recipe.festivalsOccasions.map((occasion) => (
                  <span
                    key={occasion}
                    className="rounded-full border border-[#E6C697]/15 bg-[#E6C697]/7 px-3 py-2 text-xs text-[#E6C697]/75"
                  >
                    {occasion}
                  </span>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Traditional Preparation">
              <ol className="space-y-3 text-sm leading-relaxed text-[#E6C697]/65">
                {recipe.traditionalPreparation.map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#E6C697]/20 text-xs text-[#E6C697]">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </SectionCard>

            <div className="space-y-6">
              <SectionCard title="Interesting Fact">
                <p className="text-sm leading-relaxed text-[#E6C697]/65">
                  {recipe.interestingFact}
                </p>
              </SectionCard>

              <SectionCard title="Why This Recipe Is Disappearing">
                <p className="text-sm leading-relaxed text-[#E6C697]/65">
                  {recipe.disappearingReason}
                </p>
              </SectionCard>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
