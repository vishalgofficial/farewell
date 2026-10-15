import { AnimatePresence, motion } from "motion/react";

export type BotMood = "happy" | "wave" | "coffee" | "think" | "cool" | "heart" | "fix" | "rocket";

/** Cartoon robot mascot of the digital twin. Reacts to each answer with a mood + prop. */
export function TwinBot({
  mood,
  talking,
  size = 96,
}: {
  mood: BotMood;
  talking: boolean;
  size?: number;
}) {
  const eyes =
    mood === "cool" ? (
      <g>
        <rect x="30" y="40" width="16" height="9" rx="3" className="fill-foreground" />
        <rect x="54" y="40" width="16" height="9" rx="3" className="fill-foreground" />
        <rect x="46" y="42" width="8" height="2" className="fill-foreground" />
      </g>
    ) : mood === "heart" ? (
      <g className="fill-destructive">
        <path d="M38 50 l-6-6 a3.5 3.5 0 0 1 6-4 a3.5 3.5 0 0 1 6 4z" />
        <path d="M62 50 l-6-6 a3.5 3.5 0 0 1 6-4 a3.5 3.5 0 0 1 6 4z" />
      </g>
    ) : mood === "think" ? (
      <g className="fill-primary">
        <circle cx="38" cy="43" r="4" />
        <rect x="56" y="42" width="10" height="3" rx="1.5" />
      </g>
    ) : (
      <motion.g
        className="fill-primary"
        animate={{ scaleY: [1, 1, 0.1, 1] }}
        transition={{ repeat: Infinity, duration: 3.2, times: [0, 0.9, 0.95, 1] }}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      >
        <circle cx="38" cy="44" r="5" />
        <circle cx="62" cy="44" r="5" />
      </motion.g>
    );

  return (
    <motion.div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      animate={mood === "rocket" ? { y: [0, -14, 0] } : { y: [0, -4, 0] }}
      transition={{ repeat: Infinity, duration: mood === "rocket" ? 1 : 2.4, ease: "easeInOut" }}
      aria-hidden
    >
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {/* antenna */}
        <line x1="50" y1="14" x2="50" y2="24" className="stroke-muted-foreground" strokeWidth="2" />
        <motion.circle
          cx="50"
          cy="12"
          r="4"
          className="fill-primary"
          animate={{ opacity: talking ? [1, 0.2, 1] : 1 }}
          transition={{ repeat: Infinity, duration: 0.5 }}
        />
        {/* head */}
        <rect
          x="20"
          y="24"
          width="60"
          height="44"
          rx="16"
          className="fill-secondary stroke-primary"
          strokeWidth="2"
        />
        <rect x="26" y="30" width="48" height="32" rx="10" className="fill-background" />
        {eyes}
        {/* mouth */}
        <motion.rect
          x="42"
          width="16"
          rx="3"
          className="fill-primary"
          animate={
            talking
              ? { height: [2, 7, 3, 6, 2], y: [53, 51, 53, 51, 53] }
              : { height: mood === "think" ? 2 : 4, y: 53 }
          }
          transition={talking ? { repeat: Infinity, duration: 0.45 } : { duration: 0.2 }}
        />
        {/* cheeks */}
        {(mood === "happy" || mood === "heart" || mood === "wave") && (
          <g className="fill-destructive" opacity="0.35">
            <circle cx="31" cy="54" r="3" />
            <circle cx="69" cy="54" r="3" />
          </g>
        )}
        {/* body */}
        <rect
          x="32"
          y="70"
          width="36"
          height="22"
          rx="8"
          className="fill-secondary stroke-primary"
          strokeWidth="2"
        />
        <circle cx="50" cy="81" r="4" className="fill-primary" opacity="0.8" />
        {/* left arm */}
        <rect x="18" y="74" width="12" height="6" rx="3" className="fill-muted-foreground" />
        {/* right arm (waves) */}
        <motion.g
          style={{ originX: "70px", originY: "77px" }}
          animate={
            mood === "wave"
              ? { rotate: [0, -50, -20, -50, 0] }
              : mood === "fix"
                ? { rotate: [0, -25, 0] }
                : { rotate: 0 }
          }
          transition={{
            repeat: mood === "wave" || mood === "fix" ? Infinity : 0,
            duration: mood === "fix" ? 0.4 : 1.2,
          }}
        >
          <rect x="70" y="74" width="12" height="6" rx="3" className="fill-muted-foreground" />
          {mood === "fix" && (
            <path
              d="M82 70 l6 -6 m-3 0 h3 v3"
              className="stroke-warm"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          )}
        </motion.g>
      </svg>

      {/* floating props */}
      <AnimatePresence mode="wait">
        <motion.span
          key={mood}
          initial={{ opacity: 0, scale: 0.3, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.3 }}
          transition={{ type: "spring", stiffness: 300, damping: 14 }}
          className="absolute -right-2 -top-1 text-2xl"
        >
          {
            {
              happy: "✨",
              wave: "👋",
              coffee: "☕",
              think: "💭",
              cool: "😎",
              heart: "💛",
              fix: "🔧",
              rocket: "🚀",
            }[mood]
          }
        </motion.span>
      </AnimatePresence>
      {mood === "coffee" && (
        <motion.span
          className="absolute -right-1 -top-6 text-sm text-muted-foreground"
          animate={{ y: [0, -10], opacity: [0.8, 0] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
        >
          ~
        </motion.span>
      )}
      {mood === "heart" &&
        [0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute left-1/2 top-0 text-sm"
            initial={{ opacity: 0 }}
            animate={{ y: [0, -40], x: [(i - 1) * 6, (i - 1) * 22], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: i * 0.5 }}
          >
            ❤
          </motion.span>
        ))}
    </motion.div>
  );
}
