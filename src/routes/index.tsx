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
  const [tutorialStep, setTutorialStep] = useState<TutorialStep>(0);
  const [typingDemo, setTypingDemo] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const samplePrompt = "Should I leave my stable PM job for an early-stage AI startup?";
  const questionsComplete = useMemo(() => reflectiveQuestions.every((q) => answers[q.id]), [answers]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem("reflective-onboarding-seen") !== "1") {
      setTutorialOpen(true);
      setTutorialStep(0);
    }
  }, []);

  useEffect(() => {
    if (!tutorialOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeTutorial();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tutorialOpen]);

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

  const activeTarget = tutorialStep === 0 ? "mode" : tutorialStep === 1 ? "prompt" : tutorialStep === 2 ? "questions" : tutorialStep === 3 ? "perspectives" : "checklist";

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
                    <div data-tutorial="questions"><ReflectiveQuestions answers={answers} onAnswer={(qid, opt) => setAnswers((s) => ({ ...s, [qid]: opt }))} onContinue={startGeneration} complete={questionsComplete && phase === "questions"} /></div>
                  </AssistantBlock>
                )}
                <AnimatePresence>{phase === "generating" && <motion.div key="gen" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><AssistantBlock><div className="flex items-center gap-3 text-muted-foreground"><span className="dot-pulse"><span /><span /><span /></span><span className="text-sm">Thinking with your framings…</span></div></AssistantBlock></motion.div>}</AnimatePresence>
                {phase === "answer" && (
                  <AssistantBlock>
                    <StreamingAnswer fullText={mockAnswer} onDone={() => { setStreamDone(true); if (tutorialOpen && tutorialStep <= 3) setTutorialStep(3); }} />
                    {turn.reflective && streamDone && <PostSections onChecklistOpen={() => tutorialOpen && tutorialStep === 3 && setTutorialStep(4)} />}
                  </AssistantBlock>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0">
          <div className="pointer-events-auto mx-auto w-full max-w-3xl px-4 pb-5 sm:px-6">
            <div className="rounded-[28px] bg-gradient-to-t from-background via-background/95 to-transparent pt-6">
              <div data-tutorial="prompt"><PromptInput value={input} onChange={setInput} onSubmit={submit} disabled={phase === "generating"} placeholder={mode === "reflective" ? "Ask something worth thinking about…" : "Ask anything"} suggestedPrompt={mode === "reflective" ? samplePrompt : undefined} showSuggestedPrompt={mode === "reflective" && !input} onSuggestedClick={handleSuggestedClick} /></div>
            </div>
          </div>
        </div>

        {tutorialOpen && <TutorialOverlay step={tutorialStep} activeTarget={activeTarget} onSkip={closeTutorial} onBack={() => setTutorialStep((s) => (s > 0 ? ((s - 1) as TutorialStep) : s))} onNext={() => { if (tutorialStep < 2) setTutorialStep((tutorialStep + 1) as TutorialStep); }} onFinish={closeTutorial} />}
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

function AssistantBlock({ children }: { children: React.ReactNode }) { return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="flex gap-4"><div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-background"><Sparkles className="h-3.5 w-3.5" /></div><div className="min-w-0 flex-1">{children}</div></motion.div>; }
function UserBubble({ msg }: { msg: UserMsg }) { return <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="flex justify-end"><div className="max-w-[85%] rounded-3xl rounded-tr-md bg-muted px-4 py-3 text-[15px] leading-7 text-foreground">{msg.reflective && <div className="mb-1 inline-flex items-center gap-1 rounded-full bg-reflective-soft px-2 py-0.5 text-[10.5px] font-medium text-reflective"><Sparkles className="h-2.5 w-2.5" /> Reflective</div>}<div>{msg.text}</div></div></motion.div>; }
