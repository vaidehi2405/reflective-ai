import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Sparkles } from "lucide-react";
import { Sidebar } from "@/components/reflective/Sidebar";
import { ModeToggle } from "@/components/reflective/ModeToggle";
import { PromptInput } from "@/components/reflective/PromptInput";
import { ReflectiveQuestions } from "@/components/reflective/ReflectiveQuestions";
import { StreamingAnswer } from "@/components/reflective/StreamingAnswer";
import { PostSections } from "@/components/reflective/PostSections";
import { ThemeToggle } from "@/components/reflective/ThemeToggle";
import { mockAnswer, reflectiveQuestions } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  component: ReflectiveApp,
  head: () => ({
    meta: [
      { title: "Reflective Mode — AI for thinking with, not for" },
      {
        name: "description",
        content:
          "An AI assistant that clarifies assumptions, surfaces tradeoffs, and keeps human judgment in the loop.",
      },
    ],
  }),
});

type Phase = "idle" | "questions" | "generating" | "answer";

type UserMsg = { kind: "user"; text: string; reflective: boolean };
type Turn = UserMsg;

function ReflectiveApp() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mode, setMode] = useState<"normal" | "reflective">("reflective");
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [turn, setTurn] = useState<Turn | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [streamDone, setStreamDone] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const questionsComplete = useMemo(
    () => reflectiveQuestions.every((q) => answers[q.id]),
    [answers],
  );

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [phase, answers, streamDone]);

  const submit = () => {
    const text = input.trim();
    if (!text) return;
    setTurn({ kind: "user", text, reflective: mode === "reflective" });
    setInput("");
    setAnswers({});
    setStreamDone(false);
    if (mode === "reflective") {
      setPhase("questions");
    } else {
      setPhase("generating");
      setTimeout(() => setPhase("answer"), 900);
    }
  };

  const startGeneration = () => {
    setPhase("generating");
    setTimeout(() => setPhase("answer"), 1100);
  };

  const reset = () => {
    setTurn(null);
    setAnswers({});
    setPhase("idle");
    setStreamDone(false);
    setInput("");
  };

  const samplePrompt =
    "Should I leave my stable PM job for an early-stage AI startup?";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((s) => !s)}
        onNewChat={reset}
      />

      <main className="relative flex h-full min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 sm:px-6">
          <button className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[15px] font-semibold transition-colors hover:bg-muted">
            Reflective
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <ModeToggle value={mode} onChange={setMode} />
            <ThemeToggle />
          </div>
        </header>

        {/* Conversation */}
        <div ref={scrollerRef} className="scrollbar-thin flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-4 pb-40 pt-2 sm:px-6">
            {phase === "idle" && !turn && <EmptyState onPick={(p) => setInput(p)} sample={samplePrompt} />}

            {turn && (
              <div className="space-y-8 pt-6">
                <UserBubble msg={turn} />

                {/* Reflective questions */}
                {turn.reflective && (phase === "questions" || phase === "generating" || phase === "answer") && (
                  <AssistantBlock>
                    <ReflectiveQuestions
                      answers={answers}
                      onAnswer={(qid, opt) =>
                        setAnswers((s) => ({ ...s, [qid]: opt }))
                      }
                      onContinue={startGeneration}
                      complete={questionsComplete && phase === "questions"}
                    />
                  </AssistantBlock>
                )}

                {/* Generating shimmer */}
                <AnimatePresence>
                  {phase === "generating" && (
                    <motion.div
                      key="gen"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <AssistantBlock>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <span className="dot-pulse">
                            <span />
                            <span />
                            <span />
                          </span>
                          <span className="text-sm">
                            {turn.reflective ? "Thinking with your framings…" : "Generating response…"}
                          </span>
                        </div>
                        <div className="mt-3 space-y-2">
                          <div className="h-3 w-11/12 rounded-md bg-muted shimmer" />
                          <div className="h-3 w-9/12 rounded-md bg-muted shimmer" />
                          <div className="h-3 w-10/12 rounded-md bg-muted shimmer" />
                        </div>
                      </AssistantBlock>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Answer */}
                {phase === "answer" && (
                  <AssistantBlock>
                    <StreamingAnswer fullText={mockAnswer} onDone={() => setStreamDone(true)} />
                    {turn.reflective && streamDone && <PostSections />}
                    {streamDone && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-6 text-xs text-muted-foreground"
                      >
                        Reflective mode keeps reasoning inspectable. You stay the decider.
                      </motion.p>
                    )}
                  </AssistantBlock>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sticky input */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0">
          <div className="pointer-events-auto mx-auto w-full max-w-3xl px-4 pb-5 sm:px-6">
            <div className="rounded-[28px] bg-gradient-to-t from-background via-background/95 to-transparent pt-6">
              <PromptInput
                value={input}
                onChange={setInput}
                onSubmit={submit}
                disabled={phase === "generating"}
                placeholder={
                  mode === "reflective"
                    ? "Ask something worth thinking about…"
                    : "Ask anything"
                }
              />
              <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                {mode === "reflective" && (
                  <Sparkles className="h-3 w-3 text-reflective" />
                )}
                <span>
                  {mode === "reflective"
                    ? "Reflective Mode is on — the assistant will surface assumptions before answering."
                    : "Reflective Mode is off."}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function AssistantBlock({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex gap-4"
    >
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
        <Sparkles className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </motion.div>
  );
}

function UserBubble({ msg }: { msg: UserMsg }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex justify-end"
    >
      <div className="max-w-[85%] rounded-3xl rounded-tr-md bg-muted px-4 py-3 text-[15px] leading-7 text-foreground">
        {msg.reflective && (
          <div className="mb-1 inline-flex items-center gap-1 rounded-full bg-reflective-soft px-2 py-0.5 text-[10.5px] font-medium text-reflective">
            <Sparkles className="h-2.5 w-2.5" /> Reflective
          </div>
        )}
        <div>{msg.text}</div>
      </div>
    </motion.div>
  );
}

function EmptyState({ sample, onPick }: { sample: string; onPick: (p: string) => void }) {
  const suggestions = [
    "Should I leave my stable PM job for an early-stage AI startup?",
    "Help me pressure-test my product strategy for Q3.",
    "I'm anxious about a decision — walk me through it without telling me what to do.",
    "What am I likely missing about hiring our first staff engineer?",
  ];
  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
      >
        <Sparkles className="h-3 w-3 text-reflective" />
        Reflective Mode · supports your thinking, doesn't replace it
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="font-serif text-4xl tracking-tight text-foreground sm:text-5xl"
        style={{ fontFamily: "Instrument Serif, ui-serif, Georgia, serif" }}
      >
        What are you weighing?
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-3 max-w-md text-sm text-muted-foreground"
      >
        Ask anything. In Reflective Mode, the assistant clarifies framings, names tradeoffs, and
        keeps you in the driver's seat.
      </motion.p>

      <div className="mt-8 grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
        {suggestions.map((s, i) => (
          <motion.button
            key={s}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.05 }}
            onClick={() => onPick(s)}
            className="group rounded-2xl border border-border bg-card p-3 text-left text-sm text-foreground/85 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-[var(--shadow-elevated)]"
          >
            {s}
            {s === sample && (
              <div className="mt-1 text-[11px] text-reflective">Try this →</div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
