/**
 * Shown while the model reads the post. It mirrors the real manuscript layout
 * so nothing jumps when the content lands — the margin is already there, the
 * notes just fill in.
 */
export function AnalysisSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid overflow-hidden rounded-xl border border-rule bg-white md:grid-cols-[minmax(0,1fr)_260px]"
    >
      <span className="sr-only">Reading the job post and drafting a proposal.</span>

      <div className="px-5 py-7 sm:px-10">
        <Bar className="mb-6 h-5 w-36" />
        {[
          ["w-full", "w-full", "w-4/5"],
          ["w-full", "w-11/12", "w-2/3"],
          ["w-full", "w-3/4"],
        ].map((lines, block) => (
          <div key={block} className="mb-5 space-y-2.5">
            {lines.map((width, line) => (
              <Bar key={line} className={`h-3.5 ${width}`} />
            ))}
          </div>
        ))}
      </div>

      <div className="border-t border-rule bg-paper-sunk px-5 py-7 md:border-t-0 md:border-l">
        <Bar className="mb-5 h-2.5 w-20" />
        {[3, 2, 3].map((rows, section) => (
          <div key={section} className="mb-6 space-y-2">
            <Bar className="h-2.5 w-24" />
            {Array.from({ length: rows }).map((_, row) => (
              <Bar key={row} className="h-3 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Bar({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded bg-rule/70 motion-safe:animate-pulse ${className}`}
    />
  );
}
