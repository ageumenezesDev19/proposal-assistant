"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Case } from "@/lib/demo-data";

interface CaseFormProps {
  onSave: (item: Case) => void;
  onCancel: () => void;
  pending?: boolean;
}

const fieldClass =
  "w-full rounded-lg border border-rule bg-white px-3.5 py-2.5 text-sm " +
  "placeholder:text-ink-soft focus:border-moss focus:outline-none";

export function CaseForm({ onSave, onCancel, pending = false }: CaseFormProps) {
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [problem, setProblem] = useState("");
  const [result, setResult] = useState("");
  const [stack, setStack] = useState("");

  const ready = title.trim() && problem.trim() && result.trim();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!ready) return;
    onSave({
      id: crypto.randomUUID(),
      title: title.trim(),
      context: context.trim(),
      problem: problem.trim(),
      result: result.trim(),
      stack: stack
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-rule bg-white p-5 sm:p-7"
    >
      <h2 className="mb-5 font-serif text-lg font-medium">Add a case</h2>

      <div className="space-y-4">
        <Field label="Title" hint="How you would name it out loud">
          <input
            className={fieldClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Inventory system for a retail client"
          />
        </Field>

        <Field label="Context" hint="Who it was for and when">
          <input
            className={fieldClass}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Retail client · freelance · 2025–present"
          />
        </Field>

        <Field label="The problem" hint="What was broken before you arrived">
          <textarea
            rows={3}
            className={fieldClass}
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="The team reconciled stock by hand every morning and still could not trust the numbers."
          />
        </Field>

        <Field
          label="What changed"
          hint="The outcome, in the client's terms — not the tech"
        >
          <textarea
            rows={3}
            className={fieldClass}
            value={result}
            onChange={(e) => setResult(e.target.value)}
            placeholder="One system the whole team uses daily, with exports that replaced the manual work."
          />
        </Field>

        <Field label="Stack" hint="Separated by commas">
          <input
            className={fieldClass}
            value={stack}
            onChange={(e) => setStack(e.target.value)}
            placeholder="Next.js, TypeScript, Playwright"
          />
        </Field>
      </div>

      <div className="mt-6 flex flex-wrap gap-2.5">
        <Button type="submit" disabled={!ready || pending}>
          {pending ? "Saving…" : "Save case"}
        </Button>
        <Button type="button" variant="quiet" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="eyebrow tracking-[0.08em]">{label}</span>
      <span className="mt-0.5 mb-2 block text-xs text-ink-soft">{hint}</span>
      {children}
    </label>
  );
}
