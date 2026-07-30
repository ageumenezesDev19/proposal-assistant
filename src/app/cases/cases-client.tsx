"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CaseForm } from "@/components/cases/case-form";
import { CaseCard } from "@/components/cases/case-card";
import type { Case } from "@/lib/demo-data";
import { createCase, deleteCase, type CaseInput } from "@/lib/actions/cases";

interface CasesClientProps {
  cases: Case[];
  signedIn: boolean;
}

export function CasesClient({ cases, signedIn }: CasesClientProps) {
  const [adding, setAdding] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSave(item: CaseInput) {
    if (!signedIn) {
      setAdding(false);
      return;
    }
    startTransition(async () => {
      await createCase(item);
      setAdding(false);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!signedIn) return;
    startTransition(async () => {
      await deleteCase(id);
      router.refresh();
    });
  }

  return (
    <>
      {!signedIn && (
        <p className="mb-5 rounded-lg border border-rule bg-paper-sunk px-4 py-3 text-sm text-ink-soft">
          You&apos;re viewing example cases.{" "}
          <a href="/login" className="text-ink underline underline-offset-4">
            Sign in
          </a>{" "}
          to save your own.
        </p>
      )}

      {cases.length === 0 && !adding ? (
        <section className="rounded-xl border border-dashed border-rule px-6 py-12 text-center">
          <h2 className="font-serif text-lg font-medium">Nothing to draw from yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
            A proposal is only as specific as the evidence behind it. Add the first project you would
            want a client to hear about.
          </p>
          <Button className="mt-5" onClick={() => setAdding(true)}>
            Add your first case
          </Button>
        </section>
      ) : (
        <div className="space-y-4">
          {cases.map((item) => (
            <CaseCard key={item.id} item={item} onDelete={signedIn ? handleDelete : undefined} />
          ))}
        </div>
      )}

      {adding ? (
        <div className="mt-6">
          <CaseForm onCancel={() => setAdding(false)} onSave={handleSave} pending={pending} />
        </div>
      ) : (
        cases.length > 0 && (
          <Button variant="quiet" className="mt-6" onClick={() => setAdding(true)}>
            Add a case
          </Button>
        )
      )}
    </>
  );
}
