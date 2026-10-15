import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { farewell } from "@/config/farewell";
import { memoryWall } from "@/config/photos";
import {
  ACHIEVEMENTS,
  onUnlock,
  totalAchievements,
  unlock,
  type AchievementId,
} from "@/lib/achievements";
import { sfx } from "@/lib/sound";

export function AchievementToasts({ onCount }: { onCount: (n: number) => void }) {
  const [list, setList] = useState<{ key: number; id: AchievementId; total: number }[]>([]);
  useEffect(
    () =>
      onUnlock((id, total) => {
        onCount(total);
        sfx.check();
        const key = Date.now() + Math.random();
        setList((l) => [...l, { key, id, total }]);
        setTimeout(() => setList((l) => l.filter((x) => x.key !== key)), 3800);
      }),
    [onCount],
  );
  return (
    <div
      className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col gap-2"
      aria-live="polite"
    >
      <AnimatePresence>
        {list.map(({ key, id, total }) => {
          const a = ACHIEVEMENTS[id];
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80 }}
              className="glass flex items-center gap-3 px-4 py-3 shadow-[0_0_40px_-10px_var(--color-primary)]"
            >
              <motion.span
                initial={{ rotate: -30, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="text-2xl"
              >
                {a.icon}
              </motion.span>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
                  Achievement unlocked · {total}/{totalAchievements}
                </div>
                <div className="text-sm font-semibold">{a.title}</div>
                <div className="text-xs text-muted-foreground">{a.desc}</div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export function BonusReel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!open) return;
    setI(0);
    const id = setInterval(() => setI((n) => (n + 1) % memoryWall.length), 3200);
    return () => clearInterval(id);
  }, [open]);
  const p = memoryWall[i];
  return (
    <AnimatePresence>
      {open && p && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-background/95 p-6 backdrop-blur"
          role="dialog"
          aria-label="Bonus reel"
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-5 top-5 rounded-full border border-border p-2"
          >
            <X className="size-5" />
          </button>
          <div className="w-full max-w-3xl space-y-4 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
              🎞️ Director's cut · classified footage
            </p>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border">
              <AnimatePresence mode="sync">
                <motion.img
                  key={p.src}
                  src={p.src}
                  alt={p.alt}
                  initial={{ opacity: 0, scale: 1.15 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.4 }}
                  className="absolute inset-0 size-full object-cover"
                />
              </AnimatePresence>
            </div>
            <motion.p
              key={p.caption}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-serif text-2xl italic"
            >
              {p.caption}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Credits({
  open,
  onClose,
  name,
}: {
  open: boolean;
  onClose: () => void;
  name: string;
}) {
  const c = farewell.credits;
  const [note, setNote] = useState("");
  const [ended, setEnded] = useState(false);
  useEffect(() => {
    if (open) setEnded(false);
  }, [open]);
  const send = () => {
    unlock("note");
    const subject = encodeURIComponent(`Farewell note${name ? ` from ${name}` : ""}`);
    window.location.href = `mailto:${farewell.contact.email}?subject=${subject}&body=${encodeURIComponent(note)}`;
  };
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-hidden bg-background"
          role="dialog"
          aria-label="Credits"
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-5 top-5 z-10 rounded-full border border-border p-2"
          >
            <X className="size-5" />
          </button>
          {!ended ? (
            <motion.div
              initial={{ y: "100vh" }}
              animate={{ y: "-100%" }}
              transition={{ duration: 34, ease: "linear" }}
              onAnimationComplete={() => {
                setEnded(true);
                unlock("credits");
              }}
              className="mx-auto max-w-xl space-y-14 px-6 pb-[20vh] text-center"
            >
              <h2 className="text-glow text-5xl font-semibold">AGENT VISHAL</h2>
              <p className="font-mono text-sm tracking-[0.3em] text-muted-foreground">
                THE FINAL HANDOVER
              </p>
              {c.sections.map(([role, who]) => (
                <div key={role} className="space-y-2">
                  <div className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    {role}
                  </div>
                  <div className="font-serif text-2xl">{who}</div>
                </div>
              ))}
              {c.names.length > 0 && (
                <div className="space-y-2">
                  <div className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    With gratitude to
                  </div>
                  {c.names.map((n) => (
                    <div key={n} className="font-serif text-2xl">
                      {n}
                    </div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-3 gap-2">
                {memoryWall.map((p) => (
                  <img
                    key={p.src}
                    src={p.src}
                    alt={p.alt}
                    className="aspect-square rounded-lg object-cover"
                  />
                ))}
              </div>
              {name && (
                <div className="space-y-2">
                  <div className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Special guest appearance
                  </div>
                  <div className="font-serif text-3xl text-primary">{name}</div>
                </div>
              )}
              <p className="font-serif text-2xl italic">{c.closing}</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-5 px-6 text-center"
            >
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
                Post-credits scene
              </p>
              <h2 className="text-3xl font-semibold">Leave Vishal a goodbye note</h2>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={5}
                maxLength={5000}
                placeholder="A memory, a thank-you, an inside joke…"
                aria-label="Your note"
                className="glass w-full resize-none p-4 text-sm outline-none focus:border-primary"
              />
              <p className="text-right font-mono text-xs text-muted-foreground">
                {note.length.toLocaleString()} / 5,000 characters
              </p>
              <button
                disabled={!note.trim()}
                onClick={send}
                className="btn-mission mx-auto disabled:opacity-40"
              >
                [ Send to Vishal 💌 ]
              </button>
              <p className="text-xs text-muted-foreground">
                Opens your email app with the note ready to send.
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
