import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function PageNotFound() {
  const location = useLocation();
  const navigate = useNavigate();
  const pageName = location.pathname.substring(1) || "unknown";

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 matrix-grid-bg">
      <div className="w-full max-w-xl rounded-3xl border border-[#E6C697]/15 bg-[#0d0d0c]/85 p-8 text-center shadow-2xl backdrop-blur-xl">
        <p className="mb-4 text-xs uppercase tracking-[0.35em] text-[#E6C697]/45">
          Lost Archive
        </p>
        <h1 className="font-heading text-6xl text-[#E6C697] sm:text-7xl">404</h1>
        <div className="mx-auto my-5 h-px w-24 bg-gradient-to-r from-transparent via-[#E6C697]/60 to-transparent" />
        <h2 className="mb-3 font-heading text-2xl text-[#E6C697]">
          This gallery is not on display
        </h2>
        <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-[#E6C697]/55">
          The route <span className="text-[#E6C697]/85">/{pageName}</span> is not
          part of StoryVault AI right now. Return to the main museum floor to
          continue exploring cultural timelines, recipes, travel plans, and
          community stories.
        </p>

        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 rounded-xl border border-[#E6C697]/25 bg-[#E6C697]/10 px-5 py-3 text-sm font-medium text-[#E6C697] transition-all hover:border-[#E6C697]/45 hover:bg-[#E6C697]/15"
        >
          <ArrowLeft className="h-4 w-4" />
          Return Home
        </button>
      </div>
    </div>
  );
}
