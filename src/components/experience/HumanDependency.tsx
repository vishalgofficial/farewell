import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { farewell } from "@/config/farewell";
import { memoryWall } from "@/config/photos";
import { sfx } from "@/lib/sound";
import { MissionButton, type SceneProps } from "./shared";

export function HumanDependency({ onNext, instant, onWarm }: SceneProps & { onWarm: () => void }) {
  const d = farewell.dependency;
  const [step, setStep] = useState(instant ? 99 : 0);

  useEffect(() => {
    if (instant) {
      onWarm();
      return;
    }
    const timers = [
      ...d.checks.map((_, i) =>
        setTimeout(
          () => {
            sfx.check();
            setStep(i + 1);
          },
          500 + i * 450,
        ),
      ),
      setTimeout(
        () => {
          sfx.alert();
          setStep(10);
        },
        500 + d.checks.length * 450 + 700,
      ),
      setTimeout(
        () => {
          setStep(20);
          onWarm();
        },
        500 + d.checks.length * 450 + 2600,
      ),
    ];
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instant]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-12 py-10">
      <div className="glass p-6 font-mono text-sm sm:p-8 sm:text-base">
        <div className="mb-4 text-muted-foreground">SYSTEM SUCCESS ANALYSIS</div>
        {d.checks.map((c, i) => (
          <div key={c} className="flex gap-2">
            <span>{c}</span>
            <span className="flex-1 overflow-hidden whitespace-nowrap text-muted-foreground/40">
              {"·".repeat(60)}
            </span>
            <span className={step > i ? "text-success" : "text-muted-foreground/40"}>
              {step > i ? "✓" : "…"}
            </span>
          </div>
        ))}
        {step >= 10 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 border-t border-border pt-6"
          >
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ repeat: 2, duration: 0.5 }}
              className="mb-3 font-semibold text-primary"
            >
              CRITICAL DEPENDENCY FOUND
            </motion.div>
            {d.critical.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[8rem_1fr]">
                <span className="text-muted-foreground">{k}:</span>
                <span>{v}</span>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {step >= 20 && (
        <div
          className="relative flex flex-wrap justify-center gap-3 sm:gap-5"
          aria-label="Memory wall"
        >
          {memoryWall.map((p, i) => (
            <motion.figure
              key={p.src}
              initial={{ opacity: 0, y: 40, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: [-4, 3, -2, 4, -3, 2, -1][i] ?? 0 }}
              transition={{ delay: instant ? 0 : i * 0.25, duration: 0.8, ease: "easeOut" }}
              whileHover={{ rotate: 0, scale: 1.06, zIndex: 10 }}
              className="photo-print w-[30%] sm:w-[22%]"
            >
              <img src={p.src} alt={p.alt} loading="lazy" className="aspect-square" />
              <figcaption className="photo-caption absolute inset-x-0 bottom-2 truncate px-2 text-center text-xs sm:text-sm">
                {p.caption}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      )}

      {step >= 20 && (
        <div className="space-y-6 font-serif text-xl leading-relaxed sm:text-2xl">
          {d.message.map((p, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: instant ? 0 : i * 1.6, duration: 1 }}
              className={
                i === 2
                  ? "text-glow text-primary italic"
                  : i === d.message.length - 1
                    ? "italic"
                    : "text-foreground/85"
              }
            >
              {p}
            </motion.p>
          ))}
          <div className="pt-4">
            <MissionButton onClick={onNext} delay={instant ? 0 : d.message.length * 1.6 + 0.8}>
              {d.cta}
            </MissionButton>
          </div>
        </div>
      )}
    </div>
  );
}
