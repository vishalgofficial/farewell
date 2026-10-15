import { motion } from "motion/react";
import { farewell } from "@/config/farewell";
import { photos } from "@/config/photos";
import { MissionButton, type SceneProps } from "./shared";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } };

export function AgentProfile({ onNext }: SceneProps) {
  const p = farewell.profile;
  return (
    <div className="mx-auto w-full max-w-5xl space-y-12 py-10">
      <motion.figure
        initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
        animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
        transition={{ duration: 1.4, ease: [0.2, 0.7, 0.2, 1] }}
        className="photo-frame aspect-[16/9] sm:aspect-[21/9]"
      >
        <img src={photos.vishal.src} alt={photos.vishal.alt} className="object-[50%_35%]" />
        <motion.div
          aria-hidden
          initial={{ top: "0%" }}
          animate={{ top: "100%" }}
          transition={{ duration: 1.8, delay: 0.4, ease: "easeInOut" }}
          className="absolute inset-x-0 z-10 h-px bg-primary shadow-[0_0_24px_var(--color-primary)]"
        />
        <figcaption className="absolute bottom-4 left-5 z-10 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-widest">
          <span className="rounded-sm bg-primary px-2 py-1 text-primary-foreground">
            ID verified
          </span>
          <span className="text-foreground/85">Agent Vishal · Foundry R&D · Makerspace</span>
        </figcaption>
      </motion.figure>
      <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 sm:p-8"
        >
          <div className="mb-6 flex items-center justify-between font-mono text-xs uppercase tracking-widest text-muted-foreground">
            <span>Agent profile</span>
            <span className="flex items-center gap-2 text-success">
              <span className="size-2 animate-pulse rounded-full bg-success" /> live
            </span>
          </div>
          <motion.dl
            variants={container}
            initial="hidden"
            animate="show"
            className="divide-y divide-border"
          >
            {p.fields.map(([k, v]) => (
              <motion.div variants={item} key={k} className="flex justify-between gap-4 py-3">
                <dt className="text-sm text-muted-foreground">{k}</dt>
                <dd className="text-right font-mono text-sm">{v}</dd>
              </motion.div>
            ))}
          </motion.dl>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-6 sm:p-8"
        >
          <div className="mb-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Mission telemetry
          </div>
          <motion.ul variants={container} initial="hidden" animate="show" className="space-y-5">
            {p.metrics.map(([k, v], i) => (
              <motion.li variants={item} key={k}>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-mono text-primary">{v}</span>
                </div>
                <div className="mt-2 h-px overflow-hidden bg-border">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.5 + i * 0.15, duration: 1.2 }}
                  />
                </div>
              </motion.li>
            ))}
          </motion.ul>
          <p className="mt-6 font-mono text-[11px] text-muted-foreground">* {p.disclaimer}</p>
        </motion.section>
      </div>

      <motion.blockquote
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="text-glow text-center font-serif text-3xl italic leading-snug sm:text-5xl"
      >
        "{p.message}"
      </motion.blockquote>
      <div className="flex justify-center">
        <MissionButton onClick={onNext} delay={1.8}>
          {p.cta}
        </MissionButton>
      </div>
    </div>
  );
}
