import { Analysis, Draft } from "@/lib/demo-data";
import { EditableParagraph } from "./editable-paragraph";

interface ManuscriptProps {
  draft: Draft;
  analysis: Analysis;
  /** Omit to render the draft read-only, as on a saved proposal. */
  onDraftChange?: (next: Draft) => void;
}

/**
 * The draft is set as a document, not a form field, and the analysis sits in
 * the margin beside it — an editor's marginalia rather than a separate panel.
 * On narrow screens the margin drops below the draft as annotation cards.
 *
 * A generated draft is a starting point, never a finished proposal, so when
 * `onDraftChange` is supplied the greeting and every paragraph become editable
 * in place — no separate "edit mode" to enter first.
 */
export function Manuscript({ draft, analysis, onDraftChange }: ManuscriptProps) {
  const editable = Boolean(onDraftChange);

  function updateParagraph(id: string, text: string) {
    onDraftChange?.({
      ...draft,
      paragraphs: draft.paragraphs.map((paragraph) =>
        paragraph.id === id ? { ...paragraph, text } : paragraph,
      ),
    });
  }

  return (
    <div className="grid overflow-hidden rounded-xl border border-rule bg-white md:grid-cols-[minmax(0,1fr)_260px]">
      <article className="px-5 py-7 sm:px-10">
        {editable ? (
          <input
            value={draft.greeting}
            onChange={(event) => onDraftChange?.({ ...draft, greeting: event.target.value })}
            aria-label="Greeting"
            className="-mx-2 mb-6 block w-[calc(100%+1rem)] rounded border border-transparent
              border-b-rule bg-transparent px-2 pb-3.5 font-serif text-lg font-medium
              transition-colors hover:border-rule focus:border-moss focus:outline-none"
          />
        ) : (
          <h2 className="mb-6 border-b border-rule pb-3.5 font-serif text-lg font-medium">
            {draft.greeting}
          </h2>
        )}

        {draft.paragraphs.map((paragraph) => (
          <div key={paragraph.id} className="relative mb-4.5">
            {editable ? (
              <EditableParagraph
                value={paragraph.text}
                onChange={(text) => updateParagraph(paragraph.id, text)}
              />
            ) : (
              <p className="font-serif text-base leading-[1.75]">{paragraph.text}</p>
            )}
            {/* Hairline tying an annotated paragraph to its margin note.
                Hidden once the margin stops being beside the text. */}
            {paragraph.noteId && (
              <span
                aria-hidden="true"
                className="absolute top-3.5 -right-10 hidden w-10 border-t border-rule md:block"
              />
            )}
          </div>
        ))}
      </article>

      <aside className="border-t border-rule bg-paper-sunk px-5 py-7 md:border-t-0 md:border-l">
        <h2 className="eyebrow mb-5 border-b border-rule pb-2.5">Analysis</h2>

        <section className="mb-5.5">
          <h3 className="eyebrow mb-1.5 tracking-[0.08em]">Requirements</h3>
          <ul className="flex flex-wrap gap-1.5">
            {analysis.requirements.map((item) => (
              <li
                key={item}
                className="rounded border border-rule bg-paper px-1.5 py-0.5 font-mono text-[11px] text-ink-soft"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-5.5">
          <h3 className="eyebrow mb-1.5 tracking-[0.08em]">Budget &amp; timeline</h3>
          <p className="font-mono text-sm">{analysis.budget.range}</p>
          <p className="text-sm text-ink-soft">{analysis.budget.timeline}</p>
        </section>

        {analysis.flag && (
          <section className="mb-5.5">
            <h3 className="eyebrow mb-1.5 tracking-[0.08em] text-flag">
              ⚑ {analysis.flag.title}
            </h3>
            <p className="border-l-2 border-flag pl-2.5 text-sm leading-snug">
              {analysis.flag.body}
            </p>
          </section>
        )}

        {analysis.bestCase && (
          <section>
            <h3 className="eyebrow mb-1.5 tracking-[0.08em]">Your best case</h3>
            <p className="text-sm">{analysis.bestCase.title}</p>
            <p className="text-sm text-ink-soft">
              {analysis.bestCase.match}% match
            </p>
          </section>
        )}
      </aside>
    </div>
  );
}
