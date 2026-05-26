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
type TutorialStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type TutorialTarget = "mode" | "prompt" | "questions" | "perspectives" | "checklist" | null;

type UserMsg = { kind: "user"; text: string; reflective: boolean };

const samplePrompt = "Should I leave my stable PM job for an early-stage AI startup?";

function ReflectiveApp() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mode, setMode] = useState<"normal" | "reflective">("reflective");
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [turn, setTurn] = useState<UserMsg | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [streamDone, setStreamDone] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tutorialStep, setTutorialStep] = useState<TutorialStep>(0);
  const [typingDemo, setTypingDemo] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const questionsComplete = useMemo(() => reflectiveQuestions.every((q) => answers[q.id]), [answers]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = window.localStorage.getItem("reflective-onboarding-seen") === "1";
    if (!seen) {
      setTutorialOpen(true);
      setTutorialStep(0);
    }
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [phase, answers, streamDone]);

  useEffect(() => {
    if (!tutorialOpen) return;
    if (phase === "questions" && tutorialStep < 2) setTutorialStep(2);
  }, [phase, tutorialOpen, tutorialStep]);

  useEffect(() => {
    if (!tutorialOpen) return;
    if (streamDone && tutorialStep < 3) setTutorialStep(3);
  }, [streamDone, tutorialOpen, tutorialStep]);

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
      if (tutorialOpen && tutorialStep < 2) setTutorialStep(2);
    } else {
      setPhase("generating");
      setTimeout(() => setPhase("answer"), 900);
    }
  };

  const startGeneration = () => {
    setPhase("generating");
    if (tutorialOpen && tutorialStep < 3) setTutorialStep(3);
    setTimeout(() => setPhase("answer"), 1100);
  };

  const handleChecklistOpen = () => {
    if (tutorialOpen && tutorialStep < 4) setTutorialStep(4);
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


  const samplePrompt =
    "Should I leave my stable PM job for an early-stage AI startup?";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((s) => !s)} onNewChat={restartTutorial} />
      <main className="relative flex h-full min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between px-4 py-3 sm:px-6">
          <button type="button" className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[15px] font-semibold hover:bg-muted">Reflective<ChevronDown className="h-4 w-4 text-muted-foreground" /></button>
          <div className="flex items-center gap-2">
            <div data-tutorial="mode"><ModeToggle value={mode} onChange={setMode} /></div>
            <button type="button" onClick={restartTutorial} className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted">Tutorial</button>
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
                      onAnswer={(qid, opt) => setAnswers((s) => ({ ...s, [qid]: opt }))}
                      onContinue={startGeneration}
                      complete={questionsComplete && phase === "questions"}
                    /></div>
                  </AssistantBlock>
                )}
                <AnimatePresence>{phase === "generating" && <motion.div key="gen" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><AssistantBlock><div className="flex items-center gap-3 text-muted-foreground"><span className="dot-pulse"><span /><span /><span /></span><span className="text-sm">Thinking with your framings…</span></div></AssistantBlock></motion.div>}</AnimatePresence>
                {phase === "answer" && (
                  <AssistantBlock>
                    <StreamingAnswer fullText={mockAnswer} onDone={() => setStreamDone(true)} />
                    {turn.reflective && streamDone && <PostSections onChecklistOpen={handleChecklistOpen} />}
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
                placeholder={mode === "reflective" ? "Ask something worth thinking about…" : "Ask anything"}
                suggestedPrompt={samplePrompt}
                showSuggestedPrompt={mode === "reflective" && !input}
                onSuggestedClick={handleSuggestedClick}
              />
              </div>
              <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                {mode === "reflective" && <Sparkles className="h-3 w-3 text-reflective" />}
                <span>{mode === "reflective" ? "Reflective Mode is on — the assistant will surface assumptions before answering." : "Reflective Mode is off."}</span>
              </div>
            </div>
          </div>
        </div>
      {tutorialOpen && (
        <TutorialOverlay
          step={tutorialStep}
          onNext={() => setTutorialStep((n) => Math.min((n + 1) as TutorialStep, 6 as TutorialStep))}
          onBack={() => setTutorialStep((n) => Math.max((n - 1) as TutorialStep, 0 as TutorialStep))}
          onSkip={closeTutorial}
          onFinish={closeTutorial}
          activeTarget={currentTarget}
          canGoNext={(tutorialStep === 0 && mode === "reflective") || tutorialStep === 4 || tutorialStep === 5}
          canFinish={tutorialStep === 6}
        />
      )}
      </main>
    </div>
  );
}



const tutorialSteps = [
  "Reflective Mode helps you inspect assumptions and tradeoffs before acting.",
  "Type or tap the suggestion to start with a nuanced decision.",
  "Great — now answer these assumption-shaping questions.",
  "Your response is ready. Review Alternative Perspectives next.",
  "Now open the checklist to verify what matters before acting.",
  "Nice work. You can continue exploring this thread.",
  "Tutorial complete — Reflective Mode keeps your reasoning inspectable.",
] as const;

function TutorialOverlay({ step, activeTarget, onNext, onBack, onSkip, onFinish, canGoNext, canFinish }: { step: TutorialStep; activeTarget: TutorialTarget; onNext: () => void; onBack: () => void; onSkip: () => void; onFinish: () => void; canGoNext: boolean; canFinish: boolean; }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-50">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/45" />
      <motion.div initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="pointer-events-auto absolute bottom-32 left-1/2 w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl border border-white/20 bg-background/95 p-4 shadow-2xl backdrop-blur">
        <p className="text-sm leading-6 text-foreground/90">{tutorialSteps[step]}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{step + 1} of {tutorialSteps.length}</span>
          <div className="flex items-center gap-2">
            {step > 0 && <button type="button" onClick={onBack} className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted">Back</button>}
            <button type="button" onClick={onSkip} className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted">Skip tutorial</button>
            {canFinish ? (
              <button type="button" onClick={onFinish} className="rounded-lg bg-foreground px-3 py-1.5 text-xs text-background">Finish</button>
            ) : (
              <button type="button" onClick={onNext} disabled={!canGoNext} className="rounded-lg bg-foreground px-3 py-1.5 text-xs text-background disabled:opacity-40">Next</button>
            )}
          </div>
        </div>
      </motion.div>
      <style>{`[data-tutorial]{position:relative;z-index:1}[data-tutorial="${activeTarget}"]{z-index:60;box-shadow:0 0 0 2px color-mix(in oklch, var(--color-reflective) 45%, transparent),0 0 0 12px rgba(255,255,255,0.04);border-radius:14px}`}</style>
    </div>
  );
}

function UserBubble({ msg }: { msg: UserMsg }) {
  return <div className="ml-auto max-w-[85%] rounded-2xl bg-foreground px-4 py-3 text-[15px] leading-relaxed text-background shadow-sm">{msg.text}</div>;
}

function AssistantBlock({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-border/70 bg-card/70 px-4 py-3 shadow-[var(--shadow-soft)]">{children}</div>;
}
