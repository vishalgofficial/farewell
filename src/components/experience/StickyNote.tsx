import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MessageSquareHeart, X } from "lucide-react";
import { farewell } from "@/config/farewell";
import { unlock } from "@/lib/achievements";
import { sfx } from "@/lib/sound";

type Note = { id: number; text: string; from: string; likes?: number };
const colors = ["bg-note-1", "bg-note-2", "bg-note-3", "bg-note-4", "bg-note-5"];
const emojis = ["💛", "🎉", "🚀", "✨", "🙌", "🥹"];
const KEY = "vishal-notes";
const NOTES_UPDATED_EVENT = "vishal:notes-updated";
const MAX_NOTE_LENGTH = 5000;
const tilts = ["-rotate-3", "rotate-2", "-rotate-1", "rotate-3", "rotate-1", "-rotate-2"];

function readNotes(): Note[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function persistNotes(notes: Note[]) {
  localStorage.setItem(KEY, JSON.stringify(notes));
  window.dispatchEvent(new Event(NOTES_UPDATED_EVENT));
}

export function NoteWall({ name }: { name: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [open, setOpen] = useState(false);
  const [burst, setBurst] = useState(0);
  const save = (all: Note[]) => {
    setNotes(all);
    persistNotes(all);
  };
  const like = (id: number) => {
    sfx.blip();
    save(notes.map((n) => (n.id === id ? { ...n, likes: (n.likes ?? 0) + 1 } : n)));
  };

  useEffect(() => {
    const sync = () => setNotes(readNotes());
    sync();
    window.addEventListener(NOTES_UPDATED_EVENT, sync);
    window.addEventListener("storage", sync);
    const t = setTimeout(() => setOpen(true), 4500);
    return () => {
      clearTimeout(t);
      window.removeEventListener(NOTES_UPDATED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <section className="space-y-6 pt-10">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <h3 className="text-2xl font-semibold">Message wall</h3>
        <button
          onClick={() => {
            sfx.click();
            setOpen(true);
          }}
          className="btn-mission border-primary bg-primary/15"
        >
          <MessageSquareHeart className="size-4" /> Leave a message
        </button>
      </div>
      {notes.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No notes yet — be the first to stick one here.
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-5">
        <AnimatePresence>
          {notes.map((n, i) => (
            <motion.div
              key={n.id}
              drag
              dragSnapToOrigin
              whileDrag={{ scale: 1.12, rotate: 0, zIndex: 30 }}
              initial={{ opacity: 0, scale: 0.2, y: -120, rotate: -30 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
              whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0], transition: { duration: 0.4 } }}
              transition={{ type: "spring", stiffness: 260, damping: 14 }}
              className={`relative w-72 max-w-full cursor-grab p-4 text-left text-note-ink shadow-xl active:cursor-grabbing ${colors[i % colors.length]} ${tilts[i % tilts.length]}`}
            >
              <span
                aria-hidden
                className="absolute -top-2 left-1/2 h-4 w-12 -translate-x-1/2 bg-foreground/30"
              />
              <span aria-hidden className="absolute -right-2 -top-3 text-2xl">
                {emojis[i % emojis.length]}
              </span>
              <p className="whitespace-pre-wrap break-words font-serif text-base leading-snug">
                {n.text}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <p className="font-mono text-xs opacity-80">— {n.from}</p>
                <motion.button
                  whileTap={{ scale: 1.6 }}
                  onClick={() => like(n.id)}
                  aria-label="Send love"
                  className="rounded-full bg-background/20 px-2 py-0.5 text-xs"
                >
                  ❤️ {n.likes ?? 0}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Confetti key={burst} on={burst > 0} />
      <NoteComposer
        open={open}
        onClose={() => setOpen(false)}
        name={name}
        onSaved={() => setBurst((b) => b + 1)}
      />
    </section>
  );
}

export function GlobalNoteAccess({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => {
          sfx.click();
          setOpen(true);
        }}
        className="glass fixed bottom-5 left-5 z-[60] flex items-center gap-2 rounded-full border border-primary/50 px-4 py-3 font-mono text-xs uppercase tracking-wider text-primary shadow-[0_0_30px_-12px_var(--color-primary)]"
        aria-label="Leave Vishal a note"
      >
        <MessageSquareHeart className="size-4" />
        <span>Leave a note</span>
      </motion.button>
      <NoteComposer open={open} onClose={() => setOpen(false)} name={name} />
    </>
  );
}

function NoteComposer({
  open,
  onClose,
  name,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  name: string;
  onSaved?: () => void;
}) {
  const [text, setText] = useState("");
  const [from, setFrom] = useState(name);

  useEffect(() => {
    if (open && !from) setFrom(name);
  }, [open, name, from]);

  const add = () => {
    const note: Note = {
      id: Date.now(),
      text: text.trim(),
      from: from.trim() || "A colleague",
    };
    persistNotes([...readNotes(), note]);
    unlock("note");
    sfx.chime();
    setText("");
    onSaved?.();
    onClose();
  };
  const mail = () => {
    const subject = encodeURIComponent(`Farewell note from ${from.trim() || "a colleague"}`);
    window.location.href = `mailto:${farewell.contact.email}?subject=${subject}&body=${encodeURIComponent(text)}`;
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-background/70 p-5 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Leave Vishal a note"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="glass my-auto w-full max-w-md space-y-4 p-6 text-left"
          >
            <div className="flex items-center justify-between">
              <p className="text-xl font-semibold">Leave Vishal a note 💌</p>
              <button
                aria-label="Close"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
            <textarea
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              maxLength={MAX_NOTE_LENGTH}
              placeholder="A memory, a thank-you, an inside joke…"
              aria-label="Your note"
              className="w-full resize-y rounded-lg border border-border bg-background/60 p-3 outline-none focus:border-primary"
            />
            <p className="text-right font-mono text-xs text-muted-foreground">
              {text.length.toLocaleString()} / {MAX_NOTE_LENGTH.toLocaleString()} characters
            </p>
            <input
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              maxLength={24}
              placeholder="Your name"
              aria-label="Your name"
              className="w-full rounded-lg border border-border bg-background/60 p-3 outline-none focus:border-primary"
            />
            <div className="flex flex-wrap gap-3">
              <button
                disabled={!text.trim()}
                onClick={add}
                className="btn-mission flex-1 justify-center disabled:opacity-40"
              >
                Stick it on the wall
              </button>
              <button
                disabled={!text.trim()}
                onClick={mail}
                className="btn-ghost-mono disabled:opacity-40"
              >
                Also email
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Confetti({ on }: { on: boolean }) {
  if (!on) return null;
  const pieces = ["🎉", "💛", "✨", "🎊", "💌", "⭐"];
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-1/2 text-2xl"
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
          animate={{
            x: (Math.random() - 0.5) * 900,
            y: (Math.random() - 0.8) * 700,
            opacity: 0,
            scale: 1.4,
            rotate: Math.random() * 720,
          }}
          transition={{ duration: 1.6 + Math.random(), ease: "easeOut" }}
        >
          {pieces[i % pieces.length]}
        </motion.span>
      ))}
    </div>
  );
}
