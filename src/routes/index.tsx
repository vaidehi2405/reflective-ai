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

export const Route = createFileRoute("/")({ component: ReflectiveApp });

type Phase = "idle" | "questions" | "generating" | "answer";
type TutorialStep = 0 | 1 | 2 | 3 | 4;

type UserMsg = { kind: "user"; text: string; reflective: boolean };

function ReflectiveApp() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mode, setMode] = useState<"normal" | "reflective">("reflective");
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [turn, setTurn] = useState<UserMsg | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [streamDone, setStreamDone] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [typingDemo, setTypingDemo] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);



  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = window.localStorage.getItem("reflective-onboarding-seen") === "1";
    if (!seen) {
      setTutorialOpen(true);
      setTutorialStep(0);
    }
  }, []);

  useEffect(() => {
    if (!tutorialOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTutorialOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tutorialOpen]);

  const questionsComplete = useMemo(
    () => reflectiveQuestions.every((q) => answers[q.id]),
    [answers],
  );

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [phase, answers, streamDone]);

  useEffect(() => {
    if (!tutorialOpen) return;
    if (tutorialStep === 2 && phase === "questions") return;
    if (tutorialStep === 3 && streamDone) return;
    if (tutorialStep === 4) return;
  }, [tutorialOpen, tutorialStep, phase, streamDone]);

  const closeTutorial = () => {
    setTutorialOpen(false);
    window.localStorage.setItem("reflective-onboarding-seen", "1");
  };

  const restartTutorial = () => {
    setMode("reflective");
    setTurn(null);
    setAnswers({});
    setPhase("idle");
    setStreamDone(false);
    setInput("");
    setTutorialStep(0);
    setTutorialOpen(true);
  };

  const submit = () => {
    const text = input.trim();
    if (!text) return;
    setTurn({ kind: "user", text, reflective: mode === "reflective" });
    setInput("");
    setAnswers({});
    setStreamDone(false);
    if (mode === "reflective") {
      setPhase("questions");
      if (tutorialOpen && tutorialStep <= 2) setTutorialStep(2);
    } else {
      setPhase("generating");
      setTimeout(() => setPhase("answer"), 900);
    }
  };

  const startGeneration = () => {
    setPhase("generating");
    setTimeout(() => setPhase("answer"), 1100);
  };

  const handleSuggestedClick = async () => {
    if (typingDemo || input) return;
    setTypingDemo(true);
    for (let i = 1; i <= samplePrompt.length; i++) {
      await new Promise((r) => setTimeout(r, 12));
      setInput(samplePrompt.slice(0, i));
    }
    setTypingDemo(false);
  };

  const closeTutorial = () => {
    setTutorialOpen(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("reflective-onboarding-seen", "1");
    }
  };

  const restartTutorial = () => {
    setMode("reflective");
    reset();
    setTutorialStep(0);
    setTutorialOpen(true);
  };

  const handleSuggestedClick = async () => {
    if (typingDemo) return;
    const text = samplePrompt;
    setTypingDemo(true);
    setInput("");
    for (let i = 1; i <= text.length; i++) {
      await new Promise((r) => setTimeout(r, 12));
      setInput(text.slice(0, i));
    }
    setTypingDemo(false);
    setTutorialStep(2);
    submit();
  };

  const samplePrompt =
    "Should I leave my stable PM job for an early-stage AI startup?";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((s) => !s)} onNewChat={restartTutorial} />
      <main className="relative flex h-full min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between px-4 py-3 sm:px-6">
          <button className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[15px] font-semibold hover:bg-muted">Reflective<ChevronDown className="h-4 w-4 text-muted-foreground" /></button>
          <div className="flex items-center gap-2">
            <div data-tutorial="mode"><ModeToggle value={mode} onChange={setMode} /></div>
            <button onClick={restartTutorial} className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted">Tutorial</button>
            <ThemeToggle />
          </div>
        </header>

        <div ref={scrollerRef} className="scrollbar-thin flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-4 pb-40 pt-2 sm:px-6">
            {phase === "idle" && !turn && (
              <div className="flex min-h-[calc(100vh-220px)] items-center justify-center text-center">
                <p className="max-w-lg text-sm text-muted-foreground">Designed for decisions where assumptions, tradeoffs, and uncertainty matter.</p>
              </div>
            )}

            {turn && (
              <div className="space-y-8 pt-6">
                <UserBubble msg={turn} />
                {turn.reflective && (phase === "questions" || phase === "generating" || phase === "answer") && (
                  <AssistantBlock>
                    <div data-tutorial="questions"><ReflectiveQuestions
                      answers={answers}
                      onAnswer={(qid, opt) =>
                        setAnswers((s) => ({ ...s, [qid]: opt }))
                      }
                      onContinue={startGeneration}
                      complete={questionsComplete && phase === "questions"}
                    />
                    </div>
                  </AssistantBlock>
                )}
                <AnimatePresence>{phase === "generating" && <motion.div key="gen" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><AssistantBlock><div className="flex items-center gap-3 text-muted-foreground"><span className="dot-pulse"><span /><span /><span /></span><span className="text-sm">Thinking with your framings…</span></div></AssistantBlock></motion.div>}</AnimatePresence>
                {phase === "answer" && (
                  <AssistantBlock>
                    <StreamingAnswer fullText={mockAnswer} onDone={() => setStreamDone(true)} />
                    {turn.reflective && streamDone && <div data-tutorial="perspectives checklist"><PostSections /></div>}
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

        <div className="pointer-events-none absolute inset-x-0 bottom-0">
          <div className="pointer-events-auto mx-auto w-full max-w-3xl px-4 pb-5 sm:px-6">
            <div className="rounded-[28px] bg-gradient-to-t from-background via-background/95 to-transparent pt-6">
              <div data-tutorial="prompt">
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
                suggestedPrompt="Try: Should I leave my stable PM job for an early-stage AI startup?"
                showSuggestedPrompt={tutorialOpen && tutorialStep === 1 && mode === "reflective" && !turn}
                onSuggestedClick={handleSuggestedClick}
              />
              </div>
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
      {tutorialOpen && (
        <TutorialOverlay
          step={tutorialStep}
          onNext={() => setTutorialStep((n) => Math.min(n + 1, 4))}
          onBack={() => setTutorialStep((n) => Math.max(n - 1, 0))}
          onSkip={closeTutorial}
          onFinish={closeTutorial}
        />
      )}
      </main>
    </div>
  );
}

function TutorialOverlay({ step, activeTarget, onNext, onBack, onSkip, onFinish }: { step: TutorialStep; activeTarget: string; onNext: () => void; onBack: () => void; onSkip: () => void; onFinish: () => void; }) {
  const steps = {
    0: "Reflective Mode helps you inspect assumptions, tradeoffs, and alternative perspectives before acting on AI outputs.",
    1: "Try asking a high-stakes or nuanced question.",
    2: "Before answering, the AI clarifies assumptions shaping the response.",
    3: "See how the answer changes under different assumptions or viewpoints.",
    4: "For important decisions, the system also suggests what’s worth validating before acting.",
  } as const;

  return <div className="absolute inset-0 z-50">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/50" />
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-28 left-1/2 z-50 w-[min(92vw,440px)] -translate-x-1/2 rounded-2xl border border-white/20 bg-background/95 p-4 shadow-2xl backdrop-blur">
      <p className="text-sm leading-6 text-foreground/90">{steps[step]}</p>
      <div className="mt-3 flex items-center justify-between"><span className="text-xs text-muted-foreground">{step + 1} of 5</span><div className="flex gap-2">{step > 0 && <button onClick={onBack} className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted">Back</button>}<button onClick={onSkip} className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted">Skip tutorial</button>{step === 4 ? <button onClick={onFinish} className="rounded-lg bg-foreground px-3 py-1.5 text-xs text-background">Finish</button> : <button onClick={onNext} disabled={step > 1} className="rounded-lg bg-foreground px-3 py-1.5 text-xs text-background disabled:opacity-40">Next</button>}</div></div>
    </motion.div>
    <div className="pointer-events-none absolute inset-0">
      <div className="h-full w-full [mask-image:linear-gradient(black,black)]" />
    </div>
    <style>{`[data-tutorial]{position:relative;z-index:1}[data-tutorial="${activeTarget}"]{z-index:60;box-shadow:0 0 0 2px color-mix(in oklch, var(--color-reflective) 45%, transparent),0 0 0 12px rgba(255,255,255,0.04);border-radius:14px}`}</style>
  </div>;
}


const tutorialSteps = [
  { key: "mode", text: "Reflective Mode is designed for higher-stakes decisions where assumptions, tradeoffs, and uncertainty matter." },
  { key: "prompt", text: "Try starting with a complex or important question. Reflective Mode works best when decisions involve ambiguity or tradeoffs." },
  { key: "questions", text: "Before answering, the AI clarifies the assumptions shaping the response — helping prevent hidden framing or generic advice." },
  { key: "perspectives", text: "Instead of presenting one ‘correct’ answer, Reflective Mode shows how conclusions change under different assumptions and viewpoints." },
  { key: "checklist", text: "For higher-stakes decisions, the system also surfaces what’s worth validating before acting." },
] as const;

function TutorialOverlay({ step, onNext, onBack, onSkip, onFinish }: { step: number; onNext: () => void; onBack: () => void; onSkip: () => void; onFinish: () => void }) {
  const current = tutorialSteps[step];
  return (
    <div className="pointer-events-none absolute inset-0 z-50">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/45" />
      <motion.div initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="pointer-events-auto absolute bottom-32 left-1/2 w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl border border-white/20 bg-background/95 p-4 shadow-2xl backdrop-blur">
        <p className="text-sm leading-6 text-foreground/90">{current.text}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{step + 1} of {tutorialSteps.length}</span>
          <div className="flex items-center gap-2">
            {step > 0 && <button onClick={onBack} className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted">Back</button>}
            <button onClick={onSkip} className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted">Skip tutorial</button>
            <button onClick={step === tutorialSteps.length - 1 ? onFinish : onNext} className="rounded-lg bg-foreground px-3 py-1.5 text-xs text-background">{step === tutorialSteps.length - 1 ? "Finish" : "Next"}</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
