import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy, RotateCcw, ShieldAlert } from "lucide-react";
import { farewell } from "@/config/farewell";
import { photos } from "@/config/photos";
import { sfx } from "@/lib/sound";
import { unlock } from "@/lib/achievements";
import { Credits } from "./Overlays";
import { NoteWall } from "./StickyNote";
import { type SceneProps } from "./shared";

export function FinalHandover({
  instant,
  onReplay,
  name = "",
}: SceneProps & { onReplay: () => void }) {
  const f = farewell.final;
  const [phase, setPhase] = useState<"report" | "error" | "farewell">("report");
  const [copied, setCopied] = useState(false);
  const [credits, setCredits] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(t.current), []);

  const terminate = () => {
    sfx.error();
    unlock("terminate");
    setPhase("error");
    t.current = setTimeout(
      () => {
        sfx.chime();
        setPhase("farewell");
      },
      instant ? 400 : 3800,
    );
  };

  const copy = async () => {
    const text = [f.heading, f.subheading, "", ...f.message, "", f.signature, f.tagline].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="mx-auto flex min-h-[75vh] w-full max-w-3xl flex-col justify-center py-10">
      <AnimatePresence mode="wait">
        {phase === "report" && (
          <motion.div key="r" exit={{ opacity: 0, scale: 0.97 }} className="space-y-8">
            <div className="glass p-6 font-mono text-sm sm:p-8 sm:text-base">
              <div className="mb-5 text-muted-foreground">FINAL HANDOVER REPORT</div>
              {f.report.map(([k, v], i) => (
                <motion.div
                  key={k}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.3 }}
                  className="flex gap-2"
                >
                  <span>{k}</span>
                  <span className="flex-1 overflow-hidden whitespace-nowrap text-muted-foreground/40">
                    {"·".repeat(60)}
                  </span>
                  <span className="text-success">{v}</span>
                </motion.div>
              ))}
            </div>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              onClick={terminate}
              className="btn-mission border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              [ {f.terminateLabel} ]
            </motion.button>
          </motion.div>
        )}

        {phase === "error" && (
          <motion.div
            key="e"
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: [0, -8, 8, -5, 5, 0] }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.6 }}
            role="alert"
            className="rounded-xl border border-destructive/50 bg-destructive/10 p-8 font-mono text-sm sm:text-base"
          >
            <ShieldAlert className="mb-4 size-8 text-destructive" />
            {f.error.map((l, i) => (
              <div key={i} className={i === 0 ? "font-semibold text-destructive" : ""}>
                {l || "\u00a0"}
              </div>
            ))}
          </motion.div>
        )}

        {phase === "farewell" && (
          <motion.div
            key="f"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative space-y-8 text-center"
          >
            <motion.img
              aria-hidden
              src={photos.dinner.src}
              alt=""
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 0.18, scale: 1 }}
              transition={{ duration: 4 }}
              className="pointer-events-none absolute left-1/2 top-1/2 -z-20 h-[120%] w-[140%] max-w-none -translate-x-1/2 -translate-y-1/2 rounded-3xl object-cover blur-[2px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
            />
            <Sparks />
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-glow text-5xl font-semibold tracking-tight sm:text-7xl"
            >
              {f.heading}
            </motion.h1>
            {name && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="font-mono text-sm text-muted-foreground"
              >
                Thank you for being part of it, {name}.
              </motion.p>
            )}
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="font-mono text-lg tracking-[0.3em] text-primary sm:text-xl"
            >
              {f.subheading}
            </motion.h2>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6, duration: 1 }}
              className="mx-auto max-w-xl space-y-4 font-serif text-xl leading-relaxed text-foreground/90 sm:text-2xl"
            >
              {f.message.map((m, i) => (
                <p key={i}>{m}</p>
              ))}
              <p className="pt-2 italic text-primary">{f.signature}</p>
              <p className="flex flex-wrap justify-center gap-x-5 gap-y-1 pt-1 font-mono text-sm not-italic">
                <a
                  className="underline-offset-4 hover:text-primary hover:underline"
                  href={`mailto:${farewell.contact.email}`}
                >
                  {farewell.contact.email}
                </a>
                <a
                  className="underline-offset-4 hover:text-primary hover:underline"
                  href={farewell.contact.phoneHref}
                >
                  {farewell.contact.phone}
                </a>
              </p>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.6 }}
              className="text-sm font-medium tracking-wide"
            >
              {f.tagline}
            </motion.p>
            <motion.code
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.2 }}
              className="block font-mono text-xs text-muted-foreground"
            >
              {f.endnote}
            </motion.code>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.6 }}
              className="flex flex-wrap justify-center gap-3 pt-4"
            >
              <button
                onClick={() => {
                  sfx.click();
                  setCredits(true);
                }}
                className="btn-mission border-primary bg-primary/15"
              >
                🎬 Roll credits
              </button>
              <button onClick={onReplay} className="btn-mission">
                <RotateCcw className="size-4" /> Replay experience
              </button>
              <button onClick={copy} className="btn-mission">
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}{" "}
                {copied ? "Copied" : "Copy farewell message"}
              </button>
            </motion.div>
            <NoteWall name={name} />
          </motion.div>
        )}
      </AnimatePresence>
      <Credits open={credits} onClose={() => setCredits(false)} name={name} />
    </div>
  );
}

function Sparks() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {Array.from({ length: 18 }).map((_, i) => {
        const angle = (i / 18) * Math.PI * 2;
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-16 size-1.5 rounded-full bg-primary"
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{ x: Math.cos(angle) * 220, y: Math.sin(angle) * 140, opacity: [0, 1, 0] }}
            transition={{ duration: 2.4, delay: 0.3 + (i % 3) * 0.1, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}
