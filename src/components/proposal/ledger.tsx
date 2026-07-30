import Link from "next/link";
import { Proposal, replyRate } from "@/lib/demo-data";
import { StatusControl } from "./status-control";

/** The record of what was sent and what came back — a ledger, hence the mono. */
export function Ledger({
  proposals,
  editable = false,
}: {
  proposals: Proposal[];
  editable?: boolean;
}) {
  const { percent, total } = replyRate(proposals);

  // An empty screen is an invitation, not a notice: say what this will become
  // and give the one action that starts it.
  if (proposals.length === 0) {
    return (
      <section className="mt-14 rounded-xl border border-dashed border-rule px-6 py-12 text-center">
        <h2 className="font-serif text-lg font-medium">
          Your reply rate starts here
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
          Once you mark proposals as sent, this becomes the record of what got
          answered — and which kind of job is worth your time.
        </p>
        <Link
          href="/new"
          className="mt-5 inline-flex min-h-11 items-center rounded-md border border-moss
            bg-moss px-4 text-sm font-medium text-paper transition-colors hover:bg-moss-hover"
        >
          Write your first proposal
        </Link>
      </section>
    );
  }

  return (
    <section className="mt-14">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="font-serif text-lg font-medium">Recent proposals</h2>
        <p className="font-mono text-xs text-ink-soft">
          Reply rate <strong className="text-lg font-medium text-moss">{percent}%</strong>{" "}
          of {total}
        </p>
      </div>

      {editable && (
        <p className="mb-3 text-xs text-ink-soft">
          Open a proposal to reread or edit it. Change a status as the client replies — the rate
          above follows.
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="eyebrow border-b border-rule pb-2.5 pr-3 text-left">Job</th>
              <th className="eyebrow hidden border-b border-rule pb-2.5 pr-3 text-left sm:table-cell">
                Budget
              </th>
              <th className="eyebrow border-b border-rule pb-2.5 pr-3 text-left">Sent</th>
              <th className="eyebrow border-b border-rule pb-2.5 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {proposals.map((proposal) => (
              <tr key={proposal.id} className="group">
                <td className="border-b border-rule py-3.5 pr-3 text-sm">
                  {/* Only the title is the link, not the whole row: the status
                      cell is its own control, and nesting one inside a link
                      makes both harder to hit and to reach by keyboard. */}
                  {editable ? (
                    <Link
                      href={`/proposals/${proposal.id}`}
                      className="underline-offset-4 group-hover:underline"
                    >
                      {proposal.jobTitle}
                    </Link>
                  ) : (
                    proposal.jobTitle
                  )}
                </td>
                <td className="hidden border-b border-rule py-3.5 pr-3 font-mono text-xs text-ink-soft sm:table-cell">
                  {proposal.budget}
                </td>
                <td className="border-b border-rule py-3.5 pr-3 font-mono text-xs whitespace-nowrap text-ink-soft">
                  {proposal.sentOn || "—"}
                </td>
                <td className="border-b border-rule py-3.5">
                  <StatusControl
                    id={proposal.id}
                    status={proposal.status}
                    editable={editable}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
