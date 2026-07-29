import Link from "next/link";
import { Proposal, ProposalStatus, replyRate } from "@/lib/demo-data";

const statusStyles: Record<ProposalStatus, string> = {
  draft: "text-ink-soft",
  sent: "text-ink-soft",
  replied: "text-ink",
  won: "text-moss",
  lost: "text-ink-soft",
};

/** The record of what was sent and what came back — a ledger, hence the mono. */
export function Ledger({ proposals }: { proposals: Proposal[] }) {
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
            <tr key={proposal.id}>
              <td className="border-b border-rule py-3.5 pr-3 text-sm">
                {proposal.jobTitle}
              </td>
              <td className="hidden border-b border-rule py-3.5 pr-3 font-mono text-xs text-ink-soft sm:table-cell">
                {proposal.budget}
              </td>
              <td className="border-b border-rule py-3.5 pr-3 font-mono text-xs whitespace-nowrap text-ink-soft">
                {proposal.sentOn}
              </td>
              <td
                className={`border-b border-rule py-3.5 font-mono text-[11px] tracking-wider uppercase ${statusStyles[proposal.status]}`}
              >
                {proposal.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
