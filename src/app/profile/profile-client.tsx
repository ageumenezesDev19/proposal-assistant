"use client";

import { FormEvent, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { saveProfile, type ProfileData } from "@/lib/actions/profile";

const fieldClass =
  "w-full rounded-lg border border-rule bg-white px-3.5 py-2.5 text-sm " +
  "placeholder:text-ink-soft focus:border-moss focus:outline-none";

interface ProfileClientProps {
  profile: ProfileData;
  example: ProfileData;
  signedIn: boolean;
}

export function ProfileClient({ profile, example, signedIn }: ProfileClientProps) {
  const [headline, setHeadline] = useState(profile.headline);
  const [bio, setBio] = useState(profile.bio);
  const [stack, setStack] = useState(profile.stack.join(", "));
  const [avoidScope, setAvoidScope] = useState(profile.avoidScope);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!signedIn) return;
    startTransition(async () => {
      await saveProfile({
        headline,
        bio,
        stack: stack
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean),
        avoidScope,
      });
      setSaved(true);
    });
  }

  return (
    <form className="rounded-xl border border-rule bg-white p-5 sm:p-7" onSubmit={handleSubmit}>
      {!signedIn && (
        <p className="mb-5 rounded-lg border border-rule bg-paper-sunk px-4 py-3 text-sm text-ink-soft">
          You&apos;re viewing an example — a fictional profile, not a real one.{" "}
          <a href="/login" className="text-ink underline underline-offset-4">
            Sign in
          </a>{" "}
          to write your own; every draft borrows this voice.
        </p>
      )}

      <div className="space-y-4">
        <Field label="Headline" hint="One line: what you do and for whom">
          <input
            className={fieldClass}
            value={headline}
            placeholder={example.headline}
            onChange={(e) => {
              setHeadline(e.target.value);
              setSaved(false);
            }}
          />
        </Field>

        <Field label="How you introduce yourself" hint="Two or three sentences, in your own words">
          <textarea
            rows={4}
            className={fieldClass}
            value={bio}
            placeholder={example.bio}
            onChange={(e) => {
              setBio(e.target.value);
              setSaved(false);
            }}
          />
        </Field>

        <Field label="Stack" hint="Separated by commas">
          <input
            className={fieldClass}
            value={stack}
            placeholder={example.stack.join(", ")}
            onChange={(e) => {
              setStack(e.target.value);
              setSaved(false);
            }}
          />
        </Field>

        <Field label="What you will not take on" hint="Saying this up front saves both sides a call">
          <input
            className={fieldClass}
            value={avoidScope}
            placeholder={example.avoidScope}
            onChange={(e) => {
              setAvoidScope(e.target.value);
              setSaved(false);
            }}
          />
        </Field>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={!signedIn || pending}>
          {pending ? "Saving…" : "Save profile"}
        </Button>
        <p aria-live="polite" className="font-mono text-xs text-moss">
          {saved ? "Profile saved." : ""}
        </p>
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
