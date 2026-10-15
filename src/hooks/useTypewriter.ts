import { useEffect, useState } from "react";
import { sfx } from "@/lib/sound";

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return reduced;
}

/** Types an array of lines with variable speed. Returns typed lines and done flag. */
export function useTypedLines(
  lines: string[],
  opts: { speed?: number; linePause?: number; start?: boolean; instant?: boolean } = {},
) {
  const { speed = 18, linePause = 220, start = true, instant = false } = opts;
  const [out, setOut] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!start) return;
    if (instant) {
      setOut(lines);
      setDone(true);
      return;
    }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let li = 0;
    let ci = 0;
    setOut([]);
    setDone(false);
    const tick = () => {
      if (cancelled) return;
      if (li >= lines.length) return setDone(true);
      const line = lines[li] ?? "";
      ci++;
      if (line[ci - 1] !== " ") sfx.key();
      const L = li,
        text = line.slice(0, ci);
      setOut((prev) => {
        const next = prev.slice(0, L);
        next[L] = text;
        return next;
      });
      if (ci >= line.length) {
        li++;
        ci = 0;
        timer = setTimeout(tick, line.endsWith("...") ? linePause * 2 : linePause);
      } else {
        timer = setTimeout(tick, speed * (0.4 + Math.random() * 1.2));
      }
    };
    timer = setTimeout(tick, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, instant, lines.join("\n")]);

  return { lines: out, done };
}
