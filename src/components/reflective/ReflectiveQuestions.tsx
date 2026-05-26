import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";
import { reflectiveQuestions } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Props = {
  answers: Record<string, string>;
  onAnswer: (qid: string, option: string) => void;
  onContinue: () => void;
  complete: boolean;
};

export function ReflectiveQuestions({ answers, onAnswer, onContinue, complete }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-4"
    >
      <p className="text-[15px] leading-7 text-foreground/90">
        Before I answer, help me understand your priorities. A few quick framings — none of them
        are right or wrong.
      </p>

      <div className="space-y-3">
        {reflectiveQuestions.map((q, idx) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.12, duration: 0.35 }}
            className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]"
          >
            <div className="mb-3 flex items-start gap-2.5">
              <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-reflective-soft text-[11px] font-semibold text-reflective">
                {idx + 1}
              </span>
              <p className="text-[14.5px] font-medium leading-6 text-foreground">{q.prompt}</p>
            </div>
            <div className="flex flex-wrap gap-2 pl-7">
              {q.options.map((opt) => {
                const selected = answers[q.id] === opt;
                return (
                  <motion.button
                    key={opt}
                    onClick={() => onAnswer(q.id, opt)}
                    whileTap={{ scale: 0.97 }}
                    className={cn(
                      "group relative flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-all",
                      selected
                        ? "border-reflective bg-reflective-soft text-reflective"
                        : "border-border bg-background text-foreground/80 hover:border-foreground/30 hover:bg-muted",
                    )}
                  >
                    <AnimatePresence>
                      {selected && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-reflective text-reflective-foreground"
                        >
                          <Check className="h-2.5 w-2.5" strokeWidth={3} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {opt}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {complete && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pt-1"
          >
            <button
              onClick={onContinue}
              className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-transform hover:scale-[1.02]"
            >
              Continue with these framings
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
