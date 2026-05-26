import { ArrowUp, Plus, Mic } from "lucide-react";
import { useEffect, useRef } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
  suggestedPrompt?: string;
  onSuggestedClick?: () => void;
  showSuggestedPrompt?: boolean;
};

export function PromptInput({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder,
  suggestedPrompt,
  onSuggestedClick,
  showSuggestedPrompt,
}: Props) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 220) + "px";
  }, [value]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!disabled && value.trim()) onSubmit();
      }}
      className="relative w-full"
    >
      <div className="relative flex items-end gap-2 rounded-3xl border border-border bg-card px-3 py-2.5 shadow-[var(--shadow-elevated)] transition-shadow focus-within:shadow-[0_8px_32px_-8px_oklch(0_0_0/0.12)]">
        <button
          type="button"
          className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Attach"
        >
          <Plus className="h-5 w-5" />
        </button>
        <textarea
          ref={ref}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!disabled && value.trim()) onSubmit();
            }
          }}
          placeholder={placeholder ?? "Ask anything"}
          className="max-h-[220px] min-h-[36px] flex-1 resize-none bg-transparent px-1 py-2 text-[15px] leading-6 outline-none placeholder:text-muted-foreground"
        />
        {showSuggestedPrompt && !value && suggestedPrompt && (
          <button
            type="button"
            onClick={onSuggestedClick}
            className="absolute left-[3.75rem] top-1/2 -translate-y-1/2 rounded-md px-1 text-[14px] text-muted-foreground/75 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {suggestedPrompt}
          </button>
        )}
        <button
          type="button"
          className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Voice"
        >
          <Mic className="h-4 w-4" />
        </button>
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-all hover:scale-[1.04] disabled:opacity-30 disabled:hover:scale-100"
          aria-label="Send"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
