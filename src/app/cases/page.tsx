"use client";

import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { CaseForm } from "@/components/cases/case-form";
import { CaseCard } from "@/components/cases/case-card";
import { Case, demoCases } from "@/lib/demo-data";

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>(demoCases);
  const [adding, setAdding] = useState(false);

  return (
    <>
      <AppHeader current="/cases" />

      <main className="mx-auto w-full max-w-3xl px-4 pt-10 pb-28 sm:px-6 sm:pb-20">
        <div className="mb-7">
          <p className="eyebrow mb-2.5">Cases</p>
          <h1 className="font-serif text-xl leading-tight font-medium tracking-tight sm:text-2xl">
            The work your proposals draw from
          </h1>
          <p className="mt-2 max-w-xl text-sm text-ink-soft">
            Every draft picks the case closest to the job. Write them once, in
            plain words — what was broken, and what changed.
          </p>
        </div>

        {cases.length === 0 && !adding ? (
          <section className="rounded-xl border border-dashed border-rule px-6 py-12 text-center">
            <h2 className="font-serif text-lg font-medium">
              Nothing to draw from yet
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
              A proposal is only as specific as the evidence behind it. Add the
              first project you would want a client to hear about.
            </p>
            <Button className="mt-5" onClick={() => setAdding(true)}>
              Add your first case
            </Button>
          </section>
        ) : (
          <div className="space-y-4">
            {cases.map((item) => (
              <CaseCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {adding ? (
          <div className="mt-6">
            <CaseForm
              onCancel={() => setAdding(false)}
              onSave={(item) => {
                setCases((current) => [...current, item]);
                setAdding(false);
              }}
            />
          </div>
        ) : (
          cases.length > 0 && (
            <Button
              variant="quiet"
              className="mt-6"
              onClick={() => setAdding(true)}
            >
              Add a case
            </Button>
          )
        )}
      </main>
    </>
  );
}
