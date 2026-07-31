"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * The default error screen is a grey box and an opaque digest — fine for a
 * stack trace, useless to whoever hit it. This says what happened in plain
 * words and offers the two things a person actually wants: try again, or get
 * out. Production hides the message to avoid leaking internals, so the digest
 * is shown only when there is one, small, for when someone needs to report it.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col items-start px-4 pt-24 pb-28 sm:px-6">
      <p className="eyebrow mb-2.5">Something broke</p>
      <h1 className="font-serif text-xl leading-tight font-medium tracking-tight sm:text-2xl">
        This screen didn&apos;t load
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        Nothing you wrote was lost — saved proposals and cases are untouched. It&apos;s worth trying
        again; if it keeps happening, the code below identifies this exact failure.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2.5">
        <Button onClick={reset}>Try again</Button>
        <Link
          href="/"
          className="flex min-h-11 items-center rounded-md border border-rule px-4 text-sm
            text-ink transition-colors hover:border-ink-soft"
        >
          Back to proposals
        </Link>
      </div>

      {error.digest && (
        <p className="mt-8 font-mono text-xs text-ink-soft">Reference: {error.digest}</p>
      )}
    </main>
  );
}
