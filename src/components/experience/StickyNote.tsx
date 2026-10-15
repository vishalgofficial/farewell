import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MessageSquareHeart, X } from "lucide-react";
import { farewell } from "@/config/farewell";
import { unlock } from "@/lib/achievements";
import { createSharedNote, likeSharedNote, listSharedNotes, type SharedNote } from "@/lib/notes";
import { sfx } from "@/lib/sound";

type Note = SharedNote;
type LegacyNote = { id: number; text: string; from: string; likes?: number };
const colors = ["bg-note-1", "bg-note-2", "bg-note-3", "bg-note-4", "bg-note-5"];
const emojis = ["💛", "🎉", "🚀", "✨", "🙌", "🥹"];
const KEY = "vishal-notes";
const NOTES_UPDATED_EVENT = "vishal:notes-updated";
const MAX_NOTE_LENGTH = 5000;
const tilts = ["-rotate-3", "rotate-2", "-rotate-1", "rotate-3", "rotate-1", "-rotate-2"];

function readLegacyNotes(): LegacyNote[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

async function readNotes(): Promise<Note[]> {
  const legacyNotes = readLegacyNotes();
  if (legacyNotes.length > 0) {
    await Promise.all(
      legacyNotes.map((note) =>
        createSharedNote({
          data: {
            clientId: `legacy-${note.id}`,
            text: note.text.slice(0, MAX_NOTE_LENGTH),
            from: (note.from || "A colleague").slice(0, 24),
          },
        }),
      ),
    );
    localStorage.removeItem(KEY);
  }
  return listSharedNotes();
}

function notifyNotesUpdated() {
  window.dispatchEvent(new Event(NOTES_UPDATED_EVENT));
}

export function NoteWall({ name }: { name: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [open, setOpen] = useState(false);
  const [burst, setBurst] = useState(0);
  const [error, setError] = useState("");
  const like = async (id: string) => {
    sfx.blip();
    setNotes((current) =>
      current.map((note) => (note.id === id ? { ...note, likes: note.likes + 1 } : note)),
    );
    try {
      const updated = await likeSharedNote({ data: { id } });
      setNotes((current) => current.map((note) => (note.id === id ? updated : note)));
      notifyNotesUpdated();
    } catch {
      setError("Could not send that heart. Please try again.");
      setNotes(await readNotes());
    }
  };

  useEffect(() => {
    const sync = async () => {
      try {
        setNotes(await readNotes());
        setError("");
      } catch {
        setError("The shared wall is taking a moment to load.");
      }
    };
    void sync();
    window.addEventListener(NOTES_UPDATED_EVENT, sync);
    const t = setTimeout(() => setOpen(true), 4500);
    return () => {
      clearTimeout(t);
      window.removeEventListener(NOTES_UPDATED_EVENT, sync);
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
          {error || "No notes yet — be the first to stick one here."}
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
                  ❤️ {n.likes}
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
  const [wallOpen, setWallOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const sync = async () => {
      try {
        setNotes(await readNotes());
        setError("");
      } catch {
        setError("The shared wall is taking a moment to load. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    void sync();
    window.addEventListener(NOTES_UPDATED_EVENT, sync);
    return () => {
      window.removeEventListener(NOTES_UPDATED_EVENT, sync);
    };
  }, []);

  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => {
          sfx.click();
          setWallOpen(true);
        }}
        className="glass fixed bottom-5 left-5 z-[60] flex items-center gap-2 rounded-full border border-primary/50 px-4 py-3 font-mono text-xs uppercase tracking-wider text-primary shadow-[0_0_30px_-12px_var(--color-primary)]"
        aria-label="View the note wall"
      >
        <MessageSquareHeart className="size-4" />
        <span>View note wall</span>
      </motion.button>

      <AnimatePresence>
        {wallOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] overflow-y-auto bg-background/90 p-5 backdrop-blur-md"
            onClick={() => setWallOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Farewell note wall"
          >
            <motion.div
              initial={{ scale: 0.97, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.97 }}
              onClick={(event) => event.stopPropagation()}
              className="mx-auto min-h-full w-full max-w-6xl py-4"
            >
              <div className="glass sticky top-0 z-20 mb-8 flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary">
                    Farewell messages
                  </p>
                  <h2 className="mt-1 text-3xl font-semibold">The note wall</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {loading
                      ? "Loading everyone’s messages…"
                      : notes.length === 0
                        ? "Be the first person to leave a message."
                        : `${notes.length} ${notes.length === 1 ? "note" : "notes"} shared so far.`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className="btn-mission border-primary bg-primary/15"
                    onClick={() => {
                      sfx.click();
                      setWallOpen(false);
                      setComposerOpen(true);
                    }}
                  >
                    <MessageSquareHeart className="size-4" /> Add your note
                  </button>
                  <button
                    aria-label="Close note wall"
                    onClick={() => setWallOpen(false)}
                    className="rounded-full border border-border p-2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-5" />
                  </button>
                </div>
              </div>

              {error ? (
                <div className="glass mx-auto grid max-w-xl place-items-center gap-4 p-10 text-center">
                  <span className="text-5xl" aria-hidden>
                    🛰️
                  </span>
                  <p className="text-lg">{error}</p>
                  <button
                    className="btn-mission"
                    onClick={() => {
                      setLoading(true);
                      setError("");
                      void readNotes()
                        .then(setNotes)
                        .catch(() => setError("The shared wall is still unavailable."))
                        .finally(() => setLoading(false));
                    }}
                  >
                    Try again
                  </button>
                </div>
              ) : loading ? (
                <div className="grid place-items-center py-24" role="status">
                  <p className="animate-pulse font-mono text-sm uppercase tracking-widest text-primary">
                    Loading notes…
                  </p>
                </div>
              ) : notes.length === 0 ? (
                <div className="glass mx-auto grid max-w-xl place-items-center gap-4 p-10 text-center">
                  <span className="text-5xl" aria-hidden>
                    💌
                  </span>
                  <p className="text-lg">This wall is waiting for its first memory.</p>
                  <button
                    className="btn-mission"
                    onClick={() => {
                      setWallOpen(false);
                      setComposerOpen(true);
                    }}
                  >
                    Leave the first note
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-start justify-center gap-6 pb-12">
                  {notes.map((note, index) => (
                    <motion.article
                      key={note.id}
                      initial={{ opacity: 0, scale: 0.8, y: 24 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.04, 0.4) }}
                      className={`relative w-72 max-w-full p-5 text-left text-note-ink shadow-xl ${colors[index % colors.length]} ${tilts[index % tilts.length]}`}
                    >
                      <span
                        aria-hidden
                        className="absolute -top-2 left-1/2 h-4 w-12 -translate-x-1/2 bg-foreground/30"
                      />
                      <span aria-hidden className="absolute -right-2 -top-3 text-2xl">
                        {emojis[index % emojis.length]}
                      </span>
                      <p className="whitespace-pre-wrap break-words font-serif text-base leading-relaxed">
                        {note.text}
                      </p>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <p className="font-mono text-xs opacity-80">— {note.from}</p>
                        <span className="text-xs">❤️ {note.likes}</span>
                      </div>
                    </motion.article>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <NoteComposer
        open={composerOpen}
        onClose={() => {
          setComposerOpen(false);
          setWallOpen(true);
        }}
        name={name}
      />
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && !from) setFrom(name);
  }, [open, name, from]);

  const add = async () => {
    setSaving(true);
    setError("");
    try {
      await createSharedNote({
        data: {
          clientId: crypto.randomUUID(),
          text: text.trim(),
          from: from.trim() || "A colleague",
        },
      });
      notifyNotesUpdated();
      unlock("note");
      sfx.chime();
      setText("");
      onSaved?.();
      onClose();
    } catch {
      setError("Your note could not be shared. Please try again.");
    } finally {
      setSaving(false);
    }
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
            {error && (
              <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </p>
            )}
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
                disabled={!text.trim() || saving}
                onClick={() => void add()}
                className="btn-mission flex-1 justify-center disabled:opacity-40"
              >
                {saving ? "Sharing…" : "Stick it on the wall"}
              </button>
              <button
                disabled={!text.trim() || saving}
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
