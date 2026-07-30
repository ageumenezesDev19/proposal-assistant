import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { StatusControl } from "@/components/proposal/status-control";
import { getCurrentUser } from "@/lib/actions/auth";
import { getProposal } from "@/lib/actions/proposals";
import { ProposalClient } from "./proposal-client";

export default async function ProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const proposal = user ? await getProposal(id) : null;

  if (!proposal) notFound();

  return (
    <>
      <AppHeader userEmail={user?.email ?? null} />

      <main className="mx-auto w-full max-w-5xl px-4 pt-10 pb-28 sm:px-6 sm:pb-20">
        <div className="mb-7">
          <Link
            href="/"
            className="eyebrow mb-2.5 inline-flex items-center gap-1.5 hover:text-ink"
          >
            ← Proposals
          </Link>
          <h1 className="font-serif text-xl leading-tight font-medium tracking-tight sm:text-2xl">
            {proposal.jobTitle}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <StatusControl id={proposal.id} status={proposal.status} editable />
            {proposal.budget && (
              <span className="font-mono text-xs text-ink-soft">{proposal.budget}</span>
            )}
            {proposal.sentOn && (
              <span className="font-mono text-xs text-ink-soft">Sent {proposal.sentOn}</span>
            )}
          </div>
        </div>

        <ProposalClient proposal={proposal} />
      </main>
    </>
  );
}
