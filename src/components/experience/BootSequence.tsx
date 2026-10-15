import { motion } from "motion/react";
import { farewell } from "@/config/farewell";
import { useTypedLines } from "@/hooks/useTypewriter";
import { Line, MissionButton, type SceneProps } from "./shared";

export function BootSequence({ onNext, instant, name }: SceneProps) {
  const bootLines = farewell.boot.lines;
  const { lines, done } = useTypedLines(bootLines, { instant, speed: 10, linePause: 120 });
  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-3xl flex-col justify-center gap-10">
      <div
        className="font-mono text-sm leading-7 text-muted-foreground sm:text-base"
        aria-live="polite"
      >
        {lines.map((l, i) => (
          <Line key={i} text={l} className={i === lines.length - 1 && !done ? "caret" : ""} />
        ))}
        {lines.length === 0 && <span className="caret" />}
      </div>
      {done && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="space-y-6"
        >
          <h1 className="text-glow text-5xl font-semibold tracking-tight sm:text-7xl">
            {farewell.boot.title}
          </h1>
          <p className="font-serif text-2xl italic text-muted-foreground sm:text-3xl">
            "{farewell.boot.tagline}"
          </p>
          <MissionButton onClick={onNext} delay={0.6}>
            {farewell.boot.cta}
          </MissionButton>
        </motion.div>
      )}
    </div>
  );
}
