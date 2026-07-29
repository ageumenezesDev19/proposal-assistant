"use client";

import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { JobPostForm } from "@/components/proposal/job-post-form";
import { AnalysisSkeleton } from "@/components/proposal/analysis-skeleton";
import { Manuscript } from "@/components/proposal/manuscript";
import { Button } from "@/components/ui/button";
import { demoAnalysis, demoDraft } from "@/lib/demo-data";

type Stage = "writing" | "analysing" | "drafted";

export default function NewProposalPage() {
  const [stage, setStage] = useState<Stage>("writing");

  // Placeholder until the provider layer lands in phase 2; the timing exists
  // so the loading state can be designed against something real.
  function analyse() {
    setStage("analysing");
    setTimeout(() => setStage("drafted"), 2200);
  }

  return (
    <>
      <AppHeader />

      <main className="mx-auto w-full max-w-5xl px-4 pt-10 pb-20 sm:px-6">
        <div className="mb-7">
          <p className="eyebrow mb-2.5">New proposal</p>
          <h1 className="font-serif text-xl leading-tight font-medium tracking-tight sm:text-2xl">
            {stage === "drafted"
              ? "Shopify inventory dashboard"
              : "Start with the job post"}
          </h1>
          {stage !== "drafted" && (
            <p className="mt-2 max-w-xl text-sm text-ink-soft">
              Pitchfolio reads it for you, pulls out what the client actually
              needs, and drafts a reply from the cases you have saved.
            </p>
          )}
        </div>

        {stage === "writing" && <JobPostForm onAnalyse={analyse} />}

        {stage === "analysing" && <AnalysisSkeleton />}

        {stage === "drafted" && (
          <>
            <Manuscript draft={demoDraft} analysis={demoAnalysis} />
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Button>Copy proposal</Button>
              <Button variant="quiet">Save draft</Button>
              <Button variant="quiet" onClick={() => setStage("writing")}>
                Start over
              </Button>
            </div>
          </>
        )}
      </main>
    </>
  );
}
