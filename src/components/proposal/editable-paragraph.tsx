"use client";

import { useEffect, useRef } from "react";

/**
 * A paragraph you can rewrite in place. It has to keep looking like prose in a
 * document — the whole point of the manuscript layout — so the textarea carries
 * the same serif type and line height as the static <p> it replaces, shows no
 * chrome until you hover or focus it, and grows with its content instead of
 * scrolling inside a fixed box.
 */
export function EditableParagraph({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Height has to be recomputed from scratch each time: shrinking text can't be
  // measured while the element is still tall from the previous value.
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={1}
      aria-label="Proposal paragraph"
      className="-mx-2 block w-[calc(100%+1rem)] resize-none overflow-hidden rounded border
        border-transparent bg-transparent px-2 font-serif text-base leading-[1.75]
        transition-colors hover:border-rule focus:border-moss focus:outline-none"
    />
  );
}
