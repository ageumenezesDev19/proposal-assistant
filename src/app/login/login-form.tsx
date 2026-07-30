"use client";

import { useState, useTransition } from "react";
import { sendMagicLink } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

const fieldClass =
  "w-full rounded-lg border border-rule bg-white px-3.5 py-2.5 text-sm " +
  "placeholder:text-ink-soft focus:border-moss focus:outline-none";

export function LoginForm({ linkExpired }: { linkExpired: boolean }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(
    linkExpired ? "That link expired — request a new one." : null,
  );
  const [ok, setOk] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="rounded-xl border border-rule bg-white p-6 sm:p-7"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          const result = await sendMagicLink(email.trim());
          setOk(result.ok);
          setMessage(result.message);
        });
      }}
    >
      <label className="block">
        <span className="eyebrow tracking-[0.08em]">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className={`${fieldClass} mt-2`}
        />
      </label>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending || !email.trim()}>
          {pending ? "Sending…" : "Send sign-in link"}
        </Button>
        {message && (
          <p aria-live="polite" className={`text-sm ${ok ? "text-moss" : "text-flag"}`}>
            {message}
          </p>
        )}
      </div>
    </form>
  );
}
