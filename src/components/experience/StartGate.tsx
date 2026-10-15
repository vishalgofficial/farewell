import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Fingerprint } from "lucide-react";
import { photos } from "@/config/photos";
import { sfx } from "@/lib/sound";

const HOLD_MS = 600;

// Cinematic gate: transmission -> identify -> hold-to-scan -> access granted.
export function StartGate({ onStart }: { onStart: (name: string) => void }) {
  const [phase, setPhase] = useState<"signal" | "identify" | "scan" | "granted">("signal");
  const [name, setName] = useState("");
  const [progress, setProgress] = useState(0);
  const raf = useRef(0);
  const startT = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current);
      timers.current.forEach(clearTimeout);
    },
    [],
  );

  const wake = () => {
    sfx.unlock();
    sfx.startAmbient();
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    wake();
    sfx.click();
    setPhase("scan");
  };

  const hold = () => {
    wake();
    startT.current = performance.now();
    const tick = () => {
      const p = Math.min(1, (performance.now() - startT.current) / HOLD_MS);
      setProgress(p);
      if (Math.random() < 0.35) sfx.key();
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else {
        sfx.check();
        setPhase("granted");
        timers.current.push(setTimeout(() => onStart(name.trim()), 700));
      }
    };
    raf.current = requestAnimationFrame(tick);
  };
  const release = () => {
    if (phase !== "scan") return;
    cancelAnimationFrame(raf.current);
    setProgress(0);
  };

  const display = name.trim() || "Agent";
  const C = 2 * Math.PI * 54;

  return (
    <div className="relative flex min-h-[80vh] flex-col items-center justify-center text-center">
      <motion.img
        aria-hidden
        src={photos.makerspace.src}
        alt=""
        initial={{ opacity: 0, scale: 1.15 }}
        animate={{ opacity: 0.12, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="pointer-events-none absolute inset-0 -z-10 m-auto h-full w-full max-w-4xl rounded-3xl object-cover grayscale [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]"
      />
      <AnimatePresence mode="wait">
        {phase === "signal" && (
          <motion.div
            key="s"
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-8"
          >
            <motion.p
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="font-mono text-xs uppercase tracking-[0.4em] text-primary"
            >
              ● A farewell from Vishal Gaikwad
            </motion.p>
            <h1
              className="glitch text-glow text-4xl font-semibold tracking-tight sm:text-6xl"
              data-text="Vishal is moving on."
            >
              Vishal is moving on.
            </h1>
            <p className="max-w-md text-muted-foreground">
              After his journey at Foundry R&D, he made this short interactive goodbye for the team
              — memories, photos, a chat with his digital twin and a final message.
            </p>
            <button
              className="btn-mission"
              onClick={() => {
                wake();
                sfx.click();
                setPhase("identify");
              }}
            >
              [ Start the experience ▶ ]
            </button>
            <p className="text-xs text-muted-foreground">🎧 Turn your sound on · ~4 minutes</p>
          </motion.div>
        )}

        {phase === "identify" && (
          <motion.form
            key="i"
            onSubmit={submit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex w-full max-w-md flex-col items-center gap-6"
          >
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Step 1 / 2 · Identify yourself
            </p>
            <h2 className="text-3xl font-semibold sm:text-4xl">What should we call you, agent?</h2>
            <input
              autoFocus
              value={name}
              maxLength={24}
              onChange={(e) => {
                setName(e.target.value);
                sfx.key();
              }}
              placeholder="Your first name"
              aria-label="Your first name"
              className="w-full border-b-2 border-primary/40 bg-transparent py-3 text-center font-mono text-2xl outline-none transition-colors focus:border-primary placeholder:text-muted-foreground/40"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!name.trim()}
                className="btn-mission disabled:opacity-40"
              >
                [ Confirm identity ]
              </button>
              <button
                type="button"
                className="btn-ghost-mono"
                onClick={() => {
                  setName("");
                  setPhase("scan");
                }}
              >
                Stay anonymous
              </button>
            </div>
          </motion.form>
        )}

        {phase === "scan" && (
          <motion.div
            key="sc"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center gap-6"
          >
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Step 2 / 2 · Biometric check
            </p>
            <h2 className="text-3xl font-semibold sm:text-4xl">Press and hold to scan</h2>
            <button
              aria-label="Press and hold to scan fingerprint"
              onPointerDown={hold}
              onPointerUp={release}
              onPointerLeave={release}
              onKeyDown={(e) => {
                if ((e.key === " " || e.key === "Enter") && !e.repeat) hold();
              }}
              onKeyUp={release}
              className="relative grid size-40 touch-none select-none place-items-center rounded-full"
            >
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  className="stroke-border"
                  strokeWidth="3"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  className="stroke-primary"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - progress)}
                />
              </svg>
              <motion.span
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="grid size-28 place-items-center rounded-full bg-primary/10 shadow-[0_0_60px_-10px_var(--color-primary)]"
              >
                <Fingerprint className="size-16 text-primary" strokeWidth={1.2} />
              </motion.span>
            </button>
            <p className="font-mono text-sm text-primary">
              {progress > 0
                ? `Scanning ${display}… ${Math.round(progress * 100)}%`
                : "Awaiting fingerprint"}
            </p>
          </motion.div>
        )}

        {phase === "granted" && (
          <motion.div
            key="g"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <p className="font-mono text-sm tracking-[0.4em] text-success">ACCESS GRANTED ✓</p>
            <h2 className="text-glow text-4xl font-semibold sm:text-6xl">Welcome, {display}.</h2>
            <p className="font-serif text-xl italic text-muted-foreground">
              Vishal has a handover for you.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
