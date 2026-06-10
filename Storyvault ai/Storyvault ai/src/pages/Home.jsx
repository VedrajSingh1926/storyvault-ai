import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HeaderNav from "../components/heritage/HeaderNav";
import BackgroundLayer from "../components/heritage/BackgroundLayer";
import MissionModal from "../components/heritage/MissionModal";
import HomeLanding from "../components/heritage/HomeLanding";
import TimelineTab from "../components/heritage/TimelineTab";
import ShareStoryTab from "../components/heritage/ShareStoryTab";
import RecipeTab from "../components/heritage/RecipeTab";
import TravelTab from "../components/heritage/TravelTab";

export default function Home() {
  const [activeTab, setActiveTab] = useState("home");
  const [missionOpen, setMissionOpen] = useState(false);
  const [timelineStep, setTimelineStep] = useState(1);

  const showVideo = activeTab === "timeline" && timelineStep <= 2;
  const isHome = activeTab === "home";

  return (
    <div className="relative min-h-screen">
      <BackgroundLayer showVideo={showVideo} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <HeaderNav
          activeTab={activeTab === "home" ? null : activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setTimelineStep(1);
          }}
          onMissionOpen={() => setMissionOpen(true)}
        />

        <main className="flex-1 px-4 py-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            {isHome && (
              <motion.div
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5 }}
              >
                <HomeLanding onNavigate={(tab) => setActiveTab(tab)} />
              </motion.div>
            )}

            {activeTab === "timeline" && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5 }}
              >
                <TimelineTab onStepChange={setTimelineStep} />
              </motion.div>
            )}

            {activeTab === "story" && (
              <motion.div
                key="story"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5 }}
              >
                <ShareStoryTab />
              </motion.div>
            )}

            {activeTab === "recipe" && (
              <motion.div
                key="recipe"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5 }}
              >
                <RecipeTab />
              </motion.div>
            )}

            {activeTab === "travel" && (
              <motion.div
                key="travel"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5 }}
              >
                <TravelTab />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="relative z-10 text-center py-4 border-t border-[#E6C697]/10">
          <p className="text-[9px] text-[#E6C697]/25 font-heading tracking-widest">
            StoryVault AI · Culture Maps · Traditional Recipes · NRI Heritage Journeys · Community Stories
          </p>
        </footer>
      </div>

      <MissionModal isOpen={missionOpen} onClose={() => setMissionOpen(false)} />
    </div>
  );
}
