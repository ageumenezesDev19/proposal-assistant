import { AppHeader } from "@/components/app-header";
import { Ledger } from "@/components/proposal/ledger";
import { getCurrentUser } from "@/lib/actions/auth";
import { listProposals } from "@/lib/actions/proposals";
import { demoProposals } from "@/lib/demo-data";

export default async function Home() {
  const user = await getCurrentUser();
  const proposals = user ? await listProposals() : null;
  const signedIn = Boolean(user);

  return (
    <>
      <AppHeader userEmail={user?.email ?? null} />

      <main className="mx-auto w-full max-w-5xl px-4 pt-10 pb-28 sm:px-6 sm:pb-20">
        <div className="mb-7">
          <p className="eyebrow mb-2.5">Proposals</p>
          <h1 className="font-serif text-xl leading-tight font-medium tracking-tight sm:text-2xl">
            Your reply rate
          </h1>
          {!signedIn && (
            <p className="mt-2 max-w-xl text-sm text-ink-soft">
              This is example data.{" "}
              <a href="/login" className="text-ink underline underline-offset-4">
                Sign in
              </a>{" "}
              to track your own proposals.
            </p>
          )}
        </div>

        <Ledger proposals={proposals ?? demoProposals} editable={signedIn} />
      </main>
    </>
  );
}
