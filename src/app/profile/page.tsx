"use client";

import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";

const fieldClass =
  "w-full rounded-lg border border-rule bg-white px-3.5 py-2.5 text-sm " +
  "placeholder:text-ink-soft focus:border-moss focus:outline-none";

export default function ProfilePage() {
  const [saved, setSaved] = useState(false);

  return (
    <>
      <AppHeader current="/profile" />

      <main className="mx-auto w-full max-w-3xl px-4 pt-10 pb-28 sm:px-6 sm:pb-20">
        <div className="mb-7">
          <p className="eyebrow mb-2.5">Profile</p>
          <h1 className="font-serif text-xl leading-tight font-medium tracking-tight sm:text-2xl">
            How your drafts should sound
          </h1>
          <p className="mt-2 max-w-xl text-sm text-ink-soft">
            This is the voice every proposal borrows. Write it the way you would
            talk to a client on a first call.
          </p>
        </div>

        <form
          className="rounded-xl border border-rule bg-white p-5 sm:p-7"
          onSubmit={(event) => {
            event.preventDefault();
            setSaved(true);
          }}
        >
          <div className="space-y-4">
            <Field label="Headline" hint="One line: what you do and for whom">
              <input
                className={fieldClass}
                defaultValue="Front-end developer who ships full products"
                onChange={() => setSaved(false)}
              />
            </Field>

            <Field
              label="How you introduce yourself"
              hint="Two or three sentences, in your own words"
            >
              <textarea
                rows={4}
                className={fieldClass}
                onChange={() => setSaved(false)}
                defaultValue="I build and maintain a production inventory system for a retail client, and I own the front end end to end — architecture, tests and releases."
              />
            </Field>

            <Field label="Stack" hint="Separated by commas">
              <input
                className={fieldClass}
                onChange={() => setSaved(false)}
                defaultValue="React, Next.js, TypeScript, Node.js, Playwright"
              />
            </Field>

            <Field
              label="What you will not take on"
              hint="Saying this up front saves both sides a call"
            >
              <input
                className={fieldClass}
                onChange={() => setSaved(false)}
                placeholder="Unpaid test tasks, fixed price on undefined scope"
              />
            </Field>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button type="submit">Save profile</Button>
            <p aria-live="polite" className="font-mono text-xs text-moss">
              {saved ? "Profile saved." : ""}
            </p>
          </div>
        </form>
      </main>
    </>
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
