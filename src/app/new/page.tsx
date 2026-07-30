import { AppHeader } from "@/components/app-header";
import { getCurrentUser } from "@/lib/actions/auth";
import { listSnippets } from "@/lib/actions/snippets";
import { demoSnippets } from "@/lib/demo-data";
import { NewProposalClient } from "./new-proposal-client";

export default async function NewProposalPage() {
  const user = await getCurrentUser();
  const snippets = user ? await listSnippets() : demoSnippets;

  return (
    <>
      <AppHeader userEmail={user?.email ?? null} />

      <main className="mx-auto w-full max-w-5xl px-4 pt-10 pb-28 sm:px-6 sm:pb-20">
        <NewProposalClient signedIn={Boolean(user)} snippets={snippets ?? []} />
      </main>
    </>
  );
}
