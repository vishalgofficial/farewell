import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bug, Hammer, Rocket, Sparkles, Users } from "lucide-react";
import { farewell, type Milestone } from "@/config/farewell";
import { useTypedLines } from "@/hooks/useTypewriter";
import { Line, MissionButton, type SceneProps } from "./shared";

const glyphs: Record<Milestone["glyph"], typeof Bug> = {
  spark: Sparkles,
  build: Hammer,
  rocket: Rocket,
  bug: Bug,
  people: Users,
};

export function MemoryTimeline({ onNext, instant }: SceneProps) {
  const ms = farewell.milestones;
  const [active, setActive] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const { lines, done } = useTypedLines(farewell.memoryAnalysis, {
    start: analyzing,
    instant,
    speed: 22,
  });
  const m = ms[active]!;
  const Icon = glyphs[m.glyph];
  const last = active === ms.length - 1;

  if (analyzing) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center gap-8 font-mono">
        <div className="text-sm leading-7 text-muted-foreground sm:text-base">
          {lines.map((l, i) => (
            <Line key={i} text={l} />
          ))}
        </div>
        {done && (
          <>
            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.4em" }}
              animate={{ opacity: 1, letterSpacing: "0.05em" }}
              transition={{ delay: 0.8, duration: 1.4 }}
              className="text-glow text-2xl font-semibold text-primary sm:text-4xl"
            >
              {farewell.memoryFinding}
            </motion.p>
            <div>
              <MissionButton onClick={onNext} delay={2.4}>
                {farewell.memoryCta}
              </MissionButton>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 py-10">
      <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Memory reconstruction · {active + 1}/{ms.length}
      </div>

      <div
        className="relative flex items-center justify-between"
        role="tablist"
        aria-label="Milestones"
      >
        <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
        <motion.div
          className="absolute left-0 top-1/2 h-px bg-primary"
          animate={{ width: `${(active / (ms.length - 1)) * 100}%` }}
          transition={{ duration: 0.6 }}
        />
        {ms.map((x, i) => (
          <button
            key={x.id}
            role="tab"
            aria-selected={i === active}
            aria-label={x.title}
            onClick={() => setActive(i)}
            className={`relative z-10 size-4 rounded-full border-2 transition-all ${i <= active ? "border-primary bg-primary" : "border-border bg-background"} ${i === active ? "scale-150" : ""}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.article
          key={m.id}
          initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
          transition={{ duration: 0.5 }}
          className="glass relative grid items-center gap-8 overflow-hidden p-5 sm:p-8 md:grid-cols-[1.25fr_1fr]"
        >
          <motion.figure
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="photo-frame aspect-[4/3]"
          >
            <img src={m.photo.src} alt={m.photo.alt} loading="lazy" />
            <figcaption className="absolute bottom-3 left-4 z-10 font-mono text-[11px] uppercase tracking-widest text-foreground/80">
              ● REC · {m.photo.caption}
            </figcaption>
          </motion.figure>
          <div className="relative">
            <motion.div
              aria-hidden
              initial={{ scale: 0.6, rotate: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 0.08 }}
              transition={{ duration: 1 }}
              className="absolute -right-6 -top-10 text-primary"
            >
              <Icon className="size-40" strokeWidth={0.8} />
            </motion.div>
            <div className="mb-4 font-mono text-xs text-primary">MEMORY_0{active + 1}</div>
            <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">{m.title}</h2>
            <p className="text-lg text-muted-foreground">{m.body}</p>
          </div>
        </motion.article>
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          className="btn-ghost-mono disabled:opacity-30"
          disabled={active === 0}
          onClick={() => setActive((a) => a - 1)}
        >
          ← Previous
        </button>
        {last ? (
          <MissionButton onClick={() => setAnalyzing(true)}>Analyze memories</MissionButton>
        ) : (
          <button className="btn-mission" onClick={() => setActive((a) => a + 1)}>
            Next memory →
          </button>
        )}
      </div>
    </div>
  );
}
