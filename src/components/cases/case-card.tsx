import { Case } from "@/lib/demo-data";

/**
 * A case is evidence, so it reads as a short document: the problem and the
 * result get equal weight, because the pair is what a client recognises.
 */
export function CaseCard({
  item,
  onDelete,
}: {
  item: Case;
  onDelete?: (id: string) => void;
}) {
  return (
    <article className="rounded-xl border border-rule bg-white p-5 sm:p-7">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-serif text-lg font-medium">{item.title}</h2>
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="flex min-h-8 items-center text-xs text-ink-soft underline underline-offset-4 hover:text-flag"
          >
            Delete
          </button>
        )}
      </div>
      <p className="mt-1 font-mono text-xs text-ink-soft">{item.context}</p>

      <dl className="mt-4 space-y-3">
        <div>
          <dt className="eyebrow tracking-[0.08em]">The problem</dt>
          <dd className="mt-1 text-sm leading-relaxed">{item.problem}</dd>
        </div>
        <div>
          <dt className="eyebrow tracking-[0.08em]">What changed</dt>
          <dd className="mt-1 text-sm leading-relaxed">{item.result}</dd>
        </div>
      </dl>

      <ul className="mt-4 flex flex-wrap gap-1.5">
        {item.stack.map((tech) => (
          <li
            key={tech}
            className="rounded border border-rule bg-paper px-1.5 py-0.5 font-mono text-[11px] text-ink-soft"
          >
            {tech}
          </li>
        ))}
      </ul>
    </article>
  );
}
