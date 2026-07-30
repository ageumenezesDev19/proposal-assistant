"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSnippet, deleteSnippet, type Snippet } from "@/lib/actions/snippets";

/**
 * Lines you keep rewriting — how you handle fixed-price scope, what your
 * onboarding looks like — saved once and dropped into any draft. Sits under
 * the manuscript because it belongs to the act of editing, not to setup.
 */
export function BlocksBar({
  snippets,
  onInsert,
  editable,
}: {
  snippets: Snippet[];
  onInsert: (body: string) => void;
  editable: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSave() {
    if (!label.trim() || !body.trim()) return;
    startTransition(async () => {
      await createSnippet(label.trim(), body.trim());
      setLabel("");
      setBody("");
      setAdding(false);
      router.refresh();
    });
  }

  return (
    <section className="mt-6 rounded-xl border border-rule bg-paper-sunk p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="eyebrow">Reusable blocks</h2>
        {editable && !adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex min-h-9 items-center text-xs text-ink-soft underline underline-offset-4 hover:text-ink"
          >
            Save a new block
          </button>
        )}
      </div>

      {snippets.length === 0 && !adding ? (
        <p className="text-sm text-ink-soft">
          {editable
            ? "Lines you reuse across proposals — your terms, your process — live here. Save one and it drops into any draft."
            : "Sign in to save the lines you reuse across proposals."}
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {snippets.map((snippet) => (
            <li key={snippet.id} className="flex items-stretch">
              <button
                type="button"
                onClick={() => onInsert(snippet.body)}
                title={snippet.body}
                className="flex min-h-9 items-center rounded-l-md border border-rule bg-white px-3
                  text-sm text-ink transition-colors hover:border-ink-soft"
              >
                {snippet.label}
              </button>
              {editable && (
                <button
                  type="button"
                  aria-label={`Delete block ${snippet.label}`}
                  onClick={() =>
                    startTransition(async () => {
                      await deleteSnippet(snippet.id);
                      router.refresh();
                    })
                  }
                  className="flex min-h-9 items-center rounded-r-md border border-l-0 border-rule
                    bg-white px-2 text-ink-soft transition-colors hover:border-ink-soft hover:text-flag"
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {adding && (
        <div className="mt-4 space-y-3 border-t border-rule pt-4">
          <input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Name it — e.g. Fixed-price terms"
            className="w-full rounded-lg border border-rule bg-white px-3.5 py-2.5 text-sm
              placeholder:text-ink-soft focus:border-moss focus:outline-none"
          />
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={3}
            placeholder="The paragraph itself, written the way you'd send it."
            className="w-full rounded-lg border border-rule bg-white px-3.5 py-2.5 font-serif text-sm
              placeholder:font-sans placeholder:text-ink-soft focus:border-moss focus:outline-none"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={pending || !label.trim() || !body.trim()}
              className="flex min-h-9 items-center rounded-md border border-moss bg-moss px-3.5
                text-sm font-medium text-paper transition-colors hover:bg-moss-hover disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save block"}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="flex min-h-9 items-center rounded-md border border-rule px-3.5 text-sm
                text-ink transition-colors hover:border-ink-soft"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
