import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  CheckCircle,
  Globe,
  Heart,
  ImagePlus,
  MapPin,
  Send,
  User,
} from "lucide-react";

const SEED_STORIES = [
  {
    id: 1,
    name: "Meera Patel",
    state: "Gujarat",
    title: "My Grandmother's Bandhani",
    story:
      "In the lanes of Jamnagar, my dadi tied thousands of tiny knots on silk before sunrise. Every dot carried a blessing for marriage, spring, and prosperity. I still keep her unfinished dupatta folded in sandalwood paper.",
    likes: 47,
    image: "",
    time: "Seed Archive",
  },
  {
    id: 2,
    name: "Rahul Sharma",
    state: "Uttar Pradesh",
    title: "The Last Shehnai At Dawn",
    story:
      "My great-grandfather played shehnai at dawn near the ghats for sixty years. When the morning sound stopped, the neighborhood felt empty. I now play his recordings every Kartik month so the river remembers his breath.",
    likes: 89,
    image: "",
    time: "Seed Archive",
  },
  {
    id: 3,
    name: "Ananya Rao",
    state: "Karnataka",
    title: "Mysore Pak And Memory",
    story:
      "My ajji said the ghee must sing before the flour enters the kadai. I tried to write her method down, but she laughed and said some recipes can only live in the hand. That sentence became our family inheritance.",
    likes: 63,
    image: "",
    time: "Seed Archive",
  },
];

const STORAGE_KEY = "storyvault-community-stories";

export default function ShareStoryTab() {
  const [form, setForm] = useState({
    name: "",
    state: "",
    title: "",
    story: "",
    image: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [stories, setStories] = useState(SEED_STORIES);
  const [likedStories, setLikedStories] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    const storedStories = window.localStorage.getItem(STORAGE_KEY);
    if (!storedStories) {
      return;
    }

    try {
      const parsedStories = JSON.parse(storedStories);
      if (Array.isArray(parsedStories) && parsedStories.length) {
        setStories(parsedStories);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
  }, [stories]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.state || !form.title || !form.story) {
      setError("Complete all story fields before saving to the local archive.");
      return;
    }

    setError("");

    const newStory = {
      id: Date.now(),
      name: form.name,
      state: form.state,
      title: form.title,
      story: form.story,
      likes: 0,
      image: form.image,
      time: "Saved locally"
    };

    setStories(prev => [newStory, ...prev]);
    setSubmitted(true);
    setForm({ name: "", state: "", title: "", story: "", image: "" });

    setTimeout(() => setSubmitted(false), 3000);
  };

  const toggleLike = (id) => {
    setLikedStories(prev => {
      const newLiked = { ...prev, [id]: !prev[id] };
      return newLiked;
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h3 className="font-heading text-xl text-[#E6C697] tracking-wider mb-1">Share Your Heritage Story</h3>
        <p className="text-[10px] text-[#E6C697]/40">Save local community memories with text, state context, and an optional personal image</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Submission Panel */}
        <div>
          <form onSubmit={handleSubmit} className="border border-[#E6C697]/15 rounded-2xl p-5 bg-[#0d0d0c]/60 backdrop-blur-sm sticky top-24">
            <h5 className="font-heading text-xs text-[#E6C697] tracking-widest uppercase mb-4">Your Story</h5>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="flex items-center gap-1.5 text-[10px] text-[#E6C697]/50 mb-1.5 font-medium uppercase tracking-wider">
                  <User className="w-3 h-3" /> Name
                </label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ravi Shankar"
                  className="w-full bg-[#E6C697]/5 border border-[#E6C697]/15 rounded-lg px-3 py-2.5 text-xs text-[#E6C697]/90 placeholder:text-[#E6C697]/20 focus:outline-none focus:border-[#E6C697]/40 transition-all" />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-[10px] text-[#E6C697]/50 mb-1.5 font-medium uppercase tracking-wider">
                  <MapPin className="w-3 h-3" /> State
                </label>
                <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="Rajasthan"
                  className="w-full bg-[#E6C697]/5 border border-[#E6C697]/15 rounded-lg px-3 py-2.5 text-xs text-[#E6C697]/90 placeholder:text-[#E6C697]/20 focus:outline-none focus:border-[#E6C697]/40 transition-all" />
              </div>
            </div>

            <div className="mb-3">
              <label className="flex items-center gap-1.5 text-[10px] text-[#E6C697]/50 mb-1.5 font-medium uppercase tracking-wider">
                <BookOpen className="w-3 h-3" /> Story Title
              </label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="My grandmother's weaving tradition..."
                className="w-full bg-[#E6C697]/5 border border-[#E6C697]/15 rounded-lg px-3 py-2.5 text-xs text-[#E6C697]/90 placeholder:text-[#E6C697]/20 focus:outline-none focus:border-[#E6C697]/40 transition-all" />
            </div>

            <div className="mb-4">
              <label className="text-[10px] text-[#E6C697]/50 mb-1.5 font-medium uppercase tracking-wider block">Your Story</label>
              <textarea value={form.story} onChange={(e) => setForm({ ...form, story: e.target.value })}
                placeholder="Tell us about the traditions, rituals, recipes, or art forms passed down through your family..."
                rows={4}
                className="w-full bg-[#E6C697]/5 border border-[#E6C697]/15 rounded-lg px-3 py-2.5 text-xs text-[#E6C697]/90 placeholder:text-[#E6C697]/20 focus:outline-none focus:border-[#E6C697]/40 transition-all resize-none" />
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-1.5 text-[10px] text-[#E6C697]/50 mb-1.5 font-medium uppercase tracking-wider">
                <ImagePlus className="w-3 h-3" /> Upload Image
              </label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;

                  const reader = new FileReader();
                  reader.onload = () => {
                    setForm((previous) => ({ ...previous, image: String(reader.result || "") }));
                  };
                  reader.readAsDataURL(file);
                }}
                className="w-full rounded-lg border border-[#E6C697]/15 bg-[#E6C697]/5 px-3 py-2.5 text-xs text-[#E6C697]/70 file:mr-3 file:rounded-md file:border-0 file:bg-[#E6C697]/15 file:px-3 file:py-2 file:text-xs file:text-[#E6C697]"
              />
              {form.image ? (
                <img
                  src={form.image}
                  alt="Story preview"
                  className="mt-3 h-32 w-full rounded-xl object-cover"
                />
              ) : null}
            </div>

            {error ? (
              <div className="mb-3 rounded-lg border border-red-300/15 bg-red-500/10 px-3 py-2 text-[10px] text-red-200">
                {error}
              </div>
            ) : null}

            <AnimatePresence>
              {submitted && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-[#06B6D4]/10 border border-[#06B6D4]/20 text-[#06B6D4] text-[10px]">
                  <CheckCircle className="w-3.5 h-3.5" /> Story saved to local community archive!
                </motion.div>
              )}
            </AnimatePresence>

            <button type="submit"
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#E6C697]/20 to-[#06B6D4]/10 text-[#E6C697] text-xs font-semibold border border-[#E6C697]/30 hover:border-[#E6C697]/50 transition-all duration-300 active:scale-95 hover:shadow-[0_0_20px_rgba(230,198,151,0.15)]">
              <Send className="w-3.5 h-3.5" /> Save To Local Archive
            </button>
          </form>
        </div>

        {/* Right: Community Feed */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-heading text-xs text-[#E6C697] tracking-widest uppercase flex items-center gap-2">
              <Globe className="w-3.5 h-3.5" /> Global Community Chronicles
            </h5>
            <span className="text-[9px] text-[#E6C697]/30">{stories.length} stories</span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-hide pr-1">
            <AnimatePresence>
              {stories.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={s.id > 1000000 ? { opacity: 0, y: -10, scale: 0.95 } : false}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="border border-[#E6C697]/15 rounded-xl p-4 bg-[#0d0d0c]/60 backdrop-blur-sm hover:border-[#E6C697]/25 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#E6C697]/30 to-[#06B6D4]/30 flex items-center justify-center">
                          <User className="w-3 h-3 text-[#E6C697]" />
                        </div>
                        <span className="text-[11px] text-[#E6C697]/80 font-medium">{s.name}</span>
                        <span className="text-[9px] text-[#E6C697]/30 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" /> {s.state}
                        </span>
                      </div>
                      <h6 className="text-xs text-[#E6C697] font-display italic pl-8">{s.title}</h6>
                    </div>
                    <span className="text-[8px] text-[#E6C697]/20 shrink-0">{s.time}</span>
                  </div>

                  {s.image ? (
                    <img
                      src={s.image}
                      alt={s.title}
                      className="mb-3 h-40 w-full rounded-xl object-cover"
                    />
                  ) : null}

                  <p className="text-[10px] text-[#E6C697]/50 leading-relaxed mb-3 pl-8">{s.story}</p>

                  <div className="flex items-center gap-3 pl-8">
                    <button onClick={() => toggleLike(s.id)}
                      className={`flex items-center gap-1 text-[10px] transition-all active:scale-90 ${
                        likedStories[s.id] ? "text-[#06B6D4]" : "text-[#E6C697]/30 hover:text-[#E6C697]/50"
                      }`}>
                      <Heart className={`w-3 h-3 ${likedStories[s.id] ? "fill-[#06B6D4]" : ""}`} />
                      {likedStories[s.id] ? s.likes + 1 : s.likes}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
