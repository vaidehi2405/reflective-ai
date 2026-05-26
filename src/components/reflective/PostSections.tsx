import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Check, Sparkles, ListChecks } from "lucide-react";
import { perspectives, checklist } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function PostSections({ onChecklistOpen }: { onChecklistOpen?: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }} className="mt-8 space-y-4">
      <div data-tutorial="perspectives"><AlternativePerspectives /></div>
      <div data-tutorial="checklist"><VerifyChecklist onOpen={onChecklistOpen} /></div>
    </motion.div>
  );
}

function SectionShell({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode; }) {
  return <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]"><div className="flex items-start gap-3 px-5 pt-4"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-reflective-soft text-reflective">{icon}</div><div className="pb-1"><h3 className="text-sm font-semibold text-foreground">{title}</h3><p className="text-xs text-muted-foreground">{subtitle}</p></div></div><div className="px-3 pb-3 pt-3">{children}</div></div>;
}

function AlternativePerspectives() {
  const [open, setOpen] = useState<string | null>("flip");
  return <SectionShell icon={<Sparkles className="h-4 w-4" />} title="Alternative perspectives" subtitle="Other ways to look at this — none of them are the answer."><div className="space-y-1">{perspectives.map((p) => { const isOpen = open === p.id; return <div key={p.id} className="rounded-xl"><button onClick={() => setOpen(isOpen ? null : p.id)} className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted"><span className="text-[14px] font-medium text-foreground">{p.title}</span><motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-muted-foreground"><ChevronDown className="h-4 w-4" /></motion.span></button><AnimatePresence initial={false}>{isOpen && <motion.div key="content" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="overflow-hidden"><p className="px-3 pb-3 pt-1 text-[14px] leading-[1.7] text-foreground/80">{p.body}</p></motion.div>}</AnimatePresence></div>; })}</div></SectionShell>;
}

function VerifyChecklist({ onOpen }: { onOpen?: () => void }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  return <SectionShell icon={<ListChecks className="h-4 w-4" />} title="Things worth verifying before acting" subtitle="Diligence that usually changes the conversation."><ul className="space-y-1">{checklist.map((item) => { const isChecked = !!checked[item.id]; const isOpen = expanded === item.id; return <li key={item.id} className="rounded-xl"><div className="flex items-start gap-3 px-3 py-2.5"><button onClick={() => setChecked((s) => ({ ...s, [item.id]: !s[item.id] }))} className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all", isChecked ? "border-reflective bg-reflective text-reflective-foreground" : "border-border bg-background hover:border-foreground/40")} aria-label="Toggle"><AnimatePresence>{isChecked && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check className="h-3 w-3" strokeWidth={3} /></motion.span>}</AnimatePresence></button><button onClick={() => { if (!isOpen) onOpen?.(); setExpanded(isOpen ? null : item.id); }} className="group flex-1 text-left"><div className="flex items-center justify-between"><span className={cn("text-[14px] transition-colors", isChecked ? "text-muted-foreground line-through decoration-muted-foreground/40" : "text-foreground")}>{item.label}</span><motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-muted-foreground"><ChevronDown className="h-3.5 w-3.5" /></motion.span></div><AnimatePresence initial={false}>{isOpen && <motion.p initial={{ height: 0, opacity: 0, marginTop: 0 }} animate={{ height: "auto", opacity: 1, marginTop: 6 }} exit={{ height: 0, opacity: 0, marginTop: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden text-[13px] leading-[1.6] text-muted-foreground">{item.detail}</motion.p>}</AnimatePresence></button></div></li>; })}</ul></SectionShell>;
}
