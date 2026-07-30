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

      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <Button onClick={handleCopy}>{copied ? "Copied" : "Copy proposal"}</Button>
        <Button variant="quiet" onClick={handleSave} disabled={!dirty || pending}>
          {pending ? "Saving…" : dirty ? "Save changes" : "Saved"}
        </Button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="ml-auto flex min-h-11 items-center px-2 text-sm text-ink-soft
            underline underline-offset-4 transition-colors hover:text-flag disabled:opacity-50"
        >
          Delete proposal
        </button>
      </div>

      {proposal.jobPost && (
        <details className="mt-8 rounded-xl border border-rule bg-white p-5 sm:p-7">
          <summary className="eyebrow cursor-pointer">The original job post</summary>
          <p className="mt-4 text-sm leading-relaxed whitespace-pre-wrap text-ink-soft">
            {proposal.jobPost}
          </p>
        </details>
      )}
    </>
  );
}
