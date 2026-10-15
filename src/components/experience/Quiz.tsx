import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { quiz } from "@/config/farewell";
import { unlock } from "@/lib/achievements";
import { sfx } from "@/lib/sound";
import { MissionButton, type SceneProps } from "./shared";

export function Quiz({ onNext }: SceneProps) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const done = i >= quiz.length;
  const q = quiz[i];

  const pick = (idx: number) => {
    if (picked !== null || !q) return;
    setPicked(idx);
    const right = idx === q.answer;
    if (right) {
      sfx.check();
      setScore((s) => s + 1);
    } else sfx.error();
    setTimeout(() => {
      setPicked(null);
      setI((n) => {
        const nx = n + 1;
        if (nx >= quiz.length && score + (right ? 1 : 0) === quiz.length) {
          sfx.chime();
          unlock("quiz");
        }
        return nx;
      });
    }, 1700);
  };

  const rank =
    score === quiz.length
      ? "Certified Vishal Expert 🏆"
      : score >= quiz.length - 2
        ? "Trusted Teammate 🤝"
        : "Needs more coffee chats ☕";

  return (
    <div className="mx-auto flex min-h-[75vh] w-full max-w-2xl flex-col justify-center gap-8 py-10">
      <div className="flex items-center justify-between font-mono text-xs uppercase tracking-widest text-muted-foreground">
        <span>Clearance test · How well do you know Vishal?</span>
        <span>
          {Math.min(i + 1, quiz.length)}/{quiz.length} · score {score}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-border">
        <motion.div
          className="h-full bg-primary"
          animate={{ width: `${(i / quiz.length) * 100}%` }}
        />
      </div>
      <AnimatePresence mode="wait">
        {!done && q ? (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">{q.question}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {q.options.map((o, idx) => {
                const state =
                  picked === null
                    ? ""
                    : idx === q.answer
                      ? "border-success bg-success/15 text-success"
                      : idx === picked
                        ? "border-destructive bg-destructive/15 text-destructive"
                        : "opacity-40";
                return (
                  <motion.button
                    key={o}
                    whileHover={{ scale: picked === null ? 1.02 : 1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => pick(idx)}
                    className={`glass px-5 py-4 text-left transition-colors hover:border-primary ${state}`}
                  >
                    <span className="mr-2 font-mono text-xs text-muted-foreground">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {o}
                  </motion.button>
                );
              })}
            </div>
            {picked !== null && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-mono text-sm text-muted-foreground"
              >
                {picked === q.answer ? "✓ Correct. " : "✗ Not quite. "}
                {q.reveal}
              </motion.p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-center"
          >
            <div className="text-glow text-7xl font-semibold">
              {score}/{quiz.length}
            </div>
            <p className="text-2xl">{rank}</p>
            <MissionButton onClick={onNext}>Proceed to final handover</MissionButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
