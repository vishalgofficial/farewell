import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { sfx } from "@/lib/sound";

export type SceneProps = { onNext: () => void; instant: boolean; name?: string };

export function MissionButton({
  children,
  onClick,
  delay = 0,
}: {
  children: ReactNode;
  onClick: () => void;
  delay?: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      onClick={() => {
        sfx.click();
        onClick();
      }}
      className="btn-mission"
    >
      [ {children} ] <ArrowRight className="size-4" aria-hidden />
    </motion.button>
  );
}

export function Line({ text, className = "" }: { text: string; className?: string }) {
  const ok = text.includes("✓");
  return (
    <div className={`whitespace-pre-wrap ${ok ? "text-success" : ""} ${className}`}>
      {text || "\u00a0"}
    </div>
  );
}

export function Particles({ count = 28 }: { count?: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const left = (i * 37) % 100;
        const size = 1 + ((i * 7) % 3);
        const dur = 18 + ((i * 11) % 20);
        const delay = -((i * 13) % dur);
        return (
          <span
            key={i}
            className="absolute rounded-full bg-primary"
            style={{
              left: `${left}%`,
              top: "100%",
              width: size,
              height: size,
              opacity: 0.25,
              animation: `drift ${dur}s linear ${delay}s infinite`,
            }}
          />
        );
      })}
    </div>
  );
}
