import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { Send, Terminal } from "lucide-react";
import { farewell, qa } from "@/config/farewell";
import { reply } from "@/lib/chat-engine";
import { sfx } from "@/lib/sound";
import { unlock } from "@/lib/achievements";
import { TwinBot, type BotMood } from "./TwinBot";
import { MissionButton, type SceneProps } from "./shared";

type Msg = {
  id: number;
  role: "user" | "ai";
  text: string;
  mono?: boolean;
  streaming?: boolean;
  mood?: BotMood;
};

export function DigitalTwinChat({ onNext, instant }: SceneProps) {
  const a = farewell.assistant;
  const [msgs, setMsgs] = useState<Msg[]>([{ id: 0, role: "ai", text: a.greeting, mood: "wave" }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const idRef = useRef(1);
  const asked = useRef(0);
  const endRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [msgs]);

  const ask = (q: string) => {
    if (!q.trim() || busy) return;
    const r = reply(q);
    asked.current++;
    if (asked.current >= 5) unlock("curious");
    if (r.mono) unlock("secret");
    if (/unlock\s+bonus/i.test(q)) {
      unlock("bonus");
      setTimeout(() => window.dispatchEvent(new Event("vishal:bonus")), instant ? 0 : 1600);
    }
    sfx.send();
    const uid = idRef.current++;
    const aid = idRef.current++;
    setMsgs((m) => [
      ...m,
      { id: uid, role: "user", text: q },
      { id: aid, role: "ai", text: "", mono: r.mono, streaming: true, mood: r.mood },
    ]);
    setInput("");
    if (instant) {
      setMsgs((m) => m.map((x) => (x.id === aid ? { ...x, text: r.text, streaming: false } : x)));
      return;
    }
    setBusy(true);
    let i = 0;
    timers.current.push(setTimeout(() => sfx.boing(), 250));
    const step = () => {
      i = Math.min(r.text.length, i + 2 + Math.floor(Math.random() * 3));
      sfx.blip();
      setMsgs((m) =>
        m.map((x) =>
          x.id === aid ? { ...x, text: r.text.slice(0, i), streaming: i < r.text.length } : x,
        ),
      );
      if (i < r.text.length) timers.current.push(setTimeout(step, 22));
      else setBusy(false);
    };
    timers.current.push(setTimeout(step, 450));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    ask(input);
  };
  const lastAi = [...msgs].reverse().find((x) => x.role === "ai")?.id;
  const suggested = qa.filter((x) => x.suggested);
  const playful = qa.filter((x) => !x.suggested);

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 py-8 lg:grid-cols-[1fr_17rem]">
      <section className="glass flex h-[70vh] min-h-[28rem] flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="font-mono text-sm font-semibold tracking-widest text-primary">
              {a.name}
            </h2>
            <p className="text-xs text-muted-foreground">{a.subtitle}</p>
          </div>
          <span className="flex items-center gap-2 font-mono text-[11px] text-success">
            <span className="size-2 animate-pulse rounded-full bg-success" />
            online
          </span>
        </header>
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5" aria-live="polite">
          {msgs.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={m.role === "user" ? "flex justify-end" : "flex"}
            >
              {m.role === "ai" && (
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 12 }}
                  className="mr-2 self-end"
                >
                  <TwinBot
                    mood={m.mood ?? "happy"}
                    talking={!!m.streaming}
                    size={m.id === lastAi ? 88 : 44}
                  />
                </motion.div>
              )}
              <div
                className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"} ${m.mono ? "font-mono text-xs" : ""}`}
              >
                <span className={`whitespace-pre-wrap ${m.streaming ? "caret" : ""}`}>
                  {m.text}
                </span>
              </div>
            </motion.div>
          ))}
          <div ref={endRef} />
        </div>
        <form onSubmit={submit} className="flex items-center gap-2 border-t border-border p-3">
          <Terminal className="ml-2 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question or try `git status`"
            aria-label="Ask VISHAL.AI"
            className="min-w-0 flex-1 bg-transparent px-2 py-2 font-mono text-sm outline-none placeholder:text-muted-foreground/60"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Send"
            className="rounded-md bg-primary p-2 text-primary-foreground disabled:opacity-40"
          >
            <Send className="size-4" />
          </button>
        </form>
      </section>

      <aside className="space-y-6">
        <div>
          <div className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-primary">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            Tap a question 👇
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {suggested.map((s, i) => (
              <motion.button
                key={s.id}
                disabled={busy}
                onClick={() => ask(s.question)}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                whileHover={{ scale: 1.03, x: 4 }}
                whileTap={{ scale: 0.96 }}
                className="group flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2.5 text-left text-sm font-medium shadow-sm transition-colors hover:border-primary hover:bg-primary/15 disabled:opacity-50"
              >
                <span className="text-xl transition-transform group-hover:scale-125">
                  {icons[s.id] ?? "💬"}
                </span>
                <span className="flex-1">{s.question}</span>
                <span className="text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  →
                </span>
              </motion.button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            👨‍💻 Developer questions
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {playful.map((s, i) => (
              <motion.button
                key={s.id}
                disabled={busy}
                onClick={() => ask(s.question)}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + 0.08 * i }}
                whileHover={{ scale: 1.03, x: 4 }}
                whileTap={{ scale: 0.96 }}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card/40 px-3 py-2 text-left font-mono text-xs transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
              >
                <span className="text-lg transition-transform group-hover:rotate-12 group-hover:scale-125">
                  {icons[s.id] ?? "⚡"}
                </span>
                <span className="flex-1">{s.question}</span>
              </motion.button>
            ))}
          </div>
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">{a.disclaimer}</p>
        <MissionButton onClick={onNext}>{a.cta}</MissionButton>
      </aside>
    </div>
  );
}

const icons: Record<string, string> = {
  miss: "🥹",
  achieve: "🏆",
  leaving: "🧳",
  contact: "📞",
  teach: "🧠",
  next: "🚀",
  final: "💌",
  uptime: "⏱️",
  deprecated: "🗑️",
  bug: "🐛",
  api: "🔌",
  commit: "📦",
  coffee: "☕",
};
