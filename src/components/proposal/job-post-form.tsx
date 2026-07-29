"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const EXAMPLE = `We run a Shopify store doing about 400 orders a week. Our team spends
two hours every morning reconciling stock between Shopify and a warehouse
spreadsheet, and the numbers still drift. Looking for someone to build an
internal dashboard that pulls both sources together, flags mismatches, and
lets us export a daily report. Budget $3-5k, ideally live in 4 weeks.`;

interface JobPostFormProps {
  onAnalyse: (jobPost: string) => void;
  pending?: boolean;
}

export function JobPostForm({ onAnalyse, pending = false }: JobPostFormProps) {
  const [jobPost, setJobPost] = useState("");
  const trimmed = jobPost.trim();
  const tooShort = trimmed.length > 0 && trimmed.length < 80;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (trimmed.length >= 80) onAnalyse(trimmed);
      }}
    >
      <label htmlFor="job-post" className="eyebrow mb-2.5 block">
        The job post
      </label>

      <textarea
        id="job-post"
        value={jobPost}
        onChange={(event) => setJobPost(event.target.value)}
        placeholder="Paste the whole post — the rambling parts are where the real requirements hide."
        rows={10}
        aria-describedby="job-post-hint"
        className="w-full resize-y rounded-xl border border-rule bg-white p-5 font-serif
          text-base leading-relaxed placeholder:font-sans placeholder:text-sm
          placeholder:text-ink-soft focus:border-moss focus:outline-none"
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={trimmed.length < 80 || pending}>
          {pending ? "Reading the post…" : "Analyse job post"}
        </Button>

        {trimmed.length === 0 && (
          <button
            type="button"
            onClick={() => setJobPost(EXAMPLE.replace(/\n/g, " "))}
            className="flex min-h-11 items-center text-sm text-ink-soft underline
              underline-offset-4 hover:text-ink"
          >
            Try it with an example post
          </button>
        )}

        <p id="job-post-hint" className="font-mono text-xs text-ink-soft">
          {tooShort
            ? `${80 - trimmed.length} more characters to go`
            : "Nothing is sent anywhere until you press analyse."}
        </p>
      </div>
    </form>
  );
}
