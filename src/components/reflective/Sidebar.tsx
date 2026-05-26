import { motion } from "motion/react";
import {
  PenSquare,
  Search,
  MessageSquare,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { chatHistory } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onToggle: () => void;
  onNewChat: () => void;
};

export function Sidebar({ open, onToggle, onNewChat }: Props) {
  const grouped = chatHistory.reduce<Record<string, typeof chatHistory>>((acc, c) => {
    (acc[c.time] ||= []).push(c);
    return acc;
  }, {});

  return (
    <motion.aside
      initial={false}
      animate={{ width: open ? 272 : 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 32 }}
      className="relative h-full shrink-0 overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground"
    >
      <div className="flex h-full w-[272px] flex-col">
        {/* Top */}
        <div className="flex items-center justify-between px-3 pt-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground/90 text-background">
            <Sparkles className="h-4 w-4" />
          </div>
          <button
            onClick={onToggle}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 space-y-1 px-2">
          <button
            onClick={onNewChat}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent"
          >
            <PenSquare className="h-4 w-4" />
            New chat
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent">
            <Search className="h-4 w-4" />
            Search chats
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent">
            <MessageSquare className="h-4 w-4" />
            Library
          </button>
        </div>

        {/* History */}
        <div className="scrollbar-thin mt-4 flex-1 overflow-y-auto px-2 pb-4">
          {Object.entries(grouped).map(([label, items]) => (
            <div key={label} className="mb-4">
              <div className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                {label}
              </div>
              <ul className="space-y-0.5">
                {items.map((c) => (
                  <li key={c.id}>
                    <button
                      className={cn(
                        "group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-sidebar-foreground/85 transition-colors hover:bg-sidebar-accent",
                      )}
                    >
                      <span className="line-clamp-1 flex-1">{c.title}</span>
                      {c.reflective && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-reflective-soft px-1.5 py-0.5 text-[10px] font-medium text-reflective">
                          <Sparkles className="h-2.5 w-2.5" />
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Profile */}
        <div className="border-t border-sidebar-border p-3">
          <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-sidebar-accent">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-reflective text-reflective-foreground text-xs font-semibold">
              VP
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">Vaidehi Patil</div>
              <div className="truncate text-xs text-muted-foreground">Reflective · Beta</div>
            </div>
          </button>
        </div>
      </div>

      {!open && (
        <button
          onClick={onToggle}
          className="absolute left-3 top-3 rounded-md p-2 text-muted-foreground hover:bg-sidebar-accent"
          aria-label="Open sidebar"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
      )}
    </motion.aside>
  );
}
