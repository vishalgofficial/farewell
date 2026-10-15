// Tiny in-memory achievement bus. Scenes call unlock(id); the controller renders toasts.
export const ACHIEVEMENTS = {
  begin: { icon: "🛰️", title: "Clearance granted", desc: "You started the mission." },
  secret: { icon: "🕵️", title: "Hacker mode", desc: "Found a secret terminal command." },
  curious: { icon: "🧠", title: "Curious agent", desc: "Asked VISHAL.AI 5 questions." },
  bonus: { icon: "🎞️", title: "Director's cut", desc: "Unlocked the hidden bonus reel." },
  quiz: { icon: "🏆", title: "Knows Vishal best", desc: "Perfect score on the quiz." },
  terminate: { icon: "⛔", title: "Nice try", desc: "Tried to terminate a friendship." },
  credits: { icon: "🎬", title: "Stayed for the credits", desc: "Watched until the very end." },
  note: { icon: "💌", title: "Left a note", desc: "Wrote a goodbye message to Vishal." },
} as const;
export type AchievementId = keyof typeof ACHIEVEMENTS;

const got = new Set<AchievementId>();
const subs = new Set<(id: AchievementId, total: number) => void>();

export function unlock(id: AchievementId) {
  if (got.has(id)) return;
  got.add(id);
  subs.forEach((f) => f(id, got.size));
}
export function onUnlock(f: (id: AchievementId, total: number) => void) {
  subs.add(f);
  return () => {
    subs.delete(f);
  };
}
export const totalAchievements = Object.keys(ACHIEVEMENTS).length;
