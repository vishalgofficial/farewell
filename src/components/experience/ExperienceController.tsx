import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { farewell } from "@/config/farewell";
import { useReducedMotion } from "@/hooks/useTypewriter";
import { Particles } from "./shared";
import { Volume2, VolumeX } from "lucide-react";
import { onMute, setMuted, sfx } from "@/lib/sound";
import { BootSequence } from "./BootSequence";
import { AgentProfile } from "./AgentProfile";
import { MemoryTimeline } from "./MemoryTimeline";
import { HumanDependency } from "./HumanDependency";
import { DigitalTwinChat } from "./DigitalTwinChat";
import { FinalHandover } from "./FinalHandover";
import { Quiz } from "./Quiz";
import { AchievementToasts, BonusReel } from "./Overlays";
import { StartGate } from "./StartGate";
import { totalAchievements, unlock } from "@/lib/achievements";
import { GlobalNoteAccess } from "./StickyNote";

export function ExperienceController() {
  const [scene, setScene] = useState(0);
  const [run, setRun] = useState(0);
  const [skip, setSkip] = useState(false);
  const [warm, setWarm] = useState(false);
  const [started, setStarted] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [name, setName] = useState("");
  const [count, setCount] = useState(0);
  const [bonus, setBonus] = useState(false);
  const onCount = useCallback((n: number) => setCount(n), []);
  useEffect(() => {
    const f = () => setBonus(true);
    window.addEventListener("vishal:bonus", f);
    return () => window.removeEventListener("vishal:bonus", f);
  }, []);
  useEffect(() => onMute(setMutedState), []);
  useEffect(() => () => sfx.stopAmbient(), []);
  useEffect(() => {
    unlock("begin");
    const wake = () => {
      sfx.unlock();
      sfx.startAmbient();
    };
    window.addEventListener("pointerdown", wake, { once: true });
    window.addEventListener("keydown", wake, { once: true });
    return () => {
      window.removeEventListener("pointerdown", wake);
      window.removeEventListener("keydown", wake);
    };
  }, []);
  const reduced = useReducedMotion();
  const instant = skip || reduced;

  useEffect(() => {
    document.documentElement.dataset["mood"] = warm ? "warm" : "cool";
  }, [warm]);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [scene]);

  const next = () => {
    sfx.whoosh();
    setSkip(false);
    setScene((s) => Math.min(s + 1, farewell.scenes.length - 1));
  };
  const replay = () => {
    sfx.whoosh();
    setStarted(false);
    setScene(0);
    setWarm(false);
    setSkip(false);
    setRun((r) => r + 1);
  };

  const props = { onNext: next, instant, name };
  const views = [
    <BootSequence {...props} />,
    <AgentProfile {...props} />,
    <MemoryTimeline {...props} />,
    <HumanDependency
      {...props}
      onWarm={() => {
        if (!warm) sfx.warm();
        setWarm(true);
      }}
    />,
    <DigitalTwinChat {...props} />,
    <Quiz {...props} />,
    <FinalHandover {...props} onReplay={replay} />,
  ];

  return (
    <main className="stage-bg relative min-h-screen overflow-x-hidden">
      <div aria-hidden className="grid-lines pointer-events-none absolute inset-0" />
      {!reduced && <Particles />}

      <header className="relative z-20 flex items-center justify-between px-5 py-5 sm:px-10">
        <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          agent://handover
        </span>
        <nav aria-label="Progress" className="flex items-center gap-1.5">
          {farewell.scenes.map((label, i) => (
            <span
              key={label}
              title={i <= scene ? label : "Locked"}
              aria-label={i <= scene ? `Scene ${i + 1}: ${label}` : `Scene ${i + 1}: locked`}
              aria-current={i === scene ? "step" : undefined}
              className={`h-1 rounded-full transition-all duration-500 ${i === scene ? "w-8 bg-primary" : i < scene ? "w-4 bg-primary/50" : "w-4 bg-border"}`}
            />
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <button
            className="btn-ghost-mono flex items-center gap-1.5"
            onClick={() => setMuted(!muted)}
            aria-label={muted ? "Turn sound on" : "Mute sound"}
            aria-pressed={!muted}
          >
            {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            <span className="hidden sm:inline">{muted ? "Sound off" : "Sound on"}</span>
          </button>
          {!skip && !reduced && started && scene < farewell.scenes.length - 1 && (
            <button className="btn-ghost-mono" onClick={() => setSkip(true)}>
              Skip animation
            </button>
          )}
          {started && (
            <span className="btn-ghost-mono" title="Achievements">
              🏆 {count}/{totalAchievements}
            </span>
          )}
          {scene > 0 && (
            <button className="btn-ghost-mono" onClick={replay}>
              Replay
            </button>
          )}
        </div>
      </header>

      <div className="relative z-10 px-5 sm:px-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={started ? `${run}-${scene}` : "gate"}
            initial={started ? { opacity: 0, y: 24, filter: "blur(6px)" } : false}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -24, filter: "blur(6px)" }}
            transition={{ duration: reduced ? 0 : 0.6 }}
          >
            {started ? (
              views[scene]
            ) : (
              <StartGate
                onStart={(n) => {
                  setName(n);
                  setStarted(true);
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <GlobalNoteAccess name={name} />
      <AchievementToasts onCount={onCount} />
      <BonusReel open={bonus} onClose={() => setBonus(false)} />
    </main>
  );
}
