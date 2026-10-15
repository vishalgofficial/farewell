import { easterEggs, fallbacks, qa, type Mood } from "@/config/farewell";

export type ChatReply = { text: string; mono: boolean; mood: Mood };

// Deterministic intent matcher. Swap for a server function calling an LLM later.
let fallbackIdx = 0;
export function reply(input: string): ChatReply {
  const q = input.trim();
  const egg = easterEggs.find((e) => e.match.test(q));
  if (egg)
    return { text: egg.answer, mono: true, mood: /coffee/i.test(egg.answer) ? "coffee" : "cool" };

  const lower = q.toLowerCase();
  const exact = qa.find((x) => x.question.toLowerCase() === lower);
  if (exact) return { text: exact.answer, mono: false, mood: exact.mood };

  let best: { score: number; answer: string; mood: Mood } | null = null;
  for (const item of qa) {
    const score = item.keywords.reduce((s, k) => (lower.includes(k) ? s + k.length : s), 0);
    if (score > 0 && (!best || score > best.score))
      best = { score, answer: item.answer, mood: item.mood };
  }
  if (best) return { text: best.answer, mono: false, mood: best.mood };

  const text = fallbacks[fallbackIdx % fallbacks.length] ?? "";
  fallbackIdx++;
  return { text, mono: false, mood: "think" };
}
