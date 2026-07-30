"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Manuscript } from "@/components/proposal/manuscript";
import { Button } from "@/components/ui/button";
import type { Draft } from "@/lib/demo-data";
import {
  deleteProposal,
  updateProposalDraft,
  type SavedProposal,
} from "@/lib/actions/proposals";

export function ProposalClient({ proposal }: { proposal: SavedProposal }) {
  const [draft, setDraft] = useState<Draft>(proposal.draft);
  const [dirty, setDirty] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSave() {
    startTransition(async () => {
      await updateProposalDraft(proposal.id, draft);
      setDirty(false);
      router.refresh();
    });
  }

  async function handleCopy() {
    const text = [draft.greeting, ...draft.paragraphs.map((p) => p.text)].join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  function handleDelete() {
    if (!window.confirm("Delete this proposal? This can't be undone.")) return;
    startTransition(async () => {
      await deleteProposal(proposal.id);
      router.push("/");
      router.refresh();
    });
  }

  return (
    <>
      <p className="mb-3 text-xs text-ink-soft">
        Click any line to rewrite it. Edits are kept when you save.
      </p>

      <Manuscript
        draft={draft}
        analysis={proposal.analysis}
        onDraftChange={(next) => {
          setDraft(next);
          setDirty(true);
        }}
      />

      {/* Save only appears once there is something to save — a permanently
          disabled button reads as broken rather than as "nothing to do". */}
      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <Button onClick={handleCopy}>{copied ? "Copied" : "Copy proposal"}</Button>
        {dirty && (
          <Button variant="quiet" onClick={handleSave} disabled={pending}>
            {pending ? "Saving…" : "Save changes"}
          </Button>
        )}
        <p aria-live="polite" className="font-mono text-xs text-ink-soft">
          {dirty ? "Unsaved changes" : ""}
        </p>
      </div>

      {proposal.jobPost && (
        <details className="group mt-10 rounded-xl border border-rule bg-white">
          <summary
            className="flex list-none items-center gap-2 p-5 text-sm text-ink-soft
              transition-colors hover:text-ink sm:px-7 [&::-webkit-details-marker]:hidden"
          >
            <svg
              width="9"
              height="6"
              viewBox="0 0 9 6"
              aria-hidden="true"
              className="shrink-0 transition-transform group-open:rotate-180"
            >
              <path
                d="M1 1.5 4.5 5 8 1.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            The original job post
          </summary>
          <p className="border-t border-rule px-5 py-5 text-sm leading-relaxed whitespace-pre-wrap text-ink-soft sm:px-7">
            {proposal.jobPost}
          </p>
        </details>
      )}

      {/* Destructive, irreversible, and rarely wanted — so it sits apart from
          the working actions instead of one slip away from them. */}
      <div className="mt-12 border-t border-rule pt-5">
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="flex min-h-11 items-center text-sm text-ink-soft underline
            underline-offset-4 transition-colors hover:text-flag disabled:opacity-50"
        >
          Delete this proposal
        </button>
      </div>
    </>
  );
}
