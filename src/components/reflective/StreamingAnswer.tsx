import { useEffect, useState } from "react";
import { motion } from "motion/react";

function renderMarkdown(text: string) {
  // tiny inline markdown: paragraphs + **bold** + *italic*
  return text.split(/\n\n+/).map((para, i) => {
    const html = para
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");
    return (
      <p
        key={i}
        className="text-[15.5px] leading-[1.75] text-foreground/90 [&+p]:mt-4"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  });
}

export function StreamingAnswer({
  fullText,
  onDone,
}: {
  fullText: string;
  onDone?: () => void;
}) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    let i = 0;
    const chunk = 6;
    const id = setInterval(() => {
      i = Math.min(i + chunk, fullText.length);
      setShown(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(id);
        onDone?.();
      }
    }, 18);
    return () => clearInterval(id);
  }, [fullText, onDone]);

  const done = shown.length >= fullText.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-3"
    >
      <div className="prose-like">{renderMarkdown(shown)}</div>
      {!done && (
        <motion.span
          aria-hidden
          className="inline-block h-4 w-[2px] translate-y-0.5 bg-foreground/70"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 0.9, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
