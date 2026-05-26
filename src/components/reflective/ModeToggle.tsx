import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

type Mode = "normal" | "reflective";

export function ModeToggle({ value, onChange }: { value: Mode; onChange: (m: Mode) => void }) {
  return (
    <div className="relative inline-flex items-center rounded-full border border-border bg-card p-1 text-sm shadow-[var(--shadow-soft)]">
      {(["normal", "reflective"] as const).map((m) => {
        const active = value === m;
        return (
          <button
            key={m}
            onClick={() => onChange(m)}
            className="relative z-10 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-colors"
          >
            {active && (
              <motion.span
                layoutId="mode-pill"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                className={
                  m === "reflective"
                    ? "absolute inset-0 -z-10 rounded-full bg-reflective"
                    : "absolute inset-0 -z-10 rounded-full bg-foreground"
                }
              />
            )}
            {m === "reflective" && (
              <Sparkles
                className={`h-3.5 w-3.5 ${active ? "text-reflective-foreground" : "text-reflective"}`}
              />
            )}
            <span
              className={
                active
                  ? m === "reflective"
                    ? "text-reflective-foreground"
                    : "text-background"
                  : "text-muted-foreground"
              }
            >
              {m === "normal" ? "Normal" : "Reflective"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
