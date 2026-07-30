"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { JobPostForm } from "@/components/proposal/job-post-form";
import { AnalysisSkeleton } from "@/components/proposal/analysis-skeleton";
import { Manuscript } from "@/components/proposal/manuscript";
import { BlocksBar } from "@/components/proposal/blocks-bar";
import { Button } from "@/components/ui/button";
import { demoAnalysis, demoDraft, type Analysis, type Draft } from "@/lib/demo-data";
import { saveDraft } from "@/lib/actions/proposals";
import type { Snippet } from "@/lib/actions/snippets";

type Stage = "writing" | "analysing" | "drafted";

/** No dedicated title field comes back from the model, so the first clause of
 * the post — where clients usually name the project — stands in for one. */
function guessJobTitle(post: string) {
  const firstLine = post.split(/\n|\.\s/)[0]?.trim() ?? "";
  return firstLine.length > 6 && firstLine.length <= 80
    ? firstLine
    : "Untitled proposal";
}

export function NewProposalClient({
  signedIn,
  snippets,
}: {
  signedIn: boolean;
  snippets: Snippet[];
}) {
  const [stage, setStage] = useState<Stage>("writing");
  const [jobPost, setJobPost] = useState("");
  const [analysis, setAnalysis] = useState<Analysis>(demoAnalysis);
  const [draft, setDraft] = useState<Draft>(demoDraft);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [edited, setEdited] = useState(false);
  const router = useRouter();

  async function analyse(post: string) {
    setJobPost(post);
    setStage("analysing");
    setNotice(null);

    if (!signedIn) {
      // No account yet: let a visitor feel the whole flow on seeded content,
      // without spending a cent of the shared free AI quota.
      await new Promise((resolve) => setTimeout(resolve, 1400));
      setAnalysis(demoAnalysis);
      setDraft(demoDraft);
      setNotice("Demo content — sign in to analyse your own job posts.");
      setStage("drafted");
      return;
    }

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobPost: post }),
      });
      const body = await response.json();

      if (!response.ok) {
        // Both free-tier providers can be exhausted at once; a recruiter
        // testing the product shouldn't hit a dead screen for it.
        setAnalysis(demoAnalysis);
        setDraft(demoDraft);
        setNotice(
          response.status === 429
            ? "You've hit the hourly analysis limit — showing demo content instead."
            : `${body.error ?? "Live analysis is unavailable right now"} — showing demo content instead.`,
        );
        setStage("drafted");
        return;
      }

      setAnalysis(body.analysis);
      setDraft(body.draft);
      setStage("drafted");
    } catch {
      setAnalysis(demoAnalysis);
      setDraft(demoDraft);
      setNotice("Couldn't reach the analysis service — showing demo content instead.");
      setStage("drafted");
    }
  }

  async function handleSaveDraft() {
    if (!signedIn) return;
    setSaving(true);
    try {
      await saveDraft({
        jobTitle: guessJobTitle(jobPost),
        jobPost,
        budget: analysis.budget.range,
        analysis,
        draft,
      });
      setSaved(true);
      router.push("/");
    } finally {
      setSaving(false);
    }
  }

  async function handleCopy() {
    const text = [draft.greeting, ...draft.paragraphs.map((p) => p.text)].join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <div className="mb-7">
        <p className="eyebrow mb-2.5">New proposal</p>
        <h1 className="font-serif text-xl leading-tight font-medium tracking-tight sm:text-2xl">
          {stage === "drafted" ? "Your draft" : "Start with the job post"}
        </h1>
        {stage !== "drafted" && (
          <p className="mt-2 max-w-xl text-sm text-ink-soft">
            Pitchfolio reads it for you, pulls out what the client actually needs, and drafts a reply
            from the cases you have saved.
          </p>
        )}
      </div>

      {stage === "writing" && <JobPostForm onAnalyse={analyse} />}

      {stage === "analysing" && <AnalysisSkeleton />}

      {stage === "drafted" && (
        <>
          {notice && (
            <p className="mb-4 rounded-lg border border-rule bg-paper-sunk px-4 py-3 text-sm text-ink-soft">
              {notice}
            </p>
          )}
          <p className="mb-3 text-xs text-ink-soft">
            This is a starting point — click any line to rewrite it before you send.
          </p>
          <Manuscript
            draft={draft}
            analysis={analysis}
            onDraftChange={(next) => {
              setDraft(next);
              setEdited(true);
              setSaved(false);
            }}
          />
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <Button onClick={handleCopy}>{copied ? "Copied" : "Copy proposal"}</Button>
            {signedIn && (
              <Button variant="quiet" onClick={handleSaveDraft} disabled={saving}>
                {saving ? "Saving…" : "Save draft"}
              </Button>
            )}
            <Button
              variant="quiet"
              onClick={() => {
                // Edits are only in component state until "Save draft" runs,
                // so starting over would silently discard them.
                if (edited && !saved && !window.confirm("Discard your edits and start over?")) {
                  return;
                }
                setEdited(false);
                setStage("writing");
              }}
            >
              Start over
            </Button>
            {saved && <p className="font-mono text-xs text-moss">Saved.</p>}
          </div>

          <BlocksBar
            snippets={snippets}
            editable={signedIn}
            onInsert={(body) => {
              setDraft((current) => ({
                ...current,
                paragraphs: [
                  ...current.paragraphs,
                  { id: `block-${Date.now()}`, text: body },
                ],
              }));
              setEdited(true);
              setSaved(false);
            }}
          />
        </>
      )}
    </>
  );
}
